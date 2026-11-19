// Unit tests for untrusted raw rows and links (production hardening).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyRow, cleanHitRow, emptyWorkingState, hostOf, parseWorkingState, pruneRecent, tenantUrl } from '../lib/shared/summaryModel.js';
import { safeHref } from '../lib/shared/dashboardModel.js';
import {
  CENTRAL_CACHE_MS, CENTRAL_EMPTY_CACHE_MS, cachedCentralProperty, centralCacheEntry,
  homePagePath, isWebRoot, normalisePageUrl, pageKeyFor
} from '../lib/extensions/hitCounterTracker/hitUtils.js';

test('a site\'s root address counts as its home page, so the home page is one page', () => {
  assert.equal(isWebRoot('/sites/Retail', '/sites/Retail'), true);
  assert.equal(isWebRoot('/sites/retail/', '/sites/Retail'), true, 'case and trailing slash');
  assert.equal(isWebRoot('/sites/Retail/SitePages/Home.aspx', '/sites/Retail'), false);
  assert.equal(isWebRoot('/', '/'), true, 'tenant root site');
  assert.equal(homePagePath('/sites/Retail', 'SitePages/Home.aspx'), '/sites/Retail/SitePages/Home.aspx');
  assert.equal(homePagePath('/', 'SitePages/Home.aspx'), '/SitePages/Home.aspx', 'tenant root site');
  assert.equal(homePagePath('/sites/Retail/', '/SitePages/Welcome.aspx'), '/sites/Retail/SitePages/Welcome.aspx');
  assert.equal(homePagePath('/sites/Retail', ''), '/sites/Retail', 'unknown: keep the root address');
  assert.equal(homePagePath('/sites/Retail', 'Pages/default.aspx'), '/sites/Retail', 'not a Site Pages page');
  assert.equal(homePagePath('/sites/Retail', 'SitePages/Home.aspx?x=1'), '/sites/Retail', 'odd value: keep the root address');
  const viaRoot = pageKeyFor(normalisePageUrl('https://contoso.sharepoint.com', homePagePath('/sites/Retail', 'SitePages/Home.aspx')));
  const direct = pageKeyFor(normalisePageUrl('https://contoso.sharepoint.com', '/sites/Retail/SitePages/Home.aspx'));
  assert.equal(viaRoot, direct, 'both addresses give the same page key');
});

test('the central site setting is cached only for a while, and an empty answer only briefly', () => {
  const t = 1_000_000;
  const found = centralCacheEntry('https://contoso.sharepoint.com/sites/HC', t);
  assert.equal(cachedCentralProperty(found, t + CENTRAL_CACHE_MS - 1), 'https://contoso.sharepoint.com/sites/HC');
  assert.equal(cachedCentralProperty(found, t + CENTRAL_CACHE_MS), undefined, 'expired: read again');
  const empty = centralCacheEntry('', t);
  assert.equal(cachedCentralProperty(empty, t + CENTRAL_EMPTY_CACHE_MS - 1), '', 'not set: kept briefly');
  assert.equal(cachedCentralProperty(empty, t + CENTRAL_EMPTY_CACHE_MS), undefined, 'then checked again');
  assert.equal(cachedCentralProperty('', t), undefined, 'old builds cached a bare string: stale');
  assert.equal(cachedCentralProperty('https://x', t), undefined);
  assert.equal(cachedCentralProperty(undefined, t), undefined);
  assert.equal(cachedCentralProperty(found, t - 1000), undefined, 'clock moved back: read again');
});

const HOST = 'contoso.sharepoint.com';
const SITE = '8b311572-80eb-4baf-8227-97c56905069c';
const base = { Id: 1, AuthorId: 7, Created: '2026-11-18T04:00:00Z' };

test('only https addresses on the tenant host are kept', () => {
  assert.equal(tenantUrl('https://contoso.sharepoint.com/sites/a', HOST), 'https://contoso.sharepoint.com/sites/a');
  assert.equal(tenantUrl('https://CONTOSO.sharepoint.com', HOST), 'https://CONTOSO.sharepoint.com');
  assert.equal(tenantUrl('javascript:alert(1)', HOST), '');
  assert.equal(tenantUrl('http://contoso.sharepoint.com/sites/a', HOST), '', 'not https');
  assert.equal(tenantUrl('https://contoso.sharepoint.com.evil.com/x', HOST), '', 'look-alike host');
  assert.equal(tenantUrl('https://evil.com/?https://contoso.sharepoint.com', HOST), '');
  assert.equal(tenantUrl('https://contoso.sharepoint.com@evil.com/', HOST), '', 'user-info trick');
  assert.equal(hostOf('https://Contoso.sharepoint.com/sites/x'), 'contoso.sharepoint.com');
});

test('rows with a bad SiteId are skipped but still move the cursor on', () => {
  const s = emptyWorkingState();
  for (const bad of ['__proto__', 'constructor', 'site-a', '', undefined]) {
    assert.equal(cleanHitRow({ ...base, SiteId: bad }, HOST).SiteId, '');
  }
  assert.equal(applyRow(s, 'L', 'hitcounter_11', 11, cleanHitRow({ ...base, Id: 5, SiteId: '__proto__', SiteUrl: 'x' }, HOST)), 'skipped');
  assert.equal(s.cursors.L.lastId, 5);
  assert.equal(({}).url, undefined, 'Object.prototype untouched');
  assert.equal(Object.keys(s.sites).length, 0);
});

test('a good row is normalised; bad page details are dropped, the view still counts', () => {
  const ok = cleanHitRow({ ...base, SiteId: ' ' + SITE.toUpperCase() + ' ', SiteUrl: 'https://contoso.sharepoint.com/sites/a',
    PageKey: '2AB463A9ACA5CFD3', PageUrl: 'https://contoso.sharepoint.com/sites/a/SitePages/Home.aspx', PageTitle: 'Home\u0000\tpage' }, HOST);
  assert.equal(ok.SiteId, SITE);
  assert.equal(ok.PageKey, '2ab463a9aca5cfd3');
  assert.equal(ok.PageTitle, 'Home  page');
  const bad = cleanHitRow({ ...base, SiteId: SITE, SiteUrl: 'javascript:alert(1)', PageKey: 'x', PageUrl: 'javascript:alert(2)', PageTitle: 'x' }, HOST);
  assert.equal(bad.SiteUrl, '');
  assert.equal(bad.PageKey, undefined);
  assert.equal(bad.PageUrl, undefined);
  const s = emptyWorkingState();
  assert.equal(applyRow(s, 'L', 'hitcounter_11', 11, bad), 'counted');
  assert.equal(Object.keys(s.pages).length, 0);
  const long = cleanHitRow({ ...base, SiteId: SITE, PageKey: '2ab463a9aca5cfd3', PageUrl: 'javascript:x', PageTitle: 'a'.repeat(400) }, HOST);
  assert.equal(long.PageTitle.length, 255);
  assert.equal(long.PageUrl, '', 'page kept, its bad address blanked');
});

test('the same person, site and page within 30 seconds counts once', () => {
  const s = emptyWorkingState();
  const view = (Id, AuthorId, at, PageKey = '2ab463a9aca5cfd3', SiteId = SITE) =>
    applyRow(s, 'L', 'hitcounter_11', 11, { Id, AuthorId, Created: `2026-11-18T10:${at}Z`, SiteId, PageKey });
  assert.equal(view(1, 7, '00:00'), 'counted');
  assert.equal(view(2, 7, '00:10'), 'duplicate', 'flooded by hand, 10 s later');
  assert.equal(view(3, 7, '00:29'), 'duplicate', '29 s after the counted one');
  assert.equal(view(4, 7, '00:30'), 'counted', 'window measured from the last COUNTED view, like the tracker');
  assert.equal(view(5, 8, '00:31'), 'counted', 'another person');
  assert.equal(view(6, 7, '00:31', '1111111111111111'), 'counted', 'another page');
  assert.equal(view(7, 7, '00:32', '2ab463a9aca5cfd3', '8b311572-80eb-4baf-8227-97c56905069d'), 'counted', 'another site');
  assert.equal(s.duplicates, 2);
  assert.equal(s.periods[`Site|${SITE}|Day|20261118`].views, 4);
  assert.equal(s.cursors.L.lastId, 7, 'repeats still move the cursor on');
});

test('the repeat memory survives a save and is trimmed to 30 seconds', () => {
  const s = emptyWorkingState();
  applyRow(s, 'L', 'hitcounter_11', 11, { Id: 1, AuthorId: 7, Created: '2026-11-18T10:00:00Z', SiteId: SITE, PageKey: '2ab463a9aca5cfd3' });
  const resumed = parseWorkingState(JSON.stringify(s));
  assert.equal(applyRow(resumed, 'L', 'hitcounter_11', 11, { Id: 2, AuthorId: 7, Created: '2026-11-18T10:00:05Z', SiteId: SITE, PageKey: '2ab463a9aca5cfd3' }), 'duplicate');
  applyRow(resumed, 'L', 'hitcounter_11', 11, { Id: 3, AuthorId: 9, Created: '2026-11-18T10:05:00Z', SiteId: SITE, PageKey: '2ab463a9aca5cfd3' });
  pruneRecent(resumed);
  assert.deepEqual(Object.keys(resumed.recent), [`9|${SITE}|2ab463a9aca5cfd3`]);
  assert.equal(parseWorkingState('{"version":1}').duplicates, 0, 'older working files load');
});

test('links are drawn only for https addresses', () => {
  assert.equal(safeHref('https://contoso.sharepoint.com/a b'), '', 'spaces refused');
  assert.equal(safeHref('https://contoso.sharepoint.com/sites/a'), 'https://contoso.sharepoint.com/sites/a');
  assert.equal(safeHref(' JavaScript:alert(1)'), '');
  assert.equal(safeHref('data:text/html,x'), '');
  assert.equal(safeHref('https://x/"onmouseover="a'), '');
  assert.equal(safeHref(undefined), '');
});
