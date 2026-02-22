import { ToolContext, TavilySearchResult, ExaSearchResult } from './types';
import { mcpManager } from './mcp-client';
export type ToolResult = { content: string } | { error: string } | any;
export async function getToolDefinitions() {
  const nativeTools = [
    {
      type: 'function',
      function: {
        name: 'tavily_search',
        description: 'Search the web for real-time information using Tavily.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'The search query' },
            search_depth: { type: 'string', enum: ['basic', 'advanced'], default: 'basic' }
          },
          required: ['query']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'tavily_extract',
        description: 'Extract clean content from a list of URLs.',
        parameters: {
          type: 'object',
          properties: {
            urls: { type: 'array', items: { type: 'string' }, description: 'List of URLs to extract content from' }
          },
          required: ['urls']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'exa_search',
        description: 'Neural search to find high-quality links and documents.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Semantic search query' },
            numResults: { type: 'number', default: 5 }
          },
          required: ['query']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'index_content',
        description: 'Save important findings or extracted text into the research index for later retrieval.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Title for the indexed item' },
            content: { type: 'string', description: 'The actual text content to save' },
            url: { type: 'string', description: 'Source URL' }
          },
          required: ['title', 'content']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'search_index',
        description: 'Search through previously indexed research findings in this session.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Keywords to search in indexed items' }
          },
          required: ['query']
        }
      }
    }
  ];
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...nativeTools, ...mcpTools];
}
export async function executeTool(name: string, args: any, context: ToolContext): Promise<ToolResult> {
  try {
    // Initialize MCP if servers are provided in context
    if (context.mcpServers && context.mcpServers.length > 0) {
      await mcpManager.initialize(context.mcpServers);
    }
    switch (name) {
      case 'tavily_search': {
        if (!context.tavilyKey) return { error: 'Tavily API key is missing.' };
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: context.tavilyKey,
            query: args.query,
            search_depth: args.search_depth || 'basic'
          })
        });
        const data = await response.json() as TavilySearchResult;
        return { content: JSON.stringify(data.results) };
      }
      case 'tavily_extract': {
        if (!context.tavilyKey) return { error: 'Tavily API key is missing.' };
        const response = await fetch('https://api.tavily.com/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: context.tavilyKey, urls: args.urls })
        });
        return await response.json();
      }
      case 'exa_search': {
        if (!context.exaKey) return { error: 'Exa API key is missing.' };
        const response = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': context.exaKey },
          body: JSON.stringify({ query: args.query, useAutoprompt: true, numResults: args.numResults || 5 })
        });
        const data = await response.json() as ExaSearchResult;
        return { content: JSON.stringify(data.results) };
      }
      case 'index_content':
        // This tool is handled as a state side-effect in agent.ts but needs to return success
        return { success: true, message: 'Content sent to index.' };
      case 'search_index':
        // Handled in agent logic to access DO state, but dummy return here
        return { info: 'Search results will be provided by the agent coordinator.' };
      default:
        if (mcpManager.isToolAvailable(name)) {
          const mcpResult = await mcpManager.executeTool(name, args);
          return { content: mcpResult };
        }
        return { error: `Tool ${name} not implemented` };
    }
  } catch (error: any) {
    return { error: error.message || 'Tool execution failed' };
  }
}