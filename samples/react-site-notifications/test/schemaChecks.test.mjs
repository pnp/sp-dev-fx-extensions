import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { checkNotificationSchema } from '../src/shared/schemaChecks.ts';

globalThis.DOMParser = new JSDOM().window.DOMParser;
const list = { Title: 'Site Notifications', BaseTemplate: 100, EnableVersioning: true };
const field = (name, type, xml, options = {}) => ({
  InternalName: name, TypeAsString: type, Required: false, Indexed: false,
  Hidden: false, ReadOnlyField: false, DefaultValue: null, SchemaXml: xml, ...options
});
const fields = () => [
  field('Title', 'Text', '<Field/>'),
  field('Message', 'Note', '<Field RichText="TRUE"/>', { Required: true }),
  field('NotificationType', 'Choice',
    '<Field FillInChoice="FALSE"><CHOICES><CHOICE>Notification</CHOICE><CHOICE>Warning</CHOICE><CHOICE>Error</CHOICE></CHOICES></Field>',
    { Required: true }),
  field('TargetSiteUrl', 'URL', '<Field Format="Hyperlink"/>', { Required: true }),
  field('IncludeSubsites', 'Boolean', '<Field/>', { DefaultValue: '0' }),
  field('IsActive', 'Boolean', '<Field/>', { DefaultValue: '0', Indexed: true }),
  field('IsModal', 'Boolean', '<Field/>', { DefaultValue: '0' }),
  field('IsDismissible', 'Boolean', '<Field/>', { DefaultValue: '1' }),
  field('StartDateTime', 'DateTime', '<Field Format="DateTime"/>'),
  field('EndDateTime', 'DateTime', '<Field Format="DateTime"/>')
];

test('accepts a compatible list and reports incompatible authoring settings', () => {
  assert.deepEqual(checkNotificationSchema(list, fields()), []);
  const invalid = fields();
  invalid[1].SchemaXml = '<Field RichText="FALSE"/>';
  invalid[2].SchemaXml = '<Field><CHOICES><CHOICE>Notification</CHOICE><CHOICE>Warning</CHOICE><CHOICE>Other</CHOICE></CHOICES></Field>';
  invalid[5].Indexed = false;
  invalid[8].SchemaXml = '<Field Format="DateOnly"/>';
  const errors = checkNotificationSchema({ ...list, EnableVersioning: false }, invalid).join(' ');
  assert.match(errors, /versioning/);
  assert.match(errors, /rich text/);
  assert.match(errors, /exactly Notification/);
  assert.match(errors, /IsActive must be indexed/);
  assert.match(errors, /StartDateTime must include both date and time/);
});

test('requires presentation fields with the configured defaults', () => {
  const missing = fields().filter(entry => entry.InternalName !== 'IsModal');
  assert.ok(checkNotificationSchema(list, missing).includes('Missing field: IsModal.'));
  const invalid = fields();
  invalid.find(entry => entry.InternalName === 'IsDismissible').DefaultValue = '0';
  assert.ok(checkNotificationSchema(list, invalid).includes('IsDismissible must default to Yes.'));
  invalid.find(entry => entry.InternalName === 'IsDismissible').DefaultValue = 'TRUE';
  assert.deepEqual(checkNotificationSchema(list, invalid), []);
});

test('rejects incomplete or malformed metadata instead of reporting success', () => {
  const missing = fields();
  delete missing[1].Required;
  assert.throws(() => checkNotificationSchema(list, missing), /incomplete field metadata/);
  const malformed = fields();
  malformed[1].SchemaXml = '<Field';
  assert.throws(() => checkNotificationSchema(list, malformed), /invalid field schema/);
  assert.throws(() => checkNotificationSchema({}, fields()), /incomplete list metadata/);
});
