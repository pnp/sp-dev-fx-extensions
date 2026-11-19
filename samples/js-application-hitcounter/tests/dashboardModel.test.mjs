// Unit tests for the dashboard figures (scope 8.1): history + live state.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDashboard,
  filterSites,
  relativeTime,
  sortSiteRows,
  formatCount,
  lastDayKeys,
  lastMonthKeys,
  periodLabel
} from '../lib/shared/dashboardModel.js';
import { applyRow, emptyWorkingState } from '../lib/shared/summaryModel.js';

const NOW = new Date('2026-11-18T10:00:00Z');
const A = 'site-a';
const B = 'site-b';

function hist(scope, siteId, type, key, views, visitors, name) {
  return {
    Scope: scope, SiteId: siteId, SiteUrl: siteId ? `https://t.sharepoint.com/sites/${siteId}` : '',
    SiteName: name || (siteId ? siteId.toUpperCase() : 'All sites'), PeriodType: type, PeriodKey: key,
    PageViews: views, UniqueVisitors: visitors
  };
}

function row(id, siteId, author, created, pageKey) {
  return {
    Id: id, AuthorId: author, Created: created, SiteId: siteId,
    SiteUrl: `https://t.sharepoint.com/sites/${siteId}`, PageKey: pageKey || 'home', PageUrl: `https://t.sharepoint.com/sites/${siteId}/${pageKey || 'home'}`, PageTitle: pageKey || 'Home'
  };
}

test('key helpers and labels', () => {
  const days = lastDayKeys(NOW, 30);
  assert.equal(days.length, 30);
  assert.equal(days[29], '20261118');
  assert.equal(days[0], '20261020');
  const months = lastMonthKeys(NOW, 12);
  assert.deepEqual([months[0], months[11]], ['202512', '202611']);
  assert.equal(lastMonthKeys(new Date('2026-01-31T00:00:00Z'), 2)[0], '202512');
  assert.equal(periodLabel('20261108'), '8 Nov');
  assert.equal(periodLabel('202611'), 'Nov 2026');
});

test('formatCount: full below 10,000, compact above', () => {
  assert.equal(formatCount(0), '0');
  assert.equal(formatCount(1284), '1,284');
  assert.equal(formatCount(12900), '12.9K');
  assert.equal(formatCount(125000), '125K');
  assert.equal(formatCount(4200000), '4.2M');
});

test('history only: finished days and months come from the Summary list', () => {
  const history = [
    hist('AllSites', '', 'Day', '20261117', 5, 2),
    hist('Site', A, 'Day', '20261117', 5, 2),
    hist('AllSites', '', 'Month', '202610', 40, 3),
    hist('Site', A, 'Month', '202610', 40, 3),
    hist('AllSites', '', 'Year', '2026', 45, 3),
    hist('Site', A, 'Year', '2026', 45, 3)
  ];
  const m = buildDashboard(history, undefined, '', NOW);
  assert.equal(m.days[28].views, 5);
  assert.equal(m.months[10].views, 40);
  assert.equal(m.year.views, 45);
  assert.equal(m.today.views, 0);
  assert.equal(m.sites.length, 1);
  assert.equal(m.topPages.length, 0, 'top pages need the live state');
});

test('live state wins for open periods and adds rows not yet summarised', () => {
  const history = [
    hist('AllSites', '', 'Day', '20261118', 1, 1),
    hist('Site', A, 'Day', '20261118', 1, 1),
    hist('AllSites', '', 'Month', '202611', 1, 1),
    hist('Site', A, 'Month', '202611', 1, 1)
  ];
  const live = emptyWorkingState();
  applyRow(live, 'L11', 'hitcounter_11', 11, row(1, A, 7, '2026-11-18T08:00:00Z', 'home'));
  applyRow(live, 'L11', 'hitcounter_11', 11, row(2, A, 8, '2026-11-18T09:00:00Z', 'home'));
  applyRow(live, 'L11', 'hitcounter_11', 11, row(3, B, 7, '2026-11-18T09:30:00Z', 'news'));
  const m = buildDashboard(history, live, '', NOW);
  assert.deepEqual(m.today, { views: 3, visitors: 2 }, 'user 7 on two sites counts once across all sites');
  assert.deepEqual(m.days[29], { key: '20261118', label: '18 Nov', views: 3, visitors: 2 });
  const a = m.siteRows.find((r) => r.site.siteId === A);
  assert.deepEqual(a.today, { views: 2, visitors: 2 });
  assert.equal(m.topPages[0].title, 'home');
  assert.equal(m.topPages[0].views, 2);
  assert.equal(m.share.length, 2);
  assert.equal(m.share[0].siteId, A);
});

test('selecting a site filters every figure; colours follow the site, not the filter', () => {
  const live = emptyWorkingState();
  applyRow(live, 'L11', 'hitcounter_11', 11, row(1, A, 7, '2026-11-18T08:00:00Z', 'home'));
  applyRow(live, 'L11', 'hitcounter_11', 11, row(2, B, 8, '2026-11-18T09:00:00Z', 'news'));
  applyRow(live, 'L11', 'hitcounter_11', 11, row(3, B, 8, '2026-11-18T09:10:00Z', 'news'));
  const all = buildDashboard([], live, '', NOW);
  const onlyB = buildDashboard([], live, B, NOW);
  assert.equal(onlyB.selection, B);
  assert.deepEqual(onlyB.today, { views: 2, visitors: 1 });
  assert.equal(onlyB.share.length, 0, 'no site share for one site');
  assert.deepEqual(onlyB.topPages.map((p) => p.title), ['news']);
  const colourAll = all.sites.find((s) => s.siteId === B).colour;
  const colourOne = onlyB.sites.find((s) => s.siteId === B).colour;
  assert.equal(colourAll, colourOne);
  assert.equal(onlyB.topPages[0].colour, colourOne);
  assert.equal(buildDashboard([], live, 'gone', NOW).selection, '', 'unknown site falls back to all sites');
});

test('sites past the sixth share the neutral colour and fold into Other sites', () => {
  const live = emptyWorkingState();
  for (let i = 0; i < 8; i++) {
    applyRow(live, 'L11', 'hitcounter_11', 11, row(i + 1, `s${i}`, 1, '2026-11-18T08:00:00Z'));
  }
  const m = buildDashboard([], live, '', NOW);
  assert.deepEqual(m.sites.map((s) => s.colour), [0, 1, 2, 3, 4, 5, -1, -1]);
  assert.equal(m.share.length, 7);
  assert.equal(m.share[6].name, 'Other sites');
  assert.equal(m.share[6].views, 2);
});

test('sites table sorts by any column, ties by name, without changing the input', () => {
  const r = (name, today, year) => ({ site: { siteId: name, name, url: '', colour: 0 },
    today: { views: today, visitors: 1 }, month: { views: 0, visitors: 0 }, year: { views: year, visitors: 1 } });
  const rows = [r('beta', 5, 10), r('Alpha', 5, 30), r('gamma', 9, 20)];
  assert.deepEqual(sortSiteRows(rows, 'yearViews', true).map((x) => x.site.name), ['Alpha', 'gamma', 'beta']);
  assert.deepEqual(sortSiteRows(rows, 'yearViews', false).map((x) => x.site.name), ['beta', 'gamma', 'Alpha']);
  assert.deepEqual(sortSiteRows(rows, 'todayViews', true).map((x) => x.site.name), ['gamma', 'Alpha', 'beta'], 'tie 5/5 -> A to Z');
  assert.deepEqual(sortSiteRows(rows, 'name', false).map((x) => x.site.name), ['Alpha', 'beta', 'gamma'], 'case-insensitive');
  assert.deepEqual(sortSiteRows(rows, 'name', true).map((x) => x.site.name), ['gamma', 'beta', 'Alpha']);
  assert.deepEqual(rows.map((x) => x.site.name), ['beta', 'Alpha', 'gamma'], 'input untouched');
});

test('site search matches name or address, case-insensitive', () => {
  const sites = [
    { siteId: '1', name: 'HR Hub', url: 'https://t.sharepoint.com/sites/people', colour: 0 },
    { siteId: '2', name: 'Finance', url: 'https://t.sharepoint.com/sites/fin-hr-shared', colour: 1 },
    { siteId: '3', name: 'Sales', url: 'https://t.sharepoint.com/sites/sales', colour: 2 }
  ];
  assert.deepEqual(filterSites(sites, ' hr ').map((s) => s.siteId), ['1', '2']);
  assert.deepEqual(filterSites(sites, 'PEOPLE').map((s) => s.siteId), ['1']);
  assert.equal(filterSites(sites, '').length, 3);
  assert.equal(filterSites(sites, 'nothing').length, 0);
});

test('the six colours go to the busiest sites this year, whatever their address', () => {
  const live = emptyWorkingState();
  let id = 1;
  for (let i = 0; i < 8; i++) {
    // Site s7 (last by address) is the busiest; s0 the quietest.
    for (let k = 0; k <= i; k++) {
      // A different person each time: one person's repeats within 30 s count once.
      applyRow(live, 'L11', 'hitcounter_11', 11, row(id++, `s${i}`, 100 + k, '2026-11-18T08:00:00Z'));
    }
  }
  const m = buildDashboard([], live, '', NOW);
  const colour = (siteId) => m.sites.find((s) => s.siteId === siteId).colour;
  assert.deepEqual(['s7', 's6', 's5', 's4', 's3', 's2'].map(colour), [0, 1, 2, 3, 4, 5]);
  assert.equal(colour('s1'), -1);
  assert.equal(colour('s0'), -1);
  assert.deepEqual(m.sites.map((s) => s.siteId), ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'], 'picker stays A to Z');
  assert.equal(buildDashboard([], live, 's0', NOW).sites.find((s) => s.siteId === 's7').colour, 0, 'filter never repaints');
});

test('site owner view: only owned sites, added together, no all-sites rows or live data', () => {
  const C = 'site-c';
  const history = [
    hist('AllSites', '', 'Year', '2026', 100, 9),
    hist('Site', A, 'Year', '2026', 40, 3),
    hist('Site', B, 'Year', '2026', 35, 4),
    hist('Site', C, 'Year', '2026', 25, 2),
    hist('Site', A, 'Day', '20261117', 6, 2),
    hist('Site', B, 'Day', '20261117', 4, 1)
  ];
  const live = emptyWorkingState();
  applyRow(live, 'L11', 'hitcounter_11', 11, row(1, A, 7, '2026-11-18T08:00:00Z'));
  const m = buildDashboard(history, live, '', NOW, { onlySites: [A, B], allLabel: 'All my sites' });
  assert.deepEqual(m.sites.map((s) => s.siteId).sort(), [A, B], 'site C hidden');
  assert.deepEqual(m.year, { views: 75, visitors: 7 }, 'A + B, never the all-sites 100');
  assert.equal(m.selectionName, 'All my sites');
  assert.equal(m.allSitesRow.site.name, 'All my sites');
  assert.deepEqual(m.allSitesRow.year, { views: 75, visitors: 7 });
  assert.equal(m.days[28].views, 10);
  assert.equal(m.today.views, 0, 'live rows are ignored for owners');
  assert.equal(m.topPages.length, 0);
  const one = buildDashboard(history, live, B, NOW, { onlySites: [A, B] });
  assert.deepEqual(one.year, { views: 35, visitors: 4 });
  assert.equal(buildDashboard(history, live, C, NOW, { onlySites: [A, B] }).selection, '', 'cannot pick a site not owned');
});

test('relative time for the last-updated line', () => {
  const t = Date.parse('2026-11-18T12:00:00Z');
  const ago = (ms) => relativeTime(new Date(t - ms), new Date(t));
  assert.equal(ago(20 * 1000), 'just now');
  assert.equal(ago(60 * 1000), '1 minute ago');
  assert.equal(ago(45 * 60 * 1000), '45 minutes ago');
  assert.equal(ago(3 * 3600 * 1000), '3 hours ago');
  assert.equal(ago(47 * 3600 * 1000), '47 hours ago');
  assert.equal(ago(3 * 86400 * 1000), '3 days ago');
});
