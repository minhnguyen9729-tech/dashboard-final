import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './Charts.css';

const JOB_COLORS = {
  'C-Level (Người ra quyết định)': '#8b5cf6', // Tím
  'Manager (Quản lý cấp trung)': '#0ea5e9', // Xanh biển
  'Staff (Người dùng trực tiếp)': '#22c55e', // Xanh lá
  'Khác': '#475569', // Xám
};

const SCALE_COLORS = {
  'Doanh nghiệp (>10 users)': '#f97316', // Cam
  'Team nhỏ (<10 users)': '#eab308', // Vàng
  'Cá nhân (1 user)': '#14b8a6', // Ngọc
};

const TOOL_COLORS = {
  'Excel / Google Sheets': '#10b981', // Xanh Ngọc
  'CRM / Phần mềm khác': '#3b82f6', // Xanh biển
  'Khác': '#64748b', // Xám
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = payload[0].color || payload[0].fill;
  return (
    <div className="chart-tooltip" style={{ borderColor: color }}>
      <strong style={{ color }}>{d.name}</strong>
      <span>{payload[0].value} leads {d.pct ? `— ${d.pct}%` : ''}</span>
    </div>
  );
};

// Hàm xào trộn array ngẫu nhiên cho Tag Cloud
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const TAG_COLORS = {
  'Hỏi về Giá/Chi phí': '#eab308',     // Vàng
  'Khách đang Bận': '#f97316',        // Cam
  'Yêu cầu qua Zalo': '#0ea5e9',      // Xanh biển
  'Chờ xem tài liệu': '#8b5cf6',      // Tím
  'Sai tệp / Chỉ tham khảo': '#ef4444',// Đỏ
  'Thuê bao / Số ảo': '#64748b',      // Xám
  'Trùng Data': '#ec4899',            // Hồng
};

const CustomerInsights = ({ insightKPIs }) => {
  if (!insightKPIs) return null;

  const { quyMo, chucDanh, congCu, saleTags } = insightKPIs;

  // Xử lý data Chức danh
  const jobTotal = Object.values(chucDanh).reduce((a, b) => a + b, 0);
  const jobData = Object.entries(chucDanh)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, pct: jobTotal > 0 ? ((value / jobTotal) * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.value - a.value);

  // Xử lý data Quy mô
  const scaleTotal = Object.values(quyMo).reduce((a, b) => a + b, 0);
  const scaleData = Object.entries(quyMo)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, pct: scaleTotal > 0 ? ((value / scaleTotal) * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.value - a.value);

  // Xử lý data Công cụ
  const toolTotal = Object.values(congCu || {}).reduce((a, b) => a + b, 0);
  const toolData = Object.entries(congCu || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, pct: toolTotal > 0 ? ((value / toolTotal) * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.value - a.value);

  // Xử lý Tag Cloud
  const tagMax = Math.max(...Object.values(saleTags), 1);
  const rawTags = Object.entries(saleTags).map(([name, count]) => {
    const fontSize = 11 + (count / tagMax) * 13;
    const color = TAG_COLORS[name] || '#8b5cf6';
    return { name, count, fontSize, color };
  });
  const tagCloudData = shuffleArray(rawTags);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      
      {/* 1. Job Title Donut */}
      <div className="card chart-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#8b5cf6', borderRadius: 2 }} />
            Chân dung Người quyết định (Job Title)
          </h3>
          <span style={{ fontSize: 10, color: '#475569', background: '#1e2235', padding: '2px 6px', borderRadius: 4 }}>Dựa trên {jobTotal} leads có dữ liệu</span>
        </div>
        <ResponsiveContainer width="100%" height={240} style={{ marginTop: 'auto' }}>
          <PieChart>
            <Pie data={jobData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" paddingAngle={0}>
              {jobData.map((d) => <Cell key={d.name} className="interactive-pie-cell" fill={JOB_COLORS[d.name] || '#475569'} stroke={JOB_COLORS[d.name] || '#475569'} strokeWidth={2} fillOpacity={0.5} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          {jobData.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#cbd5e1' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: JOB_COLORS[d.name] || '#475569', boxShadow: `0 0 6px ${JOB_COLORS[d.name] || '#475569'}` }} />
              {d.name.split(' (')[0]} ({d.pct}%)
            </div>
          ))}
        </div>
      </div>

      {/* 2. Scale Donut */}
      <div className="card chart-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#f97316', borderRadius: 2 }} />
            Quy mô Áp dụng (Company Size)
          </h3>
          <span style={{ fontSize: 10, color: '#475569', background: '#1e2235', padding: '2px 6px', borderRadius: 4 }}>Dựa trên {scaleTotal} leads có dữ liệu</span>
        </div>
        <ResponsiveContainer width="100%" height={240} style={{ marginTop: 'auto' }}>
          <PieChart>
            <Pie data={scaleData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" paddingAngle={0}>
              {scaleData.map((d) => <Cell key={d.name} className="interactive-pie-cell" fill={SCALE_COLORS[d.name] || '#475569'} stroke={SCALE_COLORS[d.name] || '#475569'} strokeWidth={2} fillOpacity={0.5} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          {scaleData.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#cbd5e1' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: SCALE_COLORS[d.name] || '#475569', boxShadow: `0 0 6px ${SCALE_COLORS[d.name] || '#475569'}` }} />
              {d.name.split(' (')[0]} ({d.pct}%)
            </div>
          ))}
        </div>
      </div>

      {/* 3. Current Tools Donut */}
      <div className="card chart-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#10b981', borderRadius: 2 }} />
            Công Cụ Đang Sử Dụng (Current Tools)
          </h3>
          <span style={{ fontSize: 10, color: '#475569', background: '#1e2235', padding: '2px 6px', borderRadius: 4 }}>Dựa trên {toolTotal} leads có dữ liệu</span>
        </div>
        <ResponsiveContainer width="100%" height={240} style={{ marginTop: 'auto' }}>
          <PieChart>
            <Pie data={toolData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" paddingAngle={0}>
              {toolData.map((d) => <Cell key={d.name} className="interactive-pie-cell" fill={TOOL_COLORS[d.name] || '#64748b'} stroke={TOOL_COLORS[d.name] || '#64748b'} strokeWidth={2} fillOpacity={0.5} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          {toolData.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#cbd5e1' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: TOOL_COLORS[d.name] || '#64748b', boxShadow: `0 0 6px ${TOOL_COLORS[d.name] || '#64748b'}` }} />
              {d.name.split(' (')[0]} ({d.pct}%)
            </div>
          ))}
        </div>
      </div>

      {/* 4. Tag Cloud */}
      <div className="card chart-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#ef4444', borderRadius: 2 }} />
            Đám mây Từ Khóa Nội Bộ (Sale Tags)
          </h3>
          <span style={{ fontSize: 10, color: '#475569', background: '#1e2235', padding: '2px 6px', borderRadius: 4 }}>Dựa trên Ghi chú của Sale</span>
        </div>
        
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignContent: 'center',
          justifyContent: 'center',
          gap: '12px 16px',
          padding: '20px'
        }}>
          {tagCloudData.length === 0 ? (
            <div style={{ color: '#475569', fontSize: 13 }}>Chưa có ghi chú nào chứa từ khóa.</div>
          ) : tagCloudData.map((tag) => (
            <div 
              key={tag.name}
              title={`${tag.count} leads`}
              style={{
                background: `${tag.color}15`,
                border: `1px solid ${tag.color}60`,
                color: tag.color,
                fontSize: `${tag.fontSize}px`,
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '100px',
                boxShadow: `0 4px 12px ${tag.color}10, inset 0 0 10px ${tag.color}10`,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${tag.color}40, inset 0 0 20px ${tag.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${tag.color}10, inset 0 0 10px ${tag.color}10`;
              }}
            >
              {tag.name}
              <span style={{ 
                background: tag.color, 
                color: '#fff', 
                fontSize: '10px', 
                padding: '1px 5px', 
                borderRadius: 10,
                opacity: 0.9
              }}>{tag.count}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default CustomerInsights;
