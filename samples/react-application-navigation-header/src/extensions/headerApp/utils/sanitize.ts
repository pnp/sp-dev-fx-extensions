

import DOMPurify from 'dompurify';

const ALLOWED_TAGS: ReadonlySet<string> = new Set<string>([
  'a', 'abbr', 'address', 'article', 'aside', 'b', 'blockquote', 'br', 'caption',
  'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'details', 'dfn', 'div', 'dl',
  'dt', 'em', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hgroup', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'mark', 'nav',
  'ol', 'p', 'pre', 'q', 'samp', 'section', 'small', 'span', 'strong', 'sub',
  'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time', 'tr',
  'u', 'ul', 'var', 'wbr'
]);

const ALLOWED_ATTRIBUTES: ReadonlyMap<string, ReadonlySet<string>> = new Map<string, ReadonlySet<string>>([
  ['a', new Set<string>(['href', 'title', 'target', 'rel', 'name'])],
  ['img', new Set<string>(['src', 'alt', 'width', 'height', 'loading'])],
  ['time', new Set<string>(['datetime'])],
  ['col', new Set<string>(['span'])],
  ['colgroup', new Set<string>(['span'])]
]);

const GLOBAL_ALLOWED_ATTRIBUTES: ReadonlySet<string> = new Set<string>([
  'class', 'id', 'role', 'title', 'lang', 'dir', 'aria-label', 'aria-hidden',
  'aria-current', 'aria-describedby', 'aria-labelledby'
]);

const SAFE_URI_REGEXP = /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i;

let hooksRegistered = false;

function registerHooksOnce(): void {
  if (hooksRegistered || typeof window === 'undefined') {
    return;
  }
  hooksRegistered = true;

  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    const tag = node.tagName ? node.tagName.toLowerCase() : '';
    const name = data.attrName.toLowerCase();

    if ((name === 'src' || name === 'href') && /^\s*data:/i.test(data.attrValue)) {
      data.keepAttr = false;
      return;
    }

    if (GLOBAL_ALLOWED_ATTRIBUTES.has(name)) {
      return;
    }

    const perTagAllowed = ALLOWED_ATTRIBUTES.get(tag);
    if (perTagAllowed?.has(name)) {
      return;
    }

    data.keepAttr = false;
  });

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName !== 'A') {
      return;
    }

    const target = node.getAttribute('target');
    if (target !== '_blank') {
      return;
    }

    const rel = node.getAttribute('rel');
    if (!rel || rel.indexOf('noopener') === -1) {
      node.setAttribute('rel', `noopener noreferrer${rel ? ` ${rel}` : ''}`);
    }
  });
}

export function sanitizeHtml(input: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }

  if (!input || !input.trim()) {
    return '';
  }

  registerHooksOnce();

  const allowedAttrs: string[] = Array.from(GLOBAL_ALLOWED_ATTRIBUTES);
  ALLOWED_ATTRIBUTES.forEach((attrs) => {
    attrs.forEach((attr) => {
      if (allowedAttrs.indexOf(attr) === -1) {
        allowedAttrs.push(attr);
      }
    });
  });

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: Array.from(ALLOWED_TAGS),
    ALLOWED_ATTR: allowedAttrs,
    ALLOWED_URI_REGEXP: SAFE_URI_REGEXP
  });
}

export function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
