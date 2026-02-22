import React from "react";
import { Book, Plus, Settings, History, PenTool } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { SessionInfo } from "../../worker/types";
interface Props {
  sessions: SessionInfo[];
  onSessionSelect: (id: string) => void;
  onNewSession: () => void;
  onOpenSettings: () => void;
}
export function AppSidebar({ sessions, onSessionSelect, onNewSession, onOpenSettings }: Props) {
  return (
    <Sidebar className="border-r border-ink/10 bg-paper relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      <SidebarHeader className="p-6 border-b border-ink/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-accent-purple p-2 rounded-lg shadow-sketch rotate-[-2deg]">
            <Book className="text-white size-6" />
          </div>
          <span className="serif-heading text-2xl font-black tracking-tighter text-ink">Lore</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="relative z-10 px-2 pt-4">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={onNewSession} 
                className="handwritten text-xl h-12 hover:bg-accent-purple/5 group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <PenTool className="size-5 text-accent-purple group-hover:rotate-12 transition-transform" />
                  <span>New Inquiry</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="handwritten text-lg px-4 opacity-40 uppercase tracking-widest font-bold">Past Records</SidebarGroupLabel>
          <SidebarMenu className="mt-2 space-y-1">
            {sessions.length > 0 ? sessions.map(s => (
              <SidebarMenuItem key={s.id}>
                <SidebarMenuButton 
                  onClick={() => onSessionSelect(s.id)} 
                  className="group relative h-10 px-4 rounded-none border-l-4 border-transparent hover:border-accent-purple hover:bg-accent-purple/5 transition-all"
                >
                  <div className="flex items-center gap-3 w-full">
                    <History className="size-4 shrink-0 opacity-30 group-hover:opacity-100 transition-opacity" />
                    <span className="truncate serif-heading font-medium text-ink/70 group-hover:text-ink">{s.title}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )) : (
              <div className="px-4 py-2 handwritten text-ink/30 italic text-sm">
                No history yet...
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-ink/5 relative z-10 bg-paper/50 backdrop-blur-sm">
        <SidebarMenuButton 
          onClick={onOpenSettings} 
          className="handwritten text-xl h-12 hover:bg-ink/5 transition-colors"
        >
          <Settings className="mr-3 size-5 opacity-50" />
          <span>Ledger Settings</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}