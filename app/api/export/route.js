import { db } from '@/lib/db';
import { calculateScores } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all users
    const usersResult = await db.query(`SELECT * FROM "User" ORDER BY "name" ASC`);
    const users = usersResult.rows;

    const csvRows = [];
    // Header row
    csvRows.push([
      "GitHub ID",
      "Name",
      "Team",
      "GitHub Organization",
      "Copilot License",
      "Overall Score",
      "GitHub Activity Score",
      "Copilot Adoption Score",
      "Collaboration Score",
      "Risk Level",
      "Adoption Classification",
      "Commits (Last Month)",
      "PRs Raised (Last Month)",
      "PRs Merged (Last Month)",
      "Repositories Contributed (Last Month)",
      "Suggestions Accepted",
      "Acceptance Rate (%)",
      "Active Copilot Days",
      "PR Reviews Done",
      "Comments on PRs"
    ].join(','));

    for (const user of users) {
      // Get latest daily metrics
      const dailyResult = await db.query(`
        SELECT * FROM "DailyMetrics" 
        WHERE "userId" = $1 
        ORDER BY "date" DESC LIMIT 1
      `, [user.id]);
      const latestDaily = dailyResult.rows[0] || {};

      // Get latest copilot metrics
      const copilotResult = await db.query(`
        SELECT * FROM "CopilotMetrics" 
        WHERE "userId" = $1 
        ORDER BY "date" DESC LIMIT 1
      `, [user.id]);
      const latestCopilot = copilotResult.rows[0] || {};

      const rawMetrics = {
        commits: latestDaily.commits || 0,
        prsRaised: latestDaily.prsRaised || 0,
        prsMerged: latestDaily.prsMerged || 0,
        repositoriesContributed: latestDaily.repositoriesContributed || 0,
        suggestionsAccepted: latestCopilot.suggestionsAccepted || 0,
        acceptanceRate: latestCopilot.acceptanceRate || 0,
        activeCopilotDays: latestCopilot.activeCopilotDays || 0,
        prReviewsDone: latestDaily.prReviewsDone || 0,
        commentsOnPRs: latestDaily.commentsOnPRs || 0,
      };

      const scores = calculateScores(rawMetrics);

      let adoptionClass = "Needs Improvement";
      if (scores.overallScore >= 75) adoptionClass = "Power User";
      else if (scores.overallScore >= 50) adoptionClass = "Active User";

      let riskLevel = scores.overallScore >= 50 ? "Low Risk" : "High Risk";

      // Escape quotes and format columns properly
      const escape = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const row = [
        escape(user.githubId),
        escape(user.name),
        escape(user.team),
        escape(user.githubOrg),
        escape(user.copilotLicenseStatus),
        escape(scores.overallScore),
        escape(scores.githubActivityScore),
        escape(scores.copilotAdoptionScore),
        escape(scores.collaborationScore),
        escape(riskLevel),
        escape(adoptionClass),
        escape(rawMetrics.commits),
        escape(rawMetrics.prsRaised),
        escape(rawMetrics.prsMerged),
        escape(rawMetrics.repositoriesContributed),
        escape(rawMetrics.suggestionsAccepted),
        escape(rawMetrics.acceptanceRate),
        escape(rawMetrics.activeCopilotDays),
        escape(rawMetrics.prReviewsDone),
        escape(rawMetrics.commentsOnPRs)
      ];

      csvRows.push(row.join(','));
    }

    const csvData = csvRows.join('\n');

    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="github_scorecards_export.csv"',
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return new Response("Failed to generate export", { status: 500 });
  }
}
