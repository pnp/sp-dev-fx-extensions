// Unit tests for background updates (scope 13) and the settings parser.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ADMIN_CHECK_MS, BACKGROUND_EVERY_MS, cachedAdmin, isAdminMask, updateDue } from '../lib/shared/backgroundGate.js';
import { defaultSettings, parseSettings } from '../lib/shared/schema.js';

const central = 'https://contoso.sharepoint.com/sites/Central';
const entry = (over) => JSON.stringify({ centralSiteUrl: central, user: 'i:0#.f|membership|ann@contoso.com', isAdmin: true, checkedAt: 1000, ...over });

test('the admin answer is reused for a day, for the same user and central site only', () => {
  const user = 'i:0#.f|membership|ANN@contoso.com';
  assert.equal(cachedAdmin(entry(), central + '/', user, 1000 + ADMIN_CHECK_MS - 1), true);
  assert.equal(cachedAdmin(entry({ isAdmin: false }), central, user, 5000), false, 'a "no" is cached too');
  assert.equal(cachedAdmin(entry(), central, user, 1000 + ADMIN_CHECK_MS), undefined, 'expired');
  assert.equal(cachedAdmin(entry(), central, 'i:0#.f|membership|bob@contoso.com', 2000), undefined, 'other user');
  assert.equal(cachedAdmin(entry(), 'https://contoso.sharepoint.com/sites/Other', user, 2000), undefined, 'central site changed');
  assert.equal(cachedAdmin(entry(), central, user, 500), undefined, 'checked "in the future"');
  assert.equal(cachedAdmin('not json', central, user, 2000), undefined);
  assert.equal(cachedAdmin(null, central, user, 2000), undefined);
});

test('at most one update every 15 minutes', () => {
  const now = 10 * BACKGROUND_EVERY_MS;
  assert.equal(updateDue(null, now), true);
  assert.equal(updateDue('garbage', now), true);
  assert.equal(updateDue(String(now - BACKGROUND_EVERY_MS + 1), now), false);
  assert.equal(updateDue(String(now - BACKGROUND_EVERY_MS), now), true);
  assert.equal(updateDue(String(now + 2 * BACKGROUND_EVERY_MS), now), true, 'a time far in the future does not block');
});

test('central admin = Manage permissions and Manage web', () => {
  assert.equal(isAdminMask({ High: '2147483647', Low: '4294967295' }), true, 'full control');
  assert.equal(isAdminMask({ High: '2147483647', Low: '4294705151' }), true, 'site owner with custom scripts blocked');
  assert.equal(isAdminMask({ High: '0', Low: String(0x40000000) }), false, 'manage web only');
  assert.equal(isAdminMask({ High: '0', Low: '138612833' }), false, 'read/contribute style mask');
  assert.equal(isAdminMask(undefined), false);
});

test('settings: background updates default on; old settings rows get it', () => {
  assert.equal(defaultSettings().backgroundUpdates, true);
  const old = parseSettings('{"schemaVersion":1,"trackCentralSite":false,"sizeWarningRows":10000,"archiveRetentionYears":3,"adminContact":"x"}');
  assert.equal(old.backgroundUpdates, true);
  assert.equal(old.trackCentralSite, false);
  assert.equal(old.sizeWarningRows, 10000);
  assert.equal(parseSettings('{"backgroundUpdates":false}').backgroundUpdates, false);
  assert.equal(parseSettings('{"backgroundUpdates":"no"}').backgroundUpdates, true, 'wrong type -> default');
  assert.equal(parseSettings('nonsense'), undefined);
  assert.equal(parseSettings(undefined), undefined);
});
