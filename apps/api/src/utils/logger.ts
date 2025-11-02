import { relative } from "path";

import winston from "winston";

const tsFormat = (timestamp: string) => {
  const time = new Date(timestamp).toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return time;
};

type PrintFParams = Parameters<Parameters<typeof winston.format.printf>[0]>[0];

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf((info: PrintFParams) => {
        const { timestamp, level, message, ...meta } = info as PrintFParams & {
          timestamp: string;
        };
        const metaString = Object.keys(meta).length
          ? ` ${JSON.stringify(meta)}`
          : "";

        return `${tsFormat(timestamp)} ${level}: ${message}${metaString}`;
      }),
    ),
  }),
];

export const createLogger = (service: string, env: string) =>
  winston.createLogger({ transports, defaultMeta: { service, env } });

export type Logger = ReturnType<typeof createLogger>;

const PROJECT_ROOT = process.cwd();

/**
 * Parses and returns info about the call stack at the given index.
 */
export const getStackInfo = () => {
  const stack = new Error()!.stack!.split("\n").slice(2);

  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
  const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

  const s = stack[0];
  const sp = stackReg.exec(s!) || stackReg2.exec(s!);

  if (sp && sp.length === 5) {
    return {
      relativePath: "/" + relative(PROJECT_ROOT, sp[2] ?? ""),
      line: sp[3],
      pos: sp[4],
    };
  }

  return undefined;
};
