/**
 * Writes text to the clipboard. Returns true on success.
 * If the Clipboard API is unavailable or blocked, returns false.
 */
export async function writeToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    typeof navigator.clipboard.writeText !== "function"
  ) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
