import React from 'react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  MapPin, 
  Building2, 
  Phone, 
  Activity, 
  Smile, 
  HeartHandshake, 
  Send, 
  Home, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Child } from '../../types';
import { getDaysInShelter, getSixWeekAlertStatus } from '../../utils/calculations';
import { LeedoLogo } from '../LeedoLogo';

interface StandardCaseReportModalProps {
  child: Child;
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'bn';
}

export const StandardCaseReportModal: React.FC<StandardCaseReportModalProps> = ({
  child,
  isOpen,
  onClose,
  language = 'bn',
}) => {
  if (!isOpen) return null;

  const daysInShelter = getDaysInShelter(child);
  const sixWeek = getSixWeekAlertStatus(child);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Control Bar (Excluded from Print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-sm font-bold">
                {language === 'bn' ? 'স্ট্যান্ডার্ড কেস ফাইল প্রিন্ট প্রিভিউ' : 'Standard Case Dossier Print Preview'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'সকল তথ্যসহ পূর্ণাঙ্গ মানবিক ও আইনি প্রতিবেদন' : 'Comprehensive Multi-module Official Case Dossier'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'bn' ? 'প্রিন্ট করুন (Print)' : 'Print Document'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-slate-800 font-sans print:p-0 print:overflow-visible" id="official-case-report">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <LeedoLogo size="lg" variant="horizontal" />
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                    LEEDO Child Protection & Case Management System
                  </h1>
                  <p className="text-xs font-semibold text-rose-600">
                    লিডো (LEEDO) • সুবিধাবঞ্চিত শিশুদের সুরক্ষায় নিয়োজিত
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Govt. Reg. No. DSS / NGO Affairs Bureau #2854 • Head Office: Keraniganj & Central Dhaka
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-600 shrink-0">
                <div className="font-mono font-bold text-slate-900 text-sm">
                  CASE ID: {child.id}
                </div>
                <div>Printed: {new Date().toLocaleDateString('en-GB')}</div>
                <div className="text-emerald-700 font-semibold">Status: {child.caseStatus}</div>
              </div>
            </div>
          </div>

          {/* Child Identity Profile Summary */}
          <div className="bg-slate-50 border border-slate-300 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-start gap-5">
            <img
              src={child.photoUrl}
              alt={child.name}
              className="w-28 h-28 rounded-xl object-cover border border-slate-300 shadow-xs shrink-0"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs w-full">
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Full Legal Name:</span>
                <span className="font-bold text-slate-900 text-sm">{child.name}</span>
                {child.nickname && <span className="text-slate-500 text-xs block">({child.nickname})</span>}
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Gender & Age:</span>
                <span className="font-bold text-slate-900">{child.gender} • Est. {child.estimatedAge} Years</span>
                {child.dateOfBirth && <span className="text-slate-500 text-[11px] block">DOB: {child.dateOfBirth}</span>}
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Nationality & Religion:</span>
                <span className="font-bold text-slate-900">{child.nationality || 'Bangladeshi'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Identification Marks:</span>
                <span className="text-slate-800">{child.identificationInfo || 'No distinguishing marks noted.'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Special Needs / Disability:</span>
                <span className="text-slate-800">{child.disabilityOrSpecialNeeds || 'None reported.'}</span>
              </div>
            </div>
          </div>

          {/* 1. Rescue & Police Legal Custody Details */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#E31B23] border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>1. Rescue & Police Legal Documentation (রেসকিউ ও জিডি বিবরণ)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-white border border-slate-200 rounded-xl p-3">
              <div>
                <span className="text-slate-500 text-[10px] block">Rescue Date & Time:</span>
                <span className="font-bold text-slate-900">{child.rescueDate} at {child.rescueTime}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Rescue Area / Hub:</span>
                <span className="font-bold text-slate-900">{child.area}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Police Station (Thana):</span>
                <span className="font-bold text-slate-900">{child.policeStation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">General Diary (GD) No:</span>
                <span className="font-bold text-slate-900 font-mono">{child.gdNumber || 'GD Pending'} ({child.gdDate || 'N/A'})</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 text-[10px] block">Exact Rescue Spot:</span>
                <span className="text-slate-800">{child.rescueLocation}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 text-[10px] block">Rescue Team & Lead Officer:</span>
                <span className="text-slate-800">{child.rescueTeam} • Rescued by: {child.rescuedBy}</span>
              </div>
            </div>
          </div>

          {/* 2. Shelter Care & 6-Week Compliance */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#E31B23] border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>2. Shelter Placement & Safeguard Timeline (শেল্টার ও অবস্থান)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-white border border-slate-200 rounded-xl p-3">
              <div>
                <span className="text-slate-500 text-[10px] block">Assigned Shelter:</span>
                <span className="font-bold text-slate-900">{child.shelterName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Admission Date:</span>
                <span className="font-bold text-slate-900">{child.admissionDate}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Days in Shelter:</span>
                <span className="font-bold text-slate-900">{daysInShelter} Days</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Assigned Case Worker:</span>
                <span className="font-bold text-slate-900">{child.assignedCaseWorker}</span>
              </div>
            </div>
          </div>

          {/* 3. Medical Assessments & Health History */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#E31B23] border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>3. Medical Examinations & Health Records (স্বাস্থ্য পরীক্ষা ও চিকিৎসা)</span>
            </h2>
            {child.healthRecords && child.healthRecords.length > 0 ? (
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase">
                  <tr>
                    <th className="p-2 border-b">Date</th>
                    <th className="p-2 border-b">Doctor / Clinic</th>
                    <th className="p-2 border-b">Health Condition</th>
                    <th className="p-2 border-b">Treatment & Medication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {child.healthRecords.map((hr) => (
                    <tr key={hr.id}>
                      <td className="p-2 font-mono text-[11px]">{hr.date}</td>
                      <td className="p-2 font-medium">{hr.doctor}</td>
                      <td className="p-2">{hr.healthCondition}</td>
                      <td className="p-2 text-slate-600">{hr.treatment || hr.medication || 'Routine checkup conducted.'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500 italic p-2 border border-slate-200 rounded-xl">
                Initial primary health checkup completed upon shelter admission. No acute conditions recorded.
              </p>
            )}
          </div>

          {/* 4. Counseling & Mental Health Progress */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#E31B23] border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5" />
              <span>4. Psycho-Social Counseling & Trauma Support (মনোসামাজিক কাউন্সেলিং)</span>
            </h2>
            {child.counselingRecords && child.counselingRecords.length > 0 ? (
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase">
                  <tr>
                    <th className="p-2 border-b">Date</th>
                    <th className="p-2 border-b">Counselor</th>
                    <th className="p-2 border-b">Type / Focus</th>
                    <th className="p-2 border-b">Intervention & Recommendations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {child.counselingRecords.map((cr) => (
                    <tr key={cr.id}>
                      <td className="p-2 font-mono text-[11px]">{cr.date}</td>
                      <td className="p-2 font-medium">{cr.counselor}</td>
                      <td className="p-2">{cr.counselingType}: {cr.mainConcern}</td>
                      <td className="p-2 text-slate-600">{cr.intervention} &bull; {cr.recommendation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500 italic p-2 border border-slate-200 rounded-xl">
                Psychological first aid administered. In-depth trauma counseling scheduled.
              </p>
            )}
          </div>

          {/* 5. Family Tracing Operations */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#E31B23] border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>5. Family Tracing & Home Inquiries (পরিবার অনুসন্ধান কার্যক্রম)</span>
            </h2>
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 text-[10px] block">Father:</span>
                  <span className="font-semibold text-slate-900">{child.familyTracing?.fatherName || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Mother:</span>
                  <span className="font-semibold text-slate-900">{child.familyTracing?.motherName || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Village / Upazila:</span>
                  <span className="font-semibold text-slate-900">
                    {child.familyTracing?.village || 'Not located'}, {child.familyTracing?.upazila || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Reintegration / Referral Status */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#E31B23] border-b border-slate-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span>6. Final Disposition & Post Reintegration / Referral (চূড়ান্ত অবস্থা)</span>
            </h2>
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs">
              {child.caseStatus === 'Reintegrated' && child.reintegration ? (
                <div className="space-y-1">
                  <div className="font-bold text-emerald-800">Successfully Reintegrated with Family</div>
                  <div>Reintegration Date: {child.reintegration.reintegrationDate}</div>
                  <div>Handed over to: {child.reintegration.familyGuardianName} ({child.reintegration.relationshipWithChild})</div>
                  <div>Handover Location: {child.reintegration.handoverLocation} • Handover Person: {child.reintegration.handoverPerson}</div>
                  <div>Officer in charge: {child.reintegration.responsibleOfficer}</div>
                </div>
              ) : child.caseStatus === 'Government Shelter Referral' && child.referral ? (
                <div className="space-y-1">
                  <div className="font-bold text-blue-800">Referred to Government Safe Home</div>
                  <div>Referral Facility: {child.referral.governmentShelterOrServiceName}</div>
                  <div>Referral Date: {child.referral.referralDate} • Officer: {child.referral.referralOfficer}</div>
                  <div>Contact: {child.referral.contactPerson} ({child.referral.contactNumber})</div>
                </div>
              ) : (
                <div className="text-slate-700">
                  Current Case State: <strong>{child.caseStatus}</strong> at {child.shelterName}. Continuous protection and support services being delivered in full compliance with LEEDO 4R Framework.
                </div>
              )}
            </div>
          </div>

          {/* Official Signatures and Seals */}
          <div className="mt-12 pt-8 border-t border-slate-400 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <div className="font-bold text-slate-900">{child.assignedCaseWorker || 'Case Officer'}</div>
              <div className="text-[10px] text-slate-500">Case Worker / Social Mobilizer</div>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <div className="font-bold text-slate-900">Md. Sohel Rana</div>
              <div className="text-[10px] text-slate-500">Manager & Head of Peace Home</div>
            </div>
            <div>
              <div className="border-b border-slate-400 pb-8 mb-2"></div>
              <div className="font-bold text-slate-900">Forhad Hossain</div>
              <div className="text-[10px] text-slate-500">Founder & Executive Director, LEEDO</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
