import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Smile, 
  CalendarClock, 
  CheckCircle2, 
  ChevronRight, 
  Calendar,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  getDaysInShelter, 
  getSixWeekAlertStatus, 
  getHealthAlert, 
  getCounselingAlert, 
  getNextPendingFollowUp 
} from '../../utils/calculations';

export const TasksAndAlerts: React.FC = () => {
  const { 
    children, 
    notifications, 
    updateNotificationStatus, 
    currentUser, 
    setSelectedChildId, 
    setActiveView, 
    language 
  } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'staff-tasks' | 'six-week' | 'health' | 'counseling' | 'follow-up'>('all');

  // Filter staff notifications for current user
  const isCounselor = currentUser.id === 'emp-1017' || 
                      currentUser.name.toLowerCase().includes('nargis') || 
                      currentUser.designation?.toLowerCase().includes('psycho-social') ||
                      currentUser.designation?.toLowerCase().includes('counselor');

  const isCoordinator = currentUser.role === 'Program Coordinator' ||
                        currentUser.designation?.toLowerCase().includes('coordinator');

  const userStaffNotifications = notifications.filter((notif) => {
    if (notif.targetUserId && notif.targetUserId === currentUser.id) return true;
    if (notif.type === 'COUNSELING_TASK' && isCounselor) return true;
    if (notif.type === 'NEW_RESCUE_VERIFICATION' && isCoordinator) return true;
    if (notif.targetRole && notif.targetRole === currentUser.role) return true;
    if (notif.targetDesignation && currentUser.designation && notif.targetDesignation.toLowerCase().includes(currentUser.designation.toLowerCase())) return true;
    if (currentUser.role === 'Super Admin' || currentUser.designation?.includes('Kanta') || currentUser.email === 'leedo.kanta@gmail.com') return true;
    return false;
  });

  // Collect all tasks & alerts across all children
  interface AlertItem {
    id: string;
    childId: string;
    childName: string;
    photoUrl: string;
    shelterName: string;
    caseWorker: string;
    type: '6-Week Exceeded' | 'Approaching 6-Week' | 'Health Due' | 'Counseling Due' | 'Follow-up Due';
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    dueDate?: string;
  }

  const allAlerts: AlertItem[] = [];

  children.forEach((c) => {
    if (c.isArchived) return;

    // 1. Six week
    const sixWeek = getSixWeekAlertStatus(c);
    if (sixWeek.status === 'exceeded') {
      allAlerts.push({
        id: `6w-exc-${c.id}`,
        childId: c.id,
        childName: c.name,
        photoUrl: c.photoUrl,
        shelterName: c.shelterName,
        caseWorker: c.assignedCaseWorker,
        type: '6-Week Exceeded',
        title: `Shelter Stay Limit Exceeded (${sixWeek.daysInShelter} Days)`,
        description: `Exceeds 42-day safeguard by ${sixWeek.daysInShelter - 42} days. Urgent case conference required for family reintegration or referral.`,
        severity: 'critical',
      });
    } else if (sixWeek.status === 'approaching') {
      allAlerts.push({
        id: `6w-app-${c.id}`,
        childId: c.id,
        childName: c.name,
        photoUrl: c.photoUrl,
        shelterName: c.shelterName,
        caseWorker: c.assignedCaseWorker,
        type: 'Approaching 6-Week',
        title: `Approaching 6-Week Cap (${sixWeek.daysRemaining} Days Left)`,
        description: `Currently ${sixWeek.daysInShelter} days in shelter. Family tracing progress review recommended.`,
        severity: 'warning',
      });
    }

    // 2. Health
    const health = getHealthAlert(c);
    if (health?.isDue) {
      allAlerts.push({
        id: `hl-${c.id}`,
        childId: c.id,
        childName: c.name,
        photoUrl: c.photoUrl,
        shelterName: c.shelterName,
        caseWorker: c.assignedCaseWorker,
        type: 'Health Due',
        title: `Medical Review Required`,
        description: health.message,
        severity: health.isOverdue ? 'critical' : 'warning',
      });
    }

    // 3. Counseling
    const counseling = getCounselingAlert(c);
    if (counseling?.isDue) {
      allAlerts.push({
        id: `cs-${c.id}`,
        childId: c.id,
        childName: c.name,
        photoUrl: c.photoUrl,
        shelterName: c.shelterName,
        caseWorker: c.assignedCaseWorker,
        type: 'Counseling Due',
        title: `Mental Health / Counseling Follow-up`,
        description: counseling.message,
        severity: counseling.isOverdue ? 'critical' : 'warning',
      });
    }

    // 4. Follow-up
    const fu = getNextPendingFollowUp(c);
    if (fu?.isOverdue) {
      allAlerts.push({
        id: `fu-${c.id}`,
        childId: c.id,
        childName: c.name,
        photoUrl: c.photoUrl,
        shelterName: c.shelterName,
        caseWorker: c.assignedCaseWorker,
        type: 'Follow-up Due',
        title: `Post-Reintegration ${fu.type} Overdue`,
        description: `Scheduled for ${fu.followUp.followUpDate}. Field visit or phone check-in pending.`,
        severity: 'critical',
        dueDate: fu.followUp.followUpDate,
      });
    }
  });

  const filteredAlerts = allAlerts.filter((item) => {
    if (filterType === 'six-week') return item.type.includes('6-Week');
    if (filterType === 'health') return item.type === 'Health Due';
    if (filterType === 'counseling') return item.type === 'Counseling Due';
    if (filterType === 'follow-up') return item.type === 'Follow-up Due';
    return true;
  });

  const handleOpenChild = (childId: string) => {
    setSelectedChildId(childId);
    setActiveView('child-profile');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
              Safeguards & Compliance
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Actionable Operations</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Tasks, Reminders & 6-Week Shelter Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized monitoring for shelter stay limits, clinical appointments, and post-reintegration milestones
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Alerts ({allAlerts.length})
          </button>
          <button
            onClick={() => setFilterType('staff-tasks')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'staff-tasks' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            🎯 স্টাফ টাস্ক ও রিমাইন্ডার ({userStaffNotifications.filter(n => n.status !== 'Completed' && n.status !== 'Verified').length})
          </button>
          <button
            onClick={() => setFilterType('six-week')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'six-week' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            6-Week Safeguards
          </button>
          <button
            onClick={() => setFilterType('health')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'health' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Health
          </button>
          <button
            onClick={() => setFilterType('counseling')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'counseling' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Counseling
          </button>
          <button
            onClick={() => setFilterType('follow-up')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'follow-up' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Follow-ups
          </button>
        </div>
      </div>

      {/* STAFF DIRECT ASSIGNMENTS BANNER (Counselor Nargis & Coordinator) */}
      {userStaffNotifications.length > 0 && filterType !== 'six-week' && filterType !== 'health' && filterType !== 'follow-up' && (
        <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                🎯
              </span>
              <div>
                <h3 className="font-bold text-sm text-purple-950 font-display">
                  {isCounselor 
                    ? 'নার্গিস আপার কাউন্সেলিং দায়িত্ব ও রিমাইন্ডার তালিকা' 
                    : isCoordinator 
                    ? 'প্রোগ্রাম কো-অর্ডিনেটর রেসকিউ ভেরিফিকেশন' 
                    : 'স্টাফ এসাইনমেন্ট ও সরাসরি অ্যাকশন টাস্ক'}
                </h3>
                <p className="text-xs text-purple-700">
                  {isCounselor
                    ? 'ফিল্ড মবিলাইজার বা কো-অর্ডিনেটর কর্তৃক প্রদত্ত কাউন্সেলিং টাস্ক এবং PFA রেসকিউ ট্রমা সাপোর্ট'
                    : 'সদ্য রেসকিউ হওয়া শিশু বা জরুরি ফলো-আপ অ্যাকশন'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-purple-200 text-purple-900 rounded-full">
              {userStaffNotifications.filter(n => n.status !== 'Completed' && n.status !== 'Verified').length} Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userStaffNotifications.map((notif) => {
              const isDone = notif.status === 'Completed' || notif.status === 'Verified';
              return (
                <div 
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-all text-xs ${
                    isDone 
                      ? 'bg-purple-100/50 border-purple-200 opacity-60' 
                      : 'bg-white border-purple-200 shadow-2xs hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-purple-950">{notif.title}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      notif.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {notif.priority || 'Normal'}
                    </span>
                  </div>

                  <p className="text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                  {notif.childArea && (
                    <div className="mt-2 p-2 bg-purple-50 rounded-lg text-slate-800 flex items-center justify-between">
                      <span>📍 উদ্ধার এলাকা: <strong>{notif.childArea}</strong></span>
                      {notif.dueDate && <span className="text-purple-700 font-semibold">তারিখ: {notif.dueDate}</span>}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">প্রেরক: <strong>{notif.assignedBy || 'System'}</strong></span>
                    <div className="flex items-center gap-2">
                      {notif.childId && (
                        <button
                          onClick={() => handleOpenChild(notif.childId!)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          প্রোফাইল দেখুন
                        </button>
                      )}
                      {!isDone ? (
                        <button
                          onClick={() => updateNotificationStatus(notif.id, notif.type === 'NEW_RESCUE_VERIFICATION' ? 'Verified' : 'Completed')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          {notif.type === 'NEW_RESCUE_VERIFICATION' ? '✓ Verify' : '✓ Done'}
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold">✓ {notif.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6-Week Policy Summary Card */}
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 p-5 rounded-2xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-display">
              LEEDO 6-Week Shelter Stay Safeguard Protocol
            </h3>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              In accordance with international child protection standards and LEEDO guidelines, temporary residential shelter care should not exceed <strong>6 weeks (42 calendar days)</strong>. Any child approaching or exceeding 42 days must be prioritized for tracing verification, reunification handover, or transfer to registered statutory children's homes.
            </p>
          </div>
        </div>
      </div>

      {/* ALERTS LIST */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-sm text-slate-900">No Pending Alerts in this Category</h3>
            <p className="text-xs text-slate-500 mt-1">All case management timelines are currently up to date.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => handleOpenChild(alert.childId)}
              className={`bg-white p-4 rounded-2xl border transition-all hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                alert.severity === 'critical'
                  ? 'border-rose-300 hover:border-rose-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={alert.photoUrl}
                  alt={alert.childName}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      alert.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : alert.severity === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.type}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">{alert.childId}</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                      {alert.childName}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 mt-1">{alert.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{alert.description}</p>
                  <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-3">
                    <span>Shelter: <strong>{alert.shelterName}</strong></span>
                    <span>Case Worker: <strong>{alert.caseWorker}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-xs font-semibold text-rose-600 group-hover:underline flex items-center gap-1">
                  View Child Case
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
