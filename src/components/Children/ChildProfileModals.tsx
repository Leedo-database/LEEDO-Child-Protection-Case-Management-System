import React, { useState } from 'react';
import { X, Check, Activity, Smile, HeartHandshake, Home, Send, CalendarClock, AlertOctagon, FileText, Upload } from 'lucide-react';
import { Child, CaseStatus } from '../../types';
import { getTodayDateString } from '../../utils/calculations';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child;
}

// 1. Add Case Note Modal
export const AddCaseNoteModal: React.FC<ModalProps & { onAdd: (note: string, isConfidential: boolean) => void }> = ({
  isOpen,
  onClose,
  child,
  onAdd,
}) => {
  const [note, setNote] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onAdd(note, isConfidential);
    setNote('');
    setIsConfidential(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-base text-slate-900">Add Case Note &bull; {child.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Case Note Observation</label>
            <textarea
              rows={4}
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter case note, interaction summary, or behavioral observation..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="rounded text-rose-600"
            />
            <span className="font-semibold text-slate-800">Mark as Confidential (Restricted to Authorized Officers)</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-100 rounded-lg font-semibold text-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold">Save Case Note</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Add Health Checkup Modal
export const AddHealthModal: React.FC<ModalProps & { onAdd: (record: any) => void }> = ({
  isOpen,
  onClose,
  child,
  onAdd,
}) => {
  const today = getTodayDateString();
  const [date, setDate] = useState(today);
  const [doctor, setDoctor] = useState('Dr. Shahinur Alam (MBBS)');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [healthCondition, setHealthCondition] = useState('Stable & Healthy');
  const [illness, setIllness] = useState('');
  const [medication, setMedication] = useState('');
  const [treatment, setTreatment] = useState('');
  const [vaccinationInfo, setVaccinationInfo] = useState('');
  const [nextCheckupDate, setNextCheckupDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      date,
      doctor,
      heightCm: heightCm ? Number(heightCm) : undefined,
      weightKg: weightKg ? Number(weightKg) : undefined,
      healthCondition,
      illness: illness || undefined,
      medication: medication || undefined,
      treatment: treatment || undefined,
      vaccinationInfo: vaccinationInfo || undefined,
      nextCheckupDate: nextCheckupDate || undefined,
      notes: notes || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-base text-slate-900">Record Health Check-up &bull; {child.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Check-up Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Doctor / Medical Provider</label>
              <input type="text" required value={doctor} onChange={(e) => setDoctor(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Height (cm)</label>
              <input type="number" step="0.1" value={heightCm} onChange={(e) => setHeightCm(e.target.value as any)} placeholder="e.g. 132" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value as any)} placeholder="e.g. 28.5" className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">General Health Condition</label>
            <input type="text" required value={healthCondition} onChange={(e) => setHealthCondition(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Illness / Symptoms (If Any)</label>
              <input type="text" value={illness} onChange={(e) => setIllness(e.target.value)} placeholder="e.g. Cough, scabies, fever" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medication Prescribed</label>
              <input type="text" value={medication} onChange={(e) => setMedication(e.target.value)} placeholder="e.g. Amoxicillin, Antacid" className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Treatment & Clinical Notes</label>
            <textarea rows={2} value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder="Treatment instructions..." className="w-full p-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vaccination Info</label>
              <input type="text" value={vaccinationInfo} onChange={(e) => setVaccinationInfo(e.target.value)} placeholder="e.g. Tetanus given" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Next Scheduled Check-up Date</label>
              <input type="date" value={nextCheckupDate} onChange={(e) => setNextCheckupDate(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-100 rounded-lg font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold">Save Health Record</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Add Counseling Session Modal
export const AddCounselingModal: React.FC<ModalProps & { onAdd: (record: any) => void }> = ({
  isOpen,
  onClose,
  child,
  onAdd,
}) => {
  const today = getTodayDateString();
  const [date, setDate] = useState(today);
  const [counselor, setCounselor] = useState('Sadia Sultana (Child Psychologist)');
  const [counselingType, setCounselingType] = useState<'Individual' | 'Group' | 'Trauma/Crisis' | 'Behavioral' | 'Psycho-social'>('Individual');
  const [mainConcern, setMainConcern] = useState('');
  const [intervention, setIntervention] = useState('');
  const [childResponse, setChildResponse] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [nextCounselingDate, setNextCounselingDate] = useState('');
  const [counselingStatus, setCounselingStatus] = useState<'In Progress' | 'Satisfactory' | 'Needs Urgent Follow-up' | 'Completed'>('In Progress');
  const [confidentialNotes, setConfidentialNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      date,
      counselor,
      counselingType,
      mainConcern,
      intervention,
      childResponse,
      recommendation,
      nextCounselingDate: nextCounselingDate || undefined,
      counselingStatus,
      confidentialNotes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Record Counseling Session &bull; {child.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Session Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Counselor Name</label>
              <input type="text" required value={counselor} onChange={(e) => setCounselor(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Session Type</label>
              <select value={counselingType} onChange={(e) => setCounselingType(e.target.value as any)} className="w-full p-2 border rounded-lg">
                <option value="Individual">Individual</option>
                <option value="Group">Group</option>
                <option value="Trauma/Crisis">Trauma / Crisis</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Psycho-social">Psycho-social</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Main Concern / Trauma Trigger</label>
            <input type="text" required value={mainConcern} onChange={(e) => setMainConcern(e.target.value)} placeholder="e.g. Runaway trigger, emotional distress, separation anxiety" className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Therapeutic Intervention Used</label>
            <input type="text" required value={intervention} onChange={(e) => setIntervention(e.target.value)} placeholder="e.g. Cognitive reframing, expressive art therapy, active listening" className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Child's Response & Engagement</label>
            <textarea rows={2} required value={childResponse} onChange={(e) => setChildResponse(e.target.value)} placeholder="How the child engaged, emotional indicators..." className="w-full p-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Next Session Date</label>
              <input type="date" value={nextCounselingDate} onChange={(e) => setNextCounselingDate(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Session Outcome Status</label>
              <select value={counselingStatus} onChange={(e) => setCounselingStatus(e.target.value as any)} className="w-full p-2 border rounded-lg">
                <option value="In Progress">In Progress</option>
                <option value="Satisfactory">Satisfactory</option>
                <option value="Needs Urgent Follow-up">Needs Urgent Follow-up</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Confidential Counseling Clinical Notes</label>
            <textarea rows={2} value={confidentialNotes} onChange={(e) => setConfidentialNotes(e.target.value)} placeholder="Restricted clinical insights..." className="w-full p-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-100 rounded-lg font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold">Save Counseling Session</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Add Family Tracing Attempt Modal
export const AddTracingAttemptModal: React.FC<ModalProps & { onAdd: (attempt: any, status: any) => void }> = ({
  isOpen,
  onClose,
  child,
  onAdd,
}) => {
  const today = getTodayDateString();
  const [date, setDate] = useState(today);
  const [contactPerson, setContactPerson] = useState('');
  const [contactMethod, setContactMethod] = useState<'Phone Call' | 'In-Person Visit' | 'Local Police/GD' | 'Community Leader' | 'Social Media/Media' | 'NGO Partner'>('Phone Call');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState<'Success - Family Located' | 'Partial Lead' | 'No Answer / Unreachable' | 'Incorrect Address' | 'In Progress'>('In Progress');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [staffResponsible, setStaffResponsible] = useState(child.assignedCaseWorker || 'Staff');
  const [newTracingStatus, setNewTracingStatus] = useState(child.familyTracing.tracingStatus);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(
      {
        date,
        contactPerson,
        contactMethod,
        location,
        result,
        notes,
        nextAction,
        staffResponsible,
      },
      newTracingStatus
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">Log Family Tracing Attempt &bull; {child.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Attempt Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Method</label>
              <select value={contactMethod} onChange={(e) => setContactMethod(e.target.value as any)} className="w-full p-2 border rounded-lg">
                <option value="Phone Call">Phone Call</option>
                <option value="In-Person Visit">In-Person Visit</option>
                <option value="Community Leader">Community / UP Leader Contact</option>
                <option value="Local Police/GD">Local Police Station / GD</option>
                <option value="NGO Partner">NGO Partner Referral</option>
                <option value="Social Media/Media">Social Media / Media Notice</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Person / Entity</label>
              <input type="text" required value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="e.g. UP Chairman, Neighbor, Mother" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location / District</label>
              <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bakerganj, Barishal" className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Attempt Outcome Result</label>
              <select 
                value={result} 
                onChange={(e) => {
                  const val = e.target.value as any;
                  setResult(val);
                  if (val === 'Success - Family Located') {
                    setNewTracingStatus('Family Located');
                  }
                }} 
                className="w-full p-2 border rounded-lg"
              >
                <option value="In Progress">In Progress</option>
                <option value="Partial Lead">Partial Lead</option>
                <option value="Success - Family Located">Success - Family Located!</option>
                <option value="No Answer / Unreachable">No Answer / Unreachable</option>
                <option value="Incorrect Address">Incorrect Address</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Update Case Tracing Status</label>
              <select value={newTracingStatus} onChange={(e) => setNewTracingStatus(e.target.value as any)} className="w-full p-2 border rounded-lg font-semibold text-slate-900">
                <option value="In Progress">In Progress</option>
                <option value="Lead Found">Lead Found</option>
                <option value="Family Located">Family Located</option>
                <option value="Family Untraceable">Family Untraceable</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Outcome Notes</label>
            <textarea rows={2} required value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Details of conversation, verification made..." className="w-full p-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Immediate Next Action</label>
              <input type="text" required value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="e.g. Video call with child, schedule home visit" className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Staff Responsible</label>
              <input type="text" required value={staffResponsible} onChange={(e) => setStaffResponsible(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-100 rounded-lg font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold">Log Tracing Attempt</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. Reintegrate Child Modal
export const ReintegrateModal: React.FC<ModalProps & { onReintegrate: (data: any) => void }> = ({
  isOpen,
  onClose,
  child,
  onReintegrate,
}) => {
  const today = getTodayDateString();
  const [reintegrationDate, setReintegrationDate] = useState(today);
  const [familyGuardianName, setFamilyGuardianName] = useState(child.familyInfo?.fatherOrGuardianName || child.familyTracing?.fatherName || '');
  const [relationshipWithChild, setRelationshipWithChild] = useState('Biological Father');
  const [handoverPerson, setHandoverPerson] = useState(familyGuardianName);
  const [handoverLocation, setHandoverLocation] = useState('LEEDO Head Office, Dhaka');
  const [responsibleOfficer, setResponsibleOfficer] = useState(child.assignedCaseWorker || 'Case Officer');
  const [familyAssessmentNotes, setFamilyAssessmentNotes] = useState('Family living conditions verified; biological parents eager to receive and support child.');
  const [safetyAssessmentNotes, setSafetyAssessmentNotes] = useState('Home environment assessed as safe; father and mother signed child safeguarding pledge.');
  const [reintegrationPlan, setReintegrationPlan] = useState('Immediate return to parental home; enrollment in local school; scheduled 7-day, 30-day, 3m, 6m, 12m follow-up.');
  const [witnessInformation, setWitnessInformation] = useState('Local UP Ward Member & Police Sub-Inspector');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReintegrate({
      reintegrationDate,
      familyGuardianName,
      relationshipWithChild,
      handoverPerson,
      handoverLocation,
      responsibleOfficer,
      familyAssessmentNotes,
      safetyAssessmentNotes,
      reintegrationPlan,
      witnessInformation,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Reintegrate Child with Family &bull; {child.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 mb-3">
          Completing this form changes case status to <strong>Reintegrated</strong> and automatically generates the 7-day, 30-day, 3-month, 6-month, and 12-month post-reintegration follow-up schedule.
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reintegration Date</label>
              <input type="date" required value={reintegrationDate} onChange={(e) => setReintegrationDate(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Handover Location</label>
              <input type="text" required value={handoverLocation} onChange={(e) => setHandoverLocation(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Family / Guardian Name</label>
              <input type="text" required value={familyGuardianName} onChange={(e) => setFamilyGuardianName(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Relationship with Child</label>
              <input type="text" required value={relationshipWithChild} onChange={(e) => setRelationshipWithChild(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Handover Receiving Person</label>
              <input type="text" required value={handoverPerson} onChange={(e) => setHandoverPerson(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">LEEDO Responsible Officer</label>
              <input type="text" required value={responsibleOfficer} onChange={(e) => setResponsibleOfficer(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Safety & Family Assessment Summary</label>
            <textarea rows={2} required value={safetyAssessmentNotes} onChange={(e) => setSafetyAssessmentNotes(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reintegration & Education Plan</label>
            <textarea rows={2} required value={reintegrationPlan} onChange={(e) => setReintegrationPlan(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Witness & Official Signatures</label>
            <input type="text" value={witnessInformation} onChange={(e) => setWitnessInformation(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-100 rounded-lg font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold">Approve & Complete Reintegration</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6. Left Without Notice Modal
export const LeftWithoutNoticeModal: React.FC<ModalProps & { onRecord: (data: any) => void }> = ({
  isOpen,
  onClose,
  child,
  onRecord,
}) => {
  const today = getTodayDateString();
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('17:00');
  const [lastSeenLocation, setLastSeenLocation] = useState(`${child.shelterName} compound / gate`);
  const [lastSeenBy, setLastSeenBy] = useState('Shelter Duty Staff');
  const [circumstances, setCircumstances] = useState('Child left shelter boundary without authorization');
  const [immediateActions, setImmediateActions] = useState('Local 1km search conducted; notified police station and outreach unit');
  const [gdNumber, setGdNumber] = useState(`GD-${Math.floor(1000 + Math.random() * 9000)}/2026 (Missing)`);
  const [policeStation, setPoliceStation] = useState('Motijheel Police Station');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecord({
      date,
      time,
      lastSeenLocation,
      lastSeenBy,
      circumstances,
      immediateActions,
      policeInformed: true,
      gdNumber,
      policeStation,
      searchActivities: 'Outreach teams in rail and launch terminals on high alert. Missing alert distributed.',
      currentStatus: 'Missing / Under Active Search',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-base text-slate-900">Mark "Left Without Notice" &bull; {child.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 mb-3">
          <strong>Mandatory Safeguard:</strong> A child record is <strong>never deleted</strong>. Full case history remains connected to {child.id} while active search protocols and legal GD reporting are initiated.
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date Left</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Time</label>
              <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Last Seen Location & Staff</label>
            <input type="text" required value={lastSeenLocation} onChange={(e) => setLastSeenLocation(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Circumstances</label>
            <textarea rows={2} required value={circumstances} onChange={(e) => setCircumstances(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Immediate Search & Protection Actions Taken</label>
            <textarea rows={2} required value={immediateActions} onChange={(e) => setImmediateActions(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Police Missing GD Number</label>
              <input type="text" required value={gdNumber} onChange={(e) => setGdNumber(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Police Thana</label>
              <input type="text" required value={policeStation} onChange={(e) => setPoliceStation(e.target.value)} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-slate-100 rounded-lg font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold">Confirm Left Without Notice</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 7. Assign Counseling Task Modal (Mobilizer / Coordinator to Nargis)
export const AssignCounselingTaskModal: React.FC<ModalProps & {
  onAssign: (data: {
    counselorName: string;
    reason: string;
    dueDate: string;
    urgency: 'Immediate (24h)' | 'Urgent (48h)' | 'Routine (7 Days)';
    notes: string;
  }) => void;
}> = ({ isOpen, onClose, child, onAssign }) => {
  const [counselorName, setCounselorName] = useState('Mst. Nargis (Emp-1017) - Psycho-social Facilitator / Counselor');
  const [reason, setReason] = useState('Street Trauma & Distress Intervention');
  const [otherReason, setOtherReason] = useState('');
  const [urgency, setUrgency] = useState<'Immediate (24h)' | 'Urgent (48h)' | 'Routine (7 Days)'>('Urgent (48h)');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Other' ? otherReason.trim() : reason;
    if (!finalReason) return;
    onAssign({
      counselorName,
      reason: finalReason,
      dueDate,
      urgency,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Assign Counseling Task</h3>
              <p className="text-xs text-slate-500">Child: <strong>{child.name}</strong> ({child.id}) &bull; Area: <strong>{child.area || child.rescueLocation}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl text-xs text-purple-950 mb-4">
          <p className="font-bold mb-1">🎯 নার্গিস আপার জন্য রিমাইন্ডার ও টাস্ক নোটিফিকেশন:</p>
          <p className="text-[11px] leading-relaxed">
            মোবিলাইজার বা কো-অর্ডিনেটর কর্তৃক টাস্কটি এসাইন করা হলে সাইকো-সোশ্যাল কাউন্সিলর নার্গিসের আইডিতে তাৎক্ষণিক নোটিফিকেশন যাবে এবং শিশুটির এলাকা <strong>({child.area || child.rescueLocation})</strong> ও বর্তমান অবস্থান <strong>({child.shelterName})</strong> সহ সেশন শিডিউল রিমাইন্ডার প্রদর্শন করবে।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">মনোসামাজিক কাউন্সেলর (Assigned Counselor)</label>
            <input
              type="text"
              readOnly
              value={counselorName}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">কাউন্সেলিংয়ের প্রয়োজনীয়তার কারণ / ট্রমা ফোকাস *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="Street Trauma & Distress Intervention">রাস্তার ট্রমা, ভয় ও তীব্র মানসিক অস্থিরতা (Street Trauma & Distress)</option>
              <option value="Substance Abuse / Dandy Dependency">মাদক / ড্যান্ডি আসক্তি থেকে পুনর্বাসন সহায়তা (Substance Abuse / Dandy Dependency)</option>
              <option value="Psychological First Aid Follow-up">রেসকিউকালীন মনস্তাত্ত্বিক প্রাথমিক চিকিৎসার ফলো-আপ (PFA Follow-up)</option>
              <option value="Separation Anxiety & Abandonment Grief">পরিবার থেকে বিচ্ছিন্নতাজনিত ক্ষোভ ও হতাশা (Separation & Grief)</option>
              <option value="Aggressive or Withdrawn Behavior in Shelter">শেল্টারে আক্রমণাত্মক বা অস্বাভাবিক আচরণ (Behavioral Adjustment)</option>
              <option value="Physical / Sexual Exploitation Trauma">শারীরিক বা যৌন নির্যাতনের মানসিক আঘাত (Abuse Trauma)</option>
              <option value="Other">অন্যান্য বিশেষ কারণ (Other Specific Need)...</option>
            </select>
          </div>

          {reason === 'Other' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">সুনির্দিষ্ট কারণ লিখুন *</label>
              <input
                type="text"
                required
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="যেমন: তীব্র ঘুমের সমস্যা, কথা বলতে অস্বীকৃতি..."
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">জরুরিতা (Priority / Urgency)</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              >
                <option value="Immediate (24h)">জরুরি - ২৪ ঘণ্টার মধ্যে (Immediate)</option>
                <option value="Urgent (48h)">অগ্রাধিকার - ৪৮ ঘণ্টার মধ্যে (Urgent)</option>
                <option value="Routine (7 Days)">সাধারণ - ৭ দিনের মধ্যে (Routine)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">সেশনের লক্ষ্য তারিখ (Due Date)</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">কাউন্সেলরের জন্য বিশেষ দিকনির্দেশনা (Notes for Nargis)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="শিশুটির সাথে কথা বলার সময় যে বিষয়গুলোতে বিশেষ সতর্কতা অবলম্বন করা প্রয়োজন..."
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
            >
              নার্গিসকে টাস্ক এসাইন করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 8. Refer Child to Government / 3rd-Party Shelter Modal
export const ReferChildModal: React.FC<ModalProps & {
  existingThirdPartyShelters: Array<{ id: string; name: string; location: string; contactPerson?: string; contactPhone?: string }>;
  onRefer: (data: {
    shelterName: string;
    reason: string;
    contactPerson?: string;
    contactPhone?: string;
    memoNumber?: string;
    referralDate?: string;
    organization?: string;
    notes?: string;
  }) => void;
  onAddNewShelter?: (shelter: {
    name: string;
    type: 'Government Shelter (DSS/MoSW)' | 'NGO / 3rd Party Safe Home' | 'Specialized Rehabilitation Center' | 'Other';
    location: string;
    contactPerson: string;
    contactPhone: string;
    notes?: string;
  }) => void;
}> = ({ isOpen, onClose, child, existingThirdPartyShelters, onRefer, onAddNewShelter }) => {
  const [facilityMode, setFacilityMode] = useState<'existing' | 'new'>('existing');
  const [selectedShelterName, setSelectedShelterName] = useState(
    existingThirdPartyShelters[0]?.name || 'টঙ্গী কিশোর উন্নয়ন কেন্দ্র (Tongi Juvenile Development Center)'
  );
  
  // Custom new shelter fields
  const [newShelterName, setNewShelterName] = useState('');
  const [newShelterLocation, setNewShelterLocation] = useState('');
  const [newShelterContact, setNewShelterContact] = useState('');
  const [newShelterPhone, setNewShelterPhone] = useState('+880 1');

  const [referralDate, setReferralDate] = useState(() => getTodayDateString());
  const [organization, setOrganization] = useState('Department of Social Services (DSS) / Govt');
  const [reason, setReason] = useState('Age limit transition / statutory state institutional care');
  const [memoNumber, setMemoNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('+880 1');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalFacility = selectedShelterName;
    let finalContact = contactPerson;
    let finalPhone = contactNumber;

    if (facilityMode === 'new') {
      if (!newShelterName.trim()) return;
      finalFacility = newShelterName.trim();
      finalContact = newShelterContact.trim() || contactPerson;
      finalPhone = newShelterPhone.trim() || contactNumber;

      if (onAddNewShelter) {
        onAddNewShelter({
          name: newShelterName.trim(),
          type: 'Government Shelter (DSS/MoSW)',
          location: newShelterLocation.trim() || 'Dhaka',
          contactPerson: finalContact,
          contactPhone: finalPhone,
          notes: 'Added from child profile referral module',
        });
      }
    }

    onRefer({
      shelterName: finalFacility,
      reason: reason.trim(),
      contactPerson: finalContact,
      contactPhone: finalPhone,
      memoNumber: memoNumber.trim(),
      referralDate,
      organization: organization.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">সরকারি বা ৩য় পক্ষ পার্টনার শেল্টারে রেফার</h3>
              <p className="text-xs text-slate-500">শিশু: <strong>{child.name}</strong> ({child.id}) &bull; বর্তমান অবস্থান: <strong>{child.shelterName}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950 mb-4">
          <p className="font-bold mb-1">📋 রেফারেল ও ৩য় পক্ষ শেল্টার ব্যবস্থাপনা:</p>
          <p className="text-[11px] leading-relaxed">
            লিডোর নিজস্ব ৩টি স্থায়ী শেল্টার (কমলাপুর, কদমতলী ও পিস হোম) ব্যতিরেকে যেকোনো সরকারি কিশোর উন্নয়ন কেন্দ্র বা অন্যান্য এনজিও/পার্টনার প্রতিষ্ঠানে শিশুকে রেফার করার সময় এই তালিকা থেকে নির্বাচন করুন অথবা প্রয়োজনমতো <strong>নতুন কোনো সরকারি/পার্টনার শেল্টার সরাসরি যুক্ত করুন</strong>।
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Facility Selection Type */}
          <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setFacilityMode('existing')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                facilityMode === 'existing'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              বিদ্যমান তালিকা থেকে নির্বাচন
            </button>
            <button
              type="button"
              onClick={() => setFacilityMode('new')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                facilityMode === 'new'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + নতুন সরকারি/পার্টনার শেল্টার যুক্ত করুন
            </button>
          </div>

          {facilityMode === 'existing' ? (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">রেফারকৃত সরকারি বা পার্টনার শেল্টার *</label>
              <select
                value={selectedShelterName}
                onChange={(e) => setSelectedShelterName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium"
              >
                {existingThirdPartyShelters.map((s) => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name} ({s.location})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="font-bold text-slate-800 block text-xs">নতুন প্রতিষ্ঠানের বিস্তারিত তথ্য:</span>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">নতুন প্রতিষ্ঠানের নাম *</label>
                <input
                  type="text"
                  required={facilityMode === 'new'}
                  value={newShelterName}
                  onChange={(e) => setNewShelterName(e.target.value)}
                  placeholder="e.g. সেফ হোম ফরিদপুর / অপরাজেয় বাংলাদেশ মিরপুর শাখা"
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">অবস্থান / পূর্ণ ঠিকানা *</label>
                  <input
                    type="text"
                    required={facilityMode === 'new'}
                    value={newShelterLocation}
                    onChange={(e) => setNewShelterLocation(e.target.value)}
                    placeholder="e.g. ফরিদপুর সদর / মিরপুর-২"
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ইন-চার্জ কর্মকর্তা</label>
                  <input
                    type="text"
                    value={newShelterContact}
                    onChange={(e) => setNewShelterContact(e.target.value)}
                    placeholder="e.g. সুপারিনটেনডেন্ট"
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">অফিসিয়াল ফোন নম্বর</label>
                <input
                  type="text"
                  value={newShelterPhone}
                  onChange={(e) => setNewShelterPhone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">রেফারেলের তারিখ *</label>
              <input
                type="date"
                required
                value={referralDate}
                onChange={(e) => setReferralDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">সরকারি কর্তৃপক্ষ / রেফারকারী সংস্থা</label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Department of Social Services (DSS)"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">সরকারি অর্ডার / স্মারক / মেমো নম্বর *</label>
              <input
                type="text"
                required
                value={memoNumber}
                onChange={(e) => setMemoNumber(e.target.value)}
                placeholder="e.g. DSS/CHILD/2026/089"
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">রিসিভিং কর্মকর্তার নাম ও পদবী</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. জনাব মো. রফিকুল ইসলাম (তত্ত্বাবধায়ক)"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">রেফার করার কারণ *</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. বয়সোত্তীর্ণ স্থানান্তর / সমাজসেবা আদালতের নির্দেশ"
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">বিশেষ হ্যান্ডওভার নোট ও পর্যবেক্ষণ</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="হস্তান্তরের সময় গৃহীত ব্যবস্থা, স্বাস্থ্য সংক্রান্ত রিপোর্ট সংযুক্তির বিবরণ..."
              className="w-full p-2.5 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
            >
              রেফার নিশ্চিত করুন ও কেস স্ট্যাটাস আপডেট করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

