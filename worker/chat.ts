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
    context: ToolContext,
    onChunk?: (chunk: string) => void
  ): Promise<{ content: string; toolCalls?: ToolCall[] }> {
    const messages = [
      { role: 'system', content: 'You are Lore, a deep research assistant. Use the provided tools to find, extract, and verify information from the web. Present findings clearly.' },
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
        responseMessage.tool_calls.map(async (tc) => {
          const args = JSON.parse(tc.function.arguments);
          const result = await executeTool(tc.function.name, args, context);
          return { id: tc.id, name: tc.function.name, arguments: args, result };
        })
      );
      // Generate final response with tool results
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
        content: finalCompletion.choices[0].message.content || 'Research complete.',
        toolCalls
      };
    }
    return { content: responseMessage.content || '' };
  }
  updateModel(m: string) { this.model = m; }
}