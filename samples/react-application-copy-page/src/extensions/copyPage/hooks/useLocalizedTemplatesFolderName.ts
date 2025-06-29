/**
 * Known localized folder names used for "Templates" in SitePages libraries.
 */
export const knownLocalizedTemplateFolders = [
    "Templates",     // English
    "Vorlagen",      // German
    "Modèles",       // French
    "Modelli",       // Italian
    "Plantillas",    // Spanish
    "テンプレート",    // Japanese
    "Šablony",       // Czech
    "Szablony",      // Polish
    "Sjablonen"      // Dutch
  ];
  
  /**
   * Maps SharePoint LCID language codes to localized "Templates" folder names.
   */
  export function getLocalizedTemplatesFolderName(languageId: number, fallback = "Templates"): string {
    const folderNameMap: Record<number, string> = {
      1033: "Templates",     // English (US)
      1031: "Vorlagen",      // German
      1036: "Modèles",       // French
      1040: "Modelli",       // Italian
      3082: "Plantillas",    // Spanish
      1041: "テンプレート",    // Japanese
      1029: "Šablony",       // Czech
      1045: "Szablony",      // Polish
      1043: "Sjablonen",     // Dutch
      2057: "Templates",     // English (UK)
    };
  
    return folderNameMap[languageId] || fallback;
  }
  