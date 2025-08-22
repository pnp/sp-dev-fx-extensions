import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { Log } from '@microsoft/sp-core-library';

// Memory management for analytics data
class AnalyticsMemoryManager {
  private static instance: AnalyticsMemoryManager;
  private cacheMap = new WeakMap();
  private readonly MAX_CACHE_SIZE = 1000;
  private cacheEntries = 0;

  static getInstance(): AnalyticsMemoryManager {
    if (!AnalyticsMemoryManager.instance) {
      AnalyticsMemoryManager.instance = new AnalyticsMemoryManager();
    }
    return AnalyticsMemoryManager.instance;
  }

  getCachedData<T>(key: object, factory: () => T): T {
    if (this.cacheMap.has(key)) {
      return this.cacheMap.get(key);
    }
    
    if (this.cacheEntries >= this.MAX_CACHE_SIZE) {
      this.clearCache();
    }
    
    const data = factory();
    this.cacheMap.set(key, data);
    this.cacheEntries++;
    return data;
  }

  clearCache(): void {
    this.cacheMap = new WeakMap();
    this.cacheEntries = 0;
  }
}

const LOG_SOURCE: string = 'AnalyticsService';

export interface ILinkClickEvent {
  linkId: string;
  linkName: string;
  linkUrl: string;
  linkCategory: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  clickTimestamp: string;
  pageUrl: string;
  userAgent: string;
  sessionId: string;
}

export interface ILinkUsageStats {
  linkId: string;
  linkName: string;
  linkUrl: string;
  linkCategory: string;
  totalClicks: number;
  uniqueUsers: number;
  lastClickDate: string;
  firstClickDate: string;
  clicksThisWeek: number;
  clicksThisMonth: number;
  averageClicksPerDay: number;
  popularityScore: number;
}

export interface IUserStats {
  userId: string;
  userDisplayName: string;
  userEmail: string;
  totalClicks: number;
  uniqueLinksClicked: number;
  lastActivityDate: string;
  firstActivityDate: string;
  mostClickedCategory: string;
  favoriteLinks: Array<{linkName: string, clicks: number}>;
}

export interface IAnalyticsOverview {
  totalClicks: number;
  totalUsers: number;
  totalLinks: number;
  averageClicksPerUser: number;
  mostPopularLink: string;
  mostActiveUser: string;
  mostPopularCategory: string;
  dailyClickTrend: Array<{date: string, clicks: number}>;
  categoryDistribution: Array<{category: string, clicks: number, percentage: number}>;
}

export class AnalyticsService {
  private static readonly STORAGE_KEY = 'CollabFooter_Analytics';
  private static readonly USER_STATS_KEY = 'CollabFooter_UserStats';
  private static sessionId: string | null = null;

  /**
   * Track a link click event
   */
  public static async trackLinkClick(
    link: IContextualMenuItem,
    context: WebPartContext
  ): Promise<void> {
    try {
      const linkData = link as any;
      
      // Generate session ID if needed
      if (!this.sessionId) {
        this.sessionId = this.generateSessionId();
      }

      const clickEvent: ILinkClickEvent = {
        linkId: link.key,
        linkName: link.name || 'Unknown Link',
        linkUrl: link.href || '',
        linkCategory: linkData.category || 'General',
        userId: context.pageContext.user.loginName,
        userDisplayName: context.pageContext.user.displayName,
        userEmail: context.pageContext.user.email,
        clickTimestamp: new Date().toISOString(),
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId
      };

      // Store the click event
      await this.storeClickEvent(clickEvent);

      // Update link usage stats
      await this.updateLinkUsageStats(clickEvent);

      // Update user stats
      await this.updateUserStats(clickEvent);

      Log.info(LOG_SOURCE, `Tracked click: ${clickEvent.linkName} by ${clickEvent.userDisplayName}`);

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      // Don't throw error to avoid disrupting user experience
    }
  }

  /**
   * Get analytics overview
   */
  public static async getAnalyticsOverview(): Promise<IAnalyticsOverview> {
    try {
      const clickEvents = await this.getClickEvents();
      const linkStats = await this.getAllLinkStats();
      const userStats = await this.getAllUserStats();

      const totalClicks = clickEvents.length;
      const totalUsers = new Set(clickEvents.map(e => e.userId)).size;
      const totalLinks = new Set(clickEvents.map(e => e.linkId)).size;

      // Calculate daily trend for last 30 days
      const dailyClickTrend = this.calculateDailyTrend(clickEvents, 30);

      // Calculate category distribution
      const categoryClickCounts = new Map<string, number>();
      clickEvents.forEach(event => {
        categoryClickCounts.set(
          event.linkCategory,
          (categoryClickCounts.get(event.linkCategory) || 0) + 1
        );
      });

      const categoryDistribution = Array.from(categoryClickCounts.entries())
        .map(([category, clicks]) => ({
          category,
          clicks,
          percentage: totalClicks > 0 ? Math.round((clicks / totalClicks) * 100) : 0
        }))
        .sort((a, b) => b.clicks - a.clicks);

      // Find most popular items
      const mostPopularLink = linkStats.length > 0 
        ? linkStats.sort((a, b) => b.totalClicks - a.totalClicks)[0].linkName
        : 'None';

      const mostActiveUser = userStats.length > 0
        ? userStats.sort((a, b) => b.totalClicks - a.totalClicks)[0].userDisplayName
        : 'None';

      const mostPopularCategory = categoryDistribution.length > 0 
        ? categoryDistribution[0].category 
        : 'None';

      return {
        totalClicks,
        totalUsers,
        totalLinks,
        averageClicksPerUser: totalUsers > 0 ? Math.round(totalClicks / totalUsers) : 0,
        mostPopularLink,
        mostActiveUser,
        mostPopularCategory,
        dailyClickTrend,
        categoryDistribution
      };

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return this.getEmptyAnalyticsOverview();
    }
  }

  /**
   * Get usage statistics for all links (optimized for memory)
   */
  public static async getAllLinkStats(): Promise<ILinkUsageStats[]> {
    try {
      const clickEvents = await this.getClickEvents();
      const memoryManager = AnalyticsMemoryManager.getInstance();
      
      // Use memory manager for caching
      return memoryManager.getCachedData(clickEvents, () => {
        const linkStatsMap = new Map<string, ILinkUsageStats>();

        // Group clicks by link - optimized approach
        const linkClicksMap = new Map<string, ILinkClickEvent[]>();
        
        // Optimized approach without pre-sizing
        
        for (let i = 0; i < clickEvents.length; i++) {
          const event = clickEvents[i];
          let clicks = linkClicksMap.get(event.linkId);
          if (!clicks) {
            clicks = [];
            linkClicksMap.set(event.linkId, clicks);
          }
          clicks.push(event);
        }

      // Calculate stats for each link
      linkClicksMap.forEach((clicks, linkId) => {
        const firstEvent = clicks[0];
        
        // Optimized unique users count without creating Set
        const userIds = new Set<string>();
        let clicksThisWeek = 0;
        let clicksThisMonth = 0;
        let minTime = Infinity;
        let maxTime = 0;
        
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        
        // Single pass through clicks for better performance
        for (let i = 0; i < clicks.length; i++) {
          const click = clicks[i];
          userIds.add(click.userId);
          
          const clickTime = new Date(click.clickTimestamp).getTime();
          if (clickTime < minTime) minTime = clickTime;
          if (clickTime > maxTime) maxTime = clickTime;
          
          if (clickTime >= weekAgo) clicksThisWeek++;
          if (clickTime >= monthAgo) clicksThisMonth++;
        }
        
        const uniqueUsers = userIds.size;
        
        const firstClickDate = new Date(minTime);
        const lastClickDate = new Date(maxTime);
        
        const daysSinceFirst = Math.max(1, (now - minTime) / (1000 * 60 * 60 * 24));
        const averageClicksPerDay = clicks.length / daysSinceFirst;

        // Calculate popularity score (weighted by recency and frequency)
        const recentClicksWeight = clicksThisWeek * 2 + clicksThisMonth * 1;
        const popularityScore = (clicks.length * 0.5) + (uniqueUsers * 2) + (recentClicksWeight * 0.3);

        linkStatsMap.set(linkId, {
          linkId,
          linkName: firstEvent.linkName,
          linkUrl: firstEvent.linkUrl,
          linkCategory: firstEvent.linkCategory,
          totalClicks: clicks.length,
          uniqueUsers,
          lastClickDate: lastClickDate.toISOString(),
          firstClickDate: firstClickDate.toISOString(),
          clicksThisWeek,
          clicksThisMonth,
          averageClicksPerDay: Math.round(averageClicksPerDay * 100) / 100,
          popularityScore: Math.round(popularityScore * 100) / 100
        });
      });

        return Array.from(linkStatsMap.values())
          .sort((a, b) => b.popularityScore - a.popularityScore);
      });

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  /**
   * Get usage statistics for a specific link
   */
  public static async getLinkStats(linkId: string): Promise<ILinkUsageStats | null> {
    try {
      const allStats = await this.getAllLinkStats();
      return allStats.find(stat => stat.linkId === linkId) || null;
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return null;
    }
  }

  /**
   * Get user statistics
   */
  public static async getAllUserStats(): Promise<IUserStats[]> {
    try {
      const clickEvents = await this.getClickEvents();
      const userStatsMap = new Map<string, IUserStats>();

      // Group clicks by user
      const userClicksMap = new Map<string, ILinkClickEvent[]>();
      clickEvents.forEach(event => {
        if (!userClicksMap.has(event.userId)) {
          userClicksMap.set(event.userId, []);
        }
        userClicksMap.get(event.userId)!.push(event);
      });

      // Calculate stats for each user
      userClicksMap.forEach((clicks, userId) => {
        const firstEvent = clicks[0];
        const uniqueLinks = new Set(clicks.map(c => c.linkId)).size;
        const clickDates = clicks.map(c => new Date(c.clickTimestamp));
        
        // Find most clicked category
        const categoryClickCounts = new Map<string, number>();
        clicks.forEach(click => {
          categoryClickCounts.set(
            click.linkCategory,
            (categoryClickCounts.get(click.linkCategory) || 0) + 1
          );
        });
        const mostClickedCategory = Array.from(categoryClickCounts.entries())
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

        // Find favorite links (top 5)
        const linkClickCounts = new Map<string, {name: string, count: number}>();
        clicks.forEach(click => {
          if (!linkClickCounts.has(click.linkId)) {
            linkClickCounts.set(click.linkId, {name: click.linkName, count: 0});
          }
          linkClickCounts.get(click.linkId)!.count++;
        });
        const favoriteLinks = Array.from(linkClickCounts.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .map(link => ({linkName: link.name, clicks: link.count}));

        const firstClickDate = new Date(Math.min(...clickDates.map(d => d.getTime())));
        const lastClickDate = new Date(Math.max(...clickDates.map(d => d.getTime())));

        userStatsMap.set(userId, {
          userId,
          userDisplayName: firstEvent.userDisplayName,
          userEmail: firstEvent.userEmail,
          totalClicks: clicks.length,
          uniqueLinksClicked: uniqueLinks,
          lastActivityDate: lastClickDate.toISOString(),
          firstActivityDate: firstClickDate.toISOString(),
          mostClickedCategory,
          favoriteLinks
        });
      });

      return Array.from(userStatsMap.values())
        .sort((a, b) => b.totalClicks - a.totalClicks);

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return [];
    }
  }

  /**
   * Export analytics data as CSV
   */
  public static async exportAnalyticsCSV(): Promise<string> {
    try {
      const clickEvents = await this.getClickEvents();
      
      const headers = [
        'Link ID', 'Link Name', 'Link URL', 'Category', 'User ID', 'User Display Name', 
        'User Email', 'Click Timestamp', 'Page URL', 'Session ID'
      ];

      const csvRows = [headers.join(',')];
      
      clickEvents.forEach(event => {
        const row = [
          this.escapeCSVValue(event.linkId),
          this.escapeCSVValue(event.linkName),
          this.escapeCSVValue(event.linkUrl),
          this.escapeCSVValue(event.linkCategory),
          this.escapeCSVValue(event.userId),
          this.escapeCSVValue(event.userDisplayName),
          this.escapeCSVValue(event.userEmail),
          this.escapeCSVValue(event.clickTimestamp),
          this.escapeCSVValue(event.pageUrl),
          this.escapeCSVValue(event.sessionId)
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw new Error(`Failed to export analytics: ${(error as Error).message}`);
    }
  }

  /**
   * Clear all analytics data
   */
  public static async clearAnalyticsData(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.USER_STATS_KEY);
      Log.info(LOG_SOURCE, 'Analytics data cleared');
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw new Error(`Failed to clear analytics data: ${(error as Error).message}`);
    }
  }

  /**
   * Get analytics data size
   */
  public static async getAnalyticsDataSize(): Promise<{events: number, sizeKB: number}> {
    try {
      const clickEvents = await this.getClickEvents();
      const dataString = JSON.stringify(clickEvents);
      const sizeKB = Math.round(new Blob([dataString]).size / 1024 * 100) / 100;
      
      return {
        events: clickEvents.length,
        sizeKB
      };
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return {events: 0, sizeKB: 0};
    }
  }

  // Private helper methods

  private static async storeClickEvent(event: ILinkClickEvent): Promise<void> {
    const existingEvents = await this.getClickEvents();
    existingEvents.push(event);
    
    // Keep only last 10000 events to prevent storage bloat
    const trimmedEvents = existingEvents.slice(-10000);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedEvents));
  }

  private static async getClickEvents(): Promise<ILinkClickEvent[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      Log.warn(LOG_SOURCE, 'Failed to parse stored click events');
      return [];
    }
  }

  private static async updateLinkUsageStats(event: ILinkClickEvent): Promise<void> {
    // This is handled dynamically in getAllLinkStats()
    // Could be extended to cache computed stats for performance
  }

  private static async updateUserStats(event: ILinkClickEvent): Promise<void> {
    // This is handled dynamically in getAllUserStats()
    // Could be extended to cache computed stats for performance
  }

  private static generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static calculateDailyTrend(events: ILinkClickEvent[], days: number): Array<{date: string, clicks: number}> {
    const now = new Date();
    const dailyClickCounts = new Map<string, number>();

    // Initialize all days with 0 clicks
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      dailyClickCounts.set(dateString, 0);
    }

    // Count actual clicks
    events.forEach(event => {
      const eventDate = new Date(event.clickTimestamp);
      const dateString = eventDate.toISOString().split('T')[0];
      
      if (dailyClickCounts.has(dateString)) {
        dailyClickCounts.set(dateString, (dailyClickCounts.get(dateString) || 0) + 1);
      }
    });

    return Array.from(dailyClickCounts.entries())
      .map(([date, clicks]) => ({date, clicks}))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private static getEmptyAnalyticsOverview(): IAnalyticsOverview {
    return {
      totalClicks: 0,
      totalUsers: 0,
      totalLinks: 0,
      averageClicksPerUser: 0,
      mostPopularLink: 'None',
      mostActiveUser: 'None',
      mostPopularCategory: 'None',
      dailyClickTrend: [],
      categoryDistribution: []
    };
  }

  private static escapeCSVValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}