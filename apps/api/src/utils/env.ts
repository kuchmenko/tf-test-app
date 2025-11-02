import { type } from "arktype";

const EnvSchema = type({
  "NODE_ENV?": "'development'|'production'|'test'",
  DATABASE_URL: "string",
  "PORT?": "string",
});

const result = EnvSchema(process.env);

if (result instanceof type.errors) {
  console.error("Environment validation failed:", result.summary);
  process.exit(1);
}

const nodeEnv = result.NODE_ENV || "development";

export const env = {
  nodeEnv: nodeEnv as "development" | "production" | "test",
  databaseUrl: result.DATABASE_URL,
  port: parseInt(result.PORT || "3001", 10),
  isTest: nodeEnv === "test",
  isDev: nodeEnv === "development",
  isProd: nodeEnv === "production",
};
