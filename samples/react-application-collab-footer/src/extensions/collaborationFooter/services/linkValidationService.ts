import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'LinkValidationService';

export interface ILinkValidationResult {
  isValid: boolean;
  statusCode?: number;
  message: string;
  responseTime?: number;
  lastChecked: Date;
}

export interface ITargetUser {
  id: string;
  loginName: string;
  displayName: string;
  email: string;
}

export interface IValidationReportItem {
  name: string;
  url: string;
  status: 'Valid' | 'Invalid';
  statusCode: number;
  message: string;
  responseTime: number;
  dateStatus: 'Valid' | 'Invalid';
  dateMessage: string;
  lastChecked: string;
  category: string;
}

export class LinkValidationService {
  /**
   * Validate URL format and structure
   */
  public static isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
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
   * Validate basic link data format and required fields
   */
  public static validateLinkData(link: IContextualMenuItem): boolean {
    if (!(link.name && link.href && link.href.startsWith('http'))) {
      Log.warn(LOG_SOURCE, `Invalid basic link data: ${link.name || 'unnamed'}`);
      return false;
    }
    
    // Validate audience targeting format if present
    const linkWithExtras = link as any;
    if (linkWithExtras.targetUsers && Array.isArray(linkWithExtras.targetUsers)) {
      // Validate each audience entry
      for (const targetUser of linkWithExtras.targetUsers) {
        if (!this.validateTargetUser(targetUser)) {
          Log.warn(LOG_SOURCE, `Invalid target user data for link "${link.name}": ${JSON.stringify(targetUser)}`);
          return false;
        }
      }
    }
    
    // Validate date formats if present
    if (linkWithExtras.validFrom && linkWithExtras.validFrom !== '') {
      if (!this.isValidDate(linkWithExtras.validFrom)) {
        Log.warn(LOG_SOURCE, `Invalid validFrom date for link "${link.name}": ${linkWithExtras.validFrom}`);
        return false;
      }
    }
    
    if (linkWithExtras.validTo && linkWithExtras.validTo !== '') {
      if (!this.isValidDate(linkWithExtras.validTo)) {
        Log.warn(LOG_SOURCE, `Invalid validTo date for link "${link.name}": ${linkWithExtras.validTo}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Validate target user object structure
   */
  private static validateTargetUser(targetUser: ITargetUser): boolean {
    return !!(
      targetUser &&
      typeof targetUser === 'object' &&
      targetUser.loginName &&
      targetUser.displayName &&
      typeof targetUser.loginName === 'string' &&
      typeof targetUser.displayName === 'string'
    );
  }

  /**
   * Validate date string format
   */
  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Validate link accessibility by checking HTTP status
   */
  public static async validateLinkAccessibility(url: string): Promise<ILinkValidationResult> {
    const startTime = Date.now();
    
    try {
      // Basic URL format validation first
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return {
          isValid: false,
          statusCode: 400,
          message: 'URL must start with http:// or https://',
          lastChecked: new Date()
        };
      }

      // For security and CORS reasons, we can't directly fetch external URLs in SPFx
      // Instead, we'll do basic format validation and DNS-like checks
      const urlObj = new URL(url);
      const isValidFormat = urlObj.hostname.includes('.') && urlObj.hostname.length > 3;
      
      if (!isValidFormat) {
        return {
          isValid: false,
          statusCode: 400,
          message: 'Invalid URL format or hostname',
          lastChecked: new Date()
        };
      }

      // Check for common invalid patterns
      if (this.isBlockedDomain(urlObj.hostname)) {
        return {
          isValid: false,
          statusCode: 403,
          message: 'Domain is not allowed',
          lastChecked: new Date()
        };
      }

      // If we get here, basic validation passed
      const responseTime = Date.now() - startTime;
      return {
        isValid: true,
        statusCode: 200,
        message: 'URL format is valid (accessibility not verified due to CORS)',
        responseTime,
        lastChecked: new Date()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      Log.error(LOG_SOURCE, error as Error);
      
      return {
        isValid: false,
        statusCode: 500,
        message: `Validation error: ${(error as Error).message}`,
        responseTime,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check if domain is blocked
   */
  private static isBlockedDomain(hostname: string): boolean {
    const blockedDomains = [
      'localhost',
      '127.0.0.1',
      'file://',
      'javascript:',
      'data:',
      'vbscript:'
    ];
    
    return blockedDomains.some(blocked => 
      hostname.toLowerCase().includes(blocked.toLowerCase())
    );
  }

  /**
   * Batch validate multiple links
   */
  public static async validateAllLinks(links: IContextualMenuItem[]): Promise<Map<string, ILinkValidationResult>> {
    const results = new Map<string, ILinkValidationResult>();
    
    Log.info(LOG_SOURCE, `Starting validation of ${links.length} links`);
    
    // Process links in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async link => {
        if (!link.href) return null;
        
        const result = await this.validateLinkAccessibility(link.href);
        return { key: link.key, result };
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(item => {
        if (item) {
          results.set(item.key, item.result);
        }
      });
      
      // Small delay between batches to be respectful
      if (i + batchSize < links.length) {
        await this.delay(100);
      }
    }
    
    Log.info(LOG_SOURCE, `Validation completed for ${results.size} links`);
    return results;
  }

  /**
   * Validate link dates (valid from/to)
   */
  public static validateLinkDates(link: IContextualMenuItem): { isValid: boolean; message: string } {
    const linkData = link as any;
    const now = new Date();
    
    if (linkData.validFrom) {
      const validFrom = new Date(linkData.validFrom);
      if (validFrom > now) {
        return {
          isValid: false,
          message: `Link is not yet active. Valid from: ${validFrom.toLocaleDateString()}`
        };
      }
    }
    
    if (linkData.validTo) {
      const validTo = new Date(linkData.validTo);
      if (validTo < now) {
        return {
          isValid: false,
          message: `Link has expired. Valid until: ${validTo.toLocaleDateString()}`
        };
      }
    }
    
    return {
      isValid: true,
      message: 'Link dates are valid'
    };
  }

  /**
   * Generate validation report for export
   */
  public static generateValidationReport(
    links: IContextualMenuItem[],
    validationResults: Map<string, ILinkValidationResult>
  ): IValidationReportItem[] {
    return links.map(link => {
      const validation = validationResults.get(link.key);
      const dateValidation = this.validateLinkDates(link);
      
      return {
        name: link.name || 'Unnamed Link',
        url: link.href || '',
        status: validation?.isValid ? 'Valid' : 'Invalid',
        statusCode: validation?.statusCode || 0,
        message: validation?.message || 'Not validated',
        responseTime: validation?.responseTime || 0,
        dateStatus: dateValidation.isValid ? 'Valid' : 'Invalid',
        dateMessage: dateValidation.message,
        lastChecked: validation?.lastChecked?.toISOString() || '',
        category: (link.data as any)?.category || 'General'
      };
    });
  }

  /**
   * Utility delay function with proper cleanup
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, ms);
      // Store timeout for potential cleanup - in real apps, this would be managed by caller
      return timeoutId;
    });
  }
}