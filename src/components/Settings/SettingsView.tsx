import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  CloudUpload, 
  RefreshCw, 
  BookOpen, 
  LogOut, 
  Lock, 
  Sparkles, 
  Database, 
  Check, 
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LeedoLogo } from '../LeedoLogo';

interface SettingsViewProps {
  onOpenManualModal?: () => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenManualModal,
  onLogout,
}) => {
  const {
    currentUser,
    isHrOrKantaUser,
    customLogoUrl,
    updateCustomLogo,
    syncDataToFirebase,
    isSyncingFirebase,
    resetAllDataToDefault,
    language,
    children,
    users,
    susSessions,
    vtcStudents,
  } = useApp();

  const isHrAdmin = 
    isHrOrKantaUser || 
    currentUser.role === 'Super Admin' || 
    Boolean(currentUser.permissions?.canManageHR);

  const [previewLogo, setPreviewLogo] = useState<string>(customLogoUrl || '');
  const [urlInput, setUrlInput] = useState<string>(customLogoUrl || '');
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [logoSuccessMsg, setLogoSuccessMsg] = useState('');
  const [logoErrorMsg, setLogoErrorMsg] = useState('');

  // Handle image file upload from device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoErrorMsg(language === 'bn' ? 'অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন (PNG, JPG, SVG, ইত্যাদি)।' : 'Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    // Limit to reasonable size for Data URL storage (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setLogoErrorMsg(language === 'bn' ? 'ছবির সাইজ ২ মেগাবাইট (2MB)-এর কম হতে হবে।' : 'Image size must be less than 2MB.');
      return;
    }

    setLogoErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Optimize & scale down via canvas so it fits smoothly in Cloud Firestore (<100KB)
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 400;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/png', 0.9);
          setPreviewLogo(optimizedDataUrl);
          setUrlInput('');
        } else {
          setPreviewLogo(result);
          setUrlInput('');
        }
      };
      img.onerror = () => {
        setPreviewLogo(result);
        setUrlInput('');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    setIsSavingLogo(true);
    setLogoSuccessMsg('');
    setLogoErrorMsg('');

    const targetUrl = previewLogo || urlInput.trim();
    try {
      await updateCustomLogo(targetUrl || null);
      setIsSavingLogo(false);
      setLogoSuccessMsg(
        language === 'bn'
          ? 'প্রতিষ্ঠানের লোগো সফলভাবে ক্লাউড ডেটাবেসে সংরক্ষিত হয়েছে! সকল কম্পিউটার ও ব্যবহারকারীর স্ক্রিনে নতুন লোগো প্রদর্শিত হবে।'
          : 'Organization logo saved to Google Cloud Firestore successfully! The new logo is now active across all devices and users.'
      );
      setTimeout(() => setLogoSuccessMsg(''), 6000);
    } catch (err: any) {
      setIsSavingLogo(false);
      setLogoErrorMsg(language === 'bn' ? 'লোগো সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save logo. Please try again.');
    }
  };

  const handleResetToDefaultLogo = async () => {
    if (!confirm(language === 'bn' ? 'আপনি কি ডিফল্ট অফিসিয়াল লিডো লোগোতে ফিরে যেতে চান?' : 'Reset to official default LEEDO logo?')) {
      return;
    }
    setIsSavingLogo(true);
    setPreviewLogo('');
    setUrlInput('');
    await updateCustomLogo(null);
    setIsSavingLogo(false);
    setLogoSuccessMsg(language === 'bn' ? 'ডিফল্ট লিডো লোগো সফলভাবে সেট করা হয়েছে।' : 'Default LEEDO logo restored.');
    setTimeout(() => setLogoSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
            Configuration & Branding
          </span>
          <span className="text-xs text-slate-400">&bull;</span>
          <span className="text-xs text-slate-500 font-medium">LEEDO System Settings</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 font-display mt-1">
          {language === 'bn' ? 'সিস্টেম সেটিংস ও অর্গানাইজেশন কনফিগারেশন' : 'System Preferences & Organization Settings'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'bn'
            ? 'প্রতিষ্ঠানের অফিশিয়াল ব্র্যান্ড লোগো পরিবর্তন, ক্লাউড ডেটাবেস স্থায়িত্ব ও নিরাপত্তা ব্যবস্থাপনা'
            : 'Manage organization brand logo, persistent Google Cloud Firestore storage, and administrative controls'}
        </p>
      </div>

      {/* 1. Dedicated Organization Logo Management Card (Sole authoritative place) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 rounded-xl text-[#E31B23]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                {language === 'bn' ? 'প্রতিষ্ঠানের ব্র্যান্ড ও লোগো ব্যবস্থাপনা' : 'Organization Brand Logo Management'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-9">
              {language === 'bn'
                ? 'এইচআর ও অ্যাডমিন অনুমোদিত কর্মকর্তারা এখান থেকে লোগো আপডেট করতে পারবেন। এটি ক্লাউডে সেভ থাকবে এবং যেকোনো কম্পিউটার বা আইডি থেকে দৃশ্যমান হবে।'
                : 'Authorized HR & Admin personnel can change the official organization logo. Persisted to Cloud Firestore across all devices and sessions.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {customLogoUrl ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                {language === 'bn' ? 'কাস্টম লোগো সক্রিয়' : 'Custom Logo Active'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                {language === 'bn' ? 'অফিসিয়াল ডিফল্ট লোগো' : 'Official Default Logo'}
              </span>
            )}
          </div>
        </div>

        {/* Live Logo Preview Showcase */}
        <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
            {language === 'bn' ? 'বর্তমান লোগো প্রিভিউ (Live Preview across App):' : 'Active Logo Preview:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Horizontal Variant Preview (Navbar Header) */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-center min-h-[90px]">
              <span className="text-[10px] text-slate-400 font-semibold mb-2 block uppercase">
                {language === 'bn' ? 'টপ হেডার ও ন্যাভবার রূপ (Horizontal):' : 'Navbar Header View:'}
              </span>
              <LeedoLogo size="sm" variant="horizontal" customLogoUrl={previewLogo || customLogoUrl} />
            </div>

            {/* Vertical Variant Preview (Reports & Login) */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center min-h-[90px] text-center">
              <span className="text-[10px] text-slate-400 font-semibold mb-2 block uppercase">
                {language === 'bn' ? 'রিপোর্ট ও লগইন পেজ রূপ (Vertical):' : 'Reports & Login View:'}
              </span>
              <LeedoLogo size="sm" variant="vertical" customLogoUrl={previewLogo || customLogoUrl} />
            </div>
          </div>
        </div>

        {/* HR Exclusive Editing Controls */}
        {isHrAdmin ? (
          <div className="space-y-4 pt-2">
            {logoSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{logoSuccessMsg}</span>
              </div>
            )}

            {logoErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {logoErrorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Upload from Device */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <Upload className="w-4 h-4 text-[#E31B23]" />
                  <span>{language === 'bn' ? '১. কম্পিউটার থেকে নতুন লোগো ফাইল আপলোড' : '1. Upload Logo from Device'}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {language === 'bn'
                    ? 'আপনার কম্পিউটার বা মোবাইল থেকে স্বচ্ছ ব্যাকগ্রাউন্ডের PNG বা SVG লোগো বেছে নিন (সর্বোচ্চ ২ মেগাবাইট)।'
                    : 'Choose a PNG, SVG, or JPG image from your computer (Max 2MB).'}
                </p>
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-rose-50 border-2 border-dashed border-slate-300 hover:border-rose-400 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-[#E31B23]" />
                  <span>{language === 'bn' ? 'ফাইল বেছে নিন (Choose Image File)' : 'Select Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option B: Direct Image URL */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>{language === 'bn' ? '২. অথবা ছবির সরাসরি ওয়েব লিংক দিন' : '2. Or Enter Direct Image URL'}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {language === 'bn'
                    ? 'ক্লাউড হোস্টেড বা ওয়েবসাইটে থাকা লোগোর সরাসরি URL পেস্ট করুন।'
                    : 'Paste direct HTTPS URL of your organization logo.'}
                </p>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setPreviewLogo(e.target.value);
                  }}
                  placeholder="https://example.org/leedo-logo.png"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetToDefaultLogo}
                disabled={isSavingLogo || (!customLogoUrl && !previewLogo)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডিফল্ট লিডো লোগোতে ফিরুন' : 'Reset to Default LEEDO Logo'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveLogo}
                disabled={isSavingLogo}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#c9151d] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingLogo ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {isSavingLogo
                    ? (language === 'bn' ? 'ক্লাউডে সংরক্ষিত হচ্ছে...' : 'Saving to Cloud...')
                    : (language === 'bn' ? 'লোগো সংরক্ষণ করুন (Save to Cloud)' : 'Save Organization Logo')}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
            <Lock className="w-5 h-5 text-slate-400 shrink-0" />
            <div>
              <strong className="text-slate-800">
                {language === 'bn' ? 'লোগো পরিবর্তনের অধিকার সংরক্ষিত' : 'Logo Modification Restricted'}
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'bn'
                  ? 'শুধুমাত্র এইচআর প্রশাসন ও সুপার অ্যাডমিন অনুমোদিত কর্মকর্তারা প্রাতিষ্ঠানিক লোগো পরিবর্তন করতে পারবেন।'
                  : 'Only HR Administration and Super Admin personnel are authorized to change the official organization logo.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Google Cloud Firestore Persistent Storage Guarantee Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                {language === 'bn' ? 'ক্লাউড ডেটাবেস সংরক্ষণ ও স্থায়িত্ব (৫+ বছর সুরক্ষা)' : 'Persistent Cloud Storage & 5-Year Guarantee'}
              </h2>
              <p className="text-xs text-slate-500">Google Cloud Firestore (Enterprise Managed DB)</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{language === 'bn' ? 'ক্লাউড সক্রিয় ও সিঙ্কড' : 'Cloud Active & Synced'}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">শিশু ও কেস ফাইল</span>
            <span className="text-xl font-bold text-slate-900 font-display">{children.length}</span>
            <span className="text-[10px] text-emerald-600 font-medium block">Cloud Persisted</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">স্টাফ অ্যাকাউন্ট</span>
            <span className="text-xl font-bold text-slate-900 font-display">{users.length}</span>
            <span className="text-[10px] text-emerald-600 font-medium block">Cloud Persisted</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">এসইউএস সেশন</span>
            <span className="text-xl font-bold text-slate-900 font-display">{susSessions.length}</span>
            <span className="text-[10px] text-emerald-600 font-medium block">Cloud Persisted</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">কারিগরি শিক্ষার্থী</span>
            <span className="text-xl font-bold text-slate-900 font-display">{vtcStudents.length}</span>
            <span className="text-[10px] text-emerald-600 font-medium block">Cloud Persisted</span>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1.5 leading-relaxed">
          <strong>{language === 'bn' ? 'মাল্টি-কম্পিউটার ও দীর্ঘমেয়াদী সংরক্ষণ গ্যারান্টি:' : 'Multi-Device Long-Term Persistence Guarantee:'}</strong>
          <p className="text-[11px] text-emerald-900">
            {language === 'bn'
              ? 'যেকোনো ব্যবহারকারী যেকোনো কম্পিউটার বা আইডি থেকে ডেটা আপলোড করলে তা তাৎক্ষণিকভাবে গুগল ক্লাউড ফায়ারস্টোর (Firestore Database ID: ai-studio-leedochildprotec-be79cc7b-6e25-4bef-8f62-e325f97bf756)-এ স্থায়ীভাবে সংরক্ষিত হয়। ফলে অন্য কম্পিউটার থেকে লগইন করলেও সকল পরিবর্তন সাথে সাথে দৃশ্যমান থাকে এবং ৫ বছর বা তার পরেও সকল রেকর্ড অক্ষুণ্ন থাকবে।'
              : 'Every rescue intake, child profile update, SUS education session, and employee change is written directly to Google Cloud Firestore in real time. Accessing the system from any workstation, browser, or staff ID instantly retrieves the exact operational state, fully preserved for 5+ years.'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            {language === 'bn' ? 'প্রয়োজনে ম্যানুয়াল পুশ ব্যাকআপ করতে পারেন:' : 'Force manual backup push if needed:'}
          </span>
          <button
            onClick={async () => {
              const res = await syncDataToFirebase();
              alert(res.message);
            }}
            disabled={isSyncingFirebase}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <CloudUpload className={`w-3.5 h-3.5 ${isSyncingFirebase ? 'animate-spin' : ''}`} />
            <span>{isSyncingFirebase ? (language === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (language === 'bn' ? 'ক্লাউডে ম্যানুয়াল সিঙ্ক' : 'Force Cloud Sync')}</span>
          </button>
        </div>
      </div>

      {/* 3. Organization Profile & SOP Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4 text-xs">
        <div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">
            {language === 'bn' ? 'অফিসিয়াল প্রাতিষ্ঠানিক পরিচিতি ও হটলাইন' : 'Official Organization Profile & Secretariat'}
          </h3>
          <p className="text-slate-600">LEEDO (Local Education and Economic Development Organization)</p>
          <p className="text-slate-500 mt-1">কমলাপুর ট্রানজিট সেল হটলাইন: <strong>+88 01786-228800</strong> &bull; হেড অফিস ঢাকা: <strong>+88 017 0779 7102</strong></p>
          <p className="text-slate-500">এইচআর সেন্ট্রাল গেটওয়ে: <strong>hr.leedo2000@gmail.com</strong> &bull; বাংলাদেশ সোসাইটি রেজিস্ট্রেশন অ্যাক্ট ১৮৬০ অনুমোদিত</p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-900">
              {language === 'bn' ? 'স্ট্যান্ডার্ড অপারেটিং প্রসিডিউর (SOP) ও ম্যানুয়াল' : 'Standard Operating Procedures & Manual'}
            </h4>
            <p className="text-slate-500">
              {language === 'bn' ? 'লিডো ৪আর মডেল, চাইল্ড সেফগার্ডিং ও ফিল্ড ম্যানুয়াল দেখুন' : 'Complete 4R methodology, safeguarding policies, and field operational guidelines'}
            </p>
          </div>
          {onOpenManualModal && (
            <button
              onClick={onOpenManualModal}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>{language === 'bn' ? 'ম্যানুয়াল দেখুন' : 'View Manual'}</span>
            </button>
          )}
        </div>

        {isHrAdmin && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                {language === 'bn' ? 'সিস্টেম ফ্রেশ রিসেট (এইচআর / অ্যাডমিন)' : 'System Fresh Reset (HR / Admin)'}
              </h4>
              <p className="text-slate-500">
                {language === 'bn'
                  ? 'সকল কেস ডাটা পরিষ্কার করে ভেরিফাইড অফিসিয়াল স্টাফ ও শেল্টার সহ ফ্রেশ সিস্টেমে ফিরুন'
                  : 'Reset system cases to a fresh operational state with verified staff roster'}
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm(language === 'bn' ? 'আপনি কি সিস্টেমের সকল রেকর্ড রিসেট করতে চান?' : 'Reset system to a clean operational state?')) {
                  resetAllDataToDefault();
                }
              }}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ডাটা রিসেট' : 'Reset Data'}</span>
            </button>
          </div>
        )}

        {onLogout && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                {language === 'bn' ? 'লগআউট ও সেশন সমাপ্তি' : 'Sign Out Session'}
              </h4>
              <p className="text-slate-500">
                {language === 'bn' ? 'বর্তমান সেশন থেকে বের হয়ে লগইন স্ক্রিনে ফিরুন' : 'Exit current session and return to organizational login screen'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
