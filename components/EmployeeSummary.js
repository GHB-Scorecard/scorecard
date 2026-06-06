import styles from './EmployeeSummary.module.css';

export default function EmployeeSummary({ user }) {
  if (!user) return null;

  return (
    <div className="card">
      <div className="card-title">
        <span className="card-title-icon">👤</span>
        EMPLOYEE SUMMARY
      </div>
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={styles.icon}>👤</div>
          <div className={styles.label}>Name</div>
          <div className={styles.value}>{user.name}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>👥</div>
          <div className={styles.label}>Team / POD</div>
          <div className={styles.value}>{user.team}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>💻</div>
          <div className={styles.label}>GitHub ID</div>
          <div className={styles.value}>{user.githubId}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>🏢</div>
          <div className={styles.label}>GitHub Organisation</div>
          <div className={styles.value}>{user.githubOrg}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.icon}>🤖</div>
          <div className={styles.label}>Copilot License Status</div>
          <div>
            <span className={user.copilotLicenseStatus === 'Active' ? styles.statusActive : styles.statusInactive}>
              {user.copilotLicenseStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
