import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { sValidator } from "@hono/standard-validator";
import { type } from "arktype";
import { db } from "@repo/db";
import { PG_ERROR_CODES } from "./utils/constants";

const CreateUserSchema = type({
  email: "string.email",
});

export const users = new Hono();

users.get("/", async (c) => {
  const result = await db.selectFrom("users").selectAll().execute();
  return c.json(result);
});

users.post("/", sValidator("json", CreateUserSchema), async (c) => {
  try {
    const data = c.req.valid("json");

    const user = await db
      .insertInto("users")
      .values({ email: data.email })
      .returningAll()
      .executeTakeFirst();

    if (!user) {
      throw new HTTPException(500, { message: "Failed to create user" });
    }

    return c.json(user, 201);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === PG_ERROR_CODES.UNIQUE_VIOLATION
    ) {
      throw new HTTPException(409, { message: "Email already exists" });
    }
    throw error;
  }
});
