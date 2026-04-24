// ============================================================
// KPI ENGINE — Tính toán tất cả chỉ số từ data đã parse
// Tách thành 3 nhóm: Lead Quality, Tác nghiệp, Sale & Team
// ============================================================
import { FUNNEL_GROUPS, SUCCESS_OUTCOMES } from './constants';

// --- Helper: Count theo key ---
const countBy = (arr, keyFn) =>
  arr.reduce((acc, item) => {
    const key = keyFn(item) || 'Không xác định';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

// --- Helper: Check nhãn ---
const hasLabel = (item, labelStr) =>
  item.nhanKhachHang.some((l) => l.toLowerCase().includes(labelStr.toLowerCase()));

// --- Helper: Check kết quả thành công ---
const isSuccess = (item) => {
  const kq = String(item.ketQuaTacNghiep || '').toLowerCase();
  return SUCCESS_OUTCOMES.some((s) => kq.includes(s));
};

// ============================================================
// NHÓM 1: CHẤT LƯỢNG LEAD
// ============================================================
export const calcLeadKPIs = (data) => {
  const total = data.length;
  const nguonCount = countBy(data, (d) => d.nguonKhach);

  // Phân tích nhãn (mảng multi-label)
  const labelCount = {};
  data.forEach((d) => {
    d.nhanKhachHang.forEach((l) => {
      labelCount[l] = (labelCount[l] || 0) + 1;
    });
  });

  // Tỷ lệ nghe máy = Lead KHÔNG có nhãn "Không nghe máy"
  const knmCount = data.filter(
    (d) => hasLabel(d, 'không nghe máy') || hasLabel(d, 'Không nghe máy (Note)')
  ).length;
  const zaloCount = data.filter((d) => hasLabel(d, 'zalo')).length;
  const fitCount = data.filter((d) => hasLabel(d, 'fit')).length;
  const rachCount = data.filter((d) => {
    const tn = String(d.tacNghiepCan || '').toLowerCase();
    return tn.includes('số rác') || tn.includes('số trùng') || tn.includes('kho số');
  }).length;

  return {
    total,
    nguonCount,
    labelCount,
    knmCount,
    knmRate: total > 0 ? ((knmCount / total) * 100).toFixed(1) : 0,
    zaloCount,
    zaloRate: total > 0 ? ((zaloCount / total) * 100).toFixed(1) : 0,
    fitCount,
    fitRate: total > 0 ? ((fitCount / total) * 100).toFixed(1) : 0,
    rachCount,
    rachRate: total > 0 ? ((rachCount / total) * 100).toFixed(1) : 0,
  };
};

// ============================================================
// NHÓM 2: PHỄU CHUYỂN ĐỔI & TÁC NGHIỆP
// ============================================================
export const calcTacNghiepKPIs = (data) => {
  // Phân bổ bước tác nghiệp hiện tại
  const tacNghiepCount = countBy(data, (d) =>
    String(d.tacNghiepCan || '').trim()
  );

  // Phân nhóm theo Phễu chuyển đổi
  const funnelData = {};
  Object.keys(FUNNEL_GROUPS).forEach((group) => (funnelData[group] = 0));
  funnelData['Khác'] = 0;

  data.forEach((d) => {
    const tn = String(d.tacNghiepCan || '').toLowerCase().trim();
    let matched = false;
    for (const [group, keywords] of Object.entries(FUNNEL_GROUPS)) {
      if (keywords.some((kw) => tn.includes(kw))) {
        funnelData[group]++;
        matched = true;
        break;
      }
    }
    if (!matched) funnelData['Khác']++;
  });

  // 4 nhóm chất lượng tác nghiệp
  const duHanhTrinh = data.filter(
    (d) => d.tinNhanNoiBo && d.ketQuaTacNghiep
  ).length;
  const coNoteChuaKQ = data.filter(
    (d) => d.tinNhanNoiBo && !d.ketQuaTacNghiep
  ).length;
  const coKQKhongNote = data.filter(
    (d) => !d.tinNhanNoiBo && d.ketQuaTacNghiep
  ).length;
  const trong = data.filter(
    (d) => !d.tinNhanNoiBo && !d.ketQuaTacNghiep
  ).length;

  // Phân bổ lead theo giờ (từ ngày data về)
  const hourlyDist = Array(24).fill(0);
  data.forEach((d) => {
    if (d.ngayDataVe instanceof Date && !isNaN(d.ngayDataVe)) {
      hourlyDist[d.ngayDataVe.getHours()]++;
    }
  });

  // Heatmap: ngày x giờ
  const heatmapData = {};
  data.forEach((d) => {
    if (d.ngayDataVe instanceof Date && !isNaN(d.ngayDataVe)) {
      const dateStr = d.ngayDataVe.toLocaleDateString('vi-VN');
      const hour = d.ngayDataVe.getHours();
      if (!heatmapData[dateStr]) heatmapData[dateStr] = Array(24).fill(0);
      heatmapData[dateStr][hour]++;
    }
  });

  return {
    tacNghiepCount,
    funnelData,
    duHanhTrinh,
    coNoteChuaKQ,
    coKQKhongNote,
    trong,
    hourlyDist,
    heatmapData,
  };
};

// ============================================================
// NHÓM 3: HIỆU QUẢ SALE & TEAM
// ============================================================
export const calcSaleKPIs = (data) => {
  // Tính theo từng Sale
  const saleMap = {};
  data.forEach((d) => {
    const sale = d.sale || 'Không xác định';
    if (!saleMap[sale]) {
      saleMap[sale] = {
        sale,
        team: d.team,
        tongLead: 0,
        doanhThu: 0,
        kNM: 0,
        ketNoi: 0,
        chot: 0,
        // L2+ = tiếp cận có ý nghĩa (kết nối Zalo, Demo, Fit...)
        l2Plus: 0,
      };
    }
    const s = saleMap[sale];
    s.tongLead++;
    s.doanhThu += d.thanhTien || 0;
    if (hasLabel(d, 'không nghe máy') || hasLabel(d, 'Không nghe máy (Note)')) s.kNM++;
    if (hasLabel(d, 'zalo')) s.ketNoi++;
    if (isSuccess(d) || d.thanhTien > 0) s.chot++;
    // L2+: kết nối Zalo, Fit, Demo, Chốt
    if (
      hasLabel(d, 'zalo') ||
      hasLabel(d, 'fit') ||
      String(d.tacNghiepCan || '').toLowerCase().includes('demo') ||
      isSuccess(d)
    ) {
      s.l2Plus++;
    }
  });

  const saleList = Object.values(saleMap).map((s) => ({
    ...s,
    l2PlusRate: s.tongLead > 0 ? ((s.l2Plus / s.tongLead) * 100).toFixed(1) : 0,
    chotRate: s.tongLead > 0 ? ((s.chot / s.tongLead) * 100).toFixed(1) : 0,
  })).sort((a, b) => b.l2PlusRate - a.l2PlusRate);

  // Tính theo Team
  const teamMap = {};
  saleList.forEach((s) => {
    const t = s.team;
    if (!teamMap[t]) {
      teamMap[t] = { team: t, tongLead: 0, doanhThu: 0, chot: 0, l2Plus: 0, duHanhTrinh: 0, coNote: 0, coKQ: 0, trong: 0 };
    }
    teamMap[t].tongLead += s.tongLead;
    teamMap[t].doanhThu += s.doanhThu;
    teamMap[t].chot += s.chot;
    teamMap[t].l2Plus += s.l2Plus;
  });

  // Thêm thống kê tác nghiệp theo team
  data.forEach((d) => {
    const t = d.team;
    if (!teamMap[t]) return;
    if (d.tinNhanNoiBo && d.ketQuaTacNghiep) teamMap[t].duHanhTrinh++;
    else if (d.tinNhanNoiBo && !d.ketQuaTacNghiep) teamMap[t].coNote++;
    else if (!d.tinNhanNoiBo && d.ketQuaTacNghiep) teamMap[t].coKQ++;
    else teamMap[t].trong++;
  });

  const teamList = Object.values(teamMap).sort((a, b) => b.doanhThu - a.doanhThu);

  // Tổng doanh thu
  const tongDoanhThu = saleList.reduce((sum, s) => sum + s.doanhThu, 0);
  const tongChot = saleList.reduce((sum, s) => sum + s.chot, 0);

  return { saleList, teamList, tongDoanhThu, tongChot };
};
