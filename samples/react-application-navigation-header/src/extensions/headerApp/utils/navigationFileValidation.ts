import type { INavigationFileItem } from '../services/JsonFileNavigationService';

export interface ISanitizeNavigationItemsResult {
  items: INavigationFileItem[];
  warnings: string[];
}

const MAX_DEPTH = 10;

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const strings = value.filter((entry): entry is string => typeof entry === 'string');
  return strings.length > 0 ? strings : undefined;
}

export function sanitizeNavigationItems(value: unknown, path = 'navigation'): ISanitizeNavigationItemsResult {
  const warnings: string[] = [];
  const items = sanitizeNavigationItemsInternal(value, path, 0, warnings);
  return { items, warnings };
}

function sanitizeNavigationItemsInternal(
  value: unknown,
  path: string,
  depth: number,
  warnings: string[]
): INavigationFileItem[] {
  if (!Array.isArray(value)) {
    if (value !== undefined) {
      warnings.push(`${path}: expected an array, got ${typeof value} — ignored.`);
    }
    return [];
  }

  if (depth >= MAX_DEPTH) {
    warnings.push(`${path}: exceeded maximum nesting depth (${MAX_DEPTH}) — remaining levels ignored.`);
    return [];
  }

  const result: INavigationFileItem[] = [];

  value.forEach((raw, index) => {
    const itemPath = `${path}[${index}]`;

    if (!isPlainObject(raw)) {
      warnings.push(`${itemPath}: expected an object, got ${typeof raw} — item dropped.`);
      return;
    }

    const id = raw.id;
    const label = raw.label;

    if (typeof id !== 'string' || !id.trim()) {
      warnings.push(`${itemPath}: missing or invalid "id" — item dropped.`);
      return;
    }

    if (typeof label !== 'string' || !label.trim()) {
      warnings.push(`${itemPath}: missing or invalid "label" — item dropped.`);
      return;
    }

    const item: INavigationFileItem = { id, label, children: [] };

    if (typeof raw.url === 'string') { item.url = raw.url; }
    if (typeof raw.description === 'string') { item.description = raw.description; }
    if (typeof raw.group === 'string') { item.group = raw.group; }
    if (typeof raw.order === 'number' && Number.isFinite(raw.order)) { item.order = raw.order; }
    if (typeof raw.featured === 'boolean') { item.featured = raw.featured; }
    if (typeof raw.featuredRank === 'number' && Number.isFinite(raw.featuredRank)) { item.featuredRank = raw.featuredRank; }
    if (typeof raw.overviewTitle === 'string') { item.overviewTitle = raw.overviewTitle; }
    if (typeof raw.overviewDescription === 'string') { item.overviewDescription = raw.overviewDescription; }
    if (typeof raw.isExternal === 'boolean') { item.isExternal = raw.isExternal; }
    if (typeof raw.iconName === 'string') { item.iconName = raw.iconName; }

    const matchUrls = sanitizeStringArray(raw.matchUrls);
    if (matchUrls) { item.matchUrls = matchUrls; }

    item.children = sanitizeNavigationItemsInternal(raw.children, `${itemPath}.children`, depth + 1, warnings);

    result.push(item);
  });

  return result;
}
