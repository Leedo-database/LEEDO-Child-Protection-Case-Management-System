import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ChildList } from './components/Children/ChildList';
import { ChildProfile } from './components/Children/ChildProfile';
import { RegisterChildModal } from './components/Children/RegisterChildModal';
import { ShelterManagement } from './components/Shelters/ShelterManagement';
import { TasksAndAlerts } from './components/Tasks/TasksAndAlerts';
import { ReportsView } from './components/Reports/ReportsView';
import { AuditLogsView } from './components/Admin/AuditLogsView';
import { UsersView } from './components/Admin/UsersView';
import { SUSManagement } from './components/SUS/SUSManagement';
import { VocationalManagement } from './components/Vocational/VocationalManagement';
import { FourRWorkflow } from './components/Workflow/FourRWorkflow';
import { ReferralManagement } from './components/Referral/ReferralManagement';
import { GlobalSearchModal } from './components/Search/GlobalSearchModal';
import { SystemManualModal } from './components/Manual/SystemManualModal';
import { LoginView } from './components/Auth/LoginView';
import { Settings, Shield, RefreshCw, CloudUpload, Database, BookOpen } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    selectedChildId, 
    setSelectedChildId, 
    currentUser,
    resetAllDataToDefault,
    syncDataToFirebase,
    isSyncingFirebase,
    language
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('leedo_auth_active') === 'true';
  });

  const handleLoginSuccess = () => {
    sessionStorage.setItem('leedo_auth_active', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('leedo_auth_active');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    setActiveView('child-profile');
  };

  const handleChildRegistered = (newChildId: string) => {
    setSelectedChildId(newChildId);
    setActiveView('child-profile');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-rose-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onOpenRegisterModal={() => setRegisterModalOpen(true)}
        onOpenSearchModal={() => setSearchModalOpen(true)}
        onOpenManualModal={() => setManualModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Body with Fixed/Collapsible Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenRegisterModal={() => setRegisterModalOpen(true)}
          onOpenManualModal={() => setManualModalOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Active View Dispatcher */}
          {activeView === 'dashboard' && <DashboardView />}

          {activeView === 'children' && (
            <ChildList
              onOpenRegisterModal={() => setRegisterModalOpen(true)}
              onSelectChild={handleSelectChild}
            />
          )}

          {activeView === 'child-profile' && selectedChildId && (
            <ChildProfile
              childId={selectedChildId}
              onBack={() => {
                setSelectedChildId(null);
                setActiveView('children');
              }}
            />
          )}

          {activeView === '4r-methodology' && <FourRWorkflow />}

          {activeView === 'sus' && <SUSManagement />}

          {activeView === 'vtc' && <VocationalManagement />}

          {activeView === 'shelters' && <ShelterManagement />}

          {activeView === 'family-tracing' && (
            <ChildList
              onOpenRegisterModal={() => setRegisterModalOpen(true)}
              onSelectChild={handleSelectChild}
            />
          )}

          {activeView === 'health' && <TasksAndAlerts />}
          {activeView === 'counseling' && <TasksAndAlerts />}
          {activeView === 'reintegration' && (
            <ChildList
              onOpenRegisterModal={() => setRegisterModalOpen(true)}
              onSelectChild={handleSelectChild}
            />
          )}
          {activeView === 'referral' && <ReferralManagement />}
          {activeView === 'follow-up' && <TasksAndAlerts />}

          {activeView === 'tasks' && <TasksAndAlerts />}

          {activeView === 'reports' && <ReportsView />}

          {activeView === 'documents' && (
            <ChildList
              onOpenRegisterModal={() => setRegisterModalOpen(true)}
              onSelectChild={handleSelectChild}
            />
          )}

          {activeView === 'users' && <UsersView />}

          {activeView === 'audit-logs' && <AuditLogsView />}

          {activeView === 'settings' && (
            <div className="space-y-5 pb-12">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
                    Configuration
                  </span>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs text-slate-500 font-medium">LEEDO System Settings</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 font-display mt-1">
                  System Preferences & Data Controls
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage organization settings, seed test cases, and database reset controls
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Organization Profile</h3>
                  <p className="text-slate-500">LEEDO (Local Education and Economic Development Organization)</p>
                  <p className="text-slate-500">Official Roster: 49 Verified Personnel &bull; Kamalapur Hotline: +88 01786-228800</p>
                  <p className="text-slate-500">HQ Secretariat: +88 017 0779 7102 &bull; Contact: hr.leedo2000@gmail.com &bull; Dhaka, Bangladesh</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Standard Operating Procedures</h3>
                    <p className="text-slate-500">Open complete field manual, 4R methodology guide, and role matrix</p>
                  </div>
                  <button
                    onClick={() => setManualModalOpen(true)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#E31B23]" />
                    <span>View Manual</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Google Cloud Firestore Synchronization</h3>
                    <p className="text-slate-500">Persist child directory, staff accounts, and VTC attendance to Firebase</p>
                  </div>
                  <button
                    onClick={async () => {
                      const res = await syncDataToFirebase();
                      alert(res.message);
                    }}
                    disabled={isSyncingFirebase}
                    className="px-3.5 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <CloudUpload className={`w-3.5 h-3.5 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
                    <span>{isSyncingFirebase ? 'Synchronizing...' : 'Sync to Firestore'}</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {language === 'bn' ? 'সিস্টেম ডাটা রিসেট' : 'Reset System Data'}
                    </h3>
                    <p className="text-slate-500">
                      {language === 'bn' 
                        ? 'সকল কেস ডাটা পরিষ্কার করে ভেরিফাইড অফিসিয়াল স্টাফ ও শেল্টার সহ ফ্রেশ সিস্টেমে ফিরুন' 
                        : 'Reset system cases to a fresh operational state with verified staff roster and shelters'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(language === 'bn' ? 'আপনি কি সিস্টেমের সকল রেকর্ড রিসেট করতে চান?' : 'Reset system to a clean operational state?')) {
                        resetAllDataToDefault();
                      }
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ডাটা রিসেট' : 'Reset Data'}</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Sign Out</h3>
                    <p className="text-slate-500">Exit current session and return to organizational login screen</p>
                  </div>
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <RegisterChildModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onRegistered={handleChildRegistered}
      />

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectChild={handleSelectChild}
      />

      <SystemManualModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
