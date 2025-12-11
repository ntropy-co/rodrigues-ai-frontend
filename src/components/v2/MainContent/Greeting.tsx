import { motion } from 'framer-motion'
import { useGreeting } from '@/hooks/useGreeting'

/**
 * Noble presentation greeting component.
 * Uses time-based dynamic greeting with sophisticated typography.
 */
export function Greeting() {
  const { greeting, subtext } = useGreeting()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex w-full flex-col items-start justify-center px-2 py-6 md:px-0 md:py-10"
    >
      <h1 className="mb-3 font-display text-4xl font-semibold tracking-tight text-verde-950 md:text-5xl lg:text-6xl">
        {greeting}
      </h1>
      <p className="max-w-xl text-lg font-light text-verde-700 md:text-xl">
        {subtext}
      </p>
    </motion.div>
  )
}
