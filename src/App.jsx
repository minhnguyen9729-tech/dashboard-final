// ============================================================
// App.jsx — Entry point chính, quản lý state & điều phối luồng
// ============================================================
import { useState, useMemo, useCallback } from 'react';
import './assets/css/base.css';
import './App.css';

import { parseExcelFile } from './utils/excelParser';
import { calcLeadKPIs, calcTacNghiepKPIs, calcSaleKPIs, calcInsightKPIs } from './utils/kpiEngine';
import { saveToCache, loadFromCache, clearCache } from './utils/storage';

import UploadArea from './components/UploadArea';
import KpiCards from './components/KpiCards';
import FunnelChart from './components/Charts/FunnelChart';
import TeamQualityChart from './components/Charts/TeamQualityChart';
import SaleLeaderboard from './components/Charts/SaleLeaderboard';
import HeatmapChart from './components/Charts/HeatmapChart';
import CustomerInsights from './components/Charts/CustomerInsights';

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
  const [rawData, setRawData] = useState(() => loadFromCache() || []);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterSale, setFilterSale] = useState('');

  const hasData = rawData.length > 0;

  // --- Upload handler ---
  const handleFileLoaded = useCallback(async (file) => {
    setError('');
    const parsed = await parseExcelFile(file);
    setRawData(parsed);
    saveToCache(parsed);
    setFileName(file.name);
    setFilterFrom('');
    setFilterTo('');
    setFilterTeam('');
    setFilterSale('');
  }, []);

  const handleClear = () => {
    clearCache();
    setRawData([]);
    setFileName('');
    setError('');
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
            <button className="btn-clear" onClick={handleClear}>🗑 Xoá dữ liệu</button>
          </div>
        )}
      </header>

      {/* ===== ERROR ===== */}
      {error && <div className="app-error">⚠️ {error}</div>}

      {/* ===== MAIN CONTENT ===== */}
      <main className="app-main">
        {!hasData ? (
          <UploadArea onFileLoaded={handleFileLoaded} onError={setError} />
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
