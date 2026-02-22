import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { ChatState, ToolContext, IndexedItem, MCPServer } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage } from './utils';
interface ChatPayload {
  message: string;
  apiKeys: ToolContext;
  mcpServers?: MCPServer[];
}
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  initialState: ChatState = {
    messages: [],
    sessionId: crypto.randomUUID(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.0-flash',
    index: [],
    mcpServers: []
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
      const body = (await request.json()) as ChatPayload;
      return this.handleChatMessage(body);
    }
    if (method === 'DELETE' && url.pathname === '/clear') {
      this.setState({ ...this.state, messages: [], index: [] });
      return Response.json({ success: true });
    }
    return Response.json({ success: false, error: API_RESPONSES.NOT_FOUND }, { status: 404 });
  }
  private async handleChatMessage(body: ChatPayload): Promise<Response> {
    const { message, apiKeys, mcpServers } = body;
    if (!message?.trim()) return Response.json({ success: false, error: API_RESPONSES.MISSING_MESSAGE }, { status: 400 });
    // Robustness check for MCP server synchronization
    const validMcpServers = Array.isArray(mcpServers) ? mcpServers : this.state.mcpServers;
    if (Array.isArray(mcpServers)) {
      this.setState({ ...this.state, mcpServers: validMcpServers });
    }
    const userMsg = createMessage('user', message);
    this.setState({
      ...this.state,
      messages: [...this.state.messages, userMsg],
      isProcessing: true
    });
    try {
      const context: ToolContext = {
        ...apiKeys,
        mcpServers: validMcpServers
      };
      const result = await this.chatHandler!.processMessage(message, this.state.messages, context);
      if (result.toolCalls) {
        const newIndexItems: IndexedItem[] = [];
        for (const tc of result.toolCalls) {
          if (tc.name === 'index_content') {
            const args = tc.arguments as any;
            newIndexItems.push({
              id: crypto.randomUUID(),
              title: args.title || 'Untitled Discovery',
              content: args.content,
              sourceUrl: args.url,
              timestamp: Date.now()
            });
          }
          if (tc.name === 'search_index') {
            const query = (tc.arguments as any).query?.toLowerCase() || '';
            const filtered = this.state.index.filter(item =>
              item.title.toLowerCase().includes(query) ||
              item.content.toLowerCase().includes(query)
            );
            tc.result = { results: filtered, count: filtered.length };
          }
        }
        if (newIndexItems.length > 0) {
          this.setState({
            ...this.state,
            index: [...this.state.index, ...newIndexItems]
          });
        }
      }
      const assistantMsg = createMessage('assistant', result.content, result.toolCalls);
      this.setState({
        ...this.state,
        messages: [...this.state.messages, assistantMsg],
        isProcessing: false
      });
      return Response.json({ success: true, data: this.state });
    } catch (error: any) {
      console.error('Agent processing error:', error);
      this.setState({ ...this.state, isProcessing: false });
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }
  }
}