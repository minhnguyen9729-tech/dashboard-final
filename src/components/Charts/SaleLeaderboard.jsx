// ============================================================
// SaleLeaderboard — Bảng L2+ stacked bar theo từng Sale
// ============================================================
import './Charts.css';

const TEAM_TAG = { 'Team 1': 'T1', 'Team 2': 'T2', 'Team 3': 'T3', 'Team 4': 'T4' };
const TEAM_COLOR = { 'Team 1': '#818cf8', 'Team 2': '#34d399', 'Team 3': '#fbbf24', 'Team 4': '#f87171' };

// Màu sắc từng phân khúc L2+ bar
const SEG_COLORS = {
  chot: '#22c55e',    // Đã chốt -> Xanh lá (Green)
  ketNoi: '#0ea5e9',  // Kết nối Zalo -> Xanh biển (Sky Blue)
  fit: '#eab308',     // Fit -> Vàng (Yellow)
  knm: '#ef4444',     // Không nghe máy -> Đỏ (Red)
  other: '#a855f7',   // Còn lại -> Tím Violet (Thay cho Xám đậm cũ)
};

const SaleLeaderboard = ({ saleList }) => {
  if (!saleList?.length) return null;

  return (
    <div className="card chart-card" style={{ padding: '24px',  }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 3, height: 14, background: '#8b5cf6', borderRadius: 2 }} />
          Mức độ tiếp cận có ý nghĩa (L2+) theo từng Sale
        </h3>
      </div>
      
      <div>
        {saleList.map((s) => {
          const t = s.tongLead || 1;
          const chotW = (s.chot / t) * 100;
          const ketNoiW = Math.max(0, ((s.ketNoi - s.chot) / t) * 100);
          const knmW = (s.kNM / t) * 100;
          const otherW = Math.max(0, 100 - chotW - ketNoiW - knmW);
          const teamColor = TEAM_COLOR[s.team] || '#94a3b8';
          const rateNum = parseFloat(s.l2PlusRate);
          const rateColor = rateNum >= 60 ? '#22c55e' : rateNum >= 40 ? '#eab308' : '#ef4444';

          return (
            <div key={s.sale} className="l2-row">
              <div className="l2-name" title={s.sale}>
                {s.sale}
                <span className="badge" style={{ marginLeft: 6, background: `${teamColor}20`, color: teamColor, fontSize: 10, padding: '1px 5px' }}>
                  {TEAM_TAG[s.team] || 'T1'}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.tongLead}</span>
              <div className="l2-bar-wrap" style={{ background: 'transparent', backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 19.9%, rgba(255,255,255,0.05) 20%)', border: 'none', boxShadow: 'none', gap: 2, position: 'relative' }}>
                {/* Các vạch mốc 20%, 40%, 60%, 80% */}
                <div style={{ position: 'absolute', left: '20%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', left: '40%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', left: '60%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', left: '80%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(255,255,255,0.08)' }} />
                
                {chotW > 0 && <div className="l2-bar-segment" style={{ width: `${chotW}%`, background: `${SEG_COLORS.chot}80`, border: `1px solid ${SEG_COLORS.chot}` }} title={`Chốt: ${s.chot}`} />}
                {ketNoiW > 0 && <div className="l2-bar-segment" style={{ width: `${ketNoiW}%`, background: `${SEG_COLORS.ketNoi}80`, border: `1px solid ${SEG_COLORS.ketNoi}` }} title={`Zalo: ${s.ketNoi}`} />}
                {knmW > 0 && <div className="l2-bar-segment" style={{ width: `${knmW}%`, background: `${SEG_COLORS.knm}80`, border: `1px solid ${SEG_COLORS.knm}` }} title={`KNM: ${s.kNM}`} />}
                {otherW > 0 && <div className="l2-bar-segment" style={{ width: `${otherW}%`, background: `${SEG_COLORS.other}80`, border: `1px solid ${SEG_COLORS.other}` }} />}
              </div>
              <div className="l2-rate" style={{ color: rateColor }}>{s.l2PlusRate}%</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Object.entries({ 'Đã chốt': SEG_COLORS.chot, 'Kết nối Zalo': SEG_COLORS.ketNoi, 'Không nghe máy': SEG_COLORS.knm, 'Khác': SEG_COLORS.other }).map(([k, c]) => (
          <span key={k} style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: c, opacity: 0.8 }} />{k}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SaleLeaderboard;
