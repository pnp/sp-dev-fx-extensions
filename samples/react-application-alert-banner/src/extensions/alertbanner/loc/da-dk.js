define([], function() {
  return {
    "Title": "AlertBannerApplicationCustomizer",
    
    // General UI
    "Save": "Gem",
    "Cancel": "Annuller",
    "Close": "Luk",
    "Edit": "Rediger",
    "Delete": "Slet",
    "Add": "Tilføj",
    "Update": "Opdater",
    "Create": "Opret",
    "Remove": "Fjern",
    "Yes": "Ja",
    "No": "Nej",
    "OK": "OK",
    "Loading": "Indlæser...",
    "Error": "Fejl",
    "Success": "Succes",
    "Warning": "Advarsel",
    "Info": "Information",
    
    // Language
    "Language": "Sprog",
    "SelectLanguage": "Vælg sprog",
    "ChangeLanguage": "Skift sprog",
    
    // Time-related
    "JustNow": "Lige nu",
    "MinutesAgo": "{0} minutter siden",
    "HoursAgo": "{0} timer siden",
    "DaysAgo": "{0} dage siden",
    
    // Alert Settings
    "AlertSettings": "Advarselsindstillinger",
    "AlertSettingsTitle": "Indstillinger for advarselsbanner",
    "AlertSettingsDescription": "Konfigurer indstillingerne for advarselsbaneret. Disse ændringer vil blive anvendt på hele webstedet.",
    "ConfigureAlertBannerSettings": "Konfigurer indstillinger for advarselsbanner",
    "Features": "Funktioner",
    "EnableUserTargeting": "Aktivér brugerretning",
    "EnableUserTargetingDescription": "Tillad advarsler at målrette specifikke brugere eller grupper",
    "EnableNotifications": "Aktivér notifikationer",
    "EnableNotificationsDescription": "Send browsernotifikationer for kritiske advarsler",
    "EnableRichMedia": "Aktivér rigt medie",
    "EnableRichMediaDescription": "Understøt billeder, videoer og rigt indhold i advarsler",
    "AlertTypesConfiguration": "Konfiguration af advarselstyper",
    "AlertTypesConfigurationDescription": "Konfigurer tilgængelige advarselstyper (JSON-format):",
    "AlertTypesPlaceholder": "Indtast JSON-konfiguration for advarselstyper...",
    "AlertTypesHelpText": "Hver advarselstype skal have: navn, ikonnavn, baggrundsfarve, tekstfarve, yderligere stilarter og prioritetsstilarter",
    "SaveSettings": "Gem indstillinger",
    "InvalidJSONError": "Ugyldigt JSON-format i konfiguration af advarselstyper. Kontroller din syntaks.",
    
    // Alert Management
    "CreateAlert": "Opret advarsel",
    "EditAlert": "Rediger advarsel",
    "DeleteAlert": "Slet advarsel",
    "AlertTitle": "Advarselstitel",
    "AlertDescription": "Beskrivelse",
    "AlertType": "Advarselstype",
    "Priority": "Prioritet",
    "Status": "Status",
    "TargetSites": "Målwebsteder",
    "LinkUrl": "Link-URL",
    "LinkDescription": "Linkbeskrivelse",
    "ScheduledStart": "Planlagt start",
    "ScheduledEnd": "Planlagt slut",
    "IsPinned": "Fastgjort",
    "NotificationType": "Notifikationstype",
    
    // Priority Levels
    "PriorityLow": "Lav",
    "PriorityMedium": "Mellem",
    "PriorityHigh": "Høj",
    "PriorityCritical": "Kritisk",
    
    // Status Types
    "StatusActive": "Aktiv",
    "StatusExpired": "Udløbet",
    "StatusScheduled": "Planlagt",
    "StatusInactive": "Inaktiv",
    
    // Notification Types
    "NotificationNone": "Ingen",
    "NotificationBrowser": "Browser",
    "NotificationEmail": "E-mail",
    "NotificationBoth": "Begge",
    
    // Alert Types
    "AlertTypeInfo": "Information",
    "AlertTypeWarning": "Advarsel",
    "AlertTypeMaintenance": "Vedligeholdelse",
    "AlertTypeInterruption": "Afbrydelse",
    
    // User Interface
    "ShowMore": "Vis mere",
    "ShowLess": "Vis mindre",
    "ViewDetails": "Vis detaljer",
    "Expand": "Udvid",
    "Collapse": "Kollaps",
    "Preview": "Forhåndsvisning",
    "Templates": "Skabeloner",
    "CustomizeColors": "Tilpas farver",
    
    // Site Selection
    "SelectSites": "Vælg websteder",
    "CurrentSite": "Nuværende websted",
    "AllSites": "Alle websteder",
    "HubSites": "Hub-websteder",
    "RecentSites": "Seneste websteder",
    "FollowedSites": "Fulgte websteder",
    
    // Permissions and Errors
    "InsufficientPermissions": "Utilstrækkelige tilladelser til at udføre denne handling",
    "PermissionDeniedCreateLists": "Brugeren mangler tilladelser til at oprette SharePoint-lister",
    "PermissionDeniedAccessLists": "Brugeren mangler tilladelser til at få adgang til SharePoint-lister",
    "ListsNotFound": "SharePoint-lister findes ikke og kan ikke oprettes",
    "InitializationFailed": "Fejlede i at initialisere SharePoint-forbindelse",
    "ConnectionError": "Forbindelsesfejl opstod",
    "SaveError": "Der opstod en fejl under gemning",
    "LoadError": "Der opstod en fejl under indlæsning af data",
    
    // User Friendly Messages
    "NoAlertsMessage": "Ingen advarsler er i øjeblikket tilgængelige",
    "AlertsLoadingMessage": "Indlæser advarsler...",
    "AlertCreatedSuccess": "Advarsel oprettet med succes",
    "AlertUpdatedSuccess": "Advarsel opdateret med succes",
    "AlertDeletedSuccess": "Advarsel slettet med succes",
    "SettingsSavedSuccess": "Indstillinger gemt med succes",
    
    // Date and Time
    "CreatedBy": "Oprettet af",
    "CreatedOn": "Oprettet den",
    "LastModified": "Sidst ændret",
    "Never": "Aldrig",
    "Today": "I dag",
    "Yesterday": "I går",
    "Tomorrow": "I morgen",
    
    // Validation Messages
    "FieldRequired": "Dette felt er påkrævet",
    "InvalidUrl": "Indtast venligst en gyldig URL",
    "InvalidDate": "Indtast venligst en gyldig dato",
    "InvalidEmail": "Indtast venligst en gyldig e-mailadresse",
    "TitleTooLong": "Titlen er for lang (maksimum 255 tegn)",
    "DescriptionTooLong": "Beskrivelsen er for lang (maksimum 2000 tegn)",
    
    // Rich Media
    "UploadImage": "Upload billede",
    "RemoveImage": "Fjern billede",
    "ImageAltText": "Billedets alternative tekst",
    "VideoUrl": "Video-URL",
    "EmbedCode": "Indlejringskode",
    
    // Accessibility
    "CloseDialog": "Luk dialog",
    "OpenSettings": "Åbn indstillinger",
    "ExpandAlert": "Udvid advarsel",
    "CollapseAlert": "Kollaps advarsel",
    "AlertActions": "Advarselhandlinger",
    "PinAlert": "Fastgør advarsel",
    "UnpinAlert": "Løsgør advarsel"
  }
});