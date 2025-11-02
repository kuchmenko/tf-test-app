import { Context, Hono, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { getConnInfo } from "@hono/node-server/conninfo";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { GeoMiddleware, getGeo } from "hono-geo-middleware";
// import { rateLimiter } from "hono-rate-limiter";

import { nanoToHuman } from "./utils";
import { createLogger } from "./utils/logger";
import { env } from "./utils/env";
import { users } from "./users";

const statusToLevel = (status: number) => {
  if (status >= 500) return "error";
  if (status >= 400) return "warn";
  if (status >= 300) return "info";
  return "info";
};

const httpLogger = async (c: Context, next: Next) => {
  const { method, url } = c.req;
  const logger = c.get("logger");
  const geo = env.isTest ? null : getGeo(c);
  const connInfo = env.isTest ? null : getConnInfo(c);
  const path = url.slice(url.indexOf("/", 8));
  const geoCode = geo?.countryCode ?? "unknown";
  const conn = connInfo?.remote?.address ?? "unknown";

  const out = ["START", method, path, "", geoCode, conn]
    .filter(Boolean)
    .join(" ");
  logger.info(out);
  const start = process.hrtime.bigint();
  await next();
  const end = process.hrtime.bigint();

  const elapsed = nanoToHuman(end - start);
  const out2 = ["END", method, path, c.res.status, elapsed, geoCode, conn]
    .filter(Boolean)
    .join(" ");
  logger[statusToLevel(c.res.status)](out2);
};

const logger = createLogger("api", env.nodeEnv);
const loggerAttach = (c: Context, next: Next) => {
  c.set("logger", logger.child({ requestId: c.get("requestId") }));
  return next();
};

const port = env.port;

const app = new Hono();

if (!env.isTest) {
  app.use(GeoMiddleware());
}
app.use(requestId());
app.use(cors());
app.use(secureHeaders());
app.use(loggerAttach);
app.use(httpLogger);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/users", users);

app.onError((err, c: Context) => {
  if (err instanceof HTTPException) {
    c.get("logger").error("Unhandled error occurred", err);
    return c.json({ error: err.message }, err.status);
  }

  if (err instanceof Error) {
    c.get("logger").error("Unhandled error occurred", err);
  }

  return c.json({ error: "Something went wrong" }, 500);
});

export default {
  port,
  fetch: app.fetch,
};
