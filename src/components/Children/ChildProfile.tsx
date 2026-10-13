import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  Printer, 
  Edit3, 
  Calendar, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  HeartHandshake, 
  Activity, 
  Smile, 
  Home, 
  Send, 
  CalendarClock, 
  AlertOctagon, 
  FileText, 
  History, 
  Plus, 
  CheckCircle2, 
  Lock, 
  Phone, 
  Check, 
  User, 
  Sparkles,
  GraduationCap,
  Briefcase,
  Award,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StandardCaseReportModal } from '../Reports/StandardCaseReportModal';
import { 
  getDaysInShelter, 
  getSixWeekAlertStatus, 
  getHealthAlert, 
  getCounselingAlert, 
  getNextPendingFollowUp 
} from '../../utils/calculations';
import { 
  AddCaseNoteModal, 
  AddHealthModal, 
  AddCounselingModal, 
  AddTracingAttemptModal, 
  ReintegrateModal, 
  LeftWithoutNoticeModal,
  AssignCounselingTaskModal,
  ReferChildModal
} from './ChildProfileModals';
import { 
  AddPeaceHomeProgressModal, 
  RecordPeaceHomeDepartureModal 
} from '../PeaceHome/PeaceHomeModals';
import { CaseStatus } from '../../types';

interface ChildProfileProps {
  childId: string;
  onBack: () => void;
}

export const ChildProfile: React.FC<ChildProfileProps> = ({ childId, onBack }) => {
  const { 
    children, 
    updateChild, 
    addCaseNote, 
    addHealthRecord, 
    addCounselingRecord, 
    addTracingAttempt, 
    reintegrateChild, 
    markLeftWithoutNotice, 
    markRecovered, 
    currentUser,
    canUserPerformDelete,
    deleteChildPermanently,
    language,
    assignCounselingTask,
    referChildToThirdParty,
    thirdPartyShelters,
    addThirdPartyShelter,
    addPeaceHomeProgressRecord,
    recordPeaceHomeDeparture,
    cancelPeaceHomeDeparture
  } = useApp();

  const child = children.find((c) => c.id === childId);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<
    'overview' | 'peace-home' | 'personal' | 'rescue' | 'shelter' | 'health' | 'counseling' | 'tracing' | 'family-visit' | 'reintegration' | 'referral' | 'follow-up' | 'lwn' | 'documents' | 'notes' | 'timeline'
  >('overview');

  // Modal states
  const [caseNoteModalOpen, setCaseNoteModalOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [counselingModalOpen, setCounselingModalOpen] = useState(false);
  const [assignCounselingModalOpen, setAssignCounselingModalOpen] = useState(false);
  const [tracingModalOpen, setTracingModalOpen] = useState(false);
  const [reintegrateModalOpen, setReintegrateModalOpen] = useState(false);
  const [referModalOpen, setReferModalOpen] = useState(false);
  const [lwnModalOpen, setLwnModalOpen] = useState(false);
  const [peaceHomeProgressModalOpen, setPeaceHomeProgressModalOpen] = useState(false);
  const [peaceHomeDepartureModalOpen, setPeaceHomeDepartureModalOpen] = useState(false);
  const [standardReportModalOpen, setStandardReportModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [actionFeedbackMsg, setActionFeedbackMsg] = useState('');

  // Editable Status modal
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  if (!child) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
        <p className="text-slate-600 font-medium">Child profile not found or archived.</p>
        <button onClick={onBack} className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold">
          Return to Children List
        </button>
      </div>
    );
  }

  const daysInShelter = getDaysInShelter(child);
  const isPeaceHome = child.shelterName === 'LEEDO Peace Home' || 
                      child.caseStatus === 'Peace Home Resident' ||
                      child.caseStatus === 'Transitioned to General Life (Age 18+)' ||
                      child.caseStatus === 'Peace Home Departed';

  const sixWeekAlert = isPeaceHome 
    ? { status: 'normal', daysInShelter, daysRemaining: 0, label: 'Peace Home Sanctuary (Up to 18y)', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' } 
    : getSixWeekAlertStatus(child);
  const healthAlert = getHealthAlert(child);
  const counselingAlert = getCounselingAlert(child);
  const pendingFollowUp = getNextPendingFollowUp(child);

  // Peace Home Age 18 Calculations & General Life Transition Status
  const yearsRemainingUntil18 = Math.max(0, 18 - (child.estimatedAge || 10));
  const is18YearsCompleted = (child.estimatedAge || 10) >= 18;
  const hasPeaceHomeDeparted = Boolean(
    child.peaceHomeDeparture || 
    child.caseStatus === 'Transitioned to General Life (Age 18+)' || 
    child.caseStatus === 'Peace Home Departed'
  );

  const handleStatusChange = (newStatus: CaseStatus) => {
    updateChild(child.id, { caseStatus: newStatus });
    setStatusMenuOpen(false);
  };

  const handlePrintCaseFile = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Back and Breadcrumbs */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStandardReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-rose-600" />
            <span>{language === 'bn' ? 'স্ট্যান্ডার্ড কেস রিপোর্ট প্রিন্ট' : 'Standard Case Report'}</span>
          </button>

          {canUserPerformDelete ? (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
              title="Delete this child profile (Head Office / Super Admin Access Only)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{language === 'bn' ? 'কেস মুছুন' : 'Delete Case'}</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 cursor-not-allowed hidden sm:inline-flex items-center gap-1" title="Field staff cannot delete records">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>{language === 'bn' ? 'ডিলিট সীমাবদ্ধ' : 'Delete Restricted'}</span>
            </span>
          )}
        </div>
      </div>

      {/* CORE CHILD PROFILE HERO HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Peace Home 18-Year Sanctuary & General Life Transition Top Banner */}
        {isPeaceHome ? (
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-5 py-3 border-b border-emerald-800/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-2xl shrink-0 border border-emerald-400/20">
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black tracking-wide text-emerald-300 uppercase">
                      LEEDO Peace Home (শান্তিনীড়) &bull; ১৮ বছর বয়স পর্যন্ত স্থায়ী আশ্রয় ও বিকাশ
                    </span>
                    {hasPeaceHomeDeparted ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                        {child.peaceHomeDeparture?.exitType || 'প্রস্থান সম্পন্ন'}
                      </span>
                    ) : is18YearsCompleted ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30">
                        ১৮ বছর পূর্ণ — সাধারণ স্বাবলম্বী জীবনে পদার্পণের সময়
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                        বর্তমান আবাসিক শিশু ({yearsRemainingUntil18} বছর বাকি ১৮ পূর্ণ হতে)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {language === 'bn'
                      ? 'পিস হোমে শিশুরা ১৮ বছর পর্যন্ত বসবাস করতে পারে। এখানে তাদের সার্বিক অগ্রগতি ম্যানেজার, মাদার ও কাউন্সেলর মূল্যায়ন করেন। ১৮ বছর পর তারা স্বাবলম্বী সাধারণ জীবনযাপন করবে।'
                      : 'Children can reside at LEEDO Peace Home until age 18. Progress is logged by Peace Home Manager, Mother, & Counselor towards 18+ general independent life.'}
                  </p>
                </div>
              </div>

              {/* Action buttons on header */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPeaceHomeProgressModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'উন্নতি রেকর্ড যোগ' : 'Log Progress'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPeaceHomeDepartureModalOpen(true)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'প্রস্থান / ১৮+ রূপান্তর' : 'Departure / 18+ Exit'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : sixWeekAlert.status === 'exceeded' ? (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center justify-between text-xs text-rose-900 font-semibold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Over 6 Weeks Safeguard Alert: This child has been in shelter for {daysInShelter} days (exceeds 42-day limit). Urgent family reintegration or statutory referral conference is required.</span>
            </div>
            <button
              onClick={() => setActiveTab('reintegration')}
              className="underline hover:text-rose-700 text-rose-800 shrink-0 ml-3"
            >
              Action Reintegration
            </button>
          </div>
        ) : null}

        <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-5 items-start">
          {/* Child Identifier Monogram */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-sm font-mono border-2 border-slate-700">
              {child.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-mono font-bold rounded-md shadow-xs">
              {child.id}
            </span>
          </div>

          {/* Child Primary Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                {child.name} {child.nickname ? `("${child.nickname}")` : ''}
              </h1>

              {/* Editable Case Status Badge */}
              <div className="relative">
                <button
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors inline-flex items-center gap-1.5"
                  title="Click to update child case status"
                >
                  <span>{child.caseStatus}</span>
                  <Edit3 className="w-3 h-3 opacity-60" />
                </button>

                {statusMenuOpen && (
                  <div className="absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 text-xs text-slate-700">
                    <div className="font-bold text-slate-400 uppercase text-[10px] px-2 py-1">
                      Update Case Status
                    </div>
                    {[
                      'New Rescue',
                      'In Shelter Care',
                      'Family Tracing',
                      'Ready for Reintegration',
                      'Reintegrated',
                      'Government Shelter Referral',
                      'Referral Follow-up',
                      'Left Without Notice',
                      'Closed Case',
                    ].map((statusOption) => (
                      <button
                        key={statusOption}
                        onClick={() => handleStatusChange(statusOption as any)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                          child.caseStatus === statusOption
                            ? 'bg-rose-50 text-rose-800 font-bold'
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        {statusOption}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Shelter Status / 18y Sanctuary Badge */}
              {child.shelterName === 'LEEDO Peace Home' || child.caseStatus === 'Peace Home Resident' ? (
                <span className="px-2.5 py-1 text-xs rounded-lg font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'পিস হোম স্থায়ী যত্ন (১৮ বছর বয়স পর্যন্ত)' : 'Peace Home Sanctuary (Up to 18y)'}</span>
                </span>
              ) : child.caseStatus === 'Transitioned to General Life (Age 18+)' ? (
                <span className="px-2.5 py-1 text-xs rounded-lg font-bold border bg-purple-50 text-purple-800 border-purple-200 inline-flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>{language === 'bn' ? '১৮+ সাধারণ জীবনে পদার্পণ সম্পন্ন' : 'Transitioned to General Life (18+)'}</span>
                </span>
              ) : (
                <span className={`px-2.5 py-1 text-xs rounded-lg font-bold border ${sixWeekAlert.badgeClass}`}>
                  {sixWeekAlert.label} ({daysInShelter}d)
                </span>
              )}
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age / Gender</span>
                <span className="font-bold text-slate-800">{child.estimatedAge} yrs ({child.gender})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Rescue Area / Date</span>
                <span className="font-bold text-slate-800">{child.area} ({child.rescueDate})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Shelter</span>
                <span className="font-bold text-slate-800">{child.shelterName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Worker</span>
                <span className="font-bold text-slate-800">{child.assignedCaseWorker}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto no-print">
            {isPeaceHome && (
              <button
                onClick={() => setActiveTab('peace-home')}
                className="flex-1 md:flex-initial px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? `পিস হোম বিকাশ (${child.peaceHomeProgressRecords?.length || 0})` : 'Peace Home Dev'}</span>
              </button>
            )}
            <button
              onClick={() => setCaseNoteModalOpen(true)}
              className="flex-1 md:flex-initial px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Case Note</span>
            </button>
            <button
              onClick={() => setHealthModalOpen(true)}
              className="flex-1 md:flex-initial px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Health Check</span>
            </button>
            <button
              onClick={() => setTracingModalOpen(true)}
              className="flex-1 md:flex-initial px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Log Tracing</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-none no-print">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { 
              id: 'peace-home', 
              label: language === 'bn' ? 'পিস হোম ও ১৮+ রূপান্তর' : 'Peace Home & 18+ Transition', 
              icon: Sparkles, 
              count: child.peaceHomeProgressRecords?.length || 0 
            },
            { id: 'personal', label: 'Personal Info', icon: User },
            { id: 'rescue', label: 'Rescue & Police GD', icon: ShieldCheck },
            { id: 'shelter', label: 'Shelter Stay', icon: Building2 },
            { id: 'health', label: 'Health Records', icon: Activity, count: child.healthRecords.length },
            { id: 'counseling', label: 'Counseling & Mental Health', icon: Smile, count: child.counselingRecords.length },
            { id: 'tracing', label: 'Family Tracing', icon: HeartHandshake, count: child.familyTracing.attempts?.length || 0 },
            { id: 'family-visit', label: 'Family Assessment', icon: MapPin },
            { id: 'reintegration', label: 'Reintegration Handover', icon: Home },
            { id: 'referral', label: 'Govt Referral', icon: Send },
            { id: 'follow-up', label: 'Follow-up Schedule', icon: CalendarClock, count: (child.postReintegrationFollowUps?.length || 0) + (child.referralFollowUps?.length || 0) },
            { id: 'lwn', label: 'Left Without Notice', icon: AlertOctagon },
            { id: 'documents', label: 'Case Documents', icon: FileText, count: child.documents.length },
            { id: 'notes', label: 'Case Notes', icon: FileText, count: child.caseNotes.length },
            { id: 'timeline', label: 'Case Journey Timeline', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#E31B23] text-[#E31B23] bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="space-y-4">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Cols: Journey Highlights & Quick Status */}
            <div className="lg:col-span-2 space-y-4">
              {/* 6-Week Progress Tracker Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-rose-600" />
                    <h3 className="font-bold text-sm text-slate-900 font-display">
                      Shelter Length of Stay & 6-Week Safeguard Tracker
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    {daysInShelter} Days in Shelter (Cap: 42 Days)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      daysInShelter >= 42 ? 'bg-rose-600' : daysInShelter >= 35 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((daysInShelter / 42) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Day 1: Admission ({child.admissionDate})</span>
                  <span>Day 35: Warning Threshold</span>
                  <span>Day 42: Max Temporary Shelter Target</span>
                </div>

                <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <strong>Current Status:</strong> {sixWeekAlert.label}
                </div>
              </div>

              {/* Initial Assessment Summary */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2 font-display">
                  <ShieldCheck className="w-4 h-4 text-[#E31B23]" />
                  Initial Child Protection & Risk Assessment
                </h3>
                {child.initialAssessment ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Protection Concerns</span>
                        <span className="font-medium text-slate-800">{child.initialAssessment.protectionConcerns}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Immediate Safety</span>
                        <span className="font-medium text-slate-800">{child.initialAssessment.immediateSafetyConcerns}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Health Condition</span>
                        <span className="font-medium text-slate-800">{child.initialAssessment.healthConcerns}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Trafficking / Abuse Risk</span>
                        <span className="font-medium text-slate-800">{child.initialAssessment.traffickingConcerns || child.initialAssessment.abuseOrExploitationConcerns}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                      <span className="font-bold block mb-1">Emergency Provisions Delivered:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {child.initialAssessment.foodClothingHygiene && <li>Food, Clean Clothes & Hygiene Kit provided</li>}
                        {child.initialAssessment.emergencyMedicalSupport && <li>Emergency Medical Evaluation administered</li>}
                        {child.initialAssessment.psychologicalFirstAid && <li>Psychological First Aid & Trauma de-escalation provided</li>}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-500 py-3">Initial protective assessment not yet completed.</div>
                )}
              </div>

              {/* Family Tracing Snapshot */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 font-display">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    Family Tracing Status
                  </h3>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-800">
                    {child.familyTracing.tracingStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Father's Name</span>
                    <span className="font-bold text-slate-800">{child.familyTracing.fatherName || 'Not yet recalled'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mother's Name</span>
                    <span className="font-bold text-slate-800">{child.familyTracing.motherName || 'Not yet recalled'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Estimated Village / District</span>
                    <span className="font-bold text-slate-800">{child.familyTracing.district || 'Investigating'}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <strong>Total Tracing Attempts:</strong> {child.familyTracing.attempts?.length || 0} logged.{' '}
                  {(child.familyTracing.attempts?.length || 0) > 0 && (
                    <span>Latest: {child.familyTracing.attempts[child.familyTracing.attempts.length - 1].notes}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Key Alerts & Quick Actions */}
            <div className="space-y-4">
              {/* Upcoming Schedules & Alerts Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 font-display">
                  Case Alerts & Next Tasks
                </h3>

                {/* Health Check Alert */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <Activity className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">Health Check-up</div>
                    <div className="text-slate-600">{healthAlert ? healthAlert.message : 'No overdue medical review.'}</div>
                  </div>
                </div>

                {/* Counseling Alert */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <Smile className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">Counseling Session</div>
                    <div className="text-slate-600">{counselingAlert ? counselingAlert.message : 'Mental health status recorded.'}</div>
                  </div>
                </div>

                {/* Follow-up Alert */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <CalendarClock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">Post-Care Follow-up</div>
                    <div className="text-slate-600">
                      {pendingFollowUp ? `Next scheduled: ${pendingFollowUp.type} on ${pendingFollowUp.followUp.followUpDate}` : 'Follow-up timeline on standby.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Major Journey Actions Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <h3 className="font-bold text-sm text-slate-900 font-display mb-2">
                  Transition Operations
                </h3>

                <button
                  onClick={() => setReintegrateModalOpen(true)}
                  className="w-full py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-between transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    <span>Reintegrate with Family</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('referral')}
                  className="w-full py-2.5 px-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-between transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Transfer to Govt Shelter</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {child.caseStatus !== 'Left Without Notice' ? (
                  <button
                    onClick={() => setLwnModalOpen(true)}
                    className="w-full py-2.5 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <span>Left Without Notice (GD)</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => markRecovered(child.id, '2026-09-20', 'Child recovered by outreach unit and re-admitted to safe shelter', 'Active Resident')}
                    className="w-full py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Mark Child Recovered & Found</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PEACE HOME TAB: PROGRESS & 18+ GENERAL LIFE TRANSITION */}
        {activeTab === 'peace-home' && (
          <div className="space-y-4">
            {/* Top Philosophy & Mandate Banner */}
            <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl border border-emerald-800 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'লিডো শান্তিনীড় — ১৮ বছর বয়স পর্যন্ত স্থায়ী যত্ন ও সুরক্ষা' : 'LEEDO Peace Home — Up to 18 Years Care & Sanctuary'}</span>
                  </div>
                  <h2 className="text-xl font-black font-display text-white">
                    {language === 'bn' ? 'পিস হোম সার্বিক বিকাশ ও ১৮ বছর পরবর্তী সাধারণ জীবন' : 'Holistic Development & Age 18+ Independent Life Transition'}
                  </h2>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {language === 'bn'
                      ? 'লিডো পিস হোমে শিশুরা সর্বোচ্চ ১৮ বছর বয়স পর্যন্ত নিরাপদে বসবাস করে। এখানে অবস্থানকালে তাদের প্রতিটি পদক্ষেপের উন্নতি পর্যবেক্ষণ ও লিপিবদ্ধ করেন: ম্যানেজার পিস হোম, পিস হোম মাদার এবং সাইকোসোশ্যাল কাউন্সেলর। ১৮ বছর পূর্ণ হওয়ার পর প্রতিটি শিশুকে সম্মানজনক সাধারণ স্বাবলম্বী জীবনে পদার্পণ করানো হয়।'
                      : 'Children reside safely at LEEDO Peace Home until age 18. Continuous developmental assessments are officially logged by Manager Peace Home, Peace Home Mother, and Psychosocial Counselor to prepare every youth for thriving independent general life upon turning 18.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    onClick={() => setPeaceHomeProgressModalOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'bn' ? 'উন্নতি/বিকাশ রেকর্ড যোগ করুন' : 'Add Progress Record'}</span>
                  </button>
                  <button
                    onClick={() => setPeaceHomeDepartureModalOpen(true)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>{language === 'bn' ? 'প্রস্থান / ১৮+ রূপান্তর রেকর্ড' : 'Record Departure / 18+ Exit'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 18-Year Age Readiness & Timeline Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Age Countdown Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {language === 'bn' ? '১৮ বছর রূপান্তর ট্র্যাকার' : 'Age 18 Transition Tracker'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    is18YearsCompleted ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {is18YearsCompleted ? (language === 'bn' ? '১৮ বছর পূর্ণ' : '18 Completed') : `${yearsRemainingUntil18} ${language === 'bn' ? 'বছর বাকি' : 'yrs left'}`}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-display">
                  {child.estimatedAge} <span className="text-sm font-semibold text-slate-500">/ ১৮ {language === 'bn' ? 'বছর' : 'years'}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((child.estimatedAge / 18) * 100))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  {is18YearsCompleted
                    ? (language === 'bn' ? '১৮ বছর পূর্ণ হয়েছে। স্বাবলম্বী সাধারণ জীবনে রূপান্তরের জন্য প্রস্তুত।' : 'Youth has turned 18. Ready for independent living transition.')
                    : (language === 'bn' ? `১৮ বছর বয়সে সাধারণ জীবনে রূপান্তরের জন্য আর ${yearsRemainingUntil18} বছর পিস হোমে প্রশিক্ষণ ও তত্ত্বাবধান চলবে।` : `${yearsRemainingUntil18} years remaining in Peace Home sanctuary.`)}
                </p>
              </div>

              {/* Assessment Stats Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  {language === 'bn' ? 'কর্মকর্তাভিত্তিক মোট মূল্যায়ন' : 'Evaluations by Key Staff'}
                </span>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <div className="text-lg font-black text-indigo-700">
                      {(child.peaceHomeProgressRecords || []).filter(r => r.authorRole?.toLowerCase().includes('manager')).length}
                    </div>
                    <div className="text-[10px] font-bold text-indigo-900 mt-0.5">ম্যানেজার</div>
                  </div>
                  <div className="p-2 bg-rose-50 rounded-xl">
                    <div className="text-lg font-black text-rose-700">
                      {(child.peaceHomeProgressRecords || []).filter(r => r.authorRole?.toLowerCase().includes('mother')).length}
                    </div>
                    <div className="text-[10px] font-bold text-rose-900 mt-0.5">মাদার</div>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <div className="text-lg font-black text-emerald-700">
                      {(child.peaceHomeProgressRecords || []).filter(r => r.authorRole?.toLowerCase().includes('counselor')).length}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-900 mt-0.5">কাউন্সেলর</div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 text-center mt-3">
                  {language === 'bn' ? 'মোট অগ্রগতি লগ:' : 'Total Progress Logs:'} <strong className="text-slate-800">{child.peaceHomeProgressRecords?.length || 0} {language === 'bn' ? 'টি' : 'records'}</strong>
                </div>
              </div>

              {/* General Life Objective Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  {language === 'bn' ? '১৮ বছর পর সাধারণ জীবনের রূপরেখা' : 'Age 18 General Life Framework'}
                </span>
                <ul className="text-[11px] text-slate-600 space-y-1.5">
                  <li className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>স্বাবলম্বী চাকরি বা কারিগরি কর্মসংস্থান</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ব্যক্তিগত ব্যাংক একাউন্ট ও এনআইডি সুরক্ষা</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>হোস্টেল/স্বতন্ত্র নিরাপদ বাসস্থান ব্যবস্থাপনা</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>১ বছর মেয়াদী নিয়মিত ফলোআপ ভিজিট</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* DEPARTURE DOSSIER CARD (If Child Has Departed / Transitioned) */}
            {child.peaceHomeDeparture && (
              <div className="bg-gradient-to-br from-amber-50 via-rose-50/40 to-white p-6 rounded-3xl border-2 border-amber-300 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-xs">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-950 uppercase">
                          {child.peaceHomeDeparture.exitType}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 font-mono">
                          তারিখ: {child.peaceHomeDeparture.departureDate}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1 font-display">
                        {language === 'bn' ? 'পিস হোম প্রস্থান ও স্বাবলম্বী সাধারণ জীবন বিবরণী' : 'Peace Home Departure & General Life Dossier'}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(language === 'bn' ? 'আপনি কি প্রস্থান বাতিল করে এই শিশুকে পুনরায় পিস হোমের সক্রিয় আবাসিক করতে চান?' : 'Reopen child back to active Peace Home resident?')) {
                        cancelPeaceHomeDeparture(child.id, 'Canceled departure record by user');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    {language === 'bn' ? 'প্রস্থান বাতিল ও পুনর্বহাল' : 'Reopen / Restore Resident'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">প্রস্থানকালে বয়স</span>
                    <span className="font-bold text-slate-900 text-sm">{child.peaceHomeDeparture.ageAtDeparture} বছর</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">বর্তমান অবস্থান / ঠিকানা</span>
                    <span className="font-bold text-slate-900 text-xs">{child.peaceHomeDeparture.newAddressOrLocation}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">যোগাযোগ মোবাইল নম্বর</span>
                    <span className="font-mono font-bold text-slate-900">{child.peaceHomeDeparture.contactNumber || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200/80">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">অনুমোদনকারী কর্মকর্তা</span>
                    <span className="font-bold text-slate-900">{child.peaceHomeDeparture.authorizedBy}</span>
                  </div>
                </div>

                {/* Specifics for 18+ general life */}
                {(child.peaceHomeDeparture.occupationOrJobTitle || child.peaceHomeDeparture.monthlyIncomeBdt) && (
                  <div className="p-4 bg-white rounded-2xl border border-emerald-200 space-y-2">
                    <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>১৮+ সাধারণ জীবনের জীবিকা ও বাসস্থান:</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">পেশা / কর্মসংস্থান:</span>
                        <strong className="text-slate-800">{child.peaceHomeDeparture.occupationOrJobTitle} ({child.peaceHomeDeparture.employerOrOrganization || 'ব্যক্তিগত'})</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">মাসিক আনুমানিক আয়:</span>
                        <strong className="text-emerald-700 font-mono">৳{child.peaceHomeDeparture.monthlyIncomeBdt || 0} / মাস</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">বাসস্থানের ধরন:</span>
                        <strong className="text-slate-800">{child.peaceHomeDeparture.livingArrangement || 'হোস্টেল'}</strong>
                      </div>
                    </div>
                    {child.peaceHomeDeparture.starterSupportProvided && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                        <strong className="text-slate-700">প্রদত্ত প্রারম্ভিক সহায়তা: </strong>
                        {child.peaceHomeDeparture.starterSupportProvided}
                      </div>
                    )}
                  </div>
                )}

                {child.peaceHomeDeparture.followUpPlan && (
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                    <strong className="text-slate-800">ফলোআপ পরিকল্পনা: </strong>
                    {child.peaceHomeDeparture.followUpPlan}
                  </div>
                )}
              </div>
            )}

            {/* List of Progress & Development Records */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-display">
                    {language === 'bn' ? 'পিস হোমে শিশুর সামগ্রিক উন্নতি ও পর্যবেক্ষণ রেকর্ড' : 'Peace Home Developmental Progress Log'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'bn' 
                      ? 'ম্যানেজার পিস হোম, পিস হোম মাদার ও সাইকোসোশ্যাল কাউন্সেলরের নিয়মিত পর্যবেক্ষণ'
                      : 'Logged by Peace Home Manager, Mother, & Psychosocial Counselor'}
                  </p>
                </div>

                <button
                  onClick={() => setPeaceHomeProgressModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'bn' ? 'নতুন মূল্যায়ন যোগ করুন' : 'Add Evaluation'}</span>
                </button>
              </div>

              {(!child.peaceHomeProgressRecords || child.peaceHomeProgressRecords.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-500 space-y-3">
                  <Sparkles className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">
                      {language === 'bn' ? 'এখনো কোনো উন্নতি রেকর্ড যোগ করা হয়নি' : 'No development progress recorded yet'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      {language === 'bn'
                        ? 'ম্যানেজার পিস হোম, পিস হোম মাদার বা সাইকোসোশ্যাল কাউন্সেলর হিসেবে শিশুর মানসিক, আচরণগত, শিক্ষা বা জীবন দক্ষতার উন্নতি রেকর্ড করুন।'
                        : 'Peace Home Manager, Mother, or Counselor can log developmental progress.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setPeaceHomeProgressModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'প্রথম উন্নতি রেকর্ড লিখুন' : 'Log First Progress Record'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {child.peaceHomeProgressRecords.map((rec) => {
                    const isManager = rec.authorRole?.toLowerCase().includes('manager');
                    const isMother = rec.authorRole?.toLowerCase().includes('mother');
                    const isCounselor = rec.authorRole?.toLowerCase().includes('counselor');

                    return (
                      <div 
                        key={rec.id}
                        className="p-4 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all space-y-2.5 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{rec.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.score === 'Excellent' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              rec.score === 'Steady Progress' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              rec.score === 'Moderate' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {rec.score}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-md text-[10px] font-medium">
                              {rec.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              isManager ? 'bg-indigo-100 text-indigo-900' :
                              isMother ? 'bg-rose-100 text-rose-900' :
                              isCounselor ? 'bg-emerald-100 text-emerald-900' :
                              'bg-slate-200 text-slate-800'
                            }`}>
                              {rec.authorRole}: {rec.authorName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">{rec.date}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/70">
                          {rec.observations}
                        </p>

                        {rec.age18PreparationNotes && (
                          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
                            <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-bold">১৮ বছর পূর্ণে স্বাবলম্বী সাধারণ জীবনের প্রস্তুতি: </strong>
                              <span>{rec.age18PreparationNotes}</span>
                            </div>
                          </div>
                        )}

                        {rec.nextSteps && (
                          <div className="text-[11px] text-slate-500 pl-1">
                            <strong className="text-slate-700">পরবর্তী পদক্ষেপ: </strong>
                            {rec.nextSteps}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. PERSONAL INFO TAB */}
        {activeTab === 'personal' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 font-display">Detailed Personal Identification Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Child ID</span>
                <span className="font-mono font-bold text-slate-900">{child.id}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Full Legal / Known Name</span>
                <span className="font-bold text-slate-900">{child.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Nickname / Street Alias</span>
                <span className="font-bold text-slate-900">{child.nickname || 'None'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Gender</span>
                <span className="font-bold text-slate-900">{child.gender}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Estimated Age</span>
                <span className="font-bold text-slate-900">{child.estimatedAge} years old</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Exact Date of Birth</span>
                <span className="font-bold text-slate-900">{child.dateOfBirth || 'Unknown / Not on record'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Nationality</span>
                <span className="font-bold text-slate-900">{child.nationality}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Disability / Special Needs</span>
                <span className="font-bold text-slate-900">{child.disabilityOrSpecialNeeds || 'None'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Education Background</span>
                <span className="font-bold text-slate-900">{child.educationInformation || 'Non-formal / Street'}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Distinguishing Physical Features & Marks</span>
              <span className="font-bold text-slate-900">{child.identificationInfo || 'No major surgical scars or marks'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Reported Address / Origin</span>
              <span className="font-bold text-slate-900">{child.addressIfKnown || 'Barishal division (as stated during memory recall)'}</span>
            </div>
          </div>
        )}

        {/* 3. RESCUE & POLICE GD TAB */}
        {activeTab === 'rescue' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 font-display">Rescue Particulars & Police GD Documentation</h3>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                Verified Legal Rescue
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Rescue Date & Time</span>
                <span className="font-bold text-slate-900">{child.rescueDate} at {child.rescueTime}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Rescue Hub Area</span>
                <span className="font-bold text-slate-900">{child.area}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Specific Spot</span>
                <span className="font-bold text-slate-900">{child.rescueLocation}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Rescue Team</span>
                <span className="font-bold text-slate-900">{child.rescueTeam}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Rescued By (Staff)</span>
                <span className="font-bold text-slate-900">{child.rescuedBy}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Initial Condition</span>
                <span className="font-bold text-slate-900">{child.conditionAtRescue}</span>
              </div>
            </div>

            {/* Police GD Box */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-500" />
                  <span className="font-bold text-sm">Official Police General Diary (GD) Record</span>
                </div>
                <span className="bg-rose-600 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                  {child.gdNumber}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300 pt-2 border-t border-slate-800">
                <div>GD Date: <strong className="text-white">{child.gdDate}</strong></div>
                <div>Police Station: <strong className="text-white">{child.policeStation}</strong></div>
                <div>Legal Status: <strong className="text-emerald-400">Recorded Under Child Act</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* 4. SHELTER STAY TAB */}
        {activeTab === 'shelter' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 font-display">Shelter Residence & Daily Safekeeping</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Assigned Shelter</span>
                <span className="font-bold text-slate-900">{child.shelterName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Admission Date</span>
                <span className="font-bold text-slate-900">{child.admissionDate}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Room / Bed</span>
                <span className="font-bold text-slate-900">{child.roomOrBed || 'Dormitory assigned'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Days Elapsed</span>
                <span className="font-bold text-rose-600 font-mono text-sm">{daysInShelter} Days</span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong className="block font-bold mb-1">6-Week Care Policy Directive:</strong>
              Under LEEDO Child Protection Standard Operating Procedures, temporary shelter stays should be resolved within 42 days via family reunification or state child home transfer. Current status: <strong>{sixWeekAlert.label} ({sixWeekAlert.daysRemaining} days margin)</strong>.
            </div>
          </div>
        )}

        {/* 5. HEALTH RECORDS TAB */}
        {activeTab === 'health' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-display">Health Management & Clinical Records</h3>
                <p className="text-xs text-slate-500">Regular check-ups, medications, growth monitoring and treatment plans</p>
              </div>
              <button
                onClick={() => setHealthModalOpen(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Health Check-up</span>
              </button>
            </div>

            <div className="space-y-3">
              {child.healthRecords.map((hr) => (
                <div key={hr.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{hr.date} &bull; {hr.doctor}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">{hr.healthCondition}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 pt-1">
                    <div>Height: <strong>{hr.heightCm ? `${hr.heightCm} cm` : 'N/A'}</strong></div>
                    <div>Weight: <strong>{hr.weightKg ? `${hr.weightKg} kg` : 'N/A'}</strong></div>
                    <div>Illness: <strong>{hr.illness || 'None'}</strong></div>
                    <div>Next Check: <strong>{hr.nextCheckupDate || 'Routine'}</strong></div>
                  </div>
                  {hr.treatment && (
                    <div className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                      <strong>Treatment / Advice:</strong> {hr.treatment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. COUNSELING & MENTAL HEALTH TAB */}
        {activeTab === 'counseling' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-display">Counseling & Mental Health History</h3>
                <p className="text-xs text-slate-500">Trauma management, psychological first aid and behavioral rehabilitation</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAssignCounselingModalOpen(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'নার্গিসকে টাস্ক এসাইন করুন' : 'Assign Task to Nargis'}</span>
                </button>
                <button
                  onClick={() => setCounselingModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Counseling Session</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {child.counselingRecords.map((cr) => (
                <div key={cr.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{cr.date} &bull; {cr.counselingType} Session</span>
                      <div className="text-slate-500 text-[11px]">Counselor: {cr.counselor}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold">{cr.counselingStatus}</span>
                  </div>
                  <div className="text-slate-700">
                    <strong>Main Concern:</strong> {cr.mainConcern}
                  </div>
                  <div className="text-slate-700">
                    <strong>Intervention Applied:</strong> {cr.intervention}
                  </div>
                  <div className="text-slate-700">
                    <strong>Child Response:</strong> {cr.childResponse}
                  </div>
                  {cr.confidentialNotes && (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Confidential Clinical Notes:</strong> {cr.confidentialNotes}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. FAMILY TRACING TAB */}
        {activeTab === 'tracing' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-display">Family Tracing Case Management</h3>
                <p className="text-xs text-slate-500">Every tracing attempt, phone call, village lead and local stakeholder contact logged</p>
              </div>
              <button
                onClick={() => setTracingModalOpen(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Tracing Attempt</span>
              </button>
            </div>

            {/* Tracing Status Card */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="text-amber-800 font-bold uppercase text-[10px]">Overall Tracing Status</div>
                <div className="text-amber-950 font-bold text-base">{child.familyTracing.tracingStatus}</div>
              </div>
              <div className="text-right text-slate-600">
                <div>Village/Upazila: <strong>{child.familyTracing.village || 'Pending'}, {child.familyTracing.upazila || ''}</strong></div>
                <div>District: <strong>{child.familyTracing.district || 'Investigating'}</strong></div>
              </div>
            </div>

            {/* Tracing Attempts Timeline Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Tracing Attempts Log ({child.familyTracing.attempts?.length || 0})
              </h4>
              {child.familyTracing.attempts?.map((att, idx) => (
                <div key={att.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{att.date} &bull; {att.contactMethod}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-700">
                      {att.result}
                    </span>
                  </div>
                  <div className="text-slate-700">
                    <strong>Contact Target / Location:</strong> {att.contactPerson} ({att.location})
                  </div>
                  <div className="text-slate-700">
                    <strong>Investigation Findings:</strong> {att.notes}
                  </div>
                  <div className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                    <strong>Immediate Next Step:</strong> {att.nextAction} &bull; <em>Staff: {att.staffResponsible}</em>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. FAMILY INFO & HOME VISIT ASSESSMENT TAB */}
        {activeTab === 'family-visit' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 font-display">Family Assessment & Home Visit Evaluation</h3>
            {child.familyInfo ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Father / Guardian</span>
                    <span className="font-bold text-slate-900">{child.familyInfo.fatherOrGuardianName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Mother / Caregiver</span>
                    <span className="font-bold text-slate-900">{child.familyInfo.motherName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Phone Number</span>
                    <span className="font-bold text-slate-900 font-mono">{child.familyInfo.phoneNumber}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Full Permanent Address</span>
                  <span className="font-bold text-slate-900">{child.familyInfo.address}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Economic / Income Situation</span>
                    <span className="font-bold text-slate-900">{child.familyInfo.incomeInformation}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Living Environment & Safety</span>
                    <span className="font-bold text-slate-900">{child.familyInfo.householdInformation}</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                  <span className="font-bold text-sm block">Home Visit Assessment ({child.familyInfo.homeVisitDate} by {child.familyInfo.assessmentOfficer}):</span>
                  <div>{child.familyInfo.homeAssessment}</div>
                  <div className="pt-2 font-bold text-emerald-800">
                    Recommendation: {child.familyInfo.reintegrationRecommendation}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No formal home visit conducted yet. Family tracing must yield a verified address before conducting a field home assessment.
              </div>
            )}
          </div>
        )}

        {/* 9. REINTEGRATION HANDOVER TAB */}
        {activeTab === 'reintegration' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-display">Reintegration & Family Handover Protocol</h3>
                <p className="text-xs text-slate-500">Legal handover documents, safety undertakings and return-to-family protocols</p>
              </div>
              {child.caseStatus !== 'Reintegrated' && (
                <button
                  onClick={() => setReintegrateModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Home className="w-4 h-4" />
                  <span>Execute Formal Reintegration</span>
                </button>
              )}
            </div>

            {child.reintegration ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-xs text-emerald-950">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="font-bold text-sm">Successfully Reintegrated on {child.reintegration.reintegrationDate}</div>
                  <span className="bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold">Official Handover Complete</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>Guardian: <strong>{child.reintegration.familyGuardianName}</strong></div>
                  <div>Relationship: <strong>{child.reintegration.relationshipWithChild}</strong></div>
                  <div>Handover Location: <strong>{child.reintegration.handoverLocation}</strong></div>
                </div>
                <div>Plan: <strong>{child.reintegration.reintegrationPlan}</strong></div>
                <div>Safety Assessment: <strong>{child.reintegration.safetyAssessmentNotes}</strong></div>
                <div>Official Witnesses: <strong>{child.reintegration.witnessInformation}</strong></div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500 text-xs">
                Child has not yet been formally handed over. Click "Execute Formal Reintegration" when family conditions pass safety criteria.
              </div>
            )}
          </div>
        )}

        {/* 10. GOVT REFERRAL TAB */}
        {activeTab === 'referral' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-display">Government Shelter & 3rd-Party Partner Institutional Referral</h3>
                <p className="text-xs text-slate-500">Statutory DSS transfers, Juvenile development centers, or certified partner NGO shelters</p>
              </div>
              {child.caseStatus !== 'Government Shelter Referral' && (
                <button
                  onClick={() => setReferModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সরকারি বা পার্টনার শেল্টারে রেফার করুন' : 'Execute Referral'}</span>
                </button>
              )}
            </div>

            {child.referral ? (
              <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl space-y-3 text-xs text-purple-950">
                <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                  <span className="font-bold text-sm">{child.referral.referralOrganization} &bull; {child.referral.referralDate}</span>
                  <span className="bg-purple-200 text-purple-900 px-2.5 py-0.5 rounded-full font-bold">Memo / Order: {child.referral.admissionConfirmation || 'Pending'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>Receiving Facility: <strong>{child.referral.governmentShelterOrServiceName}</strong></div>
                  <div>Receiving Officer: <strong>{child.referral.contactPerson} ({child.referral.contactNumber})</strong></div>
                </div>
                <div>Statutory / Placement Reason: <strong>{child.referral.reasonForReferral}</strong></div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500 text-xs">
                No external government shelter or partner institutional referral filed for this child. Click "Execute Referral" to transfer and track.
              </div>
            )}
          </div>
        )}

        {/* 11. POST-REINTEGRATION FOLLOW-UP TAB */}
        {activeTab === 'follow-up' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-display">Post-Reintegration Follow-up Schedule</h3>
              <p className="text-xs text-slate-500">
                Mandatory monitoring milestones (7-day, 30-day, 3-month, 6-month, 12-month) ensuring child well-being and preventing re-exploitation
              </p>
            </div>

            <div className="space-y-3">
              {child.postReintegrationFollowUps?.map((fu) => (
                <div
                  key={fu.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    fu.completed
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-slate-600" />
                      <span className="font-bold text-slate-900 text-sm">{fu.scheduleType} Post-Reintegration Milestone</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      fu.completed
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {fu.completed ? 'Completed' : 'Pending Follow-up'}
                    </span>
                  </div>
                  <div>Scheduled Date: <strong>{fu.followUpDate}</strong></div>
                  <div>Contact Method: <strong>{fu.contactMethod}</strong> &bull; Officer: <strong>{fu.officerName}</strong></div>
                  <div>Child Status: <strong>{fu.childStatus}</strong></div>
                  {fu.officerObservation && <div>Observation: <em>{fu.officerObservation}</em></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12. LEFT WITHOUT NOTICE TAB */}
        {activeTab === 'lwn' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 font-display">"Left Without Notice" Incident Logs & Active Search</h3>
            {child.leftWithoutNotice ? (
              <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-3 text-xs text-rose-950">
                <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-rose-600" />
                    <span className="font-bold text-sm">Incident Occurred: {child.leftWithoutNotice.date} at {child.leftWithoutNotice.time}</span>
                  </div>
                  <span className="bg-rose-200 text-rose-900 px-3 py-1 rounded-full font-bold">
                    {child.leftWithoutNotice.currentStatus}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>Last Seen: <strong>{child.leftWithoutNotice.lastSeenLocation}</strong></div>
                  <div>Last Seen By: <strong>{child.leftWithoutNotice.lastSeenBy}</strong></div>
                  <div>Missing GD Number: <strong>{child.leftWithoutNotice.gdNumber}</strong></div>
                  <div>Police Thana: <strong>{child.leftWithoutNotice.policeStation}</strong></div>
                </div>
                <div>Circumstances: <strong>{child.leftWithoutNotice.circumstances}</strong></div>
                <div>Immediate Search: <strong>{child.leftWithoutNotice.immediateActions}</strong></div>

                {child.leftWithoutNotice.currentStatus !== 'Recovered & Returned' && (
                  <div className="pt-2">
                    <button
                      onClick={() => markRecovered(child.id, '2026-09-20', 'Child located during railway platform search and safely brought back to shelter', 'Active Resident')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                    >
                      Record Child Found & Re-admitted
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500 text-xs">
                No unauthorized shelter exit records. The child has maintained continuous safe shelter attendance.
              </div>
            )}
          </div>
        )}

        {/* 13. DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-display">Linked Case Documents</h3>
                <p className="text-xs text-slate-500">Directly associated with Child ID {child.id}</p>
              </div>
              <button
                onClick={() => {
                  const title = prompt('Enter document title (e.g. Police GD Certificate):');
                  if (title) {
                    const newDocs = [
                      ...child.documents,
                      {
                        id: `doc-${Date.now()}`,
                        title,
                        category: 'Other' as const,
                        fileName: `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
                        fileUrl: child.photoUrl,
                        uploadedAt: '2026-09-20',
                        uploadedBy: currentUser.name,
                      },
                    ];
                    updateChild(child.id, { documents: newDocs });
                  }
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {child.documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{doc.title}</div>
                    <div className="text-[11px] text-slate-500">{doc.category} &bull; {doc.uploadedAt}</div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 14. CASE NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-display">Chronological Case Notes</h3>
                <p className="text-xs text-slate-500">Every interaction, behavioral shift, and field observation</p>
              </div>
              <button
                onClick={() => setCaseNoteModalOpen(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>

            <div className="space-y-3">
              {child.caseNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    note.isConfidential ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{note.author} ({note.authorRole})</span>
                    <div className="flex items-center gap-2">
                      {note.isConfidential && (
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Confidential
                        </span>
                      )}
                      <span className="text-slate-400 font-mono text-[11px]">{note.date}</span>
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 15. CASE TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 font-display">Complete Case Journey Timeline</h3>
            <div className="relative pl-6 border-l-2 border-rose-300 space-y-6 text-xs">
              <div className="relative">
                <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-rose-600 ring-4 ring-white" />
                <div className="font-bold text-slate-900">Rescue Registered</div>
                <div className="text-slate-500">{child.rescueDate} &bull; {child.area} ({child.rescueLocation})</div>
                <div className="text-slate-700 mt-1">Police GD: {child.gdNumber} at {child.policeStation}</div>
              </div>

              <div className="relative">
                <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="font-bold text-slate-900">Admitted to {child.shelterName}</div>
                <div className="text-slate-500">{child.admissionDate} &bull; Assigned to {child.assignedCaseWorker}</div>
              </div>

              {child.familyTracing.attempts?.map((att, i) => (
                <div key={att.id} className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-white" />
                  <div className="font-bold text-slate-900">Tracing Attempt #{i + 1}: {att.contactMethod}</div>
                  <div className="text-slate-500">{att.date} &bull; Result: {att.result}</div>
                  <div className="text-slate-700 mt-0.5">{att.notes}</div>
                </div>
              ))}

              {child.reintegration && (
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-white" />
                  <div className="font-bold text-slate-900">Formal Reintegration Handover</div>
                  <div className="text-slate-500">{child.reintegration.reintegrationDate} &bull; Handed over to {child.reintegration.familyGuardianName}</div>
                  <div className="text-slate-700 mt-0.5">{child.reintegration.reintegrationPlan}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AddCaseNoteModal
        isOpen={caseNoteModalOpen}
        onClose={() => setCaseNoteModalOpen(false)}
        child={child}
        onAdd={(note, isConfidential) => addCaseNote(child.id, note, isConfidential)}
      />

      <AddHealthModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        child={child}
        onAdd={(rec) => addHealthRecord(child.id, rec)}
      />

      <AddCounselingModal
        isOpen={counselingModalOpen}
        onClose={() => setCounselingModalOpen(false)}
        child={child}
        onAdd={(rec) => addCounselingRecord(child.id, rec)}
      />

      <AddTracingAttemptModal
        isOpen={tracingModalOpen}
        onClose={() => setTracingModalOpen(false)}
        child={child}
        onAdd={(attempt, status) => addTracingAttempt(child.id, attempt, status)}
      />

      <ReintegrateModal
        isOpen={reintegrateModalOpen}
        onClose={() => setReintegrateModalOpen(false)}
        child={child}
        onReintegrate={(data) => reintegrateChild(child.id, data)}
      />

      <LeftWithoutNoticeModal
        isOpen={lwnModalOpen}
        onClose={() => setLwnModalOpen(false)}
        child={child}
        onRecord={(data) => markLeftWithoutNotice(child.id, data)}
      />

      {/* Standard Full Case File Print Modal */}
      <StandardCaseReportModal
        child={child}
        isOpen={standardReportModalOpen}
        onClose={() => setStandardReportModalOpen(false)}
        language={language}
      />

      {/* Delete Child Record Confirmation Dialog (Head Office & Super Admin Only) */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'bn' ? 'কেস রেকর্ড স্থায়ীভাবে মুছুন' : 'Permanently Delete Case File'}
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  {child.name} ({child.id})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {language === 'bn'
                ? 'আপনি কি নিশ্চিত যে এই শিশুর সম্পূর্ণ রেকর্ড ও ফাইল সিস্টেম থেকে মুছে ফেলতে চান? হেড অফিস অধিকার বলে এটি ডাটাবেস থেকে স্থায়ীভাবে মুছে যাবে।'
                : 'Are you sure you want to permanently delete this child profile? This action will remove all case notes, medical, and shelter histories.'}
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteChildPermanently(child.id);
                  setDeleteConfirmOpen(false);
                  onBack();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {language === 'bn' ? 'হ্যাঁ, স্থায়ীভাবে মুছুন' : 'Yes, Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action feedback toast */}
      {actionFeedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span>{actionFeedbackMsg}</span>
        </div>
      )}

      {/* Assign Counseling Task to Nargis Modal */}
      <AssignCounselingTaskModal
        isOpen={assignCounselingModalOpen}
        onClose={() => setAssignCounselingModalOpen(false)}
        child={child}
        onAssign={(data) => {
          assignCounselingTask({
            childId: child.id,
            childName: child.name,
            childArea: child.area || child.rescueLocation,
            reason: data.reason,
            dueDate: data.dueDate,
            priority: data.urgency === 'Immediate (24h)' ? 'Urgent' : data.urgency === 'Urgent (48h)' ? 'High' : 'Medium',
            assignedBy: currentUser?.name || 'Mobilizer / Coordinator',
          });
          setActionFeedbackMsg(
            language === 'bn'
              ? `কাউন্সেলিং টাস্ক সফলভাবে সাইকো-সোশ্যাল কাউন্সিলর নার্গিসের আইডিতে এসাইন ও নোটিফাই করা হয়েছে!`
              : `Counseling task successfully assigned to Counselor Nargis and notification dispatched!`
          );
          setTimeout(() => setActionFeedbackMsg(''), 5000);
        }}
      />

      {/* Refer Child to Government / 3rd-Party Shelter Modal */}
      <ReferChildModal
        isOpen={referModalOpen}
        onClose={() => setReferModalOpen(false)}
        child={child}
        existingThirdPartyShelters={thirdPartyShelters}
        onAddNewShelter={(newShelter) => {
          addThirdPartyShelter(newShelter);
        }}
        onRefer={(data) => {
          referChildToThirdParty(child.id, {
            shelterName: data.shelterName,
            reason: data.reason,
            contactPerson: data.contactPerson,
            contactPhone: data.contactPhone,
            memoNumber: data.memoNumber,
            referralDate: data.referralDate,
          });
          setActionFeedbackMsg(
            language === 'bn'
              ? `শিশুটিকে সফলভাবে "${data.shelterName}" এ রেফার করা হয়েছে এবং কেস স্ট্যাটাস আপডেট হয়েছে।`
              : `Child successfully referred to "${data.shelterName}" and case status updated.`
          );
          setTimeout(() => setActionFeedbackMsg(''), 5000);
        }}
      />

      {/* Add Peace Home Progress Assessment Modal */}
      <AddPeaceHomeProgressModal
        isOpen={peaceHomeProgressModalOpen}
        onClose={() => setPeaceHomeProgressModalOpen(false)}
        child={child}
        onAdd={(data) => {
          addPeaceHomeProgressRecord(child.id, data);
          setActionFeedbackMsg(
            language === 'bn'
              ? `পিস হোম অগ্রগতি ও বিকাশ রেকর্ড সফলভাবে সংরক্ষিত হয়েছে (${data.authorRole}: ${data.title})!`
              : `Peace Home progress record logged successfully (${data.authorRole}: ${data.title})!`
          );
          setTimeout(() => setActionFeedbackMsg(''), 5000);
        }}
      />

      {/* Record Peace Home Departure / 18+ Transition Modal */}
      <RecordPeaceHomeDepartureModal
        isOpen={peaceHomeDepartureModalOpen}
        onClose={() => setPeaceHomeDepartureModalOpen(false)}
        child={child}
        onRecord={(data) => {
          recordPeaceHomeDeparture(child.id, data);
          setActionFeedbackMsg(
            language === 'bn'
              ? `পিস হোম প্রস্থান ও রূপান্তর রেকর্ড সফলভাবে হালনাগাদ হয়েছে (${data.exitType})!`
              : `Peace Home departure and transition record updated successfully (${data.exitType})!`
          );
          setTimeout(() => setActionFeedbackMsg(''), 5000);
        }}
      />
    </div>
  );
};
