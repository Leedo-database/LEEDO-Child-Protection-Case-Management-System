import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  PieChart as PieChartIcon, 
  Users, 
  Building, 
  Send, 
  Home, 
  AlertTriangle,
  MapPin,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  CalendarRange
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { getDaysInShelter } from '../../utils/calculations';
import { LeedoLogo } from '../LeedoLogo';

type TimeRangePreset = '1m' | '3m' | '5m' | '6m' | '1y' | 'all' | 'custom';

export const ReportsView: React.FC = () => {
  const { children, shelters, language } = useApp();
  const [activeTab, setActiveTab] = useState<'management' | 'analytics'>('management');

  // Management Report Filters
  const [timePreset, setTimePreset] = useState<TimeRangePreset>('5m');
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedShelter, setSelectedShelter] = useState<string>('all');

  // Filter calculation
  const filteredCases = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date();

    if (timePreset === '1m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else if (timePreset === '3m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    } else if (timePreset === '5m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, now.getDate());
    } else if (timePreset === '6m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    } else if (timePreset === '1y') {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    } else if (timePreset === 'custom') {
      startDate = customStartDate ? new Date(customStartDate) : new Date(2000, 0, 1);
      endDate = customEndDate ? new Date(customEndDate) : new Date();
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(2000, 0, 1);
    }

    return children.filter((c) => {
      if (c.isArchived) return false;

      // Date check
      if (c.rescueDate) {
        const rDate = new Date(c.rescueDate);
        if (rDate < startDate || rDate > endDate) return false;
      }

      // Area check
      if (selectedArea !== 'all') {
        const areaLower = (c.area || '').toLowerCase();
        if (!areaLower.includes(selectedArea.toLowerCase())) return false;
      }

      // Shelter check
      if (selectedShelter !== 'all') {
        if (c.shelterName !== selectedShelter) return false;
      }

      return true;
    });
  }, [children, timePreset, customStartDate, customEndDate, selectedArea, selectedShelter]);

  // Statistics from filtered data
  const totalRescued = filteredCases.length;
  const boysCount = filteredCases.filter((c) => c.gender === 'Male').length;
  const girlsCount = filteredCases.filter((c) => c.gender === 'Female').length;
  const otherGenderCount = filteredCases.filter((c) => c.gender === 'Other').length;

  const reintegratedCount = filteredCases.filter((c) => c.caseStatus === 'Reintegrated').length;
  const govtReferralCount = filteredCases.filter((c) => c.caseStatus === 'Government Shelter Referral').length;
  const peaceHomeCount = filteredCases.filter((c) => c.shelterName === 'LEEDO Peace Home').length;
  const activeResidentsCount = filteredCases.filter((c) => c.currentShelterStatus === 'Active Resident').length;

  // Breakdown by requested 8 rescue areas
  const requestedAreas = ['Airport', 'Mirpur', 'Tejgaon', 'Rayer Bazar', 'Kamalapur', 'Sadarghat', 'Shambazar', 'Other'];
  const areaDistribution = requestedAreas.map((area) => {
    const count = filteredCases.filter((c) => {
      const a = (c.area || '').toLowerCase();
      if (area === 'Other') {
        return !requestedAreas.slice(0, 7).some(known => a.includes(known.toLowerCase()));
      }
      return a.includes(area.toLowerCase());
    }).length;
    return { area, count };
  });

  // Breakdown by shelters
  const shelterDistribution = shelters.map((s) => {
    const count = filteredCases.filter((c) => c.shelterName === s.name && c.currentShelterStatus === 'Active Resident').length;
    return { name: s.name, capacity: s.capacity, count, isGovt: s.isGovtShelter };
  });

  // Analytics tab general charts
  const activeChildren = children.filter((c) => !c.isArchived);
  const genderData = [
    { name: 'Male', value: activeChildren.filter((c) => c.gender === 'Male').length, color: '#2563eb' },
    { name: 'Female', value: activeChildren.filter((c) => c.gender === 'Female').length, color: '#ec4899' },
    { name: 'Other', value: activeChildren.filter((c) => c.gender === 'Other').length, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  const statusCounts: Record<string, number> = {};
  activeChildren.forEach((c) => {
    statusCounts[c.caseStatus] = (statusCounts[c.caseStatus] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    count,
  }));

  // Length of stay distribution
  let lessThan14 = 0;
  let between15And30 = 0;
  let between31And42 = 0;
  let moreThan42 = 0;

  activeChildren.forEach((c) => {
    const days = getDaysInShelter(c);
    if (days <= 14) lessThan14++;
    else if (days <= 30) between15And30++;
    else if (days <= 42) between31And42++;
    else moreThan42++;
  });

  const stayData = [
    { category: '1 - 14 Days', count: lessThan14, fill: '#10b981' },
    { category: '15 - 30 Days', count: between15And30, fill: '#3b82f6' },
    { category: '31 - 42 Days (Watch)', count: between31And42, fill: '#f59e0b' },
    { category: '> 42 Days (Alert)', count: moreThan42, fill: '#ef4444' },
  ];

  const handleExportCSV = () => {
    const headers = [
      'Child ID',
      'Name',
      'Gender',
      'Age',
      'Rescue Date',
      'Rescue Area',
      'Assigned Shelter',
      'Case Status',
      'GD Number',
      'Case Officer'
    ];
    
    const rows = filteredCases.map(c => [
      c.id,
      `"${c.name}"`,
      c.gender,
      c.estimatedAge,
      c.rescueDate,
      `"${c.area}"`,
      `"${c.shelterName}"`,
      `"${c.caseStatus}"`,
      `"${c.gdNumber || 'N/A'}"`,
      `"${c.assignedCaseWorker}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LEEDO_Management_Report_${timePreset}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintManagementReport = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header and Mode Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
              {language === 'bn' ? 'ম্যানেজমেন্ট মনিটরিং ও রিপোর্টিং' : 'Management Monitoring & Reporting'}
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Head Office Executive Console</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            {language === 'bn' ? 'লিডো সেন্ট্রাল ম্যানেজমেন্ট ও বিশ্লেষণ রিপোর্ট' : 'LEEDO Central Management & Statistical Reports'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'নির্দিষ্ট সময়কাল (১ মাস, ৩ মাস, ৫ মাস, ৬ মাস, ১ বছর বা কাস্টম তারিখ), রেসকিউ এলাকা ও শেল্টার ভিত্তিক পূর্ণাঙ্গ প্রতিবেদন'
              : 'Detailed management summaries filtered by custom date ranges, rescue hubs, and shelter residence.'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('management')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'management'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-4 h-4 text-rose-600" />
            <span>{language === 'bn' ? 'ম্যানেজমেন্ট রিপোর্ট (তারিখভিত্তিক)' : 'Management Report'}</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? 'ভিজ্যুয়াল চার্ট ও অ্যানালিটিক্স' : 'Charts & Analytics'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'management' ? (
        <div className="space-y-5">
          {/* Filter Bar (Excluded from Print) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 no-print">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {language === 'bn' ? 'তারিখ ও এরিয়া ফিল্টার নির্বাচন করুন' : 'Select Time Period & Criteria'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintManagementReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'bn' ? 'রিপোর্ট প্রিন্ট করুন' : 'Print Management Report'}</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{language === 'bn' ? 'সিএসভি ডাউনলোড' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            {/* Presets and Custom Ranges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1.5">
                  {language === 'bn' ? 'সময়কাল (Time Period):' : 'Time Period:'}
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setTimePreset('1m')}
                    className={`py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      timePreset === '1m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    1 Month
                  </button>
                  <button
                    onClick={() => setTimePreset('3m')}
                    className={`py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      timePreset === '3m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    3 Months
                  </button>
                  <button
                    onClick={() => setTimePreset('5m')}
                    className={`py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      timePreset === '5m' ? 'bg-[#E31B23] text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    5 Months
                  </button>
                  <button
                    onClick={() => setTimePreset('6m')}
                    className={`py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      timePreset === '6m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    6 Months
                  </button>
                  <button
                    onClick={() => setTimePreset('1y')}
                    className={`py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      timePreset === '1y' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    1 Year
                  </button>
                  <button
                    onClick={() => setTimePreset('custom')}
                    className={`py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      timePreset === 'custom' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Custom Date Pickers */}
              {timePreset === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">From Date:</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">To Date:</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Area Filter */}
              <div>
                <label className="block text-slate-600 font-bold mb-1.5">
                  {language === 'bn' ? 'রেসকিউ এলাকা ফিল্টার:' : 'Rescue Area Filter:'}
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="all">All Rescue Areas (সকল রেসকিউ এলাকা)</option>
                  <option value="Airport">Airport (বিমানবন্দর)</option>
                  <option value="Mirpur">Mirpur (মিরপুর)</option>
                  <option value="Tejgaon">Tejgaon (তেজগাঁও)</option>
                  <option value="Rayer Bazar">Rayer Bazar (রায়েরবাজার)</option>
                  <option value="Kamalapur">Kamalapur (কমলাপুর)</option>
                  <option value="Sadarghat">Sadarghat (সদরঘাট)</option>
                  <option value="Shambazar">Shambazar (শ্যামবাজার)</option>
                  <option value="Other">Other (অন্যান্য)</option>
                </select>
              </div>

              {/* Shelter Filter */}
              <div>
                <label className="block text-slate-600 font-bold mb-1.5">
                  {language === 'bn' ? 'শেল্টার ফিল্টার:' : 'Shelter Facility Filter:'}
                </label>
                <select
                  value={selectedShelter}
                  onChange={(e) => setSelectedShelter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="all">All Facilities (সকল শেল্টার)</option>
                  {shelters.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.isGovtShelter ? '(Govt)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Printable Official Executive Report Container */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm print:p-0 print:border-none" id="management-report-document">
            {/* Report Header for Print / Official Display */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <LeedoLogo size="lg" variant="horizontal" />
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 uppercase">
                      LEEDO Child Protection - Executive Management Report
                    </h2>
                    <p className="text-xs font-semibold text-rose-600">
                      লিডো কেন্দ্রীয় ব্যবস্থাপনা প্রতিবেদন • রেসকিউ পরিসংখ্যান ও অবস্থান ট্র্যাকিং
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Period: <strong>{timePreset.toUpperCase()}</strong> &bull; Area: <strong>{selectedArea}</strong> &bull; Shelter: <strong>{selectedShelter}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-600 shrink-0">
                  <div className="font-bold text-slate-900">Official Dossier</div>
                  <div>Generated: {new Date().toLocaleDateString('en-GB')}</div>
                  <div className="font-mono text-[11px] text-emerald-700 font-bold">Records Found: {totalRescued}</div>
                </div>
              </div>
            </div>

            {/* Executive KPIs Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Rescues</span>
                <span className="text-2xl font-bold text-slate-900 font-display">{totalRescued}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{boysCount} Boys &bull; {girlsCount} Girls</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Active Residents</span>
                <span className="text-2xl font-bold text-emerald-900 font-display">{activeResidentsCount}</span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">In LEEDO Care</span>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Reintegrated</span>
                <span className="text-2xl font-bold text-blue-900 font-display">{reintegratedCount}</span>
                <span className="text-[10px] text-blue-700 block mt-0.5">Returned to Family</span>
              </div>

              <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Govt. Referrals</span>
                <span className="text-2xl font-bold text-purple-900 font-display">{govtReferralCount}</span>
                <span className="text-[10px] text-purple-700 block mt-0.5">Statutory Homes</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Peace Home Care</span>
                <span className="text-2xl font-bold text-amber-900 font-display">{peaceHomeCount}</span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Long-Term Sanctuary</span>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Over 42 Days</span>
                <span className="text-2xl font-bold text-rose-900 font-display">
                  {filteredCases.filter(c => getDaysInShelter(c) > 42).length}
                </span>
                <span className="text-[10px] text-rose-700 block mt-0.5">Action Mandatory</span>
              </div>
            </div>

            {/* Dual Grid: Area Breakdown & Shelter Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* Area Breakdown */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#E31B23] mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'রেসকিউ এলাকা ভিত্তিক বণ্টন (Rescue Hub Distribution)' : 'Rescue Hub Distribution'}</span>
                </h3>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                      <th className="pb-2">Rescue Area Hub</th>
                      <th className="pb-2 text-right">Children Rescued</th>
                      <th className="pb-2 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {areaDistribution.map((item) => {
                      const pct = totalRescued > 0 ? Math.round((item.count / totalRescued) * 100) : 0;
                      return (
                        <tr key={item.area}>
                          <td className="py-1.5 font-semibold text-slate-800">{item.area}</td>
                          <td className="py-1.5 text-right font-bold text-slate-900">{item.count}</td>
                          <td className="py-1.5 text-right text-slate-500 font-mono text-[11px]">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Shelter Breakdown */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#E31B23] mb-3 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'শেল্টার অনুযায়ী বর্তমান আবাসিক সংখ্যা (Shelter Occupancy)' : 'Shelter Active Occupancy'}</span>
                </h3>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                      <th className="pb-2">Facility Name</th>
                      <th className="pb-2 text-right">Capacity</th>
                      <th className="pb-2 text-right">Residents</th>
                      <th className="pb-2 text-right">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shelterDistribution.map((s) => {
                      const occ = Math.round((s.count / s.capacity) * 100);
                      return (
                        <tr key={s.name}>
                          <td className="py-1.5 font-semibold text-slate-800">
                            {s.name} {s.isGovt ? <span className="text-[10px] text-blue-600 font-bold">(Govt)</span> : ''}
                          </td>
                          <td className="py-1.5 text-right text-slate-500">{s.capacity} beds</td>
                          <td className="py-1.5 text-right font-bold text-slate-900">{s.count}</td>
                          <td className="py-1.5 text-right text-slate-500 font-mono text-[11px]">{occ}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Matching Children Cases Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  {language === 'bn' ? 'নির্বাচিত মানদণ্ডের অন্তর্ভুক্ত কেস তালিকা (Case Roster)' : 'Matching Case Roster'}
                </h3>
                <span className="text-[11px] text-slate-500">{filteredCases.length} Cases Listed</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Child Name</th>
                      <th className="p-2.5">Gender / Age</th>
                      <th className="p-2.5">Rescue Date</th>
                      <th className="p-2.5">Area Hub</th>
                      <th className="p-2.5">Current Facility</th>
                      <th className="p-2.5">Case Status</th>
                      <th className="p-2.5">Case Officer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCases.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-slate-900 text-[11px]">{c.id}</td>
                        <td className="p-2.5 font-bold text-slate-800">{c.name}</td>
                        <td className="p-2.5 text-slate-600">{c.gender}, {c.estimatedAge}y</td>
                        <td className="p-2.5 font-mono text-[11px]">{c.rescueDate}</td>
                        <td className="p-2.5">{c.area}</td>
                        <td className="p-2.5 font-medium">{c.shelterName}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.caseStatus === 'Reintegrated' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.caseStatus === 'Government Shelter Referral'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.caseStatus}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">{c.assignedCaseWorker}</td>
                      </tr>
                    ))}
                    {filteredCases.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          {language === 'bn' ? 'নির্বাচিত ফিল্টারে কোনো কেস পাওয়া যায়নি।' : 'No cases match the selected timeframe and filter criteria.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Report Sign-off Section */}
            <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 pb-8 mb-2"></div>
                <div className="font-bold text-slate-900">Program Coordinator</div>
                <div className="text-[10px] text-slate-500">LEEDO Street to Home Initiative</div>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-8 mb-2"></div>
                <div className="font-bold text-slate-900">Md. Sohel Rana</div>
                <div className="text-[10px] text-slate-500">Manager & Head of Peace Home</div>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-8 mb-2"></div>
                <div className="font-bold text-slate-900">Forhad Hossain</div>
                <div className="text-[10px] text-slate-500">Executive Director, LEEDO</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Visual Analytics Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Gender Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-rose-600" />
                <span>Gender Segregation Ratio</span>
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Length of Stay Safeguard */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>6-Week Case Management Duration Compliance</span>
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stayData}>
                    <XAxis dataKey="category" textAnchor="middle" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {stayData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
