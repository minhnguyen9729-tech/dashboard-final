// ============================================================
// KpiCards — Hiển thị các số liệu tổng quan nhanh (Glass)
// ============================================================
import './KpiCards.css';

const Card = ({ label, value, sub, color, icon, delay }) => {
  return (
    <div 
      className={`kpi-card fade-up ${delay}`}
      style={{
        background: `radial-gradient(circle at 90% 10%, ${color}25 0%, #151822 55%, #151822 100%)`,
        borderColor: '#1e2235',
        padding: '24px',
        borderRadius: '12px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#cbd5e1', textTransform: 'uppercase' }}>
          {label}
        </span>
        <div 
          style={{ 
            background: `${color}15`, 
            border: `1px solid ${color}40`, 
            width: '32px', height: '32px', borderRadius: '8px', fontSize: '14px',
            boxShadow: `inset 0 0 8px ${color}10`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {icon}
        </div>
      </div>
      
      <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '16px' }}>
        {value}
      </div>
      
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '12px' }} />
      
      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
        {sub}
      </div>
    </div>
  );
};

const KpiCards = ({ leadKPIs }) => {
  if (!leadKPIs) return null;

  const STATS = [
    { id: 'total', label: 'Tổng Lead', value: leadKPIs.total, pct: '100', color: '#6366f1', icon: '📊' }, // Indigo
    { id: 'knm', label: 'Không nghe máy', value: leadKPIs.knmCount, pct: leadKPIs.knmRate, color: '#ef4444', icon: '📞' }, // Red
    { id: 'zalo', label: 'Kết nối Zalo', value: leadKPIs.zaloCount, pct: leadKPIs.zaloRate, color: '#0ea5e9', icon: '💬' }, // Sky Blue (Đúng màu thương hiệu Zalo)
    { id: 'fit', label: 'Tỷ lệ Fit', value: leadKPIs.fitCount, pct: leadKPIs.fitRate, color: '#eab308', icon: '🎯' }, // Yellow
    { id: 'rac', label: 'Lead rác / kho', value: leadKPIs.rachCount, pct: leadKPIs.rachRate, color: '#ec4899', icon: '🗑️' }, // Pink (thay cho Xám cũ)
  ];

  return (
    <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
      {STATS.map((s, index) => (
        <Card key={s.id} delay={`fade-up-${index}`} icon={s.icon} label={s.label} value={s.value.toLocaleString('vi-VN')} sub={s.id === 'total' ? '100%' : `${s.pct}% trên tổng`} color={s.color} />
      ))}
    </div>
  );
};

export default KpiCards;
