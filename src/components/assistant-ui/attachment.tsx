'use client'

import type { FC } from 'react'
import {
  ComposerPrimitive,
  AttachmentPrimitive,
  MessagePrimitive
} from '@assistant-ui/react'
import { PaperclipIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TooltipIconButton } from './tooltip-icon-button'

/* ------------------------------------------------------------------ */
/*  Composer: botão de adicionar anexo                                 */
/* ------------------------------------------------------------------ */

export const ComposerAddAttachment: FC = () => {
  return (
    <ComposerPrimitive.AddAttachment asChild>
      <TooltipIconButton
        tooltip="Anexar arquivo"
        variant="ghost"
        className="aui-composer-attach size-8 rounded-full"
      >
        <PaperclipIcon className="size-4" />
      </TooltipIconButton>
    </ComposerPrimitive.AddAttachment>
  )
}

/* ------------------------------------------------------------------ */
/*  Composer: lista de anexos pendentes                                */
/* ------------------------------------------------------------------ */

const ComposerAttachmentItem: FC = () => {
  return (
    <AttachmentPrimitive.Root
      className={cn(
        'aui-attachment-root relative flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2'
      )}
    >
      <div className="flex-1 truncate text-sm">
        <AttachmentPrimitive.Name />
      </div>
      <AttachmentPrimitive.Remove asChild>
        <button
          type="button"
          className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-input hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Remover"
        >
          <XIcon className="size-3" />
        </button>
      </AttachmentPrimitive.Remove>
    </AttachmentPrimitive.Root>
  )
}

export const ComposerAttachments: FC = () => {
  return (
    <div className="flex flex-wrap gap-2 px-3 pb-2 empty:hidden">
      <ComposerPrimitive.Attachments
        components={{ Attachment: ComposerAttachmentItem }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  User message: anexos já enviados                                   */
/* ------------------------------------------------------------------ */

const UserMessageAttachmentItem: FC = () => {
  return (
    <AttachmentPrimitive.Root className="aui-attachment-root flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
      <div className="flex-1 truncate text-sm">
        <AttachmentPrimitive.Name />
      </div>
    </AttachmentPrimitive.Root>
  )
}

export const UserMessageAttachments: FC = () => {
  return (
    <div className="col-span-full flex flex-wrap gap-2 empty:hidden">
      <MessagePrimitive.Attachments
        components={{ Attachment: UserMessageAttachmentItem }}
      />
    </div>
  )
}
