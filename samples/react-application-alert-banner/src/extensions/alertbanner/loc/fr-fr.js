define([], function() {
  return {
    "Title": "AlertBannerApplicationCustomizer",
    
    // General UI
    "Save": "Enregistrer",
    "Cancel": "Annuler",
    "Close": "Fermer",
    "Edit": "Modifier",
    "Delete": "Supprimer",
    "Add": "Ajouter",
    "Update": "Mettre à jour",
    "Create": "Créer",
    "Remove": "Retirer",
    "Yes": "Oui",
    "No": "Non",
    "OK": "OK",
    "Loading": "Chargement...",
    "Error": "Erreur",
    "Success": "Succès",
    "Warning": "Avertissement",
    "Info": "Information",
    
    // Language
    "Language": "Langue",
    "SelectLanguage": "Sélectionner la langue",
    "ChangeLanguage": "Changer de langue",
    
    // Time-related
    "JustNow": "À l'instant",
    "MinutesAgo": "Il y a {0} minutes",
    "HoursAgo": "Il y a {0} heures",
    "DaysAgo": "Il y a {0} jours",
    
    // Alert Settings
    "AlertSettings": "Paramètres d'alerte",
    "AlertSettingsTitle": "Paramètres de la bannière d'alerte",
    "AlertSettingsDescription": "Configurez les paramètres de la bannière d'alerte. Ces modifications seront appliquées à l'ensemble du site.",
    "ConfigureAlertBannerSettings": "Configurer les paramètres de la bannière d'alerte",
    "Features": "Fonctionnalités",
    "EnableUserTargeting": "Activer le ciblage des utilisateurs",
    "EnableUserTargetingDescription": "Permettre aux alertes de cibler des utilisateurs ou des groupes spécifiques",
    "EnableNotifications": "Activer les notifications",
    "EnableNotificationsDescription": "Envoyer des notifications du navigateur pour les alertes critiques",
    "EnableRichMedia": "Activer les médias riches",
    "EnableRichMediaDescription": "Prendre en charge les images, vidéos et contenu riche dans les alertes",
    "AlertTypesConfiguration": "Configuration des types d'alerte",
    "AlertTypesConfigurationDescription": "Configurez les types d'alerte disponibles (format JSON) :",
    "AlertTypesPlaceholder": "Saisir la configuration JSON des types d'alerte...",
    "AlertTypesHelpText": "Chaque type d'alerte doit avoir : nom, nomIcône, couleurFond, couleurTexte, stylesSupplementaires, et stylesPriorité",
    "SaveSettings": "Enregistrer les paramètres",
    "InvalidJSONError": "Format JSON non valide dans la configuration des types d'alerte. Veuillez vérifier votre syntaxe.",
    
    // Alert Management
    "CreateAlert": "Créer une alerte",
    "EditAlert": "Modifier l'alerte",
    "DeleteAlert": "Supprimer l'alerte",
    "AlertTitle": "Titre de l'alerte",
    "AlertDescription": "Description",
    "AlertType": "Type d'alerte",
    "Priority": "Priorité",
    "Status": "Statut",
    "TargetSites": "Sites cibles",
    "LinkUrl": "URL du lien",
    "LinkDescription": "Description du lien",
    "ScheduledStart": "Début programmé",
    "ScheduledEnd": "Fin programmée",
    "IsPinned": "Épinglé",
    "NotificationType": "Type de notification",
    
    // Priority Levels
    "PriorityLow": "Faible",
    "PriorityMedium": "Moyen",
    "PriorityHigh": "Élevé",
    "PriorityCritical": "Critique",
    
    // Status Types
    "StatusActive": "Actif",
    "StatusExpired": "Expiré",
    "StatusScheduled": "Programmé",
    "StatusInactive": "Inactif",
    
    // Notification Types
    "NotificationNone": "Aucune",
    "NotificationBrowser": "Navigateur",
    "NotificationEmail": "Email",
    "NotificationBoth": "Les deux",
    
    // Alert Types
    "AlertTypeInfo": "Information",
    "AlertTypeWarning": "Avertissement",
    "AlertTypeMaintenance": "Maintenance",
    "AlertTypeInterruption": "Interruption",
    
    // User Interface
    "ShowMore": "Afficher plus",
    "ShowLess": "Afficher moins",
    "ViewDetails": "Voir les détails",
    "Expand": "Développer",
    "Collapse": "Réduire",
    "Preview": "Aperçu",
    "Templates": "Modèles",
    "CustomizeColors": "Personnaliser les couleurs",
    
    // Site Selection
    "SelectSites": "Sélectionner les sites",
    "CurrentSite": "Site actuel",
    "AllSites": "Tous les sites",
    "HubSites": "Sites hub",
    "RecentSites": "Sites récents",
    "FollowedSites": "Sites suivis",
    
    // Permissions and Errors
    "InsufficientPermissions": "Permissions insuffisantes pour effectuer cette action",
    "PermissionDeniedCreateLists": "L'utilisateur n'a pas les permissions pour créer des listes SharePoint",
    "PermissionDeniedAccessLists": "L'utilisateur n'a pas les permissions pour accéder aux listes SharePoint",
    "ListsNotFound": "Les listes SharePoint n'existent pas et ne peuvent pas être créées",
    "InitializationFailed": "Échec de l'initialisation de la connexion SharePoint",
    "ConnectionError": "Erreur de connexion s'est produite",
    "SaveError": "Erreur lors de l'enregistrement",
    "LoadError": "Erreur lors du chargement des données",
    
    // User Friendly Messages
    "NoAlertsMessage": "Aucune alerte n'est actuellement disponible",
    "AlertsLoadingMessage": "Chargement des alertes...",
    "AlertCreatedSuccess": "Alerte créée avec succès",
    "AlertUpdatedSuccess": "Alerte mise à jour avec succès",
    "AlertDeletedSuccess": "Alerte supprimée avec succès",
    "SettingsSavedSuccess": "Paramètres enregistrés avec succès",
    
    // Date and Time
    "CreatedBy": "Créé par",
    "CreatedOn": "Créé le",
    "LastModified": "Dernière modification",
    "Never": "Jamais",
    "Today": "Aujourd'hui",
    "Yesterday": "Hier",
    "Tomorrow": "Demain",
    
    // Validation Messages
    "FieldRequired": "Ce champ est requis",
    "InvalidUrl": "Veuillez saisir une URL valide",
    "InvalidDate": "Veuillez saisir une date valide",
    "InvalidEmail": "Veuillez saisir une adresse email valide",
    "TitleTooLong": "Le titre est trop long (maximum 255 caractères)",
    "DescriptionTooLong": "La description est trop longue (maximum 2000 caractères)",
    
    // Rich Media
    "UploadImage": "Télécharger une image",
    "RemoveImage": "Supprimer l'image",
    "ImageAltText": "Texte alternatif de l'image",
    "VideoUrl": "URL de la vidéo",
    "EmbedCode": "Code d'intégration",
    
    // Accessibility
    "CloseDialog": "Fermer la boîte de dialogue",
    "OpenSettings": "Ouvrir les paramètres",
    "ExpandAlert": "Développer l'alerte",
    "CollapseAlert": "Réduire l'alerte",
    "AlertActions": "Actions d'alerte",
    "PinAlert": "Épingler l'alerte",
    "UnpinAlert": "Désépingler l'alerte"
  }
});