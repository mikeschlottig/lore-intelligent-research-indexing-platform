import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Loader2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Message, ToolCall } from '../../worker/types';
export function ChatInterface({ messages, isProcessing }: { messages: Message[], isProcessing: boolean }) {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-10">
      <AnimatePresence initial={false} mode="popLayout">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "flex flex-col",
              m.role === 'user' ? 'items-end' : 'items-start'
            )}
          >
            <div className={cn(
              "max-w-[90%] md:max-w-[85%]",
              m.role === 'user'
                ? 'bg-ink text-paper p-5 rounded-2xl rounded-tr-none shadow-sketch handwritten text-xl'
                : 'space-y-6 w-full'
            )}>
              {m.role === 'assistant' && (
                <div className="serif-heading text-lg leading-relaxed text-ink/90 prose prose-stone dark:prose-invert max-w-none prose-p:my-2 prose-headings:mb-4 prose-headings:mt-6">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              )}
              {m.role === 'user' && <p>{m.content}</p>}
              {m.toolCalls && m.toolCalls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"
                >
                  {m.toolCalls.map((tc, i) => (
                    <ToolResultCard key={tc.id || i} toolCall={tc} index={i} />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-accent-purple/70 handwritten text-2xl italic animate-pulse"
        >
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Consulting the archives...</span>
        </motion.div>
      )}
    </div>
  );
}
function ToolResultCard({ toolCall, index }: { toolCall: ToolCall, index: number }) {
  const isSearch = toolCall.name.includes('search');
  const rotation = (index % 2 === 0 ? 1.5 : -1.5);
  // Refined Argument Truncation for aesthetic maintenance
  const argsString = JSON.stringify(toolCall.arguments);
  const displayArgs = argsString.length > 100 
    ? argsString.slice(0, 97) + '...' 
    : argsString;
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotate: 0 }}
      initial={{ rotate: rotation, opacity: 0, scale: 0.9 }}
      animate={{ rotate: rotation, opacity: 1, scale: 1 }}
      className="origin-center"
    >
      <Card className="p-4 border-2 border-ink/10 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-sketch transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between">
        <div className="absolute top-0 right-0 p-1 opacity-5">
          <Sparkles size={40} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-full bg-ink/5">
              {isSearch ? <Search size={12} className="text-accent-purple" /> : <FileText size={12} className="text-ink" />}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-ink/40">Dispatch: {toolCall.name}</span>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono bg-ink/[0.03] p-2 rounded mb-3 break-all">
            {displayArgs}
          </div>
        </div>
        <div className="flex justify-end">
          {toolCall.result && typeof toolCall.result === 'object' && 'error' in (toolCall.result as any) ? (
            <Badge variant="destructive" className="text-[8px] px-2 py-0 h-4">ERROR</Badge>
          ) : (
            <Badge variant="secondary" className="bg-accent-purple/10 text-accent-purple border-accent-purple/20 text-[8px] px-2 py-0 h-4 uppercase font-black">SECURED</Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );
}