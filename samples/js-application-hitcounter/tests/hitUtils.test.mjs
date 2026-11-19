// Unit tests for the tracker's pure helpers.
// Run after a build (gulp build), which compiles src to lib:
//   npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEDUPE_WINDOW_MS,
  HitDeduper,
  isEditMode,
  isSameSite,
  isTrackablePage,
  monthListTitle,
  normalisePageUrl,
  pageKeyFor,
  titleReadiness,
  toUtcDateKey,
  truncateTitle,
  parseCentralProperty,
  resolveCentralConfig,
  shouldTrackSite
} from '../lib/extensions/hitCounterTracker/hitUtils.js';

const CENTRAL = 'https://contoso.sharepoint.com/sites/HitCounter';
const OTHER = 'https://contoso.sharepoint.com/sites/Sales';

test('parseCentralProperty: plain URL, JSON, and bad values', () => {
  assert.deepEqual(parseCentralProperty(CENTRAL + '/'), { centralSiteUrl: CENTRAL, trackCentralSite: true });
  assert.deepEqual(parseCentralProperty(`{"centralSiteUrl":"${CENTRAL}","trackCentralSite":false}`), { centralSiteUrl: CENTRAL, trackCentralSite: false });
  assert.equal(parseCentralProperty(''), undefined);
  assert.equal(parseCentralProperty(undefined), undefined);
  assert.equal(parseCentralProperty('not a url'), undefined);
  assert.equal(parseCentralProperty('http://contoso.sharepoint.com/sites/x'), undefined);
  assert.equal(parseCentralProperty('{broken json'), undefined);
  assert.equal(parseCentralProperty('{"trackCentralSite":false}'), undefined);
});

test('resolveCentralConfig: extension property, then tenant property, then this site', () => {
  assert.equal(resolveCentralConfig(CENTRAL, undefined, OTHER, OTHER).source, 'extension');
  assert.equal(resolveCentralConfig(CENTRAL, undefined, OTHER, OTHER).centralSiteUrl, CENTRAL);
  const tenant = resolveCentralConfig('', undefined, CENTRAL, OTHER);
  assert.equal(tenant.source, 'tenant-property');
  assert.equal(tenant.centralSiteUrl, CENTRAL);
  const own = resolveCentralConfig(undefined, undefined, '', OTHER + '/');
  assert.equal(own.source, 'this-site');
  assert.equal(own.centralSiteUrl, OTHER);
  assert.equal(own.trackCentralSite, true);
});

test('shouldTrackSite: central site skipped only when set not to be tracked', () => {
  const tracked = resolveCentralConfig(undefined, undefined, CENTRAL, OTHER);
  const notTracked = resolveCentralConfig(undefined, undefined, `{"centralSiteUrl":"${CENTRAL}","trackCentralSite":false}`, OTHER);
  assert.equal(shouldTrackSite(CENTRAL, tracked), true);
  assert.equal(shouldTrackSite(CENTRAL.toLowerCase() + '/', notTracked), false);
  assert.equal(shouldTrackSite(OTHER, notTracked), true);
});

const A = '/sites/hc/sitepages/hittest-a.aspx';
const B = '/sites/hc/sitepages/hittest-b.aspx';
const LIB = '/sites/hc/shared documents/forms/allitems.aspx';

test('titleReadiness: first load uses the server-rendered title', () => {
  assert.equal(titleReadiness({ path: A, title: 'Test A' }, undefined, A, 'Test A'), 'use');
  assert.equal(titleReadiness(undefined, undefined, A, 'Test A'), 'use');
});

test('titleReadiness: duplicate navigation event for the same page uses the title', () => {
  assert.equal(titleReadiness({ path: A, title: 'Test A' }, 'Test A', A, 'Test A'), 'use');
});

test('titleReadiness: waits while the title still shows the previous page (bug seen live)', () => {
  // A -> B: address is B, title still "Test A" from the previous page.
  assert.equal(titleReadiness({ path: A, title: 'Test A' }, 'Test A', B, 'Test A'), 'wait');
  // Title catches up.
  assert.equal(titleReadiness({ path: A, title: 'Test A' }, 'Test A', B, 'Test B'), 'use');
});

test('titleReadiness: reload on C then quick click to A waits for A (bug seen live)', () => {
  const C = '/sites/hc/sitepages/hittest-c.aspx';
  assert.equal(titleReadiness({ path: C, title: 'Test C' }, 'Test C', A, 'Test C'), 'wait');
  assert.equal(titleReadiness({ path: C, title: 'Test C' }, 'Test C', A, 'Test A'), 'use');
});

test('titleReadiness: title already updated before the navigation event fired', () => {
  assert.equal(titleReadiness({ path: A, title: 'Test A' }, 'Test B', B, 'Test B'), 'use');
});

test('titleReadiness: after a skipped library view, waits for the title to change', () => {
  // Known page is the library with an unknown title; title at navigation was "Documents".
  assert.equal(titleReadiness({ path: LIB, title: undefined }, 'Documents', B, 'Documents'), 'wait');
  assert.equal(titleReadiness({ path: LIB, title: undefined }, 'Documents', B, 'Test B'), 'use');
});

test('titleReadiness: an empty title is never used early', () => {
  assert.equal(titleReadiness({ path: A, title: 'Test A' }, 'Test A', B, ''), 'wait');
});

test('monthListTitle uses the UTC month, padded to two digits', () => {
  assert.equal(monthListTitle(new Date(Date.UTC(2026, 0, 15))), 'hitcounter_01');
  assert.equal(monthListTitle(new Date(Date.UTC(2026, 10, 6))), 'hitcounter_11');
  assert.equal(monthListTitle(new Date(Date.UTC(2026, 11, 31, 23, 59))), 'hitcounter_12');
  // 30 Nov 23:30 in UTC-5 is already 1 Dec in UTC.
  assert.equal(monthListTitle(new Date('2026-11-30T23:30:00-05:00')), 'hitcounter_12');
});

test('toUtcDateKey formats yyyyMMdd in UTC', () => {
  assert.equal(toUtcDateKey(new Date(Date.UTC(2026, 10, 6, 12))), '20261106');
  assert.equal(toUtcDateKey(new Date(Date.UTC(2027, 0, 1, 0, 0, 1))), '20270101');
  assert.equal(toUtcDateKey(new Date('2026-11-06T22:00:00-05:00')), '20261107');
});

test('normalisePageUrl lower-cases and drops trailing slashes', () => {
  assert.equal(
    normalisePageUrl('https://contoso.sharepoint.com', '/sites/HR/SitePages/Home.aspx'),
    'https://contoso.sharepoint.com/sites/hr/sitepages/home.aspx'
  );
  assert.equal(
    normalisePageUrl('https://contoso.sharepoint.com', '/sites/HR/'),
    'https://contoso.sharepoint.com/sites/hr'
  );
  assert.equal(normalisePageUrl('https://contoso.sharepoint.com', '/'), 'https://contoso.sharepoint.com/');
});

test('isTrackablePage counts site pages and the web root', () => {
  assert.equal(isTrackablePage('/sites/hr/SitePages/Home.aspx', '', '/sites/hr'), true);
  assert.equal(isTrackablePage('/sites/hr/SitePages/News/Update.aspx', '', '/sites/hr'), true);
  assert.equal(isTrackablePage('/sites/hr', '', '/sites/hr'), true);
  assert.equal(isTrackablePage('/sites/hr/', '', '/sites/hr'), true);
  assert.equal(isTrackablePage('/SitePages/Home.aspx', '', '/'), true);
  assert.equal(isTrackablePage('/', '', '/'), true);
  assert.equal(isTrackablePage('/sites/hr/SitePages/Home.aspx', '?web=1&utm=x', '/sites/hr'), true);
});

test('isTrackablePage skips edit mode, lists, libraries and layouts', () => {
  assert.equal(isTrackablePage('/sites/hr/SitePages/Home.aspx', '?Mode=Edit', '/sites/hr'), false);
  assert.equal(isTrackablePage('/sites/hr/SitePages/Home.aspx', '?a=1&mode=edit', '/sites/hr'), false);
  assert.equal(isTrackablePage('/sites/hr/Lists/Tasks/AllItems.aspx', '', '/sites/hr'), false);
  assert.equal(isTrackablePage('/sites/hr/Shared Documents/Forms/AllItems.aspx', '', '/sites/hr'), false);
  assert.equal(isTrackablePage('/sites/hr/_layouts/15/viewlsts.aspx', '', '/sites/hr'), false);
  assert.equal(isTrackablePage('/sites/hr/SitePages/Forms/ByAuthor.aspx', '', '/sites/hr'), false);
  assert.equal(isTrackablePage('/SitePages/Forms/AllPages.aspx', '', '/'), false);
  assert.equal(isTrackablePage('/sites/finance/SitePages/Home.aspx', '', '/sites/hr'), false);
  assert.equal(isTrackablePage('/sites/hr/SitePages/', '', '/sites/hr'), false);
});

test('isEditMode only matches the Mode parameter', () => {
  assert.equal(isEditMode('?Mode=Edit'), true);
  assert.equal(isEditMode('?x=1&MODE=EDIT&y=2'), true);
  assert.equal(isEditMode('?mode=editor'), false);
  assert.equal(isEditMode('?displaymode=edit'), false);
  assert.equal(isEditMode(''), false);
});

test('isSameSite compares site URLs ignoring case and trailing slash', () => {
  assert.equal(isSameSite('https://contoso.sharepoint.com/sites/HitCounter',
    'https://contoso.sharepoint.com/sites/hitcounter/'), true);
  assert.equal(isSameSite('https://contoso.sharepoint.com/sites/hr',
    'https://contoso.sharepoint.com/sites/hitcounter'), false);
  assert.equal(isSameSite('https://contoso.sharepoint.com/sites/hr', ''), false);
  assert.equal(isSameSite('https://contoso.sharepoint.com/sites/hr', undefined), false);
});

test('pageKeyFor is stable, 16 hex characters, and differs between pages', () => {
  const a = pageKeyFor('https://contoso.sharepoint.com/sites/hr/sitepages/home.aspx');
  const b = pageKeyFor('https://contoso.sharepoint.com/sites/hr/sitepages/home.aspx');
  const c = pageKeyFor('https://contoso.sharepoint.com/sites/hr/sitepages/news.aspx');
  assert.match(a, /^[0-9a-f]{16}$/);
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(pageKeyFor(''), /^[0-9a-f]{16}$/);
});

test('truncateTitle collapses whitespace and limits to 255 characters', () => {
  assert.equal(truncateTitle('  Home \n  page  '), 'Home page');
  assert.equal(truncateTitle('x'.repeat(300)).length, 255);
  assert.equal(truncateTitle(''), '');
});

test('HitDeduper counts a page once per 30-second window', () => {
  const deduper = new HitDeduper();
  const t0 = 1_000_000;
  assert.equal(DEDUPE_WINDOW_MS, 30000);
  assert.equal(deduper.shouldRecord('page-a', t0), true);
  assert.equal(deduper.shouldRecord('page-a', t0 + 1000), false);
  assert.equal(deduper.shouldRecord('page-b', t0 + 1000), true, 'other pages are not blocked');
  assert.equal(deduper.shouldRecord('page-a', t0 + 29999), false);
  assert.equal(deduper.shouldRecord('page-a', t0 + 30000), true, 'counts again after the window');
});

test('HitDeduper counts A -> B -> A navigation as three views after the window', () => {
  const deduper = new HitDeduper(30000);
  const t0 = 5_000_000;
  assert.equal(deduper.shouldRecord('a', t0), true);
  assert.equal(deduper.shouldRecord('b', t0 + 5000), true);
  assert.equal(deduper.shouldRecord('a', t0 + 10000), false, 'back to A inside 30s is not a new view');
  assert.equal(deduper.shouldRecord('a', t0 + 40000), true);
});
