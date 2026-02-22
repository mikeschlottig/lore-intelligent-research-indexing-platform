import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Link as LinkIcon, FileText, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Message, ToolCall } from '../../worker/types';
export function ChatInterface({ messages, isProcessing }: { messages: Message[], isProcessing: boolean }) {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-32">
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${m.role === 'user' ? 'bg-ink text-paper p-4 rounded-lg shadow-sm' : 'space-y-4'}`}>
              {m.role === 'assistant' && (
                <div className="prose prose-stone dark:prose-invert">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              )}
              {m.role === 'user' && <p className="font-medium">{m.content}</p>}
              {m.toolCalls && m.toolCalls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {m.toolCalls.map((tc, i) => (
                    <ToolResultCard key={i} toolCall={tc} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {isProcessing && (
        <div className="flex items-center gap-2 text-muted-foreground handwritten text-xl italic">
          <Loader2 className="h-5 w-5 animate-spin" />
          Lore is searching the scrolls...
        </div>
      )}
    </div>
  );
}
function ToolResultCard({ toolCall }: { toolCall: ToolCall }) {
  const isSearch = toolCall.name.includes('search');
  return (
    <Card className="p-3 border-2 border-ink/10 bg-white hover:border-ink/30 transition-all">
      <div className="flex items-center gap-2 mb-2">
        {isSearch ? <Search size={14} /> : <FileText size={14} />}
        <span className="text-xs font-bold uppercase tracking-wider">{toolCall.name}</span>
      </div>
      <div className="text-xs text-muted-foreground truncate italic">
        "{JSON.stringify(toolCall.arguments)}"
      </div>
      <div className="mt-2 text-xs space-y-1">
        {toolCall.result && typeof toolCall.result === 'object' && 'error' in (toolCall.result as any) ? (
          <Badge variant="destructive">Error: {(toolCall.result as any).error}</Badge>
        ) : (
          <Badge variant="secondary" className="bg-accent-purple/10 text-accent-purple border-accent-purple/20">Success</Badge>
        )}
      </div>
    </Card>
  );
}