export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
export interface ToolContext {
  tavilyKey?: string;
  exaKey?: string;
}
export interface TavilySearchResult {
  results: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
  }>;
}
export interface ExaSearchResult {
  results: Array<{
    title: string;
    url: string;
    id: string;
    score: number;
    publishedDate?: string;
    author?: string;
  }>;
}
export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  id: string;
  toolCalls?: ToolCall[];
  tool_call_id?: string;
}
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}
export interface ChatState {
  messages: Message[];
  sessionId: string;
  isProcessing: boolean;
  model: string;
  streamingMessage?: string;
}
export interface SessionInfo {
  id: string;
  title: string;
  createdAt: number;
  lastActive: number;
}