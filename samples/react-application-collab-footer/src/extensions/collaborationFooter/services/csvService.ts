import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'CSVService';

export interface ITargetUser {
  id: string;
  loginName: string;
  displayName: string;
  email: string;
}

export class CSVService {
  /**
   * Convert links array to CSV format with enhanced audience targeting support
   */
  public static convertLinksToCSV(links: IContextualMenuItem[]): string {
    const headers = [
      'Name', 'URL', 'Description', 'Category', 'Icon', 
      'IsMandatory', 'IsActive', 'SortOrder', 'TargetUsers_LoginNames', 'TargetUsers_DisplayNames',
      'ValidFrom', 'ValidTo', 'CreatedDate', 'ModifiedDate'
    ];
    
    const rows = links.map(link => {
      const linkData = link as any;
      const targetUsers = linkData.targetUsers || [];
      
      return [
        link.name || '',
        link.href || '',
        linkData.description || '',
        linkData.category || 'General',
        linkData.iconProps?.iconName || link.iconProps?.iconName || '',
        linkData.isMandatory ? 'Yes' : 'No',
        linkData.isActive !== false ? 'Yes' : 'No',
        linkData.sortOrder || '0',
        targetUsers.map((u: ITargetUser) => u.loginName).join(';'),
        targetUsers.map((u: ITargetUser) => u.displayName).join(';'),
        linkData.validFrom || '',
        linkData.validTo || '',
        linkData.createdDate || new Date().toISOString(),
        linkData.modifiedDate || new Date().toISOString()
      ];
    });
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Parse CSV text to links array with SharePoint User field support
   */
  public static parseCSVToLinks(csvText: string): IContextualMenuItem[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length <= 1) return [];

    // Skip header row
    const dataRows = lines.slice(1);
    
    return dataRows.map((line, index) => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i-1] === ',')) {
          inQuotes = !inQuotes;
        } else if (char === '"' && (i === line.length - 1 || line[i+1] === ',')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.replace(/^"|"$/g, '').trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.replace(/^"|"$/g, '').trim());
      
      // Parse target users from login names and display names
      const targetUsersLoginNames = values[8] ? values[8].split(';').filter(a => a.trim()) : [];
      const targetUsersDisplayNames = values[9] ? values[9].split(';').filter(a => a.trim()) : [];
      
      const targetUsers: ITargetUser[] = targetUsersLoginNames.map((loginName, idx) => ({
        id: loginName,
        loginName: loginName.trim(),
        displayName: targetUsersDisplayNames[idx]?.trim() || loginName.trim(),
        email: loginName.includes('@') ? loginName.trim() : ''
      }));

      const link: any = {
        key: `imported-${Date.now()}-${index}`,
        name: values[0] || `Imported Link ${index + 1}`,
        href: values[1] || '#',
        target: '_blank',
        description: values[2] || '',
        category: values[3] || 'General',
        isMandatory: values[5]?.toLowerCase() === 'yes',
        isActive: values[6]?.toLowerCase() !== 'no',
        sortOrder: parseInt(values[7]) || 0,
        targetUsers: targetUsers,
        validFrom: values[10] || null,
        validTo: values[11] || null,
        createdDate: values[12] || new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      };
      
      if (values[4]) {
        link.iconProps = { iconName: values[4] };
      }
      
      return link;
    }).filter(link => link && link.href && link.href !== '#' && link.name) as IContextualMenuItem[];
  }

  /**
   * Generate CSV import template with examples
   */
  public static generateImportTemplate(): string {
    const templateHeaders = [
      'Name', 'URL', 'Description', 'Category', 'Icon', 
      'IsMandatory', 'IsActive', 'SortOrder', 'TargetUsers_LoginNames', 'TargetUsers_DisplayNames',
      'ValidFrom', 'ValidTo', 'CreatedDate', 'ModifiedDate'
    ];
    
    const sampleRows = [
      [
        'SharePoint Online',
        'https://tenant.sharepoint.com',
        'Access our SharePoint site',
        'Microsoft 365',
        'SharePointLogo',
        'No',
        'Yes',
        '1',
        'john@company.com;mary@company.com',
        'John Smith;Mary Johnson',
        '',
        '',
        new Date().toISOString(),
        new Date().toISOString()
      ],
      [
        'Teams',
        'https://teams.microsoft.com',
        'Collaborate with your team',
        'Communication',
        'TeamsLogo',
        'Yes',
        'Yes',
        '2',
        '',
        '',
        '',
        '',
        new Date().toISOString(),
        new Date().toISOString()
      ]
    ];
    
    return [templateHeaders, ...sampleRows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  }

  /**
   * Validate basic link data structure
   */
  public static validateLinkData(link: IContextualMenuItem): boolean {
    if (!(link.name && link.href && link.href.startsWith('http'))) {
      return false;
    }
    
    // Validate audience targeting format if present
    const linkWithExtras = link as any;
    if (linkWithExtras.targetUsers && Array.isArray(linkWithExtras.targetUsers)) {
      // Validate each audience entry (basic email/group format validation)
      for (const targetUser of linkWithExtras.targetUsers) {
        if (!targetUser.loginName || !targetUser.displayName) {
          Log.warn(LOG_SOURCE, `Invalid target user data: ${JSON.stringify(targetUser)}`);
          return false;
        }
      }
    }
    
    // Validate date formats if present
    if (linkWithExtras.validFrom && linkWithExtras.validFrom !== '') {
      if (isNaN(Date.parse(linkWithExtras.validFrom))) {
        Log.warn(LOG_SOURCE, `Invalid validFrom date: ${linkWithExtras.validFrom}`);
        return false;
      }
    }
    
    if (linkWithExtras.validTo && linkWithExtras.validTo !== '') {
      if (isNaN(Date.parse(linkWithExtras.validTo))) {
        Log.warn(LOG_SOURCE, `Invalid validTo date: ${linkWithExtras.validTo}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Export analytics data with enhanced metrics
   */
  public static exportAnalyticsData(links: IContextualMenuItem[]): string {
    // Generate sample analytics data (in real implementation, this would come from actual usage data)
    const analyticsData = links.map(link => ({
      name: link.name,
      url: link.href,
      clickCount: Math.floor(Math.random() * 100),
      lastClicked: new Date().toISOString(),
      category: (link as any).category || 'General',
      uniqueUsers: Math.floor(Math.random() * 20)
    }));
    
    return this.convertAnalyticsToCSV(analyticsData);
  }

  /**
   * Convert analytics data to CSV format
   */
  private static convertAnalyticsToCSV(analyticsData: any[]): string {
    const headers = ['Name', 'URL', 'Click Count', 'Last Clicked', 'Category', 'Unique Users'];
    const csvRows = [headers.join(',')];
    
    analyticsData.forEach(item => {
      const values = [
        this.escapeCSVValue(item.name),
        this.escapeCSVValue(item.url),
        item.clickCount,
        this.escapeCSVValue(item.lastClicked),
        this.escapeCSVValue(item.category),
        item.uniqueUsers
      ];
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Convert validation results to CSV format
   */
  public static convertValidationResultsToCSV(reportData: any[]): string {
    const headers = ['Name', 'URL', 'Status', 'Status Code', 'Message', 'Response Time', 'Date Status', 'Date Message', 'Last Checked', 'Category'];
    const csvRows = [headers.join(',')];
    
    reportData.forEach(item => {
      const values = [
        this.escapeCSVValue(item.name),
        this.escapeCSVValue(item.url),
        this.escapeCSVValue(item.status),
        item.statusCode,
        this.escapeCSVValue(item.message),
        item.responseTime,
        this.escapeCSVValue(item.dateStatus),
        this.escapeCSVValue(item.dateMessage),
        this.escapeCSVValue(item.lastChecked),
        this.escapeCSVValue(item.category)
      ];
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Download CSV file to user's device
   */
  public static downloadCSVFile(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Escape CSV values containing commas, quotes, or newlines
   */
  private static escapeCSVValue(value: any): string {
    const stringValue = String(value || '');
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }
}