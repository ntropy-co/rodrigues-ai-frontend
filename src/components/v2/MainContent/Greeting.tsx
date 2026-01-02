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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20
      }}
      className="flex w-full flex-col items-center justify-center px-2 py-3 text-center md:px-0 md:py-4"
    >
      <h1 className="mb-1 font-display text-2xl font-semibold tracking-tight text-verity-950 md:text-3xl">
        {greeting}
      </h1>
      <p className="max-w-lg text-sm font-light text-verity-600 md:text-base">
        {subtext}
      </p>
    </motion.div>
  )
}
