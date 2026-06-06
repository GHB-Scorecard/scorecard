import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateScores } from '@/lib/scoring';

export async function GET(request, { params }) {
  const { username } = await params;

  try {
    const userResult = await db.query(`SELECT * FROM "User" WHERE "githubId" = $1`, [username]);
    if (userResult.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userResult.rows[0];

    const dailyResult = await db.query(`
      SELECT * FROM "DailyMetrics" 
      WHERE "userId" = $1 
      ORDER BY "date" DESC LIMIT 1
    `, [user.id]);
    const latestDaily = dailyResult.rows[0] || {};

    const copilotResult = await db.query(`
      SELECT * FROM "CopilotMetrics" 
      WHERE "userId" = $1 
      ORDER BY "date" DESC LIMIT 6
    `, [user.id]);
    
    // Reverse to get oldest to newest for chart
    const copilotHistory = copilotResult.rows.reverse(); 
    const latestCopilot = copilotHistory[copilotHistory.length - 1] || {};

    const rawMetrics = {
      commits: latestDaily.commits,
      prsRaised: latestDaily.prsRaised,
      prsMerged: latestDaily.prsMerged,
      repositoriesContributed: latestDaily.repositoriesContributed,
      suggestionsAccepted: latestCopilot.suggestionsAccepted,
      acceptanceRate: latestCopilot.acceptanceRate,
      activeCopilotDays: latestCopilot.activeCopilotDays,
      prReviewsDone: latestDaily.prReviewsDone,
      commentsOnPRs: latestDaily.commentsOnPRs,
    };

    const scores = calculateScores(rawMetrics);

    return NextResponse.json({
      user: {
        githubId: user.githubId,
        name: user.name,
        team: user.team,
        githubOrg: user.githubOrg,
        copilotLicenseStatus: user.copilotLicenseStatus,
      },
      metrics: rawMetrics,
      scores,
      copilotHistory: copilotHistory.map(h => ({
        month: new Date(h.date).toLocaleString('default', { month: 'short' }),
        year: new Date(h.date).getFullYear().toString().slice(-2),
        suggestionsAccepted: h.suggestionsAccepted,
        acceptanceRate: h.acceptanceRate,
      })),
    });

  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
