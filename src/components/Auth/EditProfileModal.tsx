import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Phone, 
  Mail, 
  Lock, 
  CheckCircle2, 
  User as UserIcon, 
  Shield, 
  Building2,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getUserAssignedAreasList } from '../../utils/areaPermissions';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, changeUserPassword, language } = useApp();

  const [name, setName] = useState(currentUser.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const assignedAreas = getUserAssignedAreasList(currentUser);

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(language === 'bn' ? 'দয়া করে একটি ছবি ফাইল নির্বাচন করুন' : 'Please select an image file');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg(language === 'bn' ? 'ছবির সাইজ ৩ মেগাবাইটের কম হতে হবে' : 'Image size must be less than 3MB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const raw = reader.result;
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxDim = 256;
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
            setAvatarUrl(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            setAvatarUrl(raw);
          }
          setIsUploading(false);
          setErrorMsg('');
        };
        img.onerror = () => {
          setAvatarUrl(raw);
          setIsUploading(false);
          setErrorMsg('');
        };
        img.src = raw;
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      setErrorMsg(language === 'bn' ? 'ছবি আপলোড করতে ব্যর্থ হয়েছে' : 'Failed to read image');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg(language === 'bn' ? 'আপনার নাম ফাঁকা রাখা যাবে না' : 'Name cannot be empty');
      return;
    }

    if (phone.trim().length > 0 && phone.trim().length < 6) {
      setErrorMsg(language === 'bn' ? 'মোবাইল নম্বরটি সঠিক নয়' : 'Please enter a valid phone number');
      return;
    }

    const updates: any = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      avatarUrl: avatarUrl.trim() || currentUser.avatarUrl,
    };

    if (newPassword.trim()) {
      if (newPassword.trim().length < 4) {
        setErrorMsg(language === 'bn' ? 'পাসওয়ার্ড ন্যূনতম ৪ অক্ষরের হতে হবে' : 'Password must be at least 4 characters');
        return;
      }
      changeUserPassword(currentUser.id, newPassword.trim());
      updates.password = newPassword.trim();
      updates.hasCustomPassword = true;
    }

    updateUser(currentUser.id, updates);

    setSuccessMsg(
      language === 'bn'
        ? 'আপনার প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!'
        : 'Your personal profile has been updated successfully!'
    );

    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 rounded-xl text-[#E31B23]">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-display">
                {language === 'bn' ? 'ব্যক্তিগত প্রোফাইল এডিট' : 'Edit Personal Profile'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'bn' ? 'আপনার ছবি, মোবাইল নম্বর ও পাসওয়ার্ড পরিবর্তন করুন' : 'Update your personal photo, phone, and credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          {/* Avatar Preview & Upload */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <div className="relative inline-block mb-3">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-rose-200 mx-auto shadow-sm"
              />
              <label 
                htmlFor="profile-photo-upload" 
                className="absolute bottom-0 right-0 p-2 bg-[#E31B23] hover:bg-[#c9151d] text-white rounded-full shadow-md cursor-pointer transition-transform hover:scale-105"
                title={language === 'bn' ? 'নতুন ছবি আপলোড করুন' : 'Upload photo'}
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center">
              <label 
                htmlFor="profile-photo-upload"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-rose-400 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-rose-600" />
                <span>{isUploading ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') : (language === 'bn' ? 'ডিভাইস থেকে ছবি বেছে নিন' : 'Upload from Device')}</span>
              </label>
            </div>

            {/* Quick preset avatars */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block mb-2">
                {language === 'bn' ? 'অথবা রেডিমেড প্রোফাইল ছবি বেছে নিন:' : 'Or pick from preset avatars:'}
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(av)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                      avatarUrl === av ? 'border-[#E31B23] ring-2 ring-rose-300 scale-105' : 'border-slate-200'
                    }`}
                  >
                    <img src={av} alt="avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

            {/* Direct Image URL toggle */}
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-rose-600 hover:underline cursor-pointer font-medium"
              >
                {showUrlInput 
                  ? (language === 'bn' ? 'ছবির লিংক লুকান' : 'Hide Image URL')
                  : (language === 'bn' ? 'অথবা সরাসরি ছবির লিংক দিন' : 'Or paste direct image URL')}
              </button>
              {showUrlInput && (
                <div className="mt-2">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
                  />
                </div>
              )}
            </div>

          {/* Full Name (Editable) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-rose-600" />
                <span>{language === 'bn' ? 'কর্মীর পূর্ণ নাম (Full Name) *' : 'Full Name *'}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                STAFF ID: {currentUser.id}
              </span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-semibold text-xs text-slate-900"
            />
          </div>

          {/* Role & Designation Badge */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium text-[11px]">
              {language === 'bn' ? 'পদবী ও ভূমিকা:' : 'Official Designation:'}
            </span>
            <span className="px-2 py-0.5 bg-rose-50 text-[#E31B23] font-bold text-[10px] rounded-lg border border-rose-200">
              {currentUser.designation || currentUser.role}
            </span>
          </div>

          {/* Assigned Areas Info */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs">
            <div className="flex items-center gap-1.5 text-blue-900 font-semibold mb-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'bn' ? 'নিয়োজিত এলাকা (Assigned Areas):' : 'Assigned Operational Areas:'}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {assignedAreas.length > 0 ? (
                assignedAreas.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                    {a}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 italic text-[11px]">Head Office / Central</span>
              )}
            </div>
          </div>

          {/* Mobile Phone Number */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-600" />
              <span>{language === 'bn' ? 'মোবাইল নম্বর (Mobile Phone Number) *' : 'Mobile Phone Number *'}</span>
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 01712-345678"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-mono text-xs"
            />
          </div>

          {/* Official Email */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-rose-600" />
              <span>{language === 'bn' ? 'অফিসিয়াল ইমেইল (Official Email)' : 'Official Email'}</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@leedo.org.bd"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-xs"
            />
          </div>

          {/* Password Update */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>{language === 'bn' ? 'গোপন পাসওয়ার্ড পরিবর্তন (Secret Password)' : 'Change Secret Password'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {language === 'bn' ? 'ঐচ্ছিক (খালি রাখলে অপরিবর্তিত থাকবে)' : 'Optional (leave blank to keep current)'}
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={language === 'bn' ? 'নতুন পাসওয়ার্ড দিন (ন্যূনতম ৪ অক্ষর)' : 'Enter new secret password (min 4 chars)'}
                className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-mono text-xs bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
