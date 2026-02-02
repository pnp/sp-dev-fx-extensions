/**
 * Custom error classes for better error handling
 */

/**
 * Base error for Copilot-related errors
 */
export class CopilotError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'CopilotError';
  }
}

/**
 * Error when creating a conversation fails
 */
export class ConversationCreationError extends CopilotError {
  constructor(originalError?: unknown) {
    super('Failed to create Copilot conversation', originalError);
    this.name = 'ConversationCreationError';
  }
}

/**
 * Error when sending a chat message fails
 */
export class ChatMessageError extends CopilotError {
  constructor(conversationId: string, originalError?: unknown) {
    super(`Failed to send chat message to conversation ${conversationId}`, originalError);
    this.name = 'ChatMessageError';
  }
}

/**
 * Error when no response is received from Copilot
 */
export class NoResponseError extends CopilotError {
  constructor() {
    super('No response message received from Copilot');
    this.name = 'NoResponseError';
  }
}

/**
 * Error when parsing JSON response fails
 */
export class JsonParseError extends CopilotError {
  constructor(originalError?: unknown) {
    super('Failed to parse JSON from Copilot response', originalError);
    this.name = 'JsonParseError';
  }
}

/**
 * Error when no valid JSON is found in response
 */
export class NoJsonFoundError extends CopilotError {
  constructor() {
    super('No valid JSON found in Copilot response');
    this.name = 'NoJsonFoundError';
  }
}

/**
 * Helper to get user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ConversationCreationError) {
    return 'Unable to start a conversation with Copilot. Please try again.';
  }
  if (error instanceof ChatMessageError) {
    return 'Unable to get a response from Copilot. Please try again.';
  }
  if (error instanceof NoResponseError) {
    return 'Copilot did not return a response. Please try again.';
  }
  if (error instanceof JsonParseError || error instanceof NoJsonFoundError) {
    return 'Unable to process Copilot response. Please try again.';
  }
  if (error instanceof CopilotError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
