import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Building2, 
  HeartHandshake, 
  Activity, 
  Smile, 
  Home, 
  Send, 
  CalendarClock, 
  BellRing, 
  BarChart3, 
  FolderOpen, 
  ShieldAlert, 
  Settings, 
  ScrollText,
  GraduationCap,
  Briefcase,
  BookOpen,
  CloudUpload,
  Compass,
  PhoneCall,
  CheckCircle,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSixWeekAlertStatus } from '../utils/calculations';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenRegisterModal: () => void;
  onOpenManualModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  onOpenRegisterModal,
  onOpenManualModal,
}) => {
  const { 
    activeView, 
    setActiveView, 
    setSelectedChildId, 
    children, 
    susSessions,
    vtcStudents,
    currentUser,
    syncDataToFirebase,
    isSyncingFirebase,
    language,
    t
  } = useApp();

  // Count 6-week alerts and pending items
  const childrenOver6Weeks = children.filter((c) => {
    if (c.isArchived) return false;
    const alert = getSixWeekAlertStatus(c);
    return alert.status === 'exceeded';
  }).length;

  const navItems = [
    { id: 'dashboard', label: language === 'bn' ? 'ড্যাশবোর্ড ও ওভারভিউ' : 'Dashboard', icon: LayoutDashboard },
    { id: '4r-methodology', label: language === 'bn' ? '৪আর মডেল (রেসকিউ→পুনর্বাসন)' : '4R Model (Rescue→Rebuild)', icon: Compass },
    { id: 'children', label: language === 'bn' ? 'শিশু ও কেস ডিরেক্টরি' : 'Children / Case Directory', icon: Users, badge: children.filter(c => !c.isArchived).length },
    { id: 'sus', label: language === 'bn' ? 'স্কুল আন্ডার দ্য স্কাই (SUS)' : 'School Under the Sky (SUS)', icon: GraduationCap, badge: susSessions.length },
    { id: 'vtc', label: language === 'bn' ? 'কারিগরি প্রশিক্ষণ কেন্দ্র (VTC)' : 'Vocational Trade Center (VTC)', icon: Briefcase, badge: vtcStudents.length },
    { id: 'shelters', label: language === 'bn' ? 'শেল্টার ও পিস হোম' : 'Shelters & Peace Home', icon: Building2 },
    { id: 'family-tracing', label: language === 'bn' ? 'পরিবার সন্ধান ও যোগাযোগ' : 'Family Tracing', icon: HeartHandshake },
    { id: 'health', label: language === 'bn' ? 'স্বাস্থ্য ব্যবস্থাপনা' : 'Health Management', icon: Activity },
    { id: 'counseling', label: language === 'bn' ? 'কাউন্সেলিং ও মানসিক স্বাস্থ্য' : 'Counseling & Trauma', icon: Smile },
    { id: 'reintegration', label: language === 'bn' ? 'পরিবারে পুনরেকত্রীকরণ' : 'Reintegration', icon: Home },
    { id: 'referral', label: language === 'bn' ? 'সরকারি ও ৩য় পক্ষ রেফারেল' : 'Govt & 3rd Party Referral', icon: Send },
    { id: 'follow-up', label: language === 'bn' ? 'ফলো-আপ মনিটরিং' : 'Post Follow-up', icon: CalendarClock },
    { 
      id: 'tasks', 
      label: language === 'bn' ? 'টাস্ক ও ৬-সপ্তাহ সতর্কতা' : 'Tasks & 6-Wk Alerts', 
      icon: BellRing, 
      badge: childrenOver6Weeks > 0 ? (language === 'bn' ? `${childrenOver6Weeks} সতর্কতা` : `${childrenOver6Weeks} alert`) : undefined,
      badgeColor: 'bg-rose-600 text-white'
    },
    { id: 'reports', label: language === 'bn' ? 'প্রতিবেদন ও এক্সপোর্ট' : 'Reports & Exports', icon: BarChart3 },
    { id: 'documents', label: language === 'bn' ? 'নথিপত্র ও ছবি' : 'Documents & Photos', icon: FolderOpen },
    { id: 'users', label: language === 'bn' ? 'এইচআর কর্মী ও রোলস (৫৫ জন)' : 'HR Staff & Roles (55 Staff)', icon: ShieldAlert, adminOnly: true },
    { id: 'audit-logs', label: language === 'bn' ? 'সিস্টেম অডিট লগ' : 'Audit Logs', icon: ScrollText, adminOnly: true },
    { id: 'settings', label: language === 'bn' ? 'সিস্টেম সেটিংস' : 'Settings', icon: Settings },
  ];

  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    setSelectedChildId(null);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden">
          <span className="font-bold text-slate-800 text-sm">
            {language === 'bn' ? 'লিডো নেভিগেশন মেনু' : 'LEEDO Navigation'}
          </span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick action button inside sidebar */}
        <div className="p-3.5 pb-2">
          <button
            onClick={() => {
              onOpenRegisterModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E31B23] hover:bg-[#c9151d] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন শিশু / রেসকিউ নিবন্ধন' : 'Register New Child / Rescue'}</span>
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
            {language === 'bn' ? 'মূল কার্যাবলী' : 'Main Operations'}
          </div>
          {navItems.map((item) => {
            // Check admin permission
            if (item.adminOnly && currentUser.role !== 'Super Admin' && currentUser.role !== 'Head Office Staff') {
              return null;
            }

            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Emergency Hotlines Strip */}
        <div className="px-3 py-2 border-t border-slate-200 bg-slate-50/60 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <PhoneCall className="w-3.5 h-3.5 text-[#E31B23]" />
            <span>{language === 'bn' ? 'জরুরি যোগাযোগ নাম্বার' : 'Emergency Hotlines'}</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 pl-5">
            <span>কমলাপুর:</span>
            <span className="font-mono font-semibold text-slate-800">+88 01786-228800</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 pl-5">
            <span>হেড অফিস:</span>
            <span className="font-mono font-semibold text-slate-800">+88 017 0779 7102</span>
          </div>
        </div>

        {/* Quick Utilities: System Manual & Cloud Sync */}
        <div className="px-3 py-2 border-t border-slate-200 bg-slate-50/50 space-y-1.5">
          {onOpenManualModal && (
            <button
              onClick={() => {
                onOpenManualModal();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#E31B23]" />
                <span>{language === 'bn' ? 'ম্যানুয়াল ও এসওপি' : 'System Manual & SOP'}</span>
              </div>
              <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold">Help</span>
            </button>
          )}

          <button
            onClick={async () => {
              const res = await syncDataToFirebase();
              alert(res.message);
            }}
            disabled={isSyncingFirebase}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Sync offline and local database to Cloud Firestore"
          >
            <div className="flex items-center gap-2">
              <CloudUpload className={`w-3.5 h-3.5 ${isSyncingFirebase ? 'animate-spin text-rose-600' : 'text-slate-400'}`} />
              <span className="text-[11px]">{isSyncingFirebase ? (language === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (language === 'bn' ? 'ফায়ারবেসে সিঙ্ক' : 'Sync with Firestore')}</span>
            </div>
            <span className="text-[10px] text-slate-400">Cloud DB</span>
          </button>
        </div>

        {/* Staff Role Profile & System Status */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
              <div className="text-[11px] text-rose-600 font-medium truncate">{currentUser.role}</div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
            <span>LEEDO CPMS v2.6</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              {language === 'bn' ? 'অনলাইন' : 'Online'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
