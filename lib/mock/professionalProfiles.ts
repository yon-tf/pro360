export type ProfileStatus = "pending_introduction" | "updated_introduction" | "imported";

export interface ProfessionalProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileStatus: ProfileStatus;
  published: boolean;
  trainingComplete: boolean;
  demoAccount: boolean;
  leftDate: string | null;
  country: string;
  dialCode: string;
  phoneNumber: string;
  locationState: string;
  city: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankSwiftCode?: string;
  payoutCurrency?: string;
  profession: string;
  licenseNumber: string;
  licenseExpiry: string;
  languages: string[];
  biography: string;
  specialisations: string[];
  therapyApproaches: string[];
  treatmentExperiences: string[];
  checkInTimes: string[];
  leaveStartDate?: string;
  leaveEndDate?: string;
  leaveReason?: string;
  maximumClients: number;
  activeClients: number;
  translations: Record<string, TranslationDraft>;
  createdAt: string;
  updatedAt: string;
}

export interface TranslationDraft {
  biography: string;
  specialisations: string[];
  therapyApproaches: string[];
  treatmentExperiences: string[];
  complete: boolean;
}

export const SUPPORTED_LANGUAGES = [
  "Indonesian",
  "Malaysian",
  "Chinese Simplified",
  "Chinese Traditional (Taiwan)",
  "Chinese Traditional (Hong Kong)",
  "Tagalog",
  "Thai",
  "Vietnamese",
  "Khmer",
] as const;

export const SPECIALISATION_OPTIONS = [
  "Adults",
  "Youth",
  "Underaged",
  "LGBTQIA+",
  "Differently-abled individuals",
  "Working professionals",
  "Couples",
  "Families",
  "Elderly",
  "Expats",
];

export const THERAPY_APPROACH_OPTIONS = [
  "Cognitive Behavioral Therapy (CBT)",
  "Dialectical Behavior Therapy (DBT)",
  "Acceptance and Commitment Therapy (ACT)",
  "Mindfulness-based approach",
  "Problem-solving technique",
  "Eye Movement Desensitisation and Reprocessing (EMDR)",
  "Person-centred therapy",
  "Psychodynamic therapy",
  "Solution-focused brief therapy",
  "Motivational interviewing",
  "Art therapy",
  "Play therapy",
];

export const ADDITIONAL_EXPERIENCE_OPTIONS = [
  "Person with disabilities",
  "Gender and sexual minorities",
  "Substance abuse",
  "Eating disorders",
  "Under medications for mental health conditions",
];

export const LANGUAGE_OPTIONS = [
  "English",
  "Mandarin",
  "Malay",
  "Tamil",
  "Cantonese",
  "Hokkien",
  "Bahasa Indonesia",
  "Tagalog",
  "Thai",
  "Vietnamese",
  "Khmer",
];

export const COUNTRY_LIST = [
  { value: "Singapore", dialCode: "+65" },
  { value: "Malaysia", dialCode: "+60" },
  { value: "Indonesia", dialCode: "+62" },
  { value: "Philippines", dialCode: "+63" },
  { value: "Thailand", dialCode: "+66" },
  { value: "Vietnam", dialCode: "+84" },
  { value: "Cambodia", dialCode: "+855" },
  { value: "Hong Kong", dialCode: "+852" },
  { value: "Taiwan", dialCode: "+886" },
];

export const STATES_BY_COUNTRY: Record<string, string[]> = {
  Singapore: ["Central", "North", "North-East", "East", "West", "South"],
  Malaysia: ["Kuala Lumpur", "Selangor", "Penang", "Johor", "Sabah", "Sarawak", "Perak", "Melaka"],
  Indonesia: ["Jakarta", "Bali", "West Java", "Central Java", "East Java", "Yogyakarta"],
  Philippines: ["Metro Manila", "Cebu", "Davao", "Iloilo", "Laguna"],
  Thailand: ["Bangkok", "Chiang Mai", "Phuket", "Nonthaburi", "Khon Kaen"],
  Vietnam: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hai Phong", "Can Tho"],
  Cambodia: ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville"],
  "Hong Kong": ["Hong Kong Island", "Kowloon", "New Territories"],
  Taiwan: ["Taipei", "Kaohsiung", "Taichung", "Tainan", "Hsinchu"],
};

export const PROFESSION_OPTIONS = [
  "Clinical Psychologist",
  "Counsellor",
  "Psychotherapist",
  "Social Worker",
  "Psychiatrist",
  "Art Therapist",
  "Play Therapist",
  "Marriage & Family Therapist",
];

export const CHECK_IN_TIME_OPTIONS = [
  "Morning (8AM–12PM)",
  "Afternoon (12PM–4PM)",
  "Evening (4PM–8PM)",
  "Night (8PM–11PM)",
];

export const PAYOUT_CURRENCY_OPTIONS = [
  { value: "SGD", label: "SGD – Singapore Dollar" },
  { value: "USD", label: "USD – US Dollar" },
  { value: "MYR", label: "MYR – Malaysian Ringgit" },
  { value: "IDR", label: "IDR – Indonesian Rupiah" },
  { value: "PHP", label: "PHP – Philippine Peso" },
  { value: "THB", label: "THB – Thai Baht" },
  { value: "VND", label: "VND – Vietnamese Dong" },
  { value: "INR", label: "INR – Indian Rupee" },
  { value: "AUD", label: "AUD – Australian Dollar" },
  { value: "GBP", label: "GBP – British Pound" },
  { value: "EUR", label: "EUR – Euro" },
  { value: "JPY", label: "JPY – Japanese Yen" },
  { value: "HKD", label: "HKD – Hong Kong Dollar" },
];

/**
 * Maps TFP numeric id ("1", "2", …) to the professional ID used in profiles.
 * Format: PRO + 3 random digits + year + 3-digit sequence.
 */
export const TFP_TO_PRO_ID: Record<string, string> = {
  "1": "PRO7862025001",
  "2": "PRO4312025002",
  "3": "PRO5952025003",
  "4": "PRO2182025004",
  "5": "PRO6472025005",
  "6": "PRO3742025006",
  "7": "PRO8092025007",
  "8": "PRO1532025008",
  "9": "PRO6412025009",
  "10": "PRO2932025010",
  "11": "PRO5172025011",
  "12": "PRO8452025012",
};

export function tfpIdToProId(tfpId: string): string {
  const normalized = tfpId.startsWith("tfp-") ? String(Number(tfpId.slice(4))) : tfpId;
  return TFP_TO_PRO_ID[normalized] ?? `PRO${normalized}`;
}

export const professionalProfiles: ProfessionalProfile[] = [
  {
    id: "PRO7862025001",
    firstName: "Benjamin",
    lastName: "Kow Meng Ah",
    email: "benjamin.kow@example.com",
    profileStatus: "updated_introduction",
    published: true,
    trainingComplete: true,
    demoAccount: false,
    leftDate: null,
    country: "Singapore",
    dialCode: "+65",
    phoneNumber: "9123 4567",
    locationState: "Central",
    city: "Singapore",
    profession: "Clinical Psychologist",
    licenseNumber: "PSY-45892",
    licenseExpiry: "2026-03-15",
    languages: ["English", "Mandarin"],
    biography:
      "Benjamin Kow Meng Ah is a clinical psychologist with over 12 years of experience specialising in anxiety, depression, and trauma. He integrates evidence-based approaches such as CBT and mindfulness to help clients navigate challenges and build resilience. He is passionate about making mental health accessible and culturally sensitive.",
    specialisations: ["Adults", "Working professionals", "LGBTQIA+"],
    therapyApproaches: ["Cognitive Behavioral Therapy (CBT)", "Mindfulness-based approach", "Acceptance and Commitment Therapy (ACT)"],
    treatmentExperiences: ["Person with disabilities", "Gender and sexual minorities", "Under medications for mental health conditions"],
    checkInTimes: ["Morning (8AM–12PM)", "Afternoon (12PM–4PM)"],
    maximumClients: 25,
    activeClients: 22,
    translations: {
      Indonesian: {
        biography:
          "Benjamin Kow Meng Ah adalah psikolog klinis dengan pengalaman lebih dari 12 tahun yang mengkhususkan diri dalam kecemasan, depresi, dan trauma.",
        specialisations: ["Dewasa", "Profesional bekerja", "LGBTQIA+"],
        therapyApproaches: ["CBT", "Pendekatan berbasis mindfulness", "ACT"],
        treatmentExperiences: ["Person with disabilities", "Gender and sexual minorities", "Under medications for mental health conditions"],
        complete: true,
      },
      Malaysian: {
        biography:
          "Benjamin Kow Meng Ah ialah ahli psikologi klinikal dengan pengalaman melebihi 12 tahun pakar dalam kebimbangan, kemurungan dan trauma.",
        specialisations: ["Dewasa", "Profesional bekerja", "LGBTQIA+"],
        therapyApproaches: ["CBT", "Pendekatan berasaskan kesedaran", "ACT"],
        treatmentExperiences: ["Person with disabilities", "Gender and sexual minorities", "Substance abuse"],
        complete: true,
      },
      "Chinese Simplified": {
        biography:
          "Benjamin Kow Meng Ah 博士是一名临床心理学家，拥有超过12年的经验，专注于焦虑、抑郁和创伤。",
        specialisations: ["成人", "职场人士", "LGBTQIA+"],
        therapyApproaches: ["认知行为疗法", "正念疗法", "接受与承诺疗法"],
        treatmentExperiences: ["Person with disabilities", "Eating disorders", "Under medications for mental health conditions"],
        complete: true,
      },
    },
    createdAt: "2024-06-15T10:00:00Z",
    updatedAt: "2026-02-10T14:30:00Z",
  },
  {
    id: "PRO4312025002",
    firstName: "Sarah",
    lastName: "Lim",
    email: "sarah.lim@example.com",
    profileStatus: "updated_introduction",
    published: true,
    trainingComplete: true,
    demoAccount: false,
    leftDate: null,
    country: "Singapore",
    dialCode: "+65",
    phoneNumber: "9234 5678",
    locationState: "East",
    city: "Singapore",
    profession: "Clinical Psychologist",
    licenseNumber: "PSY-55102",
    licenseExpiry: "2026-05-20",
    languages: ["English", "Mandarin", "Cantonese"],
    biography:
      "Sarah Lim specialises in helping adults and youth navigate anxiety, depression, and relationship challenges. She uses a combination of CBT, DBT, and person-centred therapy to create a safe, empathetic space for healing.",
    specialisations: ["Adults", "Youth", "Couples"],
    therapyApproaches: ["Cognitive Behavioral Therapy (CBT)", "Dialectical Behavior Therapy (DBT)", "Person-centred therapy"],
    treatmentExperiences: ["Gender and sexual minorities", "Substance abuse", "Eating disorders"],
    checkInTimes: ["Morning (8AM–12PM)", "Evening (4PM–8PM)"],
    maximumClients: 20,
    activeClients: 18,
    translations: {
      Indonesian: {
        biography: "Sarah Lim mengkhususkan diri dalam membantu orang dewasa dan remaja mengatasi kecemasan, depresi, dan tantangan hubungan.",
        specialisations: ["Dewasa", "Remaja", "Pasangan"],
        therapyApproaches: ["CBT", "DBT", "Terapi berpusat pada orang"],
        treatmentExperiences: ["Gender and sexual minorities", "Substance abuse", "Eating disorders"],
        complete: true,
      },
    },
    createdAt: "2024-08-20T09:00:00Z",
    updatedAt: "2026-02-08T11:00:00Z",
  },
  {
    id: "PRO5952025003",
    firstName: "James",
    lastName: "Wong",
    email: "james.wong@example.com",
    profileStatus: "imported",
    published: true,
    trainingComplete: true,
    demoAccount: false,
    leftDate: null,
    country: "Singapore",
    dialCode: "+65",
    phoneNumber: "9345 6789",
    locationState: "West",
    city: "Singapore",
    profession: "Counsellor",
    licenseNumber: "PSY-66123",
    licenseExpiry: "2026-08-10",
    languages: ["English", "Malay"],
    biography:
      "James Wong is a counsellor focused on trauma-informed care and mindfulness-based interventions. He works primarily with youth and differently-abled individuals.",
    specialisations: ["Youth", "Differently-abled individuals"],
    therapyApproaches: ["Mindfulness-based approach", "Eye Movement Desensitisation and Reprocessing (EMDR)", "Solution-focused brief therapy"],
    treatmentExperiences: ["Person with disabilities", "Substance abuse", "Under medications for mental health conditions"],
    checkInTimes: ["Afternoon (12PM–4PM)", "Evening (4PM–8PM)"],
    maximumClients: 15,
    activeClients: 12,
    translations: {},
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2026-01-28T16:00:00Z",
  },
  {
    id: "PRO2182025004",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@example.com",
    profileStatus: "updated_introduction",
    published: true,
    trainingComplete: true,
    demoAccount: false,
    leftDate: null,
    country: "Singapore",
    dialCode: "+65",
    phoneNumber: "9456 7890",
    locationState: "Central",
    city: "Singapore",
    profession: "Clinical Psychologist",
    licenseNumber: "PSY-77134",
    licenseExpiry: "2026-04-25",
    languages: ["English", "Tamil", "Mandarin"],
    biography:
      "Priya Sharma is a clinical psychologist with a passion for cross-cultural therapy. She specialises in working with families, couples, and working professionals dealing with burnout, anxiety, and interpersonal challenges.",
    specialisations: ["Families", "Couples", "Working professionals"],
    therapyApproaches: ["Psychodynamic therapy", "Cognitive Behavioral Therapy (CBT)", "Motivational interviewing"],
    treatmentExperiences: ["Gender and sexual minorities", "Substance abuse", "Under medications for mental health conditions"],
    checkInTimes: ["Morning (8AM–12PM)"],
    maximumClients: 22,
    activeClients: 20,
    translations: {
      Thai: {
        biography: "ดร. ปริยา ชาร์มา เป็นนักจิตวิทยาคลินิกที่มีความหลงใหลในการบำบัดข้ามวัฒนธรรม",
        specialisations: ["ครอบครัว", "คู่รัก", "มืออาชีพ"],
        therapyApproaches: ["จิตพลวัต", "CBT", "การสัมภาษณ์เชิงสร้างแรงจูงใจ"],
        treatmentExperiences: ["Gender and sexual minorities", "Substance abuse", "Under medications for mental health conditions"],
        complete: true,
      },
      Vietnamese: {
        biography: "Tiến sĩ Priya Sharma là nhà tâm lý lâm sàng với niềm đam mê trị liệu đa văn hóa.",
        specialisations: ["Gia đình", "Cặp đôi", "Chuyên gia làm việc"],
        therapyApproaches: ["Tâm lý động lực", "CBT", "Phỏng vấn tạo động lực"],
        treatmentExperiences: ["Gender and sexual minorities", "Substance abuse", "Under medications for mental health conditions"],
        complete: true,
      },
    },
    createdAt: "2024-09-05T11:00:00Z",
    updatedAt: "2026-02-12T09:00:00Z",
  },
  {
    id: "PRO6472025005",
    firstName: "Michael",
    lastName: "Tan",
    email: "michael.tan@example.com",
    profileStatus: "pending_introduction",
    published: false,
    trainingComplete: false,
    demoAccount: true,
    leftDate: null,
    country: "Malaysia",
    dialCode: "+60",
    phoneNumber: "1234 5678",
    locationState: "Kuala Lumpur",
    city: "Kuala Lumpur",
    profession: "Counsellor",
    licenseNumber: "PSY-88145",
    licenseExpiry: "2026-07-01",
    languages: ["English", "Malay", "Bahasa Indonesia"],
    biography:
      "Michael Tan is a newly onboarded counsellor with experience in youth mental health and school-based interventions. He is currently completing his training modules.",
    specialisations: ["Youth", "Underaged"],
    therapyApproaches: ["Cognitive Behavioral Therapy (CBT)", "Play therapy", "Art therapy"],
    treatmentExperiences: ["Person with disabilities", "Eating disorders"],
    checkInTimes: ["Morning (8AM–12PM)", "Afternoon (12PM–4PM)", "Evening (4PM–8PM)"],
    maximumClients: 10,
    activeClients: 0,
    translations: {},
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-02-15T08:00:00Z",
  },
  {
    id: "PRO3742025006",
    firstName: "Emily",
    lastName: "Chen",
    email: "emily.chen@example.com",
    profileStatus: "updated_introduction",
    published: true,
    trainingComplete: true,
    demoAccount: false,
    leftDate: null,
    country: "Singapore",
    dialCode: "+65",
    phoneNumber: "9678 9012",
    locationState: "North",
    city: "Singapore",
    profession: "Clinical Psychologist",
    licenseNumber: "PSY-99156",
    licenseExpiry: "2026-09-15",
    languages: ["English", "Mandarin", "Hokkien"],
    biography:
      "Emily Chen is a clinical psychologist specialising in elderly care and end-of-life support. She integrates mindfulness and psychodynamic approaches to address grief, loss, and existential concerns.",
    specialisations: ["Elderly", "Adults", "Families"],
    therapyApproaches: ["Mindfulness-based approach", "Psychodynamic therapy", "Person-centred therapy"],
    treatmentExperiences: ["Under medications for mental health conditions", "Person with disabilities"],
    checkInTimes: ["Morning (8AM–12PM)", "Afternoon (12PM–4PM)"],
    maximumClients: 18,
    activeClients: 16,
    translations: {
      "Chinese Simplified": {
        biography: "陈医生是一名临床心理学家，专注于老年护理和生命末期支持。",
        specialisations: ["老年人", "成人", "家庭"],
        therapyApproaches: ["正念疗法", "心理动力疗法", "以人为中心疗法"],
        treatmentExperiences: ["Under medications for mental health conditions", "Person with disabilities"],
        complete: true,
      },
      "Chinese Traditional (Taiwan)": {
        biography: "陳醫師是一位臨床心理學家，專注於老年照護和生命末期支持。",
        specialisations: ["老年人", "成人", "家庭"],
        therapyApproaches: ["正念療法", "心理動力療法", "以人為中心療法"],
        treatmentExperiences: ["Under medications for mental health conditions", "Person with disabilities"],
        complete: true,
      },
      "Chinese Traditional (Hong Kong)": {
        biography: "陳醫生係一位臨床心理學家，專注於長者護理同生命末期支援。",
        specialisations: ["長者", "成人", "家庭"],
        therapyApproaches: ["正念療法", "心理動力療法", "以人為中心療法"],
        treatmentExperiences: ["Under medications for mental health conditions", "Person with disabilities"],
        complete: true,
      },
      Tagalog: {
        biography: "Si Emily Chen ay isang clinical psychologist na nakatuon sa pangangalaga sa matatanda.",
        specialisations: ["Matatanda", "Adulto", "Pamilya"],
        therapyApproaches: ["Mindfulness", "Psychodynamic", "Person-centred"],
        treatmentExperiences: ["Under medications for mental health conditions", "Person with disabilities"],
        complete: true,
      },
    },
    createdAt: "2024-07-01T09:00:00Z",
    updatedAt: "2026-02-14T10:00:00Z",
  },
  {
    id: "PRO8092025007",
    firstName: "Alex",
    lastName: "Ng",
    email: "alex.ng@example.com",
    profileStatus: "imported",
    published: true,
    trainingComplete: false,
    demoAccount: false,
    leftDate: null,
    country: "Singapore",
    dialCode: "+65",
    phoneNumber: "9789 0123",
    locationState: "South",
    city: "Singapore",
    profession: "Counsellor",
    licenseNumber: "PSY-10167",
    licenseExpiry: "2026-11-20",
    languages: ["English"],
    biography:
      "Alex Ng is a counsellor focusing on expat mental health and cross-cultural adjustment. He supports individuals navigating relocation, identity, and belonging challenges.",
    specialisations: ["Expats", "Adults", "Working professionals"],
    therapyApproaches: ["Acceptance and Commitment Therapy (ACT)", "Solution-focused brief therapy", "Motivational interviewing"],
    treatmentExperiences: ["Gender and sexual minorities", "Substance abuse"],
    checkInTimes: ["Evening (4PM–8PM)", "Night (8PM–11PM)"],
    maximumClients: 15,
    activeClients: 8,
    translations: {},
    createdAt: "2025-03-15T08:00:00Z",
    updatedAt: "2026-02-10T12:00:00Z",
  },
  {
    id: "PRO1532025008",
    firstName: "Nina",
    lastName: "Rahman",
    email: "nina.rahman@example.com",
    profileStatus: "updated_introduction",
    published: false,
    trainingComplete: true,
    demoAccount: false,
    leftDate: "2026-01-31",
    country: "Singapore",
    dialCode: "+65",
    phoneNumber: "9890 1234",
    locationState: "Central",
    city: "Singapore",
    profession: "Clinical Psychologist",
    licenseNumber: "PSY-11178",
    licenseExpiry: "2026-06-30",
    languages: ["English", "Malay", "Mandarin"],
    biography:
      "Nina Rahman was a clinical psychologist with expertise in adolescent mental health and school-based programmes. She has transitioned out of the platform.",
    specialisations: ["Youth", "Underaged", "Families"],
    therapyApproaches: ["Cognitive Behavioral Therapy (CBT)", "Dialectical Behavior Therapy (DBT)", "Play therapy"],
    treatmentExperiences: ["Eating disorders", "Under medications for mental health conditions", "Gender and sexual minorities"],
    checkInTimes: ["Morning (8AM–12PM)"],
    maximumClients: 20,
    activeClients: 0,
    translations: {
      Malaysian: {
        biography: "Nina Rahman ialah ahli psikologi klinikal dengan kepakaran dalam kesihatan mental remaja.",
        specialisations: ["Remaja", "Bawah umur", "Keluarga"],
        therapyApproaches: ["CBT", "DBT", "Terapi bermain"],
        treatmentExperiences: ["Eating disorders", "Under medications for mental health conditions", "Gender and sexual minorities"],
        complete: true,
      },
      Indonesian: {
        biography: "Nina Rahman adalah psikolog klinis yang ahli dalam kesehatan mental remaja.",
        specialisations: ["Remaja", "Di bawah umur", "Keluarga"],
        therapyApproaches: ["CBT", "DBT", "Terapi bermain"],
        treatmentExperiences: ["Eating disorders", "Under medications for mental health conditions", "Gender and sexual minorities"],
        complete: true,
      },
    },
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: "2026-01-31T09:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

export type CredentialType = "Contract" | "License" | "Training Certificate" | "Other";
export type CredentialStatus = "Valid" | "Expiring soon" | "Expired";

export interface CredentialRecord {
  id: string;
  professionalId: string;
  type: CredentialType;
  name: string;
  issuingBody: string;
  startDate: string | null;
  expiryDate: string | null;
  status: CredentialStatus;
  notes: string;
  fileName: string | null;
  archived: boolean;
  previousVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialHistoryEntry {
  id: string;
  credentialId: string;
  action: "created" | "renewed" | "edited" | "archived";
  date: string;
  note: string;
}

export const CREDENTIAL_EXPIRY_THRESHOLD_DAYS = 60;

export function calculateCredentialStatus(expiryDate: string | null): CredentialStatus {
  if (!expiryDate) return "Valid";
  const now = new Date();
  const expiry = new Date(expiryDate);
  if (expiry < now) return "Expired";
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= CREDENTIAL_EXPIRY_THRESHOLD_DAYS) return "Expiring soon";
  return "Valid";
}

export function getCredentialSummary(professionalId: string) {
  const creds = credentialRecords.filter((c) => c.professionalId === professionalId && !c.archived);
  const contracts = creds.filter((c) => c.type === "Contract");
  const licenses = creds.filter((c) => c.type === "License");
  const certificates = creds.filter((c) => c.type === "Training Certificate");
  function countByStatus(list: CredentialRecord[]) {
    return {
      valid: list.filter((c) => c.status === "Valid").length,
      expiringSoon: list.filter((c) => c.status === "Expiring soon").length,
      expired: list.filter((c) => c.status === "Expired").length,
    };
  }
  return {
    contracts: countByStatus(contracts),
    licenses: countByStatus(licenses),
    certificates: countByStatus(certificates),
    hasExpired: creds.some((c) => c.status === "Expired"),
  };
}

export const credentialRecords: CredentialRecord[] = [
  // ---- PRO7862025001: Benjamin Kow Meng Ah ----
  {
    id: "CRED-001",
    professionalId: "PRO7862025001",
    type: "Contract",
    name: "Service Agreement 2025–2026",
    issuingBody: "Pro360 Platform",
    startDate: "2025-01-01",
    expiryDate: "2026-12-31",
    status: "Valid",
    notes: "Standard annual service agreement.",
    fileName: "pro001_service_agreement_2025.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-12-15T10:00:00Z",
  },
  {
    id: "CRED-002",
    professionalId: "PRO7862025001",
    type: "License",
    name: "Clinical Psychology License",
    issuingBody: "Singapore Psychological Society",
    startDate: "2024-03-15",
    expiryDate: "2026-03-15",
    status: "Expiring soon",
    notes: "Renewal application submitted.",
    fileName: "pro001_clinical_license.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2024-03-20T08:00:00Z",
    updatedAt: "2026-02-01T11:00:00Z",
  },
  {
    id: "CRED-003",
    professionalId: "PRO7862025001",
    type: "Training Certificate",
    name: "CBT Advanced Certification",
    issuingBody: "Beck Institute",
    startDate: "2024-06-01",
    expiryDate: "2027-06-01",
    status: "Valid",
    notes: "",
    fileName: "pro001_cbt_advanced.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: "2025-06-01T10:00:00Z",
  },
  {
    id: "CRED-004",
    professionalId: "PRO7862025001",
    type: "Training Certificate",
    name: "Trauma-Informed Care Certificate",
    issuingBody: "National Council for Behavioral Health",
    startDate: "2023-01-15",
    expiryDate: "2025-12-31",
    status: "Expired",
    notes: "Needs renewal before next audit cycle.",
    fileName: "pro001_trauma_care.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2023-01-15T09:00:00Z",
    updatedAt: "2025-12-31T23:59:00Z",
  },

  // ---- PRO4312025002: Sarah Lim ----
  {
    id: "CRED-005",
    professionalId: "PRO4312025002",
    type: "Contract",
    name: "Platform Partner Agreement",
    issuingBody: "Pro360 Platform",
    startDate: "2025-07-01",
    expiryDate: "2026-06-30",
    status: "Valid",
    notes: "",
    fileName: "pro002_partner_agreement.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2025-07-01T09:00:00Z",
    updatedAt: "2025-10-15T14:00:00Z",
  },
  {
    id: "CRED-006",
    professionalId: "PRO4312025002",
    type: "License",
    name: "Clinical Psychology License",
    issuingBody: "Singapore Psychological Society",
    startDate: "2024-03-25",
    expiryDate: "2026-03-25",
    status: "Expiring soon",
    notes: "Renewal in progress.",
    fileName: "pro002_clinical_license.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2024-03-25T08:00:00Z",
    updatedAt: "2026-02-05T10:00:00Z",
  },
  {
    id: "CRED-007",
    professionalId: "PRO4312025002",
    type: "Training Certificate",
    name: "DBT Practitioner Certification",
    issuingBody: "Behavioral Tech Institute",
    startDate: "2025-01-15",
    expiryDate: "2027-01-15",
    status: "Valid",
    notes: "",
    fileName: "pro002_dbt_cert.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "CRED-008",
    professionalId: "PRO4312025002",
    type: "Contract",
    name: "Service Agreement 2024–2025",
    issuingBody: "Pro360 Platform",
    startDate: "2024-01-01",
    expiryDate: "2025-09-30",
    status: "Expired",
    notes: "Superseded by Partner Agreement.",
    fileName: "pro002_service_agreement_2024.pdf",
    archived: true,
    previousVersionId: null,
    createdAt: "2024-01-05T09:00:00Z",
    updatedAt: "2025-10-01T08:00:00Z",
  },

  // ---- PRO5952025003: James Wong ----
  {
    id: "CRED-009",
    professionalId: "PRO5952025003",
    type: "Contract",
    name: "Service Agreement 2025–2026",
    issuingBody: "Pro360 Platform",
    startDate: "2025-01-01",
    expiryDate: "2026-11-30",
    status: "Valid",
    notes: "",
    fileName: "pro003_service_agreement_2025.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-10T08:00:00Z",
  },
  {
    id: "CRED-010",
    professionalId: "PRO5952025003",
    type: "License",
    name: "Counselling License",
    issuingBody: "Singapore Association for Counselling",
    startDate: "2024-08-10",
    expiryDate: "2026-08-10",
    status: "Valid",
    notes: "",
    fileName: "pro003_counselling_license.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2024-08-10T09:00:00Z",
    updatedAt: "2024-08-10T09:00:00Z",
  },
  {
    id: "CRED-011",
    professionalId: "PRO5952025003",
    type: "Training Certificate",
    name: "EMDR Practitioner Certificate",
    issuingBody: "EMDR International Association",
    startDate: "2024-04-10",
    expiryDate: "2026-04-10",
    status: "Expiring soon",
    notes: "Renewal workshop booked for March 2026.",
    fileName: "pro003_emdr_cert.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2024-04-10T10:00:00Z",
    updatedAt: "2026-01-20T14:00:00Z",
  },

  // ---- PRO2182025004: Priya Sharma ----
  {
    id: "CRED-012",
    professionalId: "PRO2182025004",
    type: "Contract",
    name: "Service Agreement 2025–2026",
    issuingBody: "Pro360 Platform",
    startDate: "2025-01-01",
    expiryDate: "2026-09-30",
    status: "Valid",
    notes: "",
    fileName: "pro004_service_agreement_2025.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2025-01-05T09:00:00Z",
    updatedAt: "2025-01-05T09:00:00Z",
  },
  {
    id: "CRED-013",
    professionalId: "PRO2182025004",
    type: "License",
    name: "Clinical Psychology License",
    issuingBody: "Singapore Psychological Society",
    startDate: "2024-04-01",
    expiryDate: "2026-04-01",
    status: "Expiring soon",
    notes: "Renewal documents prepared.",
    fileName: "pro004_clinical_license.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2024-04-01T08:00:00Z",
    updatedAt: "2026-02-10T09:00:00Z",
  },
  {
    id: "CRED-014",
    professionalId: "PRO2182025004",
    type: "Training Certificate",
    name: "Motivational Interviewing Certificate",
    issuingBody: "Motivational Interviewing Network of Trainers",
    startDate: "2023-11-15",
    expiryDate: "2025-11-15",
    status: "Expired",
    notes: "Re-certification pending approval.",
    fileName: "pro004_mi_cert.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2023-11-15T10:00:00Z",
    updatedAt: "2025-11-16T08:00:00Z",
  },
  {
    id: "CRED-015",
    professionalId: "PRO2182025004",
    type: "Training Certificate",
    name: "Cross-Cultural Therapy Training",
    issuingBody: "International Association for Cross-Cultural Psychology",
    startDate: "2025-03-01",
    expiryDate: "2027-03-01",
    status: "Valid",
    notes: "",
    fileName: "pro004_cross_cultural.pdf",
    archived: false,
    previousVersionId: null,
    createdAt: "2025-03-01T10:00:00Z",
    updatedAt: "2025-03-01T10:00:00Z",
  },
];

export const credentialHistory: CredentialHistoryEntry[] = [
  // CRED-001
  {
    id: "CHIST-001",
    credentialId: "CRED-001",
    action: "created",
    date: "2025-01-10T09:00:00Z",
    note: "Initial service agreement uploaded.",
  },
  {
    id: "CHIST-002",
    credentialId: "CRED-001",
    action: "renewed",
    date: "2025-12-15T10:00:00Z",
    note: "Agreement renewed for 2025–2026 term.",
  },
  // CRED-002
  {
    id: "CHIST-003",
    credentialId: "CRED-002",
    action: "created",
    date: "2024-03-20T08:00:00Z",
    note: "License document uploaded after verification.",
  },
  // CRED-003
  {
    id: "CHIST-004",
    credentialId: "CRED-003",
    action: "created",
    date: "2024-06-01T10:00:00Z",
    note: "CBT Advanced Certification uploaded.",
  },
  {
    id: "CHIST-005",
    credentialId: "CRED-003",
    action: "renewed",
    date: "2025-06-01T10:00:00Z",
    note: "Certification renewed for another 2 years.",
  },
  // CRED-004
  {
    id: "CHIST-006",
    credentialId: "CRED-004",
    action: "created",
    date: "2023-01-15T09:00:00Z",
    note: "Trauma-Informed Care Certificate uploaded.",
  },
  {
    id: "CHIST-007",
    credentialId: "CRED-004",
    action: "edited",
    date: "2025-12-31T23:59:00Z",
    note: "Marked as expired; awaiting renewal.",
  },
  // CRED-005
  {
    id: "CHIST-008",
    credentialId: "CRED-005",
    action: "created",
    date: "2025-07-01T09:00:00Z",
    note: "Platform Partner Agreement uploaded.",
  },
  {
    id: "CHIST-009",
    credentialId: "CRED-005",
    action: "edited",
    date: "2025-10-15T14:00:00Z",
    note: "Updated payment terms in agreement.",
  },
  // CRED-006
  {
    id: "CHIST-010",
    credentialId: "CRED-006",
    action: "created",
    date: "2024-03-25T08:00:00Z",
    note: "Clinical Psychology License uploaded.",
  },
  // CRED-008
  {
    id: "CHIST-011",
    credentialId: "CRED-008",
    action: "created",
    date: "2024-01-05T09:00:00Z",
    note: "Service Agreement 2024–2025 uploaded.",
  },
  {
    id: "CHIST-012",
    credentialId: "CRED-008",
    action: "archived",
    date: "2025-10-01T08:00:00Z",
    note: "Archived after replacement by Partner Agreement.",
  },
];
