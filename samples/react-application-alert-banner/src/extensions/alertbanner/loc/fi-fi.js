define([], function() {
  return {
    "Title": "AlertBannerApplicationCustomizer",
    
    // General UI
    "Save": "Tallenna",
    "Cancel": "Peruuta",
    "Close": "Sulje",
    "Edit": "Muokkaa",
    "Delete": "Poista",
    "Add": "Lisää",
    "Update": "Päivitä",
    "Create": "Luo",
    "Remove": "Poista",
    "Yes": "Kyllä",
    "No": "Ei",
    "OK": "OK",
    "Loading": "Ladataan...",
    "Error": "Virhe",
    "Success": "Onnistui",
    "Warning": "Varoitus",
    "Info": "Tieto",
    
    // Language
    "Language": "Kieli",
    "SelectLanguage": "Valitse kieli",
    "ChangeLanguage": "Vaihda kieli",
    
    // Time-related
    "JustNow": "Juuri nyt",
    "MinutesAgo": "{0} minuuttia sitten",
    "HoursAgo": "{0} tuntia sitten",
    "DaysAgo": "{0} päivää sitten",
    
    // Alert Settings
    "AlertSettings": "Hälytysasetukset",
    "AlertSettingsTitle": "Hälytysbannerin asetukset",
    "AlertSettingsDescription": "Määritä hälytysbannerin asetukset. Nämä muutokset koskevat koko sivustoa.",
    "ConfigureAlertBannerSettings": "Määritä hälytysbannerin asetukset",
    "Features": "Ominaisuudet",
    "EnableUserTargeting": "Ota käyttöön käyttäjäkohdistus",
    "EnableUserTargetingDescription": "Salli hälytysten kohdistaminen tiettyihin käyttäjiin tai ryhmiin",
    "EnableNotifications": "Ota ilmoitukset käyttöön",
    "EnableNotificationsDescription": "Lähetä selainilmoituksia kriittisistä hälytyksistä",
    "EnableRichMedia": "Ota rikas media käyttöön",
    "EnableRichMediaDescription": "Tuki kuville, videoille ja rikkaalle sisällölle hälytyksissa",
    "AlertTypesConfiguration": "Hälytystyyppien määrittäminen",
    "AlertTypesConfigurationDescription": "Määritä käytettävissä olevat hälytystyypit (JSON-muoto):",
    "AlertTypesPlaceholder": "Syötä hälytystyyppien JSON-määritys...",
    "AlertTypesHelpText": "Jokaisella hälytystyypillä tulee olla: nimi, kuvakenimi, taustavan väri, tekstin väri, lisätyylit ja prioriteettityylit",
    "SaveSettings": "Tallenna asetukset",
    "InvalidJSONError": "Virheellinen JSON-muoto hälytystyyppien määrityksessä. Tarkista syntaksi.",
    
    // Alert Management
    "CreateAlert": "Luo hälytys",
    "EditAlert": "Muokkaa hälytystä",
    "DeleteAlert": "Poista hälytys",
    "AlertTitle": "Hälytyksen otsikko",
    "AlertDescription": "Kuvaus",
    "AlertType": "Hälytystyyppi",
    "Priority": "Prioriteetti",
    "Status": "Tila",
    "TargetSites": "Kohdistetut sivustot",
    "LinkUrl": "Linkin URL",
    "LinkDescription": "Linkin kuvaus",
    "ScheduledStart": "Ajastettu alku",
    "ScheduledEnd": "Ajastettu loppu",
    "IsPinned": "Kiinnitetty",
    "NotificationType": "Ilmoitustyyppi",
    
    // Priority Levels
    "PriorityLow": "Matala",
    "PriorityMedium": "Keskitaso",
    "PriorityHigh": "Korkea",
    "PriorityCritical": "Kriittinen",
    
    // Status Types
    "StatusActive": "Aktiivinen",
    "StatusExpired": "Vanhentunut",
    "StatusScheduled": "Ajastettu",
    "StatusInactive": "Ei-aktiivinen",
    
    // Notification Types
    "NotificationNone": "Ei mitään",
    "NotificationBrowser": "Selain",
    "NotificationEmail": "Sähköposti",
    "NotificationBoth": "Molemmat",
    
    // Alert Types
    "AlertTypeInfo": "Tieto",
    "AlertTypeWarning": "Varoitus",
    "AlertTypeMaintenance": "Huolto",
    "AlertTypeInterruption": "Keskeytys",
    
    // User Interface
    "ShowMore": "Näytä lisää",
    "ShowLess": "Näytä vähemmän",
    "ViewDetails": "Näytä tiedot",
    "Expand": "Laajenna",
    "Collapse": "Tiivistä",
    "Preview": "Esikatselu",
    "Templates": "Mallit",
    "CustomizeColors": "Mukauta värit",
    
    // Site Selection
    "SelectSites": "Valitse sivustot",
    "CurrentSite": "Nykyinen sivusto",
    "AllSites": "Kaikki sivustot",
    "HubSites": "Keskussivustot",
    "RecentSites": "Viimeaikaiset sivustot",
    "FollowedSites": "Seuratut sivustot",
    
    // Permissions and Errors
    "InsufficientPermissions": "Riittämättömät oikeudet tämän toiminnon suorittamiseen",
    "PermissionDeniedCreateLists": "Käyttäjällä ei ole oikeuksia SharePoint-listojen luomiseen",
    "PermissionDeniedAccessLists": "Käyttäjällä ei ole oikeuksia SharePoint-listojen käyttämiseen",
    "ListsNotFound": "SharePoint-listoja ei ole olemassa eikä niitä voida luoda",
    "InitializationFailed": "SharePoint-yhteyden alustaminen epäonnistui",
    "ConnectionError": "Yhteysvirhe tapahtui",
    "SaveError": "Virhe tallennuksen aikana",
    "LoadError": "Virhe tietojen latauksen aikana",
    
    // User Friendly Messages
    "NoAlertsMessage": "Hälytyksiä ei ole tällä hetkellä saatavilla",
    "AlertsLoadingMessage": "Ladataan hälytyksiä...",
    "AlertCreatedSuccess": "Hälytys luotu onnistuneesti",
    "AlertUpdatedSuccess": "Hälytys päivitetty onnistuneesti",
    "AlertDeletedSuccess": "Hälytys poistettu onnistuneesti",
    "SettingsSavedSuccess": "Asetukset tallennettu onnistuneesti",
    
    // Date and Time
    "CreatedBy": "Luotu",
    "CreatedOn": "Luotu",
    "LastModified": "Viimeksi muokattu",
    "Never": "Ei koskaan",
    "Today": "Tänään",
    "Yesterday": "Eilen",
    "Tomorrow": "Huomenna",
    
    // Validation Messages
    "FieldRequired": "Tämä kenttä on pakollinen",
    "InvalidUrl": "Anna kelvollinen URL",
    "InvalidDate": "Anna kelvollinen päivämäärä",
    "InvalidEmail": "Anna kelvollinen sähköpostiosoite",
    "TitleTooLong": "Otsikko on liian pitkä (enintään 255 merkkiä)",
    "DescriptionTooLong": "Kuvaus on liian pitkä (enintään 2000 merkkiä)",
    
    // Rich Media
    "UploadImage": "Lataa kuva",
    "RemoveImage": "Poista kuva",
    "ImageAltText": "Kuvan vaihtoehtoteksti",
    "VideoUrl": "Videon URL",
    "EmbedCode": "Upotuskoodi",
    
    // Accessibility
    "CloseDialog": "Sulje dialogi",
    "OpenSettings": "Avaa asetukset",
    "ExpandAlert": "Laajenna hälytys",
    "CollapseAlert": "Tiivistä hälytys",
    "AlertActions": "Hälytystoiminnot",
    "PinAlert": "Kiinnitä hälytys",
    "UnpinAlert": "Poista hälytyksen kiinnitys"
  }
});