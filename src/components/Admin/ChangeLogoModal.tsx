import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  RefreshCw, 
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LeedoLogo } from '../LeedoLogo';

interface ChangeLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeLogoModal: React.FC<ChangeLogoModalProps> = ({ isOpen, onClose }) => {
  const { customLogoUrl, updateCustomLogo, language, currentUser } = useApp();

  const [previewLogo, setPreviewLogo] = useState<string>(customLogoUrl || '');
  const [urlInput, setUrlInput] = useState<string>(customLogoUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle local image file upload & compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন (PNG, JPG, SVG, ইত্যাদি)।' : 'Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(language === 'bn' ? 'ছবির সাইজ ৫ মেগাবাইট (5MB)-এর কম হতে হবে।' : 'Image size must be less than 5MB.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const img = new Image();
      img.onload = async () => {
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
        let finalLogo = result;
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          finalLogo = canvas.toDataURL('image/png', 0.9);
        }
        setPreviewLogo(finalLogo);
        setUrlInput('');

        // Auto activate and save
        setIsSaving(true);
        try {
          await updateCustomLogo(finalLogo);
          setSuccessMsg(
            language === 'bn'
              ? 'নতুন লোগো সফলভাবে সক্রিয় এবং ক্লাউডে সংরক্ষিত হয়েছে!'
              : 'New organization logo activated and saved successfully!'
          );
          setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
          console.warn('Logo save err:', err);
        } finally {
          setIsSaving(false);
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

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const target = previewLogo || urlInput.trim();
    try {
      await updateCustomLogo(target || null);
      setIsSaving(false);
      setSuccessMsg(
        language === 'bn'
          ? 'প্রতিষ্ঠানের লোগো সফলভাবে সংরক্ষিত হয়েছে! সকল স্ক্রিনে নতুন লোগো প্রদর্শিত হচ্ছে।'
          : 'Organization logo saved successfully across all screens.'
      );
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setIsSaving(false);
      setErrorMsg(language === 'bn' ? 'লোগো সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save logo. Please try again.');
    }
  };

  const handleResetDefault = async () => {
    if (!confirm(language === 'bn' ? 'আপনি কি ডিফল্ট অফিসিয়াল লিডো লোগোতে ফিরে যেতে চান?' : 'Reset to official default LEEDO logo?')) {
      return;
    }
    setIsSaving(true);
    setPreviewLogo('');
    setUrlInput('');
    await updateCustomLogo(null);
    setIsSaving(false);
    setSuccessMsg(language === 'bn' ? 'ডিফল্ট লিডো লোগো সফলভাবে সেট করা হয়েছে।' : 'Default LEEDO logo restored.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-slate-200 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-50 text-[#E31B23] text-[10px] font-bold uppercase rounded-md border border-rose-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{language === 'bn' ? 'এইচআর প্রশাসন এক্সক্লুসিভ' : 'HR Exclusive Access'}</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400">LEEDO Branding</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mt-1 font-display">
              {language === 'bn' ? 'প্রতিষ্ঠানের অফিশিয়াল ব্র্যান্ড লোগো পরিবর্তন' : 'Change Organization Brand Logo'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? 'এই লোগোটি ন্যাভবার, রিপোর্ট, লগইন স্ক্রিন ও সকল ফাইলে প্রদর্শিত হবে'
                : 'This logo updates across Navbar, Reports, Login Screen, and PDFs'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 pt-4 overflow-y-auto pr-1 text-xs">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Live Preview Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {language === 'bn' ? 'বর্তমান লোগো প্রিভিউ:' : 'Active Logo Live Preview:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-center min-h-[80px]">
                <span className="text-[9px] text-slate-400 font-semibold mb-1 block uppercase">
                  {language === 'bn' ? 'টপ ন্যাভবার হেডার রূপ:' : 'Navbar Header View:'}
                </span>
                <LeedoLogo size="sm" variant="horizontal" customLogoUrl={previewLogo || customLogoUrl} />
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center min-h-[80px] text-center">
                <span className="text-[9px] text-slate-400 font-semibold mb-1 block uppercase">
                  {language === 'bn' ? 'রিপোর্ট ও লগইন রূপ:' : 'Reports & Login View:'}
                </span>
                <LeedoLogo size="sm" variant="vertical" customLogoUrl={previewLogo || customLogoUrl} />
              </div>
            </div>
          </div>

          {/* Option 1: Upload from Device */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Upload className="w-4 h-4 text-[#E31B23]" />
              <span>{language === 'bn' ? '১. কম্পিউটার থেকে ফাইল আপলোড' : '1. Upload File from Computer'}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {language === 'bn'
                ? 'স্বচ্ছ ব্যাকগ্রাউন্ডের PNG, SVG বা JPG লোগো নির্বাচন করুন (সর্বোচ্চ ৫ মেগাবাইট)।'
                : 'Select a PNG, SVG, or JPG image file (Max 5MB).'}
            </p>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-rose-50 border-2 border-dashed border-slate-300 hover:border-rose-400 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-[#E31B23]" />
                <span>{language === 'bn' ? 'লোগো ফাইল নির্বাচন করুন' : 'Select Image File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {previewLogo && previewLogo !== customLogoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewLogo(customLogoUrl || '');
                    setUrlInput('');
                  }}
                  className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              )}
            </div>
          </div>

          {/* Option 2: Image URL */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? '২. অথবা লোগোর ওয়েব লিংক (URL) পেস্ট করুন' : '2. Or Paste Image URL Link'}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (e.target.value.trim()) {
                    setPreviewLogo(e.target.value.trim());
                  }
                }}
                placeholder="https://example.com/leedo-logo.png"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('');
                    setPreviewLogo(customLogoUrl || '');
                  }}
                  className="px-2 py-1 text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
                >
                  {language === 'bn' ? 'মুছুন' : 'Clear'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={handleResetDefault}
            disabled={isSaving || (!customLogoUrl && !previewLogo)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ডিফল্ট লিডো লোগোতে ফিরুন' : 'Reset to Default'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer hover:bg-slate-50 text-xs"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>
                {isSaving
                  ? (language === 'bn' ? 'সংরক্ষিত হচ্ছে...' : 'Saving...')
                  : (language === 'bn' ? 'লোগো সংরক্ষণ করুন' : 'Save Logo')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
