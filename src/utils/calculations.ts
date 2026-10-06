import { Child } from '../types';

// Reference date for simulation or real-time (using current date)
export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function parseDaysDifference(startDateStr: string, endDateStr?: string): number {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getDaysInShelter(child: Child): number {
  // If child is reintegrated, referred, or left without notice, stop count at that event date
  let endDate: string | undefined;
  if (child.caseStatus === 'Reintegrated' && child.reintegration?.reintegrationDate) {
    endDate = child.reintegration.reintegrationDate;
  } else if (child.caseStatus === 'Government Shelter Referral' && child.referral?.referralDate) {
    endDate = child.referral.referralDate;
  } else if (child.caseStatus === 'Left Without Notice' && child.leftWithoutNotice?.date) {
    endDate = child.leftWithoutNotice.date;
  }
  return parseDaysDifference(child.admissionDate, endDate);
}

export function getDaysSinceRescue(child: Child): number {
  return parseDaysDifference(child.rescueDate);
}

export function getDaysUntil6Weeks(child: Child): number {
  const daysInShelter = getDaysInShelter(child);
  return 42 - daysInShelter;
}

export interface SixWeekAlertStatus {
  status: 'normal' | 'approaching' | 'reached' | 'exceeded';
  daysInShelter: number;
  daysRemaining: number;
  label: string;
  badgeClass: string;
}

export function getSixWeekAlertStatus(child: Child): SixWeekAlertStatus {
  const daysInShelter = getDaysInShelter(child);
  const isStillInShelter = child.currentShelterStatus === 'Active Resident' || 
    ['New Rescue', 'Initial Assessment', 'Shelter Stay', 'Family Tracing', 'Family Located', 'Family Assessment', 'Ready for Reintegration'].includes(child.caseStatus);

  if (!isStillInShelter) {
    return {
      status: 'normal',
      daysInShelter,
      daysRemaining: 42 - daysInShelter,
      label: `Discharged (${daysInShelter} days)`,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }

  if (daysInShelter > 42) {
    return {
      status: 'exceeded',
      daysInShelter,
      daysRemaining: 42 - daysInShelter,
      label: `Over 6 Weeks (${daysInShelter} days)`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold animate-pulse',
    };
  }

  if (daysInShelter === 42) {
    return {
      status: 'reached',
      daysInShelter,
      daysRemaining: 0,
      label: 'Reached 6 Weeks (42 days)',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
    };
  }

  if (daysInShelter >= 35) {
    const rem = 42 - daysInShelter;
    return {
      status: 'approaching',
      daysInShelter,
      daysRemaining: rem,
      label: `Approaching 6 Wks (${rem}d left)`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }

  return {
    status: 'normal',
    daysInShelter,
    daysRemaining: 42 - daysInShelter,
    label: `${daysInShelter} days in shelter`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
}

export function getHealthAlert(child: Child): {
  isDue: boolean;
  isOverdue: boolean;
  daysDiff: number;
  message: string;
} | null {
  const latest = [...child.healthRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  if (!latest?.nextCheckupDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkupDate = new Date(latest.nextCheckupDate);
  checkupDate.setHours(0, 0, 0, 0);

  const diffTime = checkupDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    return {
      isDue: true,
      isOverdue: true,
      daysDiff: Math.abs(daysDiff),
      message: `Health check-up overdue by ${Math.abs(daysDiff)} days`,
    };
  }
  if (daysDiff === 0) {
    return {
      isDue: true,
      isOverdue: false,
      daysDiff: 0,
      message: 'Health check-up due today',
    };
  }
  if (daysDiff <= 3) {
    return {
      isDue: true,
      isOverdue: false,
      daysDiff,
      message: `Health check-up due in ${daysDiff} days`,
    };
  }
  return null;
}

export function getCounselingAlert(child: Child): {
  isDue: boolean;
  isOverdue: boolean;
  daysDiff: number;
  message: string;
} | null {
  const latest = [...child.counselingRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  if (!latest?.nextCounselingDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(latest.nextCounselingDate);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    return {
      isDue: true,
      isOverdue: true,
      daysDiff: Math.abs(daysDiff),
      message: `Counseling session overdue by ${Math.abs(daysDiff)} days`,
    };
  }
  if (daysDiff <= 2) {
    return {
      isDue: true,
      isOverdue: false,
      daysDiff,
      message: daysDiff === 0 ? 'Counseling due today' : `Counseling session due in ${daysDiff} days`,
    };
  }
  return null;
}

export function getNextPendingFollowUp(child: Child) {
  if (child.caseStatus === 'Reintegrated') {
    const pending = child.postReintegrationFollowUps.filter((f) => !f.completed);
    if (pending.length === 0) return null;
    const sorted = [...pending].sort((a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime());
    const next = sorted[0];
    const days = parseDaysDifference(getTodayDateString(), next.followUpDate);
    const isOverdue = new Date(next.followUpDate) < new Date(getTodayDateString());
    return {
      type: 'Reintegration' as const,
      followUp: next,
      isOverdue,
      days,
    };
  }
  if (child.caseStatus === 'Government Shelter Referral' || child.caseStatus === 'Referral Follow-up') {
    const pending = child.referralFollowUps.filter((f) => !f.completed);
    if (pending.length === 0) return null;
    const sorted = [...pending].sort((a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime());
    const next = sorted[0];
    const isOverdue = new Date(next.followUpDate) < new Date(getTodayDateString());
    return {
      type: 'Referral' as const,
      followUp: next,
      isOverdue,
      days: 0,
    };
  }
  return null;
}
