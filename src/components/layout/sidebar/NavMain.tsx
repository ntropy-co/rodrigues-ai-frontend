'use client'

import Link from 'next/link'
import { Search, Home, ShieldCheck, HelpCircle, SquarePen } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

const NAV_ITEMS = [
  { title: 'Busca', icon: Search, url: '#', isSearch: true },
  { title: 'Nova Conversa', icon: SquarePen, url: '/chat', isAction: true },
  { title: 'Home', icon: Home, url: '/chat' },
  { title: 'Compliance', icon: ShieldCheck, url: '/compliance' },
  { title: 'Suporte', icon: HelpCircle, url: '/contact' }
]

interface NavMainProps {
  onNewConversation?: () => void
}

export function NavMain({ onNewConversation }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.isAction ? (
                <SidebarMenuButton
                  onClick={onNewConversation}
                  className="font-medium"
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
