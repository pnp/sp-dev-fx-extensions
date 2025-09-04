// Use dynamic require for better SPFx compatibility
let DOMPurify: any = null;
try {
  DOMPurify = require('dompurify');
} catch (error) {
  logger.warn('HtmlSanitizer', 'DOMPurify not available in this environment', error);
}

import { marked } from 'marked';
import { logger } from '../Services/LoggerService';

/**
 * HTML Sanitization utility to prevent XSS vulnerabilities
 * Uses DOMPurify to sanitize HTML content before rendering
 */
export class HtmlSanitizer {
  private static instance: HtmlSanitizer;
  
  private constructor() {
    // Configure DOMPurify for SharePoint context
    this.configureDefaults();
  }

  public static getInstance(): HtmlSanitizer {
    if (!HtmlSanitizer.instance) {
      HtmlSanitizer.instance = new HtmlSanitizer();
    }
    return HtmlSanitizer.instance;
  }

  private configureDefaults(): void {
    // Configure allowed tags and attributes for alert content
    // Only configure if DOMPurify is available and supports hooks
    if (DOMPurify && typeof DOMPurify.addHook === 'function') {
      try {
        DOMPurify.addHook('beforeSanitizeElements', (node: Element) => {
          // Remove script tags completely
          if (node.tagName === 'SCRIPT') {
            node.remove();
          }
        });
      } catch (error) {
        logger.warn('HtmlSanitizer', 'Failed to configure DOMPurify hooks', error);
      }
    }
  }

  /**
   * Sanitize HTML content to prevent XSS attacks
   * @param html Raw HTML content
   * @param options Optional DOMPurify configuration
   * @returns Sanitized HTML string
   */
  public sanitizeHtml(html: string, options?: any): string {
    if (!html) return '';
    
    // Fallback if DOMPurify is not available
    if (!DOMPurify || typeof DOMPurify.sanitize !== 'function') {
      logger.warn('HtmlSanitizer', 'DOMPurify not available, using fallback HTML escaping');
      return this.escapeHtml(html);
    }

    const config = {
      ALLOWED_TAGS: [
        'div', 'span', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'td', 'th'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'style',
        'target', 'rel', 'width', 'height'
      ],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      ...options
    };

    try {
      return DOMPurify.sanitize(html, config);
    } catch (error) {
      logger.error('HtmlSanitizer', 'DOMPurify sanitization failed, using fallback', error);
      return this.escapeHtml(html);
    }
  }

  /**
   * Fallback HTML escaping when DOMPurify is not available
   * @param html Raw HTML content
   * @returns Escaped HTML string
   */
  private escapeHtml(html: string): string {
    if (!html) return '';
    
    // Use DOM API to safely escape HTML
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Convert Markdown to sanitized HTML
   * @param markdown Markdown content
   * @returns Sanitized HTML string
   */
  public markdownToHtml(markdown: string): string {
    if (!markdown) return '';

    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true
    });

    // Convert markdown to HTML
    const html = marked(markdown);
    
    // Sanitize the resulting HTML
    return this.sanitizeHtml(html as string);
  }

  /**
   * Sanitize content specifically for alert descriptions
   * Allows common formatting but removes dangerous elements
   * @param content Raw content (HTML or text)
   * @returns Sanitized HTML string
   */
  public sanitizeAlertContent(content: string): string {
    if (!content) return '';

    // First try to detect if this is markdown or HTML
    const isMarkdown = this.isLikelyMarkdown(content);
    
    if (isMarkdown) {
      return this.markdownToHtml(content);
    } else {
      return this.sanitizeHtml(content, {
        ALLOWED_TAGS: [
          'div', 'span', 'p', 'br', 'strong', 'b', 'em', 'i', 'u',
          'ul', 'ol', 'li', 'a'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
      });
    }
  }

  /**
   * Simple heuristic to detect if content is likely Markdown
   * @param content Content to check
   * @returns true if content appears to be Markdown
   */
  private isLikelyMarkdown(content: string): boolean {
    const markdownIndicators = [
      /^\s*#{1,6}\s+/, // Headers
      /^\s*\*\s+/, // Bullet lists
      /^\s*\d+\.\s+/, // Numbered lists
      /\*\*.*\*\*/, // Bold
      /\*.*\*/, // Italic
      /\[.*\]\(.*\)/, // Links
    ];

    return markdownIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Sanitize content for preview contexts where minimal HTML is allowed
   * @param content Raw content
   * @returns Sanitized HTML string with very limited tags
   */
  public sanitizePreviewContent(content: string): string {
    if (!content) return '';

    return this.sanitizeHtml(content, {
      ALLOWED_TAGS: ['strong', 'b', 'em', 'i', 'br', 'p'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }
}

// Export singleton instance
export const htmlSanitizer = HtmlSanitizer.getInstance();