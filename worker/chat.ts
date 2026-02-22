import OpenAI from 'openai';
import type { Message, ToolCall, ToolContext } from './types';
import { getToolDefinitions, executeTool } from './tools';
import { API_RESPONSES } from './config';
export class ChatHandler {
  private client: OpenAI;
  private model: string;
  private isConfigured: boolean = true;
  constructor(aiGatewayUrl: string, apiKey: string, model: string) {
    // Validation check for placeholder environment variables
    if (
      !aiGatewayUrl || 
      aiGatewayUrl.includes('YOUR_ACCOUNT_ID') || 
      aiGatewayUrl.includes('YOUR_GATEWAY_ID') ||
      !apiKey || 
      apiKey === 'your-cloudflare-api-key'
    ) {
      console.warn('[ChatHandler] AI Gateway or API Key is using placeholder values.');
      this.isConfigured = false;
    }
    this.client = new OpenAI({ 
      baseURL: aiGatewayUrl, 
      apiKey: apiKey || 'missing',
      maxRetries: 1
    });
    this.model = model;
  }
  async processMessage(
    message: string,
    history: Message[],
    context: ToolContext
  ): Promise<{ content: string; toolCalls?: ToolCall[] }> {
    if (!this.isConfigured) {
      return { 
        content: "System configuration required: Please update your Cloudflare AI Gateway URL and API Key in `wrangler.jsonc` to enable research capabilities." 
      };
    }
    const systemPrompt = `You are Lore, an intelligent research platform.
Your goal is to perform deep, grounded research using a multi-step loop:
1. SEARCH: Use Tavily or Exa to find broad or semantic links.
2. EXTRACT: Use 'tavily_extract' to pull raw text from promising URLs.
3. INDEX: Use 'index_content' to save key facts or document snippets to the research journal.
4. ANALYZE: Synthesize the findings into a clear, serif-styled response.
Always cite sources. If the user asks for similar links, use 'exa_search'. If you encounter dynamic needs (files, code, etc.), use available MCP tools.`;
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ] as any[];
    try {
      console.log(`[ChatHandler] Requesting completion with model: ${this.model}`);
      const tools = await getToolDefinitions();
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: (tools && tools.length > 0) ? tools as any : undefined,
        tool_choice: tools?.length > 0 ? 'auto' : undefined
      }).catch(err => {
        console.error('[ChatHandler] OpenAI API Error:', err);
        throw err;
      });
      const responseMessage = completion.choices[0].message;
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        console.log(`[ChatHandler] Processing ${responseMessage.tool_calls.length} tool calls`);
        const toolCalls: ToolCall[] = await Promise.all(
          responseMessage.tool_calls.map(async (tc: any) => {
            try {
              const args = JSON.parse(tc.function.arguments);
              const result = await executeTool(tc.function.name, args, context);
              return {
                id: tc.id,
                name: tc.function.name,
                arguments: args,
                result
              };
            } catch (toolErr) {
              console.error(`[ChatHandler] Tool execution failed for ${tc.function.name}:`, toolErr);
              return {
                id: tc.id,
                name: tc.function.name,
                arguments: {},
                result: { error: "Execution failed" }
              };
            }
          })
        );
        // Second pass for tool responses
        try {
          const finalCompletion = await this.client.chat.completions.create({
            model: this.model,
            messages: [
              ...messages,
              responseMessage,
              ...toolCalls.map(tc => ({
                role: 'tool',
                content: typeof tc.result === 'string' ? tc.result : JSON.stringify(tc.result),
                tool_call_id: tc.id
              }))
            ]
          });
          return {
            content: finalCompletion.choices[0].message.content || 'Research loop complete.',
            toolCalls
          };
        } catch (finalErr) {
          console.error('[ChatHandler] Final completion error after tools:', finalErr);
          return {
            content: "I gathered the research data but encountered an error synthesizing the final report. You can see the raw tool results below.",
            toolCalls
          };
        }
      }
      return { content: responseMessage.content || '' };
    } catch (error: any) {
      console.error('[ChatHandler] Primary processing error:', error);
      if (error?.status === 401 || error?.status === 403) {
        return { content: "Authentication Error: Your AI Gateway API key appears to be invalid." };
      }
      if (error?.status === 404) {
        return { content: `Model Not Found: The specified model '${this.model}' was not found at your AI Gateway endpoint.` };
      }
      return { content: "I'm having trouble connecting to my AI core right now. Please verify your Cloudflare worker configuration and network status." };
    }
  }
  updateModel(m: string) { this.model = m; }
}