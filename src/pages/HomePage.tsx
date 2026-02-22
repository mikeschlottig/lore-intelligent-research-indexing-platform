import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '@/lib/chat';
import { AppSidebar } from '@/components/app-sidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { ResearchIndex } from '@/components/ResearchIndex';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Send, Sparkles, BookOpen, Info } from 'lucide-react';
import type { Message, ToolContext, SessionInfo, IndexedItem, MCPServer } from '../../worker/types';
export function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [index, setIndex] = useState<IndexedItem[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [activeTab, setActiveTab] = useState('canvas');
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadSessions = async () => {
    const res = await chatService.listSessions();
    if (res.success && res.data) setSessions(res.data);
  };
  const loadMessages = async () => {
    const res = await chatService.getMessages();
    if (res.success && res.data) {
      setMessages(res.data.messages);
      setIndex(res.data.index || []);
    }
  };
  const getToolData = () => {
    const keys = localStorage.getItem('lore_api_keys');
    const mcp = localStorage.getItem('lore_mcp_servers');
    return {
      apiKeys: (keys ? JSON.parse(keys) : {}) as ToolContext,
      mcpServers: (mcp ? JSON.parse(mcp) : []) as MCPServer[]
    };
  };
  useEffect(() => {
    loadSessions();
    loadMessages();
    const tools = getToolData();
    if (!tools.apiKeys.tavilyKey && !tools.apiKeys.exaKey) {
      setSettingsOpen(true);
    }
  }, []);
  // Reliability: Improved scroll dependency
  useEffect(() => {
    if (activeTab === 'canvas' && (messages.length > 0 || isProcessing)) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isProcessing, activeTab]);
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;
    const userMsg = input;
    setInput('');
    setIsProcessing(true);
    const { apiKeys, mcpServers } = getToolData();
    const res = await chatService.sendMessage(userMsg, apiKeys, mcpServers);
    if (res.success && res.data) {
      setMessages(res.data.messages);
      setIndex(res.data.index || []);
      loadSessions();
    }
    setIsProcessing(false);
  };
  const handleSessionSelect = (id: string) => {
    chatService.switchSession(id);
    loadMessages();
  };
  const handleNewSession = async () => {
    const res = await chatService.createSession();
    if (res.success && res.data) {
      chatService.switchSession(res.data.sessionId);
      setMessages([]);
      setIndex([]);
      loadSessions();
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full w-full">
          <header className="p-4 flex items-center justify-between border-b border-ink/5 bg-paper/80 backdrop-blur-sm z-10 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <TabsList className="bg-ink/5 border border-ink/10 h-9 p-1">
                <TabsTrigger value="canvas" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 text-xs font-bold">
                  <Sparkles size={14} className="mr-2" /> Canvas
                </TabsTrigger>
                <TabsTrigger value="index" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 text-xs font-bold gap-2">
                  <BookOpen size={14} /> Journal
                  {index.length > 0 && <Badge className="h-4 min-w-4 px-1 text-[8px] bg-accent-purple">{index.length}</Badge>}
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground italic handwritten bg-ink/5 px-4 py-1.5 rounded-full">
              <Info size={12} />
              AI limit: use wisely.
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 min-h-full">
              <TabsContent value="canvas" className="m-0 focus-visible:outline-none">
                <ChatInterface messages={messages} isProcessing={isProcessing} />
                <div ref={scrollRef} className="h-24" />
              </TabsContent>
              <TabsContent value="index" className="m-0 focus-visible:outline-none">
                <ResearchIndex items={index} />
              </TabsContent>
            </div>
          </main>
          {activeTab === 'canvas' && (
            <div className="shrink-0 p-6 bg-gradient-to-t from-paper via-paper/95 to-transparent z-20">
              <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2 items-end">
                <div className="relative flex-1">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Inquire the archives..."
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
                    className="absolute right-2 bottom-3 bg-ink text-paper rounded-md hover:bg-ink/90 active:scale-95 transition-all"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Tabs>
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}