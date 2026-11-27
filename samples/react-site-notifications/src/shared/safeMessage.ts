import DOMPurify from 'dompurify';

export interface SafeMessage {
  html: string;
  errors: string[];
}

export function sanitizeMessage(rawHtml: string): SafeMessage {
  const html: string = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['a', 'b', 'strong', 'i', 'em', 'ul', 'ol', 'li', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false
  });
  const container: HTMLElement = document.createElement('div');
  container.innerHTML = html;
  const text: string = container.textContent || '';
  const errors: string[] = [];
  if (!text.trim()) errors.push('Message must contain visible text.');
  if (Array.from(text).length > 500) errors.push('Message exceeds 500 visible characters.');
  return { html, errors };
}
