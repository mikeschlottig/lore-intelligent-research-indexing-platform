import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Loader2, Sparkles, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Message, ToolCall } from '../../worker/types';
const LOADING_STATES = [
  "Consulting the archives...",
  "Analyzing research results...",
  "Searching neural nodes...",
  "Extracting document data...",
  "Cross-referencing indices...",
  "Synthesizing findings..."
];
export function ChatInterface({ messages, isProcessing }: { messages: Message[], isProcessing: boolean }) {
  const [loadingText, setLoadingText] = useState(LOADING_STATES[0]);
  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      interval = setInterval(() => {
        setLoadingText(LOADING_STATES[Math.floor(Math.random() * LOADING_STATES.length)]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);
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
                  className="grid grid-cols-1 gap-4 mt-6"
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
          className="flex items-center gap-3 text-accent-purple/70 handwritten text-2xl italic"
        >
          <Loader2 className="h-6 w-6 animate-spin" />
          <motion.span
            key={loadingText}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loadingText}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
function ToolResultCard({ toolCall, index }: { toolCall: ToolCall, index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSearch = toolCall.name.includes('search');
  const argsString = JSON.stringify(toolCall.arguments);
  const displayArgs = argsString.length > 100
    ? argsString.slice(0, 97) + '...'
    : argsString;
  return (
    <motion.div
      layout
      className="w-full"
    >
      <Card className="border-2 border-ink/10 bg-white shadow-sm hover:shadow-sketch transition-all duration-300 relative overflow-hidden flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-ink/5">
              {isSearch ? <Search size={14} className="text-accent-purple" /> : <FileText size={14} className="text-ink" />}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-ink/40 block">Tool Dispatch</span>
              <span className="font-mono text-xs font-bold">{toolCall.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2 text-[10px] font-bold gap-1 hover:bg-ink/5"
            >
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {isExpanded ? "Close Data" : "Inspect Result"}
            </Button>
            <Badge variant="secondary" className="bg-accent-purple/10 text-accent-purple border-accent-purple/20 text-[9px] px-2 py-0 uppercase font-black">
              COMPLETED
            </Badge>
          </div>
        </div>
        {!isExpanded && (
          <div className="px-4 pb-4">
            <div className="text-[10px] text-muted-foreground font-mono bg-ink/[0.03] p-2 rounded truncate">
              {displayArgs}
            </div>
          </div>
        )}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-ink/[0.02] border-t border-ink/5"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-ink/50 uppercase">
                  <Terminal size={12} /> Raw JSON Payload
                </div>
                <pre className="text-[11px] font-mono bg-white p-4 border border-ink/10 rounded-lg overflow-x-auto max-h-[400px] leading-relaxed shadow-inner">
                  {JSON.stringify(toolCall.result || { status: 'No data returned' }, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}