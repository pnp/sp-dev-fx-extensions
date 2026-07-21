import { sanitizeUrl } from './url';

const GUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const FONT_SIZE_RE = /^(\d+(\.\d+)?)(px|rem|em)$/;
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const PATH_TRAVERSAL_RE = /(?:^|\/)\.\.(?:\/|$)/;
const SAFE_FILE_NAME_RE = /^[A-Za-z0-9 _\-.]+$/;
const SAFE_FOLDER_RE = /^[A-Za-z0-9 _\-./]+$/;

export type Validator = (value: string | undefined) => string | undefined;

export const validateUrl: Validator = (value) => {
  if (!value) {
    return undefined;
  }
  const sanitized = sanitizeUrl(value);
  if (!sanitized) {
    return 'Enter a valid URL (http, https, mailto, tel, or root-relative like /sites/foo).';
  }
  return undefined;
};

export const validateRequiredUrl: Validator = (value) => {
  if (!value || !value.trim()) {
    return 'A URL is required.';
  }
  return validateUrl(value);
};

export const validateGuid: Validator = (value) => {
  if (!value) {
    return undefined;
  }
  if (!GUID_RE.test(value.trim())) {
    return 'Enter a valid GUID, e.g. 98f8a745-9fc2-402c-92f2-ec218a3695aa.';
  }
  return undefined;
};

export const validateFontSize: Validator = (value) => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!FONT_SIZE_RE.test(trimmed)) {
    return 'Use a value like 18px, 1.125rem, or 1.1em.';
  }
  return undefined;
};

export const validateHexColor: Validator = (value) => {
  if (!value) {
    return undefined;
  }
  if (!HEX_RE.test(value.trim())) {
    return 'Enter a hex color like #0f6cbd or #fff.';
  }
  return undefined;
};

export const validatePositiveInt: Validator = (value) => {
  if (!value) {
    return undefined;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    return 'Enter a whole number of 0 or greater.';
  }
  return undefined;
};

export const validateIntRange = (min: number, max: number): Validator => (value) => {
  if (!value) {
    return undefined;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return 'Enter a whole number.';
  }
  if (n < min || n > max) {
    return `Enter a whole number between ${min} and ${max}.`;
  }
  return undefined;
};

export const validateFileName: Validator = (value) => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!SAFE_FILE_NAME_RE.test(trimmed)) {
    return 'Use only letters, numbers, spaces, hyphens, and dots.';
  }
  if (PATH_TRAVERSAL_RE.test(trimmed)) {
    return 'File name may not contain "..".';
  }
  return undefined;
};

export const validateFolder: Validator = (value) => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!SAFE_FOLDER_RE.test(trimmed)) {
    return 'Use only letters, numbers, spaces, hyphens, dots, and slashes.';
  }
  if (PATH_TRAVERSAL_RE.test(trimmed)) {
    return 'Folder may not contain "..".';
  }
  return undefined;
};

export const validateNonEmpty: Validator = (value) => {
  if (!value || !value.trim()) {
    return 'This field is required.';
  }
  return undefined;
};

export interface IFieldValidationState {
  [key: string]: string | undefined;
}

export function hasValidationErrors(state: IFieldValidationState): boolean {
  return Object.keys(state).some((key) => !!state[key]);
}