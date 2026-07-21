import { sanitizeHtml, escapeHtmlAttribute } from './sanitize';

describe('sanitizeHtml', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml('   ')).toBe('');
  });

  it('allows safe tags', () => {
    const result = sanitizeHtml('<p>Hello <strong>world</strong></p>');
    expect(result).toContain('Hello');
    expect(result).toContain('strong');
  });

  it('strips script tags', () => {
    const result = sanitizeHtml('<p>safe</p><script>alert(1)</script>');
    expect(result).toContain('safe');
    expect(result).not.toContain('script');
    expect(result).not.toContain('alert');
  });

  it('strips inline event handlers', () => {
    const result = sanitizeHtml('<a href="https://example.com" onclick="alert(1)">link</a>');
    expect(result).not.toContain('onclick');
    expect(result).toContain('href');
  });

  it('strips disallowed tags but keeps content', () => {
    const result = sanitizeHtml('<custom-tag>content</custom-tag>');
    expect(result).not.toContain('custom-tag');
  });

  it('strips javascript: URLs from href', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">link</a>');
    expect(result).not.toContain('javascript:');
  });

  it('adds rel=noopener to target=_blank links', () => {
    const result = sanitizeHtml('<a href="https://example.com" target="_blank">link</a>');
    expect(result).toContain('rel');
    expect(result).toContain('noopener');
    expect(result).toContain('noreferrer');
  });

  it('strips data: URLs from src', () => {
    const result = sanitizeHtml('<img src="data:text/html,evil" alt="x">');
    expect(result).not.toContain('data:');
  });
});

describe('escapeHtmlAttribute', () => {
  it('escapes double quotes', () => {
    expect(escapeHtmlAttribute('a"b')).toBe('a&quot;b');
  });

  it('escapes single quotes', () => {
    expect(escapeHtmlAttribute("a'b")).toBe('a&#39;b');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtmlAttribute('a<b>')).toBe('a&lt;b&gt;');
  });

  it('escapes ampersands', () => {
    expect(escapeHtmlAttribute('a&b')).toBe('a&amp;b');
  });
});