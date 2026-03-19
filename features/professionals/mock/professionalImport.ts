export interface ProfessionalImportRow {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  dialCode: string;
  phoneNumber: string;
  locationState: string;
  city: string;
  bankName: string;
  bankAccountNumber: string;
  bankSwiftCode: string;
  payoutCurrency: string;
  profession: string;
  licenseNumber: string;
  languages: string;
  biography: string;
  specialisations: string;
  therapyApproaches: string;
  treatmentExperiences: string;
  checkInTimes: string;
  leaveStartDate: string;
  leaveEndDate: string;
  leaveReason: string;
  maximumClients: string;
  demoAccount: string;
  published: string;
  departureDate: string;
  avatarUrl: string;
}

export const PROFESSIONAL_IMPORT_COLUMNS: Array<keyof ProfessionalImportRow> = [
  "firstName",
  "lastName",
  "email",
  "country",
  "dialCode",
  "phoneNumber",
  "locationState",
  "city",
  "bankName",
  "bankAccountNumber",
  "bankSwiftCode",
  "payoutCurrency",
  "profession",
  "licenseNumber",
  "languages",
  "biography",
  "specialisations",
  "therapyApproaches",
  "treatmentExperiences",
  "checkInTimes",
  "leaveStartDate",
  "leaveEndDate",
  "leaveReason",
  "maximumClients",
  "demoAccount",
  "published",
  "departureDate",
  "avatarUrl",
];

export const PROFESSIONAL_IMPORT_MOCK_ROWS: ProfessionalImportRow[] = [
  {
    firstName: "Alya",
    lastName: "Rahman",
    email: "alya.rahman@example.com",
    country: "Singapore",
    dialCode: "+65",
    phoneNumber: "9001 0022",
    locationState: "Central",
    city: "Singapore",
    bankName: "DBS",
    bankAccountNumber: "0012345678",
    bankSwiftCode: "DBSSSGSG",
    payoutCurrency: "SGD",
    profession: "Counsellor",
    licenseNumber: "LIC-77821",
    languages: "English|Malay",
    biography: "Counsellor with 8 years supporting adults and working professionals.",
    specialisations: "Adults|Working professionals",
    therapyApproaches: "Cognitive Behavioral Therapy (CBT)|Mindfulness-based approach",
    treatmentExperiences: "Person with disabilities|Substance abuse",
    checkInTimes: "Morning (8AM-12PM)|Afternoon (12PM-4PM)",
    leaveStartDate: "",
    leaveEndDate: "",
    leaveReason: "",
    maximumClients: "20",
    demoAccount: "false",
    published: "true",
    departureDate: "",
    avatarUrl: "https://i.pravatar.cc/150?img=44",
  },
  {
    firstName: "",
    lastName: "Tan",
    email: "invalid-email",
    country: "Malaysia",
    dialCode: "+60",
    phoneNumber: "",
    locationState: "Kuala Lumpur",
    city: "Kuala Lumpur",
    bankName: "Maybank",
    bankAccountNumber: "",
    bankSwiftCode: "MBBEMYKL",
    payoutCurrency: "MYR",
    profession: "Clinical Psychologist",
    licenseNumber: "",
    languages: "English",
    biography: "",
    specialisations: "Youth",
    therapyApproaches: "Acceptance and Commitment Therapy (ACT)",
    treatmentExperiences: "Eating disorders",
    checkInTimes: "Evening (4PM-8PM)",
    leaveStartDate: "2026-03-01",
    leaveEndDate: "2026-03-08",
    leaveReason: "Annual leave",
    maximumClients: "18",
    demoAccount: "false",
    published: "false",
    departureDate: "",
    avatarUrl: "",
  },
];

function escapeCsvCell(value: string) {
  const normalized = value.replace(/\r?\n/g, " ").trim();
  if (normalized.includes(",") || normalized.includes("\"")) {
    return `"${normalized.replace(/"/g, "\"\"")}"`;
  }
  return normalized;
}

export function buildProfessionalTemplateCsv() {
  const header = PROFESSIONAL_IMPORT_COLUMNS.join(",");
  const sample = PROFESSIONAL_IMPORT_COLUMNS.map((col) =>
    escapeCsvCell(PROFESSIONAL_IMPORT_MOCK_ROWS[0]?.[col] ?? "")
  ).join(",");
  return `${header}\n${sample}\n`;
}
