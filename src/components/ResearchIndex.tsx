import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Search, Archive, FileText, Clock } from 'lucide-react';
import type { IndexedItem } from '../../worker/types';
import { formatDistanceToNow } from 'date-fns';
export function ResearchIndex({ items }: { items: IndexedItem[] }) {
  const [query, setQuery] = useState('');
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.content.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Archive className="text-accent-purple size-6" />
          <h2 className="serif-heading text-2xl font-bold">Research Journal</h2>
          <Badge variant="outline" className="border-ink/20">{items.length} records</Badge>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input 
            placeholder="Search indexing history..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10 bg-white border-2 border-ink/10 focus:border-ink"
          />
        </div>
      </div>
      {filteredItems.length === 0 ? (
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-ink/10 rounded-xl bg-paper/50">
          <FileText className="size-12 text-ink/20 mb-4" />
          <p className="handwritten text-2xl text-ink/40">No records found in the index.</p>
          <p className="text-xs text-muted-foreground mt-2 italic">Ask Lore to 'index' important facts to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="paper-card group relative overflow-hidden flex flex-col h-[280px]">
              <CardHeader className="p-4 pb-2 space-y-1">
                <div className="flex items-start justify-between">
                  <CardTitle className="serif-heading text-lg font-bold leading-tight group-hover:text-accent-purple transition-colors line-clamp-2">
                    {item.title}
                  </CardTitle>
                  {item.sourceUrl && (
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-ink/40 hover:text-ink">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground italic">
                  <Clock size={10} />
                  {formatDistanceToNow(item.timestamp)} ago
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1 overflow-hidden">
                <p className="text-xs leading-relaxed text-ink/80 line-clamp-6 handwritten text-lg">
                  {item.content}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}