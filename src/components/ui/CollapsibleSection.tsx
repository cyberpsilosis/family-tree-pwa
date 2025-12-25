'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CollapsibleSectionProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  badge?: string
}

export function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = true,
  badge 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-background/50 hover:bg-background/80 transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <h3 className="font-medium text-foreground text-left">{title}</h3>
          {badge && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 border-t border-border/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
