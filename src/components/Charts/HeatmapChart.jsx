// ============================================================
// HourlyChart — Phân bổ Lead theo Khung giờ (Giống UI thiết kế)
// ============================================================
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import './Charts.css';

const TIME_BLOCKS = [
  { id: 'dem', label: 'ĐÊM · 0–5H', hours: [0,1,2,3,4,5], color: '#6366f1', icon: '🌙' }, // Tím Indigo
  { id: 'sangs', label: 'SÁNG SỚM · 6–8H', hours: [6,7,8], color: '#0ea5e9', icon: '🌅' }, // Xanh lam (Cyan/Sky)
  { id: 'sang', label: 'SÁNG · 9–11H', hours: [9,10,11], color: '#22c55e', icon: '☀️' }, // Xanh lá mạ
  { id: 'chieu', label: 'CHIỀU · 12–16H', hours: [12,13,14,15,16], color: '#eab308', icon: '⛅' }, // Vàng nâu
  { id: 'toi', label: 'TỐI ★ · 17–23H', hours: [17,18,19,20,21,22,23], color: '#ef4444', icon: '🌙' }, // Đỏ
];

const getBlockColor = (hour) => {
  const block = TIME_BLOCKS.find((b) => b.hours.includes(hour));
  return block ? block.color : '#475569';
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip" style={{ borderColor: d.color }}>
      <strong style={{ color: d.color }}>{d.hour}h</strong>
      <span>{d.leads} leads</span>
    </div>
  );
};

const HeatmapChart = ({ hourlyDist = Array(24).fill(0), heatmapData = {} }) => {
  const totalLeads = hourlyDist.reduce((a, b) => a + b, 0);

  // Tính toán dữ liệu cho 5 thẻ (Cards)
  const blockStats = TIME_BLOCKS.map((block) => {
    const leads = block.hours.reduce((sum, h) => sum + hourlyDist[h], 0);
    const maxHour = block.hours.reduce((a, b) => (hourlyDist[a] > hourlyDist[b] ? a : b), block.hours[0]);
    return {
      ...block,
      leads,
      pct: totalLeads > 0 ? ((leads / totalLeads) * 100).toFixed(1) : 0,
      peakHour: maxHour,
      peakLeads: hourlyDist[maxHour],
    };
  });

  // Dữ liệu cho BarChart
  const chartData = hourlyDist.map((leads, h) => ({
    hour: h,
    hourLabel: `${h}h`,
    leads,
    color: getBlockColor(h),
  }));

  return (
    <div className="card chart-card" style={{ padding: '24px',  }}>
      
      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 Lead Về Theo Từng Giờ — Tất Cả Ngày
          </h3>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
            Phân tích giờ nhận lead theo 5 khung giờ trong ngày
          </p>
        </div>
        <div style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
          {totalLeads} LEADS CÓ GIỜ
        </div>
      </div>

      {/* --- 5 SUMMARY CARDS --- */}
      <div className="time-block-grid">
        {blockStats.map((b) => (
          <div key={b.id} className="time-block-card" style={{ '--block-color': b.color }}>
            <div className="tb-header">
              <span>{b.icon} {b.label}</span>
            </div>
            <div className="tb-value">{b.leads}</div>
            <div className="tb-pct">{b.pct}% tổng lead</div>
            <div className="tb-peak" style={{ color: b.color }}>
              Đỉnh: {b.peakHour}h ({b.peakLeads} lead)
            </div>
          </div>
        ))}
      </div>

      {/* --- RECHARTS BAR CHART --- */}
      <div style={{ marginTop: 24, height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hourLabel" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  fillOpacity={0.5} 
                  stroke={entry.color} 
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- LEGEND --- */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, justifyContent: 'center' }}>
        {TIME_BLOCKS.map((b) => (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: b.color, opacity: 0.8 }} />
            {b.label.split('·')[0].trim()}
          </div>
        ))}
      </div>

      {/* --- 2D HEATMAP (NGÀY x GIỜ) --- */}
      {heatmapData && Object.keys(heatmapData).length > 0 && (
        <div style={{ marginTop: 40, borderTop: '1px solid #1e2235', paddingTop: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#0ea5e9', borderRadius: 2 }} />
            Ma Trận Heatmap (Ngày x Giờ)
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 800 }}>
              {/* Header (Hours) */}
              <div style={{ display: 'flex', marginLeft: 60, marginBottom: 6 }}>
                {Array(24).fill(0).map((_, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#64748b' }}>{i}h</div>
                ))}
              </div>
              {/* Rows (Dates) */}
              {(() => {
                const sortedDates = Object.keys(heatmapData).sort((a, b) => {
                  const [d1, m1, y1] = a.split('/');
                  const [d2, m2, y2] = b.split('/');
                  return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
                });
                
                let globalMax = 1;
                sortedDates.forEach(date => {
                  heatmapData[date].forEach(val => {
                    if (val > globalMax) globalMax = val;
                  });
                });

                return sortedDates.map(date => (
                  <div key={date} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                    <div style={{ width: 60, fontSize: 10, color: '#94a3b8', textAlign: 'right', paddingRight: 10, flexShrink: 0 }}>{date.slice(0, 5)}</div>
                    <div style={{ display: 'flex', flex: 1, gap: 2 }}>
                      {heatmapData[date].map((val, i) => {
                        // --- Thang màu Tím Neon đơn sắc (dễ đọc trên nền đen) ---
                        // 0 lead: nền tối | thấp → tím sâu | trung → tím neon | cao → hồng neon sáng
                        let bg, border, textColor;
                        if (val === 0) {
                          bg = '#0e1117';
                          border = '1px solid #1e2235';
                          textColor = 'transparent';
                        } else {
                          const t = Math.min(val / globalMax, 1);
                          // Dùng 4 mốc màu rõ ràng, mỗi mốc cách nhau xa
                          let r, g, b;
                          if (t < 0.2) {
                            // Tím đen → Tím đậm
                            const a = t / 0.2;
                            r = Math.round(30 + a * 58);   // 30 → 88
                            g = Math.round(10 + a * 18);   // 10 → 28
                            b = Math.round(60 + a * 90);   // 60 → 150
                          } else if (t < 0.5) {
                            // Tím đậm → Tím Violet neon
                            const a = (t - 0.2) / 0.3;
                            r = Math.round(88 + a * 96);   // 88 → 184
                            g = Math.round(28 + a * 30);   // 28 → 58
                            b = Math.round(150 + a * 93);  // 150 → 243
                          } else if (t < 0.8) {
                            // Violet neon → Hồng Magenta
                            const a = (t - 0.5) / 0.3;
                            r = Math.round(184 + a * 48);  // 184 → 232
                            g = Math.round(58 - a * 30);   // 58 → 28
                            b = Math.round(243 - a * 113); // 243 → 130
                          } else {
                            // Hồng Magenta sáng → Trắng neon (đỉnh điểm)
                            const a = (t - 0.8) / 0.2;
                            r = Math.round(232 + a * 23);  // 232 → 255
                            g = Math.round(28 + a * 50);   // 28 → 78
                            b = Math.round(130 + a * 80);  // 130 → 210
                          }
                          bg = `rgb(${r}, ${g}, ${b})`;
                          border = `1px solid rgba(${r}, ${g}, ${b}, 0.7)`;
                          textColor = t > 0.45 ? 'rgba(255,255,255,0.95)' : 'rgba(220,180,255,0.9)';
                        }
                        return (
                          <div 
                            key={i} 
                            title={`${date} lúc ${i}h: ${val} lead`} 
                            style={{ 
                              flex: 1, 
                              height: 28,
                              background: bg, 
                              borderRadius: 3, 
                              cursor: val > 0 ? 'pointer' : 'default', 
                              transition: 'all 0.15s ease',
                              border,
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => { 
                              if (val > 0) {
                                e.currentTarget.style.transform = 'scale(1.15)';
                                e.currentTarget.style.zIndex = 10;
                                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.5)';
                              }
                            }}
                            onMouseLeave={(e) => { 
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.zIndex = 1;
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {val > 0 && (
                              <span style={{ 
                                fontSize: 9, 
                                fontWeight: 700, 
                                color: textColor,
                                lineHeight: 1,
                                userSelect: 'none',
                                pointerEvents: 'none'
                              }}>{val}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          {/* Color Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10, color: '#64748b' }}>Ít</span>
            <div style={{
              width: 160,
              height: 10,
              borderRadius: 6,
              background: 'linear-gradient(to right, #1e0a3c, #5820b0, #b83af5, #e81c78, #ff4eb8)',
              border: '1px solid #2d1060'
            }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>Nhiều</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatmapChart;
