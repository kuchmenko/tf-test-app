import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "bun:test";
import { setupTestDatabase, teardownTestDatabase } from "./__tests__/setup";
import { db } from "@repo/db";
import app from "./index";

const BASE_URL = "http://localhost";

async function request(path: string, options?: RequestInit) {
  const req = new Request(`${BASE_URL}${path}`, options);
  return await app.fetch(req);
}

describe("Users API Integration Tests", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  afterEach(async () => {
    await db.deleteFrom("users").execute();
  });

  describe("GET /users", () => {
    test("should return empty array when no users exist", async () => {
      const res = await request("/users");
      expect(res.status).toBe(200);

      const data = (await res.json()) as any;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    test("should return all users", async () => {
      await db
        .insertInto("users")
        .values({ email: "test1@example.com" })
        .execute();
      await db
        .insertInto("users")
        .values({ email: "test2@example.com" })
        .execute();

      const res = await request("/users");
      expect(res.status).toBe(200);

      const data = (await res.json()) as any;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);

      expect(data[0].email).toBeDefined();
      expect(data[0].id).toBeDefined();
      expect(data[0].created_at).toBeDefined();
      expect(data[0].updated_at).toBeDefined();
    });
  });

  describe("POST /users", () => {
    test("should create a new user with valid email", async () => {
      const res = await request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "newuser@example.com" }),
      });

      expect(res.status).toBe(201);

      const data = (await res.json()) as any;
      expect(data.email).toBe("newuser@example.com");
      expect(data.id).toBeDefined();
      expect(data.created_at).toBeDefined();
      expect(data.updated_at).toBeDefined();

      // Verify user was actually created in database
      const users = await db
        .selectFrom("users")
        .selectAll()
        .where("email", "=", "newuser@example.com")
        .execute();

      expect(users.length).toBe(1);
      expect(users[0]?.email).toBe("newuser@example.com");
    });

    test("should return 409 when email already exists", async () => {
      await db
        .insertInto("users")
        .values({ email: "duplicate@example.com" })
        .execute();

      const res = await request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "duplicate@example.com" }),
      });

      expect(res.status).toBe(409);

      const data = (await res.json()) as any;
      expect(data.error).toBe("Email already exists");

      const users = await db
        .selectFrom("users")
        .selectAll()
        .where("email", "=", "duplicate@example.com")
        .execute();

      expect(users.length).toBe(1);
    });

    test("should return 400 for invalid email format", async () => {
      const res = await request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-an-email" }),
      });

      expect(res.status).toBe(400);

      const data = (await res.json()) as any;
      expect(data.error).toBeDefined();

      const users = await db.selectFrom("users").selectAll().execute();
      expect(users.length).toBe(0);
    });

    test("should return 400 when email is missing", async () => {
      const res = await request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);

      const data = (await res.json()) as any;
      expect(data.error).toBeDefined();

      const users = await db.selectFrom("users").selectAll().execute();
      expect(users.length).toBe(0);
    });

    test("should return 400 for malformed JSON", async () => {
      const res = await request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json }",
      });

      expect(res.status).toBe(400);
    });

    test("should handle email with special characters", async () => {
      const specialEmail = "user+tag@example.co.uk";

      const res = await request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: specialEmail }),
      });

      expect(res.status).toBe(201);

      const data = (await res.json()) as any;
      expect(data.email).toBe(specialEmail);

      const users = await db
        .selectFrom("users")
        .selectAll()
        .where("email", "=", specialEmail)
        .execute();

      expect(users.length).toBe(1);
    });

    test("should handle case sensitivity in emails correctly", async () => {
      const res1 = await request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      });
      expect(res1.status).toBe(201);

      const res2 = await request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "TEST@example.com" }),
      });
      expect(res2.status).toBe(201);

      const users = await db.selectFrom("users").selectAll().execute();
      expect(users.length).toBe(2);
    });
  });
});
