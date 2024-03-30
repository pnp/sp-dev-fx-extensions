declare interface ICompanyTemplatesCommandSetStrings {
  // Common
  Common: {
    Template: string;
    Templates: string;
    CancelButtonText: string;
    OKButtonText: string;
  };
  // CategoryFilter.tsx
  CategoryFilter: {
    DropdownPlaceholder: string;
    DropdownPlaceholderFallback: string;
  };
  // CopyTemplatesButton.tsx
  CopyTemplatesButton: {
    CopyTemplatesButtonText: string;
    CopiedSuccessfullyMessage: string;
  };
  // SettingsView.tsx
  SettingsView: {
    Title: string;
    TemplateRepository: string;
    TemplateRepositoryDescription: string;
    SelectSite: string;
    SelectSites: string;
    FilterSites: string;
    SelectListLabel: string;
    SelectListPlaceholder: string;
    SaveSettingsButtonText: string;
    SavingInProgress: string;
    TemplateDefinitionTitle: string;
  };
  // SettingsTemplateDefinition.tsx
  SettingsTemplateDefinition: {
    TemplateFieldFieldPickerLabel: string;
    TemplateFieldFieldPickerPlaceholder: string;
    Description: string;
  }
  // StandardView.tsx
  StandardView: {
    Title: string;
    FilterTemplatesLabel: string;
    LoadingTemplatesLabel: string;
    SearchBoxPlaceholder: string;
    NoTemplatesFoundText: string;
  }
}

declare module 'CompanyTemplatesCommandSetStrings' {
  const strings: ICompanyTemplatesCommandSetStrings;
  export = strings;
}
