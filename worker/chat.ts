import OpenAI from 'openai';
import type { Message, ToolCall, ToolContext } from './types';
import { getToolDefinitions, executeTool } from './tools';
export class ChatHandler {
  private client: OpenAI;
  private model: string;
  constructor(aiGatewayUrl: string, apiKey: string, model: string) {
    this.client = new OpenAI({ baseURL: aiGatewayUrl, apiKey });
    this.model = model;
  }
  async processMessage(
    message: string,
    history: Message[],
    context: ToolContext
  ): Promise<{ content: string; toolCalls?: ToolCall[] }> {
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
    const tools = await getToolDefinitions();
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      tools: tools as any,
      tool_choice: 'auto'
    });
    const responseMessage = completion.choices[0].message;
    if (responseMessage.tool_calls) {
      const toolCalls: ToolCall[] = await Promise.all(
        responseMessage.tool_calls.map(async (tc: any) => {
          const args = JSON.parse(tc.function.arguments);
          const result = await executeTool(tc.function.name, args, context);
          return { 
            id: tc.id, 
            name: tc.function.name, 
            arguments: args, 
            result 
          };
        })
      );
      // Recursive step for tool response
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
    }
    return { content: responseMessage.content || '' };
  }
  updateModel(m: string) { this.model = m; }
}