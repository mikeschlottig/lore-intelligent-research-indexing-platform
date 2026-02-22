import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
export function SettingsDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const [keys, setKeys] = useState({ tavilyKey: '', exaKey: '' });
  useEffect(() => {
    const stored = localStorage.getItem('lore_api_keys');
    if (stored) setKeys(JSON.parse(stored));
  }, []);
  const handleSave = () => {
    localStorage.setItem('lore_api_keys', JSON.stringify(keys));
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper border-2 border-ink shadow-sketch">
        <DialogHeader>
          <DialogTitle className="serif-heading text-2xl">Lore Settings</DialogTitle>
          <DialogDescription>Configure your research providers.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
        <DialogFooter>
          <Button onClick={handleSave} className="bg-ink text-paper hover:bg-ink/90">Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}