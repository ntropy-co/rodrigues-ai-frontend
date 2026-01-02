import { motion } from 'framer-motion'
import { easings } from '@/lib/animations/easings'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function TypingIndicator() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className="flex w-full justify-start py-2"
      role="status"
      aria-live="polite"
      aria-label="O assistente está digitando"
    >
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border-2 border-verity-100 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(45,90,69,0.08)]">
        {[0, 1, 2].map((dot) => (
          <motion.div
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-verity-600"
            animate={
              prefersReducedMotion
                ? { opacity: 0.7 }
                : { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    duration: 1.2,
                    repeat: Infinity,
                    delay: dot * 0.15,
                    ease: easings.float
                  }
            }
            style={{
              willChange: prefersReducedMotion ? 'auto' : 'transform, opacity'
            }}
          />
        ))}
      </div>
    </div>
  )
}
