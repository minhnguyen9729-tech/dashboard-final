// ============================================================
// SourceChart — Biểu đồ Pie/Doughnut phân bổ Nguồn Lead
// ============================================================
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Charts.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{payload[0].name}</strong>
      <span>{payload[0].value} leads ({payload[0].payload.pct}%)</span>
    </div>
  );
};

const SourceChart = ({ nguonCount, total }) => {
  const data = Object.entries(nguonCount)
    .map(([name, value]) => ({ name, value, pct: total > 0 ? ((value / total) * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="card chart-card">
      <p className="section-title">Phân bổ Lead theo Nguồn</p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
            dataKey="value" nameKey="name" paddingAngle={3}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8}
            formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{val}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SourceChart;
