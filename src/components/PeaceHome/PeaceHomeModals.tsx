import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  GraduationCap, 
  Heart, 
  Smile, 
  User, 
  CheckCircle2, 
  Send, 
  Briefcase, 
  Home, 
  Calendar, 
  MapPin, 
  Phone, 
  Award,
  AlertCircle
} from 'lucide-react';
import { 
  Child, 
  PeaceHomeProgressRecord, 
  PeaceHomeDepartureRecord, 
  PeaceHomeDevelopmentCategory, 
  PeaceHomeProgressScore, 
  PeaceHomeExitType 
} from '../../types';
import { getTodayDateString } from '../../utils/calculations';
import { useApp } from '../../context/AppContext';

// ==========================================
// 1. ADD PEACE HOME PROGRESS RECORD MODAL
// ==========================================
interface AddProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child;
  onAdd: (record: Omit<PeaceHomeProgressRecord, 'id' | 'createdAt'>) => void;
}

export const AddPeaceHomeProgressModal: React.FC<AddProgressModalProps> = ({
  isOpen,
  onClose,
  child,
  onAdd,
}) => {
  const { currentUser, language } = useApp();

  // Detect appropriate default author role
  const defaultRole = (() => {
    const des = (currentUser.designation || '').toLowerCase();
    const name = currentUser.name.toLowerCase();
    if (des.includes('manager') || name.includes('sohel')) return 'Manager Peace Home';
    if (des.includes('mother') || name.includes('parvin') || name.includes('parveen')) return 'Peace Home Mother';
    if (des.includes('counselor') || des.includes('psycho') || name.includes('nargis')) return 'Psychosocial Counselor';
    return 'Manager Peace Home';
  })();

  const [authorRole, setAuthorRole] = useState<'Manager Peace Home' | 'Peace Home Mother' | 'Psychosocial Counselor' | string>(defaultRole);
  const [authorName, setAuthorName] = useState(currentUser.name || 'Staff');
  const [date, setDate] = useState(getTodayDateString());
  const [category, setCategory] = useState<PeaceHomeDevelopmentCategory>('Psychosocial & Emotional Wellbeing');
  const [score, setScore] = useState<PeaceHomeProgressScore>('Steady Progress');
  const [title, setTitle] = useState('');
  const [observations, setObservations] = useState('');
  const [milestonesAchieved, setMilestonesAchieved] = useState('');
  const [age18PreparationNotes, setAge18PreparationNotes] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !observations.trim()) return;

    onAdd({
      date,
      category,
      score,
      authorName: authorName.trim() || currentUser.name,
      authorRole,
      title: title.trim(),
      observations: observations.trim(),
      milestonesAchieved: milestonesAchieved.trim() || undefined,
      age18PreparationNotes: age18PreparationNotes.trim() || undefined,
      nextSteps: nextSteps.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 border border-slate-200 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-md border border-emerald-200">
                LEEDO Peace Home Development
              </span>
              <span className="text-[11px] font-mono text-slate-400">{child.id}</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mt-1 font-display">
              {language === 'bn' ? 'শিশুর সার্বিক উন্নতি ও বিকাশ রেকর্ড' : 'Log Child Progress & Development'}
            </h3>
            <p className="text-xs text-slate-500">
              {child.name} • {child.estimatedAge} {language === 'bn' ? 'বছর বয়স (১৮ বছর পর্যন্ত পিস হোমে যত্ন ও প্রশিক্ষণ)' : 'yrs (Care up to 18y)'}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 text-xs">
          {/* Author Role Selector - Manager, Mother, Counselor */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <label className="block text-xs font-bold text-slate-800">
              {language === 'bn' ? 'মূল্যায়নকারী কর্মকর্তার পদবি ও পরিচয়:' : 'Assessing Staff Role:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { role: 'Manager Peace Home', labelBn: 'ম্যানেজার পিস হোম', icon: Briefcase, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                { role: 'Peace Home Mother', labelBn: 'পিস হোম মাদার', icon: Heart, color: 'text-rose-600 bg-rose-50 border-rose-200' },
                { role: 'Psychosocial Counselor', labelBn: 'সাইকোসোশ্যাল কাউন্সেলর', icon: Smile, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = authorRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setAuthorRole(item.role)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? `${item.color} font-bold ring-2 ring-slate-900/10 shadow-2xs`
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="font-bold text-[11px] leading-tight">{language === 'bn' ? item.labelBn : item.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'bn' ? 'কর্মকর্তার নাম' : 'Author Name'}
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'bn' ? 'মূল্যায়নের তারিখ' : 'Assessment Date'}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Development Category & Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'বিকাশ ও উন্নতির ক্ষেত্র (Category)' : 'Development Domain'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PeaceHomeDevelopmentCategory)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Psychosocial & Emotional Wellbeing">
                  {language === 'bn' ? '🧠 মানসিক ও আবেগীয় বিকাশ / কাউন্সেলিং' : '🧠 Psychosocial & Emotional Wellbeing'}
                </option>
                <option value="Daily Life & Mother Care">
                  {language === 'bn' ? '👩‍👧 পিস হোম মাদার তত্ত্বাবধান ও দৈনন্দিন শিষ্টাচার' : '👩‍👧 Daily Life & Mother Care'}
                </option>
                <option value="Education & Academic Progress">
                  {language === 'bn' ? '📚 লেখাপড়া ও স্কুলের রেজাল্ট' : '📚 Education & Academic Progress'}
                </option>
                <option value="Life Skills & Age 18 Independence">
                  {language === 'bn' ? '🌱 জীবন দক্ষতা ও ১৮ বছর বয়সে স্বাবলম্বী হওয়ার প্রস্তুতি' : '🌱 Life Skills & Age 18 Independence'}
                </option>
                <option value="Vocational & Technical Training">
                  {language === 'bn' ? '🛠️ বৃত্তিমূলক ও কারিগরি দক্ষতা' : '🛠️ Vocational & Technical Training'}
                </option>
                <option value="Health & Physical Nutrition">
                  {language === 'bn' ? '🍎 স্বাস্থ্য ও শারীরিক পুষ্টি' : '🍎 Health & Physical Nutrition'}
                </option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'অগ্রগতির মাত্রা (Progress Level)' : 'Progress Rating'}
              </label>
              <select
                value={score}
                onChange={(e) => setScore(e.target.value as PeaceHomeProgressScore)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Excellent">
                  {language === 'bn' ? '🌟 চমৎকার উন্নতি (Excellent Progress)' : '🌟 Excellent'}
                </option>
                <option value="Steady Progress">
                  {language === 'bn' ? '✅ সন্তোষজনক ধারাবাহিক অগ্রগতি (Steady Progress)' : '✅ Steady Progress'}
                </option>
                <option value="Moderate">
                  {language === 'bn' ? '⏳ অগ্রগতি চলমান (Moderate Progress)' : '⏳ Moderate'}
                </option>
                <option value="Needs Guidance">
                  {language === 'bn' ? '⚠️ বিশেষ মনোযোগ ও সহায়তা প্রয়োজন (Needs Special Guidance)' : '⚠️ Needs Guidance'}
                </option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'অগ্রগতির মূল বিষয় বা শিরোনাম *' : 'Progress Milestone Summary *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: বার্ষিক পরীক্ষায় শ্রেণীতে ৫ম স্থান অর্জন ও ইতিবাচক বন্ধুসুলভ আচরণ' : 'e.g., Improved anger regulation and excelled in school midterms'}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Detailed Observations */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'পর্যবেক্ষণ ও বিস্তারিত বিবরণ *' : 'Detailed Observations *'}
            </label>
            <textarea
              rows={3}
              required
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder={language === 'bn' ? 'পিস হোমে শিশুর আচরণ, নিয়মানুবর্তিতা, লেখাপড়া বা মানসিক পরিবর্তনের বাস্তব পর্যবেক্ষণ লিপিবদ্ধ করুন...' : 'Describe specific behavior, changes, academic progress, or counseling outcomes...'}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Age 18 General Life Transition Readiness Notes */}
          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
            <label className="block font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>{language === 'bn' ? '১৮ বছর পূর্ণে স্বাবলম্বী সাধারণ জীবনের প্রস্তুতি (Age 18 Transition Relevance):' : 'Preparation for Age 18 Independent Adult Life:'}</span>
            </label>
            <p className="text-[11px] text-emerald-800 mb-2">
              {language === 'bn'
                ? 'শিশুটি ১৮ বছর পর সমাজে সাধারণ জীবনযাপন করবে। এই দক্ষতা বা উন্নতি কীভাবে তাকে স্বাবলম্বী হতে সহায়তা করছে?'
                : 'How does this skill/progress prepare the child for graduating at age 18 into self-reliant independent life?'}
            </p>
            <input
              type="text"
              value={age18PreparationNotes}
              onChange={(e) => setAge18PreparationNotes(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: নিজের কাজ নিজে করা, আর্থিক হিসাব বোঝা, বৃত্তিমূলক দক্ষতায় আগ্রহ প্রকাশ...' : 'e.g., Learning cooking and budget management for hostel/independent living'}
              className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Next Action Steps */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {language === 'bn' ? 'পরবর্তী পরিকল্পনা ও পদক্ষেপ (Next Action Steps)' : 'Next Action Steps'}
            </label>
            <input
              type="text"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: আগামী মাসে স্পেশাল কম্পিউটার ক্লাস শুরু ও সাপ্তাহিক কাউন্সেলিং সেশন' : 'e.g. Enroll in computer literacy course and continue bi-weekly counseling'}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer hover:bg-slate-50"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'উন্নতি রেকর্ড সংরক্ষণ করুন' : 'Save Progress Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. RECORD PEACE HOME DEPARTURE / 18+ TRANSITION MODAL
// ==========================================
interface RecordDepartureModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child;
  onRecord: (record: PeaceHomeDepartureRecord) => void;
}

export const RecordPeaceHomeDepartureModal: React.FC<RecordDepartureModalProps> = ({
  isOpen,
  onClose,
  child,
  onRecord,
}) => {
  const { currentUser, language } = useApp();

  const isNearingOrOver18 = child.estimatedAge >= 17;

  const [exitType, setExitType] = useState<PeaceHomeExitType>(
    isNearingOrOver18
      ? 'Transitioned to General Life (Age 18+ Graduated)'
      : 'Family Reintegration'
  );
  const [departureDate, setDepartureDate] = useState(getTodayDateString());
  const [ageAtDeparture, setAgeAtDeparture] = useState<number>(child.estimatedAge || 18);
  const [newAddressOrLocation, setNewAddressOrLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // 18+ General Life Specifics
  const [occupationOrJobTitle, setOccupationOrJobTitle] = useState('');
  const [employerOrOrganization, setEmployerOrOrganization] = useState('');
  const [monthlyIncomeBdt, setMonthlyIncomeBdt] = useState<string>('12000');
  const [livingArrangement, setLivingArrangement] = useState<'Independent Rented Room' | 'Shared Hostel/Mess' | 'Family Accommodation' | 'Workplace Dormitory' | string>('Shared Hostel/Mess');
  const [starterSupportProvided, setStarterSupportProvided] = useState(
    'জাতীয় পরিচয়পত্র/জন্ম নিবন্ধন, নিজস্ব ব্যাংক হিসাব বই, জামাকাপড় ও প্রাথমিক রূপান্তর অনুদান (৳১০,০০০)'
  );
  const [followUpPlan, setFollowUpPlan] = useState('১ মাস, ৩ মাস, ৬ মাস ও ১ বছরের ব্যবধানে ফলোআপ ভিজিট ও ফোন যোগাযোগ');
  const [authorizedBy, setAuthorizedBy] = useState('Md. Sohel Rana (Manager Peace Home)');
  const [finalRemarks, setFinalRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressOrLocation.trim()) return;

    onRecord({
      departureDate,
      exitType,
      ageAtDeparture: Number(ageAtDeparture) || child.estimatedAge,
      newAddressOrLocation: newAddressOrLocation.trim(),
      contactNumber: contactNumber.trim() || undefined,
      occupationOrJobTitle: occupationOrJobTitle.trim() || undefined,
      employerOrOrganization: employerOrOrganization.trim() || undefined,
      monthlyIncomeBdt: monthlyIncomeBdt ? Number(monthlyIncomeBdt) : undefined,
      livingArrangement,
      starterSupportProvided: starterSupportProvided.trim() || undefined,
      followUpPlan: followUpPlan.trim() || undefined,
      authorizedBy: authorizedBy.trim() || currentUser.name,
      finalRemarks: finalRemarks.trim() || 'Successfully transitioned according to LEEDO Child Protection Standard Operating Procedures.',
      recordedAt: new Date().toISOString(),
    });

    onClose();
  };

  const isAge18Transition = exitType === 'Transitioned to General Life (Age 18+ Graduated)';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 border border-slate-200 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase rounded-md border border-rose-200">
                Peace Home Exit & Transition
              </span>
              <span className="text-[11px] font-mono text-slate-400">{child.id}</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mt-1 font-display">
              {language === 'bn' ? 'পিস হোম প্রস্থান ও সাধারণ জীবনে রূপান্তর রেকর্ড' : 'Record Peace Home Departure & Transition'}
            </h3>
            <p className="text-xs text-slate-500">
              {child.name} • {language === 'bn' ? '১৮ বছর পর শিশু স্বাবলম্বী সাধারণ জীবনে প্রবেশ করবে' : 'At age 18, youth transition to independent general life'}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 text-xs">
          {/* Exit Type Options */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {language === 'bn' ? 'প্রস্থানের কারণ / রূপান্তরের ধরন (Exit Type) *' : 'Exit / Transition Reason *'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  type: 'Transitioned to General Life (Age 18+ Graduated)' as PeaceHomeExitType,
                  labelBn: '🎓 ১৮ বছর পূর্ণ — সাধারণ স্বাবলম্বী জীবনে পদার্পণ',
                  desc: '১৮ বছর পূর্ণ করে চাকরি, হোস্টেল বা স্বাবলম্বী জীবনে পদার্পণ',
                  color: 'border-emerald-300 bg-emerald-50 text-emerald-900'
                },
                {
                  type: 'Family Reintegration' as PeaceHomeExitType,
                  labelBn: '👨‍👩‍👧 পরিবারের সাথে পুনরেকত্রীকরণ',
                  desc: 'নিরাপদভাবে বাবা-মা বা নিকটাত্মীয়ের কাছে ফিরে যাওয়া',
                  color: 'border-blue-300 bg-blue-50 text-blue-900'
                },
                {
                  type: 'Transferred to Higher Academy / Specialized Facility' as PeaceHomeExitType,
                  labelBn: '🏛️ উচ্চতর প্রশিক্ষণ বা সরকারি সেন্টারে স্থানান্তর',
                  desc: 'উচ্চশিক্ষা প্রতিষ্ঠান, টেকনিক্যাল ইনস্টিটিউট বা বিশেষায়িত কেন্দ্র',
                  color: 'border-purple-300 bg-purple-50 text-purple-900'
                },
                {
                  type: 'Voluntary Departure' as PeaceHomeExitType,
                  labelBn: '🚪 স্বেচ্ছায় প্রস্থান / অন্যান্য ছাড়পত্র',
                  desc: 'পিস হোম ত্যাগের সাধারণ ছাড়পত্র বা নিজস্ব উদ্যোগে প্রস্থান',
                  color: 'border-slate-300 bg-slate-50 text-slate-900'
                },
              ].map((item) => {
                const isSelected = exitType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setExitType(item.type)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? `${item.color} ring-2 ring-slate-900/10 font-bold shadow-2xs`
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">{language === 'bn' ? item.labelBn : item.type}</div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Age at departure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'প্রস্থান / সাধারণ জীবনে রূপান্তরের তারিখ *' : 'Departure Date *'}
              </label>
              <input
                type="date"
                required
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'প্রস্থানকালে বয়স (বছর) *' : 'Age at Exit (Years) *'}
              </label>
              <input
                type="number"
                min={5}
                max={25}
                required
                value={ageAtDeparture}
                onChange={(e) => setAgeAtDeparture(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* New Location & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>{language === 'bn' ? 'ভবিষ্যৎ অবস্থান / বর্তমান ঠিকানা *' : 'Future Location / Address *'}</span>
              </label>
              <input
                type="text"
                required
                value={newAddressOrLocation}
                onChange={(e) => setNewAddressOrLocation(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: মিরপুর-১০, হোস্টেল নং-৩ / গ্রাম: চকমীরপুর' : 'e.g., Mirpur 10 Hostel, or Village Home'}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'যোগাযোগের মোবাইল নম্বর' : 'Contact Phone Number'}</span>
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* IF 18+ GENERAL LIFE TRANSITION - DETAILED DOSSIER */}
          {isAge18Transition && (
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-xs text-emerald-950 font-display">
                  {language === 'bn' ? '১৮+ সাধারণ জীবনে স্বাবলম্বী পদার্পণ বিবরণী (Independent Life Dossier)' : '18+ General Life Transition Details'}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                    {language === 'bn' ? 'পেশা / কর্মসংস্থান / জীবিকা' : 'Occupation / Job Role'}
                  </label>
                  <input
                    type="text"
                    value={occupationOrJobTitle}
                    onChange={(e) => setOccupationOrJobTitle(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ইলেকট্রিশিয়ান টেকনিশিয়ান / কম্পিউটার অপারেটর' : 'e.g. Electrician / IT Assistant'}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                    {language === 'bn' ? 'কর্মস্থল বা প্রতিষ্ঠানের নাম' : 'Employer / Workplace'}
                  </label>
                  <input
                    type="text"
                    value={employerOrOrganization}
                    onChange={(e) => setEmployerOrOrganization(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: বেক্সিমকো টেক্সটাইল / স্থানীয় ওয়ার্কশপ' : 'e.g. Workshop / Enterprise'}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                    {language === 'bn' ? 'মাসিক আনুমানিক আয় (টাকা ৳)' : 'Monthly Income (BDT ৳)'}
                  </label>
                  <input
                    type="number"
                    value={monthlyIncomeBdt}
                    onChange={(e) => setMonthlyIncomeBdt(e.target.value)}
                    placeholder="12000"
                    className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                    {language === 'bn' ? 'বাসস্থানের ধরন (Living Arrangement)' : 'Living Arrangement'}
                  </label>
                  <select
                    value={livingArrangement}
                    onChange={(e) => setLivingArrangement(e.target.value as any)}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Shared Hostel/Mess">{language === 'bn' ? 'হোস্টেল বা শেয়ার্ড মেস' : 'Shared Hostel / Mess'}</option>
                    <option value="Independent Rented Room">{language === 'bn' ? 'নিজস্ব ভাড়া বাসা' : 'Independent Rented Room'}</option>
                    <option value="Workplace Dormitory">{language === 'bn' ? 'কর্মস্থলের ডরমিটরি' : 'Workplace Dormitory'}</option>
                    <option value="Family Accommodation">{language === 'bn' ? 'পরিবারের সাথে' : 'Family Accommodation'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                  {language === 'bn' ? 'প্রারম্ভিক রূপান্তর সহায়তা প্যাকেজ (Starter Support Given)' : 'Starter Support Provided'}
                </label>
                <input
                  type="text"
                  value={starterSupportProvided}
                  onChange={(e) => setStarterSupportProvided(e.target.value)}
                  className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Follow-up Plan & Authorization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'ফলোআপ পরিকল্পনা (Follow-up Schedule)' : 'Follow-up Schedule'}
              </label>
              <input
                type="text"
                value={followUpPlan}
                onChange={(e) => setFollowUpPlan(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'bn' ? 'অনুমোদনকারী কর্মকর্তা (Authorized By) *' : 'Authorized By *'}
              </label>
              <input
                type="text"
                required
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Final Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {language === 'bn' ? 'কেস সমাপ্তি ও চূড়ান্ত মন্তব্য (Final Remarks)' : 'Final Remarks & Case Closing Notes'}
            </label>
            <textarea
              rows={2}
              value={finalRemarks}
              onChange={(e) => setFinalRemarks(e.target.value)}
              placeholder={language === 'bn' ? 'শিশুর বিদায় ও ভবিষ্যৎ শুভকামনা সংক্রান্ত মন্তব্য...' : 'Closing remarks...'}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer hover:bg-slate-50"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isAge18Transition
                  ? (language === 'bn' ? '১৮+ সাধারণ জীবনে রূপান্তর চূড়ান্ত করুন' : 'Confirm Age 18+ Transition')
                  : (language === 'bn' ? 'প্রস্থান নিশ্চিত করুন' : 'Confirm Departure')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
