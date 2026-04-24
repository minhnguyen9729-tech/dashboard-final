// ============================================================
// FunnelChart — Biểu đồ Phễu chuyển đổi thực tế
// ============================================================
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import './Charts.css';

const FUNNEL_COLORS = {
  'Đầu phễu': '#6366f1',               // Tím (Indigo)
  'Đang gọi': '#8b5cf6',               // Tím đậm (Violet)
  'Tồn kho / Rác': '#ef4444',          // Đỏ (Red)
  'Đã tư vấn / Đang xử lý': '#0ea5e9', // Xanh biển (Sky Blue)
  'Demo / Hẹn demo': '#eab308',        // Vàng (Yellow)
  'Dừng tác nghiệp': '#f97316',        // Cam (Orange) thay cho Xám
  'Đã chốt': '#22c55e',                // Xanh lá (Green)
  'Khác': '#14b8a6',                   // Xanh ngọc (Teal) thay cho Xám
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip" style={{ borderColor: d.color }}>
      <strong style={{ color: d.color }}>{d.name}</strong>
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
    <div className="card chart-card" style={{ padding: '24px',  }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 3, height: 14, background: '#8b5cf6', borderRadius: 2 }} />
          Phễu chuyển đổi thực tế
        </h3>
      </div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        {data.map((d) => (
          <div key={d.name} className="funnel-row">
            <div className="funnel-label">{d.name}</div>
            <div className="funnel-bar-wrap" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <div
                className="funnel-bar"
                style={{ width: `${(d.value / total) * 100}%`, background: `${d.color}80`, border: `1px solid ${d.color}`, opacity: 1 }}
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
