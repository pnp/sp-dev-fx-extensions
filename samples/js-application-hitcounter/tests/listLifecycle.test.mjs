// Unit tests for monthly list lifecycle rules (scope 8.3-8.5).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  STRONG_WARNING_ROWS,
  archiveTitle,
  classifyLists,
  deleteAfter,
  isDueForDeletion,
  nextUseOfMonth,
  parseArchiveTitle,
  sizeWarning
} from '../lib/shared/listLifecycle.js';

const list = (title, itemCount) => ({ id: title, title, itemCount, url: `/sites/x/Lists/${title}` });

test('size warning at the configured size, strong from 25 million', () => {
  assert.equal(sizeWarning(999999, 1000000), 'none');
  assert.equal(sizeWarning(1000000, 1000000), 'warn');
  assert.equal(sizeWarning(STRONG_WARNING_ROWS, 1000000), 'strong');
  assert.equal(sizeWarning(STRONG_WARNING_ROWS, 0), 'strong', 'strong warning even with warnings off');
  assert.equal(sizeWarning(5000000, 0), 'none');
});

test('active lists, archives and other lists are told apart', () => {
  const lc = classifyLists([
    list('hitcounter_11', 20000), list('hitcounter_10', 3000), list('hitcounter_01', 0),
    list('hitcounter_10_2025', 50), list('hitcounter_03_2024-2026', 9), list('hitcounter_03_2024-2026_2', 1),
    list('HitCounter_Summary', 11000), list('hitcounter_13', 5), list('hitcounter_10_backup', 1)
  ], 11, 2000);
  assert.deepEqual(lc.active.map((l) => l.title), ['hitcounter_01', 'hitcounter_10', 'hitcounter_11']);
  assert.deepEqual(lc.archives.map((l) => l.title), ['hitcounter_03_2024-2026', 'hitcounter_03_2024-2026_2', 'hitcounter_10_2025']);
  assert.deepEqual(lc.warnings.map((l) => l.title), ['hitcounter_11', 'hitcounter_10'], 'biggest first');
  const byTitle = (t) => lc.active.find((l) => l.title === t);
  assert.equal(byTitle('hitcounter_11').archivable, false, 'current month never archivable');
  assert.equal(byTitle('hitcounter_10').archivable, true);
  assert.equal(byTitle('hitcounter_01').archivable, false, 'nothing to archive in an empty list');
});

test('archive names follow the years held and never collide', () => {
  assert.equal(archiveTitle(10, 2026, 2026, []), 'hitcounter_10_2026');
  assert.equal(archiveTitle(3, 2026, 2029, []), 'hitcounter_03_2026-2029');
  assert.equal(archiveTitle(10, 2026, 2026, ['HITCOUNTER_10_2026']), 'hitcounter_10_2026_2');
  assert.equal(archiveTitle(10, 2026, 2026, ['hitcounter_10_2026', 'hitcounter_10_2026_2']), 'hitcounter_10_2026_3');
  assert.deepEqual(parseArchiveTitle('hitcounter_10_2026'), { month: 10, fromYear: 2026, toYear: 2026 });
  assert.deepEqual(parseArchiveTitle('hitcounter_03_2026-2029_2'), { month: 3, fromYear: 2026, toYear: 2029 });
  assert.equal(parseArchiveTitle('hitcounter_10_2029-2026'), undefined, 'years reversed');
  assert.equal(parseArchiveTitle('hitcounter_10'), undefined);
});

test('deletion date and the next use of a month', () => {
  assert.equal(deleteAfter('2026-11-18T10:00:00Z', 3).toISOString(), '2029-11-18T10:00:00.000Z');
  assert.equal(deleteAfter('nonsense', 3), undefined);
  assert.equal(deleteAfter('2026-11-18T10:00:00Z', 0), undefined, 'retention off');
  const now = new Date('2026-11-18T00:00:00Z');
  assert.equal(nextUseOfMonth(12, now).toISOString().substring(0, 10), '2026-12-01');
  assert.equal(nextUseOfMonth(10, now).toISOString().substring(0, 10), '2027-10-01');
  assert.equal(nextUseOfMonth(11, now).toISOString().substring(0, 10), '2027-11-01', 'current month: next year');
});

test('an archive is due only after its retention period, and never without a date', () => {
  const now = new Date('2029-11-18T10:00:00Z');
  assert.equal(isDueForDeletion('2026-11-18T10:00:00Z', 3, now), true, 'exactly 3 years');
  assert.equal(isDueForDeletion('2026-11-18T10:00:01Z', 3, now), false, 'a second early');
  assert.equal(isDueForDeletion('2026-11-18T10:00:00Z', 4, now), false);
  assert.equal(isDueForDeletion(undefined, 3, now), false, 'unknown age is kept');
  assert.equal(isDueForDeletion('garbage', 3, now), false);
});
