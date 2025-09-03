/**
 * Comprehensive Accessibility (a11y) Service for Alert Banner
 * Ensures WCAG 2.1 AA compliance and provides accessibility utilities
 */

import { logger } from './LoggerService';

export interface IAccessibilityReport {
  violations: IAccessibilityViolation[];
  warnings: IAccessibilityWarning[];
  recommendations: IAccessibilityRecommendation[];
  score: number; // 0-100
}

export interface IAccessibilityViolation {
  type: 'contrast' | 'focus' | 'aria' | 'keyboard' | 'semantic';
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  element?: HTMLElement;
  message: string;
  wcagGuideline: string;
  suggestion: string;
}

export interface IAccessibilityWarning {
  type: 'potential' | 'best-practice';
  message: string;
  suggestion: string;
}

export interface IAccessibilityRecommendation {
  category: 'color' | 'focus' | 'keyboard' | 'screen-reader' | 'cognitive';
  message: string;
  implementation: string;
}

export interface IColorContrastResult {
  ratio: number;
  isAACompliant: boolean;
  isAAACompliant: boolean;
  recommendation?: string;
}

export interface IFocusManagementOptions {
  trapFocus?: boolean;
  restoreFocus?: boolean;
  initialFocusTarget?: HTMLElement | string;
}

export class AccessibilityService {
  private static _instance: AccessibilityService;
  private observers: Map<string, MutationObserver> = new Map();
  private focusStack: HTMLElement[] = [];
  private announcer: HTMLElement | null = null;

  // WCAG AA minimum contrast ratios
  private readonly contrastRatios = {
    normal: 4.5,
    large: 3,
    AAA_normal: 7,
    AAA_large: 4.5
  };

  private constructor() {
    this.initializeAnnouncer();
    this.setupGlobalAccessibilityMonitoring();
  }

  public static getInstance(): AccessibilityService {
    if (!AccessibilityService._instance) {
      AccessibilityService._instance = new AccessibilityService();
    }
    return AccessibilityService._instance;
  }

  /**
   * Initialize screen reader announcer
   */
  private initializeAnnouncer(): void {
    try {
      // Create or find existing announcer
      this.announcer = document.getElementById('a11y-announcer') || this.createAnnouncer();
    } catch (error) {
      logger.error('AccessibilityService', 'Failed to initialize announcer', error);
    }
  }

  /**
   * Create screen reader announcer element
   */
  private createAnnouncer(): HTMLElement {
    const announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    
    // Visually hidden but accessible to screen readers
    announcer.style.cssText = `
      position: absolute !important;
      left: -10000px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
      clip: rect(1px, 1px, 1px, 1px) !important;
      clip-path: inset(50%) !important;
      border: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
    `;
    
    document.body.appendChild(announcer);
    return announcer;
  }

  /**
   * Setup global accessibility monitoring
   */
  private setupGlobalAccessibilityMonitoring(): void {
    // Monitor for dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.auditElement(node as HTMLElement);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.set('global', observer);
  }

  /**
   * Announce message to screen readers
   */
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcer) {
      logger.warn('AccessibilityService', 'Announcer not available');
      return;
    }

    try {
      // Update aria-live attribute based on priority
      this.announcer.setAttribute('aria-live', priority);
      
      // Clear previous message and set new one
      this.announcer.textContent = '';
      setTimeout(() => {
        if (this.announcer) {
          this.announcer.textContent = message;
        }
      }, 100);

      logger.debug('AccessibilityService', 'Screen reader announcement', { message, priority });
    } catch (error) {
      logger.error('AccessibilityService', 'Failed to announce message', error);
    }
  }

  /**
   * Calculate color contrast ratio
   */
  public calculateContrastRatio(color1: string, color2: string): IColorContrastResult {
    try {
      const rgb1 = this.parseColor(color1);
      const rgb2 = this.parseColor(color2);

      if (!rgb1 || !rgb2) {
        return {
          ratio: 0,
          isAACompliant: false,
          isAAACompliant: false,
          recommendation: 'Unable to parse colors'
        };
      }

      const luminance1 = this.calculateLuminance(rgb1);
      const luminance2 = this.calculateLuminance(rgb2);

      const lighter = Math.max(luminance1, luminance2);
      const darker = Math.min(luminance1, luminance2);
      const ratio = (lighter + 0.05) / (darker + 0.05);

      return {
        ratio: Math.round(ratio * 100) / 100,
        isAACompliant: ratio >= this.contrastRatios.normal,
        isAAACompliant: ratio >= this.contrastRatios.AAA_normal,
        recommendation: ratio < this.contrastRatios.normal 
          ? `Increase contrast ratio to at least ${this.contrastRatios.normal}:1 for WCAG AA compliance`
          : undefined
      };
    } catch (error) {
      logger.error('AccessibilityService', 'Error calculating contrast ratio', error);
      return {
        ratio: 0,
        isAACompliant: false,
        isAAACompliant: false,
        recommendation: 'Error calculating contrast'
      };
    }
  }

  /**
   * Parse color string to RGB values
   */
  private parseColor(color: string): { r: number; g: number; b: number } | null {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = color;
    const computedColor = ctx.fillStyle;

    // Parse hex color
    const hexMatch = computedColor.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hexMatch) {
      return {
        r: parseInt(hexMatch[1], 16),
        g: parseInt(hexMatch[2], 16),
        b: parseInt(hexMatch[3], 16)
      };
    }

    // Parse rgb color
    const rgbMatch = computedColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10)
      };
    }

    return null;
  }

  /**
   * Calculate relative luminance
   */
  private calculateLuminance(rgb: { r: number; g: number; b: number }): number {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Manage focus for modals and dialogs
   */
  public manageFocus(container: HTMLElement, options: IFocusManagementOptions = {}): () => void {
    try {
      // Store current focused element
      const previousFocusedElement = document.activeElement as HTMLElement;
      if (options.restoreFocus && previousFocusedElement) {
        this.focusStack.push(previousFocusedElement);
      }

      // Set initial focus
      if (options.initialFocusTarget) {
        const target = typeof options.initialFocusTarget === 'string'
          ? container.querySelector(options.initialFocusTarget) as HTMLElement
          : options.initialFocusTarget;
        
        if (target && target.focus) {
          setTimeout(() => target.focus(), 0);
        }
      } else {
        // Focus first focusable element
        const firstFocusable = this.findFocusableElements(container)[0];
        if (firstFocusable) {
          setTimeout(() => firstFocusable.focus(), 0);
        }
      }

      // Setup focus trap if requested
      let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
      if (options.trapFocus) {
        keydownHandler = this.createFocusTrap(container);
        document.addEventListener('keydown', keydownHandler);
      }

      // Return cleanup function
      return () => {
        if (keydownHandler) {
          document.removeEventListener('keydown', keydownHandler);
        }

        if (options.restoreFocus) {
          const elementToRestore = this.focusStack.pop();
          if (elementToRestore && elementToRestore.focus) {
            setTimeout(() => elementToRestore.focus(), 0);
          }
        }
      };
    } catch (error) {
      logger.error('AccessibilityService', 'Error managing focus', error);
      return () => {}; // Return no-op cleanup
    }
  }

  /**
   * Create focus trap for modal/dialog
   */
  private createFocusTrap(container: HTMLElement): (e: KeyboardEvent) => void {
    return (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = this.findFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
  }

  /**
   * Find all focusable elements within a container
   */
  private findFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    return elements.filter(el => {
      const computedStyle = window.getComputedStyle(el);
      return computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
    });
  }

  /**
   * Audit element for accessibility issues
   */
  public auditElement(element: HTMLElement): IAccessibilityReport {
    const violations: IAccessibilityViolation[] = [];
    const warnings: IAccessibilityWarning[] = [];
    const recommendations: IAccessibilityRecommendation[] = [];

    try {
      // Check for missing alt text on images
      const images = element.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
      images.forEach((img: HTMLImageElement) => {
        if (!img.getAttribute('alt') && !img.getAttribute('aria-label')) {
          violations.push({
            type: 'semantic',
            severity: 'serious',
            element: img,
            message: 'Image missing alt text',
            wcagGuideline: 'WCAG 1.1.1',
            suggestion: 'Add descriptive alt text or aria-label attribute'
          });
        }
      });

      // Check for proper heading hierarchy
      const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];
      let previousLevel = 0;
      headings.forEach((heading: HTMLElement) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level - previousLevel > 1) {
          violations.push({
            type: 'semantic',
            severity: 'moderate',
            element: heading,
            message: 'Heading levels skipped',
            wcagGuideline: 'WCAG 1.3.1',
            suggestion: 'Use proper heading hierarchy (h1, h2, h3, etc.)'
          });
        }
        previousLevel = level;
      });

      // Check for buttons without accessible names
      const buttons = element.querySelectorAll('button');
      buttons.forEach(button => {
        const hasAccessibleName = button.textContent?.trim() || 
                                 button.getAttribute('aria-label') ||
                                 button.getAttribute('aria-labelledby');
        
        if (!hasAccessibleName) {
          violations.push({
            type: 'aria',
            severity: 'serious',
            element: button,
            message: 'Button missing accessible name',
            wcagGuideline: 'WCAG 4.1.2',
            suggestion: 'Add visible text, aria-label, or aria-labelledby attribute'
          });
        }
      });

      // Check for form inputs without labels
      const inputs = element.querySelectorAll('input, select, textarea') as NodeListOf<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
      inputs.forEach((input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
        const hasLabel = input.getAttribute('aria-label') ||
                        input.getAttribute('aria-labelledby') ||
                        element.querySelector(`label[for="${input.id}"]`);
        
        if (!hasLabel && input.getAttribute('type') !== 'hidden') {
          violations.push({
            type: 'aria',
            severity: 'serious',
            element: input,
            message: 'Form control missing label',
            wcagGuideline: 'WCAG 1.3.1',
            suggestion: 'Add label element or aria-label attribute'
          });
        }
      });

      // Check for interactive elements without focus indicators
      const interactiveElements = element.querySelectorAll('button, a, input, select, textarea, [tabindex]');
      interactiveElements.forEach(el => {
        const styles = window.getComputedStyle(el, ':focus');
        if (styles.outline === 'none' && !styles.boxShadow && !styles.border) {
          warnings.push({
            type: 'best-practice',
            message: 'Interactive element may lack focus indicator',
            suggestion: 'Ensure visible focus indicators for keyboard navigation'
          });
        }
      });

      // Calculate accessibility score
      const totalChecks = 10;
      const violationWeight = violations.reduce((sum, v) => {
        switch (v.severity) {
          case 'critical': return sum + 4;
          case 'serious': return sum + 3;
          case 'moderate': return sum + 2;
          case 'minor': return sum + 1;
          default: return sum;
        }
      }, 0);

      const score = Math.max(0, Math.round(((totalChecks - violationWeight) / totalChecks) * 100));

      return {
        violations,
        warnings,
        recommendations,
        score
      };

    } catch (error) {
      logger.error('AccessibilityService', 'Error auditing element', error);
      return {
        violations: [{
          type: 'semantic',
          severity: 'critical',
          message: 'Accessibility audit failed',
          wcagGuideline: 'N/A',
          suggestion: 'Check console for errors'
        }],
        warnings: [],
        recommendations: [],
        score: 0
      };
    }
  }

  /**
   * Add keyboard navigation support
   */
  public addKeyboardNavigation(container: HTMLElement, options: {
    arrowKeys?: boolean;
    enterActivates?: boolean;
    escapeCloses?: boolean;
    onEscape?: () => void;
  } = {}): () => void {
    const keydownHandler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      // Handle Enter key activation
      if (options.enterActivates && e.key === 'Enter') {
        if (target.getAttribute('role') === 'button' && target.click) {
          e.preventDefault();
          target.click();
        }
      }

      // Handle Escape key
      if (options.escapeCloses && e.key === 'Escape') {
        if (options.onEscape) {
          options.onEscape();
        }
      }

      // Handle arrow key navigation
      if (options.arrowKeys && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const focusableElements = this.findFocusableElements(container);
        const currentIndex = focusableElements.indexOf(target);
        
        if (currentIndex !== -1) {
          let nextIndex = currentIndex;
          
          switch (e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
              nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
              break;
            case 'ArrowDown':
            case 'ArrowRight':
              nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
              break;
          }

          if (nextIndex !== currentIndex) {
            e.preventDefault();
            focusableElements[nextIndex].focus();
          }
        }
      }
    };

    container.addEventListener('keydown', keydownHandler);

    return () => {
      container.removeEventListener('keydown', keydownHandler);
    };
  }

  /**
   * Cleanup all observers and resources
   */
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.focusStack.length = 0;

    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
      this.announcer = null;
    }
  }
}

// Export singleton instance
export const accessibilityService = AccessibilityService.getInstance();