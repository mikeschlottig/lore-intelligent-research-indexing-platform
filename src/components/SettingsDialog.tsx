import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Server } from 'lucide-react';
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
      <DialogContent className="max-w-2xl bg-paper border-2 border-ink shadow-sketch max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="serif-heading text-2xl">Lore Settings</DialogTitle>
          <DialogDescription>Configure research providers and dynamic tools.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="handwritten text-lg">Tavily API Key</Label>
              <Input
                type="password"
                value={keys.tavilyKey}
                onChange={e => setKeys(prev => ({ ...prev, tavilyKey: e.target.value }))}
                placeholder="tvly-..."
                className="bg-white border-ink/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="handwritten text-lg">Exa API Key</Label>
              <Input
                type="password"
                value={keys.exaKey}
                onChange={e => setKeys(prev => ({ ...prev, exaKey: e.target.value }))}
                placeholder="exa-..."
                className="bg-white border-ink/20"
              />
            </div>
          </div>
          <div className="space-y-4 border-t border-ink/5 pt-4">
            <div className="flex items-center gap-2">
              <Server className="size-5 text-accent-purple" />
              <Label className="handwritten text-xl">MCP SSE Servers</Label>
            </div>
            <div className="space-y-2">
              {mcpServers.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-white p-2 rounded border border-ink/10 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{s.url}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeMcp(i)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
              <div className="md:col-span-2">
                <Input 
                  placeholder="Server Name" 
                  value={newMcp.name} 
                  onChange={e => setNewMcp(p => ({ ...p, name: e.target.value }))}
                  className="bg-white text-xs h-8"
                />
              </div>
              <div className="md:col-span-2">
                <Input 
                  placeholder="SSE URL (http://...)" 
                  value={newMcp.url} 
                  onChange={e => setNewMcp(p => ({ ...p, url: e.target.value }))}
                  className="bg-white text-xs h-8"
                />
              </div>
              <Button onClick={addMcp} variant="outline" size="sm" className="h-8 border-ink">
                <Plus size={14} className="mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="bg-ink text-paper hover:bg-ink/90 sketchy-border h-10 px-8">
            Commit Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}