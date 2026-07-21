import * as React from 'react';
import { Button, SearchBox } from '@fluentui/react-components';
import {
  ChevronDown12Regular,
  ChevronRight12Regular,
  ArrowUp20Regular,
  ArrowDown20Regular,
  Add20Regular,
  Edit20Regular,
  Delete20Regular,
  Star20Filled,
  ArrowDownload20Regular,
  ArrowUpload20Regular
} from '@fluentui/react-icons';

import type { INavigationItem } from '../models/INavigationItem';
import type { ISettingsEditorStrings } from './SettingsEditorDialog.types';
import { classNames } from '../utils/navigation';
import { sanitizeUrl } from '../utils/url';
import {
  removeFromTree,
  addChildToTree,
  updateInTree,
  moveItem,
  isExternalUrl,
  generateNavId,
  moveItemInTree,
  validateMove
} from '../utils/tree';
import { DynamicIcon } from './DynamicIcon';
import { NavigationItemDialog } from './NavigationItemDialog';
import styles from './SettingsEditorDialog.module.scss';

export interface INavigationTreeEditorProps {
  items: INavigationItem[];
  onChange: (items: INavigationItem[]) => void;
  strings: ISettingsEditorStrings;
}

export const NavigationTreeEditor: React.FC<INavigationTreeEditorProps> = ({ items, onChange, strings }) => {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set<string>());
  const [editingItem, setEditingItem] = React.useState<{
    item: Partial<INavigationItem>;
    parentId: string | null;
    isEditing: boolean;
    originalId?: string;
  } | undefined>(undefined);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const [dragPlacement, setDragPlacement] = React.useState<'before' | 'inside' | 'after' | null>(null);
  const [isDragValid, setIsDragValid] = React.useState<boolean>(false);
  const [isImportPending, startImportTransition] = React.useTransition();
  const [importStatus, setImportStatus] = React.useState<{ kind: 'success' | 'error'; message: string } | undefined>(undefined);
  const navFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleAddRoot = React.useCallback((): void => {
    setEditingItem({
      item: { id: generateNavId(), label: '', url: '', group: 'Explore', order: 100, children: [] },
      parentId: null,
      isEditing: false
    });
  }, []);

  const handleAddChild = React.useCallback((parentId: string): void => {
    setExpandedIds((prev) => new Set<string>(Array.from(prev).concat([parentId])));
    setEditingItem({
      item: { id: generateNavId(), label: '', url: '', group: 'Explore', order: 100, children: [] },
      parentId,
      isEditing: false
    });
  }, []);

  const handleEdit = React.useCallback((item: INavigationItem): void => {
    setEditingItem({ item: { ...item }, parentId: null, isEditing: true, originalId: item.id });
  }, []);

  const handleDelete = React.useCallback((itemId: string): void => {
    if (typeof window !== 'undefined' && !window.confirm(strings.navDeleteConfirm)) {
      return;
    }
    onChange(removeFromTree(items, itemId));
  }, [items, onChange, strings.navDeleteConfirm]);

  const handleMoveUp = React.useCallback((itemId: string): void => {
    onChange(moveItem(items, itemId, -1));
  }, [items, onChange]);

  const handleMoveDown = React.useCallback((itemId: string): void => {
    onChange(moveItem(items, itemId, 1));
  }, [items, onChange]);

  const handleToggleExpand = React.useCallback((itemId: string): void => {
    setExpandedIds((current) => {
      const next = new Set<string>(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const handleDialogSave = React.useCallback((finalItem: INavigationItem): void => {
    if (!editingItem) {
      return;
    }

    if (editingItem.isEditing && editingItem.originalId) {
      const originalId: string = editingItem.originalId;
      onChange(updateInTree(items, originalId, finalItem));
    } else if (editingItem.parentId === null) {
      onChange([...items, finalItem]);
    } else {
      const parentId: string = editingItem.parentId;
      onChange(addChildToTree(items, parentId, finalItem));
    }
    setEditingItem(undefined);
  }, [editingItem, items, onChange]);

  const handleDragStart = React.useCallback((event: React.DragEvent, id: string): void => {
    setDraggedId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDragOver = React.useCallback((event: React.DragEvent, id: string): void => {
    if (!draggedId || draggedId === id) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    const thresholdBefore = rect.height * 0.25;
    const thresholdAfter = rect.height * 0.75;

    let placement: 'before' | 'inside' | 'after' = 'inside';
    if (relativeY < thresholdBefore) {
      placement = 'before';
    } else if (relativeY > thresholdAfter) {
      placement = 'after';
    }

    setDragOverId(id);
    setDragPlacement(placement);
    setIsDragValid(validateMove(items, draggedId, id, placement));
  }, [draggedId, items]);

  const handleDragLeave = React.useCallback((): void => {
    setDragOverId(null);
    setDragPlacement(null);
    setIsDragValid(false);
  }, []);

  const handleDragEnd = React.useCallback((): void => {
    setDraggedId(null);
    setDragOverId(null);
    setDragPlacement(null);
    setIsDragValid(false);
  }, []);

  const handleDrop = React.useCallback((event: React.DragEvent, id: string): void => {
    event.preventDefault();
    event.stopPropagation();

    if (!draggedId || !id || !dragPlacement || !isDragValid) {
      handleDragEnd();
      return;
    }

    startImportTransition(() => {
      const updated = moveItemInTree(items, draggedId, id, dragPlacement);
      onChange(updated);
    });
    handleDragEnd();
  }, [draggedId, dragPlacement, isDragValid, items, onChange, handleDragEnd]);

  const filterItems = React.useCallback((treeItems: INavigationItem[], query: string): INavigationItem[] => {
    if (!query) {
      return treeItems;
    }
    const lower = query.toLowerCase();
    return treeItems
      .filter((item) =>
        item.label.toLowerCase().indexOf(lower) >= 0 ||
        (item.url || '').toLowerCase().indexOf(lower) >= 0 ||
        (item.group || '').toLowerCase().indexOf(lower) >= 0
      )
      .map((item) => ({
        ...item,
        children: filterItems(item.children, query)
      }))
      .filter((item) => item.label.toLowerCase().indexOf(lower) >= 0 || item.children.length > 0);
  }, []);

  const filteredItems = React.useMemo(() => filterItems(items, deferredSearchQuery), [items, deferredSearchQuery, filterItems]);

  const handleExportNav = React.useCallback((): void => {
    try {
      const exportPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        items: items.map(function deepClone(item: INavigationItem): INavigationItem {
          return {
            ...item,
            matchUrls: item.matchUrls ? [...item.matchUrls] : undefined,
            groupOrder: item.groupOrder ? [...item.groupOrder] : undefined,
            children: (item.children ?? []).map(deepClone)
          };
        })
      };
      const dataStr = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `navigation-tree-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch { void 0; }
  }, [items]);

  const handleImportNavClick = React.useCallback((): void => {
    if (navFileInputRef.current) {
      navFileInputRef.current.value = '';
      navFileInputRef.current.click();
    }
  }, []);

  const handleImportNavFileChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e): void => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        let importedItems: unknown[];

        if (Array.isArray(parsed)) {
          importedItems = parsed;
        } else if (parsed && Array.isArray(parsed.items)) {
          importedItems = parsed.items;
        } else if (parsed && Array.isArray(parsed.navigation)) {
          importedItems = parsed.navigation;
        } else {
          throw new Error('Invalid format');
        }

        if (typeof window !== 'undefined' && !window.confirm(strings.navImportConfirm ?? 'Importing will replace the current navigation tree. Continue?')) {
          return;
        }

        const normalize = (raw: unknown): INavigationItem => {
          if (!raw || typeof raw !== 'object') {
            throw new Error('Invalid navigation item');
          }
          const r = raw as Record<string, unknown>;
          const url = sanitizeUrl(typeof r.url === 'string' ? r.url : undefined);
          const children = Array.isArray(r.children) ? r.children.map(normalize) : [];
          return {
            id: typeof r.id === 'string' && r.id ? r.id : generateNavId(),
            label: typeof r.label === 'string' ? r.label : 'Unnamed',
            url,
            description: typeof r.description === 'string' ? r.description : '',
            group: typeof r.group === 'string' ? r.group : 'Explore',
            groupOrder: Array.isArray(r.groupOrder) ? r.groupOrder.filter((g): g is string => typeof g === 'string') : undefined,
            order: typeof r.order === 'number' && !Number.isNaN(r.order) ? r.order : 999999,
            featured: !!r.featured,
            featuredRank: typeof r.featuredRank === 'number' && !Number.isNaN(r.featuredRank) ? r.featuredRank : 999999,
            overviewTitle: typeof r.overviewTitle === 'string' ? r.overviewTitle : '',
            overviewDescription: typeof r.overviewDescription === 'string' ? r.overviewDescription : '',
            matchUrls: Array.isArray(r.matchUrls) ? r.matchUrls.filter((u): u is string => typeof u === 'string') : undefined,
            isExternal: url ? isExternalUrl(url) : false,
            hasChildren: children.length > 0,
            children,
            iconName: typeof r.iconName === 'string' ? r.iconName : undefined
          };
        };

        const normalized = importedItems.map(normalize);

        onChange(normalized);
        setImportStatus({ kind: 'success', message: strings.navImportSuccess ?? 'Navigation imported successfully.' });
      } catch {
        setImportStatus({ kind: 'error', message: strings.navImportError ?? 'Import failed: invalid navigation JSON file.' });
      }
    };
    reader.onerror = (): void => {
      setImportStatus({ kind: 'error', message: strings.navImportError ?? 'Import failed: invalid navigation JSON file.' });
    };
    reader.readAsText(file);
  }, [onChange, strings.navImportConfirm, strings.navImportError, strings.navImportSuccess]);

  React.useEffect(() => {
    if (!importStatus) {
      return;
    }
    const timer = window.setTimeout((): void => setImportStatus(undefined), 4000);
    return (): void => window.clearTimeout(timer);
  }, [importStatus]);

  const renderTree = (treeItems: INavigationItem[], depth: number): React.ReactNode => {
    if (treeItems.length === 0) {
      return depth === 0 ? (
        <div className={styles.navEmpty}>
          <div className={styles.navEmptyIcon}>
            <DynamicIcon iconName="BulletedTreeList" />
          </div>
          <span className={styles.navEmptyText}>{strings.navEmpty}</span>
          <span className={styles.navEmptyHint}>{strings.navAddRoot}</span>
        </div>
      ) : null;
    }

    return (
      <ul className={depth === 0 ? styles.navRoot : styles.navChildren}>
        {treeItems.map((item, index) => {
          const isExpanded = expandedIds.has(item.id) || !!searchQuery;
          const hasChildren = item.children.length > 0;
          return (
            <li className={styles.navNode} key={item.id}>
              <div
                className={classNames(
                  styles.navNodeRow,
                  draggedId === item.id ? styles.navNodeRowDragging : undefined,
                  dragOverId === item.id ? (
                    isDragValid ? (
                      dragPlacement === 'before' ? styles.dragOverBefore :
                      dragPlacement === 'after' ? styles.dragOverAfter :
                      styles.dragOverInside
                    ) : styles.dragDisabled
                  ) : undefined
                )}
                draggable={true}
                onDragStart={(e): void => handleDragStart(e, item.id)}
                onDragOver={(e): void => handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
                onDrop={(e): void => handleDrop(e, item.id)}
              >
                <button
                  className={styles.navExpandButton}
                  disabled={!hasChildren}
                  onClick={(): void => handleToggleExpand(item.id)}
                  type="button"
                  aria-label={isExpanded ? strings.navCollapse : strings.navExpand}
                >
                  {hasChildren ? (
                    isExpanded ? <ChevronDown12Regular /> : <ChevronRight12Regular />
                  ) : null}
                </button>

                <div className={styles.navNodeIcon}>
                  <DynamicIcon iconName={item.iconName || 'Page'} />
                </div>

                <span className={styles.navNodeLabel}>{item.label}</span>

                <div className={styles.navNodeMeta}>
                  {item.url ? <span className={styles.navNodeUrl}>{item.url}</span> : null}
                  {item.isExternal ? <span className={styles.navNodeBadge}>{strings.navExternal}</span> : null}
                  {item.featured ? (
                    <span className={`${styles.navNodeBadge} ${styles.navNodeBadgeFeatured}`} aria-label={strings.navFeaturedBadge}>
                      <Star20Filled style={{ fontSize: 12 }} />
                    </span>
                  ) : null}
                  {item.group && item.group !== 'Explore' ? (
                    <span className={`${styles.navNodeBadge} ${styles.navNodeBadgeGroup}`}>{item.group}</span>
                  ) : null}
                </div>

                <div className={styles.navNodeActions}>
                  <Button
                    aria-label={strings.navMoveUp}
                    disabled={index === 0}
                    icon={<ArrowUp20Regular />}
                    onClick={(): void => handleMoveUp(item.id)}
                    appearance="subtle"
                    title={strings.navMoveUp}
                    size="small"
                    style={{ width: 28, height: 28, minWidth: 28, padding: 0 }}
                  />
                  <Button
                    aria-label={strings.navMoveDown}
                    disabled={index === treeItems.length - 1}
                    icon={<ArrowDown20Regular />}
                    onClick={(): void => handleMoveDown(item.id)}
                    appearance="subtle"
                    title={strings.navMoveDown}
                    size="small"
                    style={{ width: 28, height: 28, minWidth: 28, padding: 0 }}
                  />
                  {depth < 3 ? (
                    <Button
                      aria-label={strings.navAddChild}
                      icon={<Add20Regular />}
                      onClick={(): void => handleAddChild(item.id)}
                      appearance="subtle"
                      title={strings.navAddChild}
                      size="small"
                      style={{ width: 28, height: 28, minWidth: 28, padding: 0 }}
                    />
                  ) : null}
                  <Button
                    aria-label={strings.navEdit}
                    icon={<Edit20Regular />}
                    onClick={(): void => handleEdit(item)}
                    appearance="subtle"
                    title={strings.navEdit}
                    size="small"
                    style={{ width: 28, height: 28, minWidth: 28, padding: 0 }}
                  />
                  <Button
                    aria-label={strings.navDelete}
                    icon={<Delete20Regular />}
                    onClick={(): void => handleDelete(item.id)}
                    appearance="subtle"
                    title={strings.navDelete}
                    size="small"
                    style={{ width: 28, height: 28, minWidth: 28, padding: 0 }}
                  />
                </div>
              </div>
              {hasChildren && isExpanded ? renderTree(item.children, depth + 1) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <div className={styles.navAddButton}>
        <Button icon={<Add20Regular />} onClick={handleAddRoot} appearance="primary">
          {strings.navAddRoot}
        </Button>
        <SearchBox
          className={styles.navSearchBox}
          onChange={(e, data): void => setSearchQuery(data.value || '')}
          placeholder={strings.navSearchPlaceholder}
          value={searchQuery}
        />
      </div>

      <div className={styles.navImportExportBar}>
        <Button
          icon={<ArrowDownload20Regular />}
          onClick={handleExportNav}
          appearance="secondary"
          size="small"
          disabled={items.length === 0}
          title={strings.navExportJson}
        >
          {strings.navExportJson}
        </Button>
        <Button
          icon={<ArrowUpload20Regular />}
          onClick={handleImportNavClick}
          appearance="secondary"
          size="small"
          disabled={isImportPending}
          title={strings.navImportJson}
        >
          {isImportPending ? '...' : strings.navImportJson}
        </Button>
        <input
          ref={navFileInputRef}
          accept="application/json,.json"
          onChange={handleImportNavFileChange}
          style={{ display: 'none' }}
          type="file"
        />
        {importStatus ? (
          <span
            className={styles.navImportStatus}
            style={{
              color: importStatus.kind === 'success' ? '#107c41' : '#d13438',
              fontSize: '12px',
              lineHeight: '20px',
              flex: 1
            }}
          >
            {importStatus.message}
          </span>
        ) : null}
      </div>

      <div className={styles.navTreeContainer}>
        <div className={styles.navTreeHeader}>
          <span className={styles.navTreeTitle}>{strings.navTreeTitle}</span>
          <span className={styles.navTreeCount}>{items.length} {strings.navTreeCount}</span>
        </div>
        <div className={styles.navTreeBody}>
          {renderTree(filteredItems, 0)}
        </div>
      </div>

      {editingItem ? (
        <NavigationItemDialog
          item={editingItem}
          strings={strings}
          onDismiss={(): void => setEditingItem(undefined)}
          onSave={handleDialogSave}
        />
      ) : null}
    </>
  );
};

export default NavigationTreeEditor;
