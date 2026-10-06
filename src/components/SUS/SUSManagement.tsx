import React, { useState } from 'react';
import { 
  GraduationCap, 
  Utensils, 
  Users, 
  Receipt, 
  Calendar, 
  MapPin, 
  Plus, 
  Search, 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  Image as ImageIcon,
  DollarSign,
  BookOpen,
  Filter,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUSSession, RescueArea } from '../../types';

export const SUSManagement: React.FC = () => {
  const { filteredSUSSessions, susSessions, addSUSSession, currentUser } = useApp();

  // If user is restricted to an area, default the area filter to that area
  const userArea = currentUser.assignedArea && currentUser.assignedArea !== 'All' ? currentUser.assignedArea : 'all';
  const [selectedArea, setSelectedArea] = useState<string>(userArea);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSessionForModal, setSelectedSessionForModal] = useState<SUSSession | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [area, setArea] = useState<RescueArea>(() => (currentUser.assignedArea as RescueArea) || 'Airport');
  const [facilitator, setFacilitator] = useState(currentUser.name || 'Outreach Educator');
  const [coFacilitator, setCoFacilitator] = useState('');
  const [activityType, setActivityType] = useState('Basic Literacy & Numeracy');
  const [topicsCovered, setTopicsCovered] = useState('');
  const [boysCount, setBoysCount] = useState<number>(15);
  const [girlsCount, setGirlsCount] = useState<number>(12);
  const [mealProvided, setMealProvided] = useState(true);
  const [mealDescription, setMealDescription] = useState('Nutritious Khichuri with boiled egg, bananas, and clean drinking water');
  const [mealExpenseBdt, setMealExpenseBdt] = useState<number>(2450);
  const [vendorName, setVendorName] = useState('Local Market Vendor');
  const [billVoucherNumber, setBillVoucherNumber] = useState(`MEMO-${Date.now().toString().slice(-4)}`);
  const [billReceiptUrl, setBillReceiptUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600');
  const [sessionPhotoUrl, setSessionPhotoUrl] = useState('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800');
  const [vulnerableChildrenCount, setVulnerableChildrenCount] = useState<number>(0);
  const [rescueReferralNotes, setRescueReferralNotes] = useState('');

  // Sample voucher options for quick selection in demo
  const sampleVouchers = [
    { label: 'Grocery Cash Memo (Rice, Lentils, Oil)', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600' },
    { label: 'Fruit & Milk Cash Memo', url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=600' },
    { label: 'Cooked Catering Invoice', url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600' },
  ];

  const samplePhotos = [
    { label: 'Open-Air Classroom at Station', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800' },
    { label: 'Children Meal Distribution', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800' },
    { label: 'Art & Literacy Circle', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800' },
  ];

  // Aggregates based on user accessible sessions
  const totalSessions = filteredSUSSessions.length;
  const totalAttendance = filteredSUSSessions.reduce((acc, s) => acc + (s.totalChildrenPresent || 0), 0);
  const totalBoys = filteredSUSSessions.reduce((acc, s) => acc + (s.boysCount || 0), 0);
  const totalGirls = filteredSUSSessions.reduce((acc, s) => acc + (s.girlsCount || 0), 0);
  const totalMealExpense = filteredSUSSessions.reduce((acc, s) => acc + (s.mealExpenseBdt || 0), 0);
  const totalIdentifiedForRescue = filteredSUSSessions.reduce((acc, s) => acc + (s.vulnerableChildrenIdentified || 0), 0);

  const filteredSessions = filteredSUSSessions.filter(s => {
    if (selectedArea !== 'all' && s.area !== selectedArea) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = s.topicsCovered?.toLowerCase().includes(q);
      const matchFacilitator = s.facilitatorName?.toLowerCase().includes(q);
      const matchArea = s.area?.toLowerCase().includes(q);
      const matchActivity = s.activityType?.toLowerCase().includes(q);
      if (!matchTopic && !matchFacilitator && !matchArea && !matchActivity) return false;
    }
    return true;
  });

  const handleSubmitSession = (e: React.FormEvent) => {
    e.preventDefault();

    const totalChildren = Number(boysCount || 0) + Number(girlsCount || 0);

    const newSession: SUSSession = {
      id: `SUS-${Date.now().toString().slice(-4)}`,
      date,
      area,
      facilitatorName: facilitator,
      coFacilitatorName: coFacilitator || undefined,
      activityType,
      topicsCovered: topicsCovered || `${activityType} session covering foundational literacy, handwashing, and life skills for street-connected children.`,
      boysCount: Number(boysCount || 0),
      girlsCount: Number(girlsCount || 0),
      totalChildrenPresent: totalChildren,
      mealProvided,
      mealDescription: mealProvided ? mealDescription : undefined,
      mealExpenseBdt: mealProvided ? Number(mealExpenseBdt || 0) : undefined,
      vendorName: mealProvided ? vendorName : undefined,
      billVoucherNumber: mealProvided ? billVoucherNumber : undefined,
      billReceiptUrl: mealProvided ? billReceiptUrl : undefined,
      sessionPhotoUrl: sessionPhotoUrl || undefined,
      vulnerableChildrenIdentified: Number(vulnerableChildrenCount || 0),
      rescueReferralNotes: rescueReferralNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    addSUSSession(newSession);
    setShowAddModal(false);
    // Reset form defaults
    setTopicsCovered('');
    setRescueReferralNotes('');
    setVulnerableChildrenCount(0);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
                Education & Outreach
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">School Under the Sky (SUS)</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-display mt-1">
              School Under the Sky (SUS) Daily Tracker
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Outdoor non-formal education, daily nutrition, and street protection monitoring across 7 operational outposts.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E31B23] hover:bg-[#c9151d] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Daily SUS Session</span>
          </button>
        </div>

        {/* 7 Outpost Coverage Banner */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-700">7 Active Open-Air Classrooms:</span>
          {['Airport', 'Mirpur', 'Tejgaon', 'Rayerbazar', 'Kamalapur', 'Sadarghat', 'Shambazar'].map(hub => (
            <span 
              key={hub}
              className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-full font-medium text-[11px]"
            >
              {hub}
            </span>
          ))}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total SUS Sessions</span>
            <div className="p-2 bg-rose-50 text-[#E31B23] rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-display">{totalSessions}</div>
          <div className="text-xs text-slate-500 mt-0.5">Classes conducted in 2026</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Children Reached</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-display">{totalAttendance}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            <strong>{totalBoys}</strong> Boys &bull; <strong>{totalGirls}</strong> Girls
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Food Expense</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-display">
            ৳ {totalMealExpense.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Voucher verified meals</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identified for Rescue</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-display">
            {totalIdentifiedForRescue}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Referred to Shelter units</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Filter by Outpost:</span>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium"
          >
            <option value="all">All 7 Outposts ({susSessions.length})</option>
            <option value="Airport">Airport Area</option>
            <option value="Mirpur">Mirpur Area</option>
            <option value="Tejgaon">Tejgaon Area</option>
            <option value="Rayerbazar">Rayerbazar Area</option>
            <option value="Kamalapur">Kamalapur Area</option>
            <option value="Sadarghat">Sadarghat Launch Terminal</option>
            <option value="Shambazar">Shambazar Area</option>
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic, teacher, area..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-sm">
            কোনো এসইউএস আউটরিচ সেশন নথিভুক্ত নেই (No SUS Sessions Recorded)
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            খোলা আকাশের নিচে পাঠশালা (School Under the Sky)-র নতুন সেশন তথ্য ইনপুট দিতে উপরে '+ Record Daily Session' বাটনে ক্লিক করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Photo or Banner */}
              <div className="relative h-40 bg-slate-100 overflow-hidden">
                <img
                  src={session.sessionPhotoUrl || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'}
                  alt={session.area}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-1 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{session.area} Outpost</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] opacity-90">
                    <Calendar className="w-3 h-3" />
                    <span>{session.date}</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div>
                  <span className="px-2 py-0.5 bg-rose-50 text-[#E31B23] rounded-md font-bold text-[10px] uppercase">
                    {session.activityType}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                    {session.topicsCovered}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Lead: <strong>{session.facilitatorName}</strong>
                    {session.coFacilitatorName && <span> &bull; Asst: {session.coFacilitatorName}</span>}
                  </div>
                </div>

                {/* Attendance Metric */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px]">Attendance:</span>
                    <div className="font-bold text-slate-800 text-sm">
                      {session.totalChildrenPresent} Children
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <div>Boys: <strong className="text-blue-600">{session.boysCount}</strong></div>
                    <div>Girls: <strong className="text-rose-600">{session.girlsCount}</strong></div>
                  </div>
                </div>

                {/* Meal & Voucher Info */}
                {session.mealProvided && (
                  <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-emerald-600" />
                        Food & Nutrition:
                      </span>
                      <strong className="text-emerald-800">
                        ৳ {session.mealExpenseBdt?.toLocaleString()}
                      </strong>
                    </div>
                    <div className="text-[11px] text-emerald-700 line-clamp-1">
                      {session.mealDescription}
                    </div>
                    {session.billVoucherNumber && (
                      <div className="text-[10px] text-emerald-600 font-mono">
                        Memo: {session.billVoucherNumber} ({session.vendorName || 'Vendor'})
                      </div>
                    )}
                  </div>
                )}

                {/* Vulnerable children warning */}
                {(session.vulnerableChildrenIdentified || 0) > 0 && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span><strong>{session.vulnerableChildrenIdentified}</strong> child flagged for emergency rescue</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 pt-0">
              <button
                onClick={() => setSelectedSessionForModal(session)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Bill Voucher & Full Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Record Daily Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Record Daily SUS (School Under the Sky) Session</h3>
                <p className="text-xs text-slate-500">Document open-air classroom attendance, food expenses, and vouchers</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitSession} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Session Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Outpost / Area *</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value as RescueArea)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Airport">Airport Outpost</option>
                    <option value="Mirpur">Mirpur Outpost</option>
                    <option value="Tejgaon">Tejgaon Outpost</option>
                    <option value="Rayerbazar">Rayerbazar Outpost</option>
                    <option value="Kamalapur">Kamalapur Area</option>
                    <option value="Sadarghat">Sadarghat Launch Terminal</option>
                    <option value="Shambazar">Shambazar Area</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Teacher / Facilitator *</label>
                  <input
                    type="text"
                    required
                    value={facilitator}
                    onChange={(e) => setFacilitator(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Co-Facilitator / Assistant</label>
                  <input
                    type="text"
                    placeholder="e.g. Volunteer / Field Worker"
                    value={coFacilitator}
                    onChange={(e) => setCoFacilitator(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Activity Curriculum Category *</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Basic Literacy & Numeracy">Basic Literacy & Numeracy</option>
                    <option value="Hygiene, Health & Handwashing">Hygiene, Health & Handwashing</option>
                    <option value="Child Rights & Self-Protection">Child Rights & Self-Protection</option>
                    <option value="Art, Music & Creative Play">Art, Music & Creative Play</option>
                    <option value="Sports & Psychosocial Wellness">Sports & Psychosocial Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topics & Lesson Outline</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengali vowels, subtraction, hygiene song"
                    value={topicsCovered}
                    onChange={(e) => setTopicsCovered(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Attendance Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                  Student Attendance Count
                </span>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Boys Present</label>
                    <input
                      type="number"
                      min={0}
                      value={boysCount}
                      onChange={(e) => setBoysCount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Girls Present</label>
                    <input
                      type="number"
                      min={0}
                      value={girlsCount}
                      onChange={(e) => setGirlsCount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-bold text-rose-600"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Total Attendance</label>
                    <div className="px-3 py-1.5 bg-slate-200/70 border border-slate-300 rounded-xl font-bold text-slate-900">
                      {Number(boysCount || 0) + Number(girlsCount || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meal & Nutrition Expense Section */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-emerald-600" />
                    Meal & Nutrition Expense Tracking
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-emerald-800 font-semibold">
                    <input
                      type="checkbox"
                      checked={mealProvided}
                      onChange={(e) => setMealProvided(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span>Meal Provided Today</span>
                  </label>
                </div>

                {mealProvided && (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="block font-medium text-emerald-800 mb-1">Food Items Served</label>
                      <input
                        type="text"
                        value={mealDescription}
                        onChange={(e) => setMealDescription(e.target.value)}
                        placeholder="e.g. Hot Khichuri, eggs, bananas, biscuits"
                        className="w-full px-3 py-1.5 border border-emerald-300 rounded-xl bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-medium text-emerald-800 mb-1">Total Meal Cost (৳ BDT) *</label>
                        <input
                          type="number"
                          min={0}
                          value={mealExpenseBdt}
                          onChange={(e) => setMealExpenseBdt(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 border border-emerald-300 rounded-xl font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-emerald-800 mb-1">Shop / Vendor Name</label>
                        <input
                          type="text"
                          value={vendorName}
                          onChange={(e) => setVendorName(e.target.value)}
                          placeholder="e.g. New Market Store"
                          className="w-full px-3 py-1.5 border border-emerald-300 rounded-xl bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-emerald-800 mb-1">Cash Memo / Voucher #</label>
                        <input
                          type="text"
                          value={billVoucherNumber}
                          onChange={(e) => setBillVoucherNumber(e.target.value)}
                          placeholder="e.g. MEMO-4912"
                          className="w-full px-3 py-1.5 border border-emerald-300 rounded-xl bg-white"
                        />
                      </div>
                    </div>

                    {/* Voucher Image / Document Selection */}
                    <div>
                      <label className="block font-medium text-emerald-800 mb-1">
                        Bill / Voucher Copy Attachment
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {sampleVouchers.map((v, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setBillReceiptUrl(v.url)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                              billReceiptUrl === v.url
                                ? 'bg-emerald-700 text-white border-emerald-700'
                                : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Class Session Photo */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Activity Photo</label>
                <div className="flex flex-wrap gap-2">
                  {samplePhotos.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSessionPhotoUrl(p.url)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        sessionPhotoUrl === p.url
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emergency Child Protection Alert */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Street Child Protection Alert
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-800">Vulnerable Children Identified:</span>
                    <input
                      type="number"
                      min={0}
                      value={vulnerableChildrenCount}
                      onChange={(e) => setVulnerableChildrenCount(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 bg-white border border-amber-300 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>

                {vulnerableChildrenCount > 0 && (
                  <div>
                    <label className="block font-medium text-amber-800 mb-1">Rescue & Referral Action Notes</label>
                    <textarea
                      rows={2}
                      value={rescueReferralNotes}
                      onChange={(e) => setRescueReferralNotes(e.target.value)}
                      placeholder="Describe high-risk children identified for transfer to Kamalapur or Kadamtali Transitional Shelter..."
                      className="w-full px-3 py-1.5 border border-amber-300 rounded-xl bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Daily SUS Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Voucher & Session Details Modal */}
      {selectedSessionForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-bold text-[#E31B23] uppercase">
                  Session #{selectedSessionForModal.id} &bull; {selectedSessionForModal.area} Outpost
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">
                  SUS Session & Meal Voucher Documentation
                </h3>
              </div>
              <button
                onClick={() => setSelectedSessionForModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Session Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Date</span>
                  <div className="font-bold text-slate-800">{selectedSessionForModal.date}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Attendance</span>
                  <div className="font-bold text-slate-800">
                    {selectedSessionForModal.totalChildrenPresent} ({selectedSessionForModal.boysCount}B / {selectedSessionForModal.girlsCount}G)
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Lead Teacher</span>
                  <div className="font-bold text-slate-800">{selectedSessionForModal.facilitatorName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Meal Cost</span>
                  <div className="font-bold text-emerald-700">৳ {selectedSessionForModal.mealExpenseBdt?.toLocaleString() || '0'}</div>
                </div>
              </div>

              {/* Topic */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl">
                <span className="font-bold text-slate-700 text-xs">Curriculum & Topics Covered:</span>
                <p className="text-slate-600 mt-1 leading-relaxed">{selectedSessionForModal.topicsCovered}</p>
              </div>

              {/* Bill Voucher Copy Preview */}
              {selectedSessionForModal.billReceiptUrl && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-emerald-700" />
                      Auditable Meal Cash Memo / Bill Voucher
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      Memo: {selectedSessionForModal.billVoucherNumber || 'VOUCHER-01'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Vendor: <strong>{selectedSessionForModal.vendorName || 'Station Market Groceries'}</strong> &bull; Total Paid: <strong>৳ {selectedSessionForModal.mealExpenseBdt?.toLocaleString()}</strong>
                  </p>
                  <div className="mt-2 rounded-xl overflow-hidden border border-emerald-200 max-h-64 bg-slate-900 flex items-center justify-center">
                    <img
                      src={selectedSessionForModal.billReceiptUrl}
                      alt="Bill Voucher"
                      className="max-h-64 w-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Class Session Photo */}
              {selectedSessionForModal.sessionPhotoUrl && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-slate-600" />
                    Open-Air Classroom Photo Evidence
                  </span>
                  <div className="mt-1 rounded-xl overflow-hidden border border-slate-200 max-h-64 flex items-center justify-center bg-slate-900">
                    <img
                      src={selectedSessionForModal.sessionPhotoUrl}
                      alt="Session Photo"
                      className="max-h-64 w-auto object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedSessionForModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
