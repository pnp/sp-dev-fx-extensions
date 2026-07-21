import type { IHeaderStrings } from '../models/IHeaderStrings';

export const DEFAULT_HEADER_STRINGS: IHeaderStrings = {
  Title: 'Global Header',
  NavigationLabel: 'Global navigation',
  OverviewLabel: 'Overview',
  CurrentPageLabel: 'Current page',
  CurrentSectionLabel: 'Current section',
  SectionCountSingleLabel: '{0} section',
  SectionCountLabel: '{0} sections',
  ChromeFallbackLabel: 'English labels',
  OpenMenuLabel: 'Open navigation menu',
  CloseMenuLabel: 'Close navigation menu',
  LoadingLabel: 'Loading navigation',
  HomeAriaLabel: 'Go to the home page',
  BackButtonLabel: 'Back',
  ViewAllLabel: 'View all',
  FeaturedLabel: 'Featured',
  SkipToNavigationLabel: 'Skip to navigation',
  SubmenuAriaLabel: 'Open {0} submenu',
  MobileBreadcrumbsAriaLabel: 'Mobile navigation breadcrumbs',
  SkipNavigationTargetAriaLabel: 'Navigation',
  NavigationUnavailableLabel: 'Navigation unavailable',
  EmptySectionLabel: 'No items in this section',
  ViewAllForLabel: 'View all {0}',
  RecentSearchesLabel: 'Recent searches',
  BookmarksEmptyLabel: 'No bookmarks yet',
  MyProfileLabel: 'My profile',
  SignOutLabel: 'Sign out',
  BreadcrumbsAriaLabel: 'Breadcrumbs'
};

export function getSafeStrings(strs: Partial<IHeaderStrings> | undefined): IHeaderStrings {
  return {
    ...DEFAULT_HEADER_STRINGS,
    ...(strs || {})
  };
}