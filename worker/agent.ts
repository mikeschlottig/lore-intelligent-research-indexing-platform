import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { ChatState, ToolContext } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage } from './utils';
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  initialState: ChatState = {
    messages: [],
    sessionId: crypto.randomUUID(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash'
  };
  async onStart(): Promise<void> {
    this.chatHandler = new ChatHandler(
      this.env.CF_AI_BASE_URL,
      this.env.CF_AI_API_KEY,
      this.state.model
    );
  }
  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    if (method === 'GET' && url.pathname === '/messages') {
      return Response.json({ success: true, data: this.state });
    }
    if (method === 'POST' && url.pathname === '/chat') {
      const body = await request.json();
      return this.handleChatMessage(body);
    }
    if (method === 'DELETE' && url.pathname === '/clear') {
      this.setState({ ...this.state, messages: [] });
      return Response.json({ success: true });
    }
    return Response.json({ success: false, error: API_RESPONSES.NOT_FOUND }, { status: 404 });
  }
  private async handleChatMessage(body: { message: string; apiKeys: ToolContext }): Promise<Response> {
    const { message, apiKeys } = body;
    if (!message?.trim()) return Response.json({ success: false, error: API_RESPONSES.MISSING_MESSAGE }, { status: 400 });
    const userMsg = createMessage('user', message);
    this.setState({
      ...this.state,
      messages: [...this.state.messages, userMsg],
      isProcessing: true
    });
    try {
      const result = await this.chatHandler!.processMessage(message, this.state.messages, apiKeys);
      const assistantMsg = createMessage('assistant', result.content, result.toolCalls);
      this.setState({
        ...this.state,
        messages: [...this.state.messages, assistantMsg],
        isProcessing: false
      });
      return Response.json({ success: true, data: this.state });
    } catch (error: any) {
      console.error(error);
      this.setState({ ...this.state, isProcessing: false });
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }
  }
}