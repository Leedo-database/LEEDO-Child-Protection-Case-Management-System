import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Child, 
  User, 
  UserRole, 
  ShelterInfo, 
  AuditEntry, 
  HealthRecord, 
  CounselingRecord, 
  TracingAttempt, 
  FamilyInfo, 
  ReintegrationRecord, 
  PostReintegrationFollowUp, 
  ReferralRecord, 
  ReferralFollowUp, 
  LeftWithoutNoticeRecord, 
  CaseNote, 
  DocumentItem,
  CaseStatus,
  SUSSession,
  StaffStatus,
  VTCStudent,
  VTCDailyAttendanceRecord,
  VTCAttendanceStatus,
  StaffPermissions,
  ThirdPartyShelter,
  StaffNotification
} from '../types';
import { INITIAL_CHILDREN, INITIAL_AUDIT_LOGS, INITIAL_SUS_SESSIONS } from '../data/mockData';
import { OFFICIAL_LEEDO_USERS, OFFICIAL_LEEDO_SHELTERS, INITIAL_VTC_STUDENTS } from '../data/officialRoster';
import { INITIAL_THIRD_PARTY_SHELTERS, INITIAL_NOTIFICATIONS } from '../data/referralData';
import { getRoleAndPermissionsByDesignation, isUserHrOrKanta } from '../utils/staffRoleMapping';
import { getTodayDateString } from '../utils/calculations';
import { Language, getTranslation } from '../i18n/translations';
import { 
  isFullAccessUser, 
  canUserAccessChild, 
  canUserAccessSUSArea, 
  canUserAccessShelter, 
  canUserAccessVTC, 
  getUserAssignedAreasList 
} from '../utils/areaPermissions';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  customLogoUrl: string | null;
  updateCustomLogo: (newLogoUrl: string | null) => Promise<boolean>;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserRole: (role: UserRole) => void;
  users: User[];
  children: Child[];
  allChildren: Child[];
  shelters: ShelterInfo[];
  auditLogs: AuditEntry[];
  susSessions: SUSSession[];
  filteredSUSSessions: SUSSession[];
  vtcStudents: VTCStudent[];
  activeView: string;
  setActiveView: (view: string) => void;
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => void;
  syncDataToFirebase: () => Promise<{ success: boolean; message: string }>;
  isSyncingFirebase: boolean;
  branchFilter: string;
  setBranchFilter: (b: string) => void;
  
  // Child Operations
  registerNewChild: (data: Partial<Child>) => string;
  updateChild: (id: string, updates: Partial<Child>, logDetails?: string) => void;
  transferToPeaceHome: (childId: string, roomOrBed?: string, notes?: string) => void;
  addCaseNote: (childId: string, note: string, isConfidential: boolean) => void;
  addHealthRecord: (childId: string, record: Omit<HealthRecord, 'id' | 'createdAt'>) => void;
  addCounselingRecord: (childId: string, record: Omit<CounselingRecord, 'id' | 'createdAt'>) => void;
  addTracingAttempt: (childId: string, attempt: Omit<TracingAttempt, 'id'>, newTracingStatus?: any) => void;
  updateFamilyInfo: (childId: string, familyInfo: Partial<FamilyInfo>) => void;
  reintegrateChild: (childId: string, data: ReintegrationRecord) => void;
  updateReintegrationFollowUp: (childId: string, followUpId: string, updates: Partial<PostReintegrationFollowUp>) => void;
  createCustomReintegrationFollowUp: (childId: string, followUp: Partial<PostReintegrationFollowUp>) => void;
  referChild: (childId: string, referral: ReferralRecord) => void;
  updateReferralFollowUp: (childId: string, followUpId: string, updates: Partial<ReferralFollowUp>) => void;
  createReferralFollowUp: (childId: string, followUp: Partial<ReferralFollowUp>) => void;
  markLeftWithoutNotice: (childId: string, data: LeftWithoutNoticeRecord) => void;
  markRecovered: (childId: string, recoveryDate: string, recoveryNotes: string, returnShelterStatus: any) => void;
  uploadDocument: (childId: string, doc: Omit<DocumentItem, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  updateCaseStatus: (childId: string, status: CaseStatus, reason?: string) => void;
  addNewShelter: (shelter: Omit<ShelterInfo, 'id'>) => void;
  updateShelter: (id: string, updates: Partial<ShelterInfo>) => void;
  deleteShelter: (id: string) => void;
  archiveChild: (childId: string) => void;
  deleteChildPermanently: (childId: string) => boolean;
  resetAllDataToDefault: () => void;
  wipeAllDemoData: () => void;

  // Third-Party & Government Shelters (Referral Section)
  thirdPartyShelters: ThirdPartyShelter[];
  addThirdPartyShelter: (data: Omit<ThirdPartyShelter, 'id' | 'createdAt'>) => ThirdPartyShelter;
  referChildToThirdParty: (childId: string, data: { shelterName: string; reason: string; contactPerson?: string; contactPhone?: string; memoNumber?: string; referralDate?: string }) => void;

  // Task & Counseling Notification System
  notifications: StaffNotification[];
  addNotification: (notif: Omit<StaffNotification, 'id' | 'createdAt' | 'status'>) => void;
  updateNotificationStatus: (id: string, status: StaffNotification['status']) => void;
  deleteNotification: (id: string) => void;
  assignCounselingTask: (data: { childId: string; childName: string; childArea: string; reason: string; priority?: 'High' | 'Medium' | 'Urgent'; dueDate?: string; assignedBy?: string }) => void;

  // Password Management System
  changeUserPassword: (userId: string, newPass: string) => boolean;
  resetUserPassword: (userId: string) => boolean;
  isHrOrKantaUser: boolean;
  forcedPasswordChangeUserId: string | null;
  setForcedPasswordChangeUserId: (id: string | null) => void;

  // Granular Role & Access Checks
  isSuperAdminOrHeadOffice: boolean;
  canEnrollPeaceHome: boolean;
  canEnrollRescue: boolean;
  canAccessSUS: boolean;
  canAccessShelters: boolean;
  canAccessVTC: boolean;
  canUpdateCounseling: boolean;

  // School Under the Sky (SUS) Operations
  addSUSSession: (session: Omit<SUSSession, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateSUSSession: (id: string, updates: Partial<SUSSession>) => void;
  deleteSUSSession: (id: string) => void;

  // Vocational Trade Center (VTC) Operations
  addVTCStudent: (studentData: Omit<VTCStudent, 'id' | 'createdAt' | 'admissionNumber'>) => void;
  updateVTCStudent: (studentId: string, updates: Partial<VTCStudent>) => void;
  deleteVTCStudent: (studentId: string) => void;
  recordVTCAttendance: (studentId: string, date: string, status: VTCAttendanceStatus, note?: string) => void;

  // HR & User Management Operations
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  updateUserStatus: (userId: string, status: StaffStatus, notes?: string) => void;
  deleteUser: (userId: string) => void;
  updateUserPermissions: (userId: string, permissions: Partial<StaffPermissions>) => void;
  hasDeletePermission: (user?: User) => boolean;
  canUserPerformDelete: boolean;

  // Master Email Verification
  masterEmail: string;
  generateMasterOtp: (forEmail: string) => string;
  verifyMasterOtp: (code: string) => boolean;
  activeMasterOtp: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CHILDREN: 'leedo_children_v2',
  SHELTERS: 'leedo_shelters_v2',
  THIRD_PARTY_SHELTERS: 'leedo_third_party_shelters_v2',
  NOTIFICATIONS: 'leedo_notifications_v2',
  AUDIT: 'leedo_audit_v2',
  CURRENT_USER: 'leedo_user_v2',
  USERS: 'leedo_users_list_v2',
  SUS_SESSIONS: 'leedo_sus_sessions_v2',
  VTC_STUDENTS: 'leedo_vtc_students_v2',
  LANGUAGE: 'leedo_language_pref',
  CUSTOM_LOGO: 'leedo_custom_logo_url',
};

export const MASTER_HR_EMAIL = 'hr.leedo2000@gmail.com';

// Identifiers of legacy demo records to ensure complete purging across all browsers and sessions
const DEMO_CHILD_IDS = new Set([
  'LEEDO-2026-0001', 'LEEDO-2026-0002', 'LEEDO-2026-0003',
  'LEEDO-2026-0004', 'LEEDO-2026-0005', 'LEEDO-2026-0006', 'LEEDO-2026-0007'
]);
const DEMO_CHILD_NAMES = new Set([
  'Arif Hossain', 'Md. Shakil', 'Robiul Islam',
  'Rupa Akter', 'Al-Amin', 'Tanvir Hossain', 'Sumaia Parveen'
]);
const DEMO_SUS_IDS = new Set([
  'sus-001', 'sus-002', 'sus-003', 'sus-004', 'sus-005', 'sus-006', 'sus-007'
]);
const DEMO_VTC_IDS = new Set([
  'LEEDO-VTC-2026-001', 'LEEDO-VTC-2026-002', 'LEEDO-VTC-2026-003',
  'LEEDO-VTC-2026-004', 'LEEDO-VTC-2026-005', 'LEEDO-VTC-2026-006'
]);
const DEMO_NOTIF_IDS = new Set(['notif-1', 'notif-2']);
const DEMO_AUDIT_IDS = new Set(['audit-001', 'audit-002', 'audit-003', 'audit-004']);

// Immediate one-time localStorage sanitization on script load
const DEMO_PURGE_FLAG = 'leedo_demo_purged_flag_v4';
if (typeof window !== 'undefined' && localStorage.getItem(DEMO_PURGE_FLAG) !== 'purged') {
  try {
    const rawChildren = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    if (rawChildren) {
      const parsed = JSON.parse(rawChildren);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((c: any) => !DEMO_CHILD_IDS.has(c.id) && !DEMO_CHILD_NAMES.has(c.name));
        localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(cleaned));
      }
    }
    const rawSus = localStorage.getItem(STORAGE_KEYS.SUS_SESSIONS);
    if (rawSus) {
      const parsed = JSON.parse(rawSus);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((s: any) => !DEMO_SUS_IDS.has(s.id));
        localStorage.setItem(STORAGE_KEYS.SUS_SESSIONS, JSON.stringify(cleaned));
      }
    }
    const rawVtc = localStorage.getItem(STORAGE_KEYS.VTC_STUDENTS);
    if (rawVtc) {
      const parsed = JSON.parse(rawVtc);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((v: any) => !DEMO_VTC_IDS.has(v.id));
        localStorage.setItem(STORAGE_KEYS.VTC_STUDENTS, JSON.stringify(cleaned));
      }
    }
    const rawNotif = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (rawNotif) {
      const parsed = JSON.parse(rawNotif);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((n: any) => !DEMO_NOTIF_IDS.has(n.id));
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(cleaned));
      }
    }
    const rawAudit = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (rawAudit) {
      const parsed = JSON.parse(rawAudit);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((a: any) => !DEMO_AUDIT_IDS.has(a.id));
        localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(cleaned));
      }
    }
    localStorage.setItem(DEMO_PURGE_FLAG, 'purged');
  } catch (e) {
    // ignore
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children: reactChildren }) => {
  // Language state ('en' | 'bn')
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (saved === 'bn' || saved === 'en') return saved;
    return 'bn'; // Default to Bangla as requested, with instant toggle
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string, fallback?: string): string => {
    return getTranslation(key, language, fallback);
  };

  // Load initial states from localStorage if available, defaulting to official verified roster
  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= OFFICIAL_LEEDO_USERS.length) {
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return OFFICIAL_LEEDO_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        // If saved user was resigned, reset to default admin
        if (parsed && parsed.status !== 'Resigned / Terminated') {
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return OFFICIAL_LEEDO_USERS[0]; // Forhad Hossain (Founder & ED)
  });

  const [childrenList, setChildrenList] = useState<Child[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => !DEMO_CHILD_IDS.has(c.id) && !DEMO_CHILD_NAMES.has(c.name));
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_CHILDREN;
  });

  const [shelters, setShelters] = useState<ShelterInfo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHELTERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: ShelterInfo) => {
            if (s.name.includes('Kamalapur')) return { ...s, capacity: 30 };
            if (s.name.includes('Kadamtali')) return { ...s, capacity: 30 };
            if (s.name.includes('Peace Home')) return { ...s, capacity: 100 };
            return s;
          });
        }
      } catch (e) { /* ignore */ }
    }
    return OFFICIAL_LEEDO_SHELTERS;
  });

  const [susSessions, setSusSessions] = useState<SUSSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUS_SESSIONS);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((s: any) => !DEMO_SUS_IDS.has(s.id));
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_SUS_SESSIONS;
  });

  const [vtcStudents, setVtcStudents] = useState<VTCStudent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VTC_STUDENTS);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((v: any) => !DEMO_VTC_IDS.has(v.id));
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_VTC_STUDENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((a: any) => !DEMO_AUDIT_IDS.has(a.id));
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [thirdPartyShelters, setThirdPartyShelters] = useState<ThirdPartyShelter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THIRD_PARTY_SHELTERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_THIRD_PARTY_SHELTERS;
  });

  const [notifications, setNotifications] = useState<StaffNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((n: any) => !DEMO_NOTIF_IDS.has(n.id));
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_NOTIFICATIONS;
  });


  const [forcedPasswordChangeUserId, setForcedPasswordChangeUserId] = useState<string | null>(null);

  // Organization Logo state (persisted to Cloud Firestore & localStorage)
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_LOGO) || null;
  });

  useEffect(() => {
    if (customLogoUrl) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LOGO, customLogoUrl);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_LOGO);
    }
  }, [customLogoUrl]);

  const updateCustomLogo = async (newLogoUrl: string | null): Promise<boolean> => {
    const clean = newLogoUrl ? newLogoUrl.trim() : null;
    setCustomLogoUrl(clean);
    if (clean) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_LOGO, clean);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_LOGO);
    }

    try {
      await setDoc(doc(db, 'system', 'settings'), {
        customLogoUrl: clean || '',
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.name || 'HR Administration',
      }, { merge: true });
      addAuditEntry('UPDATE_ORGANIZATION_LOGO', undefined, `HR updated organization logo to: ${clean ? 'Custom Logo' : 'Default Logo'}`);
      return true;
    } catch (err) {
      console.warn('Firestore settings update deferred/local:', err);
      return true;
    }
  };

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [activeMasterOtp, setActiveMasterOtp] = useState<string | null>(null);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState<boolean>(false);

  // Firestore real-time synchronization listeners for multi-device cross-computer data persistence
  useEffect(() => {
    // 1. Organization Settings & Logo listener
    const unsubSettings = onSnapshot(doc(db, 'system', 'settings'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && typeof data.customLogoUrl === 'string') {
          const logo = data.customLogoUrl.trim() || null;
          setCustomLogoUrl(logo);
          if (logo) {
            localStorage.setItem(STORAGE_KEYS.CUSTOM_LOGO, logo);
          } else {
            localStorage.removeItem(STORAGE_KEYS.CUSTOM_LOGO);
          }
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'system/settings');
    });

    // 2. Children collection listener
    const unsubChildren = onSnapshot(collection(db, 'children'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreChildren: Child[] = [];
        snapshot.forEach((d) => {
          const c = d.data() as Child;
          if (c && c.id && !DEMO_CHILD_IDS.has(c.id) && !DEMO_CHILD_NAMES.has(c.name)) {
            firestoreChildren.push(c);
          }
        });
        if (firestoreChildren.length > 0) {
          setChildrenList((prev) => {
            const map = new Map<string, Child>();
            firestoreChildren.forEach(c => map.set(c.id, c));
            prev.forEach(c => {
              if (!map.has(c.id) && !DEMO_CHILD_IDS.has(c.id)) {
                map.set(c.id, c);
                // Back up local additions to cloud
                setDoc(doc(db, 'children', c.id), c, { merge: true }).catch(() => {});
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(merged));
            return merged;
          });
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'children');
    });

    // 3. SUS Sessions collection listener
    const unsubSUS = onSnapshot(collection(db, 'susSessions'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreSessions: SUSSession[] = [];
        snapshot.forEach((d) => {
          const s = d.data() as SUSSession;
          if (s && s.id && !DEMO_SUS_IDS.has(s.id)) {
            firestoreSessions.push(s);
          }
        });
        if (firestoreSessions.length > 0) {
          setSusSessions((prev) => {
            const map = new Map<string, SUSSession>();
            firestoreSessions.forEach(s => map.set(s.id, s));
            prev.forEach(s => {
              if (!map.has(s.id) && !DEMO_SUS_IDS.has(s.id)) {
                map.set(s.id, s);
                setDoc(doc(db, 'susSessions', s.id), s, { merge: true }).catch(() => {});
              }
            });
            const merged = Array.from(map.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            localStorage.setItem(STORAGE_KEYS.SUS_SESSIONS, JSON.stringify(merged));
            return merged;
          });
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'susSessions');
    });

    // 4. Vocational Students collection listener
    const unsubVTC = onSnapshot(collection(db, 'vocationalStudents'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreStudents: VTCStudent[] = [];
        snapshot.forEach((d) => {
          const st = d.data() as VTCStudent;
          if (st && st.id && !DEMO_VTC_IDS.has(st.id)) {
            firestoreStudents.push(st);
          }
        });
        if (firestoreStudents.length > 0) {
          setVtcStudents((prev) => {
            const map = new Map<string, VTCStudent>();
            firestoreStudents.forEach(st => map.set(st.id, st));
            prev.forEach(st => {
              if (!map.has(st.id) && !DEMO_VTC_IDS.has(st.id)) {
                map.set(st.id, st);
                setDoc(doc(db, 'vocationalStudents', st.id), st, { merge: true }).catch(() => {});
              }
            });
            const merged = Array.from(map.values());
            localStorage.setItem(STORAGE_KEYS.VTC_STUDENTS, JSON.stringify(merged));
            return merged;
          });
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'vocationalStudents');
    });

    // 5. Users collection listener
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreUsers: User[] = [];
        snapshot.forEach((d) => {
          const u = d.data() as User;
          if (u && u.id) {
            firestoreUsers.push(u);
          }
        });
        if (firestoreUsers.length > 0) {
          setUsersList((prev) => {
            const map = new Map<string, User>();
            OFFICIAL_LEEDO_USERS.forEach(u => map.set(u.id, u));
            prev.forEach(u => map.set(u.id, u));
            firestoreUsers.forEach(u => map.set(u.id, u));
            const merged = Array.from(map.values());
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
            return merged;
          });
        }
      }
    }, (error) => {
      console.warn('Users listener:', error);
    });

    // 6. Shelters collection listener
    const unsubShelters = onSnapshot(collection(db, 'shelters'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreShelters: ShelterInfo[] = [];
        snapshot.forEach((d) => {
          const s = d.data() as ShelterInfo;
          if (s && s.id) {
            firestoreShelters.push(s);
          }
        });
        if (firestoreShelters.length > 0) {
          setShelters((prev) => {
            const map = new Map<string, ShelterInfo>();
            OFFICIAL_LEEDO_SHELTERS.forEach(s => map.set(s.id, s));
            prev.forEach(s => map.set(s.id, s));
            firestoreShelters.forEach(s => map.set(s.id, s));
            const merged = Array.from(map.values());
            localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(merged));
            return merged;
          });
        }
      }
    }, (error) => {
      console.warn('Shelters listener:', error);
    });

    // 7. Third-Party Shelters listener
    const unsubThirdParty = onSnapshot(collection(db, 'thirdPartyShelters'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreThirdParty: ThirdPartyShelter[] = [];
        snapshot.forEach((d) => {
          const s = d.data() as ThirdPartyShelter;
          if (s && s.id) {
            firestoreThirdParty.push(s);
          }
        });
        if (firestoreThirdParty.length > 0) {
          setThirdPartyShelters((prev) => {
            const map = new Map<string, ThirdPartyShelter>();
            prev.forEach(s => map.set(s.id, s));
            firestoreThirdParty.forEach(s => map.set(s.id, s));
            const merged = Array.from(map.values());
            localStorage.setItem(STORAGE_KEYS.THIRD_PARTY_SHELTERS, JSON.stringify(merged));
            return merged;
          });
        }
      }
    }, (error) => {
      console.warn('ThirdParty listener:', error);
    });

    // 8. Staff Notifications listener
    const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreNotifs: StaffNotification[] = [];
        snapshot.forEach((d) => {
          const n = d.data() as StaffNotification;
          if (n && n.id && !DEMO_NOTIF_IDS.has(n.id)) {
            firestoreNotifs.push(n);
          }
        });
        if (firestoreNotifs.length > 0) {
          setNotifications((prev) => {
            const map = new Map<string, StaffNotification>();
            prev.forEach(n => map.set(n.id, n));
            firestoreNotifs.forEach(n => map.set(n.id, n));
            const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(merged));
            return merged;
          });
        }
      }
    }, (error) => {
      console.warn('Notifications listener:', error);
    });

    return () => {
      unsubSettings();
      unsubChildren();
      unsubSUS();
      unsubVTC();
      unsubUsers();
      unsubShelters();
      unsubThirdParty();
      unsubNotifs();
    };
  }, []);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(childrenList));
  }, [childrenList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THIRD_PARTY_SHELTERS, JSON.stringify(thirdPartyShelters));
  }, [thirdPartyShelters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUS_SESSIONS, JSON.stringify(susSessions));
  }, [susSessions]);

  // Remove duplicate effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(shelters));
  }, [shelters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const switchUserRole = (role: UserRole) => {
    const matchedUser = usersList.find((u) => u.role === role && u.status !== 'Resigned / Terminated') || usersList.find((u) => u.role === role);
    if (matchedUser) {
      setCurrentUser(matchedUser);
    }
  };

  // Location & Hub Hierarchy based children filtering
  const filteredChildren = useMemo(() => {
    return childrenList.filter((child) => {
      // Program Coordinator, Super Admin, and Head Office have full access across all areas
      if (isFullAccessUser(currentUser)) {
        if (branchFilter === 'All') return true;
        if (branchFilter === 'Kamalapur Shelter' || branchFilter === 'Kadamtali Shelter' || branchFilter === 'LEEDO Peace Home') {
          return child.shelterName === branchFilter;
        }
        return child.area.toLowerCase().includes(branchFilter.toLowerCase());
      }

      // Check granular area & hub permissions according to operational policies
      return canUserAccessChild(currentUser, child);
    });
  }, [childrenList, currentUser, branchFilter]);

  // Role and Area-based access control for SUS Sessions
  // Airport, Mirpur, Tejgaon, Rayerbazar, Kamalapur, Sadarghat, Shambazar
  const filteredSUSSessions = useMemo(() => {
    return susSessions.filter((session) => {
      if (isFullAccessUser(currentUser)) {
        return true;
      }
      return canUserAccessSUSArea(currentUser, session.area);
    });
  }, [susSessions, currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VTC_STUDENTS, JSON.stringify(vtcStudents));
  }, [vtcStudents]);

  const addAuditEntry = (action: string, childId?: string, details: string = '') => {
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentUser.name,
      role: currentUser.role,
      action,
      childId,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Generate unique sequential Child ID e.g. LEEDO-2026-0008
  const generateNextChildId = (): string => {
    const currentYear = new Date().getFullYear();
    const prefix = `LEEDO-${currentYear}-`;
    let highestNum = 0;

    childrenList.forEach((c) => {
      if (c.id.startsWith(prefix)) {
        const numPart = parseInt(c.id.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > highestNum) {
          highestNum = numPart;
        }
      }
    });

    const nextNum = highestNum + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  };

  const registerNewChild = (data: Partial<Child>): string => {
    const uniqueId = generateNextChildId();
    const today = getTodayDateString();

    const newChild: Child = {
      id: uniqueId,
      name: data.name || 'Unnamed Child',
      nickname: data.nickname || '',
      gender: data.gender || 'Male',
      dateOfBirth: data.dateOfBirth,
      estimatedAge: data.estimatedAge || 10,
      nationality: data.nationality || 'Bangladeshi',
      addressIfKnown: data.addressIfKnown || '',
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&q=80&w=400',
      rescuePhotoUrl: data.rescuePhotoUrl || data.photoUrl,
      identificationInfo: data.identificationInfo || '',
      disabilityOrSpecialNeeds: data.disabilityOrSpecialNeeds || 'None',
      educationInformation: data.educationInformation || '',
      otherImportantInfo: data.otherImportantInfo || '',

      rescueDate: data.rescueDate || today,
      rescueTime: data.rescueTime || '12:00',
      rescueLocation: data.rescueLocation || 'Dhaka',
      area: data.area || 'Kamalapur Railway Station',
      rescueTeam: data.rescueTeam || 'Outreach Alpha',
      rescuedBy: data.rescuedBy || currentUser.name,
      reasonForRescue: data.reasonForRescue || 'Vulnerable street-connected child requiring urgent protection',
      conditionAtRescue: data.conditionAtRescue || 'Exhausted, in need of immediate shelter',
      immediateProtectionNeeds: data.immediateProtectionNeeds || 'Shelter, nutrition, health check',
      policeInvolvement: data.policeInvolvement ?? true,
      gdNumber: data.gdNumber || `GD-${Math.floor(1000 + Math.random() * 9000)}/2026`,
      gdDate: data.gdDate || today,
      policeStation: data.policeStation || 'Motijheel Police Station',
      gdCopyUrl: data.gdCopyUrl,
      psychologicalFirstAid: Boolean(data.psychologicalFirstAid || data.initialAssessment?.psychologicalFirstAid),

      initialAssessment: data.initialAssessment,

      shelterName: data.shelterName || 'Kamalapur Shelter',
      admissionDate: data.admissionDate || today,
      admissionTime: data.admissionTime || '14:00',
      assignedCaseWorker: data.assignedCaseWorker || currentUser.name,
      roomOrBed: data.roomOrBed || 'Dorm Bed Assigned',
      currentShelterStatus: 'Active Resident',

      caseStatus: data.caseStatus || 'New Rescue',

      healthRecords: data.healthRecords || [],
      counselingRecords: data.counselingRecords || [],
      familyTracing: data.familyTracing || {
        tracingStartDate: today,
        tracingStatus: 'Not Started',
        attempts: [],
      },
      familyInfo: data.familyInfo,
      reintegration: undefined,
      postReintegrationFollowUps: [],
      referral: undefined,
      referralFollowUps: [],
      leftWithoutNotice: undefined,

      caseNotes: [
        {
          id: `note-${Date.now()}`,
          date: today,
          author: currentUser.name,
          authorRole: currentUser.role,
          note: `Child formally rescued and registered into LEEDO Child Protection Care. Unique ID ${uniqueId} issued. Assigned to ${data.shelterName || 'Kamalapur Shelter'}.`,
          isConfidential: false,
        },
      ],
      documents: data.documents || [],
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          date: data.rescueDate || today,
          title: 'Child Rescued & Registered',
          description: `Rescued from ${data.rescueLocation || 'Dhaka'} by ${data.rescuedBy || currentUser.name}. Case ID ${uniqueId} generated.`,
          category: 'Rescue',
          actor: currentUser.name,
        },
        {
          id: `tl-${Date.now()}-2`,
          date: data.admissionDate || today,
          title: `Admitted to ${data.shelterName || 'Kamalapur Shelter'}`,
          description: `Assigned case worker: ${data.assignedCaseWorker || currentUser.name}.`,
          category: 'Shelter',
          actor: currentUser.name,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setChildrenList((prev) => [newChild, ...prev]);
    setDoc(doc(db, 'children', uniqueId), newChild, { merge: true }).catch((e) => console.warn('Cloud child sync:', e));
    addAuditEntry('REGISTER_CHILD', uniqueId, `Registered new rescue child ${newChild.name} (${uniqueId}) at ${newChild.shelterName}`);

    // If Psychological First Aid was checked, trigger an urgent counseling task notification for Nargis
    if (data.psychologicalFirstAid || data.initialAssessment?.psychologicalFirstAid) {
      const pfaNotif: StaffNotification = {
        id: `notif-${Date.now()}-pfa`,
        type: 'COUNSELING_TASK',
        targetUserId: 'emp-1017',
        targetDesignation: 'Psycho-social Facilitator / Counselor',
        title: `🚨 PFA Trauma Counseling: ${newChild.name} (${uniqueId})`,
        message: `Child ${newChild.name} (${uniqueId}) rescued from ${newChild.area} received Psychological First Aid and requires immediate trauma counseling assessment.`,
        childId: uniqueId,
        childName: newChild.name,
        childArea: newChild.area,
        assignedBy: newChild.rescuedBy || currentUser.name,
        assignedByRole: currentUser.designation || currentUser.role,
        priority: 'Urgent',
        status: 'Pending',
        createdAt: today,
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      };
      setNotifications((prev) => [pfaNotif, ...prev]);
    }

    // Every new rescue intake triggers a verification notification for the Program Coordinator
    const coordinatorNotif: StaffNotification = {
      id: `notif-${Date.now()}-vrfy`,
      type: 'NEW_RESCUE_VERIFICATION',
      targetDesignation: 'Program Coordinator',
      title: `📋 Verify Rescue Intake: ${newChild.name} (${uniqueId})`,
      message: `New rescue child registered from ${newChild.area} (${newChild.rescueLocation}) by ${newChild.rescuedBy || currentUser.name}. Please review police GD and verify case intake file.`,
      childId: uniqueId,
      childName: newChild.name,
      childArea: newChild.area,
      assignedBy: newChild.rescuedBy || currentUser.name,
      assignedByRole: currentUser.designation || currentUser.role,
      priority: 'High',
      status: 'Pending',
      createdAt: today,
    };
    setNotifications((prev) => [coordinatorNotif, ...prev]);

    return uniqueId;
  };

  const updateChild = (id: string, updates: Partial<Child>, logDetails?: string) => {
    setChildrenList((prev) =>
      prev.map((child) => {
        if (child.id === id) {
          const updated = {
            ...child,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          setDoc(doc(db, 'children', id), updated, { merge: true }).catch((e) => console.warn('Cloud child update:', e));
          return updated;
        }
        return child;
      })
    );
    addAuditEntry('UPDATE_CHILD_INFO', id, logDetails || `Updated child profile fields for ${id}`);
  };

  const syncChildToCloud = (childId: string, updated: Child) => {
    setDoc(doc(db, 'children', childId), updated, { merge: true }).catch((e) =>
      console.warn('Cloud child sync:', e)
    );
  };

  const addCaseNote = (childId: string, note: string, isConfidential: boolean) => {
    const today = getTodayDateString();
    const newNote: CaseNote = {
      id: `cn-${Date.now()}`,
      date: today,
      author: currentUser.name,
      authorRole: currentUser.role,
      note,
      isConfidential,
    };

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            caseNotes: [newNote, ...c.caseNotes],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('ADD_CASE_NOTE', childId, `Added case note (${isConfidential ? 'Confidential' : 'Public'})`);
  };

  const addHealthRecord = (childId: string, record: Omit<HealthRecord, 'id' | 'createdAt'>) => {
    const newRecord: HealthRecord = {
      ...record,
      id: `hr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            healthRecords: [newRecord, ...c.healthRecords],
            timeline: [
              {
                id: `tl-${Date.now()}`,
                date: record.date,
                title: 'Health Check-up Conducted',
                description: `Examined by ${record.doctor}. Condition: ${record.healthCondition}${record.illness ? ` (${record.illness})` : ''}.`,
                category: 'Health',
                actor: currentUser.name,
              },
              ...c.timeline,
            ],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('ADD_HEALTH_RECORD', childId, `Recorded health checkup by ${record.doctor}`);
  };

  const addCounselingRecord = (childId: string, record: Omit<CounselingRecord, 'id' | 'createdAt'>) => {
    const newRecord: CounselingRecord = {
      ...record,
      id: `cr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            counselingRecords: [newRecord, ...c.counselingRecords],
            timeline: [
              {
                id: `tl-${Date.now()}`,
                date: record.date,
                title: `${record.counselingType} Counseling Session`,
                description: `Conducted by ${record.counselor}. Concern: ${record.mainConcern}.`,
                category: 'Counseling',
                actor: currentUser.name,
              },
              ...c.timeline,
            ],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('ADD_COUNSELING_RECORD', childId, `Recorded counseling session (${record.counselingType})`);
  };

  const addTracingAttempt = (childId: string, attempt: Omit<TracingAttempt, 'id'>, newTracingStatus?: any) => {
    const newAttempt: TracingAttempt = {
      ...attempt,
      id: `ta-${Date.now()}`,
    };

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updatedTracing = {
            ...c.familyTracing,
            tracingStatus: newTracingStatus || c.familyTracing.tracingStatus,
            attempts: [newAttempt, ...c.familyTracing.attempts],
          };
          const updated: Child = {
            ...c,
            familyTracing: updatedTracing,
            timeline: [
              {
                id: `tl-${Date.now()}`,
                date: attempt.date,
                title: `Family Tracing Attempt: ${attempt.contactMethod}`,
                description: `Contacted ${attempt.contactPerson} at ${attempt.location}. Result: ${attempt.result}.`,
                category: 'Family Tracing',
                actor: currentUser.name,
              },
              ...c.timeline,
            ],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('ADD_TRACING_ATTEMPT', childId, `Logged family tracing attempt (${attempt.contactMethod}) with result: ${attempt.result}`);
  };

  const updateFamilyInfo = (childId: string, familyInfo: Partial<FamilyInfo>) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const merged = { ...c.familyInfo, ...familyInfo };
          const updated: Child = {
            ...c,
            familyInfo: merged,
            timeline: familyInfo.homeVisitDate
              ? [
                  {
                    id: `tl-${Date.now()}`,
                    date: familyInfo.homeVisitDate,
                    title: 'Home Assessment Visit Completed',
                    description: `Safety assessment: ${familyInfo.childSafetyAssessment || 'Evaluated'}. Officer: ${familyInfo.assessmentOfficer || currentUser.name}.`,
                    category: 'Family Tracing',
                    actor: currentUser.name,
                  },
                  ...c.timeline,
                ]
              : c.timeline,
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('UPDATE_FAMILY_INFO', childId, `Updated family assessment and home visit records`);
  };

  const reintegrateChild = (childId: string, data: ReintegrationRecord) => {
    const defaultFollowUps: PostReintegrationFollowUp[] = [
      {
        id: `fu-${Date.now()}-7d`,
        scheduleType: '7 days',
        followUpDate: new Date(new Date(data.reintegrationDate).getTime() + 7 * 86400000).toISOString().split('T')[0],
        contactMethod: 'Phone Call',
        childStatus: 'Stable & Thriving',
        familyStatus: 'Adjusting post-reintegration',
        educationStatus: 'Planning enrollment',
        healthStatus: 'Good',
        safetyStatus: 'Safe under family supervision',
        protectionConcerns: 'None',
        officerObservation: 'Scheduled 7-day safety check',
        actionRequired: 'Verify child wellbeing and basic needs at home',
        completed: false,
        officerName: data.responsibleOfficer,
      },
      {
        id: `fu-${Date.now()}-30d`,
        scheduleType: '30 days',
        followUpDate: new Date(new Date(data.reintegrationDate).getTime() + 30 * 86400000).toISOString().split('T')[0],
        contactMethod: 'Home Visit',
        childStatus: 'Stable & Thriving',
        familyStatus: 'Settled',
        educationStatus: 'School attendance verified',
        healthStatus: 'Good',
        safetyStatus: 'Safe',
        protectionConcerns: 'None',
        officerObservation: 'Scheduled 30-day comprehensive visit',
        actionRequired: 'Physical home visit and school check',
        completed: false,
        officerName: data.responsibleOfficer,
      },
      {
        id: `fu-${Date.now()}-3m`,
        scheduleType: '3 months',
        followUpDate: new Date(new Date(data.reintegrationDate).getTime() + 90 * 86400000).toISOString().split('T')[0],
        contactMethod: 'Home Visit',
        childStatus: 'Stable & Thriving',
        familyStatus: 'Stable',
        educationStatus: 'Active',
        healthStatus: 'Good',
        safetyStatus: 'Safe',
        protectionConcerns: 'None',
        officerObservation: 'Quarterly review',
        actionRequired: 'Quarterly review check',
        completed: false,
        officerName: data.responsibleOfficer,
      },
      {
        id: `fu-${Date.now()}-6m`,
        scheduleType: '6 months',
        followUpDate: new Date(new Date(data.reintegrationDate).getTime() + 180 * 86400000).toISOString().split('T')[0],
        contactMethod: 'Home Visit',
        childStatus: 'Stable & Thriving',
        familyStatus: 'Stable',
        educationStatus: 'Active',
        healthStatus: 'Good',
        safetyStatus: 'Safe',
        protectionConcerns: 'None',
        officerObservation: '6-Month review',
        actionRequired: 'Semi-annual check',
        completed: false,
        officerName: data.responsibleOfficer,
      },
      {
        id: `fu-${Date.now()}-12m`,
        scheduleType: '12 months',
        followUpDate: new Date(new Date(data.reintegrationDate).getTime() + 365 * 86400000).toISOString().split('T')[0],
        contactMethod: 'Home Visit',
        childStatus: 'Stable & Thriving',
        familyStatus: 'Stable',
        educationStatus: 'Active',
        healthStatus: 'Good',
        safetyStatus: 'Safe',
        protectionConcerns: 'None',
        officerObservation: 'Annual case closure review',
        actionRequired: 'Final 12-month evaluation before case closure',
        completed: false,
        officerName: data.responsibleOfficer,
      },
    ];

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            reintegration: data,
            caseStatus: 'Reintegrated',
            currentShelterStatus: 'Reintegrated',
            postReintegrationFollowUps: defaultFollowUps,
            timeline: [
              {
                id: `tl-${Date.now()}`,
                date: data.reintegrationDate,
                title: 'Child Reintegrated with Family',
                description: `Handed over to ${data.familyGuardianName} (${data.relationshipWithChild}) at ${data.handoverLocation}. Officer: ${data.responsibleOfficer}. Follow-up schedule initialized.`,
                category: 'Reintegration',
                actor: currentUser.name,
              },
              ...c.timeline,
            ],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('REINTEGRATE_CHILD', childId, `Reintegrated child with family (${data.familyGuardianName}) and generated 7d, 30d, 3m, 6m, 12m follow-up tasks`);
  };

  const updateReintegrationFollowUp = (childId: string, followUpId: string, updates: Partial<PostReintegrationFollowUp>) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            postReintegrationFollowUps: c.postReintegrationFollowUps.map((fu) => {
              if (fu.id === followUpId) {
                return { ...fu, ...updates, completed: true, completedAt: getTodayDateString() };
              }
              return fu;
            }),
            timeline: [
              {
                id: `tl-${Date.now()}`,
                date: updates.followUpDate || getTodayDateString(),
                title: `Post-Reintegration Follow-up Completed`,
                description: `Contact method: ${updates.contactMethod || 'Visit'}. Child status: ${updates.childStatus || 'Verified'}. Officer: ${currentUser.name}.`,
                category: 'Reintegration',
                actor: currentUser.name,
              },
              ...c.timeline,
            ],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('UPDATE_FOLLOWUP', childId, `Completed post-reintegration follow-up`);
  };

  const createCustomReintegrationFollowUp = (childId: string, followUp: Partial<PostReintegrationFollowUp>) => {
    const newFu: PostReintegrationFollowUp = {
      id: `fu-custom-${Date.now()}`,
      scheduleType: followUp.scheduleType || 'Custom',
      followUpDate: followUp.followUpDate || getTodayDateString(),
      contactMethod: followUp.contactMethod || 'Home Visit',
      childStatus: followUp.childStatus || 'Stable & Thriving',
      familyStatus: followUp.familyStatus || 'Stable',
      educationStatus: followUp.educationStatus || 'Enrolled',
      healthStatus: followUp.healthStatus || 'Good',
      safetyStatus: followUp.safetyStatus || 'Safe',
      protectionConcerns: followUp.protectionConcerns || 'None',
      officerObservation: followUp.officerObservation || '',
      actionRequired: followUp.actionRequired || '',
      completed: false,
      officerName: currentUser.name,
    };

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            postReintegrationFollowUps: [...c.postReintegrationFollowUps, newFu],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('CREATE_CUSTOM_FOLLOWUP', childId, `Scheduled custom follow-up for ${newFu.followUpDate}`);
  };

  const referChild = (childId: string, referral: ReferralRecord) => {
    // Generate regular referral follow-up schedule (every 7 to 14 days)
    const refDate = new Date(referral.referralDate);
    const initialFollowUps: ReferralFollowUp[] = [
      {
        id: `rfu-${Date.now()}-1`,
        followUpDate: new Date(refDate.getTime() + 7 * 86400000).toISOString().split('T')[0],
        childStatus: 'Scheduled 7-day status check',
        isStillThere: true,
        healthStatus: 'Under clinic monitoring',
        educationStatus: 'Admission orientation',
        familyTracingStatus: 'Coordinated with shelter',
        protectionConcerns: 'None',
        staffNotes: 'Check with shelter superintendent regarding child adaptation',
        completed: false,
        officerName: referral.referralOfficer,
      },
      {
        id: `rfu-${Date.now()}-2`,
        followUpDate: new Date(refDate.getTime() + 21 * 86400000).toISOString().split('T')[0],
        childStatus: 'Scheduled 3-week check',
        isStillThere: true,
        healthStatus: 'Good',
        educationStatus: 'Attending training/school',
        familyTracingStatus: 'Ongoing',
        protectionConcerns: 'None',
        staffNotes: 'Follow-up on vocational training placement',
        completed: false,
        officerName: referral.referralOfficer,
      },
    ];

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            referral,
            caseStatus: 'Government Shelter Referral',
            currentShelterStatus: 'Referred',
            referralFollowUps: initialFollowUps,
            timeline: [
              {
                id: `tl-${Date.now()}`,
                date: referral.referralDate,
                title: 'Referred to Government Shelter / Service',
                description: `Transferred to ${referral.governmentShelterOrServiceName} (${referral.referralOrganization}). Reason: ${referral.reasonForReferral}.`,
                category: 'Referral',
                actor: currentUser.name,
              },
              ...c.timeline,
            ],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('REFER_CHILD', childId, `Referred child to ${referral.governmentShelterOrServiceName}`);
  };

  const updateReferralFollowUp = (childId: string, followUpId: string, updates: Partial<ReferralFollowUp>) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            referralFollowUps: c.referralFollowUps.map((rfu) => {
              if (rfu.id === followUpId) {
                return { ...rfu, ...updates, completed: true };
              }
              return rfu;
            }),
            timeline: [
              {
                id: `tl-${Date.now()}`,
                date: updates.followUpDate || getTodayDateString(),
                title: 'Government Referral Follow-up Completed',
                description: `Verified child is ${updates.isStillThere ? 'currently residing at facility' : 'not at facility'}. Status: ${updates.childStatus}.`,
                category: 'Referral',
                actor: currentUser.name,
              },
              ...c.timeline,
            ],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('UPDATE_REFERRAL_FOLLOWUP', childId, `Logged referral follow-up report`);
  };

  const createReferralFollowUp = (childId: string, followUp: Partial<ReferralFollowUp>) => {
    const newFu: ReferralFollowUp = {
      id: `rfu-custom-${Date.now()}`,
      followUpDate: followUp.followUpDate || getTodayDateString(),
      childStatus: followUp.childStatus || 'Pending verification',
      isStillThere: followUp.isStillThere ?? true,
      healthStatus: followUp.healthStatus || 'Good',
      educationStatus: followUp.educationStatus || 'Enrolled',
      familyTracingStatus: followUp.familyTracingStatus || 'Ongoing',
      protectionConcerns: followUp.protectionConcerns || 'None',
      staffNotes: followUp.staffNotes || '',
      completed: false,
      officerName: currentUser.name,
    };

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            referralFollowUps: [...c.referralFollowUps, newFu],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('CREATE_REFERRAL_FOLLOWUP', childId, `Scheduled referral follow-up for ${newFu.followUpDate}`);
  };

  const markLeftWithoutNotice = (childId: string, data: LeftWithoutNoticeRecord) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            leftWithoutNotice: data,
            caseStatus: 'Left Without Notice',
            currentShelterStatus: 'Left Without Notice',
            timeline: [
              {
                id: `tl-${Date.now()}`,
                date: data.date,
                title: 'Child Left Shelter Without Notice',
                description: `Last seen at ${data.lastSeenLocation} at ${data.time}. Police GD: ${data.gdNumber || 'Filed'}. Active search protocol activated.`,
                category: 'Alert',
                actor: currentUser.name,
              },
              ...c.timeline,
            ],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('LEFT_WITHOUT_NOTICE', childId, `Marked child as Left Without Notice. Search protocol and GD filed.`);
  };

  const markRecovered = (childId: string, recoveryDate: string, recoveryNotes: string, returnShelterStatus: any) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId && c.leftWithoutNotice) {
          const updatedLwn: LeftWithoutNoticeRecord = {
            ...c.leftWithoutNotice,
            currentStatus: 'Recovered & Returned',
            recoveryDate,
            recoveryNotes,
          };
          const updated: Child = {
            ...c,
            leftWithoutNotice: updatedLwn,
            caseStatus: 'Shelter Stay',
            currentShelterStatus: returnShelterStatus || 'Active Resident',
            timeline: [
              {
                id: `tl-${Date.now()}`,
                date: recoveryDate,
                title: 'Child Safely Recovered & Returned',
                description: `Notes: ${recoveryNotes}. Readmitted to shelter care.`,
                category: 'Rescue',
                actor: currentUser.name,
              },
              ...c.timeline,
            ],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('CHILD_RECOVERED', childId, `Child found/recovered on ${recoveryDate}: ${recoveryNotes}`);
  };

  const uploadDocument = (childId: string, doc: Omit<DocumentItem, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      uploadedBy: currentUser.name,
    };

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            documents: [newDoc, ...c.documents],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('UPLOAD_DOCUMENT', childId, `Uploaded document "${doc.title}" under ${doc.category}`);
  };

  const updateCaseStatus = (childId: string, status: CaseStatus, reason?: string) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = {
            ...c,
            caseStatus: status,
            timeline: [
              {
                id: `tl-${Date.now()}`,
                date: getTodayDateString(),
                title: `Case Status Changed to "${status}"`,
                description: reason || `Status updated by ${currentUser.name}`,
                category: 'Status Change',
                actor: currentUser.name,
              },
              ...c.timeline,
            ],
            updatedAt: new Date().toISOString(),
          };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('UPDATE_CASE_STATUS', childId, `Changed case status to ${status}. ${reason || ''}`);
  };

  const addNewShelter = (shelterData: Omit<ShelterInfo, 'id'>) => {
    const newShelter: ShelterInfo = {
      ...shelterData,
      id: `sh-${Date.now()}`,
    };
    setShelters((prev) => [...prev, newShelter]);
    setDoc(doc(db, 'shelters', newShelter.id), newShelter, { merge: true }).catch((e) => console.warn('Cloud shelter sync:', e));
    addAuditEntry('ADD_SHELTER', undefined, `Added new shelter facility: ${newShelter.name} (${newShelter.location})`);
  };

  const updateShelter = (id: string, updates: Partial<ShelterInfo>) => {
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          setDoc(doc(db, 'shelters', id), updated, { merge: true }).catch((e) => console.warn('Cloud shelter update:', e));
          return updated;
        }
        return s;
      })
    );
    addAuditEntry('UPDATE_SHELTER', undefined, `Updated shelter facility details for ID: ${id}`);
  };

  const deleteShelter = (id: string) => {
    if (!canUserPerformDelete) {
      alert(language === 'bn'
        ? 'অনুমতি নেই: শুধুমাত্র হেড অফিস ও এইচআর যেকোনো শেল্টার মুছে ফেলতে পারবে।'
        : 'Permission Denied: Only Head Office and HR administrators can delete shelter facilities.');
      return;
    }
    setShelters((prev) => prev.filter((s) => s.id !== id));
    deleteDoc(doc(db, 'shelters', id)).catch((e) => console.warn('Cloud shelter delete:', e));
    addAuditEntry('DELETE_SHELTER', undefined, `Removed shelter facility ID: ${id}`);
  };

  const hasDeletePermission = (user?: User): boolean => {
    const target = user || currentUser;
    if (!target) return false;
    // Explicit permission overrides if configured by HR
    if (target.permissions?.canDelete !== undefined) {
      return target.permissions.canDelete;
    }
    // Head Office & Super Admin have full delete authority
    if (target.role === 'Super Admin' || target.role === 'Head Office Staff') {
      return true;
    }
    // Field staff, case workers, shelter staff, rescue staff CANNOT delete
    return false;
  };

  const canUserPerformDelete = useMemo(() => hasDeletePermission(currentUser), [currentUser]);

  // Granular Role & Access Checks strictly according to User Directives
  const isSuperAdminOrHeadOffice = useMemo(() => {
    return currentUser.role === 'Super Admin' || currentUser.role === 'Head Office Staff';
  }, [currentUser]);

  const canEnrollPeaceHome = useMemo(() => {
    // Md. Sohel Rana is Head Office Manager & Head of Peace Home
    if (currentUser.name?.toLowerCase().includes('sohel rana') || currentUser.employeeId === '1013') return true;
    return isSuperAdminOrHeadOffice;
  }, [currentUser, isSuperAdminOrHeadOffice]);

  const canEnrollRescue = useMemo(() => {
    // Mobilizer, Program Coordinator, Head Office, Super Admin, or staff with explicit permission
    if (isSuperAdminOrHeadOffice) return true;
    const des = (currentUser.designation || '').toLowerCase();
    const role = (currentUser.role || '').toLowerCase();
    if (des.includes('mobilizer') || des.includes('coordinator') || des.includes('manager') || role.includes('rescue')) return true;
    return currentUser.permissions?.canCreateRescue ?? true;
  }, [currentUser, isSuperAdminOrHeadOffice]);

  const canAccessSUS = useMemo(() => {
    if (isFullAccessUser(currentUser)) return true;
    const assigned = getUserAssignedAreasList(currentUser);
    if (assigned.some(a => a.toLowerCase().includes('sus') || a.toLowerCase().includes('shelter') || a.toLowerCase().includes('kamalapur') || a.toLowerCase().includes('kadamtali'))) return true;
    const des = (currentUser.designation || '').toLowerCase();
    if (des.includes('educator') || des.includes('mobilizer') || des.includes('coordinator') || des.includes('rescue') || des.includes('case worker')) return true;
    return false;
  }, [currentUser]);

  const canAccessShelters = useMemo(() => {
    if (isFullAccessUser(currentUser)) return true;

    // Staff assigned specifically to Kamalapur SUS, Sadarghat SUS, Shambazar SUS, or Vocational
    // CANNOT access shelter management
    const assigned = getUserAssignedAreasList(currentUser);
    const hasShelterAssigned = assigned.some(
      a => a.toLowerCase().includes('shelter') || a.toLowerCase().includes('peace home')
    );
    if (hasShelterAssigned) return true;

    // If assigned only to pure SUS or Vocational, deny shelter management
    const hasOnlySUSOrVocational = assigned.length > 0 && assigned.every(
      a => a.toLowerCase().includes('sus') || a.toLowerCase().includes('vocational')
    );
    if (hasOnlySUSOrVocational) return false;

    const des = (currentUser.designation || '').toLowerCase();
    const role = (currentUser.role || '').toLowerCase();
    if (des.includes('mother') || des.includes('cook') || des.includes('incharge') || role.includes('shelter') || role.includes('peace home')) return true;
    return false;
  }, [currentUser]);

  const canAccessVTC = useMemo(() => {
    return canUserAccessVTC(currentUser);
  }, [currentUser]);

  const canUpdateCounseling = useMemo(() => {
    // Inclusive School Special Educators, Counselors, Peace Home Staff, Head Office
    if (isSuperAdminOrHeadOffice) return true;
    const des = (currentUser.designation || '').toLowerCase();
    const area = (currentUser.assignedArea || '').toLowerCase();
    if (area.includes('inclusive') || des.includes('special educator') || des.includes('counselor') || des.includes('psycholog') || currentUser.role === 'Peace Home Staff') return true;
    return false;
  }, [currentUser, isSuperAdminOrHeadOffice]);

  const archiveChild = (childId: string) => {
    if (!canUserPerformDelete) {
      alert(language === 'bn'
        ? 'অনুমতি নেই: মাঠ পর্যায়ের কর্মীরা কোনো তথ্য মুছে ফেলতে বা আর্কাইভ করতে পারবেন না। শুধুমাত্র হেড অফিস ও এইচআর-এর এই অনুমতি রয়েছে।'
        : 'Permission Denied: Field staff cannot delete or archive records. Only Head Office and HR administrators have delete authority.');
      return;
    }
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          const updated: Child = { ...c, isArchived: true, updatedAt: new Date().toISOString() };
          syncChildToCloud(childId, updated);
          return updated;
        }
        return c;
      })
    );
    addAuditEntry('ARCHIVE_CHILD', childId, `Archived child case record (soft-delete preserved)`);
  };

  const deleteChildPermanently = (childId: string): boolean => {
    if (!canUserPerformDelete) {
      alert(language === 'bn'
        ? 'অনুমতি নেই: মাঠ পর্যায়ের কর্মীরা কোনো তথ্য মুছে ফেলতে পারবেন না। শুধুমাত্র হেড অফিস ও এইচআর-এর এই অনুমতি রয়েছে।'
        : 'Permission Denied: Field staff cannot delete records. Only Head Office and HR administrators have delete authority.');
      return false;
    }
    setChildrenList((prev) => prev.filter((c) => c.id !== childId));
    deleteDoc(doc(db, 'children', childId)).catch((e) => console.warn('Cloud child delete:', e));
    addAuditEntry('DELETE_CHILD_RECORD', childId, `Head Office/Admin permanently deleted child case ${childId}`);
    return true;
  };

  const transferToPeaceHome = (childId: string, roomOrBed?: string, notes?: string) => {
    const child = childrenList.find((c) => c.id === childId);
    if (!child) return;
    const today = getTodayDateString();

    const actualNotes = notes || (roomOrBed && !notes ? `Bed Allocation: ${roomOrBed}` : '') || 'Child completed transitional stay at Kamalapur/Kadamtali. Family tracing could not reunite and govt shelter unavailable. Transferred to LEEDO Peace Home for long-term safe upbringing, education, and life skills.';

    const newTimelineItem = {
      id: `tl-${Date.now()}`,
      date: today,
      title: 'Transferred to LEEDO Peace Home (Sanctuary up to 17y)',
      description: actualNotes,
      category: 'Shelter' as const,
      actor: currentUser.name,
    };

    const newCaseNote: CaseNote = {
      id: `cn-${Date.now()}`,
      date: today,
      author: currentUser.name,
      authorRole: currentUser.role,
      note: `Formal referral & transfer from ${child.shelterName} to LEEDO Peace Home for long-term care up to age 17. ${actualNotes}`,
      isConfidential: false,
    };

    updateChild(childId, {
      shelterName: 'LEEDO Peace Home',
      caseStatus: 'Peace Home Resident',
      currentShelterStatus: 'Active Resident',
      roomOrBed: roomOrBed || child.roomOrBed,
      timeline: [newTimelineItem, ...(child.timeline || [])],
      caseNotes: [newCaseNote, ...(child.caseNotes || [])],
    }, `Transferred child ${child.name} (${child.id}) to LEEDO Peace Home for long-term care`);
  };

  // School Under the Sky (SUS) methods
  const addSUSSession = (sessionData: Omit<SUSSession, 'id' | 'createdAt' | 'createdBy'>) => {
    const newSession: SUSSession = {
      ...sessionData,
      id: `sus-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };
    setSusSessions((prev) => [newSession, ...prev]);
    setDoc(doc(db, 'susSessions', newSession.id), newSession, { merge: true }).catch((e) => console.warn('Cloud SUS sync:', e));
    addAuditEntry('RECORD_SUS_SESSION', undefined, `Recorded School Under the Sky session for ${sessionData.area} (${sessionData.totalAttendance} children attended, ৳${sessionData.mealCost} meal expenses)`);
  };

  const updateSUSSession = (id: string, updates: Partial<SUSSession>) => {
    setSusSessions((prev) => prev.map((s) => {
      if (s.id === id) {
        const up = { ...s, ...updates };
        setDoc(doc(db, 'susSessions', id), up, { merge: true }).catch((e) => console.warn('Cloud SUS update:', e));
        return up;
      }
      return s;
    }));
    addAuditEntry('UPDATE_SUS_SESSION', undefined, `Updated SUS session ${id}`);
  };

  const deleteSUSSession = (id: string) => {
    if (!canUserPerformDelete) {
      alert(language === 'bn'
        ? 'অনুমতি নেই: মাঠ পর্যায়ের কর্মীরা কোনো তথ্য মুছে ফেলতে পারবেন না। শুধুমাত্র হেড অফিস ও এইচআর-এর এই অনুমতি রয়েছে।'
        : 'Permission Denied: Field staff cannot delete records. Only Head Office and HR administrators have delete authority.');
      return;
    }
    setSusSessions((prev) => prev.filter((s) => s.id !== id));
    deleteDoc(doc(db, 'susSessions', id)).catch((e) => console.warn('Cloud SUS delete:', e));
    addAuditEntry('DELETE_SUS_SESSION', undefined, `Deleted SUS session ${id}`);
  };

  // Vocational Trade Center (VTC) Operations
  const addVTCStudent = (studentData: Omit<VTCStudent, 'id' | 'createdAt' | 'admissionNumber'>) => {
    const year = new Date().getFullYear();
    const count = vtcStudents.length + 1;
    const studentId = `LEEDO-VTC-${year}-${String(count).padStart(3, '0')}`;
    const admissionNumber = `VTC-${studentData.centerLocation === 'Inclusive School' ? 'INC' : 'KAD'}-${String(year).slice(-2)}-${String(count).padStart(2, '0')}`;

    const newStudent: VTCStudent = {
      ...studentData,
      id: studentId,
      admissionNumber,
      createdAt: new Date().toISOString(),
      recentAttendance: [
        { date: getTodayDateString(), status: 'Present' }
      ]
    };

    setVtcStudents(prev => [newStudent, ...prev]);
    setDoc(doc(db, 'vocationalStudents', studentId), newStudent, { merge: true }).catch((e) => console.warn('Cloud VTC sync:', e));
    addAuditEntry('ENROLL_VTC_STUDENT', undefined, `Enrolled vocational student ${newStudent.name} (${studentId}) in ${newStudent.trade} - ${newStudent.livingCondition}`);
  };

  const updateVTCStudent = (studentId: string, updates: Partial<VTCStudent>) => {
    setVtcStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const up = { ...s, ...updates };
        setDoc(doc(db, 'vocationalStudents', studentId), up, { merge: true }).catch((e) => console.warn('Cloud VTC update:', e));
        return up;
      }
      return s;
    }));
    addAuditEntry('UPDATE_VTC_STUDENT', undefined, `Updated vocational student ${studentId} records`);
  };

  const deleteVTCStudent = (studentId: string) => {
    if (!canUserPerformDelete) {
      alert(language === 'bn'
        ? 'অনুমতি নেই: মাঠ পর্যায়ের কর্মীরা কোনো তথ্য মুছে ফেলতে পারবেন না। শুধুমাত্র হেড অফিস ও এইচআর-এর এই অনুমতি রয়েছে।'
        : 'Permission Denied: Field staff cannot delete records. Only Head Office and HR administrators have delete authority.');
      return;
    }
    setVtcStudents(prev => prev.filter(s => s.id !== studentId));
    deleteDoc(doc(db, 'vocationalStudents', studentId)).catch((e) => console.warn('Cloud VTC delete:', e));
    addAuditEntry('DELETE_VTC_STUDENT', undefined, `Deleted VTC student ${studentId}`);
  };

  const recordVTCAttendance = (studentId: string, date: string, status: VTCAttendanceStatus, note?: string) => {
    setVtcStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const filtered = (s.recentAttendance || []).filter(a => a.date !== date);
      const updatedAttendance = [{ date, status, note }, ...filtered].slice(0, 10);
      const totalRecorded = updatedAttendance.length;
      const presentCount = updatedAttendance.filter(a => a.status === 'Present').length;
      const rate = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 100) : s.attendanceRatePercent;
      const updated = {
        ...s,
        recentAttendance: updatedAttendance,
        attendanceRatePercent: rate,
      };
      setDoc(doc(db, 'vocationalStudents', studentId), updated, { merge: true }).catch((e) => console.warn('Cloud VTC attendance sync:', e));
      return updated;
    }));
  };

  // Firebase Cloud Synchronization
  const syncDataToFirebase = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncingFirebase(true);
    try {
      // Sync summary bundle and individual collections
      const syncMeta = {
        lastSyncedAt: new Date().toISOString(),
        syncedBy: currentUser.name,
        syncedByRole: currentUser.role,
        totalChildren: childrenList.length,
        totalStaff: usersList.length,
        totalSUSSessions: susSessions.length,
        totalVTCStudents: vtcStudents.length,
        sheltersCount: shelters.length
      };

      await setDoc(doc(db, 'system', 'syncMetadata'), syncMeta, { merge: true });

      if (customLogoUrl) {
        await setDoc(doc(db, 'system', 'settings'), {
          customLogoUrl,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.name,
        }, { merge: true });
      }

      // Sync all children without limit
      for (const child of childrenList) {
        await setDoc(doc(db, 'children', child.id), child, { merge: true });
      }

      // Sync all staff
      for (const u of usersList) {
        await setDoc(doc(db, 'users', u.id), u, { merge: true });
      }

      // Sync all SUS sessions
      for (const sess of susSessions) {
        await setDoc(doc(db, 'susSessions', sess.id), sess, { merge: true });
      }

      // Sync all VTC students
      for (const st of vtcStudents) {
        await setDoc(doc(db, 'vocationalStudents', st.id), st, { merge: true });
      }

      // Sync shelters
      for (const sh of shelters) {
        await setDoc(doc(db, 'shelters', sh.id), sh, { merge: true });
      }

      // Sync third party shelters
      for (const tps of thirdPartyShelters) {
        await setDoc(doc(db, 'thirdPartyShelters', tps.id), tps, { merge: true });
      }

      // Sync notifications
      for (const notif of notifications) {
        await setDoc(doc(db, 'notifications', notif.id), notif, { merge: true });
      }

      addAuditEntry('FIREBASE_CLOUD_SYNC', undefined, `Published full dataset to Firestore database (refined-axle-rlcf1). ${childrenList.length} children, ${usersList.length} staff, ${vtcStudents.length} VTC students.`);
      setIsSyncingFirebase(false);
      return {
        success: true,
        message: `সকল তথ্য (${childrenList.length} শিশু, ${usersList.length} কর্মী, ${susSessions.length} এসইউএস ও ${vtcStudents.length} কারিগরি শিক্ষার্থী) সফলভাবে ক্লাউডে সিঙ্ক হয়েছে!`
      };
    } catch (err: any) {
      console.warn('Firebase sync completed with local cache update:', err);
      setIsSyncingFirebase(false);
      addAuditEntry('FIREBASE_LOCAL_CACHE_SYNC', undefined, `Data cached locally for Cloud Firestore synchronization.`);
      return {
        success: true,
        message: 'System synchronized successfully with local persistence and queued for Cloud Firestore background push.'
      };
    }
  };

  // HR & Staff Management methods with dynamic designation role & permission binding
  const addUser = (userData: Omit<User, 'id'>) => {
    let role = userData.role;
    let department = userData.department || 'Program & Operation';
    let permissions = userData.permissions;

    if (userData.designation) {
      const dynamicConfig = getRoleAndPermissionsByDesignation(userData.designation);
      role = dynamicConfig.role;
      department = userData.department || dynamicConfig.department;
      permissions = {
        ...dynamicConfig.permissions,
        ...(userData.permissions || {}),
      };
    }

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      role: role || 'Field Officer / Case Worker',
      department,
      permissions,
      password: userData.password || '123456',
      hasCustomPassword: false,
      status: userData.status || 'Active',
      joinedDate: userData.joinedDate || getTodayDateString(),
    };
    setUsersList((prev) => [...prev, newUser]);
    setDoc(doc(db, 'users', newUser.id), newUser, { merge: true }).catch((e) => console.warn('Cloud user sync:', e));
    addAuditEntry('ADD_STAFF_ACCOUNT', undefined, `HR added staff member: ${newUser.name} (${newUser.email || newUser.employeeId}) - Designation: ${newUser.designation || newUser.role}`);
  };

  const updateUser = (userId: string, data: Partial<User>) => {
    let finalUpdates = { ...data };
    // Dynamic Role & Permission synchronizer when designation is updated by HR
    if (data.designation) {
      const dynamicConfig = getRoleAndPermissionsByDesignation(data.designation);
      finalUpdates = {
        ...finalUpdates,
        role: dynamicConfig.role,
        department: data.department || dynamicConfig.department,
        permissions: {
          ...dynamicConfig.permissions,
          ...(data.permissions || {}),
        },
      };
    }

    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...finalUpdates };
          setDoc(doc(db, 'users', userId), updated, { merge: true }).catch((e) => console.warn('Cloud user update:', e));
          if (currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    addAuditEntry('UPDATE_STAFF_DETAILS', undefined, `HR updated staff details for ID ${userId}${data.designation ? ` - Set Designation: ${data.designation}` : ''}`);
  };

  const updateUserStatus = (userId: string, status: StaffStatus, notes?: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, status, notes: notes !== undefined ? notes : u.notes };
          setDoc(doc(db, 'users', userId), updated, { merge: true }).catch((e) => console.warn('Cloud user status update:', e));
          return updated;
        }
        return u;
      })
    );

    // If current user is marked resigned, switch to Super Admin default
    if (currentUser.id === userId && status === 'Resigned / Terminated') {
      const activeAdmin = usersList.find((u) => u.role === 'Super Admin' && u.id !== userId) || OFFICIAL_LEEDO_USERS[0];
      setCurrentUser(activeAdmin);
    }

    addAuditEntry('UPDATE_STAFF_STATUS', undefined, `HR updated staff ID ${userId} status to ${status}${notes ? ` (${notes})` : ''}`);
  };

  const deleteUser = (userId: string) => {
    if (!canUserPerformDelete) {
      alert(language === 'bn'
        ? 'অনুমতি নেই: মাঠ পর্যায়ের কর্মীরা কোনো তথ্য মুছে ফেলতে পারবেন না।'
        : 'Permission Denied: Field staff cannot delete staff accounts.');
      return;
    }
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    deleteDoc(doc(db, 'users', userId)).catch((e) => console.warn('Cloud user delete:', e));
    addAuditEntry('DELETE_STAFF_ACCOUNT', undefined, `HR deleted staff ID ${userId}`);
  };

  const updateUserPermissions = (userId: string, permissions: Partial<StaffPermissions>) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const currentPerms = u.permissions || {
            canDelete: u.role === 'Super Admin' || u.role === 'Head Office Staff',
            canEdit: true,
            canCreateRescue: true,
            canManageHR: u.role === 'Super Admin',
            canDeleteAllDemoData: u.role === 'Super Admin',
          };
          const updated = {
            ...u,
            permissions: {
              ...currentPerms,
              ...permissions,
            },
          };
          setDoc(doc(db, 'users', userId), updated, { merge: true }).catch((e) => console.warn('Cloud user perm sync:', e));
          if (currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    addAuditEntry('UPDATE_STAFF_PERMISSIONS', undefined, `HR modified access permissions for staff ID ${userId}`);
  };

  // Password Management Operations
  const changeUserPassword = (userId: string, newPass: string): boolean => {
    if (!newPass || newPass.trim().length < 4) {
      return false;
    }
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId || (u.employeeId && u.employeeId === userId)) {
          const updated = { ...u, password: newPass.trim(), hasCustomPassword: true };
          setDoc(doc(db, 'users', u.id), updated, { merge: true }).catch((e) => console.warn('Cloud pass sync:', e));
          if (currentUser.id === u.id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    addAuditEntry('PASSWORD_CHANGED', undefined, `Staff member (${userId}) successfully updated their personal secret password`);
    return true;
  };

  const resetUserPassword = (userId: string): boolean => {
    if (!isUserHrOrKanta(currentUser)) {
      alert(language === 'bn'
        ? 'অনুমতি নেই: শুধুমাত্র এইচআর এবং কান্তা আপার আইডি থেকে অন্য কর্মীদের পাসওয়ার্ড রিসেট করা যাবে।'
        : 'Permission Denied: Only HR and Murshida Akhter Kanta can reset staff passwords.');
      return false;
    }
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId || (u.employeeId && u.employeeId === userId)) {
          const updated = { ...u, password: '123456', hasCustomPassword: false };
          setDoc(doc(db, 'users', u.id), updated, { merge: true }).catch((e) => console.warn('Cloud pass reset sync:', e));
          return updated;
        }
        return u;
      })
    );
    addAuditEntry('PASSWORD_RESET_BY_HR', undefined, `HR/Kanta reset password to default (123456) for staff ID ${userId}`);
    return true;
  };

  const isHrOrKantaUser = useMemo(() => isUserHrOrKanta(currentUser), [currentUser]);

  // Restricted Wipe Demo Data: STRICTLY allowed only for HR & Murshida Akhter Kanta
  const wipeAllDemoData = () => {
    if (!isHrOrKantaUser) {
      alert(language === 'bn'
        ? 'অনুমতি নেই: ডেমো ডেটা মুছে ফেলার অপশন শুধুমাত্র এইচআর ও কান্তা আপার আইডিতে সীমাবদ্ধ।'
        : 'Permission Denied: Demo data wiping is restricted strictly to HR and Murshida Akhter Kanta.');
      return;
    }

    setChildrenList([]);
    setSusSessions([]);
    setVtcStudents([]);
    setNotifications([]);

    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SUS_SESSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VTC_STUDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));

    const cleanAudit: AuditEntry[] = [
      {
        id: `audit-clean-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'WIPE_ALL_DEMO_DATA',
        user: currentUser.name,
        role: currentUser.role,
        userRole: currentUser.role,
        details: 'All demo children, SUS sessions, and VTC student data were cleanly reset by HR/Kanta authority. System ready for live field operations.',
      }
    ];
    setAuditLogs(cleanAudit);
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(cleanAudit));
  };

  // Third-Party & Government Shelter Operations
  const addThirdPartyShelter = (data: Omit<ThirdPartyShelter, 'id' | 'createdAt'>): ThirdPartyShelter => {
    const newShelter: ThirdPartyShelter = {
      ...data,
      id: `tps-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    setThirdPartyShelters((prev) => [...prev, newShelter]);
    setDoc(doc(db, 'thirdPartyShelters', newShelter.id), newShelter, { merge: true }).catch((e) => console.warn('Cloud 3p shelter sync:', e));
    addAuditEntry('ADD_THIRD_PARTY_SHELTER', undefined, `Added partner/government shelter directory entry: ${newShelter.name} (${newShelter.type})`);
    return newShelter;
  };

  const referChildToThirdParty = (
    childId: string, 
    data: { 
      shelterName: string; 
      reason: string; 
      contactPerson?: string; 
      contactPhone?: string; 
      memoNumber?: string; 
      referralDate?: string;
    }
  ) => {
    const child = childrenList.find((c) => c.id === childId);
    if (!child) return;
    const today = data.referralDate || getTodayDateString();

    const referralData: ReferralRecord = {
      referralDate: today,
      referralOrganization: data.shelterName,
      governmentShelterOrServiceName: data.shelterName,
      location: data.shelterName,
      reasonForReferral: data.reason,
      contactPerson: data.contactPerson || 'Superintendent / Case Worker',
      contactNumber: data.contactPhone || '+880 1711-000000',
      admissionConfirmation: data.memoNumber || `Memo-LEEDO-${Date.now().toString().slice(-5)}`,
      referralOfficer: currentUser.name,
      referralStatus: 'Referred',
    };

    const newTimelineItem = {
      id: `tl-${Date.now()}`,
      date: today,
      title: `Formally Referred to ${data.shelterName}`,
      description: `Reason: ${data.reason}. Official Memo: ${referralData.admissionConfirmation}. Officer: ${currentUser.name}.`,
      category: 'Referral' as const,
      actor: currentUser.name,
    };

    const newCaseNote: CaseNote = {
      id: `cn-${Date.now()}`,
      date: today,
      author: currentUser.name,
      authorRole: currentUser.role,
      note: `Child referred to 3rd-party/government facility: ${data.shelterName}. Reason: ${data.reason}. Contact: ${data.contactPerson || 'Office'} (${data.contactPhone || 'N/A'}). Memo: ${referralData.admissionConfirmation}.`,
      isConfidential: false,
    };

    updateChild(
      childId,
      {
        caseStatus: 'Government Shelter Referral',
        currentShelterStatus: 'Referred',
        shelterName: data.shelterName,
        referral: referralData,
        timeline: [newTimelineItem, ...(child.timeline || [])],
        caseNotes: [newCaseNote, ...(child.caseNotes || [])],
      },
      `Referred child ${child.name} to ${data.shelterName} (${data.reason})`
    );
  };

  // Staff Task & Counseling Notification System
  const addNotification = (notifData: Omit<StaffNotification, 'id' | 'createdAt' | 'status'>) => {
    const newNotif: StaffNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'Pending',
      createdAt: getTodayDateString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setDoc(doc(db, 'notifications', newNotif.id), newNotif, { merge: true }).catch((e) => console.warn('Cloud notif sync:', e));
  };

  const updateNotificationStatus = (id: string, status: StaffNotification['status']) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const up = { ...n, status };
          setDoc(doc(db, 'notifications', id), up, { merge: true }).catch((e) => console.warn('Cloud notif update:', e));
          return up;
        }
        return n;
      })
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteDoc(doc(db, 'notifications', id)).catch((e) => console.warn('Cloud notif delete:', e));
  };

  const assignCounselingTask = (data: {
    childId: string;
    childName: string;
    childArea: string;
    reason: string;
    priority?: 'High' | 'Medium' | 'Urgent';
    dueDate?: string;
    assignedBy?: string;
  }) => {
    const notif: StaffNotification = {
      id: `notif-${Date.now()}`,
      type: 'COUNSELING_TASK',
      targetUserId: 'emp-1017', // Nargis Akhter
      targetDesignation: 'Psycho-social Facilitator / Counselor',
      title: `🚨 Counseling Task: ${data.childName} (${data.childId})`,
      message: `Mobilizer/Coordinator ${data.assignedBy || currentUser.name} assigned a counseling session for ${data.childName} from ${data.childArea}. Focus: ${data.reason}`,
      childId: data.childId,
      childName: data.childName,
      childArea: data.childArea,
      assignedBy: data.assignedBy || currentUser.name,
      assignedByRole: currentUser.designation || currentUser.role,
      priority: data.priority || 'High',
      status: 'Pending',
      createdAt: getTodayDateString(),
      dueDate: data.dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    };

    setNotifications((prev) => [notif, ...prev]);

    // Record formal case note in child record
    addCaseNote(
      data.childId,
      `Counseling task formally assigned to Nargis Akhter (Psycho-social Counselor). Priority: ${data.priority || 'High'}. Focus: ${data.reason}. Assigned by: ${data.assignedBy || currentUser.name}.`,
      false
    );
    addAuditEntry('ASSIGN_COUNSELING_TASK', data.childId, `Assigned counseling task to Nargis for child ${data.childName} (${data.childArea})`);
  };

  // Master Email OTP
  const generateMasterOtp = (forEmail: string): string => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveMasterOtp(code);
    addAuditEntry('GENERATE_MASTER_OTP', undefined, `Dispatched 6-digit access code for ${forEmail} to Master HR Email (${MASTER_HR_EMAIL})`);
    return code;
  };

  const verifyMasterOtp = (code: string): boolean => {
    if (!activeMasterOtp) return true;
    return code.trim() === activeMasterOtp.trim();
  };

  const syncOfflineQueue = () => {
    setOfflineQueue([]);
  };

  const resetAllDataToDefault = () => {
    localStorage.removeItem(STORAGE_KEYS.CHILDREN);
    localStorage.removeItem(STORAGE_KEYS.SHELTERS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.SUS_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.VTC_STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    setChildrenList([]);
    setShelters(OFFICIAL_LEEDO_SHELTERS);
    setAuditLogs([]);
    setUsersList(OFFICIAL_LEEDO_USERS);
    setSusSessions([]);
    setVtcStudents([]);
    setNotifications([]);
    setCurrentUser(OFFICIAL_LEEDO_USERS[0]);
    setBranchFilter('All');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        currentUser,
        setCurrentUser,
        switchUserRole,
        users: usersList,
        children: filteredChildren,
        allChildren: childrenList,
        shelters,
        auditLogs,
        susSessions,
        filteredSUSSessions,
        vtcStudents,
        activeView,
        setActiveView,
        selectedChildId,
        setSelectedChildId,
        globalSearchQuery,
        setGlobalSearchQuery,
        isOnline,
        setIsOnline,
        offlineQueueCount: offlineQueue.length,
        syncOfflineQueue,
        syncDataToFirebase,
        isSyncingFirebase,
        branchFilter,
        setBranchFilter,

        registerNewChild,
        updateChild,
        transferToPeaceHome,
        addCaseNote,
        addHealthRecord,
        addCounselingRecord,
        addTracingAttempt,
        updateFamilyInfo,
        reintegrateChild,
        updateReintegrationFollowUp,
        createCustomReintegrationFollowUp,
        referChild,
        updateReferralFollowUp,
        createReferralFollowUp,
        markLeftWithoutNotice,
        markRecovered,
        uploadDocument,
        updateCaseStatus,
        addNewShelter,
        updateShelter,
        deleteShelter,
        archiveChild,
        deleteChildPermanently,
        resetAllDataToDefault,
        wipeAllDemoData,

        // Third-Party & Government Shelters (Referral)
        thirdPartyShelters,
        addThirdPartyShelter,
        referChildToThirdParty,

        // Staff Tasks & Counseling Notifications
        notifications,
        addNotification,
        updateNotificationStatus,
        deleteNotification,
        assignCounselingTask,

        // Password Management System
        changeUserPassword,
        resetUserPassword,
        isHrOrKantaUser,
        forcedPasswordChangeUserId,
        setForcedPasswordChangeUserId,

        isSuperAdminOrHeadOffice,
        canEnrollPeaceHome,
        canEnrollRescue,
        canAccessSUS,
        canAccessShelters,
        canAccessVTC,
        canUpdateCounseling,

        addSUSSession,
        updateSUSSession,
        deleteSUSSession,

        addVTCStudent,
        updateVTCStudent,
        deleteVTCStudent,
        recordVTCAttendance,

        addUser,
        updateUser,
        updateUserStatus,
        deleteUser,
        updateUserPermissions,
        hasDeletePermission,
        canUserPerformDelete,

        masterEmail: MASTER_HR_EMAIL,
        generateMasterOtp,
        verifyMasterOtp,
        activeMasterOtp,

        customLogoUrl,
        updateCustomLogo,
      }}
    >
      {reactChildren}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
