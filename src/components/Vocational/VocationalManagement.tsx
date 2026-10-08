import React, { useState } from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Award, 
  Sparkles, 
  X, 
  Phone, 
  UserCheck, 
  AlertCircle,
  FileCheck,
  Building2,
  TrendingUp,
  Download,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VTCStudent, VTCTrade, VTCLivingStatus, VTCProgressLevel, VTCAttendanceStatus } from '../../types';

const TRADE_LIST: VTCTrade[] = [
  'Sewing & Tailoring',
  'Beautification & Parlour',
  'ICT & Computer Literacy',
  'Handicraft & Craft Making',
  'Carpentry & Woodwork'
];

export const VocationalManagement: React.FC = () => {
  const { 
    vtcStudents, 
    addVTCStudent, 
    updateVTCStudent, 
    recordVTCAttendance, 
    currentUser,
    canAccessVTC,
    language,
    setActiveView
  } = useApp();

  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<VTCStudent | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  if (!canAccessVTC) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-8 shadow-2xs">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2 font-display">
          {language === 'bn' ? 'কারিগরি প্রশিক্ষণ (VTC) তথ্য সংরক্ষিত' : 'Vocational Trade Center (VTC) Access Restricted'}
        </h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          {language === 'bn' 
            ? 'আপনার বর্তমান অ্যাসাইনমেন্টে কারিগরি প্রশিক্ষণ (VTC) দেখার অনুমতি অন্তর্ভুক্ত নেই। এই তথ্য দেখার অনুমতি শুধুমাত্র ভিটিসি ইন্সট্রাক্টর, কদমতলী শেল্টার ও হেড অফিসের অনুমোদিত কর্মীদের রয়েছে।'
            : 'Your current operational assignment does not include VTC access. Vocational data is accessible only by authorized VTC instructors, Kadamtali Shelter staff, and Head Office management.'}
        </p>
        <button
          onClick={() => setActiveView('sus')}
          className="px-5 py-2.5 bg-[#E31B23] text-white font-bold text-xs rounded-xl hover:bg-[#c9151d] transition-colors cursor-pointer"
        >
          {language === 'bn' ? 'এসইউএস (SUS) সেন্টারে যান' : 'Go to SUS Centers'}
        </button>
      </div>
    );
  }

  // Daily Attendance Quick-Record Form State
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attTrade, setAttTrade] = useState<VTCTrade>('Sewing & Tailoring');
  const [attendanceSheet, setAttendanceSheet] = useState<{ [studentId: string]: VTCAttendanceStatus }>({});

  // Add Student Form State
  const [name, setName] = useState('');
  const [banglaName, setBanglaName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [age, setAge] = useState<number>(16);
  const [phone, setPhone] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('Shyampur / Postogola Slum, Kadamtali, Dhaka');
  const [livingCondition, setLivingCondition] = useState<VTCLivingStatus>('Lives with family in community');
  const [trade, setTrade] = useState<VTCTrade>('Sewing & Tailoring');
  const [centerLocation, setCenterLocation] = useState<'Kadamtali Center' | 'Inclusive School'>('Kadamtali Center');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchNumber, setBatchNumber] = useState('Batch-12');
  const [assignedInstructor, setAssignedInstructor] = useState('Sharmin Akter');
  const [notes, setNotes] = useState('');

  // Filter students with role/area based access control
  const filteredStudents = vtcStudents.filter(s => {
    // Area / Location access restriction for staff
    if (currentUser.role === 'Shelter Staff' || currentUser.role === 'Rescue Worker / SUS Staff' || currentUser.role === 'Rescue Worker / Outpost Staff') {
      const assigned = (currentUser.assignedShelter || currentUser.assignedArea || '').toLowerCase();
      if (assigned.includes('kadamtali') && s.centerLocation !== 'Kadamtali Center') {
        return false;
      }
    }

    if (selectedTrade !== 'all' && s.trade !== selectedTrade) return false;
    if (selectedLocation !== 'all' && s.centerLocation !== selectedLocation) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q) || (s.banglaName && s.banglaName.toLowerCase().includes(q));
      const matchId = s.id.toLowerCase().includes(q) || s.admissionNumber.toLowerCase().includes(q);
      const matchAddr = s.residentialAddress.toLowerCase().includes(q);
      const matchInst = s.assignedInstructor.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchAddr && !matchInst) return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalEnrolled = vtcStudents.length;
  const activeStudents = vtcStudents.filter(s => s.status === 'Active Student').length;
  const certifiedGraduates = vtcStudents.filter(s => s.status === 'Completed / Certified' || s.status === 'Placed in Employment').length;
  const avgAttendance = Math.round(
    vtcStudents.reduce((acc, s) => acc + (s.attendanceRatePercent || 0), 0) / (vtcStudents.length || 1)
  );

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addVTCStudent({
      name,
      banglaName: banglaName || undefined,
      gender,
      age: Number(age),
      phone: phone || undefined,
      guardianName: guardianName || undefined,
      guardianPhone: guardianPhone || undefined,
      residentialAddress,
      livingCondition,
      trade,
      centerLocation,
      admissionDate,
      batchNumber,
      assignedInstructor,
      progressLevel: 'Beginner',
      attendanceRatePercent: 100,
      monthlyAttendanceCount: 1,
      totalClassesHeld: 1,
      toolSupportProvided: true,
      stipendReceivedBdt: 1500,
      status: 'Active Student',
      notes: notes || undefined,
    });

    setSuccessMessage(`New student ${name} enrolled successfully in ${trade}!`);
    setShowAddModal(false);
    // reset form
    setName('');
    setBanglaName('');
    setPhone('');
    setGuardianName('');
    setGuardianPhone('');
    setNotes('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleOpenAttendanceModal = () => {
    const studentsInTrade = vtcStudents.filter(s => s.trade === attTrade && s.status === 'Active Student');
    const initialSheet: { [id: string]: VTCAttendanceStatus } = {};
    studentsInTrade.forEach(s => {
      initialSheet[s.id] = 'Present';
    });
    setAttendanceSheet(initialSheet);
    setShowAttendanceModal(true);
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const studentsInTrade = vtcStudents.filter(s => s.trade === attTrade && s.status === 'Active Student');
    
    studentsInTrade.forEach(s => {
      const status = attendanceSheet[s.id] || 'Present';
      recordVTCAttendance(s.id, attDate, status);
    });

    setSuccessMessage(`Attendance recorded for ${studentsInTrade.length} students in ${attTrade} on ${attDate}.`);
    setShowAttendanceModal(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const exportVtcRosterCsv = () => {
    const headers = ['Student ID', 'Admission No', 'Name', 'Gender', 'Age', 'Living Condition (Non-Shelter)', 'Address', 'Trade', 'Center', 'Admission Date', 'Batch', 'Instructor', 'Attendance %', 'Status'];
    const rows = filteredStudents.map(s => [
      s.id,
      s.admissionNumber,
      s.name,
      s.gender,
      s.age,
      `"${s.livingCondition}"`,
      `"${s.residentialAddress}"`,
      s.trade,
      s.centerLocation,
      s.admissionDate,
      s.batchNumber,
      s.assignedInstructor,
      `${s.attendanceRatePercent}%`,
      s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LEEDO_Vocational_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
                Livelihood & Empowerment
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">Community Non-Shelter Youth</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-display mt-1">
              Vocational Trade Center (VTC)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Empowering community youth, slum residents, and working adolescents with market-oriented technical trades and daily attendance tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportVtcRosterCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleOpenAttendanceModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Take Daily Attendance</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          </div>
        </div>

        {/* Essential Domain Clarification Banner */}
        <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 text-xs">
          <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-blue-900 leading-relaxed">
            <strong className="text-blue-950">Non-Shelter Community Architecture:</strong> Vocational Trade Center students live outside with their families or independently in slums and working communities (Kadamtali, Shyampur, Postogola, Jurain). They attend daily classes in <strong>Sewing & Tailoring, Beautification, ICT, Handicrafts, and Carpentry</strong>, receive tool kits and study stipends, while remaining non-residential.
          </div>
        </div>

        {successMessage && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <div className="p-2 bg-rose-50 text-[#E31B23] rounded-lg"><Users className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-display">{totalEnrolled}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{activeStudents} actively attending classes</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Attendance</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-display">{avgAttendance}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">High retention in technical batches</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certified / Placed</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Award className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black text-purple-800 mt-2 font-display">{certifiedGraduates}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Employed or certified artisans</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Trades</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Briefcase className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-display">5 Trades</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sewing, Beauty, ICT, Craft, Wood</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Trade:</span>
          <button
            onClick={() => setSelectedTrade('all')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              selectedTrade === 'all'
                ? 'bg-[#E31B23] text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Trades ({vtcStudents.length})
          </button>
          {TRADE_LIST.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTrade(t)}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                selectedTrade === t
                  ? 'bg-[#E31B23] text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t} ({vtcStudents.filter(s => s.trade === t).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, name, address, instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 text-sm">
            কোনো ভিটিসি প্রশিক্ষণার্থী নথিভুক্ত নেই (No VTC Students Enrolled)
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            কদমতলী কারিগরি কেন্দ্রে নতুন শিক্ষার্থী ভর্তি করতে উপরে '+ Enroll New Student' বাটনে ক্লিক করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
          return (
            <div
              key={student.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {student.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {student.admissionNumber}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-1.5 flex items-center gap-1.5">
                      {student.name}
                      {student.banglaName && (
                        <span className="text-xs font-normal text-slate-500">({student.banglaName})</span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {student.gender} &bull; {student.age} Years Old &bull; {student.batchNumber}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0 ${
                    student.status === 'Placed in Employment'
                      ? 'bg-purple-100 text-purple-800'
                      : student.status === 'Completed / Certified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {student.status}
                  </span>
                </div>

                {/* Trade Badge */}
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold">
                  <Briefcase className="w-3.5 h-3.5 text-rose-600" />
                  <span>{student.trade}</span>
                </div>

                {/* Community Living / Non-shelter condition */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">Community Residence: </span>
                      <span>{student.residentialAddress}</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <strong>Living Status:</strong> {student.livingCondition}
                  </div>
                  {student.guardianName && (
                    <div className="text-[11px] text-slate-500">
                      <strong>Guardian:</strong> {student.guardianName} ({student.guardianPhone || 'No direct phone'})
                    </div>
                  )}
                </div>

                {/* Instructor & Progress */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Instructor</span>
                    <span className="font-medium text-slate-800">{student.assignedInstructor}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Skill Level</span>
                    <span className="font-medium text-slate-800">{student.progressLevel}</span>
                  </div>
                </div>

                {/* Attendance Rate */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-500">Attendance Rate</span>
                    <span className="font-bold text-emerald-700">{student.attendanceRatePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${student.attendanceRatePercent}%` }}
                    />
                  </div>
                </div>

                {/* Recent attendance days dots */}
                {student.recentAttendance && student.recentAttendance.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">
                      Recent Attendance Logs
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {student.recentAttendance.map((att, idx) => (
                        <div
                          key={idx}
                          title={`${att.date}: ${att.status}${att.note ? ` - ${att.note}` : ''}`}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            att.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.status === 'Late'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {att.date.slice(5)}: {att.status}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedStudentForDetail(student)}
                  className="text-xs font-bold text-[#E31B23] hover:text-[#c9151d] transition-colors cursor-pointer"
                >
                  View Details & History &rarr;
                </button>

                {student.phone && (
                  <a
                    href={`tel:${student.phone}`}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    title={`Call Student: ${student.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">{student.phone}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Enroll New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
                  Non-Shelter Community Admission
                </span>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Enroll New Vocational Student
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Full Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shamima Akter"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Name in Bengali</label>
                  <input
                    type="text"
                    placeholder="e.g. শামীমা আক্তার"
                    value={banglaName}
                    onChange={e => setBanglaName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    min={12}
                    max={25}
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="018XX-XXXXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Trade and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vocational Trade *</label>
                  <select
                    value={trade}
                    onChange={e => {
                      const t = e.target.value as VTCTrade;
                      setTrade(t);
                      if (t === 'Sewing & Tailoring') setAssignedInstructor('Sharmin Akter');
                      else if (t === 'Beautification & Parlour') setAssignedInstructor('Sharmin Akter Puspo');
                      else if (t === 'ICT & Computer Literacy') setAssignedInstructor('Wahid Hasan Niloy');
                      else if (t === 'Carpentry & Woodwork') setAssignedInstructor('Saidur Rahman Sajan');
                      else if (t === 'Handicraft & Craft Making') setAssignedInstructor('Ruksana Akter');
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-medium"
                  >
                    {TRADE_LIST.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Instructor *</label>
                  <input
                    type="text"
                    required
                    value={assignedInstructor}
                    onChange={e => setAssignedInstructor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Living Condition & Non-shelter address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Living Condition (Non-Shelter) *</label>
                  <select
                    value={livingCondition}
                    onChange={e => setLivingCondition(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    <option value="Lives with family in community">Lives with family in community</option>
                    <option value="Living independently / Working youth">Living independently / Working youth</option>
                    <option value="Slum resident (Non-shelter)">Slum resident (Non-shelter)</option>
                    <option value="Street-connected youth">Street-connected youth</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Center Facility *</label>
                  <select
                    value={centerLocation}
                    onChange={e => setCenterLocation(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  >
                    <option value="Kadamtali Center">Kadamtali Center</option>
                    <option value="Inclusive School">Inclusive School</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Community Residential Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aliganj Slum, Shyampur Road, Kadamtali, Dhaka"
                  value={residentialAddress}
                  onChange={e => setResidentialAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Guardian Name & Relation</label>
                  <input
                    type="text"
                    placeholder="e.g. Kulsum Begum (Mother, Garment Worker)"
                    value={guardianName}
                    onChange={e => setGuardianName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Guardian Contact Phone</label>
                  <input
                    type="text"
                    placeholder="017XX-XXXXXX"
                    value={guardianPhone}
                    onChange={e => setGuardianPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Background Notes / Aspirations</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Family economic hardship; aspires to start tailoring shop upon certification."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Student Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
                  Daily Roster Record
                </span>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  VTC Daily Attendance Sheet
                </h2>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session Date *</label>
                  <input
                    type="date"
                    required
                    value={attDate}
                    onChange={e => setAttDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Trade *</label>
                  <select
                    value={attTrade}
                    onChange={e => {
                      const t = e.target.value as VTCTrade;
                      setAttTrade(t);
                      const studentsInTrade = vtcStudents.filter(s => s.trade === t && s.status === 'Active Student');
                      const newSheet: { [id: string]: VTCAttendanceStatus } = {};
                      studentsInTrade.forEach(s => {
                        newSheet[s.id] = 'Present';
                      });
                      setAttendanceSheet(newSheet);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-medium"
                  >
                    {TRADE_LIST.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-2">Student Roll Call ({attTrade})</label>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50">
                  {vtcStudents.filter(s => s.trade === attTrade && s.status === 'Active Student').map(student => {
                    const currentStatus = attendanceSheet[student.id] || 'Present';
                    return (
                      <div
                        key={student.id}
                        className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{student.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{student.id} &bull; {student.residentialAddress}</div>
                        </div>

                        <div className="flex items-center gap-1">
                          {(['Present', 'Late', 'Absent'] as VTCAttendanceStatus[]).map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setAttendanceSheet(prev => ({ ...prev, [student.id]: st }))}
                              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                                currentStatus === st
                                  ? st === 'Present'
                                    ? 'bg-emerald-600 text-white'
                                    : st === 'Late'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-rose-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {vtcStudents.filter(s => s.trade === attTrade && s.status === 'Active Student').length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      No active students enrolled in this trade yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Attendance Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
                  Student Dossier & Attendance
                </span>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  {selectedStudentForDetail.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedStudentForDetail.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Admission Number:</span>
                  <span className="font-mono text-slate-700">{selectedStudentForDetail.admissionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trade:</span>
                  <span className="font-bold text-rose-700">{selectedStudentForDetail.trade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Center:</span>
                  <span className="font-medium text-slate-800">{selectedStudentForDetail.centerLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Instructor:</span>
                  <span className="font-medium text-slate-800">{selectedStudentForDetail.assignedInstructor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Community Residence:</span>
                  <span className="font-medium text-slate-800">{selectedStudentForDetail.residentialAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Non-Shelter Status:</span>
                  <span className="font-medium text-emerald-800">{selectedStudentForDetail.livingCondition}</span>
                </div>
              </div>

              {selectedStudentForDetail.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900">
                  <strong className="block mb-0.5">Instructor Notes:</strong>
                  <span>{selectedStudentForDetail.notes}</span>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-800 mb-1.5">Recorded Attendance History</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedStudentForDetail.recentAttendance?.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-600 font-medium">{att.date}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        att.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedStudentForDetail(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
