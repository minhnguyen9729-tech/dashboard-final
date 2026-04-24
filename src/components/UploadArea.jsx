// ============================================================
// UploadArea — Khu vực kéo thả file Excel
// ============================================================
import { useState, useCallback } from 'react';
import './UploadArea.css';

const UploadArea = ({ onFileLoaded, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      onError('Chỉ chấp nhận file Excel (.xlsx, .xls)');
      return;
    }
    setIsLoading(true);
    try {
      await onFileLoaded(file);
    } catch (err) {
      onError(err.message || 'Lỗi khi đọc file');
    } finally {
      setIsLoading(false);
    }
  }, [onFileLoaded, onError]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleInputChange = (e) => handleFile(e.target.files[0]);

  return (
    <div className={`upload-area ${isDragging ? 'dragging' : ''} ${isLoading ? 'loading' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isLoading ? (
        <div className="upload-loading">
          <div className="spinner" />
          <p>Đang phân tích dữ liệu...</p>
        </div>
      ) : (
        <>
          <div className="upload-icon">📊</div>
          <h3>Kéo thả file Excel vào đây</h3>
          <p>hoặc</p>
          <label className="upload-btn">
            <input type="file" accept=".xlsx,.xls" onChange={handleInputChange} hidden />
            Chọn file từ máy
          </label>
          <span className="upload-hint">Hỗ trợ định dạng .xlsx, .xls</span>
        </>
      )}
    </div>
  );
};

export default UploadArea;
