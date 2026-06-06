import styles from './ActivityConsistency.module.css';

export default function ActivityConsistency() {
  // Mock data for the last 4 weeks (7 days each)
  const heatmapData = [
    // Week 1 (Oldest)
    ['cellMedium', 'cellHigh', 'cellHigh', 'cellMedium', 'cellLow', 'cellNone', 'cellNone'],
    // Week 2
    ['cellHigh', 'cellMedium', 'cellLow', 'cellHigh', 'cellHigh', 'cellLow', 'cellNone'],
    // Week 3
    ['cellMedium', 'cellHigh', 'cellHigh', 'cellHigh', 'cellMedium', 'cellLow', 'cellNone'],
    // Week 4 (Newest)
    ['cellHigh', 'cellHigh', 'cellMedium', 'cellHigh', 'cellHigh', 'cellMedium', 'cellNone'],
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className={styles.container}>
        
        {/* Key Insights Panel */}
        <div className={styles.insightsPanel}>
          <div className="card-title" style={{ marginBottom: '0.5rem' }}>
            KEY INSIGHTS
            <span style={{ fontSize: '0.65rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '0.15rem 0.4rem', borderRadius: '1rem', marginLeft: '0.75rem', fontWeight: 700, verticalAlign: 'middle' }}>MOCK DATA</span>
          </div>
          
          <div>
            <div className={styles.sectionTitle}>STRENGTHS</div>
            <div className={styles.insightItem}>
              <span className={styles.insightIconGreen}>☑</span>
              <span>Strong GitHub activity with consistent contributions.</span>
            </div>
            <div className={styles.insightItem}>
              <span className={styles.insightIconGreen}>☑</span>
              <span>High Copilot usage with good acceptance rate.</span>
            </div>
            <div className={styles.insightItem}>
              <span className={styles.insightIconGreen}>☑</span>
              <span>Actively participating in PR reviews and team collaboration.</span>
            </div>
          </div>

          <div>
            <div className={`${styles.sectionTitle} ${styles.sectionTitleOrange}`}>OPPORTUNITIES</div>
            <div className={styles.insightItem}>
              <span className={styles.insightIconOrange}>💡</span>
              <span>Increase Copilot usage consistency across all work days.</span>
            </div>
            <div className={styles.insightItem}>
              <span className={styles.insightIconOrange}>💡</span>
              <span>Explore contributions in more repositories for broader impact.</span>
            </div>
          </div>
        </div>

        {/* Activity Heatmap Panel */}
        <div className={styles.activityPanel}>
          <div className={styles.activityHeader}>
            ACTIVITY CONSISTENCY (Last 4 Weeks)
            <span style={{ fontSize: '0.65rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '0.15rem 0.4rem', borderRadius: '1rem', marginLeft: '0.75rem', fontWeight: 700, verticalAlign: 'middle' }}>MOCK DATA</span>
          </div>
          
          <div className={styles.heatmapContainer}>
            <div className={styles.dayLabels}>
              {days.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className={styles.heatmapGrid}>
              {heatmapData.map((week, wIndex) => (
                <div key={wIndex} className={styles.heatmapCol}>
                  {week.map((cellClass, dIndex) => (
                    <div key={`${wIndex}-${dIndex}`} className={`${styles.heatmapCell} ${styles[cellClass]}`}></div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.cellHigh}`}></div> High Activity
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.cellMedium}`}></div> Medium Activity
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendBox} ${styles.cellNone}`}></div> Low / No Activity
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
