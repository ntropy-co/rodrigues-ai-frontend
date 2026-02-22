'use client'

import { useState, useCallback, createContext, useContext } from 'react'
import {
  ComposerAttachments,
  UserMessageAttachments
} from '@/components/assistant-ui/attachment'
import { MarkdownText } from '@/components/assistant-ui/markdown-text'
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ActionBarPrimitive,
  AssistantIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  AssistantRuntimeProvider
} from '@assistant-ui/react'
import {
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CopyIcon,
  PaperclipIcon,
  PencilIcon,
  RefreshCwIcon,
  ThumbsUpIcon,
  ThumbsDownIcon
} from 'lucide-react'
import type { FC } from 'react'
import { useVerityRuntime } from '../../lib/verity-runtime'
import { Greeting } from '../Greeting'
import { FileUploadModal } from '../FileUpload/FileUploadModal'
import { useAuth } from '@/contexts/AuthContext'

/* AI Elements */
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion'

/* ================================================================== */
/*  File Upload Context                                                */
/* ================================================================== */

interface FileUploadContextValue {
  openUploadModal: () => void
  pendingFiles: File[]
}

const FileUploadContext = createContext<FileUploadContextValue>({
  openUploadModal: () => {},
  pendingFiles: []
})

/* ================================================================== */
/*  VERITY THREAD — Main exported component                           */
/* ================================================================== */

interface VerityThreadProps {
  onSendMessage: (message: string, files?: File[]) => Promise<void> | void
}

export const VerityThread: FC<VerityThreadProps> = ({ onSendMessage }) => {
  const runtime = useVerityRuntime({ onSendMessage })
  const { user } = useAuth()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const openUploadModal = useCallback(() => setIsUploadOpen(true), [])

  const handleFilesSelected = useCallback((files: File[]) => {
    setPendingFiles((prev) => [...prev, ...files])
  }, [])

  return (
    <FileUploadContext.Provider value={{ openUploadModal, pendingFiles }}>
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread />
      </AssistantRuntimeProvider>

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFilesSelected={handleFilesSelected}
        userId={user?.id ?? 'anonymous'}
        mode="attach"
      />
    </FileUploadContext.Provider>
  )
}

/* ================================================================== */
/*  Thread Layout                                                      */
/* ================================================================== */

const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="bg-[#f9f8f4] dark:bg-[#2b2a27]">
      <ThreadPrimitive.Viewport className="flex h-[100dvh] flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pb-32 pt-8">
        <ThreadPrimitive.Empty>
          <ThreadWelcome />
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            EditComposer,
            AssistantMessage
          }}
        />

        <div className="min-h-8 flex-grow" />
      </ThreadPrimitive.Viewport>

      <div className="absolute inset-x-0 bottom-0 flex w-full flex-col items-center justify-center bg-gradient-to-t from-[#f9f8f4] via-[#f9f8f4] to-transparent px-4 pb-4 pt-6 dark:from-[#2b2a27] dark:via-[#2b2a27]">
        <Composer />
      </div>
    </ThreadPrimitive.Root>
  )
}

/* ================================================================== */
/*  Welcome Screen                                                     */
/* ================================================================== */

const WELCOME_SUGGESTIONS = [
  {
    label: 'Analisar CPR',
    prompt:
      'Preciso analisar uma CPR Física. Quais são os critérios de avaliação e documentação necessária?'
  },
  {
    label: 'Verificar Compliance',
    prompt:
      'Quais as principais normas do BACEN para operações de crédito rural? Como garantir compliance?'
  },
  {
    label: 'Calcular Risco',
    prompt:
      'Como fazer uma análise completa de risco para crédito rural? Quais variáveis considerar?'
  },
  {
    label: 'Estratégias de Hedge',
    prompt: 'Como usar o mercado futuro para fazer hedge em operações de CPR?'
  }
]

const ThreadWelcome: FC = () => {
  return (
    <div className="mt-10 flex w-full max-w-3xl flex-grow flex-col">
      <div className="flex w-full flex-grow flex-col items-center justify-center">
        <div className="flex size-full flex-col justify-center px-4">
          <Greeting />
        </div>
      </div>

      {/* AI Elements Suggestions */}
      <div className="mb-6 w-full px-4">
        <Suggestions className="justify-center gap-3">
          {WELCOME_SUGGESTIONS.map((s) => (
            <Suggestion
              key={s.label}
              suggestion={s.prompt}
              className="rounded-full border-[#00000020] bg-white/80 text-[#1a1a18] hover:bg-black/5 dark:border-[#6c6a6040] dark:bg-[#393937]/50 dark:text-[#eee] dark:hover:bg-[#393937]"
            >
              {s.label}
            </Suggestion>
          ))}
        </Suggestions>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Composer                                                           */
/* ================================================================== */

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="flex w-full max-w-3xl flex-col items-end rounded-2xl border border-[#00000020] bg-[#f5f5f0] p-0.5 shadow-sm transition-shadow duration-200 focus-within:shadow-md hover:border-[#00000040] hover:shadow-md dark:border-[#6c6a6040] dark:bg-[#393937] dark:hover:border-[#6c6a6080]">
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center p-1 px-2 pb-0">
          <div className="wrap-break-word max-h-96 w-full overflow-y-auto">
            <ComposerPrimitive.Input
              placeholder="Como posso ajudar hoje?"
              className="block min-h-6 w-full resize-none bg-transparent px-3 py-3 font-sans text-[15px] text-[#1a1a18] placeholder:text-[#8a8985] focus:outline-none dark:text-[#eee] dark:placeholder:text-[#b8b5a9]"
              autoFocus
            />
          </div>
        </div>
        <ComposerAction />
      </div>

      <AssistantIf condition={(s) => s.composer.attachments.length > 0}>
        <div className="w-full overflow-hidden rounded-b-2xl">
          <div className="overflow-x-auto rounded-b-2xl border-t border-[#00000015] bg-[#f5f5f0] p-3.5 dark:border-[#6c6a6040] dark:bg-[#393937]">
            <div className="flex flex-row gap-3">
              <ComposerAttachments />
            </div>
          </div>
        </div>
      </AssistantIf>
    </ComposerPrimitive.Root>
  )
}

const ComposerAction: FC = () => {
  const { openUploadModal } = useContext(FileUploadContext)

  return (
    <div className="flex w-full items-center justify-between px-2 pb-2">
      <div className="flex items-center gap-2">
        <TooltipIconButton
          tooltip="Anexar arquivo"
          variant="ghost"
          onClick={openUploadModal}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b6a68] transition-colors hover:bg-black/5 hover:text-[#1a1a18] dark:text-[#9a9893] dark:hover:bg-white/5 dark:hover:text-[#eee]"
        >
          <PaperclipIcon width={20} height={20} />
        </TooltipIconButton>

        {/* Model Selector mock (Claude style) */}
        <button
          type="button"
          className="flex h-8 items-center justify-center gap-1 whitespace-nowrap rounded-md px-2 text-xs text-[#6b6a68] transition-colors hover:bg-black/5 hover:text-[#1a1a18] dark:text-[#9a9893] dark:hover:bg-white/5 dark:hover:text-[#eee]"
        >
          <span className="font-serif text-[14px]">Verity AI</span>
          <ChevronDownIcon width={16} height={16} className="opacity-75" />
        </button>
      </div>

      <ComposerPrimitive.Send className="flex h-8 w-8 items-center justify-center rounded-lg bg-verity-700 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#ddd9ce] disabled:text-[#f9f8f4] dark:bg-verity-600 dark:disabled:bg-[#393937] dark:disabled:text-[#2b2a27]">
        <ArrowUpIcon width={17} height={17} />
      </ComposerPrimitive.Send>
    </div>
  )
}

/* ================================================================== */
/*  Message Error                                                      */
/* ================================================================== */

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  )
}

/* ================================================================== */
/*  Assistant Message                                                  */
/* ================================================================== */

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="group relative mx-auto mb-1 mt-1 block w-full max-w-3xl"
      data-role="assistant"
    >
      <div className="relative mb-12 font-serif">
        <div className="relative leading-[1.65rem]">
          <div className="grid grid-cols-1 gap-2.5">
            <div className="wrap-break-word whitespace-normal pl-2 pr-8 font-serif text-[#1a1a18] dark:text-[#eee]">
              <MessagePrimitive.Content
                components={{
                  Text: MarkdownText
                }}
              />
              <MessageError />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <AssistantActionBar />
        </div>
      </div>
    </MessagePrimitive.Root>
  )
}

/* ================================================================== */
/*  Assistant Action Bar                                               */
/* ================================================================== */

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="pointer-events-auto flex w-full translate-y-full flex-col items-end px-2 pt-2 transition"
    >
      <div className="flex items-center text-[#6b6a68] dark:text-[#9a9893]">
        <ActionBarPrimitive.Copy asChild>
          <TooltipIconButton
            tooltip="Copiar"
            className="ease-[cubic-bezier(0.165,0.85,0.45,1)] flex h-8 w-8 items-center justify-center rounded-md transition duration-300 hover:bg-transparent active:scale-95"
          >
            <CopyIcon width={20} height={20} />
          </TooltipIconButton>
        </ActionBarPrimitive.Copy>

        {/* Feedback buttons */}
        <TooltipIconButton
          tooltip="Útil"
          className="ease-[cubic-bezier(0.165,0.85,0.45,1)] flex h-8 w-8 items-center justify-center rounded-md transition duration-300 hover:bg-transparent active:scale-95"
        >
          <ThumbsUpIcon width={16} height={16} />
        </TooltipIconButton>

        <TooltipIconButton
          tooltip="Não útil"
          className="ease-[cubic-bezier(0.165,0.85,0.45,1)] flex h-8 w-8 items-center justify-center rounded-md transition duration-300 hover:bg-transparent active:scale-95"
        >
          <ThumbsDownIcon width={16} height={16} />
        </TooltipIconButton>

        <ActionBarPrimitive.Reload asChild>
          <TooltipIconButton
            tooltip="Regenerar"
            className="ease-[cubic-bezier(0.165,0.85,0.45,1)] flex h-8 w-8 items-center justify-center rounded-md transition duration-300 hover:bg-transparent active:scale-95"
          >
            <RefreshCwIcon width={20} height={20} />
          </TooltipIconButton>
        </ActionBarPrimitive.Reload>
      </div>

      <AssistantIf condition={(s) => s.message.isLast}>
        <p className="mt-2 w-full text-right text-[0.65rem] leading-[0.85rem] text-[#8a8985] opacity-90 dark:text-[#b8b5a9] sm:text-[0.75rem]">
          A IA pode cometer erros. Verifique as respostas.
        </p>
      </AssistantIf>
    </ActionBarPrimitive.Root>
  )
}

/* ================================================================== */
/*  User Message                                                       */
/* ================================================================== */

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="group relative mx-auto mb-1 mt-1 block w-full max-w-3xl"
      data-role="user"
    >
      <div className="group/user wrap-break-word relative inline-flex max-w-[75ch] flex-col gap-2 rounded-xl bg-[#DDD9CE] py-2.5 pl-2.5 pr-6 text-[#1a1a18] transition-all dark:bg-[#393937] dark:text-[#eee]">
        <div className="relative flex flex-row gap-2">
          <div className="shrink-0 self-start transition-all duration-300">
            <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full bg-[#1a1a18] text-[12px] font-bold text-white dark:bg-[#eee] dark:text-[#2b2a27]">
              U
            </div>
          </div>
          <div className="flex-1">
            <UserMessageAttachments />
            <div className="relative grid grid-cols-1 gap-2 py-0.5">
              <div className="wrap-break-word whitespace-pre-wrap font-sans text-[15px] leading-relaxed">
                <MessagePrimitive.Content />
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 right-2">
          <UserActionBar />
        </div>
      </div>
    </MessagePrimitive.Root>
  )
}

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      autohide="not-last"
      className="pointer-events-auto min-w-max translate-x-1 translate-y-4 rounded-lg border-[0.5px] border-[#00000015] bg-white/80 p-0.5 opacity-0 shadow-sm backdrop-blur-sm transition group-hover/user:translate-x-0.5 group-hover/user:opacity-100 dark:border-[#6c6a6040] dark:bg-[#1f1e1b]/80"
    >
      <div className="flex items-center text-[#6b6a68] dark:text-[#9a9893]">
        <BranchPicker className="mr-1" />
        <ActionBarPrimitive.Edit asChild>
          <TooltipIconButton
            tooltip="Editar"
            className="ease-[cubic-bezier(0.165,0.85,0.45,1)] flex h-8 w-8 items-center justify-center rounded-md transition duration-300 hover:bg-transparent active:scale-95"
          >
            <PencilIcon width={20} height={20} />
          </TooltipIconButton>
        </ActionBarPrimitive.Edit>
      </div>
    </ActionBarPrimitive.Root>
  )
}

/* ================================================================== */
/*  Edit Composer                                                      */
/* ================================================================== */

const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root className="group relative mx-auto mb-1 mt-1 block w-full max-w-3xl">
      <ComposerPrimitive.Root className="group/user wrap-break-word relative inline-flex w-full max-w-[75ch] flex-col gap-2 rounded-xl bg-[#DDD9CE] py-2.5 pl-2.5 pr-6 text-[#1a1a18] transition-all dark:bg-[#393937] dark:text-[#eee]">
        <div className="relative flex flex-row gap-2">
          <div className="shrink-0 self-start transition-all duration-300">
            <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full bg-[#1a1a18] text-[12px] font-bold text-white dark:bg-[#eee] dark:text-[#2b2a27]">
              U
            </div>
          </div>
          <div className="flex-1">
            <UserMessageAttachments />
            <div className="relative grid grid-cols-1 gap-2 py-0.5">
              <div className="wrap-break-word whitespace-pre-wrap">
                <ComposerPrimitive.Input
                  className="min-h-14 w-full resize-none bg-transparent p-0 font-sans text-[15px] text-[#1a1a18] outline-none dark:text-[#eee]"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pb-2 pr-2">
          <ComposerPrimitive.Cancel asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#6b6a68] hover:bg-black/5 hover:text-[#1a1a18] dark:text-[#9a9893] dark:hover:bg-white/5 dark:hover:text-[#eee]"
            >
              Cancelar
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button
              size="sm"
              className="bg-verity-700 text-white hover:opacity-90 dark:bg-verity-600"
            >
              Atualizar
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  )
}

/* ================================================================== */
/*  Branch Picker                                                      */
/* ================================================================== */

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        'aui-branch-picker-root -ml-2 mr-2 inline-flex items-center text-xs text-muted-foreground',
        className
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Anterior">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>

      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>

      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Próximo">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  )
}
