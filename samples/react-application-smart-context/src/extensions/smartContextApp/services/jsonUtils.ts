/**
 * Utility functions for JSON parsing and validation
 */

import { ISmartContextData } from './ICopilotService';
import { JsonParseError, NoJsonFoundError } from './errors';

/**
 * Extracts and parses JSON from a text response that may contain markdown or other text
 */
export const extractJsonFromResponse = (text: string): Record<string, unknown> => {
  // Try to find JSON object in the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new NoJsonFoundError();
  }
  
  try {
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch (error) {
    throw new JsonParseError(error);
  }
};

/**
 * Validates that the parsed data has the expected structure
 */
export const validateSmartContextData = (data: Record<string, unknown>): ISmartContextData => {
  // Ensure arrays exist with defaults
  const validatedData: ISmartContextData = {
    myRole: data.myRole as ISmartContextData['myRole'],
    pendingActions: Array.isArray(data.pendingActions) ? data.pendingActions : [],
    keyDecisions: Array.isArray(data.keyDecisions) ? data.keyDecisions : [],
    timeline: Array.isArray(data.timeline) ? data.timeline : [],
    tldr: Array.isArray(data.tldr) ? data.tldr : [],
    people: Array.isArray(data.people) ? data.people : [],
    attributions: Array.isArray(data.attributions) ? data.attributions : []
  };
  
  return validatedData;
};
