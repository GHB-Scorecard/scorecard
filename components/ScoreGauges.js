import styles from './ScoreGauges.module.css';

export function OverallScoreGauge({ score }) {
  // SVG Circle math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let level = "Needs Improvement";
  if (score >= 75) level = "Power User";
  else if (score >= 50) level = "Active User";

  return (
    <div className="card">
      <div className="card-title">
        OVERALL AI ENGINEERING SCORE
        <span style={{ cursor: 'pointer', marginLeft: 'auto' }}>ⓘ</span>
      </div>
      <div className={styles.container}>
        <div className={styles.gaugeWrapper}>
          <svg className={styles.gaugeSvg} viewBox="0 0 140 140">
            <circle className={styles.gaugeBg} cx="70" cy="70" r={radius} />
            <circle
              className={styles.gaugeProgress}
              cx="70"
              cy="70"
              r={radius}
              style={{ strokeDasharray: circumference, strokeDashoffset }}
            />
          </svg>
          <div className={styles.gaugeText}>
            <div className={styles.scoreValue}>{score}</div>
            <div className={styles.scoreMax}>/100</div>
          </div>
        </div>
        <div className={styles.levelLabel}>{level}</div>
        <div className={styles.subLabel}>Top 25% in Organization</div>
      </div>
    </div>
  );
}

export function CategoryScores({ githubScore, copilotScore, collaborationScore }) {
  return (
    <div className="card">
      <div className="card-title">
        SCORE BY CATEGORY
        <span style={{ cursor: 'pointer', marginLeft: 'auto' }}>ⓘ</span>
      </div>
      <div className={styles.categoryList}>
        
        {/* GitHub Activity */}
        <div className={styles.categoryItem}>
          <div className={`${styles.categoryIcon} ${styles.iconBlue}`}>&lt;/&gt;</div>
          <div className={styles.categoryDetails}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryName}>GitHub Activity (40%)</span>
              <span className={styles.categoryScore}>{githubScore}<span>/100</span></span>
            </div>
            <div className={styles.progressBarBg}>
              <div 
                className={`${styles.progressBarFill} ${styles.fillBlue}`} 
                style={{ width: `${githubScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Copilot Adoption */}
        <div className={styles.categoryItem}>
          <div className={`${styles.categoryIcon} ${styles.iconGreen}`}>🤖</div>
          <div className={styles.categoryDetails}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryName}>
                Copilot Adoption (40%)
                <span style={{ fontSize: '0.65rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '0.15rem 0.4rem', borderRadius: '1rem', marginLeft: '0.5rem', fontWeight: 700, verticalAlign: 'middle' }}>MOCK</span>
              </span>
              <span className={styles.categoryScore}>{copilotScore}<span>/100</span></span>
            </div>
            <div className={styles.progressBarBg}>
              <div 
                className={`${styles.progressBarFill} ${styles.fillGreen}`} 
                style={{ width: `${copilotScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Collaboration */}
        <div className={styles.categoryItem}>
          <div className={`${styles.categoryIcon} ${styles.iconPurple}`}>👥</div>
          <div className={styles.categoryDetails}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryName}>Collaboration (20%)</span>
              <span className={styles.categoryScore}>{collaborationScore}<span>/100</span></span>
            </div>
            <div className={styles.progressBarBg}>
              <div 
                className={`${styles.progressBarFill} ${styles.fillPurple}`} 
                style={{ width: `${collaborationScore}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>
      <div className={styles.disclaimer}>*Weights indicate contribution to Overall Score</div>
    </div>
  );
}
