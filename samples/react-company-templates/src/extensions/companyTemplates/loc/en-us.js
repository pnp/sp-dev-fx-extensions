define([], function () {
  return {
    // Common
    Common: {
      Template: 'template',
      Templates: 'templates',
      CancelButtonText: 'Cancel',
      OKButtonText: 'OK',
    },
    // CategoryFilter.tsx
    CategoryFilter: {
      DropdownPlaceholder: 'by categories',
      DropdownPlaceholderFallback: 'Filter categories',
    },
    // CopyTemplatesButton.tsx
    CopyTemplatesButton: {
      CopyTemplatesButtonText: 'Copy {0} template(s)',
      CopiedSuccessfullyMessage: 'copied successfully!',
    },
    // SettingsView.tsx
    SettingsView: {
      Title: 'Settings',
      TemplateRepository: 'Template Repository',
      TemplateRepositoryDescription: `Select the SharePoint site and list that contains your templates. It makes perfect sense if you plan to <a href="https://learn.microsoft.com/en-us/sharepoint/organization-assets-library" target='_blank' rel="noreferrer noopener" data-interception="off">use an organization assets library (as <strong>OfficeTemplateLibrary</strong>)</a> to manage your organisation templates.`,
      SelectSite: 'Select site',
      SelectSites: 'Select sites',
      FilterSites: 'Filter sites',
      SelectListLabel: 'Select your template library',
      SelectListPlaceholder: 'Select the library that stores your templates',
      SaveSettingsButtonText: 'Save settings',
      SavingInProgress: 'Saving in progress...',
      TemplateDefinitionTitle: 'Template Definition',
    },
    // SettingsTemplateDefinition.tsx
    SettingsTemplateDefinition: {
      TemplateFieldFieldPickerLabel: 'Field that contains the category',
      TemplateFieldFieldPickerPlaceholder: 'Select a category field',
      Description: 'Specify which field contains the information on the assigned category of the templates. It must be a field of type "Choice", which contains one or more selectable items.',
    },
    // StandardView.tsx
    StandardView: {
      Title: 'Choose your template(s) from the repository',
      FilterTemplatesLabel: 'Filter templates',
      LoadingTemplatesLabel: 'Loading templates...',
      SearchBoxPlaceholder: 'Search in templates and press <ENTER>',
      NoTemplatesFoundText: 'No templates found. Please specify configuration first.',
    },
  }
});