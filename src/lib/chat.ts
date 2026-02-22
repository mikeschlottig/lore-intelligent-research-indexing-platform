import type { ChatState, ToolContext, SessionInfo, MCPServer } from '../../worker/types';
export class ChatService {
  private sessionId: string = crypto.randomUUID();
  private baseUrl: string = `/api/chat/${this.sessionId}`;
  async sendMessage(
    message: string,
    apiKeys: ToolContext,
    mcpServers: MCPServer[] = []
  ): Promise<{ success: boolean; data?: ChatState; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          apiKeys,
          mcpServers
        })
      });
      const result = await response.json();
      if (!response.ok) {
        return { 
          success: false, 
          error: result.error || `Request failed with status ${response.status}` 
        };
      }
      return result;
    } catch (e) {
      console.error('ChatService network error:', e);
      return { success: false, error: 'Network connection failed. Ensure your internet is active.' };
    }
  }
  async getMessages(): Promise<{ success: boolean; data?: ChatState }> {
    try {
      const r = await fetch(`${this.baseUrl}/messages`);
      if (!r.ok) return { success: false };
      return await r.json();
    } catch (e) {
      return { success: false };
    }
  }
  switchSession(id: string) {
    this.sessionId = id;
    this.baseUrl = `/api/chat/${id}`;
  }
  async listSessions(): Promise<{ success: boolean; data?: SessionInfo[] }> {
    try {
      const r = await fetch('/api/sessions');
      if (!r.ok) return { success: false };
      return await r.json();
    } catch (e) {
      return { success: false };
    }
  }
  async createSession(firstMessage?: string): Promise<{ success: boolean; data?: { sessionId: string } }> {
    try {
      const r = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstMessage })
      });
      if (!r.ok) return { success: false };
      return await r.json();
    } catch (e) {
      return { success: false };
    }
  }
}
export const chatService = new ChatService();