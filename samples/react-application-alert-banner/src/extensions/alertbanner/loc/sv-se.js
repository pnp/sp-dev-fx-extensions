define([], function() {
  return {
    "Title": "AlertBannerApplicationCustomizer",
    
    // General UI
    "Save": "Spara",
    "Cancel": "Avbryt",
    "Close": "Stäng",
    "Edit": "Redigera",
    "Delete": "Ta bort",
    "Add": "Lägg till",
    "Update": "Uppdatera",
    "Create": "Skapa",
    "Remove": "Ta bort",
    "Yes": "Ja",
    "No": "Nej",
    "OK": "OK",
    "Loading": "Laddar...",
    "Error": "Fel",
    "Success": "Framgång",
    "Warning": "Varning",
    "Info": "Information",
    
    // Language
    "Language": "Språk",
    "SelectLanguage": "Välj språk",
    "ChangeLanguage": "Byt språk",
    
    // Time-related
    "JustNow": "Just nu",
    "MinutesAgo": "{0} minuter sedan",
    "HoursAgo": "{0} timmar sedan",
    "DaysAgo": "{0} dagar sedan",
    
    // Alert Settings
    "AlertSettings": "Varningsinställningar",
    "AlertSettingsTitle": "Inställningar för varningsbanner",
    "AlertSettingsDescription": "Konfigurera inställningarna för varningsbannern. Dessa ändringar kommer att tillämpas på hela webbplatsen.",
    "ConfigureAlertBannerSettings": "Konfigurera inställningar för varningsbanner",
    "Features": "Funktioner",
    "EnableUserTargeting": "Aktivera användarriktning",
    "EnableUserTargetingDescription": "Tillåt varningar att rikta sig till specifika användare eller grupper",
    "EnableNotifications": "Aktivera aviseringar",
    "EnableNotificationsDescription": "Skicka webbläsaraviseringar för kritiska varningar",
    "EnableRichMedia": "Aktivera rikmedier",
    "EnableRichMediaDescription": "Stöd för bilder, videor och rikt innehåll i varningar",
    "AlertTypesConfiguration": "Konfiguration av varningstyper",
    "AlertTypesConfigurationDescription": "Konfigurera tillgängliga varningstyper (JSON-format):",
    "AlertTypesPlaceholder": "Ange JSON-konfiguration för varningstyper...",
    "AlertTypesHelpText": "Varje varningstyp bör ha: namn, ikonnamn, bakgrundsfärg, textfärg, ytterligare stilar och prioritetsstilar",
    "SaveSettings": "Spara inställningar",
    "InvalidJSONError": "Ogiltigt JSON-format i konfiguration av varningstyper. Kontrollera din syntax.",
    
    // Alert Management
    "CreateAlert": "Skapa varning",
    "EditAlert": "Redigera varning",
    "DeleteAlert": "Ta bort varning",
    "AlertTitle": "Varningstitel",
    "AlertDescription": "Beskrivning",
    "AlertType": "Varningstyp",
    "Priority": "Prioritet",
    "Status": "Status",
    "TargetSites": "Målwebbplatser",
    "LinkUrl": "Länk-URL",
    "LinkDescription": "Länkbeskrivning",
    "ScheduledStart": "Schemalagd start",
    "ScheduledEnd": "Schemalagt slut",
    "IsPinned": "Fäst",
    "NotificationType": "Aviseringstyp",
    
    // Priority Levels
    "PriorityLow": "Låg",
    "PriorityMedium": "Medel",
    "PriorityHigh": "Hög",
    "PriorityCritical": "Kritisk",
    
    // Status Types
    "StatusActive": "Aktiv",
    "StatusExpired": "Utgången",
    "StatusScheduled": "Schemalagd",
    "StatusInactive": "Inaktiv",
    
    // Notification Types
    "NotificationNone": "Ingen",
    "NotificationBrowser": "Webbläsare",
    "NotificationEmail": "E-post",
    "NotificationBoth": "Båda",
    
    // Alert Types
    "AlertTypeInfo": "Information",
    "AlertTypeWarning": "Varning",
    "AlertTypeMaintenance": "Underhåll",
    "AlertTypeInterruption": "Avbrott",
    
    // User Interface
    "ShowMore": "Visa mer",
    "ShowLess": "Visa mindre",
    "ViewDetails": "Visa detaljer",
    "Expand": "Expandera",
    "Collapse": "Minimera",
    "Preview": "Förhandsgranskning",
    "Templates": "Mallar",
    "CustomizeColors": "Anpassa färger",
    
    // Site Selection
    "SelectSites": "Välj webbplatser",
    "CurrentSite": "Aktuell webbplats",
    "AllSites": "Alla webbplatser",
    "HubSites": "Hubbwebbplatser",
    "RecentSites": "Senaste webbplatser",
    "FollowedSites": "Följda webbplatser",
    
    // Permissions and Errors
    "InsufficientPermissions": "Otillräckliga behörigheter för att utföra denna åtgärd",
    "PermissionDeniedCreateLists": "Användaren saknar behörigheter för att skapa SharePoint-listor",
    "PermissionDeniedAccessLists": "Användaren saknar behörigheter för att komma åt SharePoint-listor",
    "ListsNotFound": "SharePoint-listor existerar inte och kan inte skapas",
    "InitializationFailed": "Misslyckades med att initiera SharePoint-anslutning",
    "ConnectionError": "Anslutningsfel uppstod",
    "SaveError": "Ett fel uppstod vid sparning",
    "LoadError": "Ett fel uppstod vid laddning av data",
    
    // User Friendly Messages
    "NoAlertsMessage": "Inga varningar är för närvarande tillgängliga",
    "AlertsLoadingMessage": "Laddar varningar...",
    "AlertCreatedSuccess": "Varning skapad framgångsrikt",
    "AlertUpdatedSuccess": "Varning uppdaterad framgångsrikt",
    "AlertDeletedSuccess": "Varning borttagen framgångsrikt",
    "SettingsSavedSuccess": "Inställningar sparade framgångsrikt",
    
    // Date and Time
    "CreatedBy": "Skapad av",
    "CreatedOn": "Skapad den",
    "LastModified": "Senast ändrad",
    "Never": "Aldrig",
    "Today": "Idag",
    "Yesterday": "Igår",
    "Tomorrow": "Imorgon",
    
    // Validation Messages
    "FieldRequired": "Detta fält är obligatoriskt",
    "InvalidUrl": "Ange en giltig URL",
    "InvalidDate": "Ange ett giltigt datum",
    "InvalidEmail": "Ange en giltig e-postadress",
    "TitleTooLong": "Titeln är för lång (maximum 255 tecken)",
    "DescriptionTooLong": "Beskrivningen är för lång (maximum 2000 tecken)",
    
    // Rich Media
    "UploadImage": "Ladda upp bild",
    "RemoveImage": "Ta bort bild",
    "ImageAltText": "Alternativ text för bild",
    "VideoUrl": "Video-URL",
    "EmbedCode": "Inbäddningskod",
    
    // Accessibility
    "CloseDialog": "Stäng dialog",
    "OpenSettings": "Öppna inställningar",
    "ExpandAlert": "Expandera varning",
    "CollapseAlert": "Minimera varning",
    "AlertActions": "Varningsåtgärder",
    "PinAlert": "Fäst varning",
    "UnpinAlert": "Ta bort fästning av varning"
  }
});