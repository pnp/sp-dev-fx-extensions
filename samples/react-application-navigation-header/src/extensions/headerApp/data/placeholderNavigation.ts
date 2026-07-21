import type { INavigationItem } from '../models/INavigationItem';

export const PLACEHOLDER_NAVIGATION_ITEMS: INavigationItem[] = [
  {
    id: 'placeholder-home',
    label: 'Home',
    url: '/',
    description: 'Placeholder navigation item. Edit or delete this in the Navigation tab.',
    group: 'Explore',
    order: 10,
    featured: false,
    overviewTitle: 'Home',
    overviewDescription: 'Add your own navigation items here.',
    children: []
  }
];