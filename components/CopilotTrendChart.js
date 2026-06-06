export default function CopilotTrendChart({ history }) {
  // Simple custom SVG Line Chart for 6 months
  if (!history || history.length === 0) return null;

  const width = 600;
  const height = 200;
  const padding = 40;

  const maxAcc = Math.max(...history.map(d => d.suggestionsAccepted)) * 1.2;
  const maxRate = Math.max(...history.map(d => d.acceptanceRate)) * 1.2;

  const pointsAcc = history.map((d, i) => {
    const x = padding + (i * (width - 2 * padding) / (history.length - 1));
    const y = height - padding - (d.suggestionsAccepted / maxAcc) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const pointsRate = history.map((d, i) => {
    const x = padding + (i * (width - 2 * padding) / (history.length - 1));
    const y = height - padding - (d.acceptanceRate / maxRate) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-title">
        COPILOT 6-MONTH TREND
        <span style={{ fontSize: '0.65rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '0.15rem 0.4rem', borderRadius: '1rem', marginLeft: '0.75rem', fontWeight: 700, verticalAlign: 'middle' }}>MOCK DATA</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
        <div style={{ color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--primary-green)', display: 'inline-block' }}></span>
          Suggestions Accepted
        </div>
        <div style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--primary-blue)', display: 'inline-block' }}></span>
          Acceptance Rate (%)
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
            const y = height - padding - tick * (height - 2 * padding);
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border-color)" strokeDasharray="4 4" />
                <text x={padding - 10} y={y + 4} fontSize="10" fill="var(--text-tertiary)" textAnchor="end">
                  {Math.round(tick * maxAcc)}
                </text>
                <text x={width - padding + 10} y={y + 4} fontSize="10" fill="var(--primary-blue)" textAnchor="start">
                  {Math.round(tick * maxRate)}%
                </text>
              </g>
            );
          })}

          {/* Lines */}
          <polyline fill="none" stroke="var(--primary-green)" strokeWidth="2" points={pointsAcc} />
          <polyline fill="none" stroke="var(--primary-blue)" strokeWidth="2" points={pointsRate} />

          {/* Points and Labels */}
          {history.map((d, i) => {
            const x = padding + (i * (width - 2 * padding) / (history.length - 1));
            const yAcc = height - padding - (d.suggestionsAccepted / maxAcc) * (height - 2 * padding);
            const yRate = height - padding - (d.acceptanceRate / maxRate) * (height - 2 * padding);
            return (
              <g key={i}>
                <circle cx={x} cy={yAcc} r="4" fill="var(--primary-green)" />
                <text x={x} y={yAcc - 10} fontSize="10" fill="var(--primary-green)" textAnchor="middle" fontWeight="bold">
                  {d.suggestionsAccepted.toLocaleString('en-US')}
                </text>

                <circle cx={x} cy={yRate} r="4" fill="var(--primary-blue)" />
                <text x={x} y={yRate + 15} fontSize="10" fill="var(--primary-blue)" textAnchor="middle" fontWeight="bold">
                  {d.acceptanceRate}%
                </text>

                <text x={x} y={height - padding + 20} fontSize="10" fill="var(--text-secondary)" textAnchor="middle">
                  {d.month} '{d.year}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
