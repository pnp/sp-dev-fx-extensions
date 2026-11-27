import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;

const { sanitizeMessage } = await import('../src/shared/safeMessage.ts');

test('preserves supported formatting and safe links while removing unsafe content', () => {
  const result = sanitizeMessage(
    '<p style="color:red" onclick="alert(1)"><strong>News</strong> ' +
    '<a href="https://example.com">link</a> <a href="mailto:test@example.com">mail</a>' +
    '<a href="javascript:alert(1)">unsafe</a><img src="https://example.com/x">' +
    '<script>alert(1)</script><ul><li><em>Item</em></li></ul></p>'
  );
  assert.deepEqual(result.errors, []);
  const element = document.createElement('div');
  element.innerHTML = result.html;
  assert.ok(element.querySelector('strong'));
  assert.ok(element.querySelector('li em'));
  assert.equal(element.querySelector('a')?.getAttribute('href'), 'https://example.com');
  assert.equal(element.querySelectorAll('a')[1]?.getAttribute('href'), 'mailto:test@example.com');
  assert.equal(element.querySelectorAll('a')[2]?.hasAttribute('href'), false);
  assert.equal(element.querySelector('script, img, [style], [onclick]'), null);
});

test('requires visible text and counts Unicode code points after sanitization', () => {
  assert.ok(sanitizeMessage('<img src="x"><script>text</script>').errors.length);
  assert.deepEqual(sanitizeMessage(`<p>${'😀'.repeat(500)}</p>`).errors, []);
  assert.ok(sanitizeMessage(`<p>${'😀'.repeat(501)}</p>`).errors.length);
  assert.deepEqual(sanitizeMessage('<a href="https://example.com/long/path">Hi</a>').errors, []);
});
