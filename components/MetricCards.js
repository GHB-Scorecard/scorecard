import styles from './MetricCards.module.css';

export function MetricCard({ title, icon, color, value, trendValue, trendIsUp, trendLabel, isMock }) {
  let iconClass = styles.iconBlue;
  if (color === 'green') iconClass = styles.iconGreen;
  if (color === 'purple') iconClass = styles.iconPurple;
  if (color === 'orange') iconClass = styles.iconOrange;

  return (
    <div className={styles.cardContainer}>
      <div className={styles.header}>
        <div className={`${styles.iconWrapper} ${iconClass}`}>
          {icon}
        </div>
        <div className={styles.title}>
          {title}
          {isMock && (
            <span style={{ fontSize: '0.6rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '0.15rem 0.3rem', borderRadius: '1rem', marginLeft: '0.5rem', fontWeight: 700, verticalAlign: 'middle' }}>MOCK</span>
          )}
        </div>
      </div>
      <div>
        <div className={styles.value}>
          {typeof value === 'number' ? value.toLocaleString('en-US') : value}
        </div>
        <div className={styles.trendContainer}>
          <div className={trendIsUp ? "trend-up" : "trend-down"}>
            {trendIsUp ? '▲' : '▼'} {trendValue}
          </div>
          <div className="trend-label">{trendLabel}</div>
        </div>
      </div>
    </div>
  );
}

export default function MetricCardsGrid({ metrics }) {
  // We use dummy trends vs Apr '26 for demonstration as in the mockup
  return (
    <div className="grid-metrics">
      <div className="col-span-1">
        <MetricCard 
          title="Commits" icon="&lt;/&gt;" color="blue" 
          value={metrics.commits} trendValue="18%" trendIsUp={true} trendLabel="vs Apr '26" 
        />
      </div>
      <div className="col-span-1">
        <MetricCard 
          title="PRs Raised" icon="⑂" color="green" 
          value={metrics.prsRaised} trendValue="20%" trendIsUp={true} trendLabel="vs Apr '26" 
        />
      </div>
      <div className="col-span-1">
        <MetricCard 
          title="PRs Merged" icon="⑃" color="purple" 
          value={metrics.prsMerged} trendValue="17%" trendIsUp={true} trendLabel="vs Apr '26" 
        />
      </div>
      <div className="col-span-1">
        <MetricCard 
          title="Suggestions Accepted" icon="✓" color="green" 
          value={metrics.suggestionsAccepted} trendValue="12%" trendIsUp={true} trendLabel="vs Apr '26" 
          isMock={true}
        />
      </div>
      <div className="col-span-1">
        <MetricCard 
          title="Acceptance Rate" icon="%" color="purple" 
          value={`${metrics.acceptanceRate}%`} trendValue="2.5%" trendIsUp={true} trendLabel="vs Apr '26" 
          isMock={true}
        />
      </div>
      <div className="col-span-1">
        <MetricCard 
          title="Active Copilot Days" icon="⚡" color="orange" 
          value={metrics.activeCopilotDays} trendValue="1" trendIsUp={false} trendLabel="vs Apr '26" 
          isMock={true}
        />
      </div>
    </div>
  );
}
