import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { Text } from '@fluentui/react/lib/Text';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { 
  AnalyticsService, 
  IAnalyticsOverview, 
  ILinkUsageStats, 
  IUserStats 
} from '../../services/analyticsService';
import styles from './AnalyticsDashboard.module.scss';

export interface IAnalyticsDashboardProps {
  context: WebPartContext;
  onStatusUpdate: (message: string, isError?: boolean) => void;
}

export const AnalyticsDashboard: React.FC<IAnalyticsDashboardProps> = ({
  context,
  onStatusUpdate
}) => {
  const [analyticsOverview, setAnalyticsOverview] = useState<IAnalyticsOverview | null>(null);
  const [linkStats, setLinkStats] = useState<ILinkUsageStats[]>([]);
  const [userStats, setUserStats] = useState<IUserStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showClearDialog, setShowClearDialog] = useState<boolean>(false);
  const [dataSize, setDataSize] = useState<{events: number, sizeKB: number}>({events: 0, sizeKB: 0});

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overview, links, users, size] = await Promise.all([
        AnalyticsService.getAnalyticsOverview(),
        AnalyticsService.getAllLinkStats(),
        AnalyticsService.getAllUserStats(),
        AnalyticsService.getAnalyticsDataSize()
      ]);
      
      setAnalyticsOverview(overview);
      setLinkStats(links);
      setUserStats(users);
      setDataSize(size);
      
    } catch (error) {
      onStatusUpdate(`Failed to load analytics: ${(error as Error).message}`, true);
    } finally {
      setIsLoading(false);
    }
  }, [onStatusUpdate]);

  // Initialize component
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Export analytics data
  const handleExportAnalytics = useCallback(async () => {
    try {
      const csvData = await AnalyticsService.exportAnalyticsCSV();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `footer-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onStatusUpdate('Analytics data exported successfully');
      
    } catch (error) {
      onStatusUpdate(`Failed to export analytics: ${(error as Error).message}`, true);
    }
  }, [onStatusUpdate]);

  // Clear analytics data
  const handleClearAnalytics = useCallback(async () => {
    try {
      await AnalyticsService.clearAnalyticsData();
      onStatusUpdate('Analytics data cleared');
      setShowClearDialog(false);
      await loadAnalytics();
    } catch (error) {
      onStatusUpdate(`Failed to clear analytics: ${(error as Error).message}`, true);
    }
  }, [onStatusUpdate, loadAnalytics]);

  // Columns for link statistics
  const linkStatsColumns: IColumn[] = [
    {
      key: 'linkName',
      name: 'Link Name',
      fieldName: 'linkName',
      minWidth: 150,
      maxWidth: 250,
      isResizable: true
    },
    {
      key: 'linkCategory',
      name: 'Category',
      fieldName: 'linkCategory',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true
    },
    {
      key: 'totalClicks',
      name: 'Total Clicks',
      fieldName: 'totalClicks',
      minWidth: 80,
      maxWidth: 100,
      onRender: (item: ILinkUsageStats) => <Text>{item.totalClicks}</Text>
    },
    {
      key: 'uniqueUsers',
      name: 'Unique Users',
      fieldName: 'uniqueUsers',
      minWidth: 80,
      maxWidth: 100,
      onRender: (item: ILinkUsageStats) => <Text>{item.uniqueUsers}</Text>
    },
    {
      key: 'clicksThisWeek',
      name: 'This Week',
      fieldName: 'clicksThisWeek',
      minWidth: 80,
      maxWidth: 100,
      onRender: (item: ILinkUsageStats) => <Text>{item.clicksThisWeek}</Text>
    },
    {
      key: 'clicksThisMonth',
      name: 'This Month',
      fieldName: 'clicksThisMonth',
      minWidth: 80,
      maxWidth: 100,
      onRender: (item: ILinkUsageStats) => <Text>{item.clicksThisMonth}</Text>
    },
    {
      key: 'popularityScore',
      name: 'Popularity',
      fieldName: 'popularityScore',
      minWidth: 80,
      maxWidth: 100,
      onRender: (item: ILinkUsageStats) => (
        <div className={styles.popularityScore}>
          <ProgressIndicator percentComplete={Math.min(item.popularityScore / 100, 1)} />
          <Text variant="small">{item.popularityScore}</Text>
        </div>
      )
    },
    {
      key: 'lastClickDate',
      name: 'Last Click',
      fieldName: 'lastClickDate',
      minWidth: 120,
      maxWidth: 150,
      onRender: (item: ILinkUsageStats) => (
        <Text>{new Date(item.lastClickDate).toLocaleDateString()}</Text>
      )
    }
  ];

  // Columns for user statistics
  const userStatsColumns: IColumn[] = [
    {
      key: 'userDisplayName',
      name: 'User',
      fieldName: 'userDisplayName',
      minWidth: 150,
      maxWidth: 200,
      isResizable: true
    },
    {
      key: 'totalClicks',
      name: 'Total Clicks',
      fieldName: 'totalClicks',
      minWidth: 80,
      maxWidth: 100
    },
    {
      key: 'uniqueLinksClicked',
      name: 'Unique Links',
      fieldName: 'uniqueLinksClicked',
      minWidth: 80,
      maxWidth: 100
    },
    {
      key: 'mostClickedCategory',
      name: 'Favorite Category',
      fieldName: 'mostClickedCategory',
      minWidth: 120,
      maxWidth: 150
    },
    {
      key: 'lastActivityDate',
      name: 'Last Activity',
      fieldName: 'lastActivityDate',
      minWidth: 120,
      maxWidth: 150,
      onRender: (item: IUserStats) => (
        <Text>{new Date(item.lastActivityDate).toLocaleDateString()}</Text>
      )
    },
    {
      key: 'favoriteLinks',
      name: 'Top Links',
      fieldName: 'favoriteLinks',
      minWidth: 200,
      maxWidth: 300,
      onRender: (item: IUserStats) => (
        <div className={styles.favoriteLinks}>
          {item.favoriteLinks.slice(0, 3).map((link, index) => (
            <div key={index} className={styles.favoriteLink}>
              <Text variant="small">{link.linkName} ({link.clicks})</Text>
            </div>
          ))}
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.large} label="Loading analytics data..." />
      </div>
    );
  }

  if (!analyticsOverview) {
    return (
      <div className={styles.analyticsError}>
        <MessageBar messageBarType={MessageBarType.error}>
          Failed to load analytics data. Please try refreshing the page.
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.analyticsDashboard}>
      <div className={styles.dashboardHeader}>
        <Text variant="xxLarge" className={styles.dashboardTitle}>Analytics Dashboard</Text>
        <Text variant="medium" className={styles.dashboardDescription}>
          Link usage statistics and user activity insights
        </Text>
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={styles.statCard}>
          <Text variant="xxLarge" className={styles.statValue}>{analyticsOverview.totalClicks}</Text>
          <Text variant="medium" className={styles.statLabel}>Total Clicks</Text>
        </div>
        <div className={styles.statCard}>
          <Text variant="xxLarge" className={styles.statValue}>{analyticsOverview.totalUsers}</Text>
          <Text variant="medium" className={styles.statLabel}>Active Users</Text>
        </div>
        <div className={styles.statCard}>
          <Text variant="xxLarge" className={styles.statValue}>{analyticsOverview.totalLinks}</Text>
          <Text variant="medium" className={styles.statLabel}>Tracked Links</Text>
        </div>
        <div className={styles.statCard}>
          <Text variant="xxLarge" className={styles.statValue}>{analyticsOverview.averageClicksPerUser}</Text>
          <Text variant="medium" className={styles.statLabel}>Avg Clicks/User</Text>
        </div>
      </div>

      {/* Key Insights */}
      <div className={styles.insightsSection}>
        <Text variant="large" className={styles.sectionTitle}>Key Insights</Text>
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <Text variant="mediumPlus" className={styles.insightTitle}>Most Popular Link</Text>
            <Text variant="large" className={styles.insightValue}>{analyticsOverview.mostPopularLink}</Text>
          </div>
          <div className={styles.insightCard}>
            <Text variant="mediumPlus" className={styles.insightTitle}>Most Active User</Text>
            <Text variant="large" className={styles.insightValue}>{analyticsOverview.mostActiveUser}</Text>
          </div>
          <div className={styles.insightCard}>
            <Text variant="mediumPlus" className={styles.insightTitle}>Top Category</Text>
            <Text variant="large" className={styles.insightValue}>{analyticsOverview.mostPopularCategory}</Text>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      {analyticsOverview.categoryDistribution.length > 0 && (
        <div className={styles.categorySection}>
          <Text variant="large" className={styles.sectionTitle}>Category Distribution</Text>
          <div className={styles.categoryBars}>
            {analyticsOverview.categoryDistribution.map((category, index) => (
              <div key={index} className={styles.categoryBar}>
                <div className={styles.categoryInfo}>
                  <Text variant="medium">{category.category}</Text>
                  <Text variant="small">{category.clicks} clicks ({category.percentage}%)</Text>
                </div>
                <ProgressIndicator percentComplete={category.percentage / 100} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Tables */}
      <Pivot className={styles.detailsPivot}>
        <PivotItem headerText="Link Statistics" itemKey="links">
          <div className={styles.tableSection}>
            <DetailsList
              items={linkStats}
              columns={linkStatsColumns}
              setKey="linkStats"
              layoutMode={0}
              selectionMode={SelectionMode.none}
              compact={false}
            />
          </div>
        </PivotItem>
        
        <PivotItem headerText="User Activity" itemKey="users">
          <div className={styles.tableSection}>
            <DetailsList
              items={userStats}
              columns={userStatsColumns}
              setKey="userStats"
              layoutMode={0}
              selectionMode={SelectionMode.none}
              compact={false}
            />
          </div>
        </PivotItem>
      </Pivot>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <DefaultButton
          text="Refresh Data"
          iconProps={{ iconName: 'Refresh' }}
          onClick={loadAnalytics}
        />
        <DefaultButton
          text="Export CSV"
          iconProps={{ iconName: 'Download' }}
          onClick={handleExportAnalytics}
        />
        <DefaultButton
          text="Clear All Data"
          iconProps={{ iconName: 'Delete' }}
          onClick={() => setShowClearDialog(true)}
          styles={{
            root: { 
              borderColor: '#d13438',
              color: '#d13438' 
            }
          }}
        />
      </div>

      {/* Data Size Info */}
      <div className={styles.dataInfo}>
        <MessageBar messageBarType={MessageBarType.info}>
          <strong>Data Storage:</strong> {dataSize.events} events stored, using {dataSize.sizeKB} KB of local storage.
          Data is automatically trimmed to keep the most recent 10,000 events.
        </MessageBar>
      </div>

      {/* Clear Data Confirmation Dialog */}
      <Dialog
        hidden={!showClearDialog}
        onDismiss={() => setShowClearDialog(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Clear Analytics Data',
          subText: 'Are you sure you want to delete all analytics data? This action cannot be undone and will remove all click tracking history.'
        }}
        modalProps={{ isBlocking: true }}
      >
        <DialogFooter>
          <PrimaryButton
            text="Clear All Data"
            onClick={handleClearAnalytics}
          />
          <DefaultButton
            text="Cancel"
            onClick={() => setShowClearDialog(false)}
          />
        </DialogFooter>
      </Dialog>
    </div>
  );
};