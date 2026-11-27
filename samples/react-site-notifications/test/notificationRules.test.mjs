import test from 'node:test';
import assert from 'node:assert/strict';
import {
  eligibleNotifications,
  isTargetWithinCollection,
  matchesTarget,
  nextBoundary,
  validateNotification
} from '../src/shared/notificationRules.ts';

const root = 'https://example.sharepoint.com/sites/Finance';
const payroll = `${root}/Payroll`;
const item = {
  id: 1,
  message: '<p>Notice</p>',
  type: 'Notification',
  targetSiteUrl: payroll,
  includeSubsites: false,
  isActive: true,
  isModal: false,
  isDismissible: false,
  fingerprint: 'a'.repeat(64),
  startDateTime: null,
  endDateTime: null
};

test('matches an exact site or its descendants only when requested', () => {
  assert.equal(matchesTarget(payroll, `${payroll}/`, root, false), true);
  assert.equal(matchesTarget(payroll, `${payroll}/Benefits`, root, false), false);
  assert.equal(matchesTarget(payroll, `${payroll}/Benefits`, root, true), true);
  assert.equal(matchesTarget(payroll, `${root}/Payroll2`, root, true), false);
  assert.equal(matchesTarget(payroll, root, root, true), false);
  assert.equal(matchesTarget(root, payroll, root, true), true);
  assert.equal(matchesTarget(root, payroll, root, false), false);
});

test('rejects URLs outside the collection and encoded path separators', () => {
  assert.equal(isTargetWithinCollection(`${root}2/Payroll`, root), false);
  assert.equal(isTargetWithinCollection(`${payroll}?query=1`, root), false);
  assert.equal(isTargetWithinCollection(`${root}/Payroll%2FBenefits`, root), false);
  assert.equal(isTargetWithinCollection('https://other.example/sites/Finance', root), false);
  assert.equal(matchesTarget(`${root}/My%20Site`, `${root}/my%20site/`, root, false), true);
});

test('honors inclusive starts, exclusive ends and severity ordering', () => {
  const start = Date.parse('2026-01-01T10:00:00Z');
  const end = Date.parse('2026-01-01T11:00:00Z');
  const scheduled = { ...item, startDateTime: new Date(start).toISOString(), endDateTime: new Date(end).toISOString() };
  const error = { ...scheduled, id: 2, type: 'Error' };
  assert.equal(eligibleNotifications([scheduled], payroll, root, start - 1).length, 0);
  assert.deepEqual(eligibleNotifications([scheduled, error], payroll, root, start).map(entry => entry.id), [2, 1]);
  assert.equal(eligibleNotifications([scheduled], payroll, root, end).length, 0);
  assert.equal(nextBoundary([scheduled], start - 1), start);
  assert.equal(nextBoundary([scheduled], start), end);
  assert.equal(nextBoundary([scheduled], end), undefined);
});

test('excludes invalid schedules and inactive items', () => {
  const invalid = { ...item, startDateTime: '2026-01-01T11:00:00Z', endDateTime: '2026-01-01T10:00:00Z' };
  assert.ok(validateNotification(invalid, root).length > 0);
  assert.equal(eligibleNotifications([invalid, { ...item, isActive: false }], payroll, root, Date.now()).length, 0);
});
