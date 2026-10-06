export type UserRole = 
  | 'Super Admin' 
  | 'Head Office Staff' 
  | 'Program Coordinator'
  | 'Field Officer / Case Worker' 
  | 'Shelter Staff'
  | 'Peace Home Staff'
  | 'Rescue Worker / Outpost Staff';

export type Gender = 'Male' | 'Female' | 'Other';

export type StaffStatus = 'Active' | 'Resigned / Terminated' | 'On Leave';

export type OutpostArea = 
  | 'Airport' 
  | 'Mirpur' 
  | 'Tejgaon' 
  | 'Rayer Bazar' 
  | 'Kamalapur' 
  | 'Sadarghat' 
  | 'Shambazar'
  | 'Other'
  | 'All';

export type RescueArea = 
  | 'Airport' 
  | 'Mirpur' 
  | 'Tejgaon' 
  | 'Rayer Bazar' 
  | 'Kamalapur' 
  | 'Sadarghat' 
  | 'Shambazar'
  | 'Other';

export interface StaffPermissions {
  canDelete: boolean; // Field staff cannot delete; Head Office & Super Admin have full delete access
  canEdit: boolean; // default true
  canCreateRescue: boolean; // default true
  canManageHR?: boolean; // default true for HR / Super Admin
  canDeleteAllDemoData?: boolean; // default true for HR / Super Admin
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  designation?: string;
  department?: string;
  assignedShelter?: 'Kamalapur Shelter' | 'Kadamtali Shelter' | 'LEEDO Peace Home' | 'All' | string;
  assignedArea?: string; // e.g. 'Airport', 'Mirpur', 'Tejgaon', 'Rayerbazar', 'Kamalapur', etc.
  avatarUrl?: string;
  phone?: string;
  password?: string; // Secret staff password (default: 123456)
  hasCustomPassword?: boolean; // Forced password setup on first login
  status?: StaffStatus; // If 'Resigned / Terminated', user is strictly blocked from logging in
  joinedDate?: string;
  notes?: string;
  resignationReason?: string;
  permissions?: StaffPermissions;
}

export type ThirdPartyShelterType = 'Government Shelter (DSS/MoSW)' | 'NGO / 3rd Party Safe Home' | 'Specialized Rehabilitation Center' | 'Other';

export interface ThirdPartyShelter {
  id: string;
  name: string;
  type: ThirdPartyShelterType;
  location: string;
  contactPerson?: string;
  contactPhone?: string;
  capacity?: number;
  notes?: string;
  createdAt?: string;
}

export type StaffNotificationType = 'COUNSELING_TASK' | 'NEW_RESCUE_VERIFICATION' | 'PASSWORD_ALERT' | 'GENERAL';

export interface StaffNotification {
  id: string;
  type: StaffNotificationType;
  targetRole?: UserRole;
  targetUserId?: string; // Specific user (e.g. Nargis emp-1017 or Coordinator)
  targetDesignation?: string; // 'Psycho-social Facilitator', 'Program Coordinator', etc.
  title: string;
  message: string;
  childId?: string;
  childName?: string;
  childArea?: string;
  assignedBy?: string;
  assignedByRole?: string;
  priority?: 'High' | 'Medium' | 'Urgent' | 'Normal';
  status: 'Pending' | 'In Progress' | 'Verified' | 'Completed' | 'Dismissed';
  createdAt: string;
  assignedAt?: string;
  dueDate?: string;
}

// Vocational Trade Center (VTC) Types (Kadamtali Center & Inclusive Facilities)
export type VTCTrade = 
  | 'Sewing & Tailoring' 
  | 'Beautification & Parlour' 
  | 'ICT & Computer Literacy' 
  | 'Handicraft & Craft Making' 
  | 'Carpentry & Woodwork';

export type VTCAttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
export type VTCProgressLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Certified / Job Ready' | 'Dropped Out';
export type VTCLivingStatus = 
  | 'Lives with family in community' 
  | 'Living independently / Working youth' 
  | 'Slum resident (Non-shelter)' 
  | 'Street-connected youth';

export interface VTCStudent {
  id: string; // e.g. LEEDO-VTC-2026-001
  admissionNumber: string;
  name: string;
  banglaName?: string;
  gender: Gender;
  age: number;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
  residentialAddress: string; // Lives outside in community
  livingCondition: VTCLivingStatus;
  trade: VTCTrade;
  centerLocation: 'Kadamtali Center' | 'Inclusive School';
  admissionDate: string;
  batchNumber: string;
  assignedInstructor: string;
  progressLevel: VTCProgressLevel;
  attendanceRatePercent: number; // e.g. 92%
  monthlyAttendanceCount?: number;
  totalClassesHeld?: number;
  toolSupportProvided?: boolean;
  stipendReceivedBdt?: number;
  photoUrl?: string;
  status: 'Active Student' | 'Completed / Certified' | 'Placed in Employment' | 'Discontinued';
  notes?: string;
  recentAttendance?: {
    date: string;
    status: VTCAttendanceStatus;
    note?: string;
  }[];
  createdAt: string;
}

export interface VTCDailyAttendanceRecord {
  id: string;
  date: string;
  centerLocation: string;
  trade: VTCTrade;
  instructorName: string;
  totalEnrolled: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendees: {
    studentId: string;
    studentName: string;
    status: VTCAttendanceStatus;
  }[];
  topicCoveredToday: string;
  createdAt: string;
}

export type CaseStatus =
  | 'New Rescue'
  | 'Initial Assessment'
  | 'Shelter Stay'
  | 'Family Tracing'
  | 'Family Located'
  | 'Family Assessment'
  | 'Ready for Reintegration'
  | 'Reintegrated'
  | 'Government Shelter Referral'
  | 'Referral Follow-up'
  | 'Transferred to Peace Home'
  | 'Peace Home Resident'
  | 'Left Without Notice'
  | 'Case Closed'
  | 'Transferred';

export type ShelterName = 'Kamalapur Shelter' | 'Kadamtali Shelter' | 'LEEDO Peace Home' | string;

export interface ShelterInfo {
  id: string;
  name: ShelterName;
  capacity: number;
  location: string;
  inCharge: string;
  phone: string;
  establishedDate: string;
  isLongTerm?: boolean;
  isGovtShelter?: boolean;
  shelterType?: 'LEEDO Transitional Shelter' | 'LEEDO Permanent Sanctuary' | 'Government Shelter' | 'Other Facility';
  maxAge?: number; // e.g. 17 years for Peace Home
  description?: string;
  email?: string;
}

export type SUSArea = 
  | 'Airport' 
  | 'Mirpur' 
  | 'Tejgaon' 
  | 'Rayerbazar' 
  | 'Kamalapur' 
  | 'Sadarghat' 
  | 'Shambazar';

export interface SUSSession {
  id: string;
  date: string;
  area: SUSArea | string;
  facilitator?: string;
  coFacilitator?: string;
  facilitatorName?: string;
  coFacilitatorName?: string;
  boysCount: number;
  girlsCount: number;
  totalAttendance?: number;
  totalChildrenPresent?: number;
  topicsCovered: string;
  activityCategory?: 'Basic Literacy & Numeracy' | 'Life Skills & Hygiene' | 'Child Rights & Protection' | 'Art & Creative Play' | 'Sports & Mental Health' | string;
  activityType?: string;
  mealsServed?: string;
  mealProvided?: boolean;
  mealDescription?: string;
  mealCost?: number; // in BDT ৳
  mealExpenseBdt?: number;
  voucherNumber?: string;
  billVoucherNumber?: string;
  vendorName?: string;
  billVoucherUrl?: string;
  billReceiptUrl?: string;
  sessionPhotoUrl?: string;
  vulnerableChildrenIdentified?: number;
  rescueReferralNotes?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  nextCheckupDate?: string;
  doctor: string;
  heightCm?: number;
  weightKg?: number;
  healthCondition: string;
  illness?: string;
  medication?: string;
  treatment?: string;
  vaccinationInfo?: string;
  medicalReferral?: string;
  notes?: string;
  documents?: string[];
  createdAt: string;
}

export interface CounselingRecord {
  id: string;
  date: string;
  counselor: string;
  counselingType: 'Individual' | 'Group' | 'Trauma/Crisis' | 'Behavioral' | 'Psycho-social';
  mainConcern: string;
  intervention: string;
  childResponse: string;
  recommendation: string;
  nextCounselingDate?: string;
  counselingStatus: 'In Progress' | 'Satisfactory' | 'Needs Urgent Follow-up' | 'Completed';
  confidentialNotes: string;
  createdAt: string;
}

export interface TracingAttempt {
  id: string;
  date: string;
  contactPerson: string;
  contactMethod: 'Phone Call' | 'In-Person Visit' | 'Local Police/GD' | 'Community Leader' | 'Social Media/Media' | 'NGO Partner';
  location: string;
  result: 'Success - Family Located' | 'Partial Lead' | 'No Answer / Unreachable' | 'Incorrect Address' | 'In Progress';
  notes: string;
  nextAction: string;
  staffResponsible: string;
}

export interface FamilyTracingInfo {
  tracingStartDate: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  siblingInformation?: string;
  previousAddress?: string;
  village?: string;
  unionName?: string;
  upazila?: string;
  district?: string;
  phoneNumber?: string;
  alternativeContact?: string;
  knownRelatives?: string;
  previousSchool?: string;
  tracingStatus: 'Not Started' | 'In Progress' | 'Lead Found' | 'Family Located' | 'Family Untraceable';
  attempts: TracingAttempt[];
}

export interface FamilyInfo {
  fatherOrGuardianName?: string;
  motherName?: string;
  occupation?: string;
  familySize?: number;
  incomeInformation?: string;
  address?: string;
  phoneNumber?: string;
  alternativeContact?: string;
  householdInformation?: string;
  relationshipWithChild?: string;
  childSafetyAssessment?: 'Safe for Return' | 'High Risk / Exploitation' | 'Needs Supervision' | 'Pending Assessment';
  homeVisitDate?: string;
  homeAssessment?: string;
  assessmentOfficer?: string;
  reintegrationRecommendation?: string;
  visitedAt?: string;
}

export interface ReintegrationRecord {
  reintegrationDate: string;
  familyGuardianName: string;
  relationshipWithChild: string;
  handoverPerson: string;
  handoverLocation: string;
  responsibleOfficer: string;
  familyAssessmentNotes: string;
  safetyAssessmentNotes: string;
  reintegrationPlan: string;
  gdDocumentation?: string;
  gdCopyUrl?: string;
  reintegrationPhotoUrl?: string;
  handoverDocumentUrl?: string;
  guardianSignature?: string;
  officerSignature?: string;
  witnessInformation?: string;
  additionalNotes?: string;
}

export interface PostReintegrationFollowUp {
  id: string;
  scheduleType: '7 days' | '30 days' | '3 months' | '6 months' | '12 months' | 'Custom';
  followUpDate: string;
  contactMethod: 'Home Visit' | 'Phone Call' | 'School Visit' | 'Office Visit';
  childStatus: 'Stable & Thriving' | 'Attending School' | 'Working/Struggling' | 'At Risk' | 'Relocated';
  familyStatus: string;
  educationStatus: string;
  healthStatus: string;
  safetyStatus: string;
  protectionConcerns: string;
  officerObservation: string;
  actionRequired: string;
  nextFollowUpDate?: string;
  supportingPhotoUrl?: string;
  completed: boolean;
  completedAt?: string;
  officerName: string;
}

export interface ReferralRecord {
  referralDate: string;
  referralOrganization: string;
  governmentShelterOrServiceName: string;
  location: string;
  reasonForReferral: string;
  referralOfficer: string;
  referralLetterUrl?: string;
  documents?: string[];
  admissionConfirmation?: string;
  contactPerson: string;
  contactNumber: string;
  referralStatus: 'Referred' | 'Admitted' | 'Under Review' | 'Rejected' | 'Completed';
}

export interface ReferralFollowUp {
  id: string;
  followUpDate: string;
  childStatus: string;
  isStillThere: boolean;
  healthStatus: string;
  educationStatus: string;
  familyTracingStatus: string;
  protectionConcerns: string;
  staffNotes: string;
  nextFollowUpDate?: string;
  completed: boolean;
  officerName: string;
}

export interface LeftWithoutNoticeRecord {
  date: string;
  time: string;
  lastSeenLocation: string;
  lastSeenBy: string;
  circumstances: string;
  immediateActions: string;
  familyContactDetails?: string;
  policeInformed: boolean;
  gdNumber?: string;
  gdDate?: string;
  policeStation?: string;
  gdCopyUrl?: string;
  searchActivities: string;
  currentStatus: 'Missing / Under Active Search' | 'Recovered & Returned' | 'Located with Family' | 'Closed';
  recoveryDate?: string;
  recoveryNotes?: string;
}

export interface CaseNote {
  id: string;
  date: string;
  author: string;
  authorRole: string;
  note: string;
  isConfidential: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 
    | 'Child Photo' 
    | 'Rescue Photo' 
    | 'GD Copy' 
    | 'Medical Document' 
    | 'Counseling Document' 
    | 'Family Assessment' 
    | 'Home Visit Document' 
    | 'Reintegration Photo' 
    | 'Reintegration Document' 
    | 'Referral Letter' 
    | 'Referral Confirmation' 
    | 'Follow-up Document' 
    | 'Other';
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'Rescue' | 'Shelter' | 'Health' | 'Counseling' | 'Family Tracing' | 'Reintegration' | 'Referral' | 'Alert' | 'Status Change';
  actor: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userName?: string;
  role: string;
  userRole?: string;
  action: string;
  childId?: string;
  details: string;
}

export interface Child {
  // ONE CHILD = ONE UNIQUE CHILD ID = ONE COMPLETE CASE HISTORY
  id: string; // e.g. LEEDO-2026-0001
  name: string;
  nickname?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  estimatedAge: number;
  nationality: string;
  addressIfKnown?: string;
  photoUrl: string;
  rescuePhotoUrl?: string;
  identificationInfo?: string;
  disabilityOrSpecialNeeds?: string;
  educationInformation?: string;
  otherImportantInfo?: string;

  // Rescue
  rescueDate: string;
  rescueTime: string;
  rescueLocation: string;
  area: string; // e.g., 'Kamalapur Railway Station', 'Sadarghat Launch Terminal', 'Gabtoli Bus Terminal', 'Karwan Bazar'
  rescueTeam: string;
  rescuedBy: string;
  reasonForRescue: string;
  conditionAtRescue: string;
  immediateProtectionNeeds: string;
  policeInvolvement: boolean;
  gdNumber?: string;
  gdDate?: string;
  policeStation?: string;
  gdCopyUrl?: string;
  psychologicalFirstAid?: boolean;

  // Initial Assessment
  initialAssessment?: {
    assessmentDate: string;
    assessedBy: string;
    protectionConcerns: string;
    immediateSafetyConcerns: string;
    healthConcerns: string;
    abuseOrExploitationConcerns: string;
    traffickingConcerns: string;
    disabilityNotes?: string;
    emergencyNeeds: string;
    foodClothingHygiene: boolean;
    emergencyMedicalSupport: boolean;
    psychologicalFirstAid: boolean;
    otherVulnerabilities?: string;
    assessmentNotes: string;
  };

  // Shelter
  shelterName: ShelterName;
  admissionDate: string;
  admissionTime: string;
  assignedCaseWorker: string;
  roomOrBed?: string;
  bedNumber?: string;
  currentShelterStatus: 'Active Resident' | 'Reintegrated' | 'Referred' | 'Left Without Notice' | 'Transferred' | 'Temporary Leave';
  healthStatusUponAdmission?: string;
  clothingProvided?: boolean;
  hygieneKitProvided?: boolean;
  dailyNeedsProvided?: boolean;

  // Case Status
  caseStatus: CaseStatus;

  // Sub-modules
  healthRecords: HealthRecord[];
  counselingRecords: CounselingRecord[];
  familyTracing: FamilyTracingInfo;
  familyInfo?: FamilyInfo;
  reintegration?: ReintegrationRecord;
  postReintegrationFollowUps: PostReintegrationFollowUp[];
  referral?: ReferralRecord;
  referralFollowUps: ReferralFollowUp[];
  thirdPartyReferral?: ThirdPartyReferralInfo;
  leftWithoutNotice?: LeftWithoutNoticeRecord;

  // Case notes, documents, timeline
  caseNotes: CaseNote[];
  documents: DocumentItem[];
  timeline: TimelineEvent[];

  // Meta
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
}

export interface ThirdPartyReferralInfo {
  shelterId?: string;
  shelterName: string;
  shelterType?: 'Government Shelter (DSS/MoSW)' | 'NGO / 3rd Party Safe Home' | 'Other' | 'Specialized Rehabilitation Center';
  referralDate: string;
  orderNumber?: string;
  contactPerson?: string;
  contactPhone?: string;
  reason?: string;
  followUpStatus?: string;
  officerInCharge?: string;
  notes?: string;
}

