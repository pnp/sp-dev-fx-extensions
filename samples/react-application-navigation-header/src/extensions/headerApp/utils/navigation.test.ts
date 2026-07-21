import { findActivePath } from './navigation';
import type { INavigationItem } from '../models/INavigationItem';

const sampleItems: INavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    url: 'https://localhost/',
    children: [
      {
        id: 'about',
        label: 'About',
        url: 'https://localhost/about',
        children: [
          {
            id: 'team',
            label: 'Team',
            url: 'https://localhost/about/team',
            children: []
          }
        ]
      },
      {
        id: 'news',
        label: 'News',
        url: 'https://localhost/news',
        matchUrls: ['https://localhost/news/press'],
        children: []
      }
    ]
  }
];

describe('findActivePath', () => {
  it('returns full path for nested active item', () => {
    const path = findActivePath(sampleItems, 'https://localhost/about/team');
    expect(path).toEqual(['home', 'about', 'team']);
  });

  it('returns single-item path for top-level active item', () => {
    const path = findActivePath(sampleItems, 'https://localhost/about');
    expect(path).toEqual(['home', 'about']);
  });

  it('returns empty array for no match', () => {
    const path = findActivePath(sampleItems, 'https://localhost/nonexistent');
    expect(path).toEqual([]);
  });

  it('handles empty items', () => {
    expect(findActivePath([], 'https://localhost/')).toEqual([]);
  });
});