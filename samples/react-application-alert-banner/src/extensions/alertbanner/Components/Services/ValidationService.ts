/**
 * Comprehensive input validation service for Alert Banner
 * Provides security-focused validation for all user inputs
 */

import { logger } from './LoggerService';

export interface IValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedValue?: any;
}

export interface IValidationRule {
  name: string;
  message: string;
  validator: (value: any) => boolean;
  sanitizer?: (value: any) => any;
}

export class ValidationService {
  private static _instance: ValidationService;

  // Common validation patterns
  private readonly patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    sharePointUrl: /^https:\/\/[a-zA-Z0-9-]+\.sharepoint\.com\/.*$/,
    guid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    htmlTag: /<[^>]*>/g,
    script: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    maliciousPatterns: [
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ]
  };

  // Security-focused constants
  private readonly limits = {
    maxTextLength: 10000,
    maxTitleLength: 255,
    maxUrlLength: 2083,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxArrayLength: 1000
  };

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService._instance) {
      ValidationService._instance = new ValidationService();
    }
    return ValidationService._instance;
  }

  /**
   * Validate alert title
   */
  public validateAlertTitle(title: string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!title || typeof title !== 'string') {
      errors.push('Title is required and must be a string');
      return { isValid: false, errors, warnings };
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      errors.push('Title cannot be empty');
    }

    if (trimmedTitle.length > this.limits.maxTitleLength) {
      errors.push(`Title cannot exceed ${this.limits.maxTitleLength} characters`);
    }

    if (trimmedTitle.length < 3) {
      warnings.push('Title should be at least 3 characters long');
    }

    if (this.containsMaliciousContent(trimmedTitle)) {
      errors.push('Title contains potentially malicious content');
    }

    const sanitizedValue = this.sanitizeText(trimmedTitle);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue
    };
  }

  /**
   * Validate alert description
   */
  public validateAlertDescription(description: string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!description || typeof description !== 'string') {
      errors.push('Description is required and must be a string');
      return { isValid: false, errors, warnings };
    }

    const trimmedDescription = description.trim();

    if (trimmedDescription.length === 0) {
      errors.push('Description cannot be empty');
    }

    if (trimmedDescription.length > this.limits.maxTextLength) {
      errors.push(`Description cannot exceed ${this.limits.maxTextLength} characters`);
    }

    if (trimmedDescription.length < 10) {
      warnings.push('Description should be at least 10 characters long for clarity');
    }

    if (this.containsMaliciousContent(trimmedDescription)) {
      errors.push('Description contains potentially malicious content');
    }

    const sanitizedValue = this.sanitizeHtml(trimmedDescription);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue
    };
  }

  /**
   * Validate URL
   */
  public validateUrl(url: string, requireSecure: boolean = true): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!url || typeof url !== 'string') {
      return { isValid: true, errors, warnings, sanitizedValue: '' }; // URL is optional
    }

    const trimmedUrl = url.trim();

    if (trimmedUrl.length === 0) {
      return { isValid: true, errors, warnings, sanitizedValue: '' };
    }

    if (trimmedUrl.length > this.limits.maxUrlLength) {
      errors.push(`URL cannot exceed ${this.limits.maxUrlLength} characters`);
    }

    if (!this.patterns.url.test(trimmedUrl)) {
      errors.push('URL format is invalid');
    }

    if (requireSecure && !trimmedUrl.startsWith('https://')) {
      errors.push('URL must use HTTPS for security');
    }

    if (this.containsMaliciousContent(trimmedUrl)) {
      errors.push('URL contains potentially malicious content');
    }

    // Additional security checks for URLs
    try {
      const urlObj = new URL(trimmedUrl);
      
      if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
        errors.push('URL must use HTTP or HTTPS protocol');
      }

      // Check for suspicious domains
      const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'short.link'];
      if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        warnings.push('URL uses a URL shortener which may obscure the final destination');
      }

    } catch (urlError) {
      errors.push('URL format is invalid');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: trimmedUrl
    };
  }

  /**
   * Validate SharePoint site ID
   */
  public validateSiteId(siteId: string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!siteId || typeof siteId !== 'string') {
      errors.push('Site ID is required and must be a string');
      return { isValid: false, errors, warnings };
    }

    const trimmedSiteId = siteId.trim();

    if (!this.patterns.guid.test(trimmedSiteId)) {
      errors.push('Site ID must be a valid GUID format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: trimmedSiteId
    };
  }

  /**
   * Validate date range
   */
  public validateDateRange(startDate?: Date | string, endDate?: Date | string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let parsedStartDate: Date | null = null;
    let parsedEndDate: Date | null = null;

    // Parse start date
    if (startDate) {
      parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
      if (isNaN(parsedStartDate.getTime())) {
        errors.push('Start date is invalid');
      }
    }

    // Parse end date
    if (endDate) {
      parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : endDate;
      if (isNaN(parsedEndDate.getTime())) {
        errors.push('End date is invalid');
      }
    }

    // Validate date logic
    if (parsedStartDate && parsedEndDate) {
      if (parsedStartDate >= parsedEndDate) {
        errors.push('End date must be after start date');
      }

      const daysDiff = (parsedEndDate.getTime() - parsedStartDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        warnings.push('Alert duration is longer than one year');
      }
    }

    // Check if dates are in the past
    const now = new Date();
    if (parsedStartDate && parsedStartDate < now) {
      warnings.push('Start date is in the past');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: {
        startDate: parsedStartDate,
        endDate: parsedEndDate
      }
    };
  }

  /**
   * Validate JSON data
   */
  public validateJson(jsonString: string, maxDepth: number = 10): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!jsonString || typeof jsonString !== 'string') {
      errors.push('JSON data is required and must be a string');
      return { isValid: false, errors, warnings };
    }

    try {
      const parsed = JSON.parse(jsonString);
      
      // Check depth to prevent prototype pollution attacks
      if (this.getObjectDepth(parsed) > maxDepth) {
        errors.push(`JSON structure is too deeply nested (max depth: ${maxDepth})`);
      }

      // Check for potentially dangerous keys
      if (this.containsDangerousKeys(parsed)) {
        errors.push('JSON contains potentially dangerous property names');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        sanitizedValue: parsed
      };

    } catch (parseError) {
      errors.push('Invalid JSON format');
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Validate email address
   */
  public validateEmail(email: string): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!email || typeof email !== 'string') {
      return { isValid: true, errors, warnings, sanitizedValue: '' }; // Email is optional
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail.length === 0) {
      return { isValid: true, errors, warnings, sanitizedValue: '' };
    }

    if (!this.patterns.email.test(trimmedEmail)) {
      errors.push('Email format is invalid');
    }

    if (trimmedEmail.length > 320) { // RFC 5321 limit
      errors.push('Email address is too long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: trimmedEmail
    };
  }

  /**
   * Check for malicious content
   */
  private containsMaliciousContent(input: string): boolean {
    return this.patterns.maliciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Sanitize plain text input
   */
  private sanitizeText(input: string): string {
    return input
      .trim()
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Sanitize HTML content (comprehensive protection against XSS)
   */
  private sanitizeHtml(input: string): string {
    // Enhanced sanitizer with comprehensive XSS protection
    let sanitized = input
      // Remove all script tags and content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove dangerous protocols
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/file:/gi, '')
      // Remove all event handlers
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^"'\s>]*/gi, '')
      // Remove dangerous tags
      .replace(/<(iframe|object|embed|form|input|button|textarea|select|option|meta|link|style|base|applet|bgsound|blink|body|frame|frameset|head|html|ilayer|layer|plaintext|title|xml)[^>]*>/gi, '')
      // Remove HTML comments that could contain malicious code
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove CSS expressions
      .replace(/expression\s*\(/gi, '')
      .replace(/url\s*\(/gi, 'url_blocked(')
      // Remove potentially dangerous attributes
      .replace(/\s(style|class|id)\s*=\s*["'][^"']*["']/gi, '')
      // Encode remaining special characters
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();

    // Log potential XSS attempts for security monitoring
    if (sanitized !== input) {
      logger.warn('ValidationService', 'Potential XSS attempt detected and sanitized', {
        original: input.substring(0, 100) + '...',
        sanitized: sanitized.substring(0, 100) + '...'
      });
    }

    return sanitized;
  }

  /**
   * Get object depth for preventing prototype pollution
   */
  private getObjectDepth(obj: any, depth: number = 0): number {
    if (depth > 100) return depth; // Prevent stack overflow

    if (!obj || typeof obj !== 'object') return depth;

    let maxChildDepth = depth;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const childDepth = this.getObjectDepth(obj[key], depth + 1);
        maxChildDepth = Math.max(maxChildDepth, childDepth);
      }
    }

    return maxChildDepth;
  }

  /**
   * Check for dangerous property names
   */
  private containsDangerousKeys(obj: any): boolean {
    const dangerousKeys = ['__proto__', 'prototype', 'constructor'];
    
    if (!obj || typeof obj !== 'object') return false;

    for (const key in obj) {
      if (dangerousKeys.includes(key)) return true;
      if (typeof obj[key] === 'object' && this.containsDangerousKeys(obj[key])) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate complete alert object
   */
  public validateAlert(alert: any): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate title
      const titleResult = this.validateAlertTitle(alert.title);
      errors.push(...titleResult.errors);
      warnings.push(...titleResult.warnings);

      // Validate description
      const descResult = this.validateAlertDescription(alert.description);
      errors.push(...descResult.errors);
      warnings.push(...descResult.warnings);

      // Validate URL if provided
      if (alert.linkUrl) {
        const urlResult = this.validateUrl(alert.linkUrl);
        errors.push(...urlResult.errors);
        warnings.push(...urlResult.warnings);
      }

      // Validate date range if provided
      if (alert.scheduledStart || alert.scheduledEnd) {
        const dateResult = this.validateDateRange(alert.scheduledStart, alert.scheduledEnd);
        errors.push(...dateResult.errors);
        warnings.push(...dateResult.warnings);
      }

      // Validate target users if provided
      if (alert.targetUsers && Array.isArray(alert.targetUsers)) {
        if (alert.targetUsers.length > this.limits.maxArrayLength) {
          errors.push(`Too many target users specified (max: ${this.limits.maxArrayLength})`);
        }
        
        // Validate each target user object
        for (const user of alert.targetUsers) {
          if (!user.id || typeof user.id !== 'string') {
            errors.push('Target user must have a valid ID');
          }
          if (!user.displayName || typeof user.displayName !== 'string') {
            errors.push('Target user must have a valid display name');
          }
        }
      }

      const sanitizedValue = {
        title: titleResult.sanitizedValue,
        description: descResult.sanitizedValue,
        linkUrl: alert.linkUrl ? this.validateUrl(alert.linkUrl).sanitizedValue : undefined,
        // ... other sanitized fields
      };

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        sanitizedValue
      };

    } catch (error) {
      logger.error('ValidationService', 'Error validating alert object', error);
      errors.push('Validation failed due to unexpected error');
      
      return {
        isValid: false,
        errors,
        warnings
      };
    }
  }
}

// Export singleton instance
export const validationService = ValidationService.getInstance();