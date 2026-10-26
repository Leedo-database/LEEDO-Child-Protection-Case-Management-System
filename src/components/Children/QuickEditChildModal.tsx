import React, { useState } from 'react';
import { 
  X, 
  User, 
  Edit3, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Calendar,
  Camera
} from 'lucide-react';
import { Child, CaseStatus, Gender, ShelterName } from '../../types';
import { useApp } from '../../context/AppContext';

interface QuickEditChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child;
}

export const QuickEditChildModal: React.FC<QuickEditChildModalProps> = ({
  isOpen,
  onClose,
  child,
}) => {
  const { updateChild, language } = useApp();

  const [name, setName] = useState(child.name);
  const [nickname, setNickname] = useState(child.nickname || '');
  const [estimatedAge, setEstimatedAge] = useState(child.estimatedAge);
  const [gender, setGender] = useState<Gender>(child.gender);
  const [nationality, setNationality] = useState(child.nationality || 'Bangladeshi');
  const [addressIfKnown, setAddressIfKnown] = useState(child.addressIfKnown || '');
  const [identificationInfo, setIdentificationInfo] = useState(child.identificationInfo || '');
  const [disabilityOrSpecialNeeds, setDisabilityOrSpecialNeeds] = useState(child.disabilityOrSpecialNeeds || 'None');
  const [shelterName, setShelterName] = useState<ShelterName>(child.shelterName);
  const [caseStatus, setCaseStatus] = useState<CaseStatus>(child.caseStatus);
  const [roomOrBed, setRoomOrBed] = useState(child.roomOrBed || '');
  const [assignedCaseWorker, setAssignedCaseWorker] = useState(child.assignedCaseWorker || '');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateChild(
      child.id,
      {
        name,
        nickname: nickname.trim() || undefined,
        estimatedAge,
        gender,
        nationality,
        addressIfKnown: addressIfKnown.trim() || undefined,
        identificationInfo: identificationInfo.trim() || undefined,
        disabilityOrSpecialNeeds: disabilityOrSpecialNeeds.trim() || 'None',
        shelterName,
        caseStatus,
        roomOrBed: roomOrBed.trim() || undefined,
        assignedCaseWorker: assignedCaseWorker.trim() || child.assignedCaseWorker,
      },
      `Updated profile information for child ${name} (${child.id})`
    );

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-display">
                {language === 'bn' ? 'শিশুর তথ্য আপডেট করুন' : 'Update Child Information'}
              </h3>
              <p className="text-xs text-slate-400">
                {child.name} &bull; <span className="font-mono">{child.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {language === 'bn' ? 'তথ্য সফলভাবে আপডেট হয়েছে!' : 'Child Information Updated!'}
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nickname / Known Name
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimated Age <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  required
                  value={estimatedAge}
                  onChange={(e) => setEstimatedAge(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gender <span className="text-rose-600">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Shelter <span className="text-rose-600">*</span>
                </label>
                <select
                  value={shelterName}
                  onChange={(e) => setShelterName(e.target.value as ShelterName)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Kamalapur Shelter">Kamalapur Shelter</option>
                  <option value="Kadamtali Shelter">Kadamtali Shelter</option>
                  <option value="LEEDO Peace Home">LEEDO Peace Home</option>
                  <option value="Temporary Safe Home">Temporary Safe Home</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Case Status <span className="text-rose-600">*</span>
                </label>
                <select
                  value={caseStatus}
                  onChange={(e) => setCaseStatus(e.target.value as CaseStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="New Rescue">New Rescue</option>
                  <option value="In Shelter Care">In Shelter Care</option>
                  <option value="Family Tracing">Family Tracing</option>
                  <option value="Ready for Reintegration">Ready for Reintegration</option>
                  <option value="Reintegrated">Reintegrated</option>
                  <option value="Government Shelter Referral">Government Shelter Referral</option>
                  <option value="Peace Home Resident">Peace Home Resident</option>
                  <option value="Transitioned to General Life (Age 18+)">Transitioned to General Life (Age 18+)</option>
                  <option value="Left Without Notice">Left Without Notice</option>
                  <option value="Closed Case">Closed Case</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Room / Bed Allocation
                </label>
                <input
                  type="text"
                  value={roomOrBed}
                  onChange={(e) => setRoomOrBed(e.target.value)}
                  placeholder="e.g. Room 2, Bed 4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Case Worker
                </label>
                <input
                  type="text"
                  value={assignedCaseWorker}
                  onChange={(e) => setAssignedCaseWorker(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Distinguishing Identification Marks & Features
              </label>
              <input
                type="text"
                value={identificationInfo}
                onChange={(e) => setIdentificationInfo(e.target.value)}
                placeholder="e.g. Mole on left cheek, birthmark on forearm"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Disability or Special Needs
              </label>
              <input
                type="text"
                value={disabilityOrSpecialNeeds}
                onChange={(e) => setDisabilityOrSpecialNeeds(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#c9151d] text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Updates</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
