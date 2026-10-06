import { ThirdPartyShelter, StaffNotification } from '../types';

export const INITIAL_THIRD_PARTY_SHELTERS: ThirdPartyShelter[] = [
  {
    id: 'tps-1',
    name: 'Sarkari Shishu Sadan (Tejgaon Girls, DSS)',
    type: 'Government Shelter (DSS/MoSW)',
    location: 'Tejgaon, Dhaka',
    contactPerson: 'Superintendent, DSS',
    contactPhone: '+880 1711-234567',
    notes: 'Government residential welfare home for destitute girls under Department of Social Services.',
    createdAt: '2026-01-01',
  },
  {
    id: 'tps-2',
    name: 'Sarkari Shishu Sadan (Mirpur Boys, DSS)',
    type: 'Government Shelter (DSS/MoSW)',
    location: 'Mirpur Section 1, Dhaka',
    contactPerson: 'Superintendent, DSS',
    contactPhone: '+880 1712-345678',
    notes: 'Government residential sanctuary for vulnerable boys under DSS.',
    createdAt: '2026-01-01',
  },
  {
    id: 'tps-3',
    name: 'Shishu Bikash Kendra (DSS, Tongi)',
    type: 'Government Shelter (DSS/MoSW)',
    location: 'Tongi, Gazipur',
    contactPerson: 'Deputy Director, Child Welfare',
    contactPhone: '+880 1713-456789',
    notes: 'Specialized facility for children requiring clinical growth support and psychosocial intervention.',
    createdAt: '2026-01-01',
  },
  {
    id: 'tps-4',
    name: 'Safe Home for Women & Children (MoSW, Gazipur)',
    type: 'Government Shelter (DSS/MoSW)',
    location: 'Joydebpur, Gazipur',
    contactPerson: 'Assistant Director',
    contactPhone: '+880 1714-567890',
    notes: 'Statutory safe home under Ministry of Social Welfare.',
    createdAt: '2026-01-01',
  },
  {
    id: 'tps-5',
    name: 'Aparajeyo-Bangladesh Safe Home',
    type: 'NGO / 3rd Party Safe Home',
    location: 'Mohammadpur, Dhaka',
    contactPerson: 'Shelter Program Manager',
    contactPhone: '+880 1819-876543',
    notes: 'Partner NGO transit shelter and basic schooling center.',
    createdAt: '2026-01-01',
  },
  {
    id: 'tps-6',
    name: 'Dhaka Ahsania Mission Child Protection Center',
    type: 'NGO / 3rd Party Safe Home',
    location: 'Mirpur / Dhanmondi, Dhaka',
    contactPerson: 'Case Coordinator',
    contactPhone: '+880 1912-987654',
    notes: 'Long-term shelter support and skill training for street-connected children.',
    createdAt: '2026-01-01',
  },
];

export const INITIAL_NOTIFICATIONS: StaffNotification[] = [];

