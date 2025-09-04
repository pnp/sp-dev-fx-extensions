/**
 * Shared validation utilities for the Collaboration Footer
 */
import { LINK_CONSTANTS, VALIDATION_CONSTANTS } from '../constants/ApplicationConstants';

export class ValidationUtils {
  /**
   * Validates if a URL is properly formatted
   */
  static isValidUrl(url: string): boolean {
    if (!url || !url.trim()) {
      return false;
    }
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates link title
   */
  static isValidTitle(title: string): { isValid: boolean; error?: string } {
    if (!title || !title.trim()) {
      return { isValid: false, error: 'Title is required' };
    }
    
    if (title.length > LINK_CONSTANTS.MAX_TITLE_LENGTH) {
      return { isValid: false, error: `Title must be less than ${LINK_CONSTANTS.MAX_TITLE_LENGTH} characters` };
    }
    
    return { isValid: true };
  }

  /**
   * Validates link description
   */
  static isValidDescription(description: string): { isValid: boolean; error?: string } {
    if (description && description.length > LINK_CONSTANTS.MAX_DESCRIPTION_LENGTH) {
      return { isValid: false, error: `Description must be less than ${LINK_CONSTANTS.MAX_DESCRIPTION_LENGTH} characters` };
    }
    
    return { isValid: true };
  }

  /**
   * Validates complete link data
   */
  static validateLinkData(data: { title: string; url: string; description?: string }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const titleValidation = this.isValidTitle(data.title);
    if (!titleValidation.isValid && titleValidation.error) {
      errors.push(titleValidation.error);
    }

    if (!this.isValidUrl(data.url)) {
      errors.push('Invalid URL format');
    }

    if (data.description) {
      const descValidation = this.isValidDescription(data.description);
      if (!descValidation.isValid && descValidation.error) {
        errors.push(descValidation.error);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validates search query
   */
  static isValidSearchQuery(query: string): boolean {
    return typeof query === 'string' && query.trim().length >= VALIDATION_CONSTANTS.MIN_SEARCH_QUERY_LENGTH;
  }

  /**
   * Sanitizes user input for display
   */
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Validates SharePoint list name
   */
  static isValidListName(name: string): { isValid: boolean; error?: string } {
    if (!name || !name.trim()) {
      return { isValid: false, error: 'List name is required' };
    }
    
    // SharePoint list name restrictions
    const invalidChars = /[~"#%&*:<>?/\\|]/;
    if (invalidChars.test(name)) {
      return { isValid: false, error: 'List name contains invalid characters' };
    }
    
    const MAX_LIST_NAME_LENGTH = 255;
    if (name.length > MAX_LIST_NAME_LENGTH) {
      return { isValid: false, error: `List name must be less than ${MAX_LIST_NAME_LENGTH} characters` };
    }
    
    return { isValid: true };
  }

  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}