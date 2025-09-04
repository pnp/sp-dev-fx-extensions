import { ILocalizationStrings } from './LocalizationService';

// Comprehensive static string mappings for all supported languages
export const STATIC_STRINGS: { [key: string]: ILocalizationStrings } = {
  'en-us': {
    // General UI
    'Save': 'Save',
    'Cancel': 'Cancel',
    'Close': 'Close',
    'Edit': 'Edit',
    'Delete': 'Delete',
    'Add': 'Add',
    'Update': 'Update',
    'Create': 'Create',
    'Remove': 'Remove',
    'Yes': 'Yes',
    'No': 'No',
    'OK': 'OK',
    'Loading': 'Loading...',
    'Error': 'Error',
    'Success': 'Success',
    'Warning': 'Warning',
    'Info': 'Info',
    
    // Language
    'Language': 'Language',
    'SelectLanguage': 'Select Language',
    'ChangeLanguage': 'Change Language',
    
    // Time-related
    'JustNow': 'Just now',
    'MinutesAgo': '{0} minutes ago',
    'HoursAgo': '{0} hours ago',
    'DaysAgo': '{0} days ago',
    
    // Alert Settings
    'AlertSettings': 'Alert Settings',
    'AlertSettingsTitle': 'Alert Banner Settings',
    'AlertSettingsDescription': 'Configure the alert banner settings. These changes will be applied site-wide.',
    'ConfigureAlertBannerSettings': 'Configure Alert Banner Settings',
    'Features': 'Features',
    'EnableUserTargeting': 'Enable User Targeting',
    'EnableUserTargetingDescription': 'Allow alerts to target specific users or groups',
    'EnableNotifications': 'Enable Notifications',
    'EnableNotificationsDescription': 'Send browser notifications for critical alerts',
    'EnableRichMedia': 'Enable Rich Media',
    'EnableRichMediaDescription': 'Support images, videos, and rich content in alerts',
    'AlertTypesConfiguration': 'Alert Types Configuration',
    'AlertTypesConfigurationDescription': 'Configure the available alert types (JSON format):',
    'AlertTypesPlaceholder': 'Enter alert types JSON configuration...',
    'AlertTypesHelpText': 'Each alert type should have: name, iconName, backgroundColor, textColor, additionalStyles, and priorityStyles',
    'SaveSettings': 'Save Settings',
    'InvalidJSONError': 'Invalid JSON format in Alert Types configuration. Please check your syntax.',
    
    // Alert Management
    'CreateAlert': 'Create Alert',
    'EditAlert': 'Edit Alert',
    'DeleteAlert': 'Delete Alert',
    'AlertTitle': 'Alert Title',
    'AlertDescription': 'Description',
    'AlertType': 'Alert Type',
    'Priority': 'Priority',
    'Status': 'Status',
    'TargetSites': 'Target Sites',
    'LinkUrl': 'Link URL',
    'LinkDescription': 'Link Description',
    'ScheduledStart': 'Scheduled Start',
    'ScheduledEnd': 'Scheduled End',
    'IsPinned': 'Pinned',
    'NotificationType': 'Notification Type',
    
    // Priority Levels
    'PriorityLow': 'Low',
    'PriorityMedium': 'Medium',
    'PriorityHigh': 'High',
    'PriorityCritical': 'Critical',
    
    // Status Types
    'StatusActive': 'Active',
    'StatusExpired': 'Expired',
    'StatusScheduled': 'Scheduled',
    'StatusInactive': 'Inactive',
    
    // Notification Types
    'NotificationNone': 'None',
    'NotificationBrowser': 'Browser',
    'NotificationEmail': 'Email',
    'NotificationBoth': 'Both',
    
    // Alert Types
    'AlertTypeInfo': 'Info',
    'AlertTypeWarning': 'Warning',
    'AlertTypeMaintenance': 'Maintenance',
    'AlertTypeInterruption': 'Interruption',
    
    // User Interface
    'ShowMore': 'Show More',
    'ShowLess': 'Show Less',
    'ViewDetails': 'View Details',
    'Expand': 'Expand',
    'Collapse': 'Collapse',
    'Preview': 'Preview',
    'Templates': 'Templates',
    'CustomizeColors': 'Customize Colors',
    
    // Site Selection
    'SelectSites': 'Select Sites',
    'CurrentSite': 'Current Site',
    'AllSites': 'All Sites',
    'HubSites': 'Hub Sites',
    'RecentSites': 'Recent Sites',
    'FollowedSites': 'Followed Sites',
    
    // Permissions and Errors
    'InsufficientPermissions': 'Insufficient permissions to perform this action',
    'PermissionDeniedCreateLists': 'User lacks permissions to create SharePoint lists',
    'PermissionDeniedAccessLists': 'User lacks permissions to access SharePoint lists',
    'ListsNotFound': 'SharePoint lists do not exist and cannot be created',
    'InitializationFailed': 'Failed to initialize SharePoint connection',
    'ConnectionError': 'Connection error occurred',
    'SaveError': 'Error occurred while saving',
    'LoadError': 'Error occurred while loading data',
    
    // User Friendly Messages
    'NoAlertsMessage': 'No alerts are currently available',
    'AlertsLoadingMessage': 'Loading alerts...',
    'AlertCreatedSuccess': 'Alert created successfully',
    'AlertUpdatedSuccess': 'Alert updated successfully',
    'AlertDeletedSuccess': 'Alert deleted successfully',
    'SettingsSavedSuccess': 'Settings saved successfully',
    
    // Date and Time
    'CreatedBy': 'Created by',
    'CreatedOn': 'Created on',
    'LastModified': 'Last modified',
    'Never': 'Never',
    'Today': 'Today',
    'Yesterday': 'Yesterday',
    'Tomorrow': 'Tomorrow',
    
    // Validation Messages
    'FieldRequired': 'This field is required',
    'InvalidUrl': 'Please enter a valid URL',
    'InvalidDate': 'Please enter a valid date',
    'InvalidEmail': 'Please enter a valid email address',
    'TitleTooLong': 'Title is too long (maximum 255 characters)',
    'DescriptionTooLong': 'Description is too long (maximum 2000 characters)',
    
    // Rich Media
    'UploadImage': 'Upload Image',
    'RemoveImage': 'Remove Image',
    'ImageAltText': 'Image Alt Text',
    'VideoUrl': 'Video URL',
    'EmbedCode': 'Embed Code',
    
    // Accessibility
    'CloseDialog': 'Close dialog',
    'OpenSettings': 'Open settings',
    'ExpandAlert': 'Expand alert',
    'CollapseAlert': 'Collapse alert',
    'AlertActions': 'Alert actions',
    'PinAlert': 'Pin alert',
    'UnpinAlert': 'Unpin alert'
  },
  
  'fr-fr': {
    // General UI
    'Save': 'Enregistrer',
    'Cancel': 'Annuler',
    'Close': 'Fermer',
    'Edit': 'Modifier',
    'Delete': 'Supprimer',
    'Add': 'Ajouter',
    'Update': 'Mettre à jour',
    'Create': 'Créer',
    'Remove': 'Retirer',
    'Yes': 'Oui',
    'No': 'Non',
    'OK': 'OK',
    'Loading': 'Chargement...',
    'Error': 'Erreur',
    'Success': 'Succès',
    'Warning': 'Avertissement',
    'Info': 'Information',
    
    // Language
    'Language': 'Langue',
    'SelectLanguage': 'Sélectionner la langue',
    'ChangeLanguage': 'Changer de langue',
    
    // Time-related
    'JustNow': 'À l\'instant',
    'MinutesAgo': 'Il y a {0} minutes',
    'HoursAgo': 'Il y a {0} heures',
    'DaysAgo': 'Il y a {0} jours',
    
    // Alert Settings
    'AlertSettings': 'Paramètres d\'alerte',
    'AlertSettingsTitle': 'Paramètres de la bannière d\'alerte',
    'AlertSettingsDescription': 'Configurez les paramètres de la bannière d\'alerte. Ces modifications seront appliquées à l\'ensemble du site.',
    'ConfigureAlertBannerSettings': 'Configurer les paramètres de la bannière d\'alerte',
    'Features': 'Fonctionnalités',
    'EnableUserTargeting': 'Activer le ciblage des utilisateurs',
    'EnableUserTargetingDescription': 'Permettre aux alertes de cibler des utilisateurs ou des groupes spécifiques',
    'EnableNotifications': 'Activer les notifications',
    'EnableNotificationsDescription': 'Envoyer des notifications du navigateur pour les alertes critiques',
    'EnableRichMedia': 'Activer les médias riches',
    'EnableRichMediaDescription': 'Prendre en charge les images, vidéos et contenu riche dans les alertes',
    'AlertTypesConfiguration': 'Configuration des types d\'alerte',
    'AlertTypesConfigurationDescription': 'Configurez les types d\'alerte disponibles (format JSON) :',
    'AlertTypesPlaceholder': 'Saisir la configuration JSON des types d\'alerte...',
    'AlertTypesHelpText': 'Chaque type d\'alerte doit avoir : nom, nomIcône, couleurFond, couleurTexte, stylesSupplementaires, et stylesPriorité',
    'SaveSettings': 'Enregistrer les paramètres',
    'InvalidJSONError': 'Format JSON non valide dans la configuration des types d\'alerte. Veuillez vérifier votre syntaxe.',
    
    // Alert Management
    'CreateAlert': 'Créer une alerte',
    'EditAlert': 'Modifier l\'alerte',
    'DeleteAlert': 'Supprimer l\'alerte',
    'AlertTitle': 'Titre de l\'alerte',
    'AlertDescription': 'Description',
    'AlertType': 'Type d\'alerte',
    'Priority': 'Priorité',
    'Status': 'Statut',
    'TargetSites': 'Sites cibles',
    'LinkUrl': 'URL du lien',
    'LinkDescription': 'Description du lien',
    'ScheduledStart': 'Début programmé',
    'ScheduledEnd': 'Fin programmée',
    'IsPinned': 'Épinglé',
    'NotificationType': 'Type de notification',
    
    // Priority Levels
    'PriorityLow': 'Faible',
    'PriorityMedium': 'Moyen',
    'PriorityHigh': 'Élevé',
    'PriorityCritical': 'Critique',
    
    // Status Types
    'StatusActive': 'Actif',
    'StatusExpired': 'Expiré',
    'StatusScheduled': 'Programmé',
    'StatusInactive': 'Inactif',
    
    // Notification Types
    'NotificationNone': 'Aucune',
    'NotificationBrowser': 'Navigateur',
    'NotificationEmail': 'Email',
    'NotificationBoth': 'Les deux',
    
    // Alert Types
    'AlertTypeInfo': 'Information',
    'AlertTypeWarning': 'Avertissement',
    'AlertTypeMaintenance': 'Maintenance',
    'AlertTypeInterruption': 'Interruption',
    
    // User Interface
    'ShowMore': 'Afficher plus',
    'ShowLess': 'Afficher moins',
    'ViewDetails': 'Voir les détails',
    'Expand': 'Développer',
    'Collapse': 'Réduire',
    'Preview': 'Aperçu',
    'Templates': 'Modèles',
    'CustomizeColors': 'Personnaliser les couleurs',
    
    // Site Selection
    'SelectSites': 'Sélectionner les sites',
    'CurrentSite': 'Site actuel',
    'AllSites': 'Tous les sites',
    'HubSites': 'Sites hub',
    'RecentSites': 'Sites récents',
    'FollowedSites': 'Sites suivis',
    
    // Permissions and Errors
    'InsufficientPermissions': 'Permissions insuffisantes pour effectuer cette action',
    'PermissionDeniedCreateLists': 'L\'utilisateur n\'a pas les permissions pour créer des listes SharePoint',
    'PermissionDeniedAccessLists': 'L\'utilisateur n\'a pas les permissions pour accéder aux listes SharePoint',
    'ListsNotFound': 'Les listes SharePoint n\'existent pas et ne peuvent pas être créées',
    'InitializationFailed': 'Échec de l\'initialisation de la connexion SharePoint',
    'ConnectionError': 'Erreur de connexion s\'est produite',
    'SaveError': 'Erreur lors de l\'enregistrement',
    'LoadError': 'Erreur lors du chargement des données',
    
    // User Friendly Messages
    'NoAlertsMessage': 'Aucune alerte n\'est actuellement disponible',
    'AlertsLoadingMessage': 'Chargement des alertes...',
    'AlertCreatedSuccess': 'Alerte créée avec succès',
    'AlertUpdatedSuccess': 'Alerte mise à jour avec succès',
    'AlertDeletedSuccess': 'Alerte supprimée avec succès',
    'SettingsSavedSuccess': 'Paramètres enregistrés avec succès',
    
    // Date and Time
    'CreatedBy': 'Créé par',
    'CreatedOn': 'Créé le',
    'LastModified': 'Dernière modification',
    'Never': 'Jamais',
    'Today': 'Aujourd\'hui',
    'Yesterday': 'Hier',
    'Tomorrow': 'Demain',
    
    // Validation Messages
    'FieldRequired': 'Ce champ est requis',
    'InvalidUrl': 'Veuillez saisir une URL valide',
    'InvalidDate': 'Veuillez saisir une date valide',
    'InvalidEmail': 'Veuillez saisir une adresse email valide',
    'TitleTooLong': 'Le titre est trop long (maximum 255 caractères)',
    'DescriptionTooLong': 'La description est trop longue (maximum 2000 caractères)',
    
    // Rich Media
    'UploadImage': 'Télécharger une image',
    'RemoveImage': 'Supprimer l\'image',
    'ImageAltText': 'Texte alternatif de l\'image',
    'VideoUrl': 'URL de la vidéo',
    'EmbedCode': 'Code d\'intégration',
    
    // Accessibility
    'CloseDialog': 'Fermer la boîte de dialogue',
    'OpenSettings': 'Ouvrir les paramètres',
    'ExpandAlert': 'Développer l\'alerte',
    'CollapseAlert': 'Réduire l\'alerte',
    'AlertActions': 'Actions d\'alerte',
    'PinAlert': 'Épingler l\'alerte',
    'UnpinAlert': 'Désépingler l\'alerte'
  },
  
  'sv-se': {
    // General UI
    'Save': 'Spara',
    'Cancel': 'Avbryt',
    'Close': 'Stäng',
    'Edit': 'Redigera',
    'Delete': 'Ta bort',
    'Add': 'Lägg till',
    'Update': 'Uppdatera',
    'Create': 'Skapa',
    'Remove': 'Ta bort',
    'Yes': 'Ja',
    'No': 'Nej',
    'OK': 'OK',
    'Loading': 'Laddar...',
    'Error': 'Fel',
    'Success': 'Framgång',
    'Warning': 'Varning',
    'Info': 'Information',
    
    // Language
    'Language': 'Språk',
    'SelectLanguage': 'Välj språk',
    'ChangeLanguage': 'Byt språk',
    
    // Time-related
    'JustNow': 'Just nu',
    'MinutesAgo': '{0} minuter sedan',
    'HoursAgo': '{0} timmar sedan',
    'DaysAgo': '{0} dagar sedan',
    
    // Alert Settings
    'AlertSettings': 'Varningsinställningar',
    'AlertSettingsTitle': 'Inställningar för varningsbanner',
    'AlertSettingsDescription': 'Konfigurera inställningarna för varningsbannern. Dessa ändringar kommer att tillämpas på hela webbplatsen.',
    'ConfigureAlertBannerSettings': 'Konfigurera inställningar för varningsbanner',
    'Features': 'Funktioner',
    'EnableUserTargeting': 'Aktivera användarriktning',
    'EnableUserTargetingDescription': 'Tillåt varningar att rikta sig till specifika användare eller grupper',
    'EnableNotifications': 'Aktivera aviseringar',
    'EnableNotificationsDescription': 'Skicka webbläsaraviseringar för kritiska varningar',
    'EnableRichMedia': 'Aktivera rikmedier',
    'EnableRichMediaDescription': 'Stöd för bilder, videor och rikt innehåll i varningar',
    'AlertTypesConfiguration': 'Konfiguration av varningstyper',
    'AlertTypesConfigurationDescription': 'Konfigurera tillgängliga varningstyper (JSON-format):',
    'AlertTypesPlaceholder': 'Ange JSON-konfiguration för varningstyper...',
    'AlertTypesHelpText': 'Varje varningstyp bör ha: namn, ikonnamn, bakgrundsfärg, textfärg, ytterligare stilar och prioritetsstilar',
    'SaveSettings': 'Spara inställningar',
    'InvalidJSONError': 'Ogiltigt JSON-format i konfiguration av varningstyper. Kontrollera din syntax.',
    
    // Alert Management
    'CreateAlert': 'Skapa varning',
    'EditAlert': 'Redigera varning',
    'DeleteAlert': 'Ta bort varning',
    'AlertTitle': 'Varningstitel',
    'AlertDescription': 'Beskrivning',
    'AlertType': 'Varningstyp',
    'Priority': 'Prioritet',
    'Status': 'Status',
    'TargetSites': 'Målwebbplatser',
    'LinkUrl': 'Länk-URL',
    'LinkDescription': 'Länkbeskrivning',
    'ScheduledStart': 'Schemalagd start',
    'ScheduledEnd': 'Schemalagt slut',
    'IsPinned': 'Fäst',
    'NotificationType': 'Aviseringstyp',
    
    // Priority Levels
    'PriorityLow': 'Låg',
    'PriorityMedium': 'Medel',
    'PriorityHigh': 'Hög',
    'PriorityCritical': 'Kritisk',
    
    // Status Types
    'StatusActive': 'Aktiv',
    'StatusExpired': 'Utgången',
    'StatusScheduled': 'Schemalagd',
    'StatusInactive': 'Inaktiv',
    
    // Notification Types
    'NotificationNone': 'Ingen',
    'NotificationBrowser': 'Webbläsare',
    'NotificationEmail': 'E-post',
    'NotificationBoth': 'Båda',
    
    // Alert Types
    'AlertTypeInfo': 'Information',
    'AlertTypeWarning': 'Varning',
    'AlertTypeMaintenance': 'Underhåll',
    'AlertTypeInterruption': 'Avbrott',
    
    // User Interface
    'ShowMore': 'Visa mer',
    'ShowLess': 'Visa mindre',
    'ViewDetails': 'Visa detaljer',
    'Expand': 'Expandera',
    'Collapse': 'Minimera',
    'Preview': 'Förhandsgranskning',
    'Templates': 'Mallar',
    'CustomizeColors': 'Anpassa färger',
    
    // Site Selection
    'SelectSites': 'Välj webbplatser',
    'CurrentSite': 'Aktuell webbplats',
    'AllSites': 'Alla webbplatser',
    'HubSites': 'Hubbwebbplatser',
    'RecentSites': 'Senaste webbplatser',
    'FollowedSites': 'Följda webbplatser',
    
    // Permissions and Errors
    'InsufficientPermissions': 'Otillräckliga behörigheter för att utföra denna åtgärd',
    'PermissionDeniedCreateLists': 'Användaren saknar behörigheter för att skapa SharePoint-listor',
    'PermissionDeniedAccessLists': 'Användaren saknar behörigheter för att komma åt SharePoint-listor',
    'ListsNotFound': 'SharePoint-listor existerar inte och kan inte skapas',
    'InitializationFailed': 'Misslyckades med att initiera SharePoint-anslutning',
    'ConnectionError': 'Anslutningsfel uppstod',
    'SaveError': 'Ett fel uppstod vid sparning',
    'LoadError': 'Ett fel uppstod vid laddning av data',
    
    // User Friendly Messages
    'NoAlertsMessage': 'Inga varningar är för närvarande tillgängliga',
    'AlertsLoadingMessage': 'Laddar varningar...',
    'AlertCreatedSuccess': 'Varning skapad framgångsrikt',
    'AlertUpdatedSuccess': 'Varning uppdaterad framgångsrikt',
    'AlertDeletedSuccess': 'Varning borttagen framgångsrikt',
    'SettingsSavedSuccess': 'Inställningar sparade framgångsrikt',
    
    // Date and Time
    'CreatedBy': 'Skapad av',
    'CreatedOn': 'Skapad den',
    'LastModified': 'Senast ändrad',
    'Never': 'Aldrig',
    'Today': 'Idag',
    'Yesterday': 'Igår',
    'Tomorrow': 'Imorgon',
    
    // Validation Messages
    'FieldRequired': 'Detta fält är obligatoriskt',
    'InvalidUrl': 'Ange en giltig URL',
    'InvalidDate': 'Ange ett giltigt datum',
    'InvalidEmail': 'Ange en giltig e-postadress',
    'TitleTooLong': 'Titeln är för lång (maximum 255 tecken)',
    'DescriptionTooLong': 'Beskrivningen är för lång (maximum 2000 tecken)',
    
    // Rich Media
    'UploadImage': 'Ladda upp bild',
    'RemoveImage': 'Ta bort bild',
    'ImageAltText': 'Alternativ text för bild',
    'VideoUrl': 'Video-URL',
    'EmbedCode': 'Inbäddningskod',
    
    // Accessibility
    'CloseDialog': 'Stäng dialog',
    'OpenSettings': 'Öppna inställningar',
    'ExpandAlert': 'Expandera varning',
    'CollapseAlert': 'Minimera varning',
    'AlertActions': 'Varningsåtgärder',
    'PinAlert': 'Fäst varning',
    'UnpinAlert': 'Ta bort fästning av varning'
  },
  
  'de-de': {
    // General UI
    'Save': 'Speichern',
    'Cancel': 'Abbrechen',
    'Close': 'Schließen',
    'Edit': 'Bearbeiten',
    'Delete': 'Löschen',
    'Add': 'Hinzufügen',
    'Update': 'Aktualisieren',
    'Create': 'Erstellen',
    'Remove': 'Entfernen',
    'Yes': 'Ja',
    'No': 'Nein',
    'OK': 'OK',
    'Loading': 'Wird geladen...',
    'Error': 'Fehler',
    'Success': 'Erfolg',
    'Warning': 'Warnung',
    'Info': 'Information',
    
    // Language
    'Language': 'Sprache',
    'SelectLanguage': 'Sprache auswählen',
    'ChangeLanguage': 'Sprache ändern',
    
    // Time-related
    'JustNow': 'Gerade eben',
    'MinutesAgo': 'Vor {0} Minuten',
    'HoursAgo': 'Vor {0} Stunden',
    'DaysAgo': 'Vor {0} Tagen',
    
    // Alert Settings
    'AlertSettings': 'Alarm-Einstellungen',
    'AlertSettingsTitle': 'Alarm-Banner-Einstellungen',
    'AlertSettingsDescription': 'Konfigurieren Sie die Alarm-Banner-Einstellungen. Diese Änderungen werden seitenweit angewendet.',
    'ConfigureAlertBannerSettings': 'Alarm-Banner-Einstellungen konfigurieren',
    'Features': 'Funktionen',
    'EnableUserTargeting': 'Benutzerzielrichtung aktivieren',
    'EnableUserTargetingDescription': 'Ermöglichen Sie Alarmen, bestimmte Benutzer oder Gruppen anzusprechen',
    'EnableNotifications': 'Benachrichtigungen aktivieren',
    'EnableNotificationsDescription': 'Browser-Benachrichtigungen für kritische Alarme senden',
    'EnableRichMedia': 'Rich Media aktivieren',
    'EnableRichMediaDescription': 'Unterstützung für Bilder, Videos und reiche Inhalte in Alarmen',
    'AlertTypesConfiguration': 'Alarm-Typen-Konfiguration',
    'AlertTypesConfigurationDescription': 'Konfigurieren Sie die verfügbaren Alarm-Typen (JSON-Format):',
    'AlertTypesPlaceholder': 'Alarm-Typen JSON-Konfiguration eingeben...',
    'AlertTypesHelpText': 'Jeder Alarm-Typ sollte haben: Name, Symbolname, Hintergrundfarbe, Textfarbe, zusätzliche Stile und Prioritätsstile',
    'SaveSettings': 'Einstellungen speichern',
    'InvalidJSONError': 'Ungültiges JSON-Format in der Alarm-Typen-Konfiguration. Bitte überprüfen Sie Ihre Syntax.',
    
    // Alert Management
    'CreateAlert': 'Alarm erstellen',
    'EditAlert': 'Alarm bearbeiten',
    'DeleteAlert': 'Alarm löschen',
    'AlertTitle': 'Alarm-Titel',
    'AlertDescription': 'Beschreibung',
    'AlertType': 'Alarm-Typ',
    'Priority': 'Priorität',
    'Status': 'Status',
    'TargetSites': 'Ziel-Sites',
    'LinkUrl': 'Link-URL',
    'LinkDescription': 'Link-Beschreibung',
    'ScheduledStart': 'Geplanter Start',
    'ScheduledEnd': 'Geplantes Ende',
    'IsPinned': 'Angeheftet',
    'NotificationType': 'Benachrichtigungstyp',
    
    // Priority Levels
    'PriorityLow': 'Niedrig',
    'PriorityMedium': 'Mittel',
    'PriorityHigh': 'Hoch',
    'PriorityCritical': 'Kritisch',
    
    // Status Types
    'StatusActive': 'Aktiv',
    'StatusExpired': 'Abgelaufen',
    'StatusScheduled': 'Geplant',
    'StatusInactive': 'Inaktiv',
    
    // Notification Types
    'NotificationNone': 'Keine',
    'NotificationBrowser': 'Browser',
    'NotificationEmail': 'E-Mail',
    'NotificationBoth': 'Beide',
    
    // Alert Types
    'AlertTypeInfo': 'Information',
    'AlertTypeWarning': 'Warnung',
    'AlertTypeMaintenance': 'Wartung',
    'AlertTypeInterruption': 'Unterbrechung',
    
    // User Interface
    'ShowMore': 'Mehr anzeigen',
    'ShowLess': 'Weniger anzeigen',
    'ViewDetails': 'Details anzeigen',
    'Expand': 'Erweitern',
    'Collapse': 'Zusammenklappen',
    'Preview': 'Vorschau',
    'Templates': 'Vorlagen',
    'CustomizeColors': 'Farben anpassen',
    
    // Site Selection
    'SelectSites': 'Sites auswählen',
    'CurrentSite': 'Aktuelle Site',
    'AllSites': 'Alle Sites',
    'HubSites': 'Hub-Sites',
    'RecentSites': 'Aktuelle Sites',
    'FollowedSites': 'Befolgte Sites',
    
    // Permissions and Errors
    'InsufficientPermissions': 'Unzureichende Berechtigungen für diese Aktion',
    'PermissionDeniedCreateLists': 'Benutzer hat keine Berechtigung zum Erstellen von SharePoint-Listen',
    'PermissionDeniedAccessLists': 'Benutzer hat keine Berechtigung zum Zugriff auf SharePoint-Listen',
    'ListsNotFound': 'SharePoint-Listen existieren nicht und können nicht erstellt werden',
    'InitializationFailed': 'Initialisierung der SharePoint-Verbindung fehlgeschlagen',
    'ConnectionError': 'Verbindungsfehler aufgetreten',
    'SaveError': 'Fehler beim Speichern aufgetreten',
    'LoadError': 'Fehler beim Laden der Daten aufgetreten',
    
    // User Friendly Messages
    'NoAlertsMessage': 'Derzeit sind keine Alarme verfügbar',
    'AlertsLoadingMessage': 'Alarme werden geladen...',
    'AlertCreatedSuccess': 'Alarm erfolgreich erstellt',
    'AlertUpdatedSuccess': 'Alarm erfolgreich aktualisiert',
    'AlertDeletedSuccess': 'Alarm erfolgreich gelöscht',
    'SettingsSavedSuccess': 'Einstellungen erfolgreich gespeichert',
    
    // Date and Time
    'CreatedBy': 'Erstellt von',
    'CreatedOn': 'Erstellt am',
    'LastModified': 'Zuletzt geändert',
    'Never': 'Nie',
    'Today': 'Heute',
    'Yesterday': 'Gestern',
    'Tomorrow': 'Morgen',
    
    // Validation Messages
    'FieldRequired': 'Dieses Feld ist erforderlich',
    'InvalidUrl': 'Bitte geben Sie eine gültige URL ein',
    'InvalidDate': 'Bitte geben Sie ein gültiges Datum ein',
    'InvalidEmail': 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    'TitleTooLong': 'Titel ist zu lang (maximal 255 Zeichen)',
    'DescriptionTooLong': 'Beschreibung ist zu lang (maximal 2000 Zeichen)',
    
    // Rich Media
    'UploadImage': 'Bild hochladen',
    'RemoveImage': 'Bild entfernen',
    'ImageAltText': 'Bild Alt-Text',
    'VideoUrl': 'Video-URL',
    'EmbedCode': 'Einbettungscode',
    
    // Accessibility
    'CloseDialog': 'Dialog schließen',
    'OpenSettings': 'Einstellungen öffnen',
    'ExpandAlert': 'Alarm erweitern',
    'CollapseAlert': 'Alarm zusammenklappen',
    'AlertActions': 'Alarm-Aktionen',
    'PinAlert': 'Alarm anheften',
    'UnpinAlert': 'Alarm lösen'
  },
  
  'es-es': {
    // General UI
    'Save': 'Guardar',
    'Cancel': 'Cancelar',
    'Close': 'Cerrar',
    'Edit': 'Editar',
    'Delete': 'Eliminar',
    'Add': 'Añadir',
    'Update': 'Actualizar',
    'Create': 'Crear',
    'Remove': 'Quitar',
    'Yes': 'Sí',
    'No': 'No',
    'OK': 'OK',
    'Loading': 'Cargando...',
    'Error': 'Error',
    'Success': 'Éxito',
    'Warning': 'Advertencia',
    'Info': 'Información',
    
    // Language
    'Language': 'Idioma',
    'SelectLanguage': 'Seleccionar idioma',
    'ChangeLanguage': 'Cambiar idioma',
    
    // Time-related
    'JustNow': 'Ahora mismo',
    'MinutesAgo': 'Hace {0} minutos',
    'HoursAgo': 'Hace {0} horas',
    'DaysAgo': 'Hace {0} días',
    
    // Alert Settings
    'AlertSettings': 'Configuración de alertas',
    'AlertSettingsTitle': 'Configuración del banner de alertas',
    'AlertSettingsDescription': 'Configure los ajustes del banner de alertas. Estos cambios se aplicarán en todo el sitio.',
    'ConfigureAlertBannerSettings': 'Configurar ajustes del banner de alertas',
    'Features': 'Características',
    'EnableUserTargeting': 'Habilitar segmentación de usuarios',
    'EnableUserTargetingDescription': 'Permitir que las alertas se dirijan a usuarios o grupos específicos',
    'EnableNotifications': 'Habilitar notificaciones',
    'EnableNotificationsDescription': 'Enviar notificaciones del navegador para alertas críticas',
    'EnableRichMedia': 'Habilitar medios enriquecidos',
    'EnableRichMediaDescription': 'Soporte para imágenes, videos y contenido enriquecido en alertas',
    'AlertTypesConfiguration': 'Configuración de tipos de alerta',
    'AlertTypesConfigurationDescription': 'Configure los tipos de alerta disponibles (formato JSON):',
    'AlertTypesPlaceholder': 'Ingrese la configuración JSON de tipos de alerta...',
    'AlertTypesHelpText': 'Cada tipo de alerta debe tener: nombre, nombreIcono, colorFondo, colorTexto, estilosAdicionales y estilosPrioridad',
    'SaveSettings': 'Guardar configuración',
    'InvalidJSONError': 'Formato JSON no válido en la configuración de tipos de alerta. Por favor revise su sintaxis.',
    
    // Alert Management
    'CreateAlert': 'Crear alerta',
    'EditAlert': 'Editar alerta',
    'DeleteAlert': 'Eliminar alerta',
    'AlertTitle': 'Título de la alerta',
    'AlertDescription': 'Descripción',
    'AlertType': 'Tipo de alerta',
    'Priority': 'Prioridad',
    'Status': 'Estado',
    'TargetSites': 'Sitios objetivo',
    'LinkUrl': 'URL del enlace',
    'LinkDescription': 'Descripción del enlace',
    'ScheduledStart': 'Inicio programado',
    'ScheduledEnd': 'Fin programado',
    'IsPinned': 'Fijado',
    'NotificationType': 'Tipo de notificación',
    
    // Priority Levels
    'PriorityLow': 'Bajo',
    'PriorityMedium': 'Medio',
    'PriorityHigh': 'Alto',
    'PriorityCritical': 'Crítico',
    
    // Status Types
    'StatusActive': 'Activo',
    'StatusExpired': 'Expirado',
    'StatusScheduled': 'Programado',
    'StatusInactive': 'Inactivo',
    
    // Notification Types
    'NotificationNone': 'Ninguna',
    'NotificationBrowser': 'Navegador',
    'NotificationEmail': 'Correo electrónico',
    'NotificationBoth': 'Ambos',
    
    // Alert Types
    'AlertTypeInfo': 'Información',
    'AlertTypeWarning': 'Advertencia',
    'AlertTypeMaintenance': 'Mantenimiento',
    'AlertTypeInterruption': 'Interrupción',
    
    // User Interface
    'ShowMore': 'Mostrar más',
    'ShowLess': 'Mostrar menos',
    'ViewDetails': 'Ver detalles',
    'Expand': 'Expandir',
    'Collapse': 'Contraer',
    'Preview': 'Vista previa',
    'Templates': 'Plantillas',
    'CustomizeColors': 'Personalizar colores',
    
    // Site Selection
    'SelectSites': 'Seleccionar sitios',
    'CurrentSite': 'Sitio actual',
    'AllSites': 'Todos los sitios',
    'HubSites': 'Sitios hub',
    'RecentSites': 'Sitios recientes',
    'FollowedSites': 'Sitios seguidos',
    
    // Permissions and Errors
    'InsufficientPermissions': 'Permisos insuficientes para realizar esta acción',
    'PermissionDeniedCreateLists': 'El usuario no tiene permisos para crear listas de SharePoint',
    'PermissionDeniedAccessLists': 'El usuario no tiene permisos para acceder a las listas de SharePoint',
    'ListsNotFound': 'Las listas de SharePoint no existen y no se pueden crear',
    'InitializationFailed': 'Fallo en la inicialización de la conexión de SharePoint',
    'ConnectionError': 'Ocurrió un error de conexión',
    'SaveError': 'Ocurrió un error al guardar',
    'LoadError': 'Ocurrió un error al cargar los datos',
    
    // User Friendly Messages
    'NoAlertsMessage': 'No hay alertas disponibles actualmente',
    'AlertsLoadingMessage': 'Cargando alertas...',
    'AlertCreatedSuccess': 'Alerta creada exitosamente',
    'AlertUpdatedSuccess': 'Alerta actualizada exitosamente',
    'AlertDeletedSuccess': 'Alerta eliminada exitosamente',
    'SettingsSavedSuccess': 'Configuración guardada exitosamente',
    
    // Date and Time
    'CreatedBy': 'Creado por',
    'CreatedOn': 'Creado el',
    'LastModified': 'Última modificación',
    'Never': 'Nunca',
    'Today': 'Hoy',
    'Yesterday': 'Ayer',
    'Tomorrow': 'Mañana',
    
    // Validation Messages
    'FieldRequired': 'Este campo es obligatorio',
    'InvalidUrl': 'Por favor ingrese una URL válida',
    'InvalidDate': 'Por favor ingrese una fecha válida',
    'InvalidEmail': 'Por favor ingrese una dirección de correo electrónico válida',
    'TitleTooLong': 'El título es muy largo (máximo 255 caracteres)',
    'DescriptionTooLong': 'La descripción es muy larga (máximo 2000 caracteres)',
    
    // Rich Media
    'UploadImage': 'Subir imagen',
    'RemoveImage': 'Quitar imagen',
    'ImageAltText': 'Texto alternativo de la imagen',
    'VideoUrl': 'URL del video',
    'EmbedCode': 'Código de inserción',
    
    // Accessibility
    'CloseDialog': 'Cerrar diálogo',
    'OpenSettings': 'Abrir configuración',
    'ExpandAlert': 'Expandir alerta',
    'CollapseAlert': 'Contraer alerta',
    'AlertActions': 'Acciones de alerta',
    'PinAlert': 'Fijar alerta',
    'UnpinAlert': 'Desfijar alerta'
  },
  
  'fi-fi': {
    // General UI
    'Save': 'Tallenna',
    'Cancel': 'Peruuta',
    'Close': 'Sulje',
    'Edit': 'Muokkaa',
    'Delete': 'Poista',
    'Add': 'Lisää',
    'Update': 'Päivitä',
    'Create': 'Luo',
    'Remove': 'Poista',
    'Yes': 'Kyllä',
    'No': 'Ei',
    'OK': 'OK',
    'Loading': 'Ladataan...',
    'Error': 'Virhe',
    'Success': 'Onnistui',
    'Warning': 'Varoitus',
    'Info': 'Tieto',
    
    // Language
    'Language': 'Kieli',
    'SelectLanguage': 'Valitse kieli',
    'ChangeLanguage': 'Vaihda kieli',
    
    // Time-related
    'JustNow': 'Juuri nyt',
    'MinutesAgo': '{0} minuuttia sitten',
    'HoursAgo': '{0} tuntia sitten',
    'DaysAgo': '{0} päivää sitten',
    
    // Alert Settings
    'AlertSettings': 'Hälytysasetukset',
    'AlertSettingsTitle': 'Hälytysbannerin asetukset',
    'AlertSettingsDescription': 'Määritä hälytysbannerin asetukset. Nämä muutokset koskevat koko sivustoa.',
    'ConfigureAlertBannerSettings': 'Määritä hälytysbannerin asetukset',
    'Features': 'Ominaisuudet',
    'EnableUserTargeting': 'Ota käyttöön käyttäjäkohdistus',
    'EnableUserTargetingDescription': 'Salli hälytysten kohdistaminen tiettyihin käyttäjiin tai ryhmiin',
    'EnableNotifications': 'Ota ilmoitukset käyttöön',
    'EnableNotificationsDescription': 'Lähetä selainilmoituksia kriittisistä hälytyksistä',
    'EnableRichMedia': 'Ota rikas media käyttöön',
    'EnableRichMediaDescription': 'Tuki kuville, videoille ja rikkaalle sisällölle hälytyksissa',
    'AlertTypesConfiguration': 'Hälytystyyppien määrittäminen',
    'AlertTypesConfigurationDescription': 'Määritä käytettävissä olevat hälytystyypit (JSON-muoto):',
    'AlertTypesPlaceholder': 'Syötä hälytystyyppien JSON-määritys...',
    'AlertTypesHelpText': 'Jokaisella hälytystyypillä tulee olla: nimi, kuvakenimi, taustavan väri, tekstin väri, lisätyylit ja prioriteettityylit',
    'SaveSettings': 'Tallenna asetukset',
    'InvalidJSONError': 'Virheellinen JSON-muoto hälytystyyppien määrityksessä. Tarkista syntaksi.',
    
    // Alert Management
    'CreateAlert': 'Luo hälytys',
    'EditAlert': 'Muokkaa hälytystä',
    'DeleteAlert': 'Poista hälytys',
    'AlertTitle': 'Hälytyksen otsikko',
    'AlertDescription': 'Kuvaus',
    'AlertType': 'Hälytystyyppi',
    'Priority': 'Prioriteetti',
    'Status': 'Tila',
    'TargetSites': 'Kohdistetut sivustot',
    'LinkUrl': 'Linkin URL',
    'LinkDescription': 'Linkin kuvaus',
    'ScheduledStart': 'Ajastettu alku',
    'ScheduledEnd': 'Ajastettu loppu',
    'IsPinned': 'Kiinnitetty',
    'NotificationType': 'Ilmoitustyyppi',
    
    // Priority Levels
    'PriorityLow': 'Matala',
    'PriorityMedium': 'Keskitaso',
    'PriorityHigh': 'Korkea',
    'PriorityCritical': 'Kriittinen',
    
    // Status Types
    'StatusActive': 'Aktiivinen',
    'StatusExpired': 'Vanhentunut',
    'StatusScheduled': 'Ajastettu',
    'StatusInactive': 'Ei-aktiivinen',
    
    // Notification Types
    'NotificationNone': 'Ei mitään',
    'NotificationBrowser': 'Selain',
    'NotificationEmail': 'Sähköposti',
    'NotificationBoth': 'Molemmat',
    
    // Alert Types
    'AlertTypeInfo': 'Tieto',
    'AlertTypeWarning': 'Varoitus',
    'AlertTypeMaintenance': 'Huolto',
    'AlertTypeInterruption': 'Keskeytys',
    
    // User Interface
    'ShowMore': 'Näytä lisää',
    'ShowLess': 'Näytä vähemmän',
    'ViewDetails': 'Näytä tiedot',
    'Expand': 'Laajenna',
    'Collapse': 'Tiivistä',
    'Preview': 'Esikatselu',
    'Templates': 'Mallit',
    'CustomizeColors': 'Mukauta värit',
    
    // Site Selection
    'SelectSites': 'Valitse sivustot',
    'CurrentSite': 'Nykyinen sivusto',
    'AllSites': 'Kaikki sivustot',
    'HubSites': 'Keskussivustot',
    'RecentSites': 'Viimeaikaiset sivustot',
    'FollowedSites': 'Seuratut sivustot',
    
    // Permissions and Errors
    'InsufficientPermissions': 'Riittämättömät oikeudet tämän toiminnon suorittamiseen',
    'PermissionDeniedCreateLists': 'Käyttäjällä ei ole oikeuksia SharePoint-listojen luomiseen',
    'PermissionDeniedAccessLists': 'Käyttäjällä ei ole oikeuksia SharePoint-listojen käyttämiseen',
    'ListsNotFound': 'SharePoint-listoja ei ole olemassa eikä niitä voida luoda',
    'InitializationFailed': 'SharePoint-yhteyden alustaminen epäonnistui',
    'ConnectionError': 'Yhteysvirhe tapahtui',
    'SaveError': 'Virhe tallennuksen aikana',
    'LoadError': 'Virhe tietojen latauksen aikana',
    
    // User Friendly Messages
    'NoAlertsMessage': 'Hälytyksiä ei ole tällä hetkellä saatavilla',
    'AlertsLoadingMessage': 'Ladataan hälytyksiä...',
    'AlertCreatedSuccess': 'Hälytys luotu onnistuneesti',
    'AlertUpdatedSuccess': 'Hälytys päivitetty onnistuneesti',
    'AlertDeletedSuccess': 'Hälytys poistettu onnistuneesti',
    'SettingsSavedSuccess': 'Asetukset tallennettu onnistuneesti',
    
    // Date and Time
    'CreatedBy': 'Luotu',
    'CreatedOn': 'Luotu',
    'LastModified': 'Viimeksi muokattu',
    'Never': 'Ei koskaan',
    'Today': 'Tänään',
    'Yesterday': 'Eilen',
    'Tomorrow': 'Huomenna',
    
    // Validation Messages
    'FieldRequired': 'Tämä kenttä on pakollinen',
    'InvalidUrl': 'Anna kelvollinen URL',
    'InvalidDate': 'Anna kelvollinen päivämäärä',
    'InvalidEmail': 'Anna kelvollinen sähköpostiosoite',
    'TitleTooLong': 'Otsikko on liian pitkä (enintään 255 merkkiä)',
    'DescriptionTooLong': 'Kuvaus on liian pitkä (enintään 2000 merkkiä)',
    
    // Rich Media
    'UploadImage': 'Lataa kuva',
    'RemoveImage': 'Poista kuva',
    'ImageAltText': 'Kuvan vaihtoehtoteksti',
    'VideoUrl': 'Videon URL',
    'EmbedCode': 'Upotuskoodi',
    
    // Accessibility
    'CloseDialog': 'Sulje dialogi',
    'OpenSettings': 'Avaa asetukset',
    'ExpandAlert': 'Laajenna hälytys',
    'CollapseAlert': 'Tiivistä hälytys',
    'AlertActions': 'Hälytystoiminnot',
    'PinAlert': 'Kiinnitä hälytys',
    'UnpinAlert': 'Poista hälytyksen kiinnitys'
  },
  
  'da-dk': {
    // General UI
    'Save': 'Gem',
    'Cancel': 'Annuller',
    'Close': 'Luk',
    'Edit': 'Rediger',
    'Delete': 'Slet',
    'Add': 'Tilføj',
    'Update': 'Opdater',
    'Create': 'Opret',
    'Remove': 'Fjern',
    'Yes': 'Ja',
    'No': 'Nej',
    'OK': 'OK',
    'Loading': 'Indlæser...',
    'Error': 'Fejl',
    'Success': 'Succes',
    'Warning': 'Advarsel',
    'Info': 'Information',
    
    // Language
    'Language': 'Sprog',
    'SelectLanguage': 'Vælg sprog',
    'ChangeLanguage': 'Skift sprog',
    
    // Time-related
    'JustNow': 'Lige nu',
    'MinutesAgo': '{0} minutter siden',
    'HoursAgo': '{0} timer siden',
    'DaysAgo': '{0} dage siden',
    
    // Alert Settings
    'AlertSettings': 'Advarselsindstillinger',
    'AlertSettingsTitle': 'Indstillinger for advarselsbanner',
    'AlertSettingsDescription': 'Konfigurer indstillingerne for advarselsbaneret. Disse ændringer vil blive anvendt på hele webstedet.',
    'ConfigureAlertBannerSettings': 'Konfigurer indstillinger for advarselsbanner',
    'Features': 'Funktioner',
    'EnableUserTargeting': 'Aktivér brugerretning',
    'EnableUserTargetingDescription': 'Tillad advarsler at målrette specifikke brugere eller grupper',
    'EnableNotifications': 'Aktivér notifikationer',
    'EnableNotificationsDescription': 'Send browsernotifikationer for kritiske advarsler',
    'EnableRichMedia': 'Aktivér rigt medie',
    'EnableRichMediaDescription': 'Understøt billeder, videoer og rigt indhold i advarsler',
    'AlertTypesConfiguration': 'Konfiguration af advarselstyper',
    'AlertTypesConfigurationDescription': 'Konfigurer tilgængelige advarselstyper (JSON-format):',
    'AlertTypesPlaceholder': 'Indtast JSON-konfiguration for advarselstyper...',
    'AlertTypesHelpText': 'Hver advarselstype skal have: navn, ikonnavn, baggrundsfarve, tekstfarve, yderligere stilarter og prioritetsstilarter',
    'SaveSettings': 'Gem indstillinger',
    'InvalidJSONError': 'Ugyldigt JSON-format i konfiguration af advarselstyper. Kontroller din syntaks.',
    
    // Alert Management
    'CreateAlert': 'Opret advarsel',
    'EditAlert': 'Rediger advarsel',
    'DeleteAlert': 'Slet advarsel',
    'AlertTitle': 'Advarselstitel',
    'AlertDescription': 'Beskrivelse',
    'AlertType': 'Advarselstype',
    'Priority': 'Prioritet',
    'Status': 'Status',
    'TargetSites': 'Målwebsteder',
    'LinkUrl': 'Link-URL',
    'LinkDescription': 'Linkbeskrivelse',
    'ScheduledStart': 'Planlagt start',
    'ScheduledEnd': 'Planlagt slut',
    'IsPinned': 'Fastgjort',
    'NotificationType': 'Notifikationstype',
    
    // Priority Levels
    'PriorityLow': 'Lav',
    'PriorityMedium': 'Mellem',
    'PriorityHigh': 'Høj',
    'PriorityCritical': 'Kritisk',
    
    // Status Types
    'StatusActive': 'Aktiv',
    'StatusExpired': 'Udløbet',
    'StatusScheduled': 'Planlagt',
    'StatusInactive': 'Inaktiv',
    
    // Notification Types
    'NotificationNone': 'Ingen',
    'NotificationBrowser': 'Browser',
    'NotificationEmail': 'E-mail',
    'NotificationBoth': 'Begge',
    
    // Alert Types
    'AlertTypeInfo': 'Information',
    'AlertTypeWarning': 'Advarsel',
    'AlertTypeMaintenance': 'Vedligeholdelse',
    'AlertTypeInterruption': 'Afbrydelse',
    
    // User Interface
    'ShowMore': 'Vis mere',
    'ShowLess': 'Vis mindre',
    'ViewDetails': 'Vis detaljer',
    'Expand': 'Udvid',
    'Collapse': 'Kollaps',
    'Preview': 'Forhåndsvisning',
    'Templates': 'Skabeloner',
    'CustomizeColors': 'Tilpas farver',
    
    // Site Selection
    'SelectSites': 'Vælg websteder',
    'CurrentSite': 'Nuværende websted',
    'AllSites': 'Alle websteder',
    'HubSites': 'Hub-websteder',
    'RecentSites': 'Seneste websteder',
    'FollowedSites': 'Fulgte websteder',
    
    // Permissions and Errors
    'InsufficientPermissions': 'Utilstrækkelige tilladelser til at udføre denne handling',
    'PermissionDeniedCreateLists': 'Brugeren mangler tilladelser til at oprette SharePoint-lister',
    'PermissionDeniedAccessLists': 'Brugeren mangler tilladelser til at få adgang til SharePoint-lister',
    'ListsNotFound': 'SharePoint-lister findes ikke og kan ikke oprettes',
    'InitializationFailed': 'Fejlede i at initialisere SharePoint-forbindelse',
    'ConnectionError': 'Forbindelsesfejl opstod',
    'SaveError': 'Der opstod en fejl under gemning',
    'LoadError': 'Der opstod en fejl under indlæsning af data',
    
    // User Friendly Messages
    'NoAlertsMessage': 'Ingen advarsler er i øjeblikket tilgængelige',
    'AlertsLoadingMessage': 'Indlæser advarsler...',
    'AlertCreatedSuccess': 'Advarsel oprettet med succes',
    'AlertUpdatedSuccess': 'Advarsel opdateret med succes',
    'AlertDeletedSuccess': 'Advarsel slettet med succes',
    'SettingsSavedSuccess': 'Indstillinger gemt med succes',
    
    // Date and Time
    'CreatedBy': 'Oprettet af',
    'CreatedOn': 'Oprettet den',
    'LastModified': 'Sidst ændret',
    'Never': 'Aldrig',
    'Today': 'I dag',
    'Yesterday': 'I går',
    'Tomorrow': 'I morgen',
    
    // Validation Messages
    'FieldRequired': 'Dette felt er påkrævet',
    'InvalidUrl': 'Indtast venligst en gyldig URL',
    'InvalidDate': 'Indtast venligst en gyldig dato',
    'InvalidEmail': 'Indtast venligst en gyldig e-mailadresse',
    'TitleTooLong': 'Titlen er for lang (maksimum 255 tegn)',
    'DescriptionTooLong': 'Beskrivelsen er for lang (maksimum 2000 tegn)',
    
    // Rich Media
    'UploadImage': 'Upload billede',
    'RemoveImage': 'Fjern billede',
    'ImageAltText': 'Billedets alternative tekst',
    'VideoUrl': 'Video-URL',
    'EmbedCode': 'Indlejringskode',
    
    // Accessibility
    'CloseDialog': 'Luk dialog',
    'OpenSettings': 'Åbn indstillinger',
    'ExpandAlert': 'Udvid advarsel',
    'CollapseAlert': 'Kollaps advarsel',
    'AlertActions': 'Advarselhandlinger',
    'PinAlert': 'Fastgør advarsel',
    'UnpinAlert': 'Løsgør advarsel'
  },
  
  'nb-no': {
    // General UI
    'Save': 'Lagre',
    'Cancel': 'Avbryt',
    'Close': 'Lukk',
    'Edit': 'Rediger',
    'Delete': 'Slett',
    'Add': 'Legg til',
    'Update': 'Oppdater',
    'Create': 'Opprett',
    'Remove': 'Fjern',
    'Yes': 'Ja',
    'No': 'Nei',
    'OK': 'OK',
    'Loading': 'Laster...',
    'Error': 'Feil',
    'Success': 'Suksess',
    'Warning': 'Advarsel',
    'Info': 'Informasjon',
    
    // Language
    'Language': 'Språk',
    'SelectLanguage': 'Velg språk',
    'ChangeLanguage': 'Bytt språk',
    
    // Time-related
    'JustNow': 'Akkurat nå',
    'MinutesAgo': '{0} minutter siden',
    'HoursAgo': '{0} timer siden',
    'DaysAgo': '{0} dager siden',
    
    // Alert Settings
    'AlertSettings': 'Varselinnstillinger',
    'AlertSettingsTitle': 'Innstillinger for varselbanner',
    'AlertSettingsDescription': 'Konfigurer innstillingene for varselbaneret. Disse endringene vil bli anvendt på hele nettstedet.',
    'ConfigureAlertBannerSettings': 'Konfigurer innstillinger for varselbanner',
    'Features': 'Funksjoner',
    'EnableUserTargeting': 'Aktiver brukerformdling',
    'EnableUserTargetingDescription': 'Tillat varsler å målrette spesifikke brukere eller grupper',
    'EnableNotifications': 'Aktiver varsler',
    'EnableNotificationsDescription': 'Send nettlesermeldinger for kritiske varsler',
    'EnableRichMedia': 'Aktiver rik media',
    'EnableRichMediaDescription': 'Støtte for bilder, videoer og rikt innhold i varsler',
    'AlertTypesConfiguration': 'Konfigurasjon av varseltyper',
    'AlertTypesConfigurationDescription': 'Konfigurer tilgjengelige varseltyper (JSON-format):',
    'AlertTypesPlaceholder': 'Skriv inn JSON-konfigurasjon for varseltyper...',
    'AlertTypesHelpText': 'Hver varseltype bør ha: navn, ikonnavn, bakgrunnsfarge, tekstfarge, tilleggsstiler og prioritetsstiler',
    'SaveSettings': 'Lagre innstillinger',
    'InvalidJSONError': 'Ugyldig JSON-format i konfigurasjon av varseltyper. Sjekk syntaksen din.',
    
    // Alert Management
    'CreateAlert': 'Opprett varsel',
    'EditAlert': 'Rediger varsel',
    'DeleteAlert': 'Slett varsel',
    'AlertTitle': 'Varseltittel',
    'AlertDescription': 'Beskrivelse',
    'AlertType': 'Varseltype',
    'Priority': 'Prioritet',
    'Status': 'Status',
    'TargetSites': 'Målnettsteder',
    'LinkUrl': 'Lenke-URL',
    'LinkDescription': 'Lenkebeskrivelse',
    'ScheduledStart': 'Planlagt start',
    'ScheduledEnd': 'Planlagt slutt',
    'IsPinned': 'Festet',
    'NotificationType': 'Varseltype',
    
    // Priority Levels
    'PriorityLow': 'Lav',
    'PriorityMedium': 'Medium',
    'PriorityHigh': 'Høy',
    'PriorityCritical': 'Kritisk',
    
    // Status Types
    'StatusActive': 'Aktiv',
    'StatusExpired': 'Utløpt',
    'StatusScheduled': 'Planlagt',
    'StatusInactive': 'Inaktiv',
    
    // Notification Types
    'NotificationNone': 'Ingen',
    'NotificationBrowser': 'Nettleser',
    'NotificationEmail': 'E-post',
    'NotificationBoth': 'Begge',
    
    // Alert Types
    'AlertTypeInfo': 'Informasjon',
    'AlertTypeWarning': 'Advarsel',
    'AlertTypeMaintenance': 'Vedlikehold',
    'AlertTypeInterruption': 'Avbrudd',
    
    // User Interface
    'ShowMore': 'Vis mer',
    'ShowLess': 'Vis mindre',
    'ViewDetails': 'Vis detaljer',
    'Expand': 'Utvid',
    'Collapse': 'Kollaps',
    'Preview': 'Forhåndsvisning',
    'Templates': 'Maler',
    'CustomizeColors': 'Tilpass farger',
    
    // Site Selection
    'SelectSites': 'Velg nettsteder',
    'CurrentSite': 'Nåværende nettsted',
    'AllSites': 'Alle nettsteder',
    'HubSites': 'Hub-nettsteder',
    'RecentSites': 'Nylige nettsteder',
    'FollowedSites': 'Fulgte nettsteder',
    
    // Permissions and Errors
    'InsufficientPermissions': 'Utilstrekkelige tillatelser for å utføre denne handlingen',
    'PermissionDeniedCreateLists': 'Brukeren mangler tillatelser til å opprette SharePoint-lister',
    'PermissionDeniedAccessLists': 'Brukeren mangler tillatelser til å få tilgang til SharePoint-lister',
    'ListsNotFound': 'SharePoint-lister finnes ikke og kan ikke opprettes',
    'InitializationFailed': 'Kunne ikke initialisere SharePoint-tilkobling',
    'ConnectionError': 'Tilkoblingsfeil oppstod',
    'SaveError': 'En feil oppstod under lagring',
    'LoadError': 'En feil oppstod under lasting av data',
    
    // User Friendly Messages
    'NoAlertsMessage': 'Ingen varsler er for øyeblikket tilgjengelige',
    'AlertsLoadingMessage': 'Laster varsler...',
    'AlertCreatedSuccess': 'Varsel opprettet vellykket',
    'AlertUpdatedSuccess': 'Varsel oppdatert vellykket',
    'AlertDeletedSuccess': 'Varsel slettet vellykket',
    'SettingsSavedSuccess': 'Innstillinger lagret vellykket',
    
    // Date and Time
    'CreatedBy': 'Opprettet av',
    'CreatedOn': 'Opprettet den',
    'LastModified': 'Sist endret',
    'Never': 'Aldri',
    'Today': 'I dag',
    'Yesterday': 'I går',
    'Tomorrow': 'I morgen',
    
    // Validation Messages
    'FieldRequired': 'Dette feltet er påkrevd',
    'InvalidUrl': 'Vennligst oppgi en gyldig URL',
    'InvalidDate': 'Vennligst oppgi en gyldig dato',
    'InvalidEmail': 'Vennligst oppgi en gyldig e-postadresse',
    'TitleTooLong': 'Tittelen er for lang (maksimum 255 tegn)',
    'DescriptionTooLong': 'Beskrivelsen er for lang (maksimum 2000 tegn)',
    
    // Rich Media
    'UploadImage': 'Last opp bilde',
    'RemoveImage': 'Fjern bilde',
    'ImageAltText': 'Bildes alternativ tekst',
    'VideoUrl': 'Video-URL',
    'EmbedCode': 'Innbyggingskode',
    
    // Accessibility
    'CloseDialog': 'Lukk dialog',
    'OpenSettings': 'Åpne innstillinger',
    'ExpandAlert': 'Utvid varsel',
    'CollapseAlert': 'Kollaps varsel',
    'AlertActions': 'Varselhandlinger',
    'PinAlert': 'Fest varsel',
    'UnpinAlert': 'Løsne varsel'
  }
};