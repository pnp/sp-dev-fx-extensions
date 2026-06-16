const DANGEROUS_START = /^[=+\-@\t\r]/;

/**
 * Escapes a value for safe CSV output.
 * Protects against formula injection by prefixing dangerous leading characters
 * with a single quote. Wraps the result in double quotes and escapes internal
 * double quotes per RFC 4180.
 */
export function safeCsvCell(value: unknown): string {
  const raw = String(value ?? "");
  const sanitized = DANGEROUS_START.test(raw) ? `'${raw}` : raw;
  return `"${sanitized.replace(/"/g, '""')}"`;
}
