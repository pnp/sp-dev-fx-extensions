/**
 * Triggers a local file download in the browser.
 * Creates a temporary anchor element, sets the download attribute, and clicks it.
 */
export function downloadFile(
  content: string,
  fileName: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);

  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
