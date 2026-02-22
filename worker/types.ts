export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
export interface MCPServer {
  name: string;
  url: string;
}
export interface IndexedItem {
  id: string;
  title: string;
  content: string;
  sourceUrl?: string;
  timestamp: number;
}
export interface ToolContext {
  tavilyKey?: string;
  exaKey?: string;
  mcpServers?: MCPServer[];
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
  index: IndexedItem[];
  mcpServers: MCPServer[];
}
export interface SessionInfo {
  id: string;
  title: string;
  createdAt: number;
  lastActive: number;
}