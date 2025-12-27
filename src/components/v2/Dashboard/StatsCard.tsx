'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  loading?: boolean
  className?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading,
  className
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-verity-200 bg-white p-6 shadow-sm transition-all hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-verity-600">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-verity-100" />
          ) : (
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-verity-900">
              {value}
            </h3>
          )}
        </div>
        <div className="rounded-full bg-verity-50 p-3">
          <Icon className="h-6 w-6 text-verity-600" />
        </div>
      </div>

      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend && (
            <span
              className={cn(
                'flex items-center font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : '-'}
              {trend.value}%
            </span>
          )}
          {description && <span className="text-verity-500">{description}</span>}
        </div>
      )}

      {/* Background decoration */}
      <div className="absolute -right-6 -top-6 -z-10 h-24 w-24 rounded-full bg-verity-50/50 blur-2xl" />
    </motion.div>
  )
}
