import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  Bell, 
  Wifi, 
  WifiOff, 
  Menu, 
  UserCheck, 
  Shield, 
  Home, 
  Compass, 
  CheckCircle2, 
  AlertTriangle,
  BookOpen,
  Languages,
  LogOut,
  UserCog
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LeedoLogo } from './LeedoLogo';
import { UserRole } from '../types';
import { getSixWeekAlertStatus, getHealthAlert, getCounselingAlert, getNextPendingFollowUp } from '../utils/calculations';
import { EditProfileModal } from './Auth/EditProfileModal';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenRegisterModal: () => void;
  onOpenSearchModal: () => void;
  onOpenManualModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onOpenRegisterModal,
  onOpenSearchModal,
  onOpenManualModal,
  onLogout,
}) => {
  const { 
    currentUser, 
    switchUserRole, 
    users, 
    children, 
    notifications,
    updateNotificationStatus,
    setActiveView, 
    isOnline, 
    setIsOnline,
    setSelectedChildId,
    language,
    toggleLanguage,
    t
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Filter staff notifications for current user (e.g. Nargis counseling tasks, Coordinator new rescue verifications)
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

  const pendingUserNotifications = userStaffNotifications.filter((n) => n.status !== 'Completed' && n.status !== 'Verified');

  // Compute urgent alerts across all children
  const urgentAlerts: { id: string; childName: string; childId: string; type: string; message: string; severity: 'high' | 'medium' }[] = [];

  children.forEach((c) => {
    if (c.isArchived) return;

    // 6-week alert
    const sixWeek = getSixWeekAlertStatus(c);
    if (sixWeek.status === 'exceeded') {
      urgentAlerts.push({
        id: `6w-${c.id}`,
        childName: c.name,
        childId: c.id,
        type: 'Shelter Stay Alert',
        message: `${c.name} has exceeded 6 weeks in shelter (${sixWeek.daysInShelter} days)`,
        severity: 'high',
      });
    } else if (sixWeek.status === 'approaching') {
      urgentAlerts.push({
        id: `6w-app-${c.id}`,
        childName: c.name,
        childId: c.id,
        type: 'Approaching 6 Weeks',
        message: `${c.name} approaching 6 weeks (${sixWeek.daysRemaining} days left)`,
        severity: 'medium',
      });
    }

    // Health checkup alert
    const health = getHealthAlert(c);
    if (health?.isDue) {
      urgentAlerts.push({
        id: `hl-${c.id}`,
        childName: c.name,
        childId: c.id,
        type: 'Health Check-up',
        message: `${health.message} for ${c.name}`,
        severity: health.isOverdue ? 'high' : 'medium',
      });
    }

    // Counseling alert
    const counseling = getCounselingAlert(c);
    if (counseling?.isDue) {
      urgentAlerts.push({
        id: `cs-${c.id}`,
        childName: c.name,
        childId: c.id,
        type: 'Counseling',
        message: `${counseling.message} for ${c.name}`,
        severity: counseling.isOverdue ? 'high' : 'medium',
      });
    }

    // Follow-up alert
    const fu = getNextPendingFollowUp(c);
    if (fu?.isOverdue) {
      urgentAlerts.push({
        id: `fu-${c.id}`,
        childName: c.name,
        childId: c.id,
        type: 'Follow-up Overdue',
        message: `${fu.type} follow-up is overdue for ${c.name}`,
        severity: 'high',
      });
    }

    // Left without notice active alert
    if (c.caseStatus === 'Left Without Notice' && c.leftWithoutNotice?.currentStatus === 'Missing / Under Active Search') {
      urgentAlerts.push({
        id: `lwn-${c.id}`,
        childName: c.name,
        childId: c.id,
        type: 'Left Without Notice',
        message: `Active search ongoing for ${c.name} (Motijheel PS GD filed)`,
        severity: 'high',
      });
    }
  });

  const handleRoleSelect = (role: UserRole) => {
    switchUserRole(role);
    setRoleMenuOpen(false);
  };

  const handleChildAlertClick = (childId: string) => {
    setSelectedChildId(childId);
    setActiveView('child-profile');
    setNotificationMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-xs">
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {/* Left: Mobile hamburger & LEEDO Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => { setActiveView('dashboard'); setSelectedChildId(null); }}
            className="text-left focus:outline-hidden group"
          >
            <LeedoLogo size="sm" variant="horizontal" />
          </button>
        </div>

        {/* Middle: Global Quick Search input on desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearchModal}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg transition-all text-left group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
              <span>{t('searchPlaceholder', 'Search Child ID (e.g. LEEDO-2026-0001), name, GD...')}</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-300 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* DUAL LANGUAGE TOGGLE SWITCH (Bangla <-> English) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300/80 transition-all shadow-2xs cursor-pointer"
            title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন (Switch to Bangla)' : 'Switch to English (ইংরেজিতে পরিবর্তন করুন)'}
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5 text-rose-600" />
            <span className={language === 'en' ? 'text-rose-600 font-bold' : 'text-slate-500'}>EN</span>
            <span className="text-slate-300 text-[10px]">|</span>
            <span className={language === 'bn' ? 'text-rose-600 font-bold' : 'text-slate-500'}>বাংলা</span>
          </button>

          {/* Mobile search icon */}
          <button
            onClick={onOpenSearchModal}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            title={t('searchPlaceholder', 'Search child cases')}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* New Rescue Registration button - Prominent as requested */}
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow-md active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t('registerChild', 'Register New Child / Rescue')}</span>
            <span className="sm:hidden font-medium">{language === 'bn' ? 'রেসকিউ' : 'New Rescue'}</span>
          </button>

          {/* Offline/Online toggle for field testing */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title={isOnline ? 'System is online. Click to simulate field offline mode' : 'Offline mode active. Click to simulate reconnect'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>{t('online', 'Online')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('offline', 'Field Offline')}</span>
              </>
            )}
          </button>

          {/* Global Language Switcher (Bangla / English) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title={language === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় পরিবর্তন করুন'}
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5 text-[#E31B23]" />
            <span>{language === 'bn' ? 'English (EN)' : 'বাংলা (BN)'}</span>
          </button>

          {/* System Manual / Field SOP button */}
          {onOpenManualModal && (
            <button
              onClick={onOpenManualModal}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-hidden"
              title={t('systemManual', 'Open LEEDO System Manual & Field Operations Guide')}
              aria-label="System Manual"
            >
              <BookOpen className="w-5 h-5 text-slate-600 hover:text-[#E31B23]" />
            </button>
          )}

          {/* Notifications dropdown with 6-week and case alerts */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationMenuOpen(!notificationMenuOpen);
                setRoleMenuOpen(false);
              }}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-hidden"
              aria-label="View notifications and alerts"
            >
              <Bell className="w-5 h-5" />
              {(pendingUserNotifications.length > 0 || urgentAlerts.length > 0) && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {pendingUserNotifications.length + urgentAlerts.length}
                </span>
              )}
            </button>

            {notificationMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm">Notifications & Reminders</span>
                  </div>
                  <span className="text-xs bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">
                    {pendingUserNotifications.length + urgentAlerts.length} Active
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                  {/* DIRECT STAFF NOTIFICATIONS (Nargis Counseling & Coordinator Verifications) */}
                  {pendingUserNotifications.length > 0 && (
                    <div className="bg-purple-50/70 p-3 border-b border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1">
                          🎯 {isCounselor ? 'নার্গিস আপার কাউন্সেলিং টাস্ক ও রিমাইন্ডার' : isCoordinator ? 'কো-অর্ডিনেটর রেসকিউ ভেরিফিকেশন' : 'আপনার জন্য নির্ধারিত টাস্ক'}
                        </span>
                        <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.5 rounded">
                          {pendingUserNotifications.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {pendingUserNotifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className="bg-white p-3 rounded-xl border border-purple-200 shadow-2xs hover:border-purple-400 transition-all text-xs"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <span className="font-bold text-purple-950 text-xs">{notif.title}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                notif.priority === 'Urgent' 
                                  ? 'bg-rose-100 text-rose-700' 
                                  : notif.priority === 'High' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {notif.priority || 'Normal'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                            {notif.childArea && (
                              <div className="mt-1.5 p-1.5 bg-purple-50 rounded-lg text-[11px] text-purple-900 flex items-center justify-between">
                                <span>📍 উদ্ধার এলাকা: <strong>{notif.childArea}</strong></span>
                                {notif.dueDate && <span className="text-[10px] text-purple-700 font-medium">তারিখ: {notif.dueDate}</span>}
                              </div>
                            )}

                            <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400">প্রেরক: {notif.assignedBy || 'System'}</span>
                              <div className="flex items-center gap-1.5">
                                {notif.childId && (
                                  <button
                                    onClick={() => handleChildAlertClick(notif.childId!)}
                                    className="px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                                  >
                                    প্রোফাইল দেখুন
                                  </button>
                                )}
                                <button
                                  onClick={() => updateNotificationStatus(notif.id, notif.type === 'NEW_RESCUE_VERIFICATION' ? 'Verified' : 'Completed')}
                                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer"
                                  title="Mark as completed/verified"
                                >
                                  {notif.type === 'NEW_RESCUE_VERIFICATION' ? '✓ Verify' : '✓ Done'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SYSTEM CASE ALERTS */}
                  {urgentAlerts.length === 0 && pendingUserNotifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      All shelter stays, counseling tasks, and follow-ups are up to date.
                    </div>
                  ) : (
                    urgentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => handleChildAlertClick(alert.childId)}
                        className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                            alert.severity === 'high' 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {alert.type}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">{alert.childId}</span>
                        </div>
                        <p className="text-xs text-slate-800 mt-1 font-medium">{alert.message}</p>
                        <span className="text-[11px] text-rose-600 hover:underline mt-1 inline-block">
                          View child profile &rarr;
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <button
                    onClick={() => {
                      setActiveView('tasks');
                      setNotificationMenuOpen(false);
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-rose-600 cursor-pointer"
                  >
                    View all tasks & reminders &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logged-in User's Private ID Badge & Profile Card */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleMenuOpen(!roleMenuOpen);
                setNotificationMenuOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-hidden cursor-pointer"
              title="View your logged in Employee ID & Credentials"
            >
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-rose-200"
              />
              <div className="hidden xl:block text-left text-xs leading-tight">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-slate-900 text-white rounded">
                    ID: {currentUser.id}
                  </span>
                </div>
                <div className="text-[10px] text-rose-700 font-semibold">{currentUser.designation || currentUser.role}</div>
              </div>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Official Personnel Card Header */}
                <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-rose-400"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-rose-300 font-medium truncate">{currentUser.designation || currentUser.role}</div>
                      <div className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded font-mono text-[10px] font-bold">
                        STAFF ID: {currentUser.id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Private Details (Only their own info) */}
                <div className="p-4 space-y-2.5 text-xs bg-slate-50/50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 text-[11px]">Mobile Phone:</span>
                    <span className="font-bold text-slate-900 font-mono">{currentUser.phone || '+880 1712-000000'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 text-[11px]">Official Email:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500 text-[11px]">Assigned Center:</span>
                    <span className="font-semibold text-slate-900">
                      {currentUser.assignedShelter || currentUser.assignedArea || 'Head Office / Central'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Access Level:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      currentUser.permissions?.canDelete 
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {currentUser.permissions?.canDelete 
                        ? (language === 'bn' ? 'হেড অফিস (ডিলিট সহ)' : 'Head Office (Full Access)')
                        : (language === 'bn' ? 'মাঠ কর্মী (আপডেট ও রেসকিউ)' : 'Field Staff (Update Only)')}
                    </span>
                  </div>
                </div>

                {/* Profile Edit & Logout Actions */}
                <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      setEditProfileOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <UserCog className="w-3.5 h-3.5 text-rose-600" />
                    <span>{language === 'bn' ? 'প্রোফাইল এডিট' : 'Edit Profile'}</span>
                  </button>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onLogout();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'লগআউট' : 'Log Out'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Profile Editor Modal */}
      <EditProfileModal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
    </header>
  );
};
