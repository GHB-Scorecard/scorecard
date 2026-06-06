import { db } from '@/lib/db';
import { calculateScores } from '@/lib/scoring';
import Link from 'next/link';
import AdminTable from '@/components/AdminTable';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const usersResult = await db.query(`SELECT * FROM "User" ORDER BY "name" ASC`);
  const users = usersResult.rows;

  const usersData = [];

  for (const user of users) {
    const dailyResult = await db.query(`
      SELECT * FROM "DailyMetrics" 
      WHERE "userId" = $1 
      ORDER BY "date" DESC LIMIT 1
    `, [user.id]);
    const latestDaily = dailyResult.rows[0] || {};

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
    
    let riskLevel = scores.overallScore >= 50 ? "Low Risk" : "High Risk";
    let isHighRisk = scores.overallScore < 50;

    usersData.push({
      ...user,
      scores,
      riskLevel,
      isHighRisk
    });
  }

  return (
    <div className="dashboard-container">
      <div className="header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="header-title">
          <h1>ADMINISTRATIVE DASHBOARD</h1>
          <p>Global view of all developers, productivity scores, and AI adoption.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/" style={{ backgroundColor: '#334155', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
            Back to User View
          </Link>
          <a href="/api/export" download style={{ backgroundColor: 'var(--primary-green)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⬇</span> Export to Excel
          </a>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <AdminTable initialUsers={usersData} />
      </div>
    </div>
  );
}
