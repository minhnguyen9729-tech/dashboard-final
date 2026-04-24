// ============================================================
// SaleLeaderboard — Bảng L2+ stacked bar theo từng Sale
// ============================================================
import './Charts.css';

const TEAM_TAG = { 'Team 1': 'T1', 'Team 2': 'T2', 'Team 3': 'T3', 'Team 4': 'T4' };
const TEAM_COLOR = { 'Team 1': '#818cf8', 'Team 2': '#34d399', 'Team 3': '#fbbf24', 'Team 4': '#f87171' };

// Màu sắc từng phân khúc L2+ bar
const SEG_COLORS = {
  chot: '#10b981',    // Đã chốt
  ketNoi: '#6366f1',  // Kết nối Zalo
  fit: '#f59e0b',     // Fit
  knm: '#ef4444',     // Không nghe máy
  other: '#475569',   // Còn lại
};

const SaleLeaderboard = ({ saleList }) => {
  if (!saleList?.length) return null;

  return (
    <div className="card chart-card">
      <p className="section-title">Mức độ tiếp cận có ý nghĩa (L2+) theo từng Sale</p>
      <div>
        {saleList.map((s) => {
          const t = s.tongLead || 1;
          const chotW = (s.chot / t) * 100;
          const ketNoiW = Math.max(0, ((s.ketNoi - s.chot) / t) * 100);
          const knmW = (s.kNM / t) * 100;
          const otherW = Math.max(0, 100 - chotW - ketNoiW - knmW);
          const teamColor = TEAM_COLOR[s.team] || '#94a3b8';
          const rateNum = parseFloat(s.l2PlusRate);
          const rateColor = rateNum >= 60 ? '#10b981' : rateNum >= 40 ? '#f59e0b' : '#ef4444';

          return (
            <div key={s.sale} className="l2-row">
              <div className="l2-name" title={s.sale}>
                {s.sale}
                <span className="badge" style={{ marginLeft: 6, background: `${teamColor}20`, color: teamColor, fontSize: 10, padding: '1px 5px' }}>
                  {TEAM_TAG[s.team] || 'T1'}
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.tongLead}</span>
              <div className="l2-bar-wrap">
                {chotW > 0 && <div className="l2-bar-segment" style={{ width: `${chotW}%`, background: SEG_COLORS.chot }} title={`Chốt: ${s.chot}`} />}
                {ketNoiW > 0 && <div className="l2-bar-segment" style={{ width: `${ketNoiW}%`, background: SEG_COLORS.ketNoi }} title={`Zalo: ${s.ketNoi}`} />}
                {knmW > 0 && <div className="l2-bar-segment" style={{ width: `${knmW}%`, background: SEG_COLORS.knm }} title={`KNM: ${s.kNM}`} />}
                {otherW > 0 && <div className="l2-bar-segment" style={{ width: `${otherW}%`, background: SEG_COLORS.other }} />}
              </div>
              <div className="l2-rate" style={{ color: rateColor }}>{s.l2PlusRate}%</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {Object.entries({ 'Đã chốt': SEG_COLORS.chot, 'Kết nối Zalo': SEG_COLORS.ketNoi, 'Không nghe máy': SEG_COLORS.knm, 'Khác': SEG_COLORS.other }).map(([k, c]) => (
          <span key={k} style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }} />{k}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SaleLeaderboard;
