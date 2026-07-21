import type { INavigationItem } from '../models/INavigationItem';
import {
  findItemById,
  removeFromTree,
  getSubtreeHeight,
  findParentId,
  checkIsDescendant,
  getItemDepth,
  moveItemInTree
} from './tree';

describe('Tree utilities', () => {
  const sampleTree: INavigationItem[] = [
    {
      id: 'root-1',
      label: 'Root 1',
      url: '/root-1',
      children: [
        {
          id: 'child-1-1',
          label: 'Child 1-1',
          url: '/child-1-1',
          children: [
            {
              id: 'sub-child-1-1-1',
              label: 'Sub Child 1-1-1',
              url: '/sub-child-1-1-1',
              children: [],
              hasChildren: false,
              order: 10,
              featured: false,
              group: 'Explore'
            }
          ],
          hasChildren: true,
          order: 10,
          featured: false,
          group: 'Explore'
        }
      ],
      hasChildren: true,
      order: 10,
      featured: false,
      group: 'Explore'
    },
    {
      id: 'root-2',
      label: 'Root 2',
      url: '/root-2',
      children: [],
      hasChildren: false,
      order: 20,
      featured: false,
      group: 'Explore'
    }
  ];

  it('should find item by id', () => {
    const item = findItemById(sampleTree, 'sub-child-1-1-1');
    expect(item).toBeDefined();
    expect(item?.label).toBe('Sub Child 1-1-1');
  });

  it('should get subtree height', () => {
    const root1 = findItemById(sampleTree, 'root-1')!;
    expect(getSubtreeHeight(root1)).toBe(2);

    const root2 = findItemById(sampleTree, 'root-2')!;
    expect(getSubtreeHeight(root2)).toBe(0);
  });

  it('should find parent id', () => {
    expect(findParentId(sampleTree, 'sub-child-1-1-1')).toBe('child-1-1');
    expect(findParentId(sampleTree, 'child-1-1')).toBe('root-1');
    expect(findParentId(sampleTree, 'root-1')).toBeNull();
  });

  it('should check is descendant', () => {
    const root1 = findItemById(sampleTree, 'root-1')!;
    expect(checkIsDescendant(root1, 'sub-child-1-1-1')).toBe(true);
    expect(checkIsDescendant(root1, 'root-2')).toBe(false);
  });

  it('should get item depth', () => {
    expect(getItemDepth(sampleTree, 'root-1')).toBe(0);
    expect(getItemDepth(sampleTree, 'child-1-1')).toBe(1);
    expect(getItemDepth(sampleTree, 'sub-child-1-1-1')).toBe(2);
  });

  it('should move item before', () => {
    const nextTree = moveItemInTree(sampleTree, 'root-2', 'root-1', 'before');
    expect(nextTree[0].id).toBe('root-2');
    expect(nextTree[1].id).toBe('root-1');
  });

  it('should move item inside', () => {
    const nextTree = moveItemInTree(sampleTree, 'root-2', 'child-1-1', 'inside');
    const child11 = findItemById(nextTree, 'child-1-1')!;
    expect(child11.children.some(c => c.id === 'root-2')).toBe(true);
  });

  it('should remove item from tree', () => {
    const nextTree = removeFromTree(sampleTree, 'child-1-1');
    const root1 = findItemById(nextTree, 'root-1')!;
    expect(root1.children.length).toBe(0);
    expect(root1.hasChildren).toBe(false);
  });
});
