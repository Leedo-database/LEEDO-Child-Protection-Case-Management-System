import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  User, 
  MapPin, 
  FileText, 
  Building2, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../utils/calculations';
import { ShelterName } from '../../types';

interface RegisterChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (newChildId: string) => void;
}

export const RegisterChildModal: React.FC<RegisterChildModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const { registerNewChild, shelters, currentUser } = useApp();

  const today = getTodayDateString();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  // Step 1: Basic Information
  const [childName, setChildName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dobKnown, setDobKnown] = useState(false);
  const [dob, setDob] = useState('');
  const [estimatedAge, setEstimatedAge] = useState<number>(10);
  const [nationality, setNationality] = useState('Bangladeshi');
  const [addressIfKnown, setAddressIfKnown] = useState('');
  const [identificationInfo, setIdentificationInfo] = useState('');
  const [disabilityOrSpecialNeeds, setDisabilityOrSpecialNeeds] = useState('None');
  const [educationInformation, setEducationInformation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&q=80&w=400');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Step 2: Rescue Details & GD
  const [rescueDate, setRescueDate] = useState(today);
  const [rescueTime, setRescueTime] = useState('14:30');
  const [rescueLocation, setRescueLocation] = useState('');
  const [area, setArea] = useState('Kamalapur');
  const [otherAreaManual, setOtherAreaManual] = useState('');
  const [rescueTeam, setRescueTeam] = useState('Outreach Alpha');
  const [rescuedBy, setRescuedBy] = useState(currentUser.name);
  const [reasonForRescue, setReasonForRescue] = useState('Street-connected child at acute risk of exploitation and homelessness');
  const [conditionAtRescue, setConditionAtRescue] = useState('Exhausted, hungry, distressed');
  const [immediateProtectionNeeds, setImmediateProtectionNeeds] = useState('Urgent safe shelter, warm food, hygiene kit, psychosocial support');
  const [policeInvolvement, setPoliceInvolvement] = useState(true);
  const [gdNumber, setGdNumber] = useState('');
  const [gdDate, setGdDate] = useState(today);
  const [policeStation, setPoliceStation] = useState('Kamalapur GRP Railway Thana');

  // Step 3: Initial Assessment
  const [protectionConcerns, setProtectionConcerns] = useState('High risk of physical harm, trafficking, and street gangs');
  const [immediateSafetyConcerns, setImmediateSafetyConcerns] = useState('Unaccompanied minor sleeping in public transport hub');
  const [healthConcerns, setHealthConcerns] = useState('Signs of mild malnutrition and skin irritation');
  const [abuseOrExploitationConcerns, setAbuseOrExploitationConcerns] = useState('Reported verbal harassment by street elder');
  const [traffickingConcerns, setTraffickingConcerns] = useState('High vulnerability in transit corridor');
  const [foodClothingHygiene, setFoodClothingHygiene] = useState(true);
  const [emergencyMedicalSupport, setEmergencyMedicalSupport] = useState(true);
  const [psychologicalFirstAid, setPsychologicalFirstAid] = useState(true);
  const [assessmentNotes, setAssessmentNotes] = useState('Child is calm and responsive to compassionate communication. Immediate shelter placement recommended.');

  // Step 4: Shelter Admission
  const [shelterName, setShelterName] = useState<ShelterName>('Kamalapur Shelter');
  const [admissionDate, setAdmissionDate] = useState(today);
  const [admissionTime, setAdmissionTime] = useState('16:00');
  const [assignedCaseWorker, setAssignedCaseWorker] = useState(currentUser.name);
  const [roomOrBed, setRoomOrBed] = useState('Dormitory Bed Assigned');

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setPhotoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      if (!childName.trim()) {
        alert('Please enter the child name or known name.');
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (area === 'Other' && !otherAreaManual.trim()) {
        alert('Please enter the manual rescue area name.');
        return;
      }
      if (!rescueLocation.trim()) {
        alert('Please enter the rescue location.');
        return;
      }
      setActiveStep(3);
    } else if (activeStep === 3) {
      setActiveStep(4);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalArea = area === 'Other' && otherAreaManual.trim() ? otherAreaManual.trim() : area;

    const newChildData = {
      name: childName,
      nickname,
      gender,
      dateOfBirth: dobKnown ? dob : undefined,
      estimatedAge,
      nationality,
      addressIfKnown,
      identificationInfo,
      disabilityOrSpecialNeeds,
      educationInformation,
      photoUrl,
      rescuePhotoUrl: photoUrl,

      rescueDate,
      rescueTime,
      rescueLocation,
      area: finalArea,
      rescueTeam,
      rescuedBy,
      reasonForRescue,
      conditionAtRescue,
      immediateProtectionNeeds,
      policeInvolvement,
      gdNumber: gdNumber || `GD-${Math.floor(1000 + Math.random() * 9000)}/2026`,
      gdDate,
      policeStation,
      psychologicalFirstAid,

      initialAssessment: {
        assessmentDate: today,
        assessedBy: currentUser.name,
        protectionConcerns,
        immediateSafetyConcerns,
        healthConcerns,
        abuseOrExploitationConcerns,
        traffickingConcerns,
        emergencyNeeds: immediateProtectionNeeds,
        foodClothingHygiene,
        emergencyMedicalSupport,
        psychologicalFirstAid,
        assessmentNotes,
      },

      shelterName,
      admissionDate,
      admissionTime,
      assignedCaseWorker,
      roomOrBed,
      caseStatus: 'New Rescue' as const,
    };

    const newChildId = registerNewChild(newChildData);
    onClose();
    onRegistered(newChildId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E31B23] rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display">
                Register New Child / Rescue Registration
              </h2>
              <p className="text-xs text-slate-300">
                Auto-generates permanent unique Child ID &bull; Full case journey tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2 py-1 px-2.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeStep === 1 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">1</span>
            <span>Basic Info</span>
          </button>
          <span className="text-slate-300">&rarr;</span>
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-2 py-1 px-2.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeStep === 2 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">2</span>
            <span>Rescue & Police GD</span>
          </button>
          <span className="text-slate-300">&rarr;</span>
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-2 py-1 px-2.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeStep === 3 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">3</span>
            <span>Initial Assessment</span>
          </button>
          <span className="text-slate-300">&rarr;</span>
          <button
            type="button"
            onClick={() => setActiveStep(4)}
            className={`flex items-center gap-2 py-1 px-2.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              activeStep === 4 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">4</span>
            <span>Shelter Admission</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* STEP 1: Basic Information */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Unique Child ID Generation:</strong> A unique ID (e.g. <code>LEEDO-2026-0008</code>) will automatically be allocated upon saving. This ID will accompany the child through rescue, shelter, health, tracing, and reintegration.
                </div>
              </div>

              {/* Photo & Basic Details */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-100 relative flex items-center justify-center group">
                    <img
                      src={photoPreview || photoUrl}
                      alt="Child"
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs">
                      <Camera className="w-6 h-6 mb-1" />
                      <span>Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <label className="cursor-pointer text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Child Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Child Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="e.g. Arif Hossain"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nickname / Known Name
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="e.g. Babu / Choto"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estimated Age (Years) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={18}
                      required
                      value={estimatedAge}
                      onChange={(e) => setEstimatedAge(parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Exact DOB is not forced when unknown.
                    </div>
                  </div>
                </div>
              </div>

              {/* DOB Toggle */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="dobToggle"
                    checked={dobKnown}
                    onChange={(e) => setDobKnown(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="dobToggle" className="text-xs font-medium text-slate-700">
                    Exact Date of Birth is known
                  </label>
                </div>
                {dobKnown && (
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700"
                  />
                )}
              </div>

              {/* Distinguishing identification & Disability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Identification Details (Marks, Dialect, Clothing)
                  </label>
                  <input
                    type="text"
                    value={identificationInfo}
                    onChange={(e) => setIdentificationInfo(e.target.value)}
                    placeholder="e.g. Scar on left knee, wearing green shirt"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disability or Special Needs
                  </label>
                  <input
                    type="text"
                    value={disabilityOrSpecialNeeds}
                    onChange={(e) => setDisabilityOrSpecialNeeds(e.target.value)}
                    placeholder="e.g. None or Speech difficulty"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Previous Address & Education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Address or Origin (If Known)
                  </label>
                  <input
                    type="text"
                    value={addressIfKnown}
                    onChange={(e) => setAddressIfKnown(e.target.value)}
                    placeholder="e.g. Believed to be from Barishal or Jamalpur"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Education History
                  </label>
                  <input
                    type="text"
                    value={educationInformation}
                    onChange={(e) => setEducationInformation(e.target.value)}
                    placeholder="e.g. Studied up to Class 2 or Never attended"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Rescue Information & Police GD */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rescue Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={rescueDate}
                    onChange={(e) => setRescueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rescue Time
                  </label>
                  <input
                    type="time"
                    value={rescueTime}
                    onChange={(e) => setRescueTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Area / Hub <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="Airport">Airport (বিমানবন্দর)</option>
                    <option value="Mirpur">Mirpur (মিরপুর)</option>
                    <option value="Tejgaon">Tejgaon (তেজগাঁও)</option>
                    <option value="Rayer Bazar">Rayer Bazar (রায়েরবাজার)</option>
                    <option value="Kamalapur">Kamalapur (কমলাপুর)</option>
                    <option value="Sadarghat">Sadarghat (সদরঘাট)</option>
                    <option value="Shambazar">Shambazar (শ্যামবাজার)</option>
                    <option value="Other">Other (অন্যান্য এলাকা)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Manual Input for Other Area */}
              {area === 'Other' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in">
                  <label className="block text-xs font-bold text-amber-900">
                    রেসকিউ এলাকার নাম ম্যানুয়ালি লিখুন (Specify Other Rescue Area) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={otherAreaManual}
                    onChange={(e) => setOtherAreaManual(e.target.value)}
                    placeholder="যেমন: গাবতলী বাস টার্মিনাল, কাওরান বাজার, সায়েদাবাদ, ফার্মগেট..."
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                  <p className="text-[11px] text-amber-700">
                    ড্রপডাউনের তালিকার বাইরে কোনো নতুন এলাকা থেকে উদ্ধার করা হলে এলাকার সুনির্দিষ্ট নাম এখানে প্রদান করুন।
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Rescue Location Spot <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rescueLocation}
                  onChange={(e) => setRescueLocation(e.target.value)}
                  placeholder="e.g. Platform No. 4 near north overhead bridge"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rescue Team
                  </label>
                  <input
                    type="text"
                    value={rescueTeam}
                    onChange={(e) => setRescueTeam(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rescued By (Staff Name)
                  </label>
                  <input
                    type="text"
                    value={rescuedBy}
                    onChange={(e) => setRescuedBy(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Rescue & Circumstances
                </label>
                <textarea
                  rows={2}
                  value={reasonForRescue}
                  onChange={(e) => setReasonForRescue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Condition of Child at Rescue
                </label>
                <input
                  type="text"
                  value={conditionAtRescue}
                  onChange={(e) => setConditionAtRescue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Police General Diary (GD) Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="policeCheck"
                      checked={policeInvolvement}
                      onChange={(e) => setPoliceInvolvement(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor="policeCheck" className="text-xs font-bold text-slate-900">
                      Police Informed & General Diary (GD) Recorded
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-500">Legal protection protocol</span>
                </div>

                {policeInvolvement && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        GD Number
                      </label>
                      <input
                        type="text"
                        value={gdNumber}
                        onChange={(e) => setGdNumber(e.target.value)}
                        placeholder="e.g. GD-4421/2026"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        GD Date
                      </label>
                      <input
                        type="date"
                        value={gdDate}
                        onChange={(e) => setGdDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Police Station (Thana)
                      </label>
                      <input
                        type="text"
                        value={policeStation}
                        onChange={(e) => setPoliceStation(e.target.value)}
                        placeholder="e.g. Motijheel PS / Kotwali PS"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Initial Assessment */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Protection Concerns
                  </label>
                  <textarea
                    rows={2}
                    value={protectionConcerns}
                    onChange={(e) => setProtectionConcerns(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Immediate Safety Concerns
                  </label>
                  <textarea
                    rows={2}
                    value={immediateSafetyConcerns}
                    onChange={(e) => setImmediateSafetyConcerns(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Health Concerns
                  </label>
                  <input
                    type="text"
                    value={healthConcerns}
                    onChange={(e) => setHealthConcerns(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Abuse or Exploitation Concerns
                  </label>
                  <input
                    type="text"
                    value={abuseOrExploitationConcerns}
                    onChange={(e) => setAbuseOrExploitationConcerns(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trafficking Risk Concerns
                </label>
                <input
                  type="text"
                  value={traffickingConcerns}
                  onChange={(e) => setTraffickingConcerns(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Emergency Provisions Provided */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="block text-xs font-bold text-slate-800">
                  Immediate Emergency Provisions Administered:
                </span>
                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={foodClothingHygiene}
                      onChange={(e) => setFoodClothingHygiene(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>Food, Warm Clothing & Hygiene Kit</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emergencyMedicalSupport}
                      onChange={(e) => setEmergencyMedicalSupport(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>Emergency Medical First-Aid</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={psychologicalFirstAid}
                      onChange={(e) => setPsychologicalFirstAid(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-purple-950">
                      Psychological First Aid (মনস্তাত্ত্বিক প্রাথমিক চিকিৎসা &bull; নার্গিসকে কাউন্সেলিং নোটিফিকেশন যাবে)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assessor Summary Notes
                </label>
                <textarea
                  rows={2}
                  value={assessmentNotes}
                  onChange={(e) => setAssessmentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Shelter Admission */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                <strong className="block font-bold mb-1">Shelter Assignment & 6-Week Counter:</strong>
                Assigning the child to a shelter initiates the 42-day case management timeline. The system will track stay length and issue timely alerts at 35 and 42 days.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select LEEDO Shelter <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={shelterName}
                    onChange={(e) => setShelterName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500"
                  >
                    {shelters.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} (Capacity: {s.capacity} beds)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Case Worker <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={assignedCaseWorker}
                    onChange={(e) => setAssignedCaseWorker(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission Time
                  </label>
                  <input
                    type="time"
                    value={admissionTime}
                    onChange={(e) => setAdmissionTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room / Bed Allocation
                  </label>
                  <input
                    type="text"
                    value={roomOrBed}
                    onChange={(e) => setRoomOrBed(e.target.value)}
                    placeholder="e.g. Dorm A - Bed 08"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Ready summary */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-950">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Ready to Complete Registration
                </div>
                <div>Child Name: <strong>{childName}</strong> ({gender}, ~{estimatedAge} yrs)</div>
                <div>Assigned Shelter: <strong>{shelterName}</strong> ({roomOrBed})</div>
                <div>Case Worker: <strong>{assignedCaseWorker}</strong></div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                &larr; Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg text-xs"
              >
                Cancel
              </button>
            )}

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
              >
                Continue to Step {activeStep + 1} &rarr;
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save & Generate Child ID</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
