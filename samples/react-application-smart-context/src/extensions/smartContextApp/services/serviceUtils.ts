/**
 * Utility functions for the CopilotService and related services
 */

/**
 * Removes inline citations like [1](url) or [2](https://...) from text
 * Copilot sometimes adds these even when instructed not to
 * 
 * @param text - The text to clean
 * @returns The text without inline citations
 * 
 * @example
 * removeInlineCitations("Hello[1](https://example.com) world")
 * // Returns: "Hello world"
 */
export function removeInlineCitations(text: string): string {
  // Pattern matches [number](url) - e.g., [1](https://example.com)
  return text.replace(/\[\d+\]\([^)]+\)/g, '');
}
