import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { dismissalKey, isDismissed, saveDismissal } from '../src/shared/dismissals.ts';

const root = 'https://example.sharepoint.com/sites/Finance';
const item = { id: 1, isDismissible: true, fingerprint: 'a'.repeat(64) };

test('dismissal is isolated by collection and item and invalidated by a new fingerprint', () => {
  const storage = new JSDOM('', { url: root }).window.localStorage;
  saveDismissal(storage, root, item);
  assert.equal(isDismissed(storage, root, item), true);
  assert.equal(isDismissed(storage, root, { ...item, fingerprint: 'b'.repeat(64) }), false);
  assert.equal(isDismissed(storage, root, { ...item, id: 2 }), false);
  assert.equal(isDismissed(storage, `${root}2`, item), false);
  assert.equal(isDismissed(storage, root, { ...item, isDismissible: false }), false);
  assert.equal(dismissalKey(`${root}/`, 1), dismissalKey(root.toLowerCase(), 1));
});

test('does not silently accept corrupt records or storage failures', () => {
  const storage = new JSDOM('', { url: root }).window.localStorage;
  storage.setItem(dismissalKey(root, item.id), 'invalid');
  assert.throws(() => isDismissed(storage, root, item), /invalid/);
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.throws(() => isDismissed(blocked, root, item), /blocked/);
  assert.throws(() => saveDismissal(blocked, root, item), /blocked/);
});
