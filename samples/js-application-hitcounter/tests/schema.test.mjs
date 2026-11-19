// Unit tests for the HitCounter data model and permission arithmetic.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PERMISSION_LEVEL_KINDS,
  PermissionKind,
  SCHEMA_VERSION,
  allListDefinitions,
  defaultSettings,
  everyoneExceptExternalClaim,
  fieldSchemaXml,
  hasPermission,
  toBasePermissions
} from '../lib/shared/schema.js';

test('toBasePermissions sets the documented SharePoint bits', () => {
  // ViewListItems=1 -> bit 0, AddListItems=2 -> bit 1, Open=17 -> bit 16, ViewPages=18 -> bit 17.
  assert.deepEqual(toBasePermissions([PermissionKind.ViewListItems]), { Low: 1, High: 0 });
  assert.deepEqual(toBasePermissions([PermissionKind.AddListItems]), { Low: 2, High: 0 });
  assert.deepEqual(toBasePermissions([PermissionKind.Open]), { Low: 0x10000, High: 0 });
  // UseRemoteAPIs=38 -> High bit 5.
  assert.deepEqual(toBasePermissions([PermissionKind.UseRemoteAPIs]), { Low: 0, High: 0x20 });
  // ManageWeb=31 -> bit 30; a kind of 32 must stay unsigned.
  assert.deepEqual(toBasePermissions([32]), { Low: 0x80000000, High: 0 });
});

test('HitCounter Add level = view + add items, view pages, open, remote APIs', () => {
  assert.deepEqual(toBasePermissions(PERMISSION_LEVEL_KINDS), { Low: 0x30003, High: 0x20 });
});

test('hasPermission reads masks returned as strings by SharePoint', () => {
  // Full Control is Low 4294967295, High 2147483647.
  const full = { Low: '4294967295', High: '2147483647' };
  assert.equal(hasPermission(full, PermissionKind.ManageWeb), true);
  assert.equal(hasPermission(full, PermissionKind.ManagePermissions), true);
  assert.equal(hasPermission(full, PermissionKind.UseRemoteAPIs), true);
  // Read is Low 138612833 (0x8431061), High 176.
  const read = { Low: '138612833', High: '176' };
  assert.equal(hasPermission(read, PermissionKind.ViewListItems), true);
  assert.equal(hasPermission(read, PermissionKind.AddListItems), false);
  assert.equal(hasPermission(read, PermissionKind.ManageWeb), false);
  assert.equal(hasPermission(read, PermissionKind.UseRemoteAPIs), true);
});

test('allListDefinitions: 12 monthly lists, 3 lists and 1 library', () => {
  const lists = allListDefinitions();
  assert.equal(lists.length, 16);
  const titles = lists.map((l) => l.title);
  assert.equal(titles[0], 'hitcounter_01');
  assert.equal(titles[11], 'hitcounter_12');
  assert.deepEqual(titles.slice(12), ['HitCounter_Summary', 'HitCounter_PageSummary', 'HitCounter_State', 'HitCounter_Working']);
  assert.equal(lists.filter((l) => l.baseTemplate === 101).length, 1);
});

test('monthly lists: record audience, own items only, indexed SiteId and HitDate', () => {
  for (const list of allListDefinitions().slice(0, 12)) {
    assert.equal(list.audience, 'record');
    assert.equal(list.ownItemsOnly, true);
    const indexed = list.fields.filter((f) => f.indexed).map((f) => f.name).sort();
    assert.deepEqual(indexed, ['HitDate', 'SiteId']);
  }
});

test('audiences match scope 9.3', () => {
  const byTitle = {};
  for (const l of allListDefinitions()) { byTitle[l.title] = l; }
  assert.equal(byTitle.HitCounter_Summary.audience, 'read');
  assert.equal(byTitle.HitCounter_PageSummary.audience, 'owners');
  assert.equal(byTitle.HitCounter_State.audience, 'owners');
  assert.equal(byTitle.HitCounter_Working.audience, 'owners');
});

test('summary lists have a unique, indexed SummaryKey', () => {
  for (const title of ['HitCounter_Summary', 'HitCounter_PageSummary']) {
    const list = allListDefinitions().filter((l) => l.title === title)[0];
    const key = list.fields.filter((f) => f.name === 'SummaryKey')[0];
    assert.equal(key.indexed, true);
    assert.equal(key.unique, true);
  }
});

test('fieldSchemaXml produces the expected SharePoint field XML', () => {
  assert.equal(
    fieldSchemaXml({ name: 'SiteId', type: 'Text', indexed: true }),
    '<Field Type="Text" Name="SiteId" StaticName="SiteId" DisplayName="SiteId" Required="FALSE" Indexed="TRUE" MaxLength="255" />'
  );
  assert.match(fieldSchemaXml({ name: 'PageUrl', type: 'Note' }), /Type="Note".*RichText="FALSE"/);
  assert.match(fieldSchemaXml({ name: 'PageViews', type: 'Number' }), /Type="Number".*Decimals="0"/);
  assert.match(fieldSchemaXml({ name: 'SummaryKey', type: 'Text', indexed: true, unique: true }), /Indexed="TRUE" EnforceUniqueValues="TRUE"/);
});

test('defaults and claims', () => {
  const s = defaultSettings();
  assert.equal(s.schemaVersion, SCHEMA_VERSION);
  assert.equal(s.recordHitsBy, 'everyone');
  assert.equal(s.trackCentralSite, true);
  assert.equal(s.sizeWarningRows, 1000000);
  assert.equal(s.archiveRetentionYears, 3);
  assert.equal(everyoneExceptExternalClaim('d7720c15-72f8-4970-b519-18e153f44839'),
    'c:0-.f|rolemanager|spo-grid-all-users/d7720c15-72f8-4970-b519-18e153f44839');
});
