import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Server, Key, Settings2 } from 'lucide-react';
import type { MCPServer } from '../../worker/types';
export function SettingsDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const [keys, setKeys] = useState({ tavilyKey: '', exaKey: '' });
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [newMcp, setNewMcp] = useState({ name: '', url: '' });
  useEffect(() => {
    const storedKeys = localStorage.getItem('lore_api_keys');
    if (storedKeys) setKeys(JSON.parse(storedKeys));
    const storedMcp = localStorage.getItem('lore_mcp_servers');
    if (storedMcp) setMcpServers(JSON.parse(storedMcp));
  }, [open]);
  const handleSave = () => {
    localStorage.setItem('lore_api_keys', JSON.stringify(keys));
    localStorage.setItem('lore_mcp_servers', JSON.stringify(mcpServers));
    onOpenChange(false);
  };
  const addMcp = () => {
    if (newMcp.name && newMcp.url) {
      setMcpServers([...mcpServers, { ...newMcp }]);
      setNewMcp({ name: '', url: '' });
    }
  };
  const removeMcp = (index: number) => {
    setMcpServers(mcpServers.filter((_, i) => i !== index));
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-paper border-4 border-ink shadow-sketch-lg p-0 overflow-hidden">
        <div className="bg-ink text-paper p-6 flex items-center gap-3">
          <Settings2 className="size-6" />
          <DialogHeader className="space-y-0">
            <DialogTitle className="serif-heading text-3xl font-bold">Configuration Ledger</DialogTitle>
          </DialogHeader>
        </div>
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-ink/10 pb-2">
              <Key className="size-5 text-accent-purple" />
              <h3 className="serif-heading text-xl font-bold">API Access Tokens</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="handwritten text-xl">Tavily Search Key</Label>
                <Input
                  type="password"
                  value={keys.tavilyKey}
                  onChange={e => setKeys(prev => ({ ...prev, tavilyKey: e.target.value }))}
                  placeholder="tvly-..."
                  className="bg-white border-2 border-ink/20 focus:border-ink h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="handwritten text-xl">Exa Neural Key</Label>
                <Input
                  type="password"
                  value={keys.exaKey}
                  onChange={e => setKeys(prev => ({ ...prev, exaKey: e.target.value }))}
                  placeholder="exa-..."
                  className="bg-white border-2 border-ink/20 focus:border-ink h-11"
                />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-ink/10 pb-2">
              <Server className="size-5 text-accent-purple" />
              <h3 className="serif-heading text-xl font-bold">MCP Dynamic Tools</h3>
            </div>
            <div className="space-y-3">
              {mcpServers.length > 0 ? mcpServers.map((s, i) => (
                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border-2 border-ink/10 shadow-sm group">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate uppercase tracking-tight">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate font-mono">{s.url}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeMcp(i)} 
                    className="text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              )) : (
                <p className="text-center py-4 handwritten text-lg text-ink/30 italic">No external tool servers registered.</p>
              )}
            </div>
            <div className="bg-ink/5 p-4 rounded-2xl space-y-4">
              <p className="handwritten text-lg font-bold">Add New Service</p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-ink/40 pl-1">Identifier</Label>
                  <Input
                    placeholder="e.g. LocalFiles"
                    value={newMcp.name}
                    onChange={e => setNewMcp(p => ({ ...p, name: e.target.value }))}
                    className="bg-white h-10 border-ink/20"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-ink/40 pl-1">SSE Endpoint</Label>
                  <Input
                    placeholder="http://localhost:3000/sse"
                    value={newMcp.url}
                    onChange={e => setNewMcp(p => ({ ...p, url: e.target.value }))}
                    className="bg-white h-10 border-ink/20 font-mono text-xs"
                  />
                </div>
                <Button onClick={addMcp} variant="outline" className="h-10 border-ink bg-white hover:bg-ink hover:text-white transition-colors">
                  <Plus size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="p-6 bg-ink/5 border-t border-ink/10">
          <Button onClick={handleSave} className="bg-ink text-paper hover:bg-ink/90 sketchy-border h-12 px-10 text-lg handwritten font-bold transition-transform active:scale-95">
            Commit Changes to Journal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}