import React from "react";
import { Book, Plus, Settings, History } from "lucide-react";
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
import { chatService } from "@/lib/chat";
import type { SessionInfo } from "../../worker/types";

interface Props {
  sessions: SessionInfo[];
  onSessionSelect: (id: string) => void;
  onNewSession: () => void;
  onOpenSettings: () => void;
}
export function AppSidebar({ sessions, onSessionSelect, onNewSession, onOpenSettings }: Props) {
  return (
    <Sidebar className="border-r border-ink/10 bg-paper">
      <SidebarHeader className="p-4 border-b border-ink/5">
        <div className="flex items-center gap-2">
          <Book className="text-accent-purple" />
          <span className="serif-heading text-xl font-bold tracking-tight">The Journal</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onNewSession} className="handwritten text-lg hover:bg-ink/5">
                <Plus className="mr-2" /> New Inquiry
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="handwritten text-md opacity-60">Past Records</SidebarGroupLabel>
          <SidebarMenu>
            {sessions.map(s => (
              <SidebarMenuItem key={s.id}>
                <SidebarMenuButton onClick={() => onSessionSelect(s.id)} className="truncate">
                  <History className="size-4 opacity-50" />
                  <span className="truncate">{s.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-ink/5">
        <SidebarMenuButton onClick={onOpenSettings} className="handwritten text-lg">
          <Settings className="mr-2" /> Ledger Settings
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}