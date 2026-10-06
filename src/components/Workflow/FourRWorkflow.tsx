import React from 'react';
import { 
  Compass, 
  Building2, 
  Home, 
  GraduationCap, 
  HeartHandshake, 
  Send, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FourRWorkflow: React.FC = () => {
  const { children, susSessions, vtcStudents, setActiveView } = useApp();

  // Statistics across the 4Rs
  const totalRescued = children.length;
  const activeInShelter = children.filter(c => c.currentShelterStatus === 'Active Resident' && c.shelterName !== 'LEEDO Peace Home').length;
  const inPeaceHome = children.filter(c => c.shelterName === 'LEEDO Peace Home' && c.currentShelterStatus === 'Active Resident').length;
  const reintegratedCount = children.filter(c => c.caseStatus === 'Reintegrated' || c.currentShelterStatus === 'Reintegrated').length;
  const referredCount = children.filter(c => c.caseStatus === 'Government Shelter Referral' || c.currentShelterStatus === 'Referred').length;
  const totalSUSStudents = susSessions.reduce((acc, s) => acc + (s.totalAttendance || s.totalChildrenPresent || 0), 0);
  const totalVTCEnrolled = vtcStudents.length;

  const steps = [
    {
      number: '1R',
      title: 'Rescue (উদ্ধার)',
      subtitle: 'Field Outreach & Mobile Rescue Units',
      color: 'from-amber-500 to-rose-500',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
      description: 'Active daily patrolling across 7 major street hotspots: Airport, Mirpur, Tejgaon, Rayerbazar, Kamalapur, Sadarghat, and Shambazar. Mobile case workers identify vulnerable and separated children, provide Psychological First Aid, notify local police stations, file mandatory General Diary (GD), and arrange safe escort.',
      highlights: [
        'Immediate protection needs assessment',
        'Mandatory Police Station GD registration',
        'Field photographic & identification logging',
        'Rapid medical triage & emergency nourishment',
      ],
      metrics: `${totalRescued} Total Rescues Recorded`,
      targetView: 'children',
      buttonText: 'View Rescue Cases',
    },
    {
      number: '2R',
      title: 'Rehabilitate (পুনর্বাসন)',
      subtitle: 'Transitional Shelters & LEEDO Peace Home',
      color: 'from-rose-500 to-purple-600',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-200',
      description: 'Immediate admission into Kamalapur or Kadamtali Transitional Safe Homes for a strict 6-week rehabilitation period covering medical detox, trauma counseling, and nutrition. For children where family tracing fails and govt shelters are unavailable, they are transferred to LEEDO Peace Home for long-term sanctuary until age 17.',
      highlights: [
        'Transitional safe shelter (Kamalapur & Kadamtali: 6-week limit)',
        'Routine health checkups, growth monitoring & pathology',
        'Individual & group counseling sessions',
        'LEEDO Peace Home long-term guardianship up to age 17',
      ],
      metrics: `${activeInShelter} in Transitional Shelters &bull; ${inPeaceHome} in Peace Home (Up to 17y)`,
      targetView: 'shelters',
      buttonText: 'Manage Safe Shelters',
    },
    {
      number: '3R',
      title: 'Reintegrate & Refer (পুনঃএকত্রীকরণ ও রেফারেল)',
      subtitle: 'Family Tracing, Safe Reunification & Govt Placements',
      color: 'from-blue-500 to-teal-500',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-200',
      description: 'Intensive family tracing via community leaders, local police, phone investigations, and field home-assessment visits. Verified guardians undergo counseling before formal legal handover. If family reunification is unsafe, child is formally referred to DSS government institutions or specialized welfare partners.',
      highlights: [
        'District-level family tracing attempts & verification',
        'Home safety & guardian financial suitability check',
        'Legal handover certificate signed with local administration',
        'Official referral to Government Safe Homes (DSS/MoSW)',
      ],
      metrics: `${reintegratedCount} Reintegrated &bull; ${referredCount} Govt Referrals`,
      targetView: 'reintegration',
      buttonText: 'Tracing & Reintegration',
    },
    {
      number: '4R',
      title: 'Rebuild (জীবন পুনর্গঠন ও কারিগরি প্রশিক্ষণ / VTC)',
      subtitle: 'School Under the Sky (SUS) & Vocational Trade Center (VTC)',
      color: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      description: 'Sustainable life rebuilding through daily School Under the Sky (SUS) open-air classrooms across street locations with nutritious meals, and technical skill development at the Vocational Trade Center (VTC) in Kadamtali (Sewing & Tailoring, Beautification, ICT & Computer Literacy, Handicraft, Carpentry) preparing youth for independent adulthood before age 18.',
      highlights: [
        'School Under the Sky (SUS) daily open-air classes & warm meals',
        'Vocational Trade Center (VTC) 5 certified trades (Kadamtali Center)',
        'Tailoring, ICT, Beautification, Handicrafts & Carpentry skills',
        'Tool kit support, livelihood starter grants & job placement',
      ],
      metrics: `${susSessions.length} SUS Sessions &bull; ${totalSUSStudents} School Students &bull; ${totalVTCEnrolled} VTC Trainees`,
      targetView: 'vtc',
      buttonText: 'Open Vocational Center (VTC) & SUS',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
            Child Protection Framework
          </span>
          <span className="text-xs text-slate-400">&bull;</span>
          <span className="text-xs text-slate-500 font-medium">Standard Operating Procedures (SOP)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
          The 4R Child Protection & Development Model
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          LEEDO operates an end-to-end child protection ecosystem spanning street outreach, transitional shelter care, family reunification, long-term sanctuary at Peace Home up to 17 years old, and open-air School Under the Sky education.
        </p>
      </div>

      {/* 4R Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header stripe with gradient */}
              <div className={`p-5 bg-gradient-to-r ${step.color} text-white flex items-center justify-between`}>
                <div>
                  <span className="text-2xl font-black tracking-wider opacity-90">{step.number}</span>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <div className="text-xs text-white/80 font-medium">{step.subtitle}</div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3.5 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>

                <div className="space-y-1.5 pt-1">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Core Safeguards & Protocols:
                  </div>
                  {step.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-semibold flex items-center justify-between">
                  <span>Current Impact:</span>
                  <span className="text-slate-900" dangerouslySetInnerHTML={{ __html: step.metrics }} />
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-5 pt-0">
              {step.number === '4R' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveView('vtc')}
                    className="py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>VTC কারিগরি কেন্দ্র</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveView('sus')}
                    className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>SUS স্কুল ট্র্যাকার</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveView(step.targetView)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{step.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
