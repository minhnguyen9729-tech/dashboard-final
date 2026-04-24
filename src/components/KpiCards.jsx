// ============================================================
// KpiCards — Hiển thị các số liệu tổng quan nhanh (Glass)
// ============================================================
import './KpiCards.css';

const formatCurrency = (num) => {
  if (!num) return '0₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);
};

// Hàm chuyển đổi hex thành rgb (để dùng rgba trong CSS variable)
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,255,255';
};

const Card = ({ label, value, sub, color, icon, delay }) => {
  const rgbColor = hexToRgb(color);
  return (
    <div className={`kpi-card fade-up ${delay}`} style={{ 
      '--card-accent': color, 
      '--card-accent-alpha': `rgba(${rgbColor}, 0.15)`,
      '--card-accent-alpha-dark': `rgba(${rgbColor}, 0.3)`
    }}>
      <div className="kpi-card__glow" />
      <div className="kpi-card__header">
        <div className="kpi-card__label">{label}</div>
        <div className="kpi-card__icon">{icon}</div>
      </div>
      <div className="kpi-card__body">
        <div className="kpi-card__value">{value}</div>
        {sub && <div className="kpi-card__sub">{sub}</div>}
      </div>
    </div>
  );
};

const KpiCards = ({ leadKPIs, tacNghiepKPIs, saleKPIs }) => {
  if (!leadKPIs) return null;
  return (
    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
      <Card delay="" icon="📊" label="Tổng Lead" value={leadKPIs.total.toLocaleString('vi-VN')} sub="100%" color="#6366f1" />
      <Card delay="fade-up-1" icon="📞" label="Không nghe máy" value={leadKPIs.knmCount.toLocaleString('vi-VN')} sub={`${leadKPIs.knmRate}% trên tổng`} color="#f43f5e" />
      <Card delay="fade-up-2" icon="💬" label="Kết nối Zalo" value={leadKPIs.zaloCount.toLocaleString('vi-VN')} sub={`${leadKPIs.zaloRate}% trên tổng`} color="#10b981" />
      <Card delay="fade-up-3" icon="🎯" label="Tỷ lệ Fit" value={leadKPIs.fitCount.toLocaleString('vi-VN')} sub={`${leadKPIs.fitRate}% trên tổng`} color="#f59e0b" />
      <Card delay="fade-up-4" icon="🗑️" label="Lead rác / kho" value={leadKPIs.rachCount.toLocaleString('vi-VN')} sub={`${leadKPIs.rachRate}% trên tổng`} color="#64748b" />
    </div>
  );
};

export default KpiCards;
