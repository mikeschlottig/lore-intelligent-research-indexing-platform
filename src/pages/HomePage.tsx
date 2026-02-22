import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '@/lib/chat';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppSidebar } from '@/components/app-sidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';
import type { Message, ToolContext, SessionInfo } from '../../worker/types';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
export function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);

  const loadSessions = async () => {
    const res = await chatService.listSessions();
    if (res.success && res.data) {
      setSessions(res.data);
    } else {
      setSessions([]);
    }
  };

  const refreshSessions = () => loadSessions();
  const scrollRef = useRef<HTMLDivElement>(null);
  const getApiKeys = (): ToolContext => {
    const stored = localStorage.getItem('lore_api_keys');
    return stored ? JSON.parse(stored) : {};
  };
  const loadMessages = async () => {
    const res = await chatService.getMessages();
    if (res.success && res.data) {
      setMessages(res.data.messages);
    }
  };
  useEffect(() => {
    loadSessions();
    loadMessages();
    const keys = getApiKeys();
    if (!keys.tavilyKey && !keys.exaKey) {
      setSettingsOpen(true);
    }
  }, []);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;
    const userMsg = input;
    setInput('');
    setIsProcessing(true);
    const keys = getApiKeys();
    const res = await chatService.sendMessage(userMsg, keys);
    if (res.success && res.data) {
      setMessages(res.data.messages);
      refreshSessions();
    }
    setIsProcessing(false);
  };
  const handleSessionSelect = (id: string) => {
    chatService.switchSession(id);
    loadMessages();
    refreshSessions();
  };
  const handleNewSession = async () => {
    const res = await chatService.createSession();
    if (res.success && res.data) {
      chatService.switchSession(res.data.sessionId);
      setMessages([]);
      refreshSessions();
    }
  };
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        sessions={sessions}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <SidebarInset className="bg-paper relative flex flex-col h-screen overflow-hidden">
        <header className="p-4 flex items-center justify-between border-b border-ink/5 bg-paper/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="serif-heading text-xl font-bold flex items-center gap-2">
              <Sparkles size={18} className="text-accent-purple" />
              Lore Research Canvas
            </h1>
          </div>
          <div className="text-xs text-muted-foreground italic handwritten px-4 bg-ink/5 py-1 rounded-full">
            Limited AI capacity applies across all sessions.
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <ChatInterface messages={messages} isProcessing={isProcessing} />
          <div ref={scrollRef} />
        </main>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-paper via-paper/90 to-transparent">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2 items-end">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="What deep truth shall we uncover today?"
                className="w-full bg-white border-2 border-ink rounded-lg p-4 shadow-sketch focus:outline-none min-h-[60px] max-h-[200px] resize-none pr-12 handwritten text-xl"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={isProcessing || !input.trim()}
                className="absolute right-2 bottom-3 bg-ink text-paper rounded-md hover:bg-ink/90 shadow-sm"
              >
                <Send size={18} />
              </Button>
            </div>
          </form>
        </div>
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}