import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  Lock, 
  CheckCircle2, 
  User as UserIcon, 
  Shield, 
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getUserAssignedAreasList } from '../../utils/areaPermissions';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, changeUserPassword, language } = useApp();

  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const assignedAreas = getUserAssignedAreasList(currentUser);

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
                {language === 'bn' ? 'আপনার নাম, মোবাইল নম্বর ও পাসওয়ার্ড আপডেট করুন' : 'Update your personal details, phone, and credentials'}
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

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
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
          {/* User Profile Identity Header */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E31B23] to-rose-700 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
              {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'LD'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</div>
              <div className="text-xs text-rose-700 font-medium truncate">{currentUser.designation || currentUser.role}</div>
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">ID: {currentUser.id} &bull; {currentUser.email}</div>
            </div>
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
