'use client'
import Sidebar from '@/components/playground/Sidebar/Sidebar'
import { ChatArea } from '@/components/playground/ChatArea'
import { Suspense } from 'react'

export default function OldHome() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex h-screen w-screen overflow-hidden bg-background/80">
        <Sidebar />
        <ChatArea />
      </div>
    </Suspense>
  )
}
