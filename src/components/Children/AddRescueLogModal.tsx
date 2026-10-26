import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Camera
} from 'lucide-react';
import { Child, RescueLogEntry, RescueArea } from '../../types';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../utils/calculations';

interface AddRescueLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child;
}

export const AddRescueLogModal: React.FC<AddRescueLogModalProps> = ({
  isOpen,
  onClose,
  child,
}) => {
  const { addRescueLogToChild, currentUser, language } = useApp();
  const today = getTodayDateString();

  const [rescueDate, setRescueDate] = useState(today);
  const [rescueTime, setRescueTime] = useState('12:00');
  const [area, setArea] = useState<RescueArea>('Kamalapur SUS');
  const [rescueLocation, setRescueLocation] = useState('Kamalapur Railway Station Platform 4');
  const [rescuedBy, setRescuedBy] = useState(currentUser.name);
  const [rescueTeam, setRescueTeam] = useState('Outreach Alpha Unit');
  const [reasonForRescue, setReasonForRescue] = useState('Child found again in public transit hub requiring shelter intake follow-up');
  const [conditionAtRescue, setConditionAtRescue] = useState('Appeared fatigued, unaccompanied minor');
  const [policeInvolvement, setPoliceInvolvement] = useState(false);
  const [gdNumber, setGdNumber] = useState('');
  const [policeStation, setPoliceStation] = useState('Kamalapur GRP Thana');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: Omit<RescueLogEntry, 'id' | 'recordedAt'> = {
      rescueDate,
      rescueTime,
      rescueLocation,
      area,
      rescuedBy,
      rescueTeam,
      reasonForRescue,
      conditionAtRescue,
      policeInvolvement,
      gdNumber: policeInvolvement ? gdNumber : undefined,
      policeStation: policeInvolvement ? policeStation : undefined,
      notes,
    };

    addRescueLogToChild(child.id, newLog);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-display">
                {language === 'bn' ? 'নতুন রেসকিউ অবস্থান ও লগ যুক্ত করুন' : 'Add New Rescue Location / Log'}
              </h3>
              <p className="text-xs text-slate-400">
                {child.name} &bull; <span className="font-mono">{child.id}</span> (No duplicate profile created)
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

        {/* Form Body */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              {language === 'bn' ? 'রেসকিউ লগ সফলভাবে সংরক্ষিত হয়েছে!' : 'Rescue Log Appended Successfully!'}
            </h4>
            <p className="text-xs text-slate-500">
              Child case history and timeline updated in Cloud Firestore.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
            {/* Child Header Snapshot */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-xs overflow-hidden shrink-0">
                {child.photoUrl ? (
                  <img src={child.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  child.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 text-xs truncate">{child.name}</div>
                <div className="text-[11px] text-slate-500">
                  Current Shelter: <span className="font-semibold text-slate-700">{child.shelterName}</span> &bull; Status: <span className="text-rose-600 font-semibold">{child.caseStatus}</span>
                </div>
              </div>
            </div>

            {/* Rescue Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rescue Date <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={rescueDate}
                  onChange={(e) => setRescueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rescue Time
                </label>
                <input
                  type="time"
                  value={rescueTime}
                  onChange={(e) => setRescueTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Area / SUS Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rescue Area / Hub <span className="text-rose-600">*</span>
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as RescueArea)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Kamalapur SUS">Kamalapur SUS</option>
                  <option value="Sadarghat SUS">Sadarghat SUS</option>
                  <option value="Airport SUS">Airport SUS</option>
                  <option value="Mirpur SUS">Mirpur SUS</option>
                  <option value="Tejgaon SUS">Tejgaon SUS</option>
                  <option value="Rayerbazar SUS">Rayerbazar SUS</option>
                  <option value="Shambazar SUS">Shambazar SUS</option>
                  <option value="Other">Other Area</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rescued By (Officer)
                </label>
                <input
                  type="text"
                  required
                  value={rescuedBy}
                  onChange={(e) => setRescuedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Specific Rescue Location */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Specific Location Details <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={rescueLocation}
                onChange={(e) => setRescueLocation(e.target.value)}
                placeholder="e.g. Kamalapur Railway Platform 4 or Sadarghat Pontoon 3"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            {/* Reason & Observations */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Encounter Notes / Reason for Rescue
              </label>
              <textarea
                rows={2}
                value={reasonForRescue}
                onChange={(e) => setReasonForRescue(e.target.value)}
                placeholder="Describe circumstances of this new encounter..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            {/* Police GD Checkbox */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="logPoliceCheck"
                  checked={policeInvolvement}
                  onChange={(e) => setPoliceInvolvement(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="logPoliceCheck" className="font-bold text-slate-900 cursor-pointer">
                  Police Informed & GD Filed for this encounter
                </label>
              </div>

              {policeInvolvement && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">GD Number</label>
                    <input
                      type="text"
                      value={gdNumber}
                      onChange={(e) => setGdNumber(e.target.value)}
                      placeholder="GD-1234/2026"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Police Station</label>
                    <input
                      type="text"
                      value={policeStation}
                      onChange={(e) => setPoliceStation(e.target.value)}
                      placeholder="Thana"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}
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
                <span>Save Rescue Log</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
