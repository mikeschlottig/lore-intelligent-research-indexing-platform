import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Search, Archive, FileText, Clock, Sparkles } from 'lucide-react';
import type { IndexedItem } from '../../worker/types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
export function ResearchIndex({ items }: { items: IndexedItem[] }) {
  const [query, setQuery] = useState('');
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.content.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="max-w-6xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-ink/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Archive className="text-accent-purple size-8" />
            <h2 className="serif-heading text-4xl font-bold tracking-tight">The Ledger</h2>
          </div>
          <p className="handwritten text-xl text-muted-foreground">Permanent records of your inquiries and discoveries.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30 size-5" />
          <Input
            placeholder="Search indexing history..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-12 bg-white border-2 border-ink shadow-sketch h-12 handwritten text-lg focus-visible:ring-0"
          />
        </div>
      </div>
      {filteredItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-[500px] flex flex-col items-center justify-center border-4 border-dashed border-ink/5 rounded-3xl bg-ink/[0.01]"
        >
          <div className="relative mb-6">
            <FileText className="size-20 text-ink/10" />
            <Sparkles className="absolute -top-2 -right-2 size-8 text-accent-purple/20 animate-pulse" />
          </div>
          <p className="serif-heading text-3xl text-ink/30 font-bold">Archives Empty</p>
          <p className="handwritten text-xl text-ink/40 mt-2 max-w-xs text-center">
            Ask Lore to "index" key findings to preserve them in this journal forever.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="paper-card group relative overflow-hidden flex flex-col h-[320px] hover:-translate-y-2 hover:shadow-sketch-lg transition-all duration-300 border-2 border-ink/10">
                <CardHeader className="p-6 pb-2 space-y-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="serif-heading text-xl font-bold leading-tight group-hover:text-accent-purple transition-colors line-clamp-2">
                      {item.title}
                    </CardTitle>
                    {item.sourceUrl && (
                      <a 
                        href={item.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-ink/20 hover:text-ink p-1 hover:bg-ink/5 rounded transition-colors"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground italic font-medium">
                    <Clock size={12} className="text-accent-purple/50" />
                    {formatDistanceToNow(item.timestamp)} ago
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-2 flex-1 overflow-hidden relative">
                  <p className="text-lg leading-relaxed text-ink/80 handwritten line-clamp-[7]">
                    {item.content}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}