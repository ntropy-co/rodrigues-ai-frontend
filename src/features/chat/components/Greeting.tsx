import { motion } from 'framer-motion'
import { useGreeting } from '@/hooks/useGreeting'
import { useAuth } from '@/contexts/AuthContext'

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
}

/**
 * Noble presentation greeting component.
 * Uses time-based dynamic greeting with sophisticated typography.
 * Personalizes with user's first name when available.
 */
export function Greeting() {
  const { greeting, subtext } = useGreeting()
  const { user } = useAuth()

  // Extract first name from full name or email
  const firstName =
    user?.name?.split(' ')[0] || user?.email?.split('@')[0] || ''
  const personalizedGreeting = firstName
    ? `${greeting}, ${firstName}`
    : greeting

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col items-center justify-center px-2 py-3 text-center md:px-0 md:py-4"
    >
      <motion.h1
        variants={itemVariants}
        className="mb-1 font-display text-2xl font-semibold tracking-tight text-verity-950 md:text-3xl"
      >
        {personalizedGreeting}
      </motion.h1>
      <motion.p
        variants={itemVariants}
        className="max-w-lg text-sm font-light text-verity-600 md:text-base"
      >
        {subtext}
      </motion.p>
    </motion.div>
  )
}
