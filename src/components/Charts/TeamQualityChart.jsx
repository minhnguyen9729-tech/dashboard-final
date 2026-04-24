// ============================================================
// TeamQualityChart — Donut + Stacked Bar chất lượng tác nghiệp
// ============================================================
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import './Charts.css';

const Q_COLORS = { 'Đủ hành trình': '#10b981', 'Có note, chưa KQ': '#6366f1', 'Có KQ, không note': '#f59e0b', 'Trống hoàn toàn': '#ef4444' };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{payload[0].name}</strong>
      <span>{payload[0].value} leads</span>
    </div>
  );
};

const TeamQualityChart = ({ tacNghiepKPIs, teamList, total }) => {
  if (!tacNghiepKPIs) return null;

  const donutData = [
    { name: 'Đủ hành trình', value: tacNghiepKPIs.duHanhTrinh },
    { name: 'Có note, chưa KQ', value: tacNghiepKPIs.coNoteChuaKQ },
    { name: 'Có KQ, không note', value: tacNghiepKPIs.coKQKhongNote },
    { name: 'Trống hoàn toàn', value: tacNghiepKPIs.trong },
  ].filter((d) => d.value > 0);

  const stackedData = teamList?.map((t) => ({
    name: t.team,
    'Đủ hành trình': t.duHanhTrinh,
    'Có note, chưa KQ': t.coNote,
    'Có KQ, không note': t.coKQ,
    'Trống': t.trong,
  })) || [];

  return (
    <div className="quality-grid">
      <div className="card chart-card">
        <p className="section-title">Tỷ trọng 4 nhóm — {total} leads</p>
        {donutData.map((d) => (
          <div key={d.name} style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: Q_COLORS[d.name], flexShrink: 0, display: 'inline-block' }} />
            {d.name} — <strong style={{ color: Q_COLORS[d.name] }}>{d.value} ({total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%)</strong>
          </div>
        ))}
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
              {donutData.map((d) => <Cell key={d.name} fill={Q_COLORS[d.name]} stroke="transparent" fillOpacity={0.6} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card chart-card">
        <p className="section-title">Phân bổ theo Team</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stackedData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
            {Object.entries(Q_COLORS).map(([k, c]) => (
              <Bar key={k} dataKey={k === 'Trống hoàn toàn' ? 'Trống' : k} stackId="a" fill={c} fillOpacity={0.6} radius={k === 'Trống hoàn toàn' || k === 'Trống' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TeamQualityChart;
