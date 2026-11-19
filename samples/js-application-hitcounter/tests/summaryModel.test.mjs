// Unit tests for the summary job's counting rules (scope 8.2).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  afterWrite,
  applyRow,
  buildWritePlan,
  countIds,
  emptyWorkingState,
  monthOfListTitle,
  parseWorkingState,
  periodSummaryKey,
  topPageKeys,
  utcKeys
} from '../lib/shared/summaryModel.js';

const LIST = 'list-guid-11';
const row = (id, author, created, site = 'site-a', page = 'p1') => ({
  Id: id, AuthorId: author, Created: created, SiteId: site, SiteUrl: 'https://t.sharepoint.com/sites/' + site,
  PageKey: page, PageUrl: 'https://t.sharepoint.com/sites/' + site + '/sitepages/' + page + '.aspx', PageTitle: 'Page ' + page
});

function period(state, scope, site, type, key) {
  const p = state.periods[periodSummaryKey(scope, site, type, key)];
  return p ? { views: p.views, visitors: countIds(p.visitors) } : undefined;
}

test('counts views and distinct visitors per site and all sites, by day, month and year', () => {
  const s = emptyWorkingState();
  applyRow(s, LIST, 'hitcounter_11', 11, row(1, 7, '2026-11-18T04:00:00Z'));
  applyRow(s, LIST, 'hitcounter_11', 11, row(2, 7, '2026-11-18T05:00:00Z', 'site-a', 'p2'));
  applyRow(s, LIST, 'hitcounter_11', 11, row(3, 9, '2026-11-19T05:00:00Z', 'site-b'));
  assert.deepEqual(period(s, 'Site', 'site-a', 'Day', '20261118'), { views: 2, visitors: 1 });
  assert.deepEqual(period(s, 'Site', 'site-b', 'Day', '20261119'), { views: 1, visitors: 1 });
  assert.deepEqual(period(s, 'AllSites', '', 'Month', '202611'), { views: 3, visitors: 2 });
  assert.deepEqual(period(s, 'AllSites', '', 'Year', '2026'), { views: 3, visitors: 2 });
  assert.equal(s.cursors[LIST].lastId, 3);
  assert.equal(s.processed, 3);
});

test('feeding the same rows again never double counts (rerun / resume)', () => {
  const s = emptyWorkingState();
  const rows = [row(1, 7, '2026-11-18T04:00:00Z'), row(2, 8, '2026-11-18T04:01:00Z')];
  rows.forEach(r => applyRow(s, LIST, 'hitcounter_11', 11, r));
  const saved = JSON.stringify(s);
  // Resume from the saved file and replay the same page of rows plus one new row.
  const resumed = parseWorkingState(saved);
  const results = rows.concat([row(3, 7, '2026-11-18T04:02:00Z')]).map(r => applyRow(resumed, LIST, 'hitcounter_11', 11, r));
  assert.deepEqual(results, ['already', 'already', 'counted']);
  assert.deepEqual(period(resumed, 'Site', 'site-a', 'Day', '20261118'), { views: 3, visitors: 2 });
});

test('a recreated list (new GUID) starts again from row 1', () => {
  const s = emptyWorkingState();
  applyRow(s, 'old-guid', 'hitcounter_11', 11, row(5, 7, '2026-11-18T04:00:00Z'));
  assert.equal(applyRow(s, 'new-guid', 'hitcounter_11', 11, row(1, 7, '2026-11-18T06:00:00Z')), 'counted');
});

test('rows in the wrong month list (bad device clock) are skipped, not counted', () => {
  const s = emptyWorkingState();
  assert.equal(applyRow(s, LIST, 'hitcounter_11', 11, row(1, 7, '2026-12-01T00:00:01Z')), 'skipped');
  assert.equal(s.skipped, 1);
  assert.equal(s.processed, 0);
  assert.equal(s.cursors[LIST].lastId, 1);
});

// The job calls afterWrite with the keys for "now minus 24 hours", so a period is
// only dropped a full day after it ends. Here the dates passed in stand for that.
test('write plan holds only changed rows; afterWrite drops periods once they have ended', () => {
  const s = emptyWorkingState();
  applyRow(s, LIST, 'hitcounter_11', 11, row(1, 7, '2026-11-18T04:00:00Z'));
  const plan = buildWritePlan(s);
  assert.equal(plan.upserts.length, 6); // site + all sites x day, month, year
  assert.equal(plan.pageUpserts.length, 1);
  const sitesDay = plan.upserts.find(r => r.SummaryKey === 'Site|site-a|Day|20261118');
  assert.equal(sitesDay.PageViews, 1);
  assert.equal(sitesDay.UniqueVisitors, 1);
  // Day after: 18th still kept (late rows could still arrive); two days after: dropped.
  afterWrite(s, utcKeys(new Date('2026-11-18T12:00:00Z')));
  assert.equal(Object.keys(s.dirty).length, 0);
  assert.ok(period(s, 'Site', 'site-a', 'Day', '20261118'));
  afterWrite(s, utcKeys(new Date('2026-11-19T01:00:00Z')));
  assert.equal(period(s, 'Site', 'site-a', 'Day', '20261118'), undefined);
  assert.ok(period(s, 'Site', 'site-a', 'Month', '202611'));
});

test('top pages: only the top N per site and month are written; dropped pages are deleted', () => {
  const s = emptyWorkingState();
  let id = 0;
  for (let p = 1; p <= 3; p++) {
    for (let v = 0; v < p; v++) {
      // A different person each time: one person's repeats within 30 s count once.
      applyRow(s, LIST, 'hitcounter_11', 11, row(++id, 100 + v, '2026-11-18T04:00:00Z', 'site-a', 'p' + p));
    }
  }
  const top2 = Object.keys(topPageKeys(s, 2));
  assert.equal(top2.length, 2);
  assert.ok(top2.indexOf('Page|site-a|p1|Month|202611') === -1);
  s.itemIds['Page|site-a|p1|Month|202611'] = 42;
  s.dirty = {};
  // With N = 50 nothing drops; the plan only deletes when a written page leaves the top N.
  assert.equal(buildWritePlan(s).pageDeletes.length, 0);
});

test('helpers', () => {
  assert.equal(monthOfListTitle('hitcounter_01'), 1);
  assert.equal(monthOfListTitle('hitcounter_12'), 12);
  assert.equal(monthOfListTitle('hitcounter_13'), 0);
  assert.equal(monthOfListTitle('hitcounter_10_2026'), 0);
  assert.deepEqual(parseWorkingState('not json'), emptyWorkingState());
  assert.deepEqual(parseWorkingState('{"version":99}'), emptyWorkingState());
});
