import EmployeeSummary from '@/components/EmployeeSummary';
import { OverallScoreGauge, CategoryScores } from '@/components/ScoreGauges';
import MetricCardsGrid from '@/components/MetricCards';
import CopilotTrendChart from '@/components/CopilotTrendChart';
import ActivityConsistency from '@/components/ActivityConsistency';

async function getScorecardData(username) {
  const { db } = await import('@/lib/db');
  const { calculateScores } = await import('@/lib/scoring');

  try {
    let userResult;
    if (username) {
      userResult = await db.query(`SELECT * FROM "User" WHERE "githubId" = $1`, [username]);
    } else {
      userResult = await db.query(`SELECT * FROM "User" ORDER BY "updatedAt" DESC LIMIT 1`);
    }
    
    if (userResult.rowCount === 0) return null;
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

    return {
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
        month: new Date(h.date).toLocaleString('en-US', { month: 'short' }),
        year: new Date(h.date).getFullYear().toString().slice(-2),
        suggestionsAccepted: h.suggestionsAccepted,
        acceptanceRate: h.acceptanceRate,
      })),
    };
  } catch (err) {
    console.error("Error loading data from DB:", err);
    return null;
  }
}

export default async function Dashboard(props) {
  const searchParams = await props.searchParams;
  const targetUser = searchParams?.user || null;
  const data = await getScorecardData(targetUser);

  // Dynamic Reporting Period string
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startStr = startOfMonth.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const endStr = today.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const reportingPeriod = `${startStr} - ${endStr}`;

  if (!data) {
    return (
      <div className="dashboard-container">
        <h1>Dashboard Setup Required</h1>
        <p>Please run the initialization script (`node initDb.js`) and then sync script (`node cron/syncData.js`) to populate the database with mock data.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      
      {/* Header Banner */}
      <div className="header-banner">
        <div className="header-title">
          <h1>GITHUB + COPILOT INDIVIDUAL SCORECARD</h1>
          <p>Developer Productivity & AI Adoption</p>
        </div>
        <div className="header-date">
          <div>
            <p style={{ color: '#cbd5e1', fontWeight: 400 }}>Reporting Period</p>
            <p>{reportingPeriod}</p>
          </div>
          <div className="calendar-icon">📅</div>
        </div>
      </div>

      {/* Top Row: Employee Summary & Scores */}
      <div className="grid-main">
        <div className="col-span-1">
          <EmployeeSummary user={data.user} />
        </div>
        <div className="col-span-1">
          <OverallScoreGauge score={data.scores.overallScore} />
        </div>
        <div className="col-span-1">
          <CategoryScores 
            githubScore={data.scores.githubActivityScore}
            copilotScore={data.scores.copilotAdoptionScore}
            collaborationScore={data.scores.collaborationScore}
          />
        </div>
        <div className="col-span-1">
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="card-title">ADOPTION CLASSIFICATION</div>
            {data.scores.overallScore >= 75 ? (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#22c55e', color: 'white', width: '40px', height: '40px', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>★</div>
                <div>
                  <div style={{ color: '#166534', fontWeight: 700, fontSize: '1.1rem' }}>Power User</div>
                  <div style={{ color: '#15803d', fontSize: '0.75rem' }}>Actively leveraging Copilot and collaborating effectively.</div>
                </div>
              </div>
            ) : data.scores.overallScore >= 50 ? (
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#3b82f6', color: 'white', width: '40px', height: '40px', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🔄</div>
                <div>
                  <div style={{ color: '#1e3a8a', fontWeight: 700, fontSize: '1.1rem' }}>Active User</div>
                  <div style={{ color: '#1d4ed8', fontSize: '0.75rem' }}>Consistent contributor with steady Copilot adoption.</div>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#ef4444', color: 'white', width: '40px', height: '40px', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>⚠️</div>
                <div>
                  <div style={{ color: '#7f1d1d', fontWeight: 700, fontSize: '1.1rem' }}>Needs Improvement</div>
                  <div style={{ color: '#b91c1c', fontSize: '0.75rem' }}>Below average contribution or low AI adoption.</div>
                </div>
              </div>
            )}

            <div className="card-title">RISK INDICATOR</div>
            {data.scores.overallScore >= 50 ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#22c55e', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✓</div>
                <div>
                  <div style={{ color: '#166534', fontWeight: 700 }}>Low Risk</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>No concerns identified.</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#ef4444', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⚠</div>
                <div>
                  <div style={{ color: '#7f1d1d', fontWeight: 700 }}>High Risk</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Low engagement or productivity detected.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row: Metrics */}
      <MetricCardsGrid metrics={data.metrics} />

      {/* Bottom Row: Trends & Insights */}
      <div className="row">
        <div className="col">
          <CopilotTrendChart history={data.copilotHistory} />
        </div>
        <div className="col" style={{ flex: 1.5 }}>
          <ActivityConsistency />
        </div>
      </div>

    </div>
  );
}
