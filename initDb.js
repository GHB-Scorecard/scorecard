const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  console.log("Initializing Database schema...");
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "githubId" VARCHAR(255) UNIQUE NOT NULL,
        "name" VARCHAR(255),
        "team" VARCHAR(255),
        "githubOrg" VARCHAR(255),
        "copilotLicenseStatus" VARCHAR(50) DEFAULT 'Inactive',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "DailyMetrics" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "commits" INTEGER DEFAULT 0,
        "prsRaised" INTEGER DEFAULT 0,
        "prsMerged" INTEGER DEFAULT 0,
        "repositoriesContributed" INTEGER DEFAULT 0,
        "prReviewsDone" INTEGER DEFAULT 0,
        "commentsOnPRs" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("userId", "date")
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "CopilotMetrics" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "suggestionsAccepted" INTEGER DEFAULT 0,
        "acceptanceRate" DOUBLE PRECISION DEFAULT 0.0,
        "activeCopilotDays" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("userId", "date")
      );
    `);

    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    await pool.end();
  }
}

initDb();
