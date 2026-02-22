'use client'

import * as React from 'react'
import { Hexagon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar'
import { NavMain } from './sidebar/NavMain'
import { NavConversations } from './sidebar/NavConversations'
import { NavUser } from './sidebar/NavUser'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeConversationId?: string | null
  onSelectConversation?: (id: string) => void
  onNewConversation?: () => void
}

export function AppSidebar({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Header: Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/chat">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-verity-900 text-white">
                  <Hexagon className="size-4" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-display font-semibold">
                    Verity Agro
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Crédito & CPR
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <NavMain onNewConversation={onNewConversation} />
        <NavConversations
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
        />
      </SidebarContent>

      {/* Footer: User */}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
