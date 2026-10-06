import { UserRole, StaffPermissions } from '../types';

export interface DesignationConfig {
  designation: string;
  role: UserRole;
  department: string;
  permissions: StaffPermissions;
}

export const STANDARD_LEEDO_DESIGNATIONS: DesignationConfig[] = [
  {
    designation: 'Founder & Executive Director',
    role: 'Super Admin',
    department: 'Executive Management',
    permissions: {
      canDelete: true,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: true,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Director - Admin & Finance',
    role: 'Head Office Staff',
    department: 'Admin & Finance',
    permissions: {
      canDelete: true,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: true,
      canDeleteAllDemoData: true, // Kanta has wipe authority
    },
  },
  {
    designation: 'Manager HR & Admin',
    role: 'Super Admin',
    department: 'Admin & Finance',
    permissions: {
      canDelete: true,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: true,
      canDeleteAllDemoData: true, // HR Master has wipe authority
    },
  },
  {
    designation: 'Manager (Head Office & Peace Home Head)',
    role: 'Head Office Staff',
    department: 'Program & Operation',
    permissions: {
      canDelete: true,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: true,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Program Coordinator',
    role: 'Head Office Staff',
    department: 'Program & Operation',
    permissions: {
      canDelete: true,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Co-ordinator, Partnership',
    role: 'Head Office Staff',
    department: 'Program & Operation',
    permissions: {
      canDelete: true,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Monitoring Officer',
    role: 'Head Office Staff',
    department: 'Program & Operation',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Accountant',
    role: 'Head Office Staff',
    department: 'Admin & Finance',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: false,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Logistics Officer',
    role: 'Head Office Staff',
    department: 'Admin & Finance',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: false,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Psycho-social Facilitator / Counselor',
    role: 'Peace Home Staff',
    department: 'Program & Operation',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Assistant Home Super',
    role: 'Peace Home Staff',
    department: 'Program & Operation',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Senior Social Mobilizer (Incharge)',
    role: 'Rescue Worker / Outpost Staff',
    department: 'Program & Operation',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Social Mobilizer (Incharge)',
    role: 'Shelter Staff',
    department: 'Program & Operation',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Street Educator',
    role: 'Rescue Worker / Outpost Staff',
    department: 'Program & Operation',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Case Management Officer / Field Officer',
    role: 'Field Officer / Case Worker',
    department: 'Program & Operation',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Community Mobilizer',
    role: 'Field Officer / Case Worker',
    department: 'Program & Operation',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Special Educator',
    role: 'Field Officer / Case Worker',
    department: 'Program & Operation',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Vocational Trade Instructor (VTC)',
    role: 'Shelter Staff',
    department: 'Vocational Training (VTC)',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: false,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Shelter Mother',
    role: 'Shelter Staff',
    department: 'Shelter Care',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: false,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Cook',
    role: 'Shelter Staff',
    department: 'Shelter Care',
    permissions: {
      canDelete: false,
      canEdit: false,
      canCreateRescue: false,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
  {
    designation: 'Young Volunteer / Leader',
    role: 'Rescue Worker / Outpost Staff',
    department: 'Program & Operation',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  },
];

export function getRoleAndPermissionsByDesignation(designation: string): {
  role: UserRole;
  department: string;
  permissions: StaffPermissions;
} {
  const match = STANDARD_LEEDO_DESIGNATIONS.find(
    (d) => d.designation.toLowerCase() === designation.trim().toLowerCase()
  );

  if (match) {
    return {
      role: match.role,
      department: match.department,
      permissions: { ...match.permissions },
    };
  }

  // Fallback defaults
  return {
    role: 'Field Officer / Case Worker',
    department: 'Program & Operation',
    permissions: {
      canDelete: false,
      canEdit: true,
      canCreateRescue: true,
      canManageHR: false,
      canDeleteAllDemoData: false,
    },
  };
}

export function isUserHrOrKanta(user?: { email?: string; employeeId?: string; name?: string } | null): boolean {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  const empId = (user.employeeId || '').trim();
  const name = (user.name || '').toLowerCase().trim();

  return (
    email === 'hr.leedo2000@gmail.com' ||
    email === 'kanta.leedo@gmail.com' ||
    empId === '1002' ||
    empId === '1057' ||
    name.includes('kanta') ||
    name.includes('omar faruque')
  );
}
