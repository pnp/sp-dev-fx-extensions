import type { INavigationItem } from '../models/INavigationItem';

export interface IGroupedNavigationSection {
  key: string;
  title: string;
  items: INavigationItem[];
}

export interface IActivePathContext {
  currentPageUrl: string;
  isTeamsContext: boolean;
}

export function groupNavigationItems(
  items: INavigationItem[],
  groupOrder?: string[]
): IGroupedNavigationSection[] {
  const groupedSections: Map<string, INavigationItem[]> = new Map<string, INavigationItem[]>();

  items.forEach((item: INavigationItem) => {
    const groupKey: string = item.group ?? 'Explore';
    const currentItems: INavigationItem[] = groupedSections.get(groupKey) ?? [];
    currentItems.push(item);
    groupedSections.set(groupKey, currentItems);
  });

  const explicitOrder: Map<string, number> = new Map<string, number>(
    (groupOrder ?? []).map((groupKey: string, index: number) => [groupKey, index])
  );

  return Array.from(groupedSections.entries())
    .map(([key, sectionItems]: [string, INavigationItem[]]) => ({
      key,
      title: key,
      items: sortNavigationItems(sectionItems)
    }))
    .sort((left: IGroupedNavigationSection, right: IGroupedNavigationSection) => {
      const leftExplicit: number = explicitOrder.get(left.key) ?? Number.MAX_SAFE_INTEGER;
      const rightExplicit: number = explicitOrder.get(right.key) ?? Number.MAX_SAFE_INTEGER;

      if (leftExplicit !== rightExplicit) {
        return leftExplicit - rightExplicit;
      }

      const leftOrder: number = left.items[0]?.order ?? Number.MAX_SAFE_INTEGER;
      const rightOrder: number = right.items[0]?.order ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.title.localeCompare(right.title);
    });
}

export function getFeaturedNavigationItem(items: INavigationItem[]): INavigationItem | undefined {
  const explicitlyFeaturedItems = items.filter((item) => item.featured);

  if (explicitlyFeaturedItems.length > 0) {
    return [...explicitlyFeaturedItems].sort((left, right) => {
      const leftRank: number = left.featuredRank ?? Number.MAX_SAFE_INTEGER;
      const rightRank: number = right.featuredRank ?? Number.MAX_SAFE_INTEGER;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER);
    })[0];
  }

  return sortNavigationItems(items).find((item: INavigationItem) => !!item.description);
}

export function resolveNavigationTrail(items: INavigationItem[], trailIds: string[]): INavigationItem[] {
  const trail: INavigationItem[] = [];
  let currentItems: INavigationItem[] = items;

  trailIds.forEach((trailId: string) => {
    const nextItem: INavigationItem | undefined = currentItems.find((item: INavigationItem) => item.id === trailId);

    if (!nextItem) {
      return;
    }

    trail.push(nextItem);
    currentItems = nextItem.children;
  });

  return trail;
}

export function itemHasChildren(item: INavigationItem): boolean {
  return item.hasChildren ?? item.children.length > 0;
}

export function findActivePath(items: INavigationItem[], currentLocation: string): string[] {
  const index = buildUrlPathIndex(items);
  const match = index.get(normalizeHref(currentLocation));
  return match ?? [];
}

function buildUrlPathIndex(items: INavigationItem[]): Map<string, string[]> {
  const index: Map<string, string[]> = new Map<string, string[]>();

  const visit = (item: INavigationItem, trail: string[]): void => {
    const currentTrail = [...trail, item.id];

    if (item.url) {
      const normalized = normalizeHref(item.url);
      if (!index.has(normalized)) {
        index.set(normalized, currentTrail);
      }
    }

    if (item.matchUrls) {
      for (const candidateUrl of item.matchUrls) {
        const normalized = normalizeHref(candidateUrl);
        if (!index.has(normalized)) {
          index.set(normalized, currentTrail);
        }
      }
    }

    for (const child of item.children) {
      visit(child, currentTrail);
    }
  };

  for (const item of items) {
    visit(item, []);
  }

  return index;
}

function normalizeHref(href: string): string {
  return href.replace(/\/+$/, '');
}

export function sortNavigationItems(items: INavigationItem[]): INavigationItem[] {
  return [...items].sort((left: INavigationItem, right: INavigationItem) => {
    const leftOrder: number = left.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder: number = right.order ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.label.localeCompare(right.label);
  });
}

export function classNames(...values: Array<string | undefined | false>): string {
  return values.filter((value: string | undefined | false): value is string => !!value).join(' ');
}

export function isConstrainedPresentationHost(context?: IActivePathContext): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  if (context?.isTeamsContext) {
    return true;
  }

  const userAgent: string = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('teams') >= 0 || userAgent.indexOf('viva') >= 0) {
    return true;
  }

  const hostClientType: string = (new URLSearchParams(window.location.search).get('hostClientType') ?? '').toLowerCase();
  return hostClientType.indexOf('teams') >= 0 || hostClientType.indexOf('viva') >= 0;
}

export function formatStringTemplate(template: string | undefined, placeholder: string): string {
  if (!template) {
    return placeholder;
  }

  return template.replace('{0}', placeholder);
}
