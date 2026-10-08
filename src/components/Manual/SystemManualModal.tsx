import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  ShieldAlert, 
  Users, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  Database, 
  CheckCircle2, 
  Search, 
  Flame, 
  Phone, 
  Mail, 
  FileText, 
  X,
  Compass
} from 'lucide-react';
import { MASTER_HR_EMAIL } from '../../context/AppContext';

interface SystemManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemManualModal: React.FC<SystemManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rbac' | 'firebase' | 'modules' | 'troubleshoot'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/80 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E31B23] text-white flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E31B23]">
                  Standard Operating Procedures
                </span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  v2.4 Official
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                LEEDO System Manual & Field Operations Guide
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 pt-2 bg-white gap-2 text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'border-[#E31B23] text-[#E31B23]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. System Architecture & 4R
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'rbac'
                ? 'border-[#E31B23] text-[#E31B23]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. HR & Access Control (RBAC)
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'firebase'
                ? 'border-[#E31B23] text-[#E31B23]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Firebase Cloud Publishing
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'modules'
                ? 'border-[#E31B23] text-[#E31B23]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. SUS & Vocational (VTC)
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`pb-2.5 px-3 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'troubleshoot'
                ? 'border-[#E31B23] text-[#E31B23]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            5. Contacts & Support
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#E31B23]" />
                  The 4R Methodology: Rescue &rarr; Reception &rarr; Rehabilitation &rarr; Reintegration
                </h3>
                <p>
                  LEEDO operates under the strict 4R child protection framework to safeguard street-connected and vulnerable children across Dhaka.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100">
                  <h4 className="font-bold text-rose-900 text-xs mb-1">R1: Rescue & Reception (Kamalapur & Kadamtali)</h4>
                  <p className="text-[11px] text-slate-600">
                    24/7 rescue and SUS centers (Airport, Mirpur, Tejgaon, Sadarghat, etc.) receive lost, runaway, or vulnerable children. Maximum transitional stay is strictly <strong>6 weeks (42 days)</strong> to prevent institutional dependency.
                  </p>
                </div>

                <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100">
                  <h4 className="font-bold text-amber-900 text-xs mb-1">R2: Rehabilitation & Safeguarding</h4>
                  <p className="text-[11px] text-slate-600">
                    Trauma-informed psycho-social counseling, health triage, GD police notifications, and tracing family contacts across all 64 districts in Bangladesh.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <h4 className="font-bold text-emerald-900 text-xs mb-1">R3: Reintegration or Referral</h4>
                  <p className="text-[11px] text-slate-600">
                    Prioritizing safe reunification with vetted parents/guardians, government shelter referral, or community follow-up.
                  </p>
                </div>

                <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100">
                  <h4 className="font-bold text-purple-900 text-xs mb-1">R4: Long-Term Sanctuary (LEEDO Peace Home)</h4>
                  <p className="text-[11px] text-slate-600">
                    If family cannot be safely traced after 6 weeks and govt shelters are unsuitable, child is transferred to LEEDO Peace Home for residential care up to 17 years old.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">Unique Child ID System</h4>
                <p className="text-[11px]">
                  All cases receive a structured, non-duplicable identifier: <code className="bg-white px-1 py-0.5 border rounded font-mono font-bold text-rose-700">LEEDO-[YEAR]-[4-DIGIT]</code> (e.g. <code className="font-mono">LEEDO-2026-0001</code>). This ID follows the child through tracing, medical, and reintegration files.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rbac' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#E31B23]" />
                  Role-Based Access Control (RBAC) & 2FA Master Gateway
                </h3>
                <p>
                  To protect vulnerable children&apos;s privacy and adhere to international child safeguarding protocols, the system enforces strict role and area boundaries.
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl">
                <h4 className="font-bold text-rose-950 text-xs mb-1">Master Email Gateway: {MASTER_HR_EMAIL}</h4>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  All staff logins dispatch a 6-digit one-time PIN (2FA OTP) to the HR Administration account. Only personnel registered as <strong>Active</strong> in the HR Staff Registry can complete authentication.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-36">Super Admin:</span>
                  <span>Full organization oversight, database export/import, adding/revoking staff credentials.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-36">Head Office Staff:</span>
                  <span>Access to monitoring dashboards, audit trail records, organizational reports, and cross-branch cases.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-36">Shelter Staff:</span>
                  <span>Scoped strictly to their assigned facility (Kamalapur Shelter or Kadamtali Shelter). Manages admissions and medical files.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-36">Peace Home Staff:</span>
                  <span>Dedicated to long-term sanctuary residents (up to 17 years old), formal schooling, and adolescent care.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                  <span className="font-bold text-slate-900 min-w-36">Rescue / SUS Staff:</span>
                  <span>Area-scoped to their designated zone (Airport, Mirpur, Tejgaon, Sadarghat, etc.) for field rescues and SUS education.</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <strong>Revocation of Resigned Staff:</strong> When HR marks an employee as <em>Resigned / Terminated</em>, their authentication session is immediately halted and login is permanently locked.
              </div>
            </div>
          )}

          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Firebase Cloud Synchronization & Deployment
                </h3>
                <p>
                  LEEDO uses Google Cloud Firestore for secure, cloud-hosted persistent storage, real-time synchronization, and multi-device field reliability.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-2 text-xs">
                  <Flame className="w-4 h-4 text-emerald-700" />
                  <span>Configured Firestore Project: refined-axle-rlcf1</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Firestore synchronization runs automatically in the background. If case workers go offline in remote field areas (e.g. railway yards or river ghats), edits queue locally and upload seamlessly once cell data reconnects.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Publishing Data to Firebase (Step-by-Step for Admins):</h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-[11px]">
                  <li>Navigate to <strong>Settings & Data Controls</strong> in the left sidebar menu.</li>
                  <li>Verify that the connectivity pill shows <strong>Online</strong> (green).</li>
                  <li>Click <strong>&quot;Sync All Data to Firebase Cloud&quot;</strong> to force push newly enrolled children, SUS sessions, or vocational trainees.</li>
                  <li>Audit logs record all synchronized documents with user name, timestamp, and action signature.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#E31B23]" />
                  SUS Centers & Vocational Trade Center (VTC)
                </h3>
                <p>
                  Distinct guidelines for non-formal street education versus vocational skill development.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#E31B23]" />
                    <h4 className="font-bold text-slate-900 text-xs">School Under the Sky (SUS)</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Held in open-air spots across 7 SUS centers (Airport, Mirpur, Tejgaon, Rayerbazar, Kamalapur, Sadarghat, Shambazar). Tracks:
                  </p>
                  <ul className="list-disc pl-4 text-[10px] space-y-0.5 text-slate-600">
                    <li>Boys and girls daily headcounts</li>
                    <li>Nutrition meals served with vendor cash memo upload</li>
                    <li>Vulnerable street children flagged for emergency rescue</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-xs">Vocational Trade Center (VTC)</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Operated at Kadamtali & Inclusive School for community, non-shelter youth. Tracks:
                  </p>
                  <ul className="list-disc pl-4 text-[10px] space-y-0.5 text-slate-600">
                    <li>5 Market Trades: Sewing, Beauty, ICT, Handicrafts, Carpentry</li>
                    <li>Unique Student IDs (e.g. LEEDO-VTC-2026-001)</li>
                    <li>Non-shelter slum address & guardian contact</li>
                    <li>Daily Roll Call (Present, Late, Absent) & completion certificates</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#E31B23]" />
                  Emergency Hotlines & Head Office Directory
                </h3>
                <p>
                  Official contacts for child rescue alerts, shelter reception, and IT administration.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1 text-xs">
                  <span className="font-bold text-rose-900 block">Kamalapur Shelter Hotline:</span>
                  <div className="text-rose-800 font-mono font-bold text-sm">+88 01786-228800</div>
                  <p className="text-[10px] text-rose-700">24/7 emergency rescue reception near station</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
                  <span className="font-bold text-slate-900 block">Head Office Admin & Finance:</span>
                  <div className="text-slate-800 font-mono font-bold text-sm">+88 017 0779 7102</div>
                  <p className="text-[10px] text-slate-500">Dhaka Headquarters & Partnership Liaison</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">Key Executive Directory:</h4>
                <div className="space-y-1 text-[11px]">
                  <div>&bull; <strong>Forhad Hossain (Founder & ED):</strong> 01819-291567</div>
                  <div>&bull; <strong>Murshida Akhter Kanta (Director - Admin & Finance):</strong> 01861-676979</div>
                  <div>&bull; <strong>Md. Omar Faruque (Manager HR & Admin):</strong> 016714-32484</div>
                  <div>&bull; <strong>Master Security Email:</strong> hr.leedo2000@gmail.com</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50 rounded-b-3xl">
          <span className="text-[11px] text-slate-500">
            For technical assistance, contact LEEDO IT Administrator via <strong className="text-slate-700">{MASTER_HR_EMAIL}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
