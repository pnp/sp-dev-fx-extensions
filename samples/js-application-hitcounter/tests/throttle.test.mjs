// Unit tests for backing off when SharePoint throttles (scope 14, risk 7).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MAX_RETRY_WAIT_MS, isThrottled, retryDelayMs } from '../lib/shared/throttle.js';

const NOW = Date.parse('2026-11-18T16:00:00Z');

test('only 429 and 503 count as throttling', () => {
  assert.equal(isThrottled(429), true);
  assert.equal(isThrottled(503), true);
  for (const s of [200, 401, 403, 404, 412, 500]) {
    assert.equal(isThrottled(s), false, String(s));
  }
});

test('Retry-After in seconds or as an HTTP date is honoured', () => {
  assert.equal(retryDelayMs('7', 1, NOW), 7000);
  assert.equal(retryDelayMs(' 1.5 ', 1, NOW), 1500);
  assert.equal(retryDelayMs('Wed, 18 Nov 2026 16:00:20 GMT', 1, NOW), 20000);
});

test('without Retry-After: 2, 4, 8 seconds...', () => {
  assert.deepEqual([1, 2, 3].map((a) => retryDelayMs(null, a, NOW)), [2000, 4000, 8000]);
  assert.equal(retryDelayMs('soon', 2, NOW), 4000, 'unreadable header falls back');
});

test('waits are kept between 0.5 s and the cap', () => {
  assert.equal(retryDelayMs('0', 1, NOW), 500);
  assert.equal(retryDelayMs('Wed, 18 Nov 2026 15:00:00 GMT', 1, NOW), 500, 'date in the past');
  assert.equal(retryDelayMs('3600', 1, NOW), MAX_RETRY_WAIT_MS);
  assert.equal(retryDelayMs('60', 1, NOW, 30000), 30000, 'tracker cap');
  assert.equal(retryDelayMs(null, 20, NOW), MAX_RETRY_WAIT_MS);
});
