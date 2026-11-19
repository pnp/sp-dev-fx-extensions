// Unit tests for the central site property rules (scope F6).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { catalogAccess, centralPropertyValue, describeCentral } from '../lib/shared/centralSite.js';

const here = 'https://contoso.sharepoint.com/sites/Central';

test('the property is read as a plain URL or JSON, against this site and its setting', () => {
  assert.equal(describeCentral(undefined, here, true).state, 'not-set');
  assert.equal(describeCentral('  ', here, true).state, 'not-set');
  assert.equal(describeCentral('https://contoso.sharepoint.com/sites/central/', here, true).state, 'this-site', 'case and slash ignored');
  assert.equal(describeCentral('https://contoso.sharepoint.com/sites/Central', here, false).state, 'this-site-out-of-date', 'plain URL counts the central site');
  assert.equal(describeCentral(centralPropertyValue(here, false), here, false).state, 'this-site');
  assert.equal(describeCentral(centralPropertyValue(here, false), here, true).state, 'this-site-out-of-date');
  const other = describeCentral('https://contoso.sharepoint.com/sites/Other', here, true);
  assert.equal(other.state, 'other-site');
  assert.equal(other.centralSiteUrl, 'https://contoso.sharepoint.com/sites/Other');
  assert.equal(describeCentral('{"nope":1}', here, true).state, 'unreadable');
});

test('the value written names this site without a trailing slash', () => {
  assert.deepEqual(JSON.parse(centralPropertyValue(here + '/', true)), { centralSiteUrl: here, trackCentralSite: true });
});

test('app catalog access from effective permissions', () => {
  assert.equal(catalogAccess({ High: '2147483647', Low: '4294967295' }), 'ok');
  assert.equal(catalogAccess({ High: '2147483647', Low: '4294705151' }), 'scripts-blocked', 'ashvaleworks app catalog with custom scripts blocked');
  assert.equal(catalogAccess({ High: '0', Low: '1' }), 'no-access');
  assert.equal(catalogAccess(undefined), 'no-access');
});
