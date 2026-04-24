// ============================================================
// TeamQualityChart — Donut + Stacked Bar chất lượng tác nghiệp
// ============================================================
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import './Charts.css';

const Q_COLORS = { 
  'Đủ hành trình': '#22c55e',       // Chốt / Đủ -> Xanh lá (Green)
  'Có note, chưa KQ': '#0ea5e9',    // Đang xử lý -> Xanh biển (Sky Blue)
  'Có KQ, không note': '#eab308',   // Lỗi nhẹ / Thiếu sót -> Vàng (Yellow)
  'Trống hoàn toàn': '#ef4444'      // Tồi tệ -> Đỏ (Red)
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  
  // Nếu la Bar Chart (nhận biết qua biến label là tên Team)
  if (label) {
    const teamTotal = payload.reduce((sum, p) => sum + p.value, 0);
    return (
      <div className="chart-tooltip" style={{ minWidth: 180 }}>
        <strong style={{ display: 'block', marginBottom: 8, color: '#fff', borderBottom: '1px solid #1e2235', paddingBottom: 6 }}>
          {label} — {teamTotal} leads
        </strong>
        {payload.map(p => (
          p.value > 0 && (
            <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: p.color || p.fill }}>{p.name}</span>
              <strong style={{ color: '#fff', marginLeft: 16 }}>
                {p.value} <span style={{ color: '#94a3b8', fontSize: 10, fontWeight: 'normal' }}>({((p.value / teamTotal) * 100).toFixed(1)}%)</span>
              </strong>
            </div>
          )
        ))}
      </div>
    );
  }

  // Nếu là Pie Chart
  return (
    <div className="chart-tooltip" style={{ borderColor: payload[0].payload.fill || payload[0].color }}>
      <strong style={{ color: payload[0].payload.fill || payload[0].color }}>{payload[0].name}</strong>
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
      <div className="card chart-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#8b5cf6', borderRadius: 2 }} />
            Tỷ trọng 4 nhóm — {total} leads
          </h3>
        </div>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            {donutData.map((d) => (
              <div key={d.name} style={{ fontSize: 13, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: Q_COLORS[d.name], flexShrink: 0, display: 'inline-block', boxShadow: `0 0 8px ${Q_COLORS[d.name]}` }} />
                <span>
                  {d.name} <br/>
                  <strong style={{ color: Q_COLORS[d.name], fontSize: 15 }}>{d.value} ({total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%)</strong>
                </span>
              </div>
            ))}
          </div>
          <div style={{ width: '55%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={0}>
                  {donutData.map((d) => <Cell key={d.name} className="interactive-pie-cell" fill={Q_COLORS[d.name]} stroke={Q_COLORS[d.name]} strokeWidth={2} fillOpacity={0.5} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card chart-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#8b5cf6', borderRadius: 2 }} />
            Phân bổ theo Team
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={260} style={{ marginTop: 'auto' }}>
          <BarChart data={stackedData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            {Object.entries(Q_COLORS).map(([k, c]) => (
              <Bar 
                key={k} 
                dataKey={k === 'Trống hoàn toàn' ? 'Trống' : k} 
                stackId="a" 
                fill={c} 
                fillOpacity={0.5} 
                stroke={c} 
                strokeWidth={2} 
                radius={k === 'Trống hoàn toàn' || k === 'Trống' ? [4, 4, 0, 0] : [0, 0, 0, 0]} 
                activeBar={{ stroke: '#fff', strokeWidth: 2, fillOpacity: 0.8 }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TeamQualityChart;
