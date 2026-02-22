import type { ChatState, ToolContext, SessionInfo } from '../../worker/types';
export class ChatService {
  private sessionId: string = crypto.randomUUID();
  private baseUrl: string = `/api/chat/${this.sessionId}`;
  async sendMessage(message: string, apiKeys: ToolContext): Promise<{ success: boolean; data?: ChatState; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, apiKeys })
      });
      return await response.json();
    } catch (e) {
      return { success: false, error: 'Network error' };
    }
  }
  async getMessages(): Promise<{ success: boolean; data?: ChatState }> {
    const r = await fetch(`${this.baseUrl}/messages`);
    return await r.json();
  }
  switchSession(id: string) {
    this.sessionId = id;
    this.baseUrl = `/api/chat/${id}`;
  }
  async listSessions(): Promise<{ success: boolean; data?: SessionInfo[] }> {
    const r = await fetch('/api/sessions');
    return await r.json();
  }
  async createSession(firstMessage?: string): Promise<{ success: boolean; data?: { sessionId: string } }> {
    const r = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstMessage })
    });
    return await r.json();
  }
}
export const chatService = new ChatService();