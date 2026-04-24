// ============================================================
// LOCAL STORAGE — Cache dữ liệu để tránh mất khi F5
// [Tối ưu 3] Lưu rawData vào localStorage
// ============================================================

const STORAGE_KEY = 'dashboard_lead_data';

// Lưu data vào localStorage (convert Date thành ISO string)
export const saveToCache = (data) => {
  try {
    const serialized = JSON.stringify(data, (key, value) => {
      if (value instanceof Date) return { __type: 'Date', value: value.toISOString() };
      return value;
    });
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    console.warn('Không thể lưu cache:', e);
  }
};

// Đọc data từ localStorage (khôi phục Date object)
export const loadFromCache = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized, (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
  } catch (e) {
    console.warn('Không thể đọc cache:', e);
    return null;
  }
};

// Xoá cache (khi user upload file mới)
export const clearCache = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const hasCachedData = () => !!localStorage.getItem(STORAGE_KEY);
