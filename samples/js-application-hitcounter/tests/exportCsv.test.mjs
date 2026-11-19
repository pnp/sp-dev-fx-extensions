// Unit tests for the CSV export (scope N1).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { chunk, csvField, exportFileName, pagesCsv, periodKeys, rangeProblem, totalsCsv } from '../lib/shared/exportCsv.js';

const row = (Scope, SiteId, SiteName, PeriodType, PeriodKey, PageViews, UniqueVisitors) =>
  ({ Scope, SiteId, SiteName, SiteUrl: SiteId ? `https://x/sites/${SiteId}` : undefined, PeriodType, PeriodKey, PageViews, UniqueVisitors });

test('period keys for a range, across month and year ends', () => {
  assert.deepEqual(periodKeys('day', '2026-12-30', '2027-01-02'), ['20261230', '20261231', '20270101', '20270102']);
  assert.deepEqual(periodKeys('month', '2026-11-18', '2027-02-01'), ['202611', '202612', '202701', '202702']);
  assert.deepEqual(periodKeys('day', '2028-02-28', '2028-03-01'), ['20280228', '20280229', '20280301'], 'leap day');
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});

test('ranges are checked', () => {
  assert.equal(rangeProblem('day', '2026-11-01', '2026-11-18'), undefined);
  assert.match(rangeProblem('day', '2026-11-18', '2026-11-01'), /after/);
  assert.match(rangeProblem('day', '', '2026-11-01'), /both/);
  assert.match(rangeProblem('day', '2026-02-30', '2026-03-01'), /both/, 'not a real date');
  assert.match(rangeProblem('day', '2025-01-01', '2026-11-18'), /366/);
  assert.equal(rangeProblem('month', '2020-01-01', '2026-11-18'), undefined, 'monthly has no limit');
});

test('CSV fields are quoted and can never run as formulas', () => {
  assert.equal(csvField('Plain'), 'Plain');
  assert.equal(csvField('a, b'), '"a, b"');
  assert.equal(csvField('say "hi"'), '"say ""hi"""');
  assert.equal(csvField('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvField('+1'), "'+1");
  assert.equal(csvField('@SUM(A1)'), "'@SUM(A1)");
  assert.equal(csvField(-5), '-5', 'numbers stay numbers');
  assert.equal(csvField(undefined), '');
});

const rows = [
  row('Site', 'b', 'Beta', 'Day', '20261102', 4, 2),
  row('Site', 'a', 'Alpha', 'Day', '20261102', 3, 1),
  row('AllSites', undefined, undefined, 'Day', '20261102', 7, 2),
  row('Site', 'a', 'Alpha', 'Day', '20261101', 1, 1),
  row('Site', 'a', 'Alpha', 'Day', '20261031', 9, 9),
  row('Site', 'a', 'Alpha', 'Month', '202611', 4, 1),
  row('System', undefined, 'admin', 'System', '2026-11-18T00:00:00Z', 0, 0)
];

test('daily totals: in range, oldest first, All sites first, then sites A to Z', () => {
  const csv = totalsCsv(rows, { detail: 'day', from: '2026-11-01', to: '2026-11-30', siteId: '', allSites: true });
  assert.ok(csv.startsWith('﻿'), 'BOM so Excel reads UTF-8');
  assert.deepEqual(csv.slice(1).trim().split('\r\n'), [
    'Date (UTC),Site,Site URL,Page views,Visitors',
    '2026-11-01,Alpha,https://x/sites/a,1,1',
    '2026-11-02,All sites,,7,2',
    '2026-11-02,Alpha,https://x/sites/a,3,1',
    '2026-11-02,Beta,https://x/sites/b,4,2'
  ]);
});

test('one site, site owners and monthly detail', () => {
  const one = totalsCsv(rows, { detail: 'day', from: '2026-11-01', to: '2026-11-30', siteId: 'b', allSites: true });
  assert.equal(one.trim().split('\r\n').length, 2, 'header + Beta only, no All sites');
  const owner = totalsCsv(rows, { detail: 'day', from: '2026-11-01', to: '2026-11-30', siteId: '', onlySites: ['b'], allSites: false });
  assert.match(owner, /Beta/);
  assert.doesNotMatch(owner, /Alpha|All sites/);
  const monthly = totalsCsv(rows, { detail: 'month', from: '2026-11-01', to: '2026-11-18', siteId: '', allSites: true });
  assert.deepEqual(monthly.slice(1).trim().split('\r\n'), ['Month (UTC),Site,Site URL,Page views,Visitors', '2026-11,Alpha,https://x/sites/a,4,1']);
});

test('top pages: busiest first within each month, titles made safe', () => {
  const pages = [
    { ...row('Site', 'a', 'Alpha', 'Month', '202611', 2, 1), PageTitle: 'Home', PageUrl: '/a' },
    { ...row('Site', 'a', 'Alpha', 'Month', '202611', 5, 2), PageTitle: '=cmd', PageUrl: '/b' },
    { ...row('Site', 'a', 'Alpha', 'Month', '202610', 1, 1), PageTitle: 'Old', PageUrl: '/c' }
  ];
  const csv = pagesCsv(pages, { detail: 'day', from: '2026-11-01', to: '2026-11-18', siteId: '', allSites: true });
  assert.deepEqual(csv.slice(1).trim().split('\r\n'), [
    'Month (UTC),Site,Site URL,Page title,Page URL,Page views,Visitors',
    "2026-11,Alpha,https://x/sites/a,'=cmd,/b,5,2",
    '2026-11,Alpha,https://x/sites/a,Home,/a,2,1'
  ]);
  assert.equal(exportFileName('daily', '2026-11-01', '2026-11-18'), 'hitcounter-daily-2026-11-01-to-2026-11-18.csv');
});
