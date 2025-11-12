// Supported languages for Azure Document Translation Service
export enum SupportedLanguage {
  English = "en",
  French = "fr",
  Spanish = "es",
  German = "de",
  Italian = "it",
  Portuguese = "pt",
  Dutch = "nl",
  Russian = "ru",
  Japanese = "ja",
  Korean = "ko",
  ChineseSimplified = "zh-Hans",
  ChineseTraditional = "zh-Hant",
  Arabic = "ar",
  Hindi = "hi",
  Turkish = "tr",
  Polish = "pl",
  Swedish = "sv",
  Norwegian = "no",
  Danish = "da",
  Finnish = "fi",
}

export interface TranslationOptions {
  sourceLanguage?: string; // Optional, Azure can auto-detect
  targetLanguages: string[]; // Array of target language codes
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

export interface TranslationRequest {
  siteUrl: string;
  documents: DocumentInfo[];
  options: TranslationOptions;
  context: {
    userId: string;
    webId: string;
    listId?: string;
    tenantId: string;
  };
}

export interface TranslatedDocument {
  originalName: string;
  targetLanguage: string;
  translatedName: string;
  serverRelativeUrl: string;
  characterCount: number;
}

export interface TranslationJobStatus {
  jobId: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number; // 0-100
  message?: string;
  completedDocuments: TranslatedDocument[];
  failedDocuments: { name: string; targetLanguage: string; error: string }[];
  totalDocuments: number;
  totalCharacterCharged: number;
}

export interface TranslationResult {
  success: boolean;
  jobId: string;
  message: string;
  estimatedDocuments?: number;
  errors?: string[];
}

// Supported file types for Azure Document Translation
export const SUPPORTED_FILE_EXTENSIONS = [
  ".docx",
  ".xlsx",
  ".pptx",
  ".pdf",
  ".html",
  ".htm",
  ".txt",
  ".md",
  ".msg",
  ".odt",
  ".ods",
  ".odp",
];

// Display names for supported languages
export const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  [SupportedLanguage.English]: "English",
  [SupportedLanguage.French]: "French",
  [SupportedLanguage.Spanish]: "Spanish",
  [SupportedLanguage.German]: "German",
  [SupportedLanguage.Italian]: "Italian",
  [SupportedLanguage.Portuguese]: "Portuguese",
  [SupportedLanguage.Dutch]: "Dutch",
  [SupportedLanguage.Russian]: "Russian",
  [SupportedLanguage.Japanese]: "Japanese",
  [SupportedLanguage.Korean]: "Korean",
  [SupportedLanguage.ChineseSimplified]: "Chinese (Simplified)",
  [SupportedLanguage.ChineseTraditional]: "Chinese (Traditional)",
  [SupportedLanguage.Arabic]: "Arabic",
  [SupportedLanguage.Hindi]: "Hindi",
  [SupportedLanguage.Turkish]: "Turkish",
  [SupportedLanguage.Polish]: "Polish",
  [SupportedLanguage.Swedish]: "Swedish",
  [SupportedLanguage.Norwegian]: "Norwegian",
  [SupportedLanguage.Danish]: "Danish",
  [SupportedLanguage.Finnish]: "Finnish",
};

// Maximum file size (40MB as per Azure limits)
export const MAX_FILE_SIZE = 40 * 1024 * 1024;

// Maximum files per batch
export const MAX_FILES_PER_BATCH = 1000;
