/**
 * Animation Variants Library
 * Reusable Framer Motion variants for Verity Agro
 */

import type { Variants } from 'framer-motion'
import { easings, durations, springs, staggerDelays } from './easings'

// ============================================================================
// FADE VARIANTS
// ============================================================================

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.smooth
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: easings.smooth
    }
  }
}

// ============================================================================
// SLIDE VARIANTS (all directions)
// ============================================================================

export const slideVariants = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: durations.slow,
        ease: easings.butter
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: durations.fast,
        ease: easings.smooth
      }
    }
  } as Variants,

  down: {
    hidden: { opacity: 0, y: -40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: durations.slow,
        ease: easings.butter
      }
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: durations.fast,
        ease: easings.smooth
      }
    }
  } as Variants,

  left: {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: durations.slow,
        ease: easings.silk
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: durations.fast,
        ease: easings.smooth
      }
    }
  } as Variants,

  right: {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: durations.slow,
        ease: easings.silk
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: durations.fast,
        ease: easings.smooth
      }
    }
  } as Variants
}

// ============================================================================
// SCALE VARIANTS
// ============================================================================

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easings.butter
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: durations.fast,
      ease: easings.smooth
    }
  }
}

export const springScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.softBounce
  }
}

// ============================================================================
// BLUR VARIANTS (Premium effect)
// ============================================================================

export const blurVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: durations.slow,
      ease: easings.smooth
    }
  }
}

// ============================================================================
// LUXURY VARIANTS (Combined: fade + slide + scale + blur)
// ============================================================================

export const luxuryVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
    filter: 'blur(8px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: durations.verySlow,
      ease: easings.butter
    }
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.98,
    filter: 'blur(4px)',
    transition: {
      duration: durations.fast,
      ease: easings.smooth
    }
  }
}

// ============================================================================
// STAGGER CONTAINERS
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelays.normal,
      delayChildren: 0.2,
      when: 'beforeChildren'
    }
  }
}

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelays.fast,
      delayChildren: 0.1,
      when: 'beforeChildren'
    }
  }
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.silk
    }
  }
}

// ============================================================================
// INTERACTIVE STATES (Hover, Tap)
// ============================================================================

export const hoverScale = {
  scale: 1.02,
  transition: {
    duration: durations.fast,
    ease: easings.smooth
  }
}

export const hoverLift = {
  y: -4,
  transition: {
    duration: durations.normal,
    ease: easings.butter
  }
}

export const hoverGlow = {
  boxShadow: '0 10px 40px -10px rgba(45, 90, 69, 0.3)',
  transition: {
    duration: durations.fast,
    ease: easings.smooth
  }
}

export const tapScale = {
  scale: 0.97,
  transition: {
    duration: durations.instant,
    ease: easings.smooth
  }
}

export const tapPress = {
  scale: 0.98,
  y: 1,
  transition: {
    duration: durations.instant,
    ease: easings.smooth
  }
}

// ============================================================================
// CONTINUOUS ANIMATIONS
// ============================================================================

export const floatingVariants: Variants = {
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: easings.silk
    }
  }
}

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.03, 1],
    opacity: [1, 0.9, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: easings.smooth
    }
  }
}

export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.butter
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: durations.fast,
      ease: easings.smooth
    }
  }
}

// ============================================================================
// LOGIN SEQUENCE (Orchestrated)
// ============================================================================

export const loginSequence = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  } as Variants,

  logo: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: durations.slow,
        ease: easings.butter
      }
    }
  } as Variants,

  heading: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: durations.slow,
        ease: easings.silk
      }
    }
  } as Variants,

  form: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: durations.slow,
        ease: easings.butter,
        delay: 0.2
      }
    }
  } as Variants,

  footer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: durations.normal,
        ease: easings.smooth,
        delay: 0.4
      }
    }
  } as Variants
}

// ============================================================================
// SIDEBAR VARIANTS
// ============================================================================

export const sidebarVariants: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.silk
    }
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: easings.smooth
    }
  }
}
