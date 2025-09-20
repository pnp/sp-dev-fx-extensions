export enum MaskType {
  EntityMask = "EntityMask",
  CharacterMask = "CharacterMask",
}

export enum PiiEntityCategory {
  Person = "Person",
  PersonType = "PersonType",
  LicensePlate = "LicensePlate",
  SortCode = "SortCode",
  PhoneNumber = "PhoneNumber",
  Organization = "Organization",
  Address = "Address",
  Email = "Email",
  URL = "URL",
  IPAddress = "IPAddress",
  Date = "Date",
  DateAndTime = "DateAndTime",
  DateOfBirth = "DateOfBirth",
  Age = "Age",
  BankAccountNumber = "BankAccountNumber",
  DriversLicenseNumber = "DriversLicenseNumber",
  PassportNumber = "PassportNumber",
}

export interface RedactionOptions {
  maskType: number;
  maskCharacter?: string;
  selectedCategories?: PiiEntityCategory[];
  includeAllCategories?: boolean;
}

export interface DocumentInfo {
  id: string;
  name: string;
  serverRelativeUrl: string;
  size: number;
  fileType: string;
  isSupported: boolean;
  errorMessage?: string;
}

export interface RedactionRequest {
  documents: DocumentInfo[];
  options: RedactionOptions;
}

export interface RedactionJobStatus {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
  completedDocuments: string[];
  failedDocuments: { name: string; error: string }[];
}

export interface RedactionResult {
  success: boolean;
  jobId: string;
  message: string;
  processedDocuments?: DocumentInfo[];
  errors?: string[];
}

export const SUPPORTED_FILE_EXTENSIONS = [".txt", ".pdf", ".docx"];

export const MASK_CHARACTERS = ["*", "#", "X", "•", "█"];

export const PII_CATEGORIES_DISPLAY: Record<PiiEntityCategory, string> = {
  [PiiEntityCategory.Person]: "Person Names",
  [PiiEntityCategory.PersonType]: "Person Type",
  [PiiEntityCategory.LicensePlate]: "License Plate",
  [PiiEntityCategory.SortCode]: "Sort Code",
  [PiiEntityCategory.PhoneNumber]: "Phone Number",
  [PiiEntityCategory.Organization]: "Organization",
  [PiiEntityCategory.Address]: "Address",
  [PiiEntityCategory.Email]: "Email Address",
  [PiiEntityCategory.URL]: "URL",
  [PiiEntityCategory.IPAddress]: "IP Address",
  [PiiEntityCategory.Date]: "Date",
  [PiiEntityCategory.DateAndTime]: "Date and Time",
  [PiiEntityCategory.DateOfBirth]: "Date of Birth",
  [PiiEntityCategory.Age]: "Age",
  [PiiEntityCategory.BankAccountNumber]: "Bank Account Number",
  [PiiEntityCategory.DriversLicenseNumber]: "Driver's License Number",
  [PiiEntityCategory.PassportNumber]: "Passport Number",
};
