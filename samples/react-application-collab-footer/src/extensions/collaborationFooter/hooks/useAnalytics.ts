import { useState, useEffect, useCallback, useMemo } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import { 
  AnalyticsService, 
  IAnalyticsOverview, 
  ILinkUsageStats, 
  IUserStats 
} from '../services/analyticsService';
import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'useAnalytics';

export interface IAnalyticsHook {
  // State
  analyticsOverview: IAnalyticsOverview | null;
  linkStats: ILinkUsageStats[];
  userStats: IUserStats[];
  isLoading: boolean;
  
  // Methods
  trackLinkClick: (link: IContextualMenuItem) => Promise<void>;
  refreshAnalytics: () => Promise<void>;
  exportAnalytics: () => Promise<string>;
  clearAnalytics: () => Promise<void>;
  getAnalyticsDataSize: () => Promise<{events: number, sizeKB: number}>;
  
  // Helpers
  getLinkStats: (linkId: string) => ILinkUsageStats | null;
  isLinkPopular: (linkId: string, threshold?: number) => boolean;
  getUserStats: (userId: string) => IUserStats | null;
  getMostPopularLinks: (count?: number) => ILinkUsageStats[];
  getMostActiveUsers: (count?: number) => IUserStats[];
}

export const useAnalytics = (
  context?: WebPartContext,
  autoRefresh = false,
  refreshInterval = 60000 // 1 minute
): IAnalyticsHook => {
  const [analyticsOverview, setAnalyticsOverview] = useState<IAnalyticsOverview | null>(null);
  const [linkStats, setLinkStats] = useState<ILinkUsageStats[]>([]);
  const [userStats, setUserStats] = useState<IUserStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Refresh analytics data
  const refreshAnalytics = useCallback(async () => {
    if (!context) return;

    try {
      setIsLoading(true);
      
      const [overview, links, users] = await Promise.all([
        AnalyticsService.getAnalyticsOverview(),
        AnalyticsService.getAllLinkStats(),
        AnalyticsService.getAllUserStats()
      ]);
      
      setAnalyticsOverview(overview);
      setLinkStats(links);
      setUserStats(users);
      
      Log.info(LOG_SOURCE, 'Analytics data refreshed');
      
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      setAnalyticsOverview(null);
      setLinkStats([]);
      setUserStats([]);
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  // Track link click with analytics
  const trackLinkClick = useCallback(async (link: IContextualMenuItem) => {
    if (!context) return;

    try {
      await AnalyticsService.trackLinkClick(link, context);
      Log.info(LOG_SOURCE, `Tracked click for link: ${link.name}`);
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      // Don't throw error to avoid disrupting user experience
    }
  }, [context]);

  // Export analytics data
  const exportAnalytics = useCallback(async (): Promise<string> => {
    try {
      return await AnalyticsService.exportAnalyticsCSV();
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }, []);

  // Clear all analytics data
  const clearAnalytics = useCallback(async (): Promise<void> => {
    try {
      await AnalyticsService.clearAnalyticsData();
      await refreshAnalytics();
      Log.info(LOG_SOURCE, 'Analytics data cleared');
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }, [refreshAnalytics]);

  // Get analytics data size
  const getAnalyticsDataSize = useCallback(async (): Promise<{events: number, sizeKB: number}> => {
    try {
      return await AnalyticsService.getAnalyticsDataSize();
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      return {events: 0, sizeKB: 0};
    }
  }, []);

  // Get stats for specific link
  const getLinkStats = useCallback((linkId: string): ILinkUsageStats | null => {
    return linkStats.find(stat => stat.linkId === linkId) || null;
  }, [linkStats]);

  // Check if link is popular based on threshold
  const isLinkPopular = useCallback((linkId: string, threshold = 50): boolean => {
    const stats = getLinkStats(linkId);
    return stats ? stats.popularityScore >= threshold : false;
  }, [getLinkStats]);

  // Get stats for specific user
  const getUserStats = useCallback((userId: string): IUserStats | null => {
    return userStats.find(stat => stat.userId === userId) || null;
  }, [userStats]);

  // Get most popular links
  const getMostPopularLinks = useCallback((count = 10): ILinkUsageStats[] => {
    return linkStats
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, count);
  }, [linkStats]);

  // Get most active users
  const getMostActiveUsers = useCallback((count = 10): IUserStats[] => {
    return userStats
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, count);
  }, [userStats]);

  // Load analytics data on mount
  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  // Set up auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh || !context) return;

    const intervalId = setInterval(refreshAnalytics, refreshInterval);
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, refreshAnalytics, context]);

  // Memoized return value
  const hookValue = useMemo((): IAnalyticsHook => ({
    // State
    analyticsOverview,
    linkStats,
    userStats,
    isLoading,
    
    // Methods
    trackLinkClick,
    refreshAnalytics,
    exportAnalytics,
    clearAnalytics,
    getAnalyticsDataSize,
    
    // Helpers
    getLinkStats,
    isLinkPopular,
    getUserStats,
    getMostPopularLinks,
    getMostActiveUsers
  }), [
    analyticsOverview,
    linkStats,
    userStats,
    isLoading,
    trackLinkClick,
    refreshAnalytics,
    exportAnalytics,
    clearAnalytics,
    getAnalyticsDataSize,
    getLinkStats,
    isLinkPopular,
    getUserStats,
    getMostPopularLinks,
    getMostActiveUsers
  ]);

  return hookValue;
};