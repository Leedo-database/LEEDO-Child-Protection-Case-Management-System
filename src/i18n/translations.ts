export type Language = 'en' | 'bn';

export interface TranslationDict {
  [key: string]: {
    en: string;
    bn: string;
  };
}

export const TRANSLATIONS: TranslationDict = {
  // App Title & Tagline
  appTitle: {
    en: 'LEEDO Child Protection System',
    bn: 'লিডো শিশু সুরক্ষা ও কেস ম্যানেজমেন্ট সিস্টেম'
  },
  appSubtitle: {
    en: 'Humanitarian Case Management & 4R Framework',
    bn: 'মানবিক কেস ব্যবস্থাপনা ও ৪আর রূপরেখা'
  },
  officialBadge: {
    en: 'LEEDO Official Child Protection System',
    bn: 'লিডো প্রাতিষ্ঠানিক শিশু সুরক্ষা ও পুনর্বাসন ব্যবস্থা'
  },
  kamalapurHotline: {
    en: 'Kamalapur Hotline',
    bn: 'কমলাপুর জরুরি হটলাইন'
  },
  headofficeNumber: {
    en: 'Head Office',
    bn: 'হেড অফিস সচিবালয়'
  },

  // Navigation Items
  navFourR: {
    en: '4R Model (Rescue→Rebuild)',
    bn: '৪আর মডেল (রেসকিউ→রিহ্যাবিলিটেশন)'
  },
  navChildren: {
    en: 'Children / Case Directory',
    bn: 'শিশু ও কেস ডিরেক্টরি'
  },
  navSus: {
    en: 'School Under the Sky (SUS)',
    bn: 'স্কুল আন্ডার দ্য স্কাই (SUS)'
  },
  navVtc: {
    en: 'Vocational Trade Center (VTC)',
    bn: 'কারিগরি প্রশিক্ষণ কেন্দ্র (VTC)'
  },
  navShelters: {
    en: 'Shelters & Peace Home',
    bn: 'শেল্টার ও পিস হোম'
  },
  navFamilyTracing: {
    en: 'Family Tracing',
    bn: 'পরিবার সন্ধান ও পুনরেকত্রীকরণ'
  },
  navHealth: {
    en: 'Health Management',
    bn: 'স্বাস্থ্য ব্যবস্থাপনা'
  },
  navCounseling: {
    en: 'Counseling & Mental Health',
    bn: 'মানসিক স্বাস্থ্য ও কাউন্সেলিং'
  },
  navLegal: {
    en: 'Legal Aid & GD Support',
    bn: 'আইনি সহায়তা ও জিডি'
  },
  navEducation: {
    en: 'Formal Education',
    bn: 'প্রথাগত প্রাতিষ্ঠানিক শিক্ষা'
  },
  navStaff: {
    en: 'Staff & Roles (HR)',
    bn: 'কর্মী ও ভূমিকা (এইচআর)'
  },
  navAudit: {
    en: 'System Audit Logs',
    bn: 'সিস্টেম অডিট লগ'
  },
  navSettings: {
    en: 'System Settings',
    bn: 'সিস্টেম সেটিংস'
  },

  // Common Actions & Controls
  searchPlaceholder: {
    en: 'Search child ID, name, birth mark, area...',
    bn: 'শিশু আইডি, নাম, জন্মদাগ, বা এলাকা খুঁজুন...'
  },
  registerChild: {
    en: 'Register New Child',
    bn: 'নতুন শিশু নিবন্ধন'
  },
  syncFirestore: {
    en: 'Sync with Firestore',
    bn: 'ক্লাউড ফায়ারবেসে সিঙ্ক করুন'
  },
  systemManual: {
    en: 'System Manual & SOP',
    bn: 'ফিল্ড ম্যানুয়াল ও এসওপি'
  },
  online: {
    en: 'Online',
    bn: 'অনলাইন'
  },
  offline: {
    en: 'Offline (Local Safe)',
    bn: 'অফলাইন (স্থানীয় ক্যাশে নিরাপদ)'
  },
  branchFilterAll: {
    en: 'All Centers',
    bn: 'সকল কেন্দ্র'
  },
  branchFilterKamalapur: {
    en: 'Kamalapur Shelter (Cap: 30)',
    bn: 'কমলাপুর শেল্টার (ধারণক্ষমতা: ৩০)'
  },
  branchFilterKadamtali: {
    en: 'Kadamtali Shelter (Cap: 30)',
    bn: 'কদমতলী শেল্টার (ধারণক্ষমতা: ৩০)'
  },
  branchFilterPeaceHome: {
    en: 'LEEDO Peace Home (Cap: 100)',
    bn: 'লিডো পিস হোম (ধারণক্ষমতা: ১০০)'
  },
  save: {
    en: 'Save Changes',
    bn: 'পরিবর্তন সংরক্ষণ করুন'
  },
  cancel: {
    en: 'Cancel',
    bn: 'বাতিল'
  },
  close: {
    en: 'Close',
    bn: 'বন্ধ করুন'
  },
  delete: {
    en: 'Delete',
    bn: 'মুছুন'
  },
  edit: {
    en: 'Edit',
    bn: 'সম্পাদনা'
  },
  viewDetails: {
    en: 'View Details',
    bn: 'বিস্তারিত দেখুন'
  },
  filter: {
    en: 'Filter',
    bn: 'ফিল্টার'
  },
  exportCsv: {
    en: 'Export CSV',
    bn: 'সিএসভি এক্সপোর্ট'
  },
  print: {
    en: 'Print',
    bn: 'প্রিন্ট করুন'
  },
  download: {
    en: 'Download',
    bn: 'ডাউনলোড'
  },
  refresh: {
    en: 'Refresh',
    bn: 'রিফ্রেশ'
  },
  back: {
    en: 'Back',
    bn: 'ফিরে যান'
  },
  loading: {
    en: 'Loading...',
    bn: 'লোড হচ্ছে...'
  },
  actions: {
    en: 'Actions',
    bn: 'পদক্ষেপ'
  },
  status: {
    en: 'Status',
    bn: 'অবস্থা'
  },
  date: {
    en: 'Date',
    bn: 'তারিখ'
  },
  notes: {
    en: 'Notes & Remarks',
    bn: 'মন্তব্য ও নোট'
  },

  // Dashboard Cards & Metrics
  totalRegisteredChildren: {
    en: 'Total Registered Children',
    bn: 'মোট নিবন্ধিত শিশু'
  },
  activeSixWeekSafeguard: {
    en: 'Active in 6-Week Safeguard',
    bn: '৬-সপ্তাহ সুরক্ষায় সক্রিয়'
  },
  inTransitOutposts: {
    en: 'In SUS / Transit Centers',
    bn: 'এসইউএস / ট্রানজিট সেন্টারে অবস্থান'
  },
  reintegratedWithFamily: {
    en: 'Reintegrated with Family',
    bn: 'পরিবারে সফল পুনরেকত্রীকরণ'
  },
  peaceHomeSanctuary: {
    en: 'Peace Home Sanctuary',
    bn: 'পিস হোমে স্থায়ী যত্ন'
  },
  runawayAlert: {
    en: 'Left Shelter / Search Active',
    bn: 'শেল্টার ত্যাগের সতর্কতা (জিডি)'
  },
  vtcTrainees: {
    en: 'VTC Trainees (Slum & Community)',
    bn: 'কারিগরি প্রশিক্ষণার্থী (বস্তি ও সমাজ)'
  },
  susOutreachSessions: {
    en: 'School Under the Sky (SUS)',
    bn: 'স্কুল আন্ডার দ্য স্কাই (পথ সেশন)'
  },

  // Shelter Section
  sheltersOverview: {
    en: 'LEEDO Shelters & Safe Homes',
    bn: 'লিডো আশ্রয়কেন্দ্র ও নিরাপদ নিবাসসমূহ'
  },
  shelterKamalapurTitle: {
    en: 'Kamalapur Emergency Shelter (30 Beds)',
    bn: 'কমলাপুর জরুরি ট্রানজিট শেল্টার (৩০ শয্যা)'
  },
  shelterKadamtaliTitle: {
    en: 'Kadamtali Emergency Shelter (30 Beds)',
    bn: 'কদমতলী জরুরি ট্রানজিট শেল্টার (৩০ শয্যা)'
  },
  shelterPeaceHomeTitle: {
    en: 'LEEDO Peace Home Sanctuary (100 Beds)',
    bn: 'লিডো পিস হোম স্থায়ী নিরাপদ নিবাস (১০০ শয্যা)'
  },
  bedOccupancy: {
    en: 'Bed Occupancy',
    bn: 'শয্যা দখল'
  },
  availableBeds: {
    en: 'Available Beds',
    bn: 'খালি শয্যা'
  },
  occupancyRate: {
    en: 'Occupancy Rate',
    bn: 'দখলের হার'
  },
  maxStayNotice: {
    en: 'Maximum Stay: 6 Weeks Safe Home Rule',
    bn: 'সর্বোচ্চ অবস্থান: ৬-সপ্তাহের অন্তর্বর্তীকালীন নিয়ম'
  },
  peaceHomeRule: {
    en: 'Permanent Home up to 18 years for children without family',
    bn: 'পরিবারবিহীন শিশুদের জন্য ১৮ বছর পর্যন্ত স্থায়ী নিবাস'
  },

  // 4R Model
  fourRTitle: {
    en: 'LEEDO 4R Methodology Pipeline',
    bn: 'লিডো ৪আর রূপরেখা কর্মপদ্ধতি'
  },
  stepRescue: {
    en: '1. Rescue & Outreach',
    bn: '১. রেসকিউ ও পথ থেকে উদ্ধার'
  },
  stepRehab: {
    en: '2. Rehabilitation',
    bn: '২. পুনর্বাসন ও মানসিক পরিচর্যা'
  },
  stepReint: {
    en: '3. Reintegration',
    bn: '৩. পরিবারে পুনরেকত্রীকরণ'
  },
  stepRef: {
    en: '4. Referral & Sanctuary',
    bn: '৪. রেফারেল ও স্থায়ী নিবাস'
  },

  // Language switch
  languageToggleEn: {
    en: 'English',
    bn: 'English'
  },
  languageToggleBn: {
    en: 'বাংলা',
    bn: 'বাংলা'
  },
  currentLanguage: {
    en: 'Language / ভাষা',
    bn: 'ভাষা / Language'
  },

  // VTC Specific
  vtcTitle: {
    en: 'Vocational Trade Center (VTC)',
    bn: 'কারিগরি ও জীবিকায়ন প্রশিক্ষণ কেন্দ্র'
  },
  vtcSubtitle: {
    en: 'Kadamtali & Inclusive School Trade Skills for Slum & Working Youth',
    bn: 'বস্তি ও শ্রমজীবী কিশোর-কিশোরীদের বৃত্তিমূলক দক্ষতা উন্নয়ন'
  },
  tradeSewing: {
    en: 'Sewing & Tailoring',
    bn: 'দর্জিবিজ্ঞান ও সেলাই'
  },
  tradeBeauty: {
    en: 'Beautification & Parlour',
    bn: 'সৌন্দর্য চর্চা ও পার্লার'
  },
  tradeIct: {
    en: 'ICT & Computer Literacy',
    bn: 'আইসিটি ও কম্পিউটার শিক্ষা'
  },
  tradeHandicraft: {
    en: 'Handicraft & Craft Making',
    bn: 'হস্তশিল্প ও কারুশিল্প'
  },
  tradeCarpentry: {
    en: 'Carpentry & Woodwork',
    bn: 'কাঠমিস্ত্রি ও আসবাব তৈরি'
  },
  enrollStudent: {
    en: 'Enroll Vocational Trainee',
    bn: 'নতুন প্রশিক্ষণার্থী ভর্তি'
  },
  markAttendance: {
    en: 'Daily Attendance',
    bn: 'দৈনিক উপস্থিতি'
  },
  present: {
    en: 'Present',
    bn: 'উপস্থিত'
  },
  absent: {
    en: 'Absent',
    bn: 'অনুপস্থিত'
  },
  late: {
    en: 'Late',
    bn: 'দেরি'
  },

  // Staff & HR
  staffRosterTitle: {
    en: 'LEEDO Official Staff Directory',
    bn: 'লিডো অফিশিয়াল কর্মকর্তা ও কর্মচারীবৃন্দ'
  },
  verifiedStaffCount: {
    en: '55 Verified Personnel Across All Branches',
    bn: 'সকল শাখায় কর্মরত ৫৫ জন ভেরিফাইড কর্মকর্তা ও কর্মী'
  },
  roleSuperAdmin: {
    en: 'Super Admin',
    bn: 'সুপার অ্যাডমিন'
  },
  roleHeadOffice: {
    en: 'Head Office Staff',
    bn: 'হেড অফিস কর্মকর্তা'
  },
  roleShelterStaff: {
    en: 'Shelter Staff',
    bn: 'শেল্টার কর্মী'
  },
  rolePeaceHomeStaff: {
    en: 'Peace Home Staff',
    bn: 'পিস হোম কর্মী'
  },
  roleRescueWorker: {
    en: 'Rescue Worker / SUS Staff',
    bn: 'রেসকিউ কর্মী / এসইউএস স্টাফ'
  },
  roleFieldOfficer: {
    en: 'Field Officer / Case Worker',
    bn: 'ফিল্ড অফিসার / কেস ওয়ার্কার'
  },

  // Manual & SOP
  sopTitle: {
    en: 'LEEDO Child Protection Standard Operating Procedures',
    bn: 'লিডো শিশু সুরক্ষা প্রমিত কার্যপ্রণালী (এসওপি)'
  },
  zeroTolerance: {
    en: 'Zero Tolerance Policy for Child Abuse & Exploitation',
    bn: 'শিশু নির্যাতন ও শোষণে জিরো টলারেন্স নীতি'
  }
};

export const getTranslation = (key: string, lang: Language, fallback?: string): string => {
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang];
  }
  return fallback || key;
};
