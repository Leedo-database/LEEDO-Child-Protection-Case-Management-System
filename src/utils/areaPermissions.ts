import { User, Child } from '../types';

export const LEEDO_OPERATIONAL_AREAS = [
  'Airport SUS',
  'Mirpur SUS',
  'Tejgaon SUS',
  'Rayerbazar SUS',
  'Kamalapur SUS',
  'Kamalapur Shelter',
  'Sadarghat SUS',
  'Shambazar SUS',
  'Kadamtali Shelter',
  'Vocational',
  'LEEDO Peace Home',
  'Head Office / Central',
] as const;

export type LeedoArea = typeof LEEDO_OPERATIONAL_AREAS[number];

/**
 * Returns normalized array of all assigned areas for a user
 */
export function getUserAssignedAreasList(user?: User | null): string[] {
  if (!user) return [];
  const list: string[] = [];

  // If user has explicit assignedAreas array, this is the authoritative source
  if (Array.isArray(user.assignedAreas) && user.assignedAreas.length > 0) {
    user.assignedAreas.forEach((a) => {
      if (a && typeof a === 'string' && !list.includes(a.trim())) {
        list.push(a.trim());
      }
    });
    return list;
  }

  // Fallback to assignedArea string (can be comma-separated)
  if (user.assignedArea) {
    const parts = user.assignedArea.split(',').map((s) => s.trim()).filter(Boolean);
    parts.forEach((p) => {
      if (!list.includes(p)) list.push(p);
    });
    if (list.length > 0) {
      return list;
    }
  }

  // Fallback to assignedShelter if no specific areas are configured
  if (user.assignedShelter && user.assignedShelter !== 'All') {
    const s = user.assignedShelter.trim();
    if (!list.includes(s)) list.push(s);
  }

  return list;
}

/**
 * Program Coordinator, Super Admin, and Head Office Staff have full view & update rights across all areas:
 * Airport SUS, Mirpur SUS, Tejgaon SUS, Rayerbazar SUS, Kamalapur Hub, Kadamtali Hub
 */
export function isFullAccessUser(user?: User | null): boolean {
  if (!user) return false;
  if (
    user.role === 'Super Admin' || 
    user.role === 'Head Office Staff' || 
    user.role === 'Program Coordinator'
  ) {
    return true;
  }
  const des = (user.designation || '').toLowerCase();
  const role = (user.role || '').toLowerCase();
  if (
    des.includes('coordinator') ||
    role.includes('coordinator') ||
    des.includes('director') ||
    des.includes('founder') ||
    des.includes('ed') ||
    des.includes('head office') ||
    des.includes('general manager') ||
    des.includes('hr')
  ) {
    return true;
  }
  return false;
}

/**
 * Check if user can access a specific shelter facility:
 * - Kamalapur: Staff assigned to Kamalapur SUS CANNOT access Kamalapur Shelter.
 *              Staff assigned to Kamalapur Shelter CAN access Kamalapur Shelter.
 * - Kadamtali: Staff assigned to Sadarghat SUS, Shambazar SUS, or Vocational CANNOT access Kadamtali Shelter.
 *              Staff assigned to Kadamtali Shelter CAN access Kadamtali Shelter.
 * - Program Coordinator / Head Office / Super Admin have full access.
 */
export function canUserAccessShelter(user: User, shelterName: string): boolean {
  if (isFullAccessUser(user)) return true;

  const assigned = getUserAssignedAreasList(user);

  if (shelterName.includes('Kamalapur')) {
    // Kamalapur SUS staff CANNOT access Kamalapur Shelter!
    // Only users with Kamalapur Shelter in their assigned areas can access
    return assigned.some((a) => {
      const lower = a.toLowerCase();
      return lower === 'kamalapur shelter' || (lower.includes('kamalapur') && !lower.includes('sus') && user.role === 'Shelter Staff');
    });
  }

  if (shelterName.includes('Kadamtali')) {
    // Sadarghat SUS, Shambazar SUS, Vocational CANNOT access Kadamtali Shelter!
    // Only users with Kadamtali Shelter in their assigned areas can access
    return assigned.some((a) => {
      const lower = a.toLowerCase();
      return lower === 'kadamtali shelter' || (lower.includes('kadamtali') && !lower.includes('sus') && !lower.includes('vocational') && user.role === 'Shelter Staff');
    });
  }

  if (shelterName.includes('Peace Home')) {
    return (
      user.role === 'Peace Home Staff' ||
      assigned.some((a) => a.toLowerCase().includes('peace home'))
    );
  }

  return false;
}

/**
 * Check if user can access an open-air SUS (School Under the Sky) area:
 * - Kamalapur SUS: Accessible by Kamalapur SUS staff, and ALSO accessible by Kamalapur Shelter staff
 * - Sadarghat SUS: Accessible by Sadarghat SUS staff, and ALSO accessible by Kadamtali Shelter staff
 * - Shambazar SUS: Accessible by Shambazar SUS staff, and ALSO accessible by Kadamtali Shelter staff
 * - Airport SUS, Mirpur SUS, Tejgaon SUS, Rayerbazar SUS: Accessible by their respective assigned staff
 * - Program Coordinator: Full view & update across all SUS areas
 */
export function canUserAccessSUSArea(user: User, susArea: string): boolean {
  if (isFullAccessUser(user)) return true;

  const assigned = getUserAssignedAreasList(user);
  const target = susArea.toLowerCase();

  // Kamalapur SUS:
  // - Kamalapur SUS staff can access
  // - Kamalapur Shelter staff CAN also access ("kamalapur shelter kamalapur SUS er sob kisu dekte parbe")
  if (target.includes('kamalapur')) {
    return assigned.some((a) => {
      const l = a.toLowerCase();
      return l.includes('kamalapur sus') || l.includes('kamalapur shelter') || l === 'kamalapur';
    });
  }

  // Sadarghat SUS:
  // - Sadarghat SUS staff can access
  // - Kadamtali Shelter staff CAN also access ("kadamtali Shelter shadarghat sus, shambazar sus, vocational & shelter er sob kisu dekte parbe")
  // - Shambazar SUS and Vocational staff CANNOT access Sadarghat SUS
  if (target.includes('sadarghat')) {
    return assigned.some((a) => {
      const l = a.toLowerCase();
      return l.includes('sadarghat') || l.includes('kadamtali shelter');
    });
  }

  // Shambazar SUS:
  // - Shambazar SUS staff can access
  // - Kadamtali Shelter staff CAN also access
  // - Sadarghat SUS and Vocational staff CANNOT access Shambazar SUS
  if (target.includes('shambazar') || target.includes('shambaar')) {
    return assigned.some((a) => {
      const l = a.toLowerCase();
      return l.includes('shambazar') || l.includes('shambaar') || l.includes('kadamtali shelter');
    });
  }

  // Airport SUS
  if (target.includes('airport')) {
    return assigned.some((a) => a.toLowerCase().includes('airport'));
  }

  // Mirpur SUS
  if (target.includes('mirpur')) {
    return assigned.some((a) => a.toLowerCase().includes('mirpur'));
  }

  // Tejgaon SUS
  if (target.includes('tejgaon')) {
    return assigned.some((a) => a.toLowerCase().includes('tejgaon'));
  }

  // Rayerbazar SUS
  if (target.includes('rayerbazar') || target.includes('rayer bazar')) {
    return assigned.some((a) => a.toLowerCase().includes('rayerbazar') || a.toLowerCase().includes('rayer bazar'));
  }

  return false;
}

/**
 * Check if user can access Vocational Trade Center (VTC):
 * - VTC / Vocational assigned staff can access
 * - Kadamtali Shelter staff CAN access ("kadamtali Shelter ... vocational & shelter er sob kisu dekte parbe")
 * - Sadarghat SUS and Shambazar SUS staff CANNOT access Vocational
 * - Program Coordinator / Head Office / Super Admin can access
 */
export function canUserAccessVTC(user: User): boolean {
  if (isFullAccessUser(user)) return true;

  const assigned = getUserAssignedAreasList(user);

  // Kadamtali Shelter staff gets full access to Vocational
  if (assigned.some((a) => a.toLowerCase().includes('kadamtali shelter'))) {
    return true;
  }

  // Vocational assigned staff
  if (assigned.some((a) => a.toLowerCase().includes('vocational') || a.toLowerCase().includes('vtc'))) {
    return true;
  }

  const des = (user.designation || '').toLowerCase();
  if (
    des.includes('instructor') ||
    des.includes('trade') ||
    des.includes('sewing') ||
    des.includes('carpentry') ||
    des.includes('beautification')
  ) {
    return true;
  }

  return false;
}

/**
 * Check if user can access a specific Child case record based on hub & area hierarchy
 */
export function canUserAccessChild(user: User, child: Child): boolean {
  if (isFullAccessUser(user)) return true;

  const childShelter = child.shelterName || '';
  const childArea = (child.area || child.rescueLocation || '').toLowerCase();
  const assigned = getUserAssignedAreasList(user);

  // If child is currently in a Shelter, strict shelter access rules apply:
  // - Kamalapur SUS staff CANNOT see Kamalapur Shelter children!
  // - Sadarghat SUS, Shambazar SUS, and Vocational staff CANNOT see Kadamtali Shelter children!
  if (child.currentShelterStatus === 'Active Resident' || (childShelter && childShelter !== 'None')) {
    if (childShelter.includes('Kamalapur')) {
      return canUserAccessShelter(user, 'Kamalapur Shelter');
    }

    if (childShelter.includes('Kadamtali')) {
      return canUserAccessShelter(user, 'Kadamtali Shelter');
    }

    if (childShelter.includes('Peace Home') || child.caseStatus === 'Peace Home Resident') {
      return canUserAccessShelter(user, 'LEEDO Peace Home');
    }
  }

  // Direct worker attribution for non-shelter / outreach field cases
  if (
    (child.assignedCaseWorker && child.assignedCaseWorker.toLowerCase().includes(user.name.toLowerCase())) ||
    (child.rescuedBy && child.rescuedBy.toLowerCase().includes(user.name.toLowerCase()))
  ) {
    return true;
  }

  // Outreach / Rescue area checking
  if (childArea.includes('kamalapur')) {
    return canUserAccessSUSArea(user, 'Kamalapur');
  }

  if (childArea.includes('sadarghat')) {
    return canUserAccessSUSArea(user, 'Sadarghat');
  }

  if (childArea.includes('shambazar') || childArea.includes('shambaar')) {
    return canUserAccessSUSArea(user, 'Shambazar');
  }

  if (childArea.includes('airport')) {
    return canUserAccessSUSArea(user, 'Airport');
  }

  if (childArea.includes('mirpur')) {
    return canUserAccessSUSArea(user, 'Mirpur');
  }

  if (childArea.includes('tejgaon')) {
    return canUserAccessSUSArea(user, 'Tejgaon');
  }

  if (childArea.includes('rayerbazar') || childArea.includes('rayer bazar')) {
    return canUserAccessSUSArea(user, 'Rayerbazar');
  }

  // Match any user assigned area substring
  return assigned.some((a) => {
    const areaKey = a.replace(/SUS|Shelter/gi, '').trim().toLowerCase();
    return areaKey && childArea.includes(areaKey);
  });
}
