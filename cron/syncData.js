const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchGraphQL(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors) {
    throw new Error(JSON.stringify(data.errors));
  }
  return data.data;
}

async function fetchRest(endpoint) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  });
  return res.json();
}

async function syncData() {
  console.log('Starting Live GitHub Data Sync...');
  if (!GITHUB_TOKEN) {
    console.error("Missing GITHUB_TOKEN in .env");
    process.exit(1);
  }

  // Define the target user
  const githubUsername = 'Niraj-Patil01_BALICT';
  
  // Date range for current month
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const fromIso = startOfMonth.toISOString();
  const toIso = now.toISOString();

  console.log(`Fetching metrics for ${githubUsername} from ${fromIso} to ${toIso}`);

  try {
    // 1. GraphQL Fetch for Contributions
    const query = `
      query($login: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          name
          company
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            commitContributionsByRepository {
              repository {
                name
              }
            }
          }
        }
      }
    `;

    let gqlData;
    try {
      gqlData = await fetchGraphQL(query, { login: githubUsername, from: fromIso, to: toIso });
    } catch (e) {
      console.warn(`User ${githubUsername} not found via GraphQL or token lacks permissions. Falling back to 0s.`);
      gqlData = null;
    }

    let commits = 0;
    let prsRaised = 0;
    let prReviewsDone = 0;
    let repositoriesContributed = 0;
    let fetchedName = githubUsername;
    let fetchedOrg = 'Unknown Org';

    if (gqlData && gqlData.user) {
      fetchedName = gqlData.user.name || githubUsername;
      fetchedOrg = gqlData.user.company || 'Unknown Org';
      const collection = gqlData.user.contributionsCollection;
      commits = collection.totalCommitContributions || 0;
      prsRaised = collection.totalPullRequestContributions || 0;
      prReviewsDone = collection.totalPullRequestReviewContributions || 0;
      repositoriesContributed = collection.commitContributionsByRepository?.length || 0;
    }

    // 2. REST API Fetch for Merged PRs
    // GitHub search syntax: author:username type:pr is:merged created:>=YYYY-MM-DD
    const dateQuery = `>=${fromIso.split('T')[0]}`;
    const mergedPRsData = await fetchRest(`/search/issues?q=author:${githubUsername}+type:pr+is:merged+created:${dateQuery}`);
    const prsMerged = mergedPRsData.total_count || 0;

    // 3. REST API Fetch for Issue/PR Comments
    const commentsData = await fetchRest(`/search/issues?q=commenter:${githubUsername}+type:pr+updated:${dateQuery}`);
    const commentsOnPRs = commentsData.total_count || 0;

    console.log(`Live Data Fetched -> Commits: ${commits}, PRs: ${prsRaised}, Merged: ${prsMerged}, Reviews: ${prReviewsDone}, Comments: ${commentsOnPRs}`);

    // Upsert User
    const userResult = await pool.query(`
      INSERT INTO "User" ("githubId", "name", "team", "githubOrg", "copilotLicenseStatus")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("githubId") DO UPDATE SET
        "name" = EXCLUDED."name",
        "githubOrg" = EXCLUDED."githubOrg",
        "updatedAt" = CURRENT_TIMESTAMP
      RETURNING *;
    `, [githubUsername, fetchedName, 'Digital Platform (Mock)', fetchedOrg, 'Active (Mock)']);

    const userId = userResult.rows[0].id;

    // Upsert Daily Metrics
    await pool.query(`
      INSERT INTO "DailyMetrics" ("userId", "date", "commits", "prsRaised", "prsMerged", "repositoriesContributed", "prReviewsDone", "commentsOnPRs")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT ("userId", "date") DO UPDATE SET
        "commits" = EXCLUDED."commits",
        "prsRaised" = EXCLUDED."prsRaised",
        "prsMerged" = EXCLUDED."prsMerged",
        "repositoriesContributed" = EXCLUDED."repositoriesContributed",
        "prReviewsDone" = EXCLUDED."prReviewsDone",
        "commentsOnPRs" = EXCLUDED."commentsOnPRs";
    `, [userId, startOfMonth, commits, prsRaised, prsMerged, repositoriesContributed, prReviewsDone, commentsOnPRs]);

    // Keep Mocked Copilot Data since it cannot be fetched live per-user
    await pool.query(`
      INSERT INTO "CopilotMetrics" ("userId", "date", "suggestionsAccepted", "acceptanceRate", "activeCopilotDays")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("userId", "date") DO UPDATE SET
        "suggestionsAccepted" = EXCLUDED."suggestionsAccepted",
        "acceptanceRate" = EXCLUDED."acceptanceRate",
        "activeCopilotDays" = EXCLUDED."activeCopilotDays";
    `, [userId, startOfMonth, 2034, 42.0, 21]);
    
    const history = [
      { month: 11, year: 2025, acc: 1120, rate: 28 }, 
      { month: 0, year: 2026, acc: 1320, rate: 30 },  
      { month: 1, year: 2026, acc: 1450, rate: 32 },  
      { month: 2, year: 2026, acc: 1780, rate: 38 },  
      { month: 3, year: 2026, acc: 1590, rate: 39.5 }, 
    ];

    for (const h of history) {
      const hDate = new Date(Date.UTC(h.year, h.month, 28));
      await pool.query(`
        INSERT INTO "CopilotMetrics" ("userId", "date", "suggestionsAccepted", "acceptanceRate")
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("userId", "date") DO UPDATE SET
          "suggestionsAccepted" = EXCLUDED."suggestionsAccepted",
          "acceptanceRate" = EXCLUDED."acceptanceRate";
      `, [userId, hDate, h.acc, h.rate]);
    }

    console.log(`Live sync completed for user: ${githubUsername}`);

  } catch (err) {
    console.error("Sync Error:", err);
  } finally {
    await pool.end();
  }
}

syncData();
