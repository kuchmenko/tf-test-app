import { migrator } from "@repo/db";

export async function runMigrations() {
  const { error, results } = await migrator.migrateToLatest();

  if (error) {
    console.error("Migration failed:", error);
    throw error;
  }

  if (results) {
    results.forEach((it) => {
      if (it.status === "Success") {
        console.log(`Migration "${it.migrationName}" executed successfully`);
      } else if (it.status === "Error") {
        console.error(`Migration "${it.migrationName}" failed`);
      }
    });
  }

  console.log("All migrations completed");
}

export async function setupTestDatabase() {
  await runMigrations();
}

export async function teardownTestDatabase() {
  // Container destruction handles cleanup
}
