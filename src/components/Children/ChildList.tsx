import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Building2, 
  Download, 
  Printer, 
  AlertTriangle, 
  User, 
  ChevronRight, 
  Clock, 
  FileSpreadsheet, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDaysInShelter, getSixWeekAlertStatus } from '../../utils/calculations';
import { CaseStatus, Gender } from '../../types';

interface ChildListProps {
  onOpenRegisterModal: () => void;
  onSelectChild: (childId: string) => void;
}

export const ChildList: React.FC<ChildListProps> = ({
  onOpenRegisterModal,
  onSelectChild,
}) => {
  const { children, shelters, currentUser, branchFilter, setBranchFilter, language } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShelter, setSelectedShelter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSixWeek, setSelectedSixWeek] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [minAge, setMinAge] = useState<number | ''>('');
  const [maxAge, setMaxAge] = useState<number | ''>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filtered children memo
  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      if (child.isArchived) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = child.name.toLowerCase().includes(q);
        const matchesId = child.id.toLowerCase().includes(q);
        const matchesNick = child.nickname?.toLowerCase().includes(q);
        const matchesGd = child.gdNumber?.toLowerCase().includes(q);
        const matchesArea = child.area.toLowerCase().includes(q);
        const matchesFather = child.familyTracing?.fatherName?.toLowerCase().includes(q);
        const matchesWorker = child.assignedCaseWorker.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesNick && !matchesGd && !matchesArea && !matchesFather && !matchesWorker) {
          return false;
        }
      }

      // Shelter
      if (selectedShelter !== 'all' && child.shelterName !== selectedShelter) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && child.caseStatus !== selectedStatus) {
        return false;
      }

      // 6-Week Status
      if (selectedSixWeek !== 'all') {
        const sixWeek = getSixWeekAlertStatus(child);
        if (selectedSixWeek === 'over' && sixWeek.status !== 'exceeded') return false;
        if (selectedSixWeek === 'approaching' && sixWeek.status !== 'approaching') return false;
        if (selectedSixWeek === 'normal' && sixWeek.status !== 'normal') return false;
      }

      // Gender
      if (selectedGender !== 'all' && child.gender !== selectedGender) {
        return false;
      }

      // Area
      if (selectedArea !== 'all' && !child.area.includes(selectedArea)) {
        return false;
      }

      // Age range
      if (minAge !== '' && child.estimatedAge < minAge) return false;
      if (maxAge !== '' && child.estimatedAge > maxAge) return false;

      return true;
    });
  }, [
    children, 
    searchQuery, 
    selectedShelter, 
    selectedStatus, 
    selectedSixWeek, 
    selectedGender, 
    selectedArea, 
    minAge, 
    maxAge
  ]);

  // Count active filters
  const activeFilterCount = [
    selectedShelter !== 'all',
    selectedStatus !== 'all',
    selectedSixWeek !== 'all',
    selectedGender !== 'all',
    selectedArea !== 'all',
    minAge !== '',
    maxAge !== '',
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSelectedShelter('all');
    setSelectedStatus('all');
    setSelectedSixWeek('all');
    setSelectedGender('all');
    setSelectedArea('all');
    setMinAge('');
    setMaxAge('');
    setSearchQuery('');
  };

  const handleExportCSV = () => {
    const headers = ['Child ID', 'Name', 'Gender', 'Age', 'Shelter', 'Days in Shelter', 'Case Status', 'Rescue Date', 'Rescue Area', 'Police GD', 'Case Worker'];
    const rows = filteredChildren.map((c) => [
      c.id,
      `"${c.name}"`,
      c.gender,
      c.estimatedAge,
      `"${c.shelterName}"`,
      getDaysInShelter(c),
      `"${c.caseStatus}"`,
      c.rescueDate,
      `"${c.area}"`,
      `"${c.gdNumber || ''}"`,
      `"${c.assignedCaseWorker}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LEEDO_Child_Cases_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
              Directory
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">One Child = One Permanent ID</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Children & Case Management Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Managing {children.filter(c => !c.isArchived).length} registered children across all protection lifecycles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="px-3 sm:px-4 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Rescue</span>
          </button>
        </div>
      </div>

      {/* Role-Based Location Segregation Indicator */}
      {(currentUser.role === 'Rescue Worker / Outpost Staff' || currentUser.role === 'Rescue Worker / SUS Staff') && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-amber-900 uppercase tracking-wide">
              {currentUser.assignedArea || 'SUS'} Rescue Unit Scope:
            </span>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              As an outreach rescue worker for <strong>{currentUser.assignedArea || 'your assigned area'}</strong>, your directory displays children rescued from this SUS center. You can monitor their assigned transitional shelter (Kamalapur / Kadamtali) or long-term residence (LEEDO Peace Home), current case status, and well-being.
            </p>
          </div>
        </div>
      )}

      {currentUser.role === 'Shelter Staff' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
          <div className="p-2 bg-blue-100 rounded-xl text-blue-800 shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-blue-900 uppercase tracking-wide">
              Transitional Shelter Staff Scope ({currentUser.assignedShelter || 'Kamalapur / Kadamtali'}):
            </span>
            <p className="text-blue-800 mt-0.5 leading-relaxed">
              You are viewing children admitted to <strong>{currentUser.assignedShelter}</strong>. If a child has completed 6 weeks without family tracing or govt referral options, you can initiate referral & transfer to <strong>LEEDO Peace Home</strong> for long-term care up to 17 years old.
            </p>
          </div>
        </div>
      )}

      {currentUser.role === 'Peace Home Staff' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800 shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-emerald-900 uppercase tracking-wide">
              LEEDO Peace Home Sanctuary Scope (Up to 17 Years Old):
            </span>
            <p className="text-emerald-800 mt-0.5 leading-relaxed">
              You are managing active residents in <strong>LEEDO Peace Home</strong> who have been placed in long-term organizational guardianship after transitional shelter care. Manage their health, counseling, schooling, and vocational training.
            </p>
          </div>
        </div>
      )}

      {/* Super Admin, Program Coordinator & Head Office Branch Switcher */}
      {(currentUser.role === 'Super Admin' || currentUser.role === 'Head Office Staff' || currentUser.role === 'Program Coordinator') && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-700 mr-1">Facility / Branch View:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Operations' },
              { id: 'Kamalapur Shelter', label: 'Kamalapur Shelter' },
              { id: 'Kadamtali Shelter', label: 'Kadamtali Shelter' },
              { id: 'LEEDO Peace Home', label: 'LEEDO Peace Home (Up to 17y)' },
              { id: 'Airport', label: 'Airport SUS' },
              { id: 'Mirpur', label: 'Mirpur SUS' },
              { id: 'Tejgaon', label: 'Tejgaon SUS' },
              { id: 'Rayerbazar', label: 'Rayerbazar SUS' },
              { id: 'Kamalapur', label: 'Kamalapur SUS' },
              { id: 'Sadarghat', label: 'Sadarghat SUS' },
              { id: 'Shambazar', label: 'Shambazar SUS' },
            ].map((branch) => {
              const isActive = branchFilter === branch.id;
              return (
                <button
                  key={branch.id}
                  onClick={() => setBranchFilter(branch.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {branch.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Child ID (LEEDO-2026-0001), name, GD number, area, parent..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Shelter Filter */}
          <select
            value={selectedShelter}
            onChange={(e) => setSelectedShelter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-rose-500 bg-white"
          >
            <option value="all">All Shelters (Both)</option>
            <option value="Kamalapur Shelter">Kamalapur Shelter</option>
            <option value="Kadamtali Shelter">Kadamtali Shelter</option>
          </select>

          {/* Quick Case Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-rose-500 bg-white"
          >
            <option value="all">All Case Statuses</option>
            <option value="New Rescue">New Rescue</option>
            <option value="In Shelter Care">In Shelter Care</option>
            <option value="Family Tracing">Family Tracing</option>
            <option value="Ready for Reintegration">Ready for Reintegration</option>
            <option value="Reintegrated">Reintegrated</option>
            <option value="Government Shelter Referral">Government Referral</option>
            <option value="Left Without Notice">Left Without Notice</option>
          </select>

          {/* 6-Week Filter */}
          <select
            value={selectedSixWeek}
            onChange={(e) => setSelectedSixWeek(e.target.value)}
            className={`px-3 py-2 text-xs border rounded-xl font-bold focus:ring-2 focus:ring-rose-500 ${
              selectedSixWeek === 'over' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="all">6-Week Safeguard: All</option>
            <option value="over">&gt; 6 Weeks Exceeded (Alert)</option>
            <option value="approaching">Approaching 6 Weeks</option>
            <option value="normal">Normal Stay (&lt; 35 Days)</option>
          </select>

          {/* Advanced Filter Drawer Trigger */}
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
              activeFilterCount > 0
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#E31B23] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Advanced Filter Drawer */}
        {filterDrawerOpen && (
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Gender</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Rescue Hub / Area</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="all">All Rescue Areas (সকল এলাকা)</option>
                <option value="Airport">Airport</option>
                <option value="Mirpur">Mirpur</option>
                <option value="Tejgaon">Tejgaon</option>
                <option value="Rayer Bazar">Rayer Bazar</option>
                <option value="Kamalapur">Kamalapur</option>
                <option value="Sadarghat">Sadarghat</option>
                <option value="Shambazar">Shambazar</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Age Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FILTER RESULTS STATS */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <div>
          Showing <strong>{filteredChildren.length}</strong> of {children.filter(c => !c.isArchived).length} child cases
          {activeFilterCount > 0 && <span className="text-rose-600 font-semibold ml-1">(filtered)</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
              viewMode === 'table' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
              viewMode === 'grid' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Card Grid
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Child ID & Name</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Rescue Info & GD</th>
                  <th className="py-3 px-4">Shelter & Days</th>
                  <th className="py-3 px-4">6-Wk Status</th>
                  <th className="py-3 px-4">Case Status</th>
                  <th className="py-3 px-4">Tracing Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredChildren.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                      No children match the current search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredChildren.map((child) => {
                    const days = getDaysInShelter(child);
                    const sixWeek = getSixWeekAlertStatus(child);

                    return (
                      <tr key={child.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={child.photoUrl}
                              alt={child.name}
                              className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <button
                                onClick={() => onSelectChild(child.id)}
                                className="font-bold text-slate-900 hover:text-rose-600 text-left cursor-pointer"
                              >
                                {child.name}
                              </button>
                              {child.nickname && <div className="text-[11px] text-slate-500">"{child.nickname}"</div>}
                              <div className="font-mono text-[11px] text-slate-500">{child.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{child.estimatedAge}y</span> &bull; {child.gender}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{child.area}</div>
                          <div className="text-[11px] text-slate-500">{child.rescueDate} &bull; {child.gdNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{child.shelterName}</div>
                          <div className="text-[11px] text-slate-500">{days} days stay</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 text-[11px] rounded-md border ${sixWeek.badgeClass}`}>
                            {sixWeek.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            {child.caseStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            child.familyTracing.tracingStatus === 'Family Located' 
                              ? 'bg-emerald-100 text-emerald-800 font-bold' 
                              : 'text-slate-600'
                          }`}>
                            {child.familyTracing.tracingStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onSelectChild(child.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-[#E31B23] hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Profile</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredChildren.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <p className="font-semibold text-slate-600 text-sm">
            {language === 'bn' ? 'কোনো শিশু কেস পাওয়া যায়নি' : 'No children match the current search or filter criteria'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'bn' ? 'নতুন শিশু উদ্ধার রেকর্ড করতে উপরে "+ New Rescue" বাটনে ক্লিক করুন।' : 'Click "+ New Rescue" above to register a newly rescued child.'}
          </p>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredChildren.map((child) => {
            const days = getDaysInShelter(child);
            const sixWeek = getSixWeekAlertStatus(child);

            return (
              <div
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={child.photoUrl}
                      alt={child.name}
                      className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{child.id}</span>
                      <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-rose-600">
                        {child.name}
                      </h3>
                      <div className="text-xs text-slate-500">
                        {child.gender}, ~{child.estimatedAge} yrs
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shelter:</span>
                      <span className="font-medium text-slate-800">{child.shelterName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Length of Stay:</span>
                      <span className="font-bold text-slate-900">{days} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rescue Area:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[140px]">{child.area}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[11px] px-2 py-0.5 rounded border ${sixWeek.badgeClass}`}>
                    {sixWeek.label}
                  </span>
                  <span className="text-xs font-bold text-[#E31B23] flex items-center gap-0.5">
                    View Case &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
