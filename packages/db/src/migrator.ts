import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FileMigrationProvider, Migrator } from "kysely";
import { db } from "./client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, "./migrations/"),
  }),
});
