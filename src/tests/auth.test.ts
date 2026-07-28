import request from "supertest";
import app from "../app";
import { db } from "../config/database";

jest.mock("../config/database", () => ({
  db: { query: jest.fn() },
}));

type AuthUser = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
};

describe("Authentication routes", () => {
  let users: AuthUser[];
  let nextId: number;
  const query = db.query as jest.Mock;

  beforeEach(() => {
    users = [];
    nextId = 1;
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    query.mockImplementation(async (sql: string, params: unknown[] = []) => {
      const statement = sql.replace(/\s+/g, " ").trim();

      if (statement.startsWith("SELECT") && statement.includes("WHERE email")) {
        const email = params[0];
        return { rows: users.filter((user) => user.email === email) };
      }

      if (statement.startsWith("SELECT") && statement.includes("WHERE name")) {
        const name = params[0];
        return { rows: users.filter((user) => user.name === name) };
      }

      if (statement.startsWith("SELECT") && statement.includes("WHERE id")) {
        const user = users.find((currentUser) => currentUser.id === params[0]);
        return {
          rows: user ? [{ id: user.id, name: user.name }] : [],
        };
      }

      if (statement.startsWith("INSERT")) {
        const user = {
          id: nextId++,
          name: params[0] as string,
          email: params[1] as string,
          passwordHash: params[2] as string,
        };
        users.push(user);
        return { rows: [{ id: user.id, name: user.name }] };
      }

      throw new Error(`Unexpected query: ${statement}`);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("registers, logs in and returns the authenticated profile", async () => {
    const registration = await request(app).post("/auth/register").send({
      name: "Mario",
      email: "mario@example.com",
      password: "secure-password",
    });

    expect(registration.status).toBe(201);
    expect(registration.body.user).toEqual({ id: 1, name: "Mario" });
    expect(registration.body.token).toEqual(expect.any(String));
    expect(users[0].passwordHash).not.toBe("secure-password");

    const login = await request(app).post("/auth/login").send({
      email: "mario@example.com",
      password: "secure-password",
    });

    expect(login.status).toBe(200);
    expect(login.body.user).toEqual({ id: 1, name: "Mario" });

    const profile = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(profile.status).toBe(200);
    expect(profile.body).toEqual({ id: 1, name: "Mario" });
  });

  it("rejects invalid credentials and invalid tokens", async () => {
    await expect(
      request(app).post("/auth/login").send({
        email: "mario@example.com",
        password: "secure-password",
      }),
    ).resolves.toMatchObject({
      status: 401,
      body: { success: false, message: "Invalid email or password" },
    });

    await expect(
      request(app).get("/auth/me").set("Authorization", "Bearer invalid-token"),
    ).resolves.toMatchObject({
      status: 401,
      body: { success: false, message: "Authentication required" },
    });
  });

  it("rejects malformed registration input and duplicate emails", async () => {
    await expect(
      request(app).post("/auth/register").send({
        name: "Mario",
        email: "not-an-email",
        password: "short",
      }),
    ).resolves.toMatchObject({ status: 400 });

    users = [
      {
        id: 1,
        name: "Mario",
        email: "mario@example.com",
        passwordHash: "hash",
      },
    ];

    await expect(
      request(app).post("/auth/register").send({
        name: "Mario",
        email: "mario@example.com",
        password: "secure-password",
      }),
    ).resolves.toMatchObject({
      status: 409,
      body: { success: false, message: "Email already exists" },
    });

    await expect(
      request(app).post("/auth/register").send({
        name: "Mario",
        email: "another@example.com",
        password: "secure-password",
      }),
    ).resolves.toMatchObject({
      status: 409,
      body: { success: false, message: "User name already exists" },
    });
  });
});
