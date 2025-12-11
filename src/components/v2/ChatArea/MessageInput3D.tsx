'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Paperclip, Sparkles, Send } from 'lucide-react'
import { Input } from '@/components/ui/input' // Assuming this exists or using standard input

export function MessageInput3D() {
  return (
    <div className="px-6 pb-6" style={{ perspective: '1000px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: -15 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94] // Easing butter
        }}
        className="relative mx-auto max-w-4xl"
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >
        {/* Camada de sombra 3D (atrás) */}
        <div
          className="absolute inset-0 rounded-2xl bg-verde-900/5 blur-xl"
          style={{
            transform: 'translateZ(-20px) scale(1.02)'
          }}
        />

        {/* Camada de luz superior (efeito de iluminação) */}
        <div
          className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
          style={{
            transform: 'translateZ(2px)'
          }}
        />

        {/* Input principal com profundidade */}
        <div
          className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-verde-300 bg-gradient-to-b from-white to-verde-50/30 px-5 py-4 backdrop-blur-sm"
          style={{
            transform: 'translateZ(0)',
            boxShadow: `
              0 1px 2px rgba(45, 90, 69, 0.05),
              0 4px 8px rgba(45, 90, 69, 0.08),
              0 12px 24px rgba(45, 90, 69, 0.12),
              inset 0 -1px 2px rgba(45, 90, 69, 0.05)
            `
          }}
        >
          {/* Shimmer effect (luz passando) */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-200%', '200%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 5
            }}
            style={{
              transform: 'skewX(-20deg)'
            }}
          />

          {/* Input field */}
          <Input
            placeholder="Descreva sua análise ou consulte sobre CPR..."
            className="relative z-10 h-auto flex-1 border-0 bg-transparent p-0 text-base text-verde-950 shadow-none placeholder:text-verde-500 focus-visible:outline-none focus-visible:ring-0"
          />

          {/* Botões com hover 3D */}
          <div className="relative z-10 flex flex-shrink-0 items-center gap-2">
            <motion.button
              whileHover={{
                scale: 1.05,
                rotateZ: 2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg p-2.5 text-verde-700 transition-colors hover:bg-verde-50 hover:text-verde-900"
              style={{
                transformStyle: 'preserve-3d'
              }}
            >
              <Paperclip className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.05,
                rotateZ: -2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg p-2.5 text-verde-700 transition-colors hover:bg-verde-50 hover:text-verde-900"
            >
              <Sparkles className="h-5 w-5" />
            </motion.button>

            {/* Botão de envio com profundidade extra */}
            <motion.button
              whileHover={{
                scale: 1.08,
                y: -2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95, y: 0 }}
              className="relative rounded-lg bg-gradient-to-br from-verde-900 to-verde-800 p-2.5 text-white hover:from-verde-800 hover:to-verde-900"
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: `
                  0 2px 4px rgba(45, 90, 69, 0.2),
                  0 4px 8px rgba(45, 90, 69, 0.15),
                  inset 0 -2px 4px rgba(0, 0, 0, 0.1),
                  inset 0 1px 1px rgba(255, 255, 255, 0.2)
                `
              }}
            >
              <Send className="h-5 w-5" />

              {/* Brilho interno */}
              <div
                className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white/10"
                style={{
                  transform: 'translateZ(1px)'
                }}
              />
            </motion.button>
          </div>

          {/* Border glow no focus */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(90, 149, 119, 0.3), transparent)',
              filter: 'blur(8px)',
              transform: 'translateZ(-1px)'
            }}
          />
        </div>

        {/* Reflexo inferior (como se estivesse em superfície) */}
        <div
          className="absolute -bottom-8 left-0 right-0 h-8 rounded-2xl bg-gradient-to-b from-verde-900/5 to-transparent blur-md"
          style={{
            transform: 'translateZ(-30px) scaleY(0.3)',
            transformOrigin: 'top'
          }}
        />
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-4 text-center text-xs text-verde-600"
      >
        Rodrigues AI pode cometer erros. Verifique informações importantes.
      </motion.p>
    </div>
  )
}
