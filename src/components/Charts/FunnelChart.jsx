// ============================================================
// FunnelChart — Biểu đồ Phễu chuyển đổi thực tế
// ============================================================
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import './Charts.css';

const FUNNEL_COLORS = {
  'Đầu phễu': '#6366f1',
  'Đang gọi': '#10b981',
  'Tồn kho / Rác': '#ef4444',
  'Đã tư vấn / Đang xử lý': '#8b5cf6',
  'Demo / Hẹn demo': '#f59e0b',
  'Dừng tác nghiệp': '#64748b',
  'Đã chốt': '#06b6d4',
  'Khác': '#475569',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{d.name}</strong>
      <span>{d.value} leads — {d.pct}%</span>
    </div>
  );
};

const FunnelChart = ({ funnelData, total }) => {
  const data = Object.entries(funnelData)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name,
      value,
      pct: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
      color: FUNNEL_COLORS[name] || '#475569',
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="card chart-card">
      <p className="section-title">Phễu chuyển đổi thực tế</p>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        {data.map((d) => (
          <div key={d.name} className="funnel-row">
            <div className="funnel-label">{d.name}</div>
            <div className="funnel-bar-wrap">
              <div
                className="funnel-bar"
                style={{ width: `${(d.value / total) * 100}%`, background: d.color }}
              />
            </div>
            <div className="funnel-stats">
              <span style={{ color: d.color, fontWeight: 700 }}>{d.value}</span>
              <span className="funnel-pct">{d.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FunnelChart;
