import { CACHE_CONSTANTS } from '../constants/ApplicationConstants';

export interface IFluentIcon {
  name: string;
  category: string;
}

export class IconService {
  // Cached icon data to prevent recreation
  private static _cachedIcons: IFluentIcon[] | null = null;
  private static _cachedCategories: string[] | null = null;
  private static _filterCache = new Map<string, IFluentIcon[]>();
  
  /**
   * Get all available Fluent UI icons organized by category (cached)
   */
  public static getFluentIcons(): IFluentIcon[] {
    if (this._cachedIcons) {
      return this._cachedIcons;
    }
    
    this._cachedIcons = [
      // Basic icons
      ...this.createIconsForCategory('Basic', [
        'Link', 'Globe', 'Home', 'Info', 'Settings', 'Search', 'Add', 'Delete', 
        'Edit', 'Save', 'Cancel', 'CheckMark', 'Clear', 'Refresh', 'Download', 
        'Upload', 'Share', 'Copy', 'Print', 'Mail', 'Phone', 'Calendar', 'Clock', 
        'Flag', 'Tag', 'Pin', 'Heart', 'Star', 'Important'
      ]),
      
      // Microsoft App icons
      ...this.createIconsForCategory('Microsoft', [
        'SharePoint', 'OneDrive', 'Teams', 'Outlook', 'Excel', 'Word', 'PowerPoint', 
        'OneNote', 'Skype', 'Yammer', 'Stream', 'PowerBI', 'VisualStudio', 'AzureDevOps'
      ]),
      
      // Navigation icons
      ...this.createIconsForCategory('Navigation', [
        'ChevronUp', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'Up', 'Down', 
        'Left', 'Right', 'Forward', 'Back', 'Previous', 'Next', 'DoubleChevronUp', 
        'DoubleChevronDown', 'DoubleChevronLeft', 'DoubleChevronRight'
      ]),
      
      // Communication icons
      ...this.createIconsForCategory('Communication', [
        'MessageFill', 'Chat', 'VideoChat', 'PhoneCall', 'VideoCall', 'Comment', 
        'Comments', 'Feedback', 'ContactInfo', 'Group', 'People', 'Person', 
        'PersonAdd', 'Megaphone', 'SpeakerPhone', 'Microphone'
      ]),
      
      // Files & Documents
      ...this.createIconsForCategory('Files', [
        'Page', 'PageList', 'Document', 'DocumentSet', 'OpenFile', 'FileTemplate', 
        'TextDocument', 'ExcelDocument', 'WordDocument', 'PowerPointDocument', 
        'PDFDocument', 'ImageDocument', 'VideoDocument', 'AudioDocument', 'ZipFolder'
      ]),
      
      // Status & Alerts
      ...this.createIconsForCategory('Status', [
        'Completed', 'Accept', 'StatusCircleCheckmark', 'CompletedSolid', 'CheckboxComposite', 
        'Warning', 'Error', 'ErrorBadge', 'StatusErrorFull', 'AlertSolid', 'WarningSolid', 
        'InfoSolid', 'StatusTriangle', 'Blocked', 'BlockedSolid', 'Critical'
      ]),
      
      // Actions
      ...this.createIconsForCategory('Actions', [
        'Play', 'Pause', 'Stop', 'Record', 'FastForward', 'Rewind', 'Volume0', 
        'Volume1', 'Volume2', 'Volume3', 'FullScreen', 'BackToWindow', 'Zoom', 
        'ZoomIn', 'ZoomOut', 'FitPage', 'FitWidth'
      ]),
      
      // Security
      ...this.createIconsForCategory('Security', [
        'Lock', 'LockSolid', 'Unlock', 'Shield', 'ShieldSolid', 'Permissions', 
        'PasswordField', 'Fingerprint', 'AuthenticatorApp', 'Certificate', 
        'SecurityGroup', 'PrivateTeam'
      ]),
      
      // Development
      ...this.createIconsForCategory('Development', [
        'Code', 'Debug', 'BugSolid', 'TestCase', 'Build', 'Deploy', 'Repo', 
        'RepoSolid', 'Branch', 'BranchMerge', 'PullRequest', 'OpenSource', 
        'APIConnection', 'WebAppBuilderModule'
      ])
    ];
    
    return this._cachedIcons;
  }

  /**
   * Get unique categories from all icons (cached)
   */
  public static getCategories(): string[] {
    if (this._cachedCategories) {
      return this._cachedCategories;
    }
    
    const icons = this.getFluentIcons();
    this._cachedCategories = [...new Set(icons.map(icon => icon.category))].sort();
    return this._cachedCategories;
  }

  /**
   * Filter icons by category and search query (cached)
   */
  public static filterIcons(category?: string, searchQuery?: string): IFluentIcon[] {
    const cacheKey = `${category || 'all'}_${searchQuery || ''}`;
    
    if (this._filterCache.has(cacheKey)) {
      return this._filterCache.get(cacheKey)!;
    }
    
    let icons = this.getFluentIcons();

    if (category && category !== 'All') {
      icons = icons.filter(icon => icon.category === category);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      icons = icons.filter(icon => 
        icon.name.toLowerCase().includes(query) || 
        icon.category.toLowerCase().includes(query)
      );
    }

    // Cache result (limit cache size to prevent memory bloat)
    if (this._filterCache.size > CACHE_CONSTANTS.MAX_CACHE_SIZE) {
      this._filterCache.clear();
    }
    this._filterCache.set(cacheKey, icons);

    return icons;
  }

  /**
   * Check if an icon name is valid (optimized with Set)
   */
  private static _validIconSet: Set<string> | null = null;
  
  public static isValidIcon(iconName: string): boolean {
    if (!this._validIconSet) {
      const icons = this.getFluentIcons();
      this._validIconSet = new Set(icons.map(icon => icon.name));
    }
    return this._validIconSet.has(iconName);
  }

  /**
   * Get popular/commonly used icons (cached)
   */
  private static _popularIcons: IFluentIcon[] | null = null;
  
  public static getPopularIcons(): IFluentIcon[] {
    if (this._popularIcons) {
      return this._popularIcons;
    }
    
    const popularIconNames = new Set([
      'Link', 'Globe', 'Home', 'Mail', 'Teams', 'SharePoint', 'OneDrive',
      'Info', 'Settings', 'Calendar', 'People', 'Document', 'Search'
    ]);
    
    const allIcons = this.getFluentIcons();
    this._popularIcons = allIcons.filter(icon => popularIconNames.has(icon.name));
    return this._popularIcons;
  }

  /**
   * Clear all caches (useful for testing)
   */
  public static clearCache(): void {
    this._cachedIcons = null;
    this._cachedCategories = null;
    this._filterCache.clear();
    this._validIconSet = null;
    this._popularIcons = null;
  }

  /**
   * Helper method to create icons for a specific category
   */
  private static createIconsForCategory(category: string, iconNames: string[]): IFluentIcon[] {
    return iconNames.map(name => ({
      name,
      category
    }));
  }
}