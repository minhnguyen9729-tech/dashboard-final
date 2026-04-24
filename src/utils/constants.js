// ============================================================
// CONSTANTS - Phân nhóm Team theo Sale
// Chỉnh sửa tại đây khi có thêm/bớt nhân sự
// ============================================================

export const TEAM_MAP = {
  'Team 3': ['linh', 'hưng', 'bích'],
  'Team 2': ['hà', 'chiến', 'loan'],
  'Team 4': ['lâm'],
};

// Các kết quả tác nghiệp được coi là "Thành công" → bỏ qua rule KNM
export const SUCCESS_OUTCOMES = [
  'chốt dashboard',
  'chốt đơn',
  'đã chốt',
  'đồng ý lịch hẹn demo',
  'đồng ý dùng thử',
  'chốt đơn đầu crm/erp',
];

// Từ khoá "Không nghe máy" trong Tin nhắn nội bộ
export const KNM_KEYWORDS = ['knm', 'không nghe máy', 'k nghe máy'];

// Màu sắc cho từng Team
export const TEAM_COLORS = {
  'Team 1': '#6366f1',
  'Team 2': '#10b981',
  'Team 3': '#f59e0b',
  'Team 4': '#ef4444',
  'Không xác định': '#94a3b8',
};

// Mapping bước tác nghiệp → nhóm phễu
export const FUNNEL_GROUPS = {
  'Đầu phễu': ['lead mới'],
  'Đang gọi': ['gọi lần 2', 'gọi lần 3', 'gọi lần 4', 'gọi lần 5', 'gọi lần 6'],
  'Tồn kho / Rác': ['kho số', 'số rác', 'số trùng'],
  'Đã tư vấn / Đang xử lý': ['tư vấn dashboard', 'tư vấn crm', 'nhắc lịch demo'],
  'Demo / Hẹn demo': ['demo dashboard', 'demo crm'],
  'Dừng tác nghiệp': ['dừng tác nghiệp', 'fail s1', 'fail s8'],
  'Đã chốt': ['chốt dashboard', 'chốt đơn'],
};
