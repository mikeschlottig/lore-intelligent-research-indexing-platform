# Cloudflare Workers AI Chat Agent Template

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/lore-intelligent-research-indexing-platform)

## Overview

A production-ready full-stack template for building scalable AI chat applications on Cloudflare Workers. This template provides a modern React frontend with shadcn/ui, multi-session management via Durable Objects, streaming AI responses, tool calling (web search, weather, MCP), and seamless integration with Cloudflare AI Gateway.

Perfect for developers building conversational AI agents, research platforms, or customer support bots.

## Key Features

- **Multi-Session Chat**: Persistent chat sessions with titles, activity tracking, and CRUD APIs
- **Streaming Responses**: Real-time AI message streaming with low latency
- **Tool Calling**: Built-in tools for web search (SerpAPI), weather, URL fetching, and extensible MCP integration
- **Model Switching**: Support for Gemini 2.5 Flash/Pro/2.0 Flash via Cloudflare AI Gateway
- **Modern UI**: Responsive design with Tailwind CSS, shadcn/ui components, dark mode, and sidebar navigation
- **State Management**: Durable Objects for sessions, TanStack Query for frontend caching
- **Developer-Friendly**: TypeScript end-to-end, Hono routing, Agents SDK, error handling, and session stats APIs
- **Production-Ready**: CORS, logging, health checks, client error reporting, and SPA asset handling

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Cloudflare Workers, Hono, Agents SDK (`^0.0.109`), Durable Objects, OpenAI SDK |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Zustand |
| **AI/ML** | Cloudflare AI Gateway, Gemini models, MCP SDK, SerpAPI |
| **UI/UX** | Lucide React icons, Framer Motion, Sonner toasts, Radix UI primitives |
| **Dev Tools** | Bun, Wrangler, ESLint, TypeScript 5.8 |
| **Other** | Immer, Zod, UUID, Date-fns |

## Prerequisites

- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`bunx wrangler@latest`)
- Cloudflare account with AI Gateway configured
- API keys: Cloudflare AI, SerpAPI (optional for search)

## Quick Start

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>
   cd <project-name>
   bun install
   ```

2. **Configure Environment** (edit `wrangler.jsonc`)
   ```json
   "vars": {
     "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai",
     "CF_AI_API_KEY": "{your-cloudflare-api-token}",
     "SERPAPI_KEY": "{your-serpapi-key}",
     "OPENROUTER_API_KEY": "{optional-openrouter-key}"
   }
   ```

3. **Generate Types & Run Dev**
   ```bash
   bun run cf-typegen  # Generate Worker types
   bun run dev          # Starts at http://localhost:3000 (or $PORT)
   ```

## Development Workflow

- **Frontend**: `src/` - Edit React components in `pages/`, `components/`. Use shadcn CLI: `bunx shadcn@latest add <component>`
- **Backend**: `worker/` - Extend `userRoutes.ts` for custom APIs, `tools.ts` for new tools, `chat.ts` for AI logic
- **Hot Reload**: Vite HMR for frontend, Wrangler dev for backend
- **Linting**: `bun run lint`
- **Preview Build**: `bun run preview`
- **Custom Tools**: Add to `worker/tools.ts` or configure MCP servers in `worker/mcp-client.ts`

### Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/:sessionId/chat` | POST | Send message (supports streaming) |
| `/api/chat/:sessionId/messages` | GET | Get chat state |
| `/api/sessions` | GET/POST/DELETE | List/create/delete sessions |
| `/api/sessions/:id` | DELETE | Delete session |
| `/api/sessions/:id/title` | PUT | Update title |
| `/api/health` | GET | Health check |

### Session Management

- Auto-creates sessions on first message
- List/delete via sidebar
- Titles auto-generated from first message

## Deployment

1. **Build & Deploy**
   ```bash
   bun run build      # Build frontend assets
   bun run deploy     # Deploy via Wrangler (or `wrangler deploy`)
   ```

2. **Configure Secrets** (post-deploy)
   ```bash
   wrangler secret put CF_AI_API_KEY
   wrangler secret put SERPAPI_KEY
   # etc.
   ```

3. **Custom Domain**
   ```bash
   wrangler pages domain add <your-domain>
   ```

4. **One-Click Deploy**
   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/lore-intelligent-research-indexing-platform)

## Environment Variables

| Var | Required | Description | Source |
|-----|----------|-------------|--------|
| `CF_AI_BASE_URL` | Yes | AI Gateway endpoint | Cloudflare Dashboard |
| `CF_AI_API_KEY` | Yes | Cloudflare API token | Cloudflare API Tokens |
| `SERPAPI_KEY` | No | Web search | [SerpAPI](https://serpapi.com) |
| `OPENROUTER_API_KEY` | No | Alt LLM provider | [OpenRouter](https://openrouter.ai) |

## Customization Guide

- **Frontend**: Replace `src/pages/HomePage.tsx` with your chat UI (integrates with `src/lib/chat.ts`)
- **AI Models**: Update `src/lib/chat.ts` MODELS array and worker state
- **Tools**: Extend `worker/tools.ts` or add MCP servers
- **Sidebar**: Edit `src/components/app-sidebar.tsx` or remove `AppLayout`
- **Theme**: Tailwind config in `tailwind.config.js`

## Troubleshooting

- **AI Gateway 401**: Verify token scopes (`cloudflare:ai:gateway:*`)
- **Worker Types**: Run `bun run cf-typegen`
- **CORS Issues**: All `/api/*` routes have CORS enabled
- **Sessions Missing**: Check Durable Object migrations in `wrangler.jsonc`

## Contributing

1. Fork & clone
2. `bun install`
3. Make changes, test with `bun run dev`
4. PR to `main`

## License

MIT - See [LICENSE](LICENSE) for details.

---

⭐ **Star on GitHub** | 🐛 **Issues** | 💬 **Discussions**