import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  Activity, 
  Smile, 
  ArrowRight, 
  Shield, 
  Phone, 
  MapPin, 
  CheckCircle,
  GraduationCap,
  HeartHandshake,
  Send,
  Home,
  Clock,
  Sparkles,
  Bed,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDaysInShelter, getSixWeekAlertStatus } from '../../utils/calculations';
import { ShelterName, ShelterInfo } from '../../types';

export const ShelterManagement: React.FC = () => {
  const { 
    shelters, 
    children, 
    setSelectedChildId, 
    setActiveView, 
    currentUser,
    transferToPeaceHome,
    addNewShelter,
    updateShelter,
    deleteShelter,
    canUserPerformDelete,
    language
  } = useApp();

  // If user is assigned to a specific shelter, default to that
  const defaultShelter: ShelterName = currentUser.assignedShelter || 'Kamalapur Shelter';
  const [selectedShelterName, setSelectedShelterName] = useState<ShelterName>(defaultShelter);

  // Transfer modal state
  const [childToTransfer, setChildToTransfer] = useState<any>(null);
  const [transferRoomOrBed, setTransferRoomOrBed] = useState('Peace Home Junior Dorm - Bed 05');
  const [transferNotes, setTransferNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Edit Shelter Modal
  const [showEditShelterModal, setShowEditShelterModal] = useState(false);
  const [editLocation, setEditLocation] = useState('');
  const [editInCharge, setEditInCharge] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCapacity, setEditCapacity] = useState(40);
  const [editEmail, setEditEmail] = useState('');

  const currentShelter = shelters.find((s) => s.name === selectedShelterName) || shelters[0];
  const shelterChildren = children.filter((c) => !c.isArchived && c.shelterName === selectedShelterName && c.currentShelterStatus === 'Active Resident');

  const over6Weeks = shelterChildren.filter((c) => getSixWeekAlertStatus(c).status === 'exceeded');
  const approaching6Weeks = shelterChildren.filter((c) => getSixWeekAlertStatus(c).status === 'approaching');
  const capacity = currentShelter?.capacity || 40;
  const occupancyPercentage = Math.round((shelterChildren.length / capacity) * 100);

  const isPeaceHome = selectedShelterName === 'LEEDO Peace Home';

  const handleOpenChild = (childId: string) => {
    setSelectedChildId(childId);
    setActiveView('child-profile');
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childToTransfer) return;

    transferToPeaceHome(
      childToTransfer.id,
      transferRoomOrBed,
      transferNotes || 'Transferred to LEEDO Peace Home after exceeding 6 weeks at transitional shelter with no family traceable and no govt shelter referral.'
    );

    setSuccessMessage(`${childToTransfer.name} (${childToTransfer.id}) has been successfully transferred to LEEDO Peace Home.`);
    setChildToTransfer(null);
    setTransferNotes('');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
              Facility Management
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Transitional Shelters & Peace Home</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Shelters & Residential Care Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Managing transitional shelters (Kamalapur, Kadamtali) and LEEDO Peace Home (Long-term sanctuary up to 17y).
          </p>
        </div>

        {/* Shelter Switcher Tabs and Action Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex flex-wrap p-1 bg-slate-100 rounded-xl border border-slate-200">
            {shelters
              .filter(s => s.name === 'Kamalapur Shelter' || s.name === 'Kadamtali Shelter' || s.name === 'LEEDO Peace Home')
              .map((s) => {
                const isTabActive = selectedShelterName === s.name;
                const count = children.filter(c => !c.isArchived && c.shelterName === s.name && c.currentShelterStatus === 'Active Resident').length;

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedShelterName(s.name)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isTabActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isTabActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('referral')}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="3rd Party & Govt Shelter Referrals Registry"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'রেফারেল ও ৩য় পক্ষ শেল্টার' : 'Referral & 3rd Party Shelters'}</span>
            </button>

            <button
              onClick={() => {
                setEditLocation(currentShelter.location || '');
                setEditInCharge(currentShelter.inCharge || '');
                setEditPhone(currentShelter.phone || '');
                setEditCapacity(currentShelter.capacity || 40);
                setEditEmail(currentShelter.email || '');
                setShowEditShelterModal(true);
              }}
              className="flex items-center gap-1 px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Update Shelter Address and Information"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>{language === 'bn' ? 'তথ্য আপডেট' : 'Edit Info'}</span>
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Peace Home Special Architecture Banner */}
      {isPeaceHome ? (
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
            <Home className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Long-term Sanctuary Protocol (Up to 17 Years Old)
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              LEEDO Peace Home (শান্তিনীড়)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              When children in Kamalapur and Kadamtali transitional safe homes reach the 6-week limit and family tracing is unsuccessful or unsafe, and no government shelter referral is viable, they are formally admitted here. At LEEDO Peace Home, children reside under organizational guardianship until age 17, receiving formal schooling, vocational trades apprenticeship, psychological counseling, and family bonding.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
          <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-blue-950">Transitional Safe Home Mandate (Max 6 Weeks Stay):</strong>
            <p className="text-blue-800 mt-0.5 leading-relaxed">
              {currentShelter.name} is dedicated to rapid rescue reception, medical triage, trauma therapy, and intensive family tracing. If a child stays over 6 weeks and cannot be safely reunited or placed in a govt facility, staff can initiate transfer to <strong>LEEDO Peace Home</strong> for permanent upbringing until age 17.
            </p>
          </div>
        </div>
      )}

      {/* Shelter Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className={`w-6 h-6 ${isPeaceHome ? 'text-emerald-600' : 'text-[#E31B23]'}`} />
              <h2 className="text-lg font-bold text-slate-900 font-display">{currentShelter.name}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {currentShelter.location}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {currentShelter.phone}</span>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> In-Charge: {currentShelter.inCharge}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500">Bed Occupancy</div>
              <div className="text-lg font-bold text-slate-900">{shelterChildren.length} / {capacity} Beds</div>
            </div>
            <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-xs ${
              isPeaceHome ? 'border-emerald-200 text-emerald-800' : 'border-slate-200 text-slate-800'
            }`}>
              {occupancyPercentage}%
            </div>
          </div>
        </div>

        {/* Shelter Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Residents</span>
            <span className="text-xl font-bold text-slate-900">{shelterChildren.length}</span>
          </div>

          {!isPeaceHome ? (
            <>
              <div className={`p-3 rounded-xl border ${
                over6Weeks.length > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-100 text-slate-900'
              }`}>
                <span className="block text-[10px] uppercase font-semibold opacity-70">&gt; 6 Weeks Stay Alert</span>
                <span className="text-xl font-bold">{over6Weeks.length}</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <span className="text-amber-700 block text-[10px] uppercase font-semibold">Approaching 6 Weeks</span>
                <span className="text-xl font-bold">{approaching6Weeks.length}</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <span className="text-emerald-700 block text-[10px] uppercase font-semibold">Under 17y Guardianship</span>
                <span className="text-xl font-bold">{shelterChildren.length}</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                <span className="text-blue-700 block text-[10px] uppercase font-semibold">Vocational Training</span>
                <span className="text-xl font-bold">{shelterChildren.filter(c => c.estimatedAge >= 13).length} Enrolled</span>
              </div>
            </>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Available Beds</span>
            <span className="text-xl font-bold text-emerald-600">{Math.max(0, capacity - shelterChildren.length)}</span>
          </div>
        </div>
      </div>

      {/* 6-Week Alert Callout & Transfer to Peace Home Action */}
      {!isPeaceHome && over6Weeks.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Over 6 Weeks Stay Attention Needed ({over6Weeks.length} Resident at {currentShelter.name})</span>
            </div>
            <span className="text-[11px] bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded-full">
              Action: Refer to Peace Home
            </span>
          </div>
          <div className="text-xs text-rose-800 mb-3 leading-relaxed">
            Transitional shelter stays are capped at 6 weeks. If family tracing has proven negative and no government shelter is accessible, transfer the child to <strong>LEEDO Peace Home</strong> for long-term protection up to age 17.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {over6Weeks.map((c) => (
              <div
                key={c.id}
                className="bg-white p-3.5 rounded-xl border border-rose-200 flex items-center justify-between gap-3 hover:shadow-xs"
              >
                <div 
                  onClick={() => handleOpenChild(c.id)}
                  className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                >
                  <img src={c.photoUrl} alt={c.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate hover:text-rose-600">{c.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{c.id} &bull; {c.estimatedAge}y</div>
                    <div className="text-[11px] text-rose-600 font-semibold">{getDaysInShelter(c)} Days at {currentShelter.name}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    onClick={() => setChildToTransfer(c)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Transfer to Peace Home</span>
                  </button>
                  <button
                    onClick={() => handleOpenChild(c.id)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                  >
                    View File &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resident Children Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 font-display">
            Current Resident Children at {currentShelter.name} ({shelterChildren.length})
          </h3>
          <span className="text-xs text-slate-500">
            {isPeaceHome ? 'Enrolled up to 17y' : 'Transitional 6-wk Care'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Child ID & Name</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Room / Bed</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4">Days in Facility</th>
                <th className="py-3 px-4">{isPeaceHome ? 'Care Type' : '6-Wk Status'}</th>
                <th className="py-3 px-4">Case Worker</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {shelterChildren.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No active residents currently assigned to {currentShelter.name}.
                  </td>
                </tr>
              ) : (
                shelterChildren.map((child) => {
                  const days = getDaysInShelter(child);
                  const sixWeek = getSixWeekAlertStatus(child);

                  return (
                    <tr key={child.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img src={child.photoUrl} alt={child.name} className="w-9 h-9 rounded-lg object-cover" />
                          <div>
                            <div 
                              className="font-bold text-slate-900 cursor-pointer hover:text-rose-600" 
                              onClick={() => handleOpenChild(child.id)}
                            >
                              {child.name}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500">{child.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{child.estimatedAge}y &bull; {child.gender}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">
                          {child.roomOrBed || child.bedNumber || 'Assigned Dorm'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{child.admissionDate}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{days} Days</td>
                      <td className="py-3 px-4">
                        {isPeaceHome ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            Peace Home (Up to 17y)
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[11px] border ${sixWeek.badgeClass}`}>
                            {sixWeek.label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">{child.assignedCaseWorker}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isPeaceHome && days >= 30 && (
                            <button
                              onClick={() => setChildToTransfer(child)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              title="Refer to Peace Home"
                            >
                              Peace Home &rarr;
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenChild(child.id)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            View &rarr;
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer to Peace Home Modal */}
      {childToTransfer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-600">Long-term Sanctuary Referral</span>
                <h3 className="font-bold text-base text-slate-900">
                  Transfer to LEEDO Peace Home (Up to 17 Years)
                </h3>
              </div>
              <button
                onClick={() => setChildToTransfer(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 mb-4">
              <img
                src={childToTransfer.photoUrl}
                alt={childToTransfer.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="text-xs">
                <div className="font-bold text-slate-900">{childToTransfer.name}</div>
                <div className="font-mono text-slate-500">{childToTransfer.id} &bull; {childToTransfer.estimatedAge} years old</div>
                <div className="text-emerald-700 font-medium mt-0.5">
                  Current: {childToTransfer.shelterName} ({getDaysInShelter(childToTransfer)} days)
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Dormitory / Bed at Peace Home *
                </label>
                <input
                  type="text"
                  required
                  value={transferRoomOrBed}
                  onChange={(e) => setTransferRoomOrBed(e.target.value)}
                  placeholder="e.g. Peace Home Junior Dorm - Bed 05"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transfer Justification & Case Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Child exceeded 6 weeks transitional care; intensive tracing yielded no traceable family; govt shelter unavailable. Transferred under LEEDO Peace Home guardianship up to age 17..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                <strong>Policy Compliance:</strong> Once confirmed, this child will become an Active Resident of LEEDO Peace Home. Case status updates to <em>Peace Home Resident</em> and an entry is logged in the permanent legal timeline.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setChildToTransfer(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Home className="w-4 h-4" />
                  <span>Confirm Transfer to Peace Home</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shelter Information Modal */}
      {showEditShelterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {language === 'bn' ? 'শেল্টারের ঠিকানা ও তথ্য আপডেট' : 'Edit Shelter Details'}
                  </h3>
                  <p className="text-xs text-rose-600 font-semibold">{currentShelter.name}</p>
                </div>
              </div>
              <button onClick={() => setShowEditShelterModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateShelter(currentShelter.id, {
                  location: editLocation,
                  inCharge: editInCharge,
                  phone: editPhone,
                  capacity: Number(editCapacity) || 40,
                });
                setShowEditShelterModal(false);
                setSuccessMessage(`Information for "${currentShelter.name}" updated successfully.`);
                setTimeout(() => setSuccessMessage(''), 5000);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'ঠিকানা ও বিস্তারিত অবস্থান' : 'Address & Location'}
                </label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'দায়িত্বপ্রাপ্ত কর্মকর্তা (In-Charge)' : 'In-Charge Officer'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editInCharge}
                    onChange={(e) => setEditInCharge(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'যোগাযোগের মোবাইল নম্বর' : 'Contact Mobile'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'মোট বেড ক্যাপাসিটি' : 'Total Capacity (Beds)'}
                  </label>
                  <input
                    type="number"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Official Email'}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditShelterModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  {language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
