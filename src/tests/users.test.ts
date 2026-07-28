import jwt from "jsonwebtoken";
import request from "supertest";
import { db } from "../config/database";
import { env } from "../config/env";
import app from "../app";

jest.mock("../config/database", () => ({
  db: { query: jest.fn() },
}));

type User = { id: number; name: string };

describe("User routes", () => {
  let users: User[];
  let nextId: number;
  const query = db.query as jest.Mock;
  const authHeader = `Bearer ${jwt.sign({ sub: "1" }, env.JWT_SECRET)}`;

  beforeEach(() => {
    users = [];
    nextId = 1;
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    query.mockImplementation(async (sql: string, params: unknown[] = []) => {
      const statement = sql.replace(/\s+/g, " ").trim();

      if (statement.startsWith("SELECT") && statement.includes("WHERE name")) {
        const name = params[0];
        return { rows: users.filter((user) => user.name === name) };
      }

      if (statement.startsWith("SELECT")) {
        return { rows: users };
      }

      if (statement.startsWith("INSERT")) {
        const user = { id: nextId++, name: params[0] as string };
        users.push(user);
        return { rows: [user] };
      }

      if (statement.startsWith("UPDATE")) {
        const id = params[0] as number;
        const name = params[1] as string;
        const user = users.find((currentUser) => currentUser.id === id);

        if (!user) {
          return { rows: [] };
        }

        user.name = name;
        return { rows: [user] };
      }

      if (statement.startsWith("DELETE")) {
        const id = params[0] as number;
        const userIndex = users.findIndex((user) => user.id === id);

        if (userIndex === -1) {
          return { rows: [], rowCount: 0 };
        }

        users.splice(userIndex, 1);
        return { rows: [{ id }], rowCount: 1 };
      }

      throw new Error(`Unexpected query: ${statement}`);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("rejects writes without a valid token", async () => {
    await expect(
      request(app).post("/users").send({ name: "Mario" }),
    ).resolves.toMatchObject({ status: 401 });

    await expect(
      request(app).put("/users/1").send({ name: "Luigi" }),
    ).resolves.toMatchObject({ status: 401 });

    await expect(request(app).delete("/users/1")).resolves.toMatchObject({
      status: 401,
    });
  });

  it("creates, lists, updates and deletes a user", async () => {
    const created = await request(app)
      .post("/users")
      .set("Authorization", authHeader)
      .send({ name: "Mario" });

    expect(created.status).toBe(201);
    expect(created.body).toEqual({ id: 1, name: "Mario" });

    await expect(request(app).get("/users")).resolves.toMatchObject({
      status: 200,
      body: [{ id: 1, name: "Mario" }],
    });

    const updated = await request(app)
      .put("/users/1")
      .set("Authorization", authHeader)
      .send({ name: "Luigi" });
    expect(updated.status).toBe(200);
    expect(updated.body).toEqual({ id: 1, name: "Luigi" });

    await expect(
      request(app).delete("/users/1").set("Authorization", authHeader),
    ).resolves.toMatchObject({
      status: 204,
    });
  });

  it("returns 400 for invalid input", async () => {
    await expect(
      request(app)
        .post("/users")
        .set("Authorization", authHeader)
        .send({ name: "" }),
    ).resolves.toMatchObject({
      status: 400,
    });

    await expect(
      request(app)
        .delete("/users/not-a-number")
        .set("Authorization", authHeader),
    ).resolves.toMatchObject({
      status: 400,
    });
  });

  it("returns 409 for duplicate names and 404 for a missing user", async () => {
    users = [{ id: 1, name: "Mario" }];
    nextId = 2;

    await expect(
      request(app)
        .post("/users")
        .set("Authorization", authHeader)
        .send({ name: "Mario" }),
    ).resolves.toMatchObject({
      status: 409,
      body: { success: false, message: "User already exists" },
    });

    await expect(
      request(app)
        .put("/users/99")
        .set("Authorization", authHeader)
        .send({ name: "Luigi" }),
    ).resolves.toMatchObject({
      status: 404,
    });

    await expect(
      request(app).delete("/users/99").set("Authorization", authHeader),
    ).resolves.toMatchObject({
      status: 404,
    });
  });
});
