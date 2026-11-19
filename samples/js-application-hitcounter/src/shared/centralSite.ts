/**
 * Central site property rules (scope F6, "set central site" step), with no
 * SharePoint calls so they can be unit-tested. The tenant property
 * HitCounterCentralSiteUrl tells every tracker which site saves page views.
 */
import { CENTRAL_SITE_PROPERTY, parseCentralProperty } from '../extensions/hitCounterTracker/hitUtils';

export { CENTRAL_SITE_PROPERTY };

export const CENTRAL_SITE_DESCRIPTION: string = 'HitCounter: central site that every tracker saves page views to';

export type CentralState =
  /** No property: each tracker saves to its own site. */
  'not-set' |
  /** This site is the central site and the property matches its settings. */
  'this-site' |
  /** This site is central, but "Also track page views on this site" differs from the property. */
  'this-site-out-of-date' |
  /** Another site is central. */
  'other-site' |
  /** Set, but not a URL or JSON HitCounter can read. */
  'unreadable';

export interface ICentralDescription {
  state: CentralState;
  /** The central site the property names, when readable. */
  centralSiteUrl?: string;
  trackCentralSite?: boolean;
}

function trim(url: string): string {
  return url.replace(/\/+$/, '').toLowerCase();
}

/** What the tenant property means for this site, given this site's "track this site" setting. */
export function describeCentral(propertyValue: string | undefined, thisSiteUrl: string, trackSetting: boolean): ICentralDescription {
  if (!propertyValue || !propertyValue.trim()) {
    return { state: 'not-set' };
  }
  const parsed: { centralSiteUrl: string; trackCentralSite: boolean } | undefined = parseCentralProperty(propertyValue);
  if (!parsed) {
    return { state: 'unreadable' };
  }
  const result: ICentralDescription = { state: 'other-site', centralSiteUrl: parsed.centralSiteUrl, trackCentralSite: parsed.trackCentralSite };
  if (trim(parsed.centralSiteUrl) === trim(thisSiteUrl)) {
    result.state = parsed.trackCentralSite === trackSetting ? 'this-site' : 'this-site-out-of-date';
  }
  return result;
}

/** The property value that makes a site central. */
export function centralPropertyValue(siteUrl: string, trackCentralSite: boolean): string {
  return JSON.stringify({ centralSiteUrl: siteUrl.replace(/\/+$/, ''), trackCentralSite });
}

export type CatalogAccess =
  /** Can manage the app catalog and add custom scripts there: setting the property should work. */
  'ok' |
  /** Can manage the app catalog, but custom scripts are blocked there, so SharePoint refuses the property. */
  'scripts-blocked' |
  /** Not an admin of the app catalog. */
  'no-access';

/** PermissionKind.ManageWeb (31) and AddAndCustomizePages (19), as bits of EffectiveBasePermissions.Low. */
const MANAGE_WEB: number = 0x40000000;
const ADD_AND_CUSTOMIZE_PAGES: number = 0x40000;

/**
 * Reads the app catalog's EffectiveBasePermissions. SharePoint removes
 * AddAndCustomizePages from everyone, admins included, on a site that blocks
 * custom scripts, and the property can't be set there.
 */
export function catalogAccess(permissions: { Low?: string | number } | undefined): CatalogAccess {
  const low: number = permissions ? Number(permissions.Low) : NaN;
  if (isNaN(low) || (low & MANAGE_WEB) === 0) {
    return 'no-access';
  }
  return (low & ADD_AND_CUSTOMIZE_PAGES) === 0 ? 'scripts-blocked' : 'ok';
}
