import test from 'node:test';
import assert from 'node:assert/strict';
import { checkFieldTypes } from '../src/shared/schemaChecks.ts';

const fields = [
  ['Message', 'Note'],
  ['NotificationType', 'Choice'],
  ['TargetSiteUrl', 'URL'],
  ['IncludeSubsites', 'Boolean'],
  ['IsActive', 'Boolean'],
  ['IsModal', 'Boolean'],
  ['IsDismissible', 'Boolean'],
  ['StartDateTime', 'DateTime'],
  ['EndDateTime', 'DateTime']
].map(([InternalName, TypeAsString]) => ({ InternalName, TypeAsString }));

test('reports missing fields and incompatible types', () => {
  assert.deepEqual(checkFieldTypes(fields), []);
  const errors = checkFieldTypes([
    ...fields.filter(field => field.InternalName !== 'Message' && field.InternalName !== 'IsActive'),
    { InternalName: 'IsActive', TypeAsString: 'Text' }
  ]);
  assert.ok(errors.some(error => error.includes('Missing field: Message')));
  assert.ok(errors.some(error => error.includes('IsActive has type Text')));
});

test('does not present malformed metadata as a successful check', () => {
  assert.throws(() => checkFieldTypes([...fields, { InternalName: 'Other' }]), /invalid field metadata/);
});
