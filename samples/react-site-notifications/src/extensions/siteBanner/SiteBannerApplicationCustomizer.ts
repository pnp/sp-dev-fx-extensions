import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import { Banner } from '../../shared/Banner';
import { NotificationService } from '../../shared/NotificationService';
import { eligibleNotifications, matchesTarget, nextBoundary, NotificationItem } from '../../shared/notificationRules';

const LOG_SOURCE: string = 'SiteBanner';
const MAX_TIMEOUT: number = 2147483647;

export default class SiteBannerApplicationCustomizer extends BaseApplicationCustomizer<Record<string, never>> {
  private placeholder: PlaceholderContent | undefined;
  private root: Root | undefined;
  private controller: AbortController | undefined;
  private timer: number | undefined;
  private items: NotificationItem[] = [];
  private navigationId: number = 0;

  public onInit(): Promise<void> {
    this.context.placeholderProvider.changedEvent.add(this, this.onPlaceholderChanged);
    this.context.application.navigatedEvent.add(this, this.onNavigation);
    document.addEventListener('visibilitychange', this.onVisibilityChanged);
    this.onPlaceholderChanged();
    this.onNavigation();
    return Promise.resolve();
  }

  private readonly onPlaceholderChanged = (): void => {
    if (!this.placeholder) {
      this.placeholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
        onDispose: this.onPlaceholderDisposed
      });
      if (this.placeholder) this.root = createRoot(this.placeholder.domElement);
      else Log.warn(LOG_SOURCE, 'The top placeholder is not available.');
    }
    this.renderBanner();
  };

  private readonly onPlaceholderDisposed = (): void => {
    this.root?.unmount();
    this.root = undefined;
    this.placeholder = undefined;
  };

  private readonly onVisibilityChanged = (): void => {
    if (document.visibilityState === 'visible') this.renderBanner();
  };

  private readonly onNavigation = (): void => {
    this.navigationId++;
    this.controller?.abort();
    this.controller = new AbortController();
    this.items = [];
    this.renderBanner();
    const controller: AbortController = this.controller;
    const rootUrl: string = this.context.pageContext.site.absoluteUrl;
    const currentUrl: string = this.context.pageContext.web.absoluteUrl;
    const service: NotificationService = new NotificationService(this.context.spHttpClient, rootUrl);
    service.load(controller.signal, true, currentUrl).then(records => {
      if (controller.signal.aborted) return;
      const items: NotificationItem[] = [];
      records.forEach(record => {
        if (record.errors.length) {
          Log.error(LOG_SOURCE, new Error(`Notification ${record.id}: ${record.errors.join(' ')}`));
          return;
        }
        if (record.item && matchesTarget(record.item.targetSiteUrl, currentUrl, rootUrl, record.item.includeSubsites)) {
          items.push(record.item);
        }
      });
      this.items = items;
      this.renderBanner();
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        Log.error(LOG_SOURCE, error instanceof Error ? error : new Error('Failed to load notifications.'));
      }
    });
  };

  private renderBanner(): void {
    if (this.timer !== undefined) window.clearTimeout(this.timer);
    this.timer = undefined;
    const now: number = Date.now();
    const items: NotificationItem[] = eligibleNotifications(
      this.items, this.context.pageContext.web.absoluteUrl, this.context.pageContext.site.absoluteUrl, now
    );
    this.root?.render(React.createElement(Banner, {
      key: this.navigationId,
      items,
      collectionUrl: this.context.pageContext.site.absoluteUrl
    }));
    const next: number | undefined = nextBoundary(this.items, now);
    if (next !== undefined) {
      this.timer = window.setTimeout(() => this.renderBanner(), Math.min(next - now, MAX_TIMEOUT));
    }
  }

  protected onDispose(): void {
    this.controller?.abort();
    if (this.timer !== undefined) window.clearTimeout(this.timer);
    document.removeEventListener('visibilitychange', this.onVisibilityChanged);
    this.context.application.navigatedEvent.remove(this, this.onNavigation);
    this.context.placeholderProvider.changedEvent.remove(this, this.onPlaceholderChanged);
    this.placeholder?.dispose();
    this.onPlaceholderDisposed();
  }
}
