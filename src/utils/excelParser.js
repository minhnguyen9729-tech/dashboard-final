// ============================================================
// EXCEL PARSER — Đọc và chuẩn hoá dữ liệu từ file .xlsx
// [Tối ưu 1] normalizeKey: cắt khoảng trắng, lowercase tên cột
// [Tối ưu 4] parseExcelDate: xử lý cả Serial Number & String ngày
// ============================================================
import * as XLSX from 'xlsx';
import { TEAM_MAP, KNM_KEYWORDS, SUCCESS_OUTCOMES } from './constants';

// --- Tối ưu 1: Chuẩn hoá tên cột ---
const normalizeKey = (key) => {
  if (!key) return '';
  return String(key).trim().toLowerCase();
};

// --- Tối ưu 4: Xử lý ngày tháng từ Excel ---
const parseExcelDate = (value) => {
  if (!value) return null;
  // Trường hợp Excel Serial Number (số nguyên)
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0);
    }
  }
  // Trường hợp String (VD: "23/04/2026 16:44:25")
  if (typeof value === 'string') {
    const str = value.trim();
    // Format: DD/MM/YYYY HH:MM:SS
    const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
      const [, d, m, y, h = 0, min = 0, s = 0] = match;
      return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s));
    }
    // Thử parse tổng quát
    const parsed = new Date(str);
    if (!isNaN(parsed)) return parsed;
  }
  if (value instanceof Date) return value;
  return null;
};

// --- Rule Nhãn: Tách multi-label bằng dấu ";" ---
const parseLabels = (value) => {
  if (!value || String(value).trim() === '') return [];
  return String(value).split(';').map((l) => l.trim()).filter(Boolean);
};

// --- Rule Team: Gắn team cho từng Sale ---
const getTeam = (saleName) => {
  if (!saleName) return 'Team 1';
  const lowerSale = String(saleName).toLowerCase().trim();
  for (const [team, keywords] of Object.entries(TEAM_MAP)) {
    if (keywords.some((k) => lowerSale.includes(k))) return team;
  }
  return 'Team 1';
};

// --- Tối ưu 2: Rule KNM chặt chẽ ---
// Chỉ tính KNM nếu: note nội bộ có chứa keyword KNM VÀ kết quả cuối không phải thành công
const applyKnmRule = (tinhNhanNoiBo, ketQuaTacNghiep, nhanArr) => {
  if (!tinhNhanNoiBo) return nhanArr;
  const noteStr = String(tinhNhanNoiBo).toLowerCase();
  const hasKnmKeyword = KNM_KEYWORDS.some((kw) => noteStr.includes(kw));
  if (!hasKnmKeyword) return nhanArr;

  // Kiểm tra kết quả cuối có phải thành công không
  const ketQua = String(ketQuaTacNghiep || '').toLowerCase().trim();
  const isSuccess = SUCCESS_OUTCOMES.some((s) => ketQua.includes(s));
  if (isSuccess) return nhanArr; // Bỏ qua nếu đã thành công

  // Thêm nhãn "Không nghe máy" nếu chưa có
  if (!nhanArr.includes('Không nghe máy')) {
    return [...nhanArr, 'Không nghe máy (Note)'];
  }
  return nhanArr;
};

// --- Validate cột bắt buộc ---
const REQUIRED_COLS = ['khách hàng', 'sale', 'nguồn khách', 'ngày data về'];
const validateHeaders = (headers) => {
  const missing = REQUIRED_COLS.filter((r) => !headers.includes(r));
  if (missing.length > 0) {
    throw new Error(`File Excel thiếu các cột bắt buộc: ${missing.join(', ')}`);
  }
};

// --- Hàm chính: Đọc file Excel và parse ---
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

        if (rawRows.length < 2) throw new Error('File Excel không có dữ liệu.');

        // Lấy header row, chuẩn hoá
        const rawHeaders = rawRows[0];
        const normalizedHeaders = rawHeaders.map(normalizeKey);

        // Validate cột bắt buộc
        validateHeaders(normalizedHeaders);

        // Hàm lấy value theo tên cột (đã chuẩn hoá)
        const getCol = (row, colName) => {
          const idx = normalizedHeaders.indexOf(normalizeKey(colName));
          return idx >= 0 ? row[idx] : null;
        };

        const parsed = rawRows.slice(1).map((row, idx) => {
          const tinNhanNoiBo = getCol(row, 'tin nhắn nội bộ');
          const ketQuaTacNghiep = getCol(row, 'kết quả tác nghiệp');
          let nhanArr = parseLabels(getCol(row, 'nhãn khách hàng'));

          // Apply Rule KNM
          nhanArr = applyKnmRule(tinNhanNoiBo, ketQuaTacNghiep, nhanArr);

          const saleName = getCol(row, 'sale');

          return {
            id: idx + 1,
            khachHang: getCol(row, 'khách hàng'),
            sale: saleName,
            team: getTeam(saleName),
            sdt: getCol(row, 'số điện thoại'),
            tinNhanNoiBo,
            thanhTien: getCol(row, 'thành tiền'),
            ngayChot: parseExcelDate(getCol(row, 'ngày chốt đơn hàng')),
            nhanKhachHang: nhanArr,
            tinNhanKhachHang: getCol(row, 'tin nhắn khách hàng'),
            nguonKhach: getCol(row, 'nguồn khách'),
            ngayDataVe: parseExcelDate(getCol(row, 'ngày data về')),
            tacNghiepCan: getCol(row, 'tác nghiệp cần'),
            tacNghiepTiep: getCol(row, 'tác nghiệp tiếp'),
            ketQuaTacNghiep,
            ngayBatDauTacNghiep: parseExcelDate(getCol(row, 'ngày sale bắt đầu tác nghiệp')),
            ngayCapNhatTacNghiep: parseExcelDate(getCol(row, 'ngày sale cập nhật tác nghiệp')),
          };
        }).filter((r) => r.khachHang); // Lọc bỏ row trống

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc file.'));
    reader.readAsArrayBuffer(file);
  });
};
