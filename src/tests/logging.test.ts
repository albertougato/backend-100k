import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../app";
import { env } from "../config/env";
import { logger } from "../config/logger";

jest.mock("../config/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("request logging", () => {
  const mockedLogger = logger as jest.Mocked<typeof logger>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs request metadata when a request succeeds", async () => {
    await request(app).get("/health").expect(200);

    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: expect.any(String),
        method: "GET",
        path: "/health",
        statusCode: 200,
        durationMs: expect.any(Number),
      }),
      "request completed",
    );
  });

  it("logs error metadata without sending error details to the client", async () => {
    const authHeader = `Bearer ${jwt.sign({ sub: "1" }, env.JWT_SECRET)}`;
    const response = await request(app)
      .post("/users")
      .set("Authorization", authHeader)
      .send({ name: "" });

    expect(response.status).toBe(400);
    expect(mockedLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: expect.any(String),
        method: "POST",
        path: "/users",
      }),
      "request failed",
    );
  });
});
