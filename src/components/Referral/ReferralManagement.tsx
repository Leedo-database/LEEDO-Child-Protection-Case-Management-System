import React, { useState } from 'react';
import { 
  Send, 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  User, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThirdPartyShelter, ThirdPartyShelterType } from '../../types';

export const ReferralManagement: React.FC = () => {
  const { 
    children, 
    thirdPartyShelters, 
    addThirdPartyShelter, 
    setSelectedChildId, 
    setActiveView, 
    language 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'referred-children' | 'shelter-directory'>('referred-children');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShelterFilter, setSelectedShelterFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Add Modal Form State
  const [newShelterName, setNewShelterName] = useState('');
  const [newShelterType, setNewShelterType] = useState<ThirdPartyShelterType>('Government Shelter (DSS/MoSW)');
  const [newShelterLocation, setNewShelterLocation] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('+880 1');
  const [newNotes, setNewNotes] = useState('');

  // All children with Referral information
  const referredChildren = children.filter((c) => {
    return c.caseStatus === 'Government Shelter Referral' || 
           c.currentShelterStatus === 'Referred' || 
           Boolean(c.thirdPartyReferral);
  });

  // Filtered children list
  const filteredChildren = referredChildren.filter((c) => {
    const refData = c.thirdPartyReferral;
    const shelterName = refData?.shelterName || c.shelterName || '';
    const matchesFilter = selectedShelterFilter === 'all' || shelterName.toLowerCase().includes(selectedShelterFilter.toLowerCase());

    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
      c.name.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term) ||
      shelterName.toLowerCase().includes(term) ||
      (refData?.orderNumber && refData.orderNumber.toLowerCase().includes(term));

    return matchesFilter && matchesSearch;
  });

  // Shelter Directory search
  const filteredShelters = thirdPartyShelters.filter((s) => {
    const term = searchTerm.toLowerCase();
    return !term || 
      s.name.toLowerCase().includes(term) || 
      s.location.toLowerCase().includes(term) || 
      (s.contactPerson && s.contactPerson.toLowerCase().includes(term));
  });

  const handleOpenChild = (childId: string) => {
    setSelectedChildId(childId);
    setActiveView('child-profile');
  };

  const handleSaveNewShelter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShelterName.trim()) return;

    const newShelter: ThirdPartyShelter = {
      id: `tps-${Date.now()}`,
      name: newShelterName.trim(),
      type: newShelterType,
      location: newShelterLocation.trim() || 'Dhaka, Bangladesh',
      contactPerson: newContactPerson.trim(),
      contactPhone: newContactPhone.trim(),
      notes: newNotes.trim(),
    };

    addThirdPartyShelter(newShelter);
    setShowAddModal(false);
    setNewShelterName('');
    setNewShelterLocation('');
    setNewContactPerson('');
    setNewContactPhone('+880 1');
    setNewNotes('');

    setSuccessMessage(
      language === 'bn' 
        ? `নতুন শেল্টার "${newShelter.name}" সফলভাবে যুক্ত হয়েছে।`
        : `New Shelter "${newShelter.name}" has been registered successfully.`
    );
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  // Helper count of children per shelter
  const getChildCountForShelter = (shelterName: string) => {
    return referredChildren.filter(c => {
      const refName = c.thirdPartyReferral?.shelterName || c.shelterName || '';
      return refName.toLowerCase().includes(shelterName.toLowerCase());
    }).length;
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
              <Send className="w-3.5 h-3.5" />
              {language === 'bn' ? 'রেফারেল ও ৩য় পক্ষ শেল্টার' : 'Referral & 3rd Party Shelters'}
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">External Placements & DSS Centers</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-display mt-0.5">
            {language === 'bn' ? '৩য় পক্ষ ও সরকারি শেল্টার রেফারেল রেজিস্ট্রি' : '3rd-Party & Government Shelter Referral Registry'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'সমাজসেবা অধিদপ্তর (DSS), সরকারি কিশোর উন্নয়ন কেন্দ্র এবং সহযোগী এনজিও শেল্টারে রেফার হওয়া শিশুদের তথ্য ও নতুন শেল্টার তালিকা।'
              : 'Managing formal legal placements to DSS Govt Homes, Juvenile Centers, and Partner NGO Safe Facilities.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? '+ নতুন শেল্টার যোগ করুন' : '+ Add New Shelter'}</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            {language === 'bn' ? 'মোট রেফারকৃত শিশু' : 'Referred Children'}
          </span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {referredChildren.length}
          </span>
          <span className="text-[11px] text-slate-500">সরকারি ও এনজিও আশ্রয়কেন্দ্রে</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            {language === 'bn' ? 'অনুমোদিত পার্টনার শেল্টার' : 'Registered Shelters'}
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {thirdPartyShelters.length}
          </span>
          <span className="text-[11px] text-slate-500">৩য় পক্ষ ও সরকারি তালিকা</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            {language === 'bn' ? 'সরকারি কেন্দ্র (DSS)' : 'DSS Govt Facilities'}
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {thirdPartyShelters.filter(s => s.type === 'Government Shelter (DSS/MoSW)').length}
          </span>
          <span className="text-[11px] text-slate-500">টঙ্গী, কোনাবাড়ী ও ছোটমণি নিবাস</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            {language === 'bn' ? 'সহযোগী এনজিও নিরাপদ আবাস' : 'Partner NGO Shelters'}
          </span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">
            {thirdPartyShelters.filter(s => s.type !== 'Government Shelter (DSS/MoSW)').length}
          </span>
          <span className="text-[11px] text-slate-500">অপরাজেয় বাংলাদেশ, আহছানিয়া ইত্যাদি</span>
        </div>
      </div>

      {/* Tabs and Filter Navigation */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Main View Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('referred-children')}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'referred-children'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'রেফারকৃত শিশুদের রেজিস্ট্রি' : 'Referred Children Registry'} ({referredChildren.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shelter-directory')}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'shelter-directory'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'শেল্টার ডিরেক্টরি' : 'Shelter Directory'} ({thirdPartyShelters.length})</span>
          </button>
        </div>

        {/* Search & Shelter Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'bn' ? 'শিশু বা শেল্টারের নাম দিয়ে খুঁজুন...' : 'Search by child, shelter, GD...'}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-blue-500"
            />
          </div>

          {activeTab === 'referred-children' && (
            <select
              value={selectedShelterFilter}
              onChange={(e) => setSelectedShelterFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-blue-500 cursor-pointer"
            >
              <option value="all">{language === 'bn' ? 'সকল শেল্টার' : 'All Shelters'}</option>
              {thirdPartyShelters.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: REFERRED CHILDREN REGISTRY */}
      {activeTab === 'referred-children' && (
        <div className="space-y-3">
          {filteredChildren.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Send className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-sm text-slate-800">
                {language === 'bn' ? 'কোন রেফারেল রেকর্ড পাওয়া যায়নি' : 'No Referral Records Found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {language === 'bn'
                  ? 'শিশুর প্রোফাইল থেকে "৩য় পক্ষ বা সরকারি শেল্টারে রেফারেল" অপশন ব্যবহার করে শিশুকে সরকারি বা পার্টনার শেল্টারে রেফার করতে পারেন।'
                  : 'Children can be referred to statutory DSS safe homes or partner shelters directly from their child case profile.'}
              </p>
            </div>
          ) : (
            filteredChildren.map((child) => {
              const ref = child.thirdPartyReferral;
              const targetShelterName = ref?.shelterName || child.shelterName || 'Government DSS Safe Home';

              return (
                <div
                  key={child.id}
                  onClick={() => handleOpenChild(child.id)}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Child Details */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={child.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=256'}
                        alt={child.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                            {child.id}
                          </span>
                          <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                            {child.name}
                          </span>
                          <span className="text-xs text-slate-400">&bull;</span>
                          <span className="text-xs text-slate-600">
                            {child.estimatedAge} {language === 'bn' ? 'বছর' : 'yrs'} ({child.gender})
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>উদ্ধার এলাকা: <strong>{child.rescueLocation}</strong></span>
                          <span>কেস ওয়ার্কার: <strong>{child.assignedCaseWorker}</strong></span>
                        </div>

                        {ref?.reason && (
                          <p className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                            "{ref.reason}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Referral Destination & Official Memo */}
                    <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl md:max-w-md w-full shrink-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          {targetShelterName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {ref?.shelterType || 'DSS Shelter'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-700">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>তারিখ: <strong>{ref?.referralDate || child.updatedAt?.split('T')[0] || '2026-03-01'}</strong></span>
                        </div>

                        {ref?.orderNumber && (
                          <div className="flex items-center gap-1 text-slate-600 font-mono">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>স্মারক: <strong>{ref.orderNumber}</strong></span>
                          </div>
                        )}

                        {ref?.contactPerson && (
                          <div className="flex items-center gap-1 text-slate-600 col-span-2">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>দায়িত্বপ্রাপ্ত: <strong>{ref.contactPerson}</strong> ({ref.contactPhone || 'N/A'})</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-blue-100 flex items-center justify-between">
                        <span className="text-[10px] text-blue-800 font-semibold">
                          রেফারেল স্ট্যাটাস: {ref?.followUpStatus || 'Active Placement'}
                        </span>
                        <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                          কেস ফাইল দেখুন
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: SHELTER DIRECTORY (3RD PARTY & GOVT FACILITIES) */}
      {activeTab === 'shelter-directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShelters.map((shelter) => {
            const childrenCount = getChildCountForShelter(shelter.name);
            const isGovt = shelter.type === 'Government Shelter (DSS/MoSW)';

            return (
              <div 
                key={shelter.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                      isGovt ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {shelter.type}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                      {childrenCount} {language === 'bn' ? 'শিশু রেফার্ড' : 'Children'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mt-2 font-display">
                    {shelter.name}
                  </h3>

                  <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{shelter.location}</span>
                    </div>

                    {shelter.contactPerson && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>ইন-চার্জ: <strong>{shelter.contactPerson}</strong></span>
                      </div>
                    )}

                    {shelter.contactPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>মোবাইল: <strong>{shelter.contactPhone}</strong></span>
                      </div>
                    )}
                  </div>

                  {shelter.notes && (
                    <p className="text-[11px] text-slate-500 mt-2.5 p-2 bg-slate-50 rounded-lg">
                      {shelter.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedShelterFilter(shelter.name);
                      setActiveTab('referred-children');
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>এই সেন্টারের শিশু দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD NEW SHELTER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {language === 'bn' ? 'নতুন ৩য় পক্ষ / সরকারি শেল্টার যুক্ত করুন' : 'Add New 3rd Party / Govt Shelter'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'bn' ? 'রেফারেল ও নিরাপদ আবাস সুবিধার ডাটাবেজ' : 'Register statutory or NGO partner facility'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveNewShelter} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'শেল্টার / প্রতিষ্ঠানের নাম *' : 'Shelter / Facility Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newShelterName}
                  onChange={(e) => setNewShelterName(e.target.value)}
                  placeholder="e.g. টঙ্গী কিশোর উন্নয়ন কেন্দ্র / সেভ দ্য চিলড্রেন সেফ হোম"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'প্রতিষ্ঠানের ধরন *' : 'Facility Category *'}
                  </label>
                  <select
                    value={newShelterType}
                    onChange={(e: any) => setNewShelterType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Government Shelter (DSS/MoSW)">Government Shelter (DSS/MoSW) (সমাজসেবা)</option>
                    <option value="NGO / 3rd Party Safe Home">NGO / 3rd Party Safe Home (এনজিও)</option>
                    <option value="Specialized Rehabilitation Center">Specialized Rehabilitation Center</option>
                    <option value="Other">Other Safe Facility</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'দায়িত্বপ্রাপ্ত কর্মকর্তা' : 'In-Charge Person'}
                  </label>
                  <input
                    type="text"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    placeholder="e.g. উপ-পরিচালক / তত্ত্বাবধায়ক"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'ঠিকানা ও অবস্থান *' : 'Full Address & Location *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newShelterLocation}
                    onChange={(e) => setNewShelterLocation(e.target.value)}
                    placeholder="e.g. Tongi, Gazipur"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'রেফারেল চুক্তি বা বিশেষ নোট' : 'MOU / Notes / Mandate'}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. সমাজসেবা অধিদপ্তরের সাথে সমঝোতা স্মারক স্বাক্ষরিত। বালক শিশুদের জন্য প্রযোজ্য।"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'শেল্টার সংরক্ষণ করুন' : 'Save Shelter'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
