import { emitNavigationTelemetry } from '../utils/navigationTelemetry';

export interface IPageViewPayload {
  url: string;
  title: string;
  referrer: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  isMobile: boolean;
  isTeamsContext: boolean;
}

export class AnalyticsService {
  private _lastTrackedUrl?: string;

  public trackPageView(payload: IPageViewPayload): void {
    if (this._lastTrackedUrl === payload.url) {
      return;
    }

    this._lastTrackedUrl = payload.url;
    emitNavigationTelemetry({
      action: 'page-view',
      level: 'service',
      metadata: {
        url: payload.url,
        title: payload.title,
        referrer: payload.referrer,
        screenWidth: payload.screenWidth,
        screenHeight: payload.screenHeight,
        language: payload.language,
        isMobile: payload.isMobile,
        isTeamsContext: payload.isTeamsContext
      }
    });
  }
}