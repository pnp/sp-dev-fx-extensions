import * as React from 'react';
import {
  Button,
  Input,
  Textarea,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Field,
  Switch,
  SearchBox
} from '@fluentui/react-components';

import type { INavigationItem } from '../models/INavigationItem';
import type { ISettingsEditorStrings } from './SettingsEditorDialog.types';
import { sanitizeUrl } from '../utils/url';
import { isExternalUrl, generateNavId } from '../utils/tree';
import { DynamicIcon } from './DynamicIcon';
import styles from './SettingsEditorDialog.module.scss';

export const AVAILABLE_ICONS = [
  { value: 'Home', label: 'Home' },
  { value: 'Page', label: 'Page / Document' },
  { value: 'Search', label: 'Search' },
  { value: 'History', label: 'History / Clock' },
  { value: 'Contact', label: 'Contact / Person' },
  { value: 'Ringer', label: 'Alert / Bell' },
  { value: 'AppIconDefault', label: 'App / Waffle Grid' },
  { value: 'LightningBolt', label: 'Flash / Lightning' },
  { value: 'LocaleLanguage', label: 'Language Globe' },
  { value: 'Bookmark', label: 'Bookmark / Star' },
  { value: 'Settings', label: 'Settings Gear' },
  { value: 'Help', label: 'Help Question' },
  { value: 'Feedback', label: 'Feedback Emoji' },
  { value: 'Print', label: 'Print / Paper' },
  { value: 'UpArrow', label: 'Arrow Up' },
  { value: 'Accessibility', label: 'Accessibility / User' },
  { value: 'BulletedListBullets', label: 'List' },
  { value: 'Tag', label: 'Tag / Label' },
  { value: 'Chart', label: 'Chart' },
  { value: 'BulletedTreeList', label: 'Tree Diagram' },
  { value: 'Tiles', label: 'Tiles / Grid' },
  { value: 'More', label: 'More Dots' },
  { value: 'Mail', label: 'Mail / Inbox' },
  { value: 'Calendar', label: 'Calendar / Events' },
  { value: 'Message', label: 'Chat / Message' },
  { value: 'Phone', label: 'Phone / Call' },
  { value: 'Video', label: 'Video / Camera' },
  { value: 'FolderHorizontal', label: 'Folder / Site Assets' },
  { value: 'Link', label: 'Link / URL' },
  { value: 'Add', label: 'Add / Plus' },
  { value: 'Delete', label: 'Delete / Trash' },
  { value: 'Edit', label: 'Edit / Pencil' },
  { value: 'Save', label: 'Save / Disk' },
  { value: 'Share', label: 'Share' },
  { value: 'Download', label: 'Download' },
  { value: 'Upload', label: 'Upload' },
  { value: 'Copy', label: 'Copy' },
  { value: 'Lock', label: 'Lock / Secure' },
  { value: 'Unlock', label: 'Unlock' },
  { value: 'Shield', label: 'Shield / Security' },
  { value: 'Warning', label: 'Warning / Caution' },
  { value: 'Info', label: 'Info' },
  { value: 'Completed', label: 'Completed / Check' },
  { value: 'Cancel', label: 'Cancel / Close' },
  { value: 'Heart', label: 'Heart / Like' },
  { value: 'FavoriteStar', label: 'Star / Favorite' },
  { value: 'Cloud', label: 'Cloud' },
  { value: 'Send', label: 'Send / Paperclip' },
  { value: 'People', label: 'People / Users' },
  { value: 'Group', label: 'Group' },
  { value: 'Key', label: 'Key / Access' },
  { value: 'Globe', label: 'Globe / World' },
  { value: 'RedEye', label: 'View / Eye' },
  { value: 'Filter', label: 'Filter' },
  { value: 'Refresh', label: 'Refresh / Sync' },
  { value: 'Play', label: 'Play' },
  { value: 'Pause', label: 'Pause' },
  { value: 'CircleStop', label: 'Stop' },
  { value: 'Volume3', label: 'Volume' },
  { value: 'Microphone', label: 'Microphone' },
  { value: 'MusicInFocus', label: 'Music' },
  { value: 'Camera', label: 'Camera' },
  { value: 'Photo2', label: 'Photo' },
  { value: 'MapPin', label: 'Map Pin / Location' },
  { value: 'Pin', label: 'Pin' },
  { value: 'GiftCard', label: 'Gift' },
  { value: 'ShoppingCart', label: 'Cart' },
  { value: 'Money', label: 'Money / Finance' },
  { value: 'Trophy', label: 'Trophy' },
  { value: 'SpecialEvent', label: 'Sparkles' },
  { value: 'Lightbulb', label: 'Idea / Lightbulb' },
  { value: 'DeveloperTools', label: 'Tools' },
  { value: 'Rocket', label: 'Rocket' },
  { value: 'CompassNW', label: 'Compass' },
  { value: 'FrontCamera', label: 'Camera Alternative' },
  { value: 'Flag', label: 'Flag' },
  { value: 'OfficeBuilding', label: 'Office / Building' },
  { value: 'Work', label: 'Briefcase' },
  { value: 'Education', label: 'Education' },
  { value: 'BookAnswers', label: 'Book' },
  { value: 'News', label: 'News' },
  { value: 'Database', label: 'Database' },
  { value: 'Server', label: 'Server' },
  { value: 'FileCode', label: 'Code' },
  { value: 'ChevronRight', label: 'Chevron Right' },
  { value: 'ChevronLeft', label: 'Chevron Left' },
  { value: 'ChevronUp', label: 'Chevron Up' },
  { value: 'ChevronDown', label: 'Chevron Down' },
  { value: 'Document', label: 'Document' },
  { value: 'ExcelDocument', label: 'Excel' },
  { value: 'WordDocument', label: 'Word' },
  { value: 'PowerPointDocument', label: 'PowerPoint' },
  { value: 'PDF', label: 'PDF' },
  { value: 'OneNoteDocument', label: 'OneNote' },
  { value: 'OutlookLogo', label: 'Outlook' },
  { value: 'TeamsLogo', label: 'Teams' },
  { value: 'SharePointLogo', label: 'SharePoint' }
];

export interface INavigationItemDialogProps {
  item: { item: Partial<INavigationItem>; parentId: string | null; isEditing: boolean; originalId?: string };
  strings: ISettingsEditorStrings;
  onDismiss: () => void;
  onSave: (finalItem: INavigationItem) => void;
}

export const NavigationItemDialog: React.FC<INavigationItemDialogProps> = ({ item, strings, onDismiss, onSave }) => {
  const [draft, setDraft] = React.useState<Partial<INavigationItem>>(item.item);
  const [labelError, setLabelError] = React.useState<string | undefined>(undefined);
  const [urlError, setUrlError] = React.useState<string | undefined>(undefined);
  const [isIconPickerOpen, setIsIconPickerOpen] = React.useState<boolean>(false);
  const [iconSearchQuery, setIconSearchQuery] = React.useState<string>('');

  const iconPickerSearchId = React.useId();

  React.useEffect(() => {
    setDraft(item.item);
  }, [item.item]);

  const update = React.useCallback((patch: Partial<INavigationItem>): void => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSave = React.useCallback((): void => {
    const labelVal = (draft.label || '').trim();
    if (!labelVal) {
      setLabelError(strings.navLabel);
      return;
    }

    const sanitizedUrl = sanitizeUrl(draft.url);
    if (draft.url && !sanitizedUrl) {
      setUrlError(strings.navUrl);
      return;
    }

    const order = typeof draft.order === 'number' && !Number.isNaN(draft.order) ? draft.order : 999;
    const featuredRank =
      typeof draft.featuredRank === 'number' && !Number.isNaN(draft.featuredRank) ? draft.featuredRank : 999;

    const finalItem: INavigationItem = {
      id: draft.id || generateNavId(),
      label: labelVal,
      url: sanitizedUrl,
      description: draft.description || '',
      group: draft.group || 'Explore',
      order,
      featured: !!draft.featured,
      featuredRank,
      overviewTitle: draft.overviewTitle || '',
      overviewDescription: draft.overviewDescription || '',
      matchUrls: draft.matchUrls ? [...draft.matchUrls] : undefined,
      iconName: draft.iconName || undefined,
      children: draft.children ? draft.children.map((c) => ({ ...c })) : [],
      hasChildren: (draft.children && draft.children.length > 0) || false,
      isExternal: sanitizedUrl ? isExternalUrl(sanitizedUrl) : false
    };

    onSave(finalItem);
  }, [draft, strings.navLabel, strings.navUrl, onSave]);

  return (
    <>
      <Dialog open={true} onOpenChange={(e, data): void => { if (!data.open) onDismiss(); }}>
      <DialogSurface style={{ minWidth: '480px', maxWidth: '600px' }}>
        <DialogBody>
          <DialogTitle>{item.isEditing ? strings.navEditItem : strings.navAddItem}</DialogTitle>
          <DialogContent className={styles.itemPanelForm}>
            <div className={styles.itemPanelSection}>
              <h4 className={styles.itemPanelSectionTitle}>{strings.navLabel}</h4>
              <Field
                label={strings.navLabel}
                validationState={labelError ? 'error' : 'none'}
                validationMessage={labelError}
                className={styles.itemPanelField}
              >
                <Input
                  onChange={(e, data): void => {
                    update({ label: data.value || '' });
                    setLabelError(undefined);
                  }}
                  placeholder="e.g. Products, About us, HR Portal"
                  value={draft.label || ''}
                />
              </Field>
              <Field
                label={strings.navUrl}
                validationState={urlError ? 'error' : 'none'}
                validationMessage={urlError}
                className={styles.itemPanelField}
              >
                <Input
                  onChange={(e, data): void => {
                    update({ url: data.value || '' });
                    setUrlError(undefined);
                  }}
                  placeholder="https://contoso.sharepoint.com/sites/products"
                  value={draft.url || ''}
                />
              </Field>
              <Field label={strings.navDescription} className={styles.itemPanelField}>
                <Textarea
                  onChange={(e, data): void => update({ description: data.value || '' })}
                  placeholder="Short description shown in mega-menu"
                  rows={2}
                  value={draft.description || ''}
                />
              </Field>
            </div>

            <div className={styles.itemPanelSection}>
              <h4 className={styles.itemPanelSectionTitle}>{strings.navGroup}</h4>
              <div className={styles.itemPanelRow}>
                <Field label={strings.navGroup} className={styles.itemPanelField}>
                  <Input
                    onChange={(e, data): void => update({ group: data.value || 'Explore' })}
                    placeholder="Explore"
                    value={draft.group || ''}
                  />
                </Field>
                <Field label={strings.navIconName} className={styles.itemPanelField}>
                  <Button
                    icon={<DynamicIcon iconName={draft.iconName || 'Page'} />}
                    onClick={(): void => setIsIconPickerOpen(true)}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    {AVAILABLE_ICONS.find(i => i.value === draft.iconName)?.label || draft.iconName || 'Page'}
                  </Button>
                </Field>
              </div>
              <div className={styles.itemPanelRow}>
                <Field label={strings.navOrder} className={styles.itemPanelField}>
                  <Input
                    onChange={(e, data): void => update({ order: parseInt(data.value || '0', 10) })}
                    type="number"
                    value={String(draft.order ?? 100)}
                  />
                </Field>
                <Field label={strings.navFeaturedRank} className={styles.itemPanelField}>
                  <Input
                    onChange={(e, data): void => update({ featuredRank: parseInt(data.value || '999', 10) })}
                    type="number"
                    value={String(draft.featuredRank ?? 999)}
                  />
                </Field>
              </div>
              <Switch
                checked={!!draft.featured}
                label={strings.navFeatured}
                onChange={(e, data): void => update({ featured: data.checked })}
              />
            </div>

            <div className={styles.itemPanelSection}>
              <h4 className={styles.itemPanelSectionTitle}>{strings.navOverviewTitle}</h4>
              <Field label={strings.navOverviewTitle} className={styles.itemPanelField}>
                <Input
                  onChange={(e, data): void => update({ overviewTitle: data.value || '' })}
                  placeholder="Custom title for the overview card"
                  value={draft.overviewTitle || ''}
                />
              </Field>
              <Field label={strings.navOverviewDescription} className={styles.itemPanelField}>
                <Textarea
                  onChange={(e, data): void => update({ overviewDescription: data.value || '' })}
                  rows={2}
                  value={draft.overviewDescription || ''}
                />
              </Field>
            </div>

            <div className={styles.itemPanelSection}>
              <h4 className={styles.itemPanelSectionTitle}>{strings.navMatchUrls}</h4>
              <Field label={strings.navMatchUrls} className={styles.itemPanelField}>
                <Input
                  onChange={(e, data): void => update({ matchUrls: (data.value || '').split(',').map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Comma-separated URLs that mark this item active"
                  value={(draft.matchUrls || []).join(', ')}
                />
              </Field>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={onDismiss} appearance="secondary">{strings.navCancel}</Button>
            <Button onClick={handleSave} appearance="primary">{item.isEditing ? strings.navSave : strings.navAdd}</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
      {isIconPickerOpen ? (
        <Dialog open={true} onOpenChange={(e, data): void => { if (!data.open) setIsIconPickerOpen(false); }}>
          <DialogSurface style={{ maxWidth: '440px', padding: '16px' }}>
            <DialogBody style={{ gap: '16px' }}>
              <DialogTitle>Select Icon</DialogTitle>
              <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
                <label htmlFor={iconPickerSearchId} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--header-body-text, #243242)' }}>
                  Search icons
                </label>
                <SearchBox
                  id={iconPickerSearchId}
                  placeholder="Search icons..."
                  value={iconSearchQuery}
                  onChange={(e, data): void => setIconSearchQuery(data.value || '')}
                />
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  maxHeight: '280px',
                  overflowY: 'auto',
                  padding: '4px'
                }}>
                  {iconSearchQuery.trim() && !AVAILABLE_ICONS.some(icon => icon.value.toLowerCase() === iconSearchQuery.trim().toLowerCase()) ? (
                    <button
                      key="custom-searched-icon"
                      onClick={(): void => {
                        update({ iconName: iconSearchQuery.trim() });
                        setIsIconPickerOpen(false);
                        setIconSearchQuery('');
                      }}
                      type="button"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '12px 8px',
                        border: '2px dashed var(--header-accent, #0f6cbd)',
                        borderRadius: '6px',
                        background: 'var(--header-accent-subtle, rgba(15, 108, 189, 0.08))',
                        cursor: 'pointer'
                      }}
                    >
                      <DynamicIcon iconName={iconSearchQuery.trim()} />
                      <span style={{ fontSize: '10px', textAlign: 'center', fontWeight: 'bold', color: 'var(--header-accent, #0f6cbd)' }}>Use "{iconSearchQuery.trim()}"</span>
                    </button>
                  ) : null}
                  {AVAILABLE_ICONS.filter(icon =>
                    icon.label.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
                    icon.value.toLowerCase().includes(iconSearchQuery.toLowerCase())
                  ).map((icon) => (
                    <button
                      key={icon.value}
                      onClick={(): void => {
                        update({ iconName: icon.value });
                        setIsIconPickerOpen(false);
                        setIconSearchQuery('');
                      }}
                      type="button"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '12px 8px',
                        border: draft.iconName === icon.value ? '2px solid var(--header-accent, #0f6cbd)' : '1px solid var(--header-border, #edebe9)',
                        borderRadius: '6px',
                        background: draft.iconName === icon.value ? 'var(--header-accent-subtle, rgba(15, 108, 189, 0.08))' : 'var(--header-surface, #ffffff)',
                        cursor: 'pointer'
                      }}
                    >
                      <DynamicIcon iconName={icon.value} />
                      <span style={{ fontSize: '10px', textAlign: 'center', color: 'var(--header-subtext, #605e5c)' }}>{icon.label.split(' / ')[0]}</span>
                    </button>
                  ))}
                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={(): void => setIsIconPickerOpen(false)} appearance="secondary">Cancel</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      ) : null}
    </>
  );
};

export default NavigationItemDialog;
