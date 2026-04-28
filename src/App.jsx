// ============================================================
// App.jsx — Entry point chính, quản lý state & điều phối luồng
// ============================================================
import { useState, useMemo, useEffect } from 'react';
import './assets/css/base.css';
import './App.css';

import { parseExcelFile } from './utils/excelParser';
import { calcLeadKPIs, calcTacNghiepKPIs, calcSaleKPIs, calcInsightKPIs } from './utils/kpiEngine';

import KpiCards from './components/KpiCards';
import FunnelChart from './components/Charts/FunnelChart';
import TeamQualityChart from './components/Charts/TeamQualityChart';
import SaleLeaderboard from './components/Charts/SaleLeaderboard';
import HeatmapChart from './components/Charts/HeatmapChart';
import CustomerInsights from './components/Charts/CustomerInsights';

// URL xuất CSV từ Google Sheets của bạn
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTN99GeMRYhJdG2Upn6DkoSX9iUwrgGOmfFdvGbzew7cvprqwh-OxZ0PMNBzu4zgg/pub?gid=1620005940&single=true&output=csv';

// --- Bộ lọc ngày ---
const filterByDate = (data, from, to) => {
  if (!from && !to) return data;
  return data.filter((d) => {
    if (!d.ngayDataVe) return false;
    const dt = new Date(d.ngayDataVe);
    if (isNaN(dt)) return false;
    const t = dt.getTime();
    if (from && t < new Date(from).getTime()) return false;
    if (to && t > new Date(to + 'T23:59:59').getTime()) return false;
    return true;
  });
};

// --- Bộ lọc Team/Sale ---
const filterByTeamSale = (data, team, sale) => {
  let result = data;
  if (team) result = result.filter((d) => d.team === team);
  if (sale) result = result.filter((d) => d.sale === sale);
  return result;
};

function App() {
  const [rawData, setRawData] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fileName, setFileName] = useState('Google Sheets (Live)');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterSale, setFilterSale] = useState('');

  const hasData = rawData.length > 0;

  // --- Auto Fetch from Google Sheets ---
  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setIsLoading(true);
        // Kéo dữ liệu từ Google Sheets
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) throw new Error('Không thể tải dữ liệu từ Google Sheets. Có thể link đã bị lỗi.');
        
        // Chuyển đổi dữ liệu tải về thành Blob để thư viện Excel đọc được
        const blob = await response.blob();
        
        // Sử dụng lại hàm phân tích logic cũ (nó cũng đọc được CSV blob)
        const parsed = await parseExcelFile(blob);
        setRawData(parsed);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Lỗi khi tải dữ liệu từ Google Sheets.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  const handleRefresh = () => {
    setRawData([]);
    setError('');
    setIsLoading(true);
    // Bằng cách đổi key hoặc trigger reload, ở đây đơn giản reload lại trang
    window.location.reload();
  };

  // --- Filtered data ---
  const filteredData = useMemo(() => {
    let d = filterByDate(rawData, filterFrom, filterTo);
    d = filterByTeamSale(d, filterTeam, filterSale);
    return d;
  }, [rawData, filterFrom, filterTo, filterTeam, filterSale]);

  // --- KPIs (memoised) ---
  const leadKPIs = useMemo(() => filteredData.length ? calcLeadKPIs(filteredData) : null, [filteredData]);
  const tacNghiepKPIs = useMemo(() => filteredData.length ? calcTacNghiepKPIs(filteredData) : null, [filteredData]);
  const saleKPIs = useMemo(() => filteredData.length ? calcSaleKPIs(filteredData) : null, [filteredData]);
  const insightKPIs = useMemo(() => filteredData.length ? calcInsightKPIs(filteredData) : null, [filteredData]);

  // Danh sách Sale duy nhất để dropdown lọc
  const allTeams = [...new Set(rawData.map((d) => d.team))].filter(Boolean).sort();
  const allSales = [...new Set(rawData.filter((d) => !filterTeam || d.team === filterTeam).map((d) => d.sale))].filter(Boolean).sort();

  return (
    <div className="app">
      {/* ===== HEADER ===== */}
      <header className="app-header">
        <div className="app-header__left">
          <span className="app-logo">📊</span>
          <div>
            <h1 className="app-title">Lead Analytics Dashboard</h1>
            <p className="app-subtitle">
              {hasData ? `${filteredData.length.toLocaleString('vi-VN')} / ${rawData.length.toLocaleString('vi-VN')} leads · ${fileName}` : 'Chưa có dữ liệu'}
            </p>
          </div>
        </div>

        {hasData && (
          <div className="app-header__controls">
            <input type="date" className="filter-input" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} title="Từ ngày" />
            <input type="date" className="filter-input" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} title="Đến ngày" />
            <select className="filter-input" value={filterTeam} onChange={(e) => { setFilterTeam(e.target.value); setFilterSale(''); }}>
              <option value="">Tất cả Team</option>
              {allTeams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="filter-input" value={filterSale} onChange={(e) => setFilterSale(e.target.value)}>
              <option value="">Tất cả Sale</option>
              {allSales.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn-clear" onClick={handleRefresh}>🔄 Cập nhật dữ liệu</button>
          </div>
        )}
      </header>

      {/* ===== ERROR ===== */}
      {error && <div className="app-error">⚠️ {error}</div>}

      {/* ===== MAIN CONTENT ===== */}
      <main className="app-main">
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#94a3b8' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 16 }}></div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>Đang đồng bộ dữ liệu từ Google Sheets...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !hasData ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>
            {error ? 'Không thể tải dữ liệu.' : 'File Google Sheets đang trống hoặc cấu trúc không hợp lệ.'}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <KpiCards leadKPIs={leadKPIs} tacNghiepKPIs={tacNghiepKPIs} saleKPIs={saleKPIs} />

            {/* Row 1: Phễu */}
            <div className="fade-up fade-up-1">
              <FunnelChart funnelData={tacNghiepKPIs?.funnelData || {}} total={filteredData.length} />
            </div>

            {/* Row 2: Customer Insights */}
            <div className="fade-up fade-up-2">
              <CustomerInsights insightKPIs={insightKPIs} />
            </div>

            {/* Row 3: Chất lượng tác nghiệp */}
            <div className="fade-up fade-up-3">
              <TeamQualityChart tacNghiepKPIs={tacNghiepKPIs} teamList={saleKPIs?.teamList} total={filteredData.length} />
            </div>

            {/* Row 4: Leaderboard L2+ */}
            <div className="fade-up fade-up-4">
              <SaleLeaderboard saleList={saleKPIs?.saleList} />
            </div>

            {/* Row 5: Heatmap */}
            <div className="fade-up" style={{ animationDelay: '0.5s' }}>
              <HeatmapChart heatmapData={tacNghiepKPIs?.heatmapData} hourlyDist={tacNghiepKPIs?.hourlyDist} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
