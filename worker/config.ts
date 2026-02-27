/**
 * worker/config.ts
 * ----------------
 * Constants-only module for centralized API response strings and other static configuration.
 *
 * IMPORTANT:
 * - This file is NOT a Durable Object extension point.
 * - Do NOT move/duplicate session-management logic into this module.
 *
 * Session management extension point:
 * - Extend the Durable Object in `worker/app-controller.ts` (AppController) for session lifecycle features.
 */
export const API_RESPONSES = {
  MISSING_MESSAGE: 'Message required',
  INVALID_MODEL: 'Invalid model',
  PROCESSING_ERROR: 'The archivist encountered a failure while retrieving data.',
  NOT_FOUND: 'The requested archive entry was not found.',
  AGENT_ROUTING_FAILED: 'Failed to route the inquiry to the appropriate journal.',
  INTERNAL_ERROR: 'A systemic failure occurred in the library.',
  AI_CONFIG_ERROR: 'AI service placeholders detected. Please configure your Cloudflare AI Gateway.',
  AI_SERVICE_UNAVAILABLE: 'The AI service is temporarily out of reach.',
  TOOL_TIMEOUT: 'Research tool took too long to respond.'
} as const;