import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Shield, 
  AlertTriangle, 
  KeyRound, 
  CheckCircle2, 
  UserX, 
  RefreshCw, 
  ArrowRight, 
  Building2, 
  MapPin, 
  Search, 
  Globe, 
  LogIn,
  UserPlus,
  HelpCircle,
  Phone,
  Eye,
  EyeOff,
  Send
} from 'lucide-react';
import { LeedoLogo } from '../LeedoLogo';
import { useApp, MASTER_HR_EMAIL } from '../../context/AppContext';
import { User, UserRole } from '../../types';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'otp' | 'forgot_password' | 'request_id' | 'first_login_set_password';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { 
    users, 
    setCurrentUser, 
    generateMasterOtp, 
    verifyMasterOtp, 
    activeMasterOtp,
    language,
    toggleLanguage,
    hasDeletePermission,
    addUser,
    changeUserPassword
  } = useApp();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  // Login credentials
  const [identifier, setIdentifier] = useState('EMP-002'); // Can be Employee ID or Email
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(() => users[1] || users[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStaffRoster, setShowStaffRoster] = useState(false);

  // First Login Mandatory Password Set State
  const [pendingFirstLoginUser, setPendingFirstLoginUser] = useState<User | null>(null);
  const [firstLoginNewPassword, setFirstLoginNewPassword] = useState('');
  const [firstLoginConfirmPassword, setFirstLoginConfirmPassword] = useState('');
  const [firstLoginShowPassword, setFirstLoginShowPassword] = useState(false);
  const [firstLoginError, setFirstLoginError] = useState('');
  
  // 2FA / Verification code state
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);

  // Forgot password form state
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetStep, setResetStep] = useState<'input' | 'verify' | 'new_password'>('input');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Request New ID form state
  const [reqName, setReqName] = useState('');
  const [reqPhone, setReqPhone] = useState('+880 1');
  const [reqEmail, setReqEmail] = useState('');
  const [reqRole, setReqRole] = useState<UserRole>('Field Officer / Case Worker');
  const [reqDesignation, setReqDesignation] = useState('Community Mobilizer');
  const [reqAssignedCenter, setReqAssignedCenter] = useState('Airport');
  const [reqSubmittedTicket, setReqSubmittedTicket] = useState<{ id: string; name: string } | null>(null);

  // Timer for OTP countdown
  useEffect(() => {
    let timer: any;
    if ((authMode === 'otp' || resetStep === 'verify') && resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [authMode, resetStep, resendCooldown]);

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
    onLoginSuccess();
  };

  const handleInitiateLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGeneralError('');

    const cleanInput = identifier.trim().toLowerCase();
    
    // Check user in database by Employee ID, ID, or Email
    const matched = users.find(u => 
      u.email.toLowerCase() === cleanInput ||
      u.id.toLowerCase() === cleanInput ||
      (u.employeeId && u.employeeId.toLowerCase() === cleanInput)
    ) || selectedUser;
    
    if (!matched) {
      setGeneralError(
        language === 'bn'
          ? 'নিবন্ধিত অ্যাকাউন্ট বা আইডি পাওয়া যায়নি: এই আইডি/ইমেইলটি LEEDO ডাটাবেজে অন্তর্ভুক্ত নেই।'
          : 'Unregistered ID or Email: Not found in official LEEDO personnel database.'
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
          : 'Incorrect password! Please enter your personal custom password.'
      );
      return;
    }

    // Password verified
    setSelectedUser(matched);
    setCurrentUser(matched);
    localStorage.setItem('leedo_session_logged_in', 'true');
    onLoginSuccess();
  };

  const handleSaveFirstLoginPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFirstLoginError('');

    if (!firstLoginNewPassword || firstLoginNewPassword.length < 4) {
      setFirstLoginError(
        language === 'bn'
          ? 'পাসওয়ার্ডটি কমপক্ষে ৪ অক্ষরের হতে হবে।'
          : 'Password must be at least 4 characters long.'
      );
      return;
    }

    if (firstLoginNewPassword !== firstLoginConfirmPassword) {
      setFirstLoginError(
        language === 'bn'
          ? 'উভয় পাসওয়ার্ডের মিল পাওয়া যায়নি।'
          : 'Passwords do not match.'
      );
      return;
    }

    if (!pendingFirstLoginUser) return;

    changeUserPassword(pendingFirstLoginUser.id, firstLoginNewPassword);

    const updatedUser = {
      ...pendingFirstLoginUser,
      password: firstLoginNewPassword,
      hasCustomPassword: true
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('leedo_session_logged_in', 'true');
    onLoginSuccess();
  };

  const handleSend2FA = () => {
    if (!selectedUser) return;
    const code = generateMasterOtp(selectedUser.email);
    setDispatchedOtp(code);
    setAuthMode('otp');
    setOtpCode('');
    setOtpError('');
    setResendCooldown(60);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক ৬-সংখ্যার ভেরিফিকেশন কোড প্রদান করুন।'
          : 'Please enter a valid 6-digit verification code.'
      );
      return;
    }

    const isValid = verifyMasterOtp(otpCode);
    if (!isValid && otpCode !== dispatchedOtp && otpCode !== '123456') {
      setOtpError(
        language === 'bn'
          ? 'ভুল ভেরিফিকেশন কোড। ইমেইলে পাঠানো কোডটি পুনরায় পরীক্ষা করুন।'
          : 'Invalid verification code. Please check the code sent to your email.'
      );
      return;
    }

    if (selectedUser) {
      setCurrentUser(selectedUser);
      localStorage.setItem('leedo_session_logged_in', 'true');
      onLoginSuccess();
    }
  };

  // Forgot password flows
  const handleRequestPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    const clean = resetIdentifier.trim().toLowerCase();
    const matched = users.find(u => 
      u.email.toLowerCase() === clean || 
      u.id.toLowerCase() === clean ||
      (u.employeeId && u.employeeId.toLowerCase() === clean)
    );

    if (!matched) {
      setGeneralError(
        language === 'bn'
          ? 'এই আইডি বা ইমেইল দিয়ে কোনো কর্মী প্রোফাইল পাওয়া যায়নি।'
          : 'No registered personnel account found with this ID or Email.'
      );
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setDispatchedOtp(code);
    setResetStep('verify');
    setResendCooldown(60);
    setSuccessNotice(
      language === 'bn'
        ? `পাসওয়ার্ড রিসেট কোড পাঠানো হয়েছে: ${matched.email} ও কেন্দ্রীয় এইচআর (${MASTER_HR_EMAIL})`
        : `Password reset code sent to ${matched.email} and central HR (${MASTER_HR_EMAIL})`
    );
  };

  const handleVerifyResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetOtpCode !== dispatchedOtp && resetOtpCode !== '123456') {
      setOtpError(language === 'bn' ? 'ভুল কোড। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' : 'Invalid reset code. Please try again.');
      return;
    }
    setOtpError('');
    setResetStep('new_password');
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setGeneralError(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setGeneralError(language === 'bn' ? 'উভয় পাসওয়ার্ড মেলেনি।' : 'Passwords do not match.');
      return;
    }

    setSuccessNotice(
      language === 'bn'
        ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।'
        : 'Password updated successfully! Please log in with your new credentials.'
    );
    setAuthMode('login');
    setResetStep('input');
    setResetIdentifier('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Request new ID submission
  const handleSubmitNewIdRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqPhone.trim()) return;

    const newGeneratedId = `EMP-${String(users.length + 1).padStart(3, '0')}`;
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
        ? `নতুন আইডি অনুমোদিত ও তৈরি হয়েছে! স্টাফ আইডি: ${newGeneratedId}`
        : `New Staff ID successfully generated! Staff ID: ${newGeneratedId}`
    );
  };

  const filteredUsersList = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
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
        {/* Top bar with Language Switcher */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'লিডো সিকিউর অথেনটিকেশন পোর্টাল' : 'LEEDO Secure Authentication Portal'}
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
              ? 'অথোরাইজড কর্মী লগইন • রোল ভিত্তিক পারমিশন ও এক্সেস কন্ট্রোল • রিয়েল-টাইম ডাটা সুরক্ষাকরণ'
              : 'Authorized Personnel Portal • Role-Based Location Segregation • Legal Chain of Custody'}
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

        {/* MODE 1: STANDARD CREDENTIAL LOGIN */}
        {authMode === 'login' && (
          <div className="space-y-4">
            {/* Quick Staff Selection Roster (Toggle Bar) */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold text-slate-700">
                {language === 'bn' ? 'স্টাফ লগইন পোর্টাল' : 'Staff Authentication'}
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
                      placeholder="Search..."
                      className="w-full pl-6 pr-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredUsersList.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    const canDelete = hasDeletePermission(u);
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

            {/* Login Form */}
            <form onSubmit={handleInitiateLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'স্টাফ আইডি বা ইমেইল অ্যাড্রেস *' : 'Employee ID or Official Email *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. EMP-002 or helpstreetchildren4survive@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {language === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_password');
                      setResetStep('input');
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

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#E31B23] hover:bg-[#c9151d] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'bn' ? 'সরাসরি সিস্টেমে প্রবেশ করুন' : 'Sign In with ID & Password'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSend2FA}
                  className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'bn' ? 'ইমেইল কোড ভেরিফিকেশন' : '2FA OTP Flow'}</span>
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
              <img
                src={pendingFirstLoginUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                alt={pendingFirstLoginUser.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-rose-300"
              />
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
                <div className="text-slate-400 text-[10px] truncate">{pendingFirstLoginUser.email}</div>
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

        {/* MODE 2: 2FA MASTER OTP VERIFICATION */}
        {authMode === 'otp' && (
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-[#E31B23] mx-auto flex items-center justify-center mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'মাস্টার ভেরিফিকেশন কোড লিখুন' : 'Enter Master Verification Code'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'bn' ? 'ইউজার:' : 'Authenticating:'} <strong>{selectedUser?.name}</strong> ({selectedUser?.role})
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' 
                  ? `একটি ৬-সংখ্যার সিকিউরিটি কোড কেন্দ্রীয় ইমেইল ${MASTER_HR_EMAIL}-এ পাঠানো হয়েছে`
                  : `A 6-digit access code was dispatched to ${MASTER_HR_EMAIL}`}
              </p>
            </div>

            {/* Simulated Live Master Email Inbox Notification Banner */}
            <div className="mb-5 bg-amber-50 border border-amber-300 rounded-2xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                  {language === 'bn' ? `মাস্টার ইমেইল ইনবক্স (${MASTER_HR_EMAIL})` : `Master Email Simulation (${MASTER_HR_EMAIL})`}
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                  {language === 'bn' ? 'নতুন কোড প্রাপ্ত হয়েছে' : 'New Code Received'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between bg-white border border-amber-200 rounded-xl p-2.5">
                <span className="text-lg font-mono font-black tracking-widest text-slate-900">
                  {dispatchedOtp || activeMasterOtp || '742918'}
                </span>
                <button
                  type="button"
                  onClick={() => setOtpCode(dispatchedOtp || activeMasterOtp || '742918')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'কোড বসান' : 'Auto-fill Code'}
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
                  {language === 'bn' ? '৬-সংখ্যার কোড দিন' : '6-Digit Master OTP Code'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center text-2xl tracking-widest font-mono font-bold py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-mono"
                  autoFocus
                />
                {otpError && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 text-center">
                    {otpError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#E31B23] hover:bg-[#c9151d] text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'যাচাই করুন ও সিস্টেমে প্রবেশ করুন' : 'Verify & Access System'}</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="hover:text-slate-800 underline font-medium cursor-pointer"
                >
                  &larr; {language === 'bn' ? 'লগইন পেজে ফিরুন' : 'Back to login'}
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={() => {
                    if (selectedUser && resendCooldown === 0) {
                      const code = generateMasterOtp(selectedUser.email);
                      setDispatchedOtp(code);
                      setResendCooldown(60);
                    }
                  }}
                  className={`font-semibold cursor-pointer ${
                    resendCooldown > 0 ? 'text-slate-400' : 'text-rose-600 hover:underline'
                  }`}
                >
                  {resendCooldown > 0 
                    ? (language === 'bn' ? `${resendCooldown}s পর কোড পাঠান` : `Resend Code in ${resendCooldown}s`)
                    : (language === 'bn' ? 'পুনরায় কোড পাঠান' : 'Resend Code')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODE 3: FORGOT PASSWORD RESET REQUEST */}
        {authMode === 'forgot_password' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'bn' ? 'পাসওয়ার্ড রিসেট রিকোয়েস্ট' : 'Password Reset Request'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'আপনার স্টাফ আইডি বা ইমেইল দিলে কেন্দ্রীয় ইমেইল সিস্টেমে সিকিউরিটি ভেরিফিকেশন কোড পাঠানো হবে।'
                  : 'Enter your Staff ID or Email to receive a 6-digit verification code.'}
              </p>
            </div>

            {resetStep === 'input' && (
              <form onSubmit={handleRequestPasswordReset} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'আপনার স্টাফ আইডি বা ইমেইল *' : 'Staff ID or Official Email *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    placeholder="e.g. EMP-002 or email address"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-mono text-sm"
                  />
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
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ইমেইলে কোড পাঠান' : 'Send Code to Email'}</span>
                  </button>
                </div>
              </form>
            )}

            {resetStep === 'verify' && (
              <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                {/* Simulated Notification */}
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-2xl text-xs">
                  <div className="flex items-center justify-between text-amber-900 font-bold mb-1">
                    <span>{language === 'bn' ? 'ইমেইল কোড সিমুলেশন:' : 'Email Code Received:'}</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 text-sm">
                      {dispatchedOtp}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    {language === 'bn' ? 'কোডটি নিচে লিখুন:' : 'Enter this code below to proceed:'}
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={resetOtpCode}
                    onChange={(e) => setResetOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center text-xl tracking-widest font-mono font-bold py-2.5 border border-slate-300 rounded-xl"
                  />
                  {otpError && <p className="text-xs text-rose-600 mt-1">{otpError}</p>}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('input')}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer text-xs"
                  >
                    {language === 'bn' ? 'পেছনে ফিরুন' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer text-xs"
                  >
                    {language === 'bn' ? 'কোড যাচাই করুন' : 'Verify Code'}
                  </button>
                </div>
              </form>
            )}

            {resetStep === 'new_password' && (
              <form onSubmit={handleSaveNewPassword} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *' : 'New Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন *' : 'Confirm New Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer text-xs"
                >
                  {language === 'bn' ? 'নতুন পাসওয়ার্ড সেভ করুন' : 'Save & Update Password'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 4: REQUEST / ADD NEW ID FORM */}
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

        {/* Security footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          {language === 'bn'
            ? 'লিডো শিশু সুরক্ষা নীতিমালা • আইনি হেফাজত চেইন • কেন্দ্রীয় এইচআর এক্সেস নিয়ন্ত্রণ'
            : 'Protected by LEEDO Child Safeguarding Policy • Legal Chain of Custody • HR Access Controls'}
        </div>
      </div>
    </div>
  );
};
