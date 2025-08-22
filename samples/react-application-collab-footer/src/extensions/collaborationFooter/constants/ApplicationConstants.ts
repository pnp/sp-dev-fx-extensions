/**
 * Application-wide constants for the Collaboration Footer
 */

export const CACHE_CONSTANTS = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 100,
  CLEANUP_INTERVAL: 10 * 60 * 1000, // 10 minutes
} as const;

export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

export const LINK_CONSTANTS = {
  DEFAULT_ICON: 'Link',
  DEFAULT_CATEGORY: 'General',
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

export const VALIDATION_CONSTANTS = {
  MIN_SEARCH_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 200,
} as const;

export const UI_CONSTANTS = {
  MAX_VISIBLE_ITEMS: 10,
  BANNER_SIZES: ['small', 'medium', 'large'] as const,
  DEFAULT_BANNER_SIZE: 'medium',
} as const;

export const ANALYTICS_CONSTANTS = {
  POPULAR_THRESHOLD: 50,
  DEFAULT_TOP_LINKS_COUNT: 10,
  DEFAULT_TOP_USERS_COUNT: 10,
} as const;