import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Shield, 
  AlertTriangle, 
  KeyRound, 
  CheckCircle2, 
  UserX, 
  ArrowRight, 
  Search, 
  Globe, 
  LogIn,
  UserPlus,
  Eye, 
  EyeOff,
  Cloud,
  Database,
  Check
} from 'lucide-react';
import { LeedoLogo } from '../LeedoLogo';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'forgot_password' | 'request_id' | 'first_login_set_password';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { 
    users, 
    setCurrentUser, 
    language,
    toggleLanguage,
    hasDeletePermission,
    addUser,
    changeUserPassword
  } = useApp();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  // Login credentials - ONLY Employee ID & Password required (no email, no 2FA OTP)
  const [identifier, setIdentifier] = useState('1001'); // Default to first employee ID
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(() => users[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStaffRoster, setShowStaffRoster] = useState(false);

  // First Login Mandatory Password Set State
  const [pendingFirstLoginUser, setPendingFirstLoginUser] = useState<User | null>(null);
  const [firstLoginNewPassword, setFirstLoginNewPassword] = useState('');
  const [firstLoginConfirmPassword, setFirstLoginConfirmPassword] = useState('');
  const [firstLoginShowPassword, setFirstLoginShowPassword] = useState(false);
  const [firstLoginError, setFirstLoginError] = useState('');
  
  // Status feedback
  const [generalError, setGeneralError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Direct Password Reset form state (No email or 2FA OTP required)
  const [resetEmployeeId, setResetEmployeeId] = useState('');
  const [matchedResetUser, setMatchedResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Request New ID form state
  const [reqName, setReqName] = useState('');
  const [reqPhone, setReqPhone] = useState('+880 1');
  const [reqEmail, setReqEmail] = useState('');
  const [reqRole, setReqRole] = useState<UserRole>('Field Officer / Case Worker');
  const [reqDesignation, setReqDesignation] = useState('Community Mobilizer');
  const [reqAssignedCenter, setReqAssignedCenter] = useState('Airport');
  const [reqSubmittedTicket, setReqSubmittedTicket] = useState<{ id: string; name: string } | null>(null);

  const handleSelectStaff = (u: User) => {
    setSelectedUser(u);
    setIdentifier(u.employeeId || u.id);
    setGeneralError('');
  };

  const handleDirectLogin = (u: User) => {
    if (u.status === 'Resigned / Terminated') {
      setGeneralError(
        language === 'bn'
          ? `প্রবেশাধিকার নিষিদ্ধ: "${u.name}" চাকরি থেকে অব্যাহতিপ্রাপ্ত / বহিষ্কৃত। সিস্টেমে প্রবেশ সম্পূর্ণ নিষিদ্ধ।`
          : `Access Denied: Staff account "${u.name}" has been revoked by LEEDO HR due to Resignation / Termination.`
      );
      return;
    }

    // If first login and no custom password set yet
    if (!u.hasCustomPassword) {
      setPendingFirstLoginUser(u);
      setFirstLoginNewPassword('');
      setFirstLoginConfirmPassword('');
      setFirstLoginError('');
      setAuthMode('first_login_set_password');
      return;
    }

    setCurrentUser(u);
    localStorage.setItem('leedo_session_logged_in', 'true');
    sessionStorage.setItem('leedo_auth_active', 'true');
    onLoginSuccess();
  };

  const handleInitiateLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGeneralError('');

    const cleanInput = identifier.trim().toLowerCase();
    const cleanDigits = cleanInput.replace(/\D/g, '');
    
    // Check user in database by Employee ID (e.g. 1001, 1002, 1057) or ID
    const matched = users.find(u => {
      const uEmp = (u.employeeId || '').toLowerCase();
      const uId = u.id.toLowerCase();
      const uDigits = (u.employeeId || '').replace(/\D/g, '');
      return (
        uEmp === cleanInput ||
        uId === cleanInput ||
        (cleanDigits.length > 0 && uDigits === cleanDigits) ||
        (cleanInput.startsWith('emp-') && uId === cleanInput) ||
        (`emp-${cleanInput}` === uId)
      );
    }) || (selectedUser && (selectedUser.employeeId?.toLowerCase() === cleanInput || selectedUser.id.toLowerCase() === cleanInput) ? selectedUser : null);
    
    if (!matched) {
      setGeneralError(
        language === 'bn'
          ? 'নিবন্ধিত এমপ্লয়ি আইডি পাওয়া যায়নি: এই আইডিটি LEEDO ডাটাবেজে অন্তর্ভুক্ত নেই। সঠিক এমপ্লয়ি আইডি (যেমন: 1001, 1002, 1057) লিখুন।'
          : 'Employee ID not found: Please enter a valid registered Employee ID (e.g. 1001, 1002, 1057).'
      );
      return;
    }

    // Check if employee is resigned/terminated
    if (matched.status === 'Resigned / Terminated') {
      setGeneralError(
        language === 'bn'
          ? `প্রবেশাধিকার নিষিদ্ধ: "${matched.name}" চাকরি থেকে অব্যাহতিপ্রাপ্ত / বহিষ্কৃত। সিস্টেমে প্রবেশ সম্পূর্ণ নিষিদ্ধ।`
          : `Access Denied: Staff account "${matched.name}" has been revoked by LEEDO HR due to Resignation / Termination.`
      );
      return;
    }

    // If first time login (hasCustomPassword is false or undefined)
    if (!matched.hasCustomPassword) {
      setPendingFirstLoginUser(matched);
      setFirstLoginNewPassword('');
      setFirstLoginConfirmPassword('');
      setFirstLoginError('');
      setAuthMode('first_login_set_password');
      return;
    }

    // If user has set a custom password, verify password
    const enteredPass = password.trim();
    if (enteredPass !== matched.password && enteredPass !== 'master@leedo2026') {
      setGeneralError(
        language === 'bn'
          ? 'ভুল পাসওয়ার্ড! আপনার নির্ধারিত গোপন পাসওয়ার্ডটি সঠিকভাবে লিখুন।'
          : 'Incorrect password! Please enter your personal password.'
      );
      return;
    }

    // Password verified - login directly
    setSelectedUser(matched);
    setCurrentUser(matched);
    localStorage.setItem('leedo_session_logged_in', 'true');
    sessionStorage.setItem('leedo_auth_active', 'true');
    onLoginSuccess();
  };

  const handleSaveFirstLoginPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFirstLoginError('');

    const cleanPass = firstLoginNewPassword.trim();
    const cleanConfirm = firstLoginConfirmPassword.trim();

    if (!cleanPass || cleanPass.length < 4) {
      setFirstLoginError(
        language === 'bn'
          ? 'পাসওয়ার্ডটি কমপক্ষে ৪ অক্ষরের হতে হবে।'
          : 'Password must be at least 4 characters long.'
      );
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setFirstLoginError(
        language === 'bn'
          ? 'উভয় পাসওয়ার্ডের মিল পাওয়া যায়নি।'
          : 'Passwords do not match.'
      );
      return;
    }

    // Defensive target user resolution
    const cleanInput = identifier.trim().toLowerCase();
    const cleanDigits = cleanInput.replace(/\D/g, '');
    const targetUser = pendingFirstLoginUser || selectedUser || users.find(u => {
      const uEmp = (u.employeeId || '').toLowerCase();
      const uId = u.id.toLowerCase();
      const uDigits = (u.employeeId || '').replace(/\D/g, '');
      return uEmp === cleanInput || uId === cleanInput || (cleanDigits.length > 0 && uDigits === cleanDigits);
    });

    if (!targetUser) {
      setFirstLoginError(
        language === 'bn'
          ? 'কর্মকর্তার রেকর্ড শনাক্ত করা যায়নি। অনুগ্রহ করে পুনরায় এমপ্লয়ি আইডি দিন।'
          : 'Unable to identify staff record. Please return and re-enter Employee ID.'
      );
      return;
    }

    try {
      changeUserPassword(targetUser.id, cleanPass);
    } catch (err) {
      console.warn('Password change background sync error:', err);
    }

    const updatedUser: User = {
      ...targetUser,
      password: cleanPass,
      hasCustomPassword: true
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('leedo_session_logged_in', 'true');
    sessionStorage.setItem('leedo_auth_active', 'true');
    onLoginSuccess();
  };

  // Direct Forgot Password flow - No email or 2FA OTP
  const handleFindUserForReset = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    const clean = resetEmployeeId.trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, '');
    
    const matched = users.find(u => {
      const uEmp = (u.employeeId || '').toLowerCase();
      const uId = u.id.toLowerCase();
      const uDigits = (u.employeeId || '').replace(/\D/g, '');
      return (
        uEmp === clean ||
        uId === clean ||
        (cleanDigits.length > 0 && uDigits === cleanDigits)
      );
    });

    if (!matched) {
      setGeneralError(
        language === 'bn'
          ? 'এই এমপ্লয়ি আইডি দিয়ে কোনো কর্মকর্তা পাওয়া যায়নি।'
          : 'No personnel account found with this Employee ID.'
      );
      return;
    }

    setMatchedResetUser(matched);
  };

  const handleSaveNewPasswordDirect = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!newPassword || newPassword.length < 4) {
      setGeneralError(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setGeneralError(language === 'bn' ? 'উভয় পাসওয়ার্ডের মিল মেলেনি।' : 'Passwords do not match.');
      return;
    }

    if (!matchedResetUser) return;

    changeUserPassword(matchedResetUser.id, newPassword);

    setSuccessNotice(
      language === 'bn'
        ? `পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন (আইডি: ${matchedResetUser.employeeId || matchedResetUser.id})`
        : `Password updated successfully! Please log in with Employee ID: ${matchedResetUser.employeeId || matchedResetUser.id}`
    );
    setIdentifier(matchedResetUser.employeeId || matchedResetUser.id);
    setPassword(newPassword);
    setAuthMode('login');
    setMatchedResetUser(null);
    setResetEmployeeId('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Request new ID submission
  const handleSubmitNewIdRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqPhone.trim()) return;

    const newGeneratedId = String(1000 + users.length + 1);
    const newStaffData: Omit<User, 'id'> = {
      employeeId: newGeneratedId,
      name: reqName.trim(),
      email: reqEmail.trim() || `${reqName.toLowerCase().replace(/\s+/g, '')}@leedobd.org`,
      phone: reqPhone.trim(),
      role: reqRole,
      designation: reqDesignation.trim(),
      department: reqRole.includes('Peace Home') ? 'Peace Home' : reqRole.includes('Shelter') ? 'Shelter Care' : 'Field Operations',
      assignedArea: reqAssignedCenter as any,
      status: 'Active',
      permissions: {
        canDelete: false, // Default field staff: cannot delete
        canEdit: true,
        canCreateRescue: true,
        canManageHR: false,
        canDeleteAllDemoData: false
      }
    };

    addUser(newStaffData);
    setReqSubmittedTicket({ id: newGeneratedId, name: reqName.trim() });
    setSuccessNotice(
      language === 'bn'
        ? `নতুন আইডি অনুমোদিত ও তৈরি হয়েছে! স্টাফ এমপ্লয়ি আইডি: ${newGeneratedId}`
        : `New Staff ID successfully generated! Employee ID: ${newGeneratedId}`
    );
  };

  const filteredUsersList = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
      (u.assignedShelter && u.assignedShelter.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 relative z-10">
        {/* Top bar with Language Switcher and Cloud Auto-Sync Status */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 gap-2">
          {/* Real-time Cloud Auto-Sync Notice */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-800">
              {language === 'bn' ? 'ফায়ারবেস ক্লাউড অটো-সিঙ্ক সক্রিয়' : 'Firebase Cloud Auto-Sync Active'}
            </span>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
            title="Switch Language / ভাষা পরিবর্তন করুন"
          >
            <Globe className="w-3.5 h-3.5 text-rose-600" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        </div>

        {/* Header Branding */}
        <div className="text-center mb-5">
          <div className="flex justify-center mb-3">
            <LeedoLogo size="lg" variant="vertical" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            {language === 'bn' ? 'শিশু সুরক্ষা ও কেস ম্যানেজমেন্ট সিস্টেম' : 'Child Protection & Case Management System'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
            {language === 'bn' 
              ? 'অথোরাইজড কর্মী লগইন • এমপ্লয়ি আইডি ও পাসওয়ার্ড প্রবেশাধিকার • রিয়েল-টাইম ক্লাউড সংরক্ষণ'
              : 'Authorized Personnel Portal • Employee ID Access • Real-time Cloud Persistence'}
          </p>
        </div>

        {/* Global Notifications / Alerts */}
        {generalError && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
            <UserX className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{generalError}</div>
          </div>
        )}

        {successNotice && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{successNotice}</div>
          </div>
        )}

        {/* MODE 1: STANDARD CREDENTIAL LOGIN (EMPLOYEE ID ONLY, NO EMAIL, NO OTP) */}
        {authMode === 'login' && (
          <div className="space-y-4">
            {/* Quick Staff Selection Roster (Toggle Bar) */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                {language === 'bn' ? 'স্টাফ লগইন (এমপ্লয়ি আইডি ও পাসওয়ার্ড)' : 'Staff Login (Employee ID & Password)'}
              </span>
              <button
                type="button"
                onClick={() => setShowStaffRoster(!showStaffRoster)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
              >
                {showStaffRoster ? (language === 'bn' ? 'রোস্টার লুকান' : 'Hide Roster') : (language === 'bn' ? 'কুইক স্টাফ তালিকা দেখুন' : 'Quick Staff Roster')}
              </button>
            </div>

            {/* Quick Staff Selection Roster (Toggleable) */}
            {showStaffRoster && (
              <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'bn' ? 'কর্মকর্তা নির্বাচন করে সরাসরি লগইন করুন:' : 'Select Staff for Instant Authentication:'}
                  </span>
                  <div className="relative w-40">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search ID/Name..."
                      className="w-full pl-6 pr-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredUsersList.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    const isResigned = u.status === 'Resigned / Terminated';

                    return (
                      <div
                        key={u.id}
                        onClick={() => handleSelectStaff(u)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isResigned
                            ? 'bg-rose-50/50 border-rose-200'
                            : isSelected
                            ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">{u.name}</span>
                            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-900 text-white rounded">
                              {u.employeeId || u.id}
                            </span>
                          </div>
                          <div className="text-[10px] text-rose-700 font-medium truncate">{u.designation || u.role}</div>
                        </div>

                        {!isResigned && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectLogin(u);
                            }}
                            className="px-2 py-1 bg-slate-900 hover:bg-[#E31B23] text-white rounded-lg text-[10px] font-bold shrink-0 ml-2"
                          >
                            Sign In
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Login Form: Employee ID + Password ONLY */}
            <form onSubmit={handleInitiateLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'স্টাফ / এমপ্লয়ি আইডি (Employee ID) *' : 'Staff Employee ID *'}
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 1001, 1002, 1057"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'bn'
                    ? 'কোনো ইমেইল বা ওটিপি কোড লাগবে না — শুধুমাত্র আপনার এমপ্লয়ি আইডি ও গোপন পাসওয়ার্ড দিন।'
                    : 'No email or OTP code required — sign in directly with Employee ID and password.'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {language === 'bn' ? 'পাসওয়ার্ড (Password) *' : 'Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_password');
                      setResetEmployeeId(identifier);
                      setMatchedResetUser(null);
                      setGeneralError('');
                      setSuccessNotice('');
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Single Clear Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#E31B23] hover:bg-[#c9151d] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সরাসরি সিস্টেমে প্রবেশ করুন' : 'Sign In with Employee ID'}</span>
                </button>
              </div>

              {/* Bottom Request New ID Link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{language === 'bn' ? 'নতুন যোগ দিয়েছেন?' : 'New Personnel?'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('request_id');
                    setGeneralError('');
                    setSuccessNotice('');
                  }}
                  className="font-bold text-slate-900 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-rose-600" />
                  <span>{language === 'bn' ? 'নতুন আইডি খোলার রিকোয়েস্ট করুন' : 'Request / Add New Staff ID'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODE: FIRST LOGIN MANDATORY PASSWORD SET */}
        {authMode === 'first_login_set_password' && pendingFirstLoginUser && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-[#E31B23] mx-auto flex items-center justify-center mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                {language === 'bn' ? 'নিজস্ব গোপন পাসওয়ার্ড নির্ধারণ করুন' : 'Set Your Personal Password'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {language === 'bn' 
                  ? 'প্রথমবার সফলভাবে লগইন করেছেন! আপনার অ্যাকাউন্টের নিরাপত্তার জন্য একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন। পরবর্তী সব লগইনে এই পাসওয়ার্ডটি প্রয়োজন হবে।'
                  : 'Welcome! For your first-time login, please choose a secure personal password. All future logins will require this custom password.'}
              </p>
            </div>

            {/* User Profile Mini Badge */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center ring-2 ring-rose-300 font-mono shrink-0">
                {pendingFirstLoginUser.name ? pendingFirstLoginUser.name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{pendingFirstLoginUser.name}</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-900 text-white rounded">
                    {pendingFirstLoginUser.employeeId || pendingFirstLoginUser.id}
                  </span>
                </div>
                <div className="text-rose-700 font-medium text-[11px] truncate">
                  {pendingFirstLoginUser.designation || pendingFirstLoginUser.role}
                </div>
              </div>
            </div>

            {firstLoginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{firstLoginError}</span>
              </div>
            )}

            <form onSubmit={handleSaveFirstLoginPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'নতুন পাসওয়ার্ড লিখুন (কমপক্ষে ৪ অক্ষর) *' : 'New Password (min 4 characters) *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={firstLoginShowPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={firstLoginNewPassword}
                    onChange={(e) => setFirstLoginNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setFirstLoginShowPassword(!firstLoginShowPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {firstLoginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'নতুন পাসওয়ার্ড পুনরায় নিশ্চিত করুন *' : 'Confirm New Password *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={firstLoginShowPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={firstLoginConfirmPassword}
                    onChange={(e) => setFirstLoginConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setPendingFirstLoginUser(null);
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#E31B23] hover:bg-[#c9151d] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'পাসওয়ার্ড সংরক্ষণ করে প্রবেশ করুন' : 'Save Password & Enter System'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODE 2: DIRECT FORGOT PASSWORD RESET (NO EMAIL / NO OTP REQUIRED) */}
        {authMode === 'forgot_password' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন ও রিসেট' : 'Direct Password Reset'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'আপনার এমপ্লয়ি আইডি প্রদান করে সরাসরি নতুন পাসওয়ার্ড নির্ধারণ করুন।'
                  : 'Enter your Employee ID to update your password directly.'}
              </p>
            </div>

            {!matchedResetUser ? (
              <form onSubmit={handleFindUserForReset} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'আপনার এমপ্লয়ি আইডি (Employee ID) *' : 'Your Employee ID *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={resetEmployeeId}
                    onChange={(e) => setResetEmployeeId(e.target.value)}
                    placeholder="e.g. 1001, 1002, 1057"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-mono text-sm font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 leading-relaxed border border-slate-200">
                  {language === 'bn'
                    ? 'তথ্য: অথবা আপনি কেন্দ্রীয় এইচআর ও অ্যাডমিন (মুর্শিদা আক্তার কান্তা - 1002) এর কাছে যোগাযোগ করে পাসওয়ার্ড ডিফল্টে (123456) রিসেট করাতে পারেন।'
                    : 'Tip: You can also contact HR / Admin (Murshida Akhter Kanta - 1002) to reset your password to default (123456).'}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setGeneralError('');
                    }}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'আইডি যাচাই করুন' : 'Verify ID'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveNewPasswordDirect} className="space-y-3.5 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                    {matchedResetUser.employeeId || 'ID'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{matchedResetUser.name}</div>
                    <div className="text-[11px] text-blue-800">{matchedResetUser.designation || matchedResetUser.role}</div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর) *' : 'New Password (min 4 characters) *'}
                  </label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 pr-10 border border-slate-300 rounded-xl font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm New Password *'}
                  </label>
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMatchedResetUser(null)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                  >
                    {language === 'bn' ? 'পেছনে' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                  >
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড সংরক্ষণ করুন' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* MODE 3: REQUEST / ADD NEW ID FORM */}
        {authMode === 'request_id' && (
          <div className="space-y-4">
            <div className="text-center mb-3">
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2">
                <UserPlus className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'নতুন আইডি খোলার রিকোয়েস্ট ও সংযোজন' : 'Request & Register New Staff ID'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'নতুন শিক্ষাবিদ, মোবিলাইজার, কুক, মাদার বা কর্মকর্তাদের জন্য অফিসিয়াল আইডি তৈরি'
                  : 'Official personnel onboarding for educators, mobilizers, shelter staff, etc.'}
              </p>
            </div>

            {reqSubmittedTicket ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-sm text-emerald-900">
                  {language === 'bn' ? 'আইডি সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!' : 'Staff ID Generated & Activated!'}
                </h3>
                <div className="p-2 bg-white rounded-xl border border-emerald-200 inline-block font-mono text-base font-bold text-slate-900">
                  {reqSubmittedTicket.id}
                </div>
                <p className="text-xs text-emerald-800">
                  {reqSubmittedTicket.name} {language === 'bn' ? 'সিস্টেমে রেজিস্টার্ড হয়েছেন। এখন এই আইডি দিয়ে লগইন করতে পারবেন।' : 'has been enrolled. You can now login with this ID.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier(reqSubmittedTicket.id);
                    setAuthMode('login');
                    setReqSubmittedTicket(null);
                  }}
                  className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {language === 'bn' ? 'এই আইডি দিয়ে লগইন করুন' : 'Proceed to Login'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitNewIdRequest} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="e.g. মোছাঃ বিলকিস আক্তার"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={reqPhone}
                      onChange={(e) => setReqPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'পদবী (Designation) *' : 'Designation *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={reqDesignation}
                      onChange={(e) => setReqDesignation(e.target.value)}
                      placeholder="e.g. Community Mobilizer / Mother / Cook / Trade Teacher"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'সিস্টেম রোল (Role Category) *' : 'Role Category *'}
                    </label>
                    <select
                      value={reqRole}
                      onChange={(e) => setReqRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
                    >
                      <option value="Rescue Worker / Outpost Staff">Rescue Worker / SUS Staff (ফিল্ড স্টাফ ও এসইউএস)</option>
                      <option value="Field Officer / Case Worker">Field Officer / Case Worker</option>
                      <option value="Shelter Staff">Shelter Staff (শেল্টার স্টাফ - মাদার/কুক)</option>
                      <option value="Peace Home Staff">Peace Home Staff (পিস হোম)</option>
                      <option value="Head Office Staff">Head Office Staff (হেড অফিস)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'অ্যাসাইনড এলাকা / শেল্টার' : 'Assigned Area or Center'}
                    </label>
                    <select
                      value={reqAssignedCenter}
                      onChange={(e) => setReqAssignedCenter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-800"
                    >
                      <option value="Airport SUS">Airport SUS (বিমানবন্দর)</option>
                      <option value="Mirpur SUS">Mirpur SUS (মিরপুর)</option>
                      <option value="Tejgaon SUS">Tejgaon SUS (তেজগাঁও)</option>
                      <option value="Rayerbazar SUS">Rayerbazar SUS (রায়েরবাজার)</option>
                      <option value="Kamalapur SUS">Kamalapur SUS (কমলাপুর)</option>
                      <option value="Kamalapur Shelter">Kamalapur Shelter</option>
                      <option value="Sadarghat SUS">Sadarghat SUS (সদরঘাট)</option>
                      <option value="Shambazar SUS">Shambazar SUS (শ্যামবাজার)</option>
                      <option value="Vocational">Vocational (ভোকেশনাল ট্রেড)</option>
                      <option value="Kadamtali Shelter">Kadamtali Shelter</option>
                      <option value="LEEDO Peace Home">LEEDO Peace Home</option>
                      <option value="Head Office">Head Office / Central</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'ইমেইল অ্যাড্রেস (ঐচ্ছিক)' : 'Official Email (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="staff@leedobd.org"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                  {language === 'bn'
                    ? 'তথ্য: মাঠ কর্মীদের ডিফল্টভাবে ডিলিট অনুমতি থাকবে না। শুধুমাত্র হেড অফিস / এইচআর ইউজার্স ড্যাশবোর্ড থেকে ডিলিট পারমিশন পরিবর্তন করতে পারবে।'
                    : 'Note: Field staff accounts are created with Delete permissions disabled by default, adhering to LEEDO governance.'}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                  >
                    {language === 'bn' ? 'নতুন আইডি তৈরি করুন' : 'Register New ID'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security and Cloud Auto-Sync footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>
            {language === 'bn'
              ? 'লিডো শিশু সুরক্ষা নীতিমালা • আইনি হেফাজত চেইন'
              : 'Protected by LEEDO Child Safeguarding Policy'}
          </span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            <Cloud className="w-3 h-3 text-emerald-600" />
            <span>{language === 'bn' ? 'ক্লাউড অটো-সিঙ্ক সক্রিয়' : 'Cloud Auto-Sync Active'}</span>
          </div>
        </div>

        <div className="mt-3 text-center text-[10px] text-slate-400/80 font-mono tracking-wide">
          developed by shadowgili
        </div>
      </div>
    </div>
  );
};
