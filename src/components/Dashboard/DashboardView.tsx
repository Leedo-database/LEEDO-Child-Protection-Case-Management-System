import React, { useState } from 'react';
import { 
  Users, 
  Home, 
  HeartHandshake, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Building, 
  Calendar, 
  UserCheck, 
  ArrowRight,
  ShieldCheck,
  Send,
  AlertOctagon,
  FileCheck2,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDaysInShelter, getSixWeekAlertStatus, getHealthAlert, getCounselingAlert, getNextPendingFollowUp } from '../../utils/calculations';
import { Child } from '../../types';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    children, 
    shelters, 
    vtcStudents,
    susSessions,
    setSelectedChildId, 
    setActiveView,
    language,
    t
  } = useApp();

  // Role perspective switcher for testing
  const [dashboardFilter, setDashboardFilter] = useState<'auto' | 'management' | 'kamalapur' | 'kadamtali' | 'field'>('auto');

  // Active perspective
  const effectivePerspective = dashboardFilter === 'auto'
    ? currentUser.role === 'Shelter Staff'
      ? currentUser.assignedShelter === 'Kadamtali Shelter' ? 'kadamtali' : 'kamalapur'
      : currentUser.role === 'Field Officer / Case Worker'
      ? 'field'
      : 'management'
    : dashboardFilter;

  // Filter children based on perspective
  const visibleChildren = children.filter((child) => {
    if (child.isArchived) return false;

    if (effectivePerspective === 'kamalapur') {
      return child.shelterName === 'Kamalapur Shelter';
    }
    if (effectivePerspective === 'kadamtali') {
      return child.shelterName === 'Kadamtali Shelter';
    }
    if (effectivePerspective === 'field') {
      // Show children assigned to current officer or their area
      return child.assignedCaseWorker === currentUser.name || child.area.includes('Sadarghat') || child.area.includes('Kamalapur');
    }
    return true; // Management / Head office sees all
  });

  // Calculate high-level KPIs
  const totalActive = visibleChildren.length;
  const inShelters = visibleChildren.filter((c) => c.currentShelterStatus === 'Active Resident');
  const kamalapurCount = visibleChildren.filter((c) => c.shelterName === 'Kamalapur Shelter' && c.currentShelterStatus === 'Active Resident').length;
  const kadamtaliCount = visibleChildren.filter((c) => c.shelterName === 'Kadamtali Shelter' && c.currentShelterStatus === 'Active Resident').length;
  
  const underTracing = visibleChildren.filter((c) => c.caseStatus === 'Family Tracing');
  const familiesLocated = visibleChildren.filter((c) => c.familyTracing.tracingStatus === 'Family Located');
  const readyForReintegration = visibleChildren.filter((c) => c.caseStatus === 'Ready for Reintegration');
  const alreadyReintegrated = visibleChildren.filter((c) => c.caseStatus === 'Reintegrated');
  const govtReferrals = visibleChildren.filter((c) => c.caseStatus === 'Government Shelter Referral' || c.caseStatus === 'Referral Follow-up');
  const leftWithoutNotice = visibleChildren.filter((c) => c.caseStatus === 'Left Without Notice');

  // 6-Week calculation
  const over6WeeksChildren = visibleChildren.filter((c) => {
    const alert = getSixWeekAlertStatus(c);
    return alert.status === 'exceeded';
  });

  const approaching6WeeksChildren = visibleChildren.filter((c) => {
    const alert = getSixWeekAlertStatus(c);
    return alert.status === 'approaching';
  });

  // Health and Counseling upcoming
  const healthDueChildren = visibleChildren.filter((c) => {
    const alert = getHealthAlert(c);
    return alert?.isDue;
  });

  const counselingDueChildren = visibleChildren.filter((c) => {
    const alert = getCounselingAlert(c);
    return alert?.isDue;
  });

  // Follow-up pending/overdue
  const overdueFollowUps: { child: Child; message: string }[] = [];
  visibleChildren.forEach((c) => {
    const fu = getNextPendingFollowUp(c);
    if (fu?.isOverdue) {
      overdueFollowUps.push({ child: c, message: `${fu.type} follow-up overdue` });
    }
  });

  const handleOpenChild = (childId: string) => {
    setSelectedChildId(childId);
    setActiveView('child-profile');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Perspective switcher */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {language === 'bn' ? 'কার্যক্রম ওভারভিউ' : 'Operational Overview'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'bn' ? 'লিডো চাইল্ড প্রটেকশন ম্যানেজমেন্ট সিস্টেম (সিপিএমএস)' : 'LEEDO Child Protection System'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-display">
              {effectivePerspective === 'management' && (language === 'bn' ? 'হেড অফিস ও ব্যবস্থাপনা ড্যাশবোর্ড' : 'Head Office & Management Dashboard')}
              {effectivePerspective === 'kamalapur' && (language === 'bn' ? 'কমলাপুর ট্রানজিট শেল্টার ড্যাশবোর্ড (ধারণক্ষমতা: ৩০)' : 'Kamalapur Shelter Dashboard (Cap: 30)')}
              {effectivePerspective === 'kadamtali' && (language === 'bn' ? 'কদমতলী ড্রপ-ইন সেন্টার ড্যাশবোর্ড (ধারণক্ষমতা: ৩০)' : 'Kadamtali Shelter Dashboard (Cap: 30)')}
              {effectivePerspective === 'field' && (language === 'bn' ? 'মাঠকর্মী ও কেস ওয়ার্কার ড্যাশবোর্ড' : 'Field Officer & Case Worker Dashboard')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {language === 'bn' ? (
                <>লগইন করেছেন: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})। রিয়েল-টাইম শিশু সুরক্ষা ও ৬-সপ্তাহ শেল্টার সেফগার্ড।</>
              ) : (
                <>Logged in as <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role}). Real-time case journey tracking & 6-week shelter safeguards.</>
              )}
            </p>
          </div>

          {/* Perspective Selector for demonstration */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs overflow-x-auto">
            <button
              onClick={() => setDashboardFilter('management')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                effectivePerspective === 'management'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'হেড অফিস' : 'Head Office'}
            </button>
            <button
              onClick={() => setDashboardFilter('kamalapur')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                effectivePerspective === 'kamalapur'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'কমলাপুর (৩০)' : 'Kamalapur (30)'}
            </button>
            <button
              onClick={() => setDashboardFilter('kadamtali')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                effectivePerspective === 'kadamtali'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'কদমতলী (৩০)' : 'Kadamtali (30)'}
            </button>
            <button
              onClick={() => setDashboardFilter('field')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                effectivePerspective === 'field'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'bn' ? 'আমার কেসসমূহ' : 'My Assigned Cases'}
            </button>
          </div>
        </div>
      </div>

      {/* CRITICAL 6-WEEK ALERT BANNER (As strictly specified in Requirement #9) */}
      {over6WeeksChildren.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-rose-900 font-display">
                  Urgent 6-Week Shelter Stay Safeguard Alert ({over6WeeksChildren.length} Case)
                </h3>
                <span className="text-xs bg-rose-200 text-rose-900 px-2.5 py-0.5 rounded-full font-bold">
                  Action Required
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-800 mt-1">
                LEEDO Child Protection Safeguards mandate that temporary shelter stays must not exceed 42 days without an emergency case conference for family reintegration or formal statutory referral.
              </p>

              {/* List of children over 6 weeks */}
              <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3">
                {over6WeeksChildren.map((c) => {
                  const daysInShelter = getDaysInShelter(c);
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleOpenChild(c.id)}
                      className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={c.photoUrl}
                          alt={c.name}
                          className="w-12 h-12 rounded-lg object-cover ring-2 ring-rose-400"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-900">{c.id}</span>
                            <span className="text-xs text-slate-500">({c.gender}, {c.estimatedAge}y)</span>
                          </div>
                          <div className="font-bold text-sm text-slate-900 truncate group-hover:text-rose-600 transition-colors">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {c.shelterName} &bull; Case Worker: {c.assignedCaseWorker}
                          </div>
                        </div>
                      </div>
                      <div className="text-right pl-3">
                        <span className="inline-block px-2 py-1 bg-rose-100 text-rose-800 text-xs font-extrabold rounded-md">
                          {daysInShelter} Days
                        </span>
                        <div className="text-[10px] text-rose-600 font-semibold mt-1">
                          +{daysInShelter - 42}d overdue
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approaching 6 weeks banner */}
      {approaching6WeeksChildren.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-semibold text-xs sm:text-sm text-amber-900">
                Approaching 6-Week Threshold ({approaching6WeeksChildren.length} child):
              </span>{' '}
              <span className="text-xs text-amber-800">
                {approaching6WeeksChildren.map(c => `${c.name} (${c.id} - ${getDaysInShelter(c)} days)`).join(', ')}. Review tracing progress before Day 42.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY KPI METRICS GRID (Requirement #2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        {/* Total Active Children */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Active Cases</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display">{totalActive}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total registered</div>
        </div>

        {/* In Shelters */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">In Shelters</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 font-display">{inShelters.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Kml: {kamalapurCount} | Kdm: {kadamtaliCount}
          </div>
        </div>

        {/* Under Family Tracing */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Family Tracing</span>
            <HeartHandshake className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-display">{underTracing.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {familiesLocated.length} Families Found
          </div>
        </div>

        {/* Ready for Reintegration */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Ready to Return</span>
            <CheckCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 font-display">{readyForReintegration.length}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Handover scheduled</div>
        </div>

        {/* Reintegrated */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Reintegrated</span>
            <Home className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-display">{alreadyReintegrated.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">With families</div>
        </div>

        {/* Govt Referral */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Govt Referral</span>
            <Send className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 font-display">{govtReferrals.length}</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">DSS Sheikh Russel</div>
        </div>

        {/* Left without Notice */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Left Shelter</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-display">{leftWithoutNotice.length}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Active Search / GD</div>
        </div>

        {/* VTC Enrolled Trainees */}
        <div 
          onClick={() => setActiveView('vtc')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">VTC Trainees</span>
            <Briefcase className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-display">{vtcStudents.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Slum / Comm. Trades</div>
        </div>

        {/* SUS Outreaches */}
        <div 
          onClick={() => setActiveView('sus')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">SUS Sessions</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-display">{susSessions.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Street Outreach</div>
        </div>
      </div>

      {/* THREE LEEDO SHELTERS & PEACE HOME OVERVIEW (Kamalapur: 30, Kadamtali: 30, Peace Home: 100) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {shelters.map((shelter) => {
          const shelterChildren = children.filter(c => !c.isArchived && c.shelterName === shelter.name && c.currentShelterStatus === 'Active Resident');
          const over6Wk = shelterChildren.filter(c => getSixWeekAlertStatus(c).status === 'exceeded');
          const healthDue = shelterChildren.filter(c => getHealthAlert(c)?.isDue);
          const counselingDue = shelterChildren.filter(c => getCounselingAlert(c)?.isDue);
          const occupancyRate = Math.round((shelterChildren.length / shelter.capacity) * 100);

          return (
            <div key={shelter.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-rose-600 shrink-0" />
                      <h3 className="font-bold text-base text-slate-900 font-display leading-tight">{shelter.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{shelter.location}</p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded shrink-0">
                    {language === 'bn' ? 'দায়িত্বপ্রাপ্ত' : 'In-charge'}: {shelter.inCharge}
                  </span>
                </div>

                {/* Capacity Bar with exact capacity (30 / 30 / 100) */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-600">
                      {language === 'bn' ? 'বর্তমান ধারণ' : 'Current Occupancy'}: <strong>{shelterChildren.length} / {shelter.capacity}</strong> {language === 'bn' ? 'বেড' : 'Beds'}
                    </span>
                    <span className={occupancyRate > 90 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                      {occupancyRate}% {language === 'bn' ? 'পূর্ণ' : 'Full'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${occupancyRate > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Sub metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="font-bold text-slate-900 text-sm">{healthDue.length}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{language === 'bn' ? 'স্বাস্থ্য চেকআপ' : 'Health Due'}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="font-bold text-slate-900 text-sm">{counselingDue.length}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{language === 'bn' ? 'কাউন্সেলিং' : 'Counseling'}</div>
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    over6Wk.length > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-100 text-slate-900'
                  }`}>
                    <div className="font-bold text-sm">{over6Wk.length}</div>
                    <div className="text-[10px] mt-0.5">{language === 'bn' ? '> ৬ সপ্তাহ' : '> 6 Wks Stay'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">{shelter.phone}</span>
                <button
                  onClick={() => {
                    setActiveView('children');
                  }}
                  className="font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === 'bn' ? 'কেস তালিকা' : 'View cases'}</span> &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECENT RESCUES & ACTIVE CASES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-base text-slate-900 font-display">
              Active Child Case Management Cohort
            </h2>
            <p className="text-xs text-slate-500">
              Showing children currently under active care, family tracing, or reintegration preparation
            </p>
          </div>
          <button
            onClick={() => setActiveView('children')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto"
          >
            Open All Cases Directory &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Child ID & Name</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Rescue Info</th>
                <th className="py-3 px-4">Shelter & Days</th>
                <th className="py-3 px-4">6-Wk Status</th>
                <th className="py-3 px-4">Case Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {visibleChildren.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <p className="font-semibold text-slate-500">
                      {language === 'bn' ? 'কোনো সক্রিয় শিশু কেস নথিভুক্ত নেই' : 'No active child cases currently registered'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {language === 'bn' ? 'মাঠ পর্যায় থেকে নতুন উদ্ধার নথিভুক্ত করতে কেস ডিরেক্টরিতে যান।' : 'Register new rescued children to begin tracking case management.'}
                    </p>
                  </td>
                </tr>
              ) : (
                visibleChildren.slice(0, 6).map((child) => {
                  const daysInShelter = getDaysInShelter(child);
                  const sixWeek = getSixWeekAlertStatus(child);

                  return (
                    <tr key={child.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={child.photoUrl}
                            alt={child.name}
                            className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 hover:text-rose-600 cursor-pointer" onClick={() => handleOpenChild(child.id)}>
                              {child.name} {child.nickname ? `("${child.nickname}")` : ''}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500">{child.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium">{child.estimatedAge} yrs</span> &bull; {child.gender}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{child.area}</div>
                        <div className="text-[11px] text-slate-500">{child.rescueDate} &bull; {child.gdNumber || 'GD on file'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{child.shelterName}</div>
                        <div className="text-[11px] text-slate-500">{daysInShelter} days stay</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 text-[11px] rounded-md border ${sixWeek.badgeClass}`}>
                          {sixWeek.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {child.caseStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenChild(child.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          Profile
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
    </div>
  );
};
