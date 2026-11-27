const expectedFields: Record<string, string> = {
  Message: 'Note',
  NotificationType: 'Choice',
  TargetSiteUrl: 'URL',
  IncludeSubsites: 'Boolean',
  IsActive: 'Boolean',
  IsModal: 'Boolean',
  IsDismissible: 'Boolean',
  StartDateTime: 'DateTime',
  EndDateTime: 'DateTime'
};

export function checkFieldTypes(fields: unknown[]): string[] {
  const actual: Map<string, string> = new Map();
  fields.forEach(field => {
    if (typeof field !== 'object' || field === null ||
      !('InternalName' in field) || typeof field.InternalName !== 'string' ||
      !('TypeAsString' in field) || typeof field.TypeAsString !== 'string') {
      throw new Error('SharePoint returned invalid field metadata.');
    }
    actual.set(field.InternalName, field.TypeAsString);
  });
  return Object.keys(expectedFields).reduce<string[]>((errors, name) => {
    const type: string | undefined = actual.get(name);
    if (type === undefined) errors.push(`Missing field: ${name}.`);
    else if (type !== expectedFields[name]) {
      errors.push(`${name} has type ${type}; expected ${expectedFields[name]}.`);
    }
    return errors;
  }, []);
}

interface FieldMetadata {
  InternalName: string;
  TypeAsString: string;
  Required: boolean;
  Indexed: boolean;
  Hidden: boolean;
  ReadOnlyField: boolean;
  DefaultValue: string | null;
  SchemaXml: string;
}

function isFieldMetadata(value: unknown): value is FieldMetadata {
  if (typeof value !== 'object' || value === null) return false;
  return 'InternalName' in value && typeof value.InternalName === 'string' &&
    'TypeAsString' in value && typeof value.TypeAsString === 'string' &&
    'Required' in value && typeof value.Required === 'boolean' &&
    'Indexed' in value && typeof value.Indexed === 'boolean' &&
    'Hidden' in value && typeof value.Hidden === 'boolean' &&
    'ReadOnlyField' in value && typeof value.ReadOnlyField === 'boolean' &&
    'DefaultValue' in value && (typeof value.DefaultValue === 'string' || value.DefaultValue === null) &&
    'SchemaXml' in value && typeof value.SchemaXml === 'string';
}

export function checkNotificationSchema(list: unknown, fields: unknown[]): string[] {
  if (typeof list !== 'object' || list === null || !('Title' in list) ||
    !('BaseTemplate' in list) || !('EnableVersioning' in list) ||
    typeof list.Title !== 'string' || typeof list.BaseTemplate !== 'number' ||
    typeof list.EnableVersioning !== 'boolean') {
    throw new Error('SharePoint returned incomplete list metadata.');
  }
  const errors: string[] = checkFieldTypes(fields);
  if (list.Title !== 'Site Notifications' || list.BaseTemplate !== 100) {
    errors.push('The list must be a custom list named Site Notifications.');
  }
  if (!list.EnableVersioning) errors.push('List versioning must be enabled.');

  const byName: Map<string, FieldMetadata> = new Map();
  fields.forEach(field => {
    if (!isFieldMetadata(field)) throw new Error('SharePoint returned incomplete field metadata.');
    byName.set(field.InternalName, field);
  });
  const title: FieldMetadata | undefined = byName.get('Title');
  if (!title) errors.push('Missing field: Title.');
  else {
    if (title.TypeAsString !== 'Text') errors.push('Title must be a text field.');
    if (title.Required) errors.push('Title must be optional.');
  }
  ['Message', 'NotificationType', 'TargetSiteUrl', 'IncludeSubsites', 'IsActive', 'IsModal', 'IsDismissible', 'StartDateTime', 'EndDateTime']
    .forEach(name => {
      const field: FieldMetadata | undefined = byName.get(name);
      if (field && (field.Hidden || field.ReadOnlyField)) errors.push(`${name} must be visible and editable.`);
    });
  ['Message', 'NotificationType', 'TargetSiteUrl'].forEach(name => {
    const field: FieldMetadata | undefined = byName.get(name);
    if (field && !field.Required) errors.push(`${name} must be required.`);
  });
  ['StartDateTime', 'EndDateTime'].forEach(name => {
    const field: FieldMetadata | undefined = byName.get(name);
    if (field?.Required) errors.push(`${name} must be optional.`);
  });
  ['IncludeSubsites', 'IsActive', 'IsModal'].forEach(name => {
    const field: FieldMetadata | undefined = byName.get(name);
    if (field && field.DefaultValue?.toUpperCase() !== 'FALSE' && field.DefaultValue !== '0') {
      errors.push(`${name} must default to No.`);
    }
  });
  const dismissible: FieldMetadata | undefined = byName.get('IsDismissible');
  if (dismissible && dismissible.DefaultValue?.toUpperCase() !== 'TRUE' && dismissible.DefaultValue !== '1') {
    errors.push('IsDismissible must default to Yes.');
  }
  if (byName.has('IsActive') && !byName.get('IsActive')?.Indexed) errors.push('IsActive must be indexed.');

  const expectedTypes: Record<string, string> = {
    Message: 'Note', NotificationType: 'Choice', TargetSiteUrl: 'URL',
    StartDateTime: 'DateTime', EndDateTime: 'DateTime'
  };
  Object.keys(expectedTypes).forEach(name => {
    const field: FieldMetadata | undefined = byName.get(name);
    if (!field || field.TypeAsString !== expectedTypes[name]) return;
    const xml: Document = new DOMParser().parseFromString(field.SchemaXml, 'application/xml');
    const element: Element | null = xml.documentElement;
    if (!element || element.tagName !== 'Field' || xml.querySelector('parsererror')) {
      throw new Error(`SharePoint returned invalid field schema for ${name}.`);
    }
    const attribute = (key: string): string => (element.getAttribute(key) || '').toUpperCase();
    if (name === 'Message' && (attribute('RichText') !== 'TRUE' || attribute('AppendOnly') === 'TRUE')) {
      errors.push('Message must be rich text and must not be append-only.');
    }
    if (name === 'NotificationType') {
      const choices: string[] = Array.from(element.querySelectorAll('CHOICES > CHOICE'), choice => choice.textContent || '');
      if (choices.length !== 3 || ['Notification', 'Warning', 'Error'].some(choice => choices.indexOf(choice) < 0) ||
        attribute('FillInChoice') === 'TRUE') {
        errors.push('NotificationType must offer exactly Notification, Warning, and Error without fill-in choices.');
      }
    }
    if (name === 'TargetSiteUrl' && attribute('Format') && attribute('Format') !== 'HYPERLINK') {
      errors.push('TargetSiteUrl must be a hyperlink, not an image URL.');
    }
    if ((name === 'StartDateTime' || name === 'EndDateTime') &&
      attribute('Format') && attribute('Format') !== 'DATETIME') {
      errors.push(`${name} must include both date and time.`);
    }
  });
  return errors;
}
