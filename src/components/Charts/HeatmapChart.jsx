// ============================================================
// HeatmapChart — Phân bổ Lead theo Ngày × Giờ
// ============================================================
import './Charts.css';

const HeatmapChart = ({ heatmapData, hourlyDist }) => {
  if (!heatmapData || !Object.keys(heatmapData).length) return null;

  const maxVal = Math.max(...Object.values(heatmapData).flatMap((row) => row), 1);
  const getLevel = (v) => {
    if (v === 0) return '0';
    const r = v / maxVal;
    if (r < 0.2) return '1';
    if (r < 0.4) return '2';
    if (r < 0.6) return '3';
    if (r < 0.8) return '4';
    return '5';
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dates = Object.keys(heatmapData).slice(-10); // Chỉ hiển thị 10 ngày gần nhất

  return (
    <div className="card chart-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <p className="section-title" style={{ marginBottom: 0 }}>Heatmap Lead theo Ngày × Giờ</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['Đêm 0-6h', '#1e2235', '#1a1d2e'], ['Sáng 6-9h', 'rgba(99,102,241,0.25)'], ['Trưa 12-14h', 'rgba(99,102,241,0.5)'], ['Tối 17-24h', '#6366f1']].map(([label, bg]) => (
            <span key={label} style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: bg, display: 'inline-block', border: '1px solid var(--border)' }} />{label}
            </span>
          ))}
        </div>
      </div>

      <div className="heatmap-wrap">
        <div className="heatmap-hour-headers">
          {hours.map((h) => (
            <div key={h} className="heatmap-hour-label">{h.toString().padStart(2, '0')}</div>
          ))}
        </div>
        <div className="heatmap-grid">
          {dates.map((date) => (
            <div key={date} className="heatmap-row">
              <div className="heatmap-date-label">{date}</div>
              {hours.map((h) => {
                const v = heatmapData[date]?.[h] || 0;
                return (
                  <div key={h} className="heatmap-cell" data-level={getLevel(v)} title={`${date} ${h}h: ${v} leads`}>
                    {v > 0 ? v : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Biểu đồ tổng theo giờ */}
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Tổng lead theo khung giờ (tất cả ngày)</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
          {hourlyDist.map((v, h) => {
            const maxH = Math.max(...hourlyDist, 1);
            const hPct = (v / maxH) * 100;
            const isNight = h < 6;
            const isMorning = h >= 6 && h < 12;
            const isAfternoon = h >= 12 && h < 17;
            const isEvening = h >= 17 && h < 20;
            const isLateNight = h >= 20;
            const color = isNight ? '#334155' : isMorning ? '#10b981' : isAfternoon ? '#f59e0b' : isEvening ? '#6366f1' : '#ef4444';

            return (
              <div key={h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  title={`${h}h: ${v} leads`}
                  style={{ width: '80%', height: `${Math.max(hPct, v > 0 ? 8 : 0)}%`, background: color, borderRadius: '3px 3px 0 0', transition: 'height 0.4s ease' }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', paddingTop: 4 }}>
          {hourlyDist.map((_, h) => (
            h % 3 === 0
              ? <div key={h} style={{ flex: '3', fontSize: 9, color: 'var(--text-muted)', textAlign: 'left' }}>{h}h</div>
              : <div key={h} style={{ flex: 1 }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;
