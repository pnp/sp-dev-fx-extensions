import type { INavigationItem } from '../models/INavigationItem';

export function removeFromTree(items: INavigationItem[], itemId: string): INavigationItem[] {
  return items
    .filter((item) => item.id !== itemId)
    .map((item) => {
      const cleanChildren = removeFromTree(item.children, itemId);
      return {
        ...item,
        children: cleanChildren,
        hasChildren: cleanChildren.length > 0
      };
    });
}

export function addChildToTree(items: INavigationItem[], parentId: string, child: INavigationItem): INavigationItem[] {
  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...item.children, child], hasChildren: true };
    }
    return { ...item, children: addChildToTree(item.children, parentId, child) };
  });
}

export function updateInTree(items: INavigationItem[], itemId: string, updated: INavigationItem): INavigationItem[] {
  return items.map((item) => {
    if (item.id === itemId) {
      return { ...updated, children: item.children };
    }
    return { ...item, children: updateInTree(item.children, itemId, updated) };
  });
}

export function moveItem(items: INavigationItem[], itemId: string, direction: number): INavigationItem[] {
  const index = items.findIndex((item) => item.id === itemId);
  if (index < 0) {
    return items;
  }
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= items.length) {
    return items;
  }
  const result = [...items];
  const [moved] = result.splice(index, 1);
  result.splice(newIndex, 0, moved);
  return result;
}

export function isExternalUrl(url: string): boolean {
  try {
    return new URL(url, window.location.origin).origin !== window.location.origin;
  } catch {
    return false;
  }
}

export function generateNavId(): string {
  return `nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function findItemById(items: INavigationItem[], id: string): INavigationItem | undefined {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    const found = findItemById(item.children, id);
    if (found) {
      return found;
    }
  }
  return undefined;
}

export function getSubtreeHeight(item: INavigationItem): number {
  if (!item.children || item.children.length === 0) {
    return 0;
  }
  return 1 + Math.max(...item.children.map(getSubtreeHeight));
}

export function findParentId(items: INavigationItem[], targetId: string, parentId: string | null = null): string | null {
  for (const item of items) {
    if (item.id === targetId) {
      return parentId;
    }
    const found = findParentId(item.children, targetId, item.id);
    if (found) {
      return found;
    }
  }
  return null;
}

export function checkIsDescendant(item: INavigationItem, targetId: string): boolean {
  if (!item.children) {
    return false;
  }
  for (const child of item.children) {
    if (child.id === targetId) {
      return true;
    }
    if (checkIsDescendant(child, targetId)) {
      return true;
    }
  }
  return false;
}

export function getItemDepth(items: INavigationItem[], targetId: string, currentDepth: number = 0): number {
  for (const item of items) {
    if (item.id === targetId) {
      return currentDepth;
    }
    const found = getItemDepth(item.children, targetId, currentDepth + 1);
    if (found >= 0) {
      return found;
    }
  }
  return -1;
}

export function moveItemInTree(
  tree: INavigationItem[],
  dragId: string,
  targetId: string,
  placement: 'before' | 'inside' | 'after'
): INavigationItem[] {
  const draggedItem = findItemById(tree, dragId);
  if (!draggedItem) {
    return tree;
  }
  const itemToMove = draggedItem;

  const cleanTree = removeFromTree(tree, dragId);

  function insertItem(items: INavigationItem[]): INavigationItem[] {
    const targetIndex = items.findIndex((item) => item.id === targetId);

    if (targetIndex >= 0) {
      const result = [...items];
      if (placement === 'before') {
        result.splice(targetIndex, 0, itemToMove);
      } else if (placement === 'after') {
        result.splice(targetIndex + 1, 0, itemToMove);
      } else if (placement === 'inside') {
        const targetNode = result[targetIndex];
        result[targetIndex] = {
          ...targetNode,
          children: [...targetNode.children, itemToMove],
          hasChildren: true
        };
      }
      return result;
    }

    return items.map((item) => ({
      ...item,
      children: insertItem(item.children)
    }));
  }

  return insertItem(cleanTree);
}

export function validateMove(
  tree: INavigationItem[],
  dragId: string,
  targetId: string,
  placement: 'before' | 'inside' | 'after'
): boolean {
  if (dragId === targetId) {
    return false;
  }

  const draggedItem = findItemById(tree, dragId);
  if (!draggedItem) {
    return false;
  }

  if (checkIsDescendant(draggedItem, targetId)) {
    return false;
  }

  const height = getSubtreeHeight(draggedItem);
  const targetDepth = getItemDepth(tree, targetId);
  if (targetDepth < 0) {
    return false;
  }

  if (placement === 'inside') {
    return targetDepth + 1 + height <= 3;
  } else {
    return targetDepth + height <= 3;
  }
}