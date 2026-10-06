import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  UserCheck, 
  Compass, 
  Home, 
  Plus, 
  Check, 
  UserX, 
  Mail, 
  Building2, 
  MapPin, 
  Phone, 
  AlertCircle,
  Calendar,
  KeyRound,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Lock,
  Unlock,
  Sliders,
  AlertTriangle,
  Edit3,
  ShieldCheck
} from 'lucide-react';
import { useApp, MASTER_HR_EMAIL } from '../../context/AppContext';
import { User, UserRole, StaffStatus, ShelterName, RescueArea, StaffPermissions } from '../../types';
import { STANDARD_LEEDO_DESIGNATIONS, getRoleAndPermissionsByDesignation } from '../../utils/staffRoleMapping';

export const UsersView: React.FC = () => {
  const { 
    users, 
    currentUser, 
    switchUserRole, 
    addUser, 
    updateUser,
    updateUserStatus, 
    deleteUser,
    wipeAllDemoData,
    updateUserPermissions,
    hasDeletePermission,
    children,
    susSessions,
    vtcStudents,
    language,
    isHrOrKantaUser,
    resetUserPassword
  } = useApp();

  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeConfirmText, setWipeConfirmText] = useState('');
  
  // Password Reset Confirmation Modal
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  // Permission editor modal
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<User | null>(null);
  const [permCanDelete, setPermCanDelete] = useState(false);
  const [permCanEdit, setPermCanEdit] = useState(true);
  const [permCanCreate, setPermCanCreate] = useState(true);
  const [permCanManageHR, setPermCanManageHR] = useState(false);

  // Staff details editor modal (Name & Mobile number updates)
  const [editingStaffUser, setEditingStaffUser] = useState<User | null>(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffPhone, setEditStaffPhone] = useState('');
  const [editStaffDesignation, setEditStaffDesignation] = useState('');
  const [editStaffDepartment, setEditStaffDepartment] = useState('');
  const [editStaffArea, setEditStaffArea] = useState('');
  const [editStaffShelter, setEditStaffShelter] = useState('');

  // New staff form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDesignation, setNewDesignation] = useState<string>(STANDARD_LEEDO_DESIGNATIONS[7]?.designation || 'Social Mobilizer');
  const [newDepartment, setNewDepartment] = useState('Outreach & Social Mobilization');
  const [newRole, setNewRole] = useState<UserRole>('Field Officer / Case Worker');
  const [newShelter, setNewShelter] = useState<ShelterName | ''>('');
  const [newArea, setNewArea] = useState<RescueArea | ''>('Airport');
  const [newPhone, setNewPhone] = useState('+880 1');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-bind Role & Department when Designation changes in Add Form
  const handleDesignationChange = (des: string) => {
    setNewDesignation(des);
    const mapping = getRoleAndPermissionsByDesignation(des);
    setNewRole(mapping.role);
    setNewDepartment(mapping.department);
    if (mapping.role === 'Shelter Staff' && !newShelter) {
      setNewShelter('Kamalapur Shelter');
    } else if (mapping.role === 'Peace Home Staff') {
      setNewShelter('LEEDO Peace Home');
    }
  };

  const filteredUsers = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    return true;
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newName.trim() || !newEmail.trim()) {
      setErrorMsg(language === 'bn' ? 'কর্মীর নাম ও ইমেইল ঠিকানা প্রদান আবশ্যক।' : 'Staff name and organizational email are required.');
      return;
    }

    // Check duplicate
    if (users.some(u => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setErrorMsg(language === 'bn' ? 'এই ইমেইল ঠিকানায় ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।' : 'A user with this email address already exists in the system.');
      return;
    }

    const roleMapping = getRoleAndPermissionsByDesignation(newDesignation);
    const calculatedRole = newRole || roleMapping.role;
    const isHeadOfficeOrAdmin = calculatedRole === 'Super Admin' || calculatedRole === 'Head Office Staff';

    const empCount = users.length + 1;
    const formattedEmpId = `EMP-${empCount < 10 ? '00' : empCount < 100 ? '0' : ''}${empCount}`;

    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      employeeId: formattedEmpId,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: calculatedRole,
      designation: newDesignation,
      department: newDepartment || roleMapping.department,
      password: '••••••••',
      hasCustomPassword: false,
      assignedShelter: newShelter ? (newShelter as ShelterName) : undefined,
      assignedArea: newArea ? (newArea as RescueArea) : undefined,
      phone: newPhone.trim(),
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256`,
      permissions: {
        ...roleMapping.permissions,
        canDelete: isHeadOfficeOrAdmin,
        canEdit: true,
        canCreateRescue: true,
        canManageHR: calculatedRole === 'Super Admin' || newDesignation.toLowerCase().includes('hr')
      }
    };

    addUser(newUser);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setSuccessMsg(
      language === 'bn'
        ? `নতুন কর্মী ${newUser.name} (${newUser.designation}) সফলভাবে যুক্ত হয়েছেন! প্রথম লগইনে ডিফল্ট পাসওয়ার্ড (123456) ব্যবহার করে ব্যক্তিগত পাসওয়ার্ড নির্ধারণ করতে হবে।`
        : `New staff member ${newUser.name} (${newUser.designation}) registered! Initial password is set to default (123456) with mandatory update on first login.`
    );
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleOpenPermissionsModal = (user: User) => {
    setEditingPermissionsUser(user);
    setPermCanDelete(hasDeletePermission(user));
    setPermCanEdit(user.permissions?.canEdit ?? true);
    setPermCanCreate(user.permissions?.canCreateRescue ?? true);
    setPermCanManageHR(user.permissions?.canManageHR ?? (user.role === 'Super Admin'));
  };

  const handleSavePermissions = () => {
    if (!editingPermissionsUser) return;
    const updatedPerms: StaffPermissions = {
      canDelete: permCanDelete,
      canEdit: permCanEdit,
      canCreateRescue: permCanCreate,
      canManageHR: permCanManageHR,
    };
    updateUserPermissions(editingPermissionsUser.id, updatedPerms);
    setEditingPermissionsUser(null);
    setSuccessMsg(
      language === 'bn' 
        ? `"${editingPermissionsUser.name}" এর অ্যাক্সেস পারমিশন সফলভাবে আপডেট করা হয়েছে!`
        : `Access permissions for "${editingPermissionsUser.name}" have been updated successfully!`
    );
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleOpenEditStaffModal = (u: User) => {
    setEditingStaffUser(u);
    setEditStaffName(u.name || '');
    setEditStaffPhone(u.phone || '');
    setEditStaffDesignation(u.designation || '');
    setEditStaffDepartment(u.department || '');
    setEditStaffArea(u.assignedArea || 'Airport');
    setEditStaffShelter(u.assignedShelter || '');
  };

  const handleSaveStaffDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffUser) return;
    
    // Auto sync role if designation changed to a standard LEEDO designation
    const mapped = editStaffDesignation ? getRoleAndPermissionsByDesignation(editStaffDesignation) : null;

    updateUser(editingStaffUser.id, {
      name: editStaffName.trim(),
      phone: editStaffPhone.trim(),
      designation: editStaffDesignation.trim(),
      department: editStaffDepartment.trim() || (mapped ? mapped.department : editingStaffUser.department),
      role: mapped ? mapped.role : editingStaffUser.role,
      assignedArea: editStaffArea as any,
      assignedShelter: editStaffShelter as any,
    });
    setEditingStaffUser(null);
    setSuccessMsg(
      language === 'bn'
        ? `"${editStaffName}" এর নাম, পদবী ও মোবাইল নম্বর সফলভাবে আপডেট হয়েছে!`
        : `Staff information for "${editStaffName}" updated successfully!`
    );
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleExecuteWipeDemoData = () => {
    if (!isHrOrKantaUser) {
      alert(language === 'bn' ? 'শুধুমাত্র এইচআর ও কান্তা আপা ডেমো ডেটা মুছতে পারেন।' : 'Only HR and Murshida Akhter Kanta are authorized to wipe demo data.');
      return;
    }
    wipeAllDemoData();
    setShowWipeModal(false);
    setWipeConfirmText('');
    setSuccessMsg(
      language === 'bn'
        ? 'সকল ডেমো শিশু কেস, এসইউএস আউটরিচ সেশন ও ভিটিসি প্রশিক্ষণার্থী সফলভাবে মুছে ফেলা হয়েছে! ডাটাবেজ এখন সম্পূর্ণরূপে পরিষ্কার।'
        : 'All demo children, SUS sessions, and VTC student records have been wiped clean! Database is now fresh.'
    );
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const handleConfirmResetPassword = () => {
    if (!resettingUser) return;
    resetUserPassword(resettingUser.id);
    const targetName = resettingUser.name;
    setResettingUser(null);
    setSuccessMsg(
      language === 'bn'
        ? `"${targetName}" এর পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে (ডিফল্ট: 123456)। পরবর্তী লগইনে তিনি নতুন পাসওয়ার্ড দিতে পারবেন।`
        : `Password for "${targetName}" reset to default (123456). They will set a new secret password upon next login.`
    );
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const handleToggleStatus = (u: User) => {
    if (u.id === currentUser.id) {
      alert(language === 'bn' ? 'আপনি নিজের সক্রিয় সেশনের অ্যাক্সেস স্থগিত করতে পারবেন না।' : 'You cannot revoke access for your own currently active session.');
      return;
    }

    if (u.status === 'Active' || !u.status) {
      const confirmRevoke = window.confirm(
        language === 'bn'
          ? `আপনি কি নিশ্চিত যে ${u.name}-কে চাকরি থেকে অব্যাহতিপ্রাপ্ত হিসেবে চিহ্নিত করতে চান? তিনি আর লগইন করতে পারবেন না।`
          : `Are you sure you want to mark ${u.name} as RESIGNED / TERMINATED? They will be immediately locked out of the application.`
      );
      if (confirmRevoke) {
        updateUserStatus(u.id, 'Resigned / Terminated', 'Staff resigned / access revoked by HR');
        setSuccessMsg(
          language === 'bn'
            ? `${u.name}-এর অ্যাকাউন্ট স্থগিত করা হয়েছে।`
            : `Access revoked for ${u.name}. This account is now blocked from logging in.`
        );
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } else {
      updateUserStatus(u.id, 'Active');
      setSuccessMsg(language === 'bn' ? `${u.name}-এর অ্যাকাউন্ট সক্রিয় করা হয়েছে।` : `Account restored to Active for ${u.name}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with HR Master Email security explanation */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E31B23]">
                {language === 'bn' ? 'মানবসম্পদ ও ভূমিকা ভিত্তিক অ্যাক্সেস কন্ট্রোল (RBAC)' : 'Human Resources & Access Control (RBAC)'}
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'bn' ? 'শিশু সুরক্ষা ও ডাটা গভর্নেন্স' : 'Child Protection Safeguarding'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-display mt-1">
              {language === 'bn' ? 'অনুমোদিত কর্মী ও নিরাপত্তা ব্যবস্থাপনা' : 'Authorized Staff & Security Management'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'bn'
                ? 'কর্মী তালিকা, পদবী, শেল্টার/আউটপোস্ট অ্যাসাইনমেন্ট এবং কার কি এক্সেস থাকবে (ডিলিট/আপডেট/ইনপুট) তা পরিচালনা করুন।'
                : 'Manage personnel credentials, shelter & outpost area assignments, role permissions, and access rules.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Wipe Demo Data Button - STRICTLY restricted to HR and Murshida Akhter Kanta */}
            {isHrOrKantaUser && (
              <button
                onClick={() => setShowWipeModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                title={language === 'bn' ? 'শুধুমাত্র এইচআর ও কান্তা আপার অনুমোদনে ডেটা মোছা যাবে' : 'Strictly restricted to HR & Murshida Akhter Kanta'}
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>{language === 'bn' ? 'ডেমো ডেটা মুছুন' : 'Wipe Demo Data'}</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#E31B23] hover:bg-[#c9151d] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'bn' ? 'নতুন কর্মী যুক্ত করুন' : 'Add New Employee'}</span>
            </button>
          </div>
        </div>

        {/* Access Rule Summary Banner */}
        <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-amber-900">
              {language === 'bn' ? 'কার্যকর অ্যাক্সেস নিয়মাবলী:' : 'Active Authorization Rules:'}
            </span>{' '}
            {language === 'bn' ? (
              <span>
                মাঠ পর্যায়ের কর্মীরা শুধুমাত্র <strong>নতুন শিশু রেসকিউ ডাটা ইনপুট</strong> ও <strong>তথ্য আপডেট</strong> করতে পারবেন, কোনো কিছু <strong>ডিলিট করতে পারবেন না</strong>। হেড অফিস ও এইচআর কর্মকর্তাদের <strong>ডিলিট সহ সম্পূর্ণ অ্যাক্সেস</strong> রয়েছে। এইচআর যেকোনো কর্মীর অ্যাক্সেস পারমিশন কাস্টমাইজ করতে পারেন।
              </span>
            ) : (
              <span>
                Field staff are restricted to <strong>new rescue inputs</strong> and <strong>updates only</strong> (deletion disabled). Head Office and HR hold <strong>full deletion and governance authority</strong>. HR administrators can configure individual permissions below.
              </span>
            )}
          </div>
        </div>

        {successMsg && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">{language === 'bn' ? 'রোল অনুযায়ী ফিল্টার:' : 'Filter by Role:'}</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium"
          >
            <option value="all">{language === 'bn' ? `সকল পদবী (${users.length})` : `All Roles (${users.length})`}</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Head Office Staff">Head Office Staff</option>
            <option value="Shelter Staff">Shelter Staff (Kamalapur / Kadamtali)</option>
            <option value="Peace Home Staff">Peace Home Staff</option>
            <option value="Rescue Worker / Outpost Staff">Rescue Worker / Outpost Staff</option>
            <option value="Field Officer / Case Worker">Field Officer / Case Worker</option>
          </select>

          <span className="text-slate-400 ml-2">|</span>

          <span className="text-slate-500 font-medium ml-2">{language === 'bn' ? 'স্ট্যাটাস:' : 'Status:'}</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium"
          >
            <option value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
            <option value="Active">{language === 'bn' ? 'সক্রিয়' : 'Active'} ({users.filter(u => u.status === 'Active' || !u.status).length})</option>
            <option value="Resigned / Terminated">{language === 'bn' ? 'অব্যাহতিপ্রাপ্ত' : 'Resigned / Terminated'} ({users.filter(u => u.status === 'Resigned / Terminated').length})</option>
            <option value="On Leave">{language === 'bn' ? 'ছুটিতে' : 'On Leave'}</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          {language === 'bn' ? 'মোট নিবন্ধিত কর্মী:' : 'Showing'} <strong>{filteredUsers.length}</strong> {language === 'bn' ? 'জন' : 'registered accounts'}
        </div>
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isCurrentUser = user.id === currentUser.id;
          const isResigned = user.status === 'Resigned / Terminated';
          const canDelete = hasDeletePermission(user);

          return (
            <div
              key={user.id}
              className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isResigned
                  ? 'border-rose-200 bg-rose-50/30 ring-1 ring-rose-200'
                  : isCurrentUser
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                      alt={user.name}
                      className={`w-12 h-12 rounded-full object-cover ring-2 ${
                        isResigned ? 'ring-rose-300 grayscale' : 'ring-slate-100'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm text-slate-900">{user.name}</h3>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">
                            {language === 'bn' ? 'আপনি' : 'You'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[180px]">{user.email}</div>
                      <div className="text-xs text-rose-700 font-semibold mt-0.5">{user.designation || user.role}</div>
                      {user.employeeId && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {user.employeeId}</div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0 ${
                      isResigned
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isResigned ? (language === 'bn' ? 'অব্যাহতিপ্রাপ্ত' : 'Terminated') : (language === 'bn' ? 'সক্রিয়' : 'Active')}
                  </span>
                </div>

                {/* RBAC Permission Badges */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md flex items-center gap-1 ${
                    canDelete ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {canDelete ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
                    <span>{canDelete ? (language === 'bn' ? 'ডিলিট: অনুমোদিত' : 'Delete: Allowed') : (language === 'bn' ? 'ডিলিট: নিষিদ্ধ (মাঠ কর্মী)' : 'Delete: Restricted')}</span>
                  </span>

                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <Check className="w-3 h-3 text-blue-600" />
                    <span>{language === 'bn' ? 'আপডেট ও রেসকিউ ইনপুট' : 'Update & Input Active'}</span>
                  </span>
                </div>

                {/* Details Section */}
                <div className="mt-3 pt-2 text-xs text-slate-600 space-y-1.5">
                  {user.assignedShelter && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{language === 'bn' ? 'শেল্টার:' : 'Shelter:'} <strong>{user.assignedShelter}</strong></span>
                    </div>
                  )}

                  {user.assignedArea && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{language === 'bn' ? 'আউটপোস্ট এরিয়া:' : 'Rescue Area:'} <strong>{user.assignedArea}</strong></span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{user.phone || '+880 1711-000000'}</span>
                  </div>

                  {user.department && (
                    <div className="text-[11px] text-slate-500">
                      {language === 'bn' ? 'বিভাগ:' : 'Dept:'} <strong>{user.department}</strong>
                    </div>
                  )}

                  {/* Password Security Status */}
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 mt-2">
                    <span className="text-slate-500 font-medium">
                      {language === 'bn' ? 'পাসওয়ার্ড স্থিতি:' : 'Password Security:'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      user.hasCustomPassword
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <KeyRound className="w-3 h-3" />
                      {user.hasCustomPassword
                        ? (language === 'bn' ? 'গোপন পাসওয়ার্ড সক্রিয়' : 'Custom Password Active')
                        : (language === 'bn' ? 'ডিফল্ট (123456)' : 'Default (123456)')}
                    </span>
                  </div>

                  {isResigned && user.resignationReason && (
                    <div className="p-2 bg-rose-100/70 rounded-lg text-rose-800 text-[11px] mt-2">
                      <strong>Note:</strong> {user.resignationReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleOpenEditStaffModal(user)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                    title={language === 'bn' ? 'নাম ও মোবাইল নম্বর আপডেট করুন' : 'Edit Name and Phone Number'}
                  >
                    <Edit3 className="w-3 h-3 text-slate-600" />
                    <span>{language === 'bn' ? 'তথ্য এডিট' : 'Edit Info'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenPermissionsModal(user)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3 text-slate-600" />
                    <span>{language === 'bn' ? 'পারমিশন' : 'Perms'}</span>
                  </button>

                  {/* Reset Password Button - Exclusively for HR and Murshida Akhter Kanta */}
                  {isHrOrKantaUser && (
                    <button
                      onClick={() => setResettingUser(user)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      title={language === 'bn' ? 'পাসওয়ার্ড রিসেট করে ১২৩৪৫৬ করুন' : 'Reset password back to 123456'}
                    >
                      <KeyRound className="w-3 h-3 text-amber-700" />
                      <span>{language === 'bn' ? 'পাসওয়ার্ড রিসেট' : 'Reset Pass'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  {!isCurrentUser && (hasDeletePermission(currentUser) || currentUser.role === 'Super Admin') && (
                    <button
                      onClick={() => {
                        const confirmed = window.confirm(
                          language === 'bn'
                            ? `আপনি কি নিশ্চিত যে "${user.name}" অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলতে চান?`
                            : `Are you sure you want to permanently delete user account "${user.name}"?`
                        );
                        if (confirmed) {
                          deleteUser(user.id);
                          setSuccessMsg(language === 'bn' ? `কর্মী প্রোফাইল স্থায়ীভাবে মুছে ফেলা হয়েছে।` : `Staff profile permanently deleted.`);
                          setTimeout(() => setSuccessMsg(''), 4000);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title={language === 'bn' ? 'অ্যাকাউন্ট ডিলিট করুন' : 'Permanently Delete User'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!isCurrentUser && !isResigned && (
                    <button
                      onClick={() => switchUserRole(user.role)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? 'টেস্ট রোল' : 'Test Role'}
                    </button>
                  )}

                  {!isCurrentUser && (
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                        isResigned
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                      }`}
                    >
                      {isResigned ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{language === 'bn' ? 'সক্রিয় করুন' : 'Restore'}</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3" />
                          <span>{language === 'bn' ? 'অব্যাহতি দিন' : 'Revoke'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Editor Modal (HR Configuration) */}
      {editingPermissionsUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'bn' ? 'কর্মী অ্যাক্সেস পারমিশন কনফিগার' : 'Configure Staff Access Permissions'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingPermissionsUser.name} &bull; {editingPermissionsUser.role}
                </p>
              </div>
              <button
                onClick={() => setEditingPermissionsUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Delete Permission Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>{language === 'bn' ? 'ডিলিট করার অনুমতি (Delete Access)' : 'Permission to Delete Records'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'bn' 
                      ? 'মাঠ কর্মীদের ক্ষেত্রে এটি বন্ধ রাখা আবশ্যক। শুধুমাত্র হেড অফিস ও অনুমোদিত কর্মকর্তাদের অনুমতি দেওয়া যায়।'
                      : 'Disabled by default for Field Staff. Grants ability to delete children cases and sessions.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={permCanDelete}
                  onChange={(e) => setPermCanDelete(e.target.checked)}
                  className="w-5 h-5 accent-[#E31B23] rounded mt-1 cursor-pointer"
                />
              </div>

              {/* Edit / Update Permission Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>{language === 'bn' ? 'তথ্য ও কেস আপডেট করার অনুমতি' : 'Permission to Update Records'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'bn' 
                      ? 'কেস নোট, স্বাস্থ্য পরীক্ষা, ট্রেসিং ও ফলোআপ আপডেট করার সুযোগ।'
                      : 'Allows editing cases, adding health records, case notes, and follow-ups.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={permCanEdit}
                  onChange={(e) => setPermCanEdit(e.target.checked)}
                  className="w-5 h-5 accent-[#E31B23] rounded mt-1 cursor-pointer"
                />
              </div>

              {/* New Rescue Data Input Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'bn' ? 'নতুন শিশু রেসকিউ ডাটা ইনপুট' : 'Register New Child / Rescues'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'bn' 
                      ? 'রাস্তা বা স্টেশন থেকে উদ্ধারকৃত নতুন শিশুর প্রোফাইল ও জিডি তথ্য অন্তর্ভুক্ত করার সুযোগ।'
                      : 'Allows creating new child rescue admissions across field areas and shelters.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={permCanCreate}
                  onChange={(e) => setPermCanCreate(e.target.checked)}
                  className="w-5 h-5 accent-[#E31B23] rounded mt-1 cursor-pointer"
                />
              </div>

              {/* HR Governance Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>{language === 'bn' ? 'এইচআর ও কর্মী নিয়ন্ত্রণ (HR Management)' : 'HR & Personnel Management'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'bn'
                      ? 'নতুন কর্মী যুক্ত করা, বহিষ্কার করা ও অ্যাক্সেস পারমিশন পরিবর্তন করার সুযোগ।'
                      : 'Allows enrolling new staff, modifying roles, and wiping demo data.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={permCanManageHR}
                  onChange={(e) => setPermCanManageHR(e.target.checked)}
                  className="w-5 h-5 accent-[#E31B23] rounded mt-1 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPermissionsUser(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {language === 'bn' ? 'পারমিশন সংরক্ষণ করুন' : 'Save Access Rules'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wipe Demo Data Confirmation Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'bn' ? 'সকল ডেমো ডেটা মুছে ফেলুন' : 'Wipe All Demo Data'}
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  {language === 'bn' ? 'এইচআর কেন্দ্রীয় ক্লিন-আপ ব্যবস্থা' : 'HR Centralized Clean-up Utility'}
                </p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-xs text-rose-900 space-y-2 mb-4">
              <p className="font-semibold">
                {language === 'bn'
                  ? 'এই অপারেশনের মাধ্যমে নিচের সকল পরীক্ষামূলক ডেমো ডেটা মুছে ফেলা হবে:'
                  : 'This action will permanently delete all demo records from memory & storage:'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                <li>{language === 'bn' ? `নিবন্ধিত ডেমো শিশু সংখ্যা:` : 'Demo Children Cases:'} <strong>{children.length}</strong></li>
                <li>{language === 'bn' ? `এসইউএস স্ট্রিট আউটরিচ সেশন:` : 'SUS Outreach Sessions:'} <strong>{susSessions.length}</strong></li>
                <li>{language === 'bn' ? `ভিটিসি কারিগরি প্রশিক্ষণার্থী:` : 'VTC Vocational Students:'} <strong>{vtcStudents.length}</strong></li>
              </ul>
              <p className="text-[11px] text-slate-600 pt-1">
                {language === 'bn'
                  ? '⚠️ নোট: আপনার কর্মচারীদের অ্যাকাউন্ট ও শেল্টারের সেটআপ অক্ষত থাকবে। কেবল শিশুদের রেকর্ড খালি হয়ে নতুন বাস্তব কেস এন্ট্রির জন্য প্রস্তুত হবে।'
                  : '⚠️ Note: Staff accounts and shelter setups will remain intact. The child database will be completely clean for live rescue intake.'}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'নিশ্চিত করতে "DELETE" টাইপ করুন:' : 'Type "DELETE" to confirm:'}
              </label>
              <input
                type="text"
                value={wipeConfirmText}
                onChange={(e) => setWipeConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowWipeModal(false);
                  setWipeConfirmText('');
                }}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={wipeConfirmText !== 'DELETE'}
                onClick={handleExecuteWipeDemoData}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  wipeConfirmText === 'DELETE'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'সব ডেমো ডেটা মুছুন' : 'Wipe Clean Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'bn' ? 'নতুন কর্মী / কর্মকর্তা অন্তর্ভুক্তকরণ' : 'Add New Staff / Authorized Personnel'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? 'অন্তর্ভুক্ত কর্মী মাস্টার ইমেইল ওটিপির মাধ্যমে প্রবেশ করতে পারবেন' : 'Enrolled personnel can log in via Master Email OTP'}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs mb-4">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'প্রাতিষ্ঠানিক ইমেইল অ্যাড্রেস *' : 'Organizational Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tanvir.leedo@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Verification OTP will be confirmed via central master email ({MASTER_HR_EMAIL}).
                </p>
              </div>

              {/* Dynamic Designation Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'অফিসিয়াল পদবী (Designation) *' : 'Official Designation *'}
                </label>
                <select
                  value={newDesignation}
                  onChange={(e) => handleDesignationChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {STANDARD_LEEDO_DESIGNATIONS.map((cfg) => (
                    <option key={cfg.designation} value={cfg.designation}>{cfg.designation}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  {language === 'bn'
                    ? '✨ পদবী নির্বাচন করলে স্বয়ংক্রিয়ভাবে উপযুক্ত ভূমিকা (Role), বিভাগ (Department) ও এক্সেস পারমিশন নির্ধারিত হয়ে যাবে।'
                    : '✨ Selecting designation automatically configures role, department & permission matrix.'}
                </p>
              </div>

              {/* Auto-derived Role & Department Preview */}
              <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-medium">নির্ধারিত রোল (Auto Role):</span>
                  <span className="font-bold text-slate-900">{newRole}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">বিভাগ (Department):</span>
                  <span className="font-bold text-slate-900">{newDepartment}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'ভূমিকা সামঞ্জস্য (Role Override, যদি প্রয়োজন হয়)' : 'Role / Access Level Override'}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Super Admin">Super Admin (Full Organization Access)</option>
                  <option value="Head Office Staff">Head Office Staff (Full Delete & Update)</option>
                  <option value="Shelter Staff">Shelter Staff (Transitional Shelter - Update Only)</option>
                  <option value="Peace Home Staff">Peace Home Staff (Peace Home Care - Update Only)</option>
                  <option value="Rescue Worker / Outpost Staff">Rescue Worker / Outpost Staff (Field Rescue - Input & Update Only)</option>
                  <option value="Field Officer / Case Worker">Field Officer / Case Worker (Field Operations - Input & Update Only)</option>
                </select>
              </div>

              {/* Conditional Shelter / Outpost Area assignments */}
              {(newRole === 'Shelter Staff' || newRole === 'Peace Home Staff') && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Shelter Facility</label>
                  <select
                    value={newShelter}
                    onChange={(e) => setNewShelter(e.target.value as ShelterName)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="">Select Facility...</option>
                    <option value="Kamalapur Shelter">Kamalapur Shelter (Cap: 30)</option>
                    <option value="Kadamtali Shelter">Kadamtali Shelter (Cap: 30)</option>
                    <option value="LEEDO Peace Home">LEEDO Peace Home (Cap: 100)</option>
                  </select>
                </div>
              )}

              {(newRole === 'Rescue Worker / Outpost Staff' || newRole === 'Field Officer / Case Worker') && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Outreach Area / Outpost</label>
                  <select
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value as RescueArea)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Airport">Airport Outpost</option>
                    <option value="Mirpur">Mirpur Outpost</option>
                    <option value="Tejgaon">Tejgaon Outpost</option>
                    <option value="Rayerbazar">Rayerbazar Outpost</option>
                    <option value="Kamalapur">Kamalapur Station Outpost</option>
                    <option value="Kadamtali">Kadamtali Outpost</option>
                    <option value="Sadarghat">Sadarghat Launch Terminal</option>
                    <option value="Shambazar">Shambazar Area</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  placeholder="+880 1..."
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
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
                  className="px-4 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white rounded-xl font-bold cursor-pointer"
                >
                  {language === 'bn' ? 'কর্মী অনুমোদন করুন' : 'Enroll & Authorize Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Details Modal (Update Name & Mobile Number) */}
      {editingStaffUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {language === 'bn' ? 'কর্মী তথ্য ও যোগাযোগ নম্বর আপডেট' : 'Update Staff Information & Phone'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {editingStaffUser.employeeId || editingStaffUser.id} &bull; {editingStaffUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaffUser(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveStaffDetails} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'কর্মীর পূর্ণ নাম *' : 'Staff Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editStaffName}
                  onChange={(e) => setEditStaffName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Phone Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={editStaffPhone}
                  onChange={(e) => setEditStaffPhone(e.target.value)}
                  placeholder="+880 1711-..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'অফিসিয়াল পদবী (Designation)' : 'Official Designation'}
                  </label>
                  <input
                    type="text"
                    value={editStaffDesignation}
                    onChange={(e) => setEditStaffDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'বিভাগ (Department)' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={editStaffDepartment}
                    onChange={(e) => setEditStaffDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'অ্যাসাইনড আউটপোস্ট / এরিয়া' : 'Assigned Outpost Area'}
                  </label>
                  <select
                    value={editStaffArea}
                    onChange={(e) => setEditStaffArea(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Airport">Airport Outpost</option>
                    <option value="Mirpur">Mirpur Outpost</option>
                    <option value="Tejgaon">Tejgaon Outpost</option>
                    <option value="Rayer Bazar">Rayer Bazar Outpost</option>
                    <option value="Kamalapur">Kamalapur Station Outpost</option>
                    <option value="Sadarghat">Sadarghat Launch Terminal</option>
                    <option value="Shambazar">Shambazar Area</option>
                    <option value="Other">Other Location</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'অ্যাসাইনড শেল্টার' : 'Assigned Shelter'}
                  </label>
                  <select
                    value={editStaffShelter}
                    onChange={(e) => setEditStaffShelter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="">None / Not Applicable</option>
                    <option value="Kamalapur Shelter">Kamalapur Shelter</option>
                    <option value="Kadamtali Shelter">Kadamtali Shelter</option>
                    <option value="LEEDO Peace Home">LEEDO Peace Home</option>
                    <option value="All">All Facilities</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStaffUser(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E31B23] hover:bg-[#c9151d] text-white rounded-xl font-bold cursor-pointer"
                >
                  {language === 'bn' ? 'তথ্য সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Confirmation Modal (HR & Kanta Only) */}
      {resettingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'bn' ? 'স্টাফ পাসওয়ার্ড রিসেট' : 'Reset Staff Password'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? 'এইচআর ও কান্তা আপা কর্তৃক অনুমোদিত নিরাপত্তা ব্যবস্থা' : 'Authorized HR Security Action'}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2 mb-4">
              <p className="font-semibold">
                {language === 'bn'
                  ? `আপনি কি নিশ্চিত যে "${resettingUser.name}" (${resettingUser.employeeId || resettingUser.id}) এর পাসওয়ার্ড রিসেট করে ডিফল্ট "123456" এ ফিরিয়ে দিতে চান?`
                  : `Are you sure you want to reset the password for "${resettingUser.name}" (${resettingUser.employeeId || resettingUser.id}) back to the default "123456"?`}
              </p>
              <p className="text-[11px] text-amber-800">
                {language === 'bn'
                  ? '⚠️ রিসেটের পর এই কর্মী পরবর্তী লগইনে প্রবেশ করার সাথে সাথে বাধ্যতামূলকভাবে নতুন গোপন ব্যক্তিগত পাসওয়ার্ড নির্ধারণ করতে পারবেন।'
                  : '⚠️ Upon next login, this staff member will be required to create a new secret password.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResettingUser(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPassword}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'পাসওয়ার্ড রিসেট করুন' : 'Confirm Password Reset'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
