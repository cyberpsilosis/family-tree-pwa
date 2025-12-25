'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface InfoTooltipProps {
  title: string
  content: string
  icon?: string
}

export function InfoTooltip({ title, content, icon = '🌸' }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Info Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[#FFB7C5] hover:text-[#FF9BB0] hover:bg-[#FFB7C5]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFB7C5] focus:ring-offset-2"
        aria-label="More information"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100]"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm z-[101]"
            >
              <div className="bg-[#FFB7C5] text-gray-900 rounded-xl shadow-2xl p-5 relative">
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Icon & Title */}
                <div className="flex items-start gap-2 mb-3 pr-8">
                  {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
                  <h3 className="font-semibold text-lg leading-tight">{title}</h3>
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed text-gray-800">
                  {content}
                </p>

                {/* Dismiss Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-4 w-full py-2.5 px-4 bg-white/90 hover:bg-white text-gray-900 font-medium rounded-lg transition-colors"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
