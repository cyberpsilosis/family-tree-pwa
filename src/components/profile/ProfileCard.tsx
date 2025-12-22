'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Mail, Phone, Calendar, ArrowUpRight, Download, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { getMapsUrl } from '@/lib/maps'
import { getRelationshipBadgeStyle } from '@/lib/relationshipColors'
import { calculateAge } from '@/lib/date'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  birthday: string
  birthYear: number
  favoriteTeam: string | null
  customCardText: string | null
  instagram: string | null
  facebook: string | null
  twitter: string | null
  linkedin: string | null
  profilePhotoUrl: string | null
  isAdmin: boolean
  preferredContactMethod: string | null
  isDeceased?: boolean
}

interface ProfileCardProps {
  user: User
  relationship?: string
  variant?: 'full' | 'compact'
  onClick?: () => void
  onDownloadContact?: () => void
}

export function ProfileCard({ 
  user, 
  relationship,
  variant = 'full',
  onClick,
  onDownloadContact
}: ProfileCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  
  // Calculate age
  const age = calculateAge(user.birthday)
  
  const socialLinks = [
    { url: user.instagram, icon: 'instagram', label: 'Instagram' },
    { url: user.facebook, icon: 'facebook', label: 'Facebook' },
    { url: user.twitter, icon: 'twitter', label: 'Twitter' },
    { url: user.linkedin, icon: 'linkedin', label: 'LinkedIn' },
  ].filter(link => link.url)

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'w-[200px] rounded-xl',
          'bg-card/50 backdrop-blur-sm border border-border/50',
          'hover:border-primary/50 transition-all duration-300',
          'cursor-pointer group',
          onClick && 'hover:scale-105'
        )}
        onClick={onClick}
      >
        <div className="p-4 text-center space-y-2">
          {/* Profile Photo */}
          <div className="mx-auto w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            {user.profilePhotoUrl ? (
              <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: `url(${user.profilePhotoUrl})` }}
              />
            ) : (
              <span className="text-2xl font-semibold text-primary">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            )}
          </div>
          
          {/* Name */}
          <div>
            <h3 className="text-sm font-semibold leading-tight">
              {user.firstName} {user.lastName}
            </h3>
            {relationship && (() => {
              const style = getRelationshipBadgeStyle(relationship)
              return (
                <span className={cn(
                  "inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full backdrop-blur-sm",
                  style.bg,
                  style.text,
                  "border",
                  style.border
                )}>
                  {relationship}
                </span>
              )
            })()}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div
      className="relative w-[280px] h-[380px] group [perspective:2000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          'relative w-full h-full',
          '[transform-style:preserve-3d]',
          'transition-all duration-700',
          isFlipped
            ? '[transform:rotateY(180deg)]'
            : '[transform:rotateY(0deg)]'
        )}
      >
        {/* Front of card */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full',
            '[backface-visibility:hidden] [transform:rotateY(0deg)]',
            'overflow-hidden rounded-2xl',
            'bg-card/80 backdrop-blur-xl',
            'border border-border/50',
            'shadow-xs',
            'transition-all duration-300',
            'group-hover:shadow-md group-hover:border-border/70',
            isFlipped ? 'opacity-0' : 'opacity-100'
          )}
        >
          {/* Full-bleed profile image background */}
          <div className="relative h-full overflow-hidden">
            {user.profilePhotoUrl ? (
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${user.profilePhotoUrl})` }} />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10" />
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>

          {/* Badge */}
          {(relationship || user.isAdmin) && (() => {
            const displayText = relationship || 'Admin'
            const style = getRelationshipBadgeStyle(displayText)
            return (
              <div className="absolute top-3 right-3">
                <span className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-semibold backdrop-blur-xl',
                  'shadow-md border-2',
                  style.bg,
                  style.border,
                  style.text
                )}>
                  {displayText}
                </span>
              </div>
            )
          })()}

          {/* Card Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-semibold text-white leading-snug tracking-tight transition-all duration-500 ease-out group-hover:translate-y-[-4px]">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-zinc-200 line-clamp-2 tracking-tight transition-all duration-500 ease-out group-hover:translate-y-[-4px] delay-[50ms]">
                  {user.customCardText || (user.favoriteTeam ? `${user.favoriteTeam} fan` : (!user.isDeceased ? (user.phone || user.email) : ''))}
                </p>
              </div>
              <div className={cn(
                'p-2 rounded-full',
                'bg-white/10 backdrop-blur-md',
                'group-hover:bg-white/20',
                'transition-colors duration-300'
              )}>
                <ArrowUpRight className="w-4 h-4 text-white group-hover:-rotate-12 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full',
            '[backface-visibility:hidden] [transform:rotateY(180deg)]',
            'p-5 rounded-2xl',
            'bg-gradient-to-b from-card via-card to-background',
            'border border-border/50',
            'shadow-xs',
            'flex flex-col',
            'transition-all duration-700',
            'group-hover:shadow-md',
            'overflow-hidden',
            !isFlipped ? 'opacity-0' : 'opacity-100'
          )}
        >
          <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin min-h-0">
            {/* Name */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold leading-tight tracking-tight transition-all duration-500 ease-out group-hover:translate-y-[-2px] line-clamp-1">
                {user.firstName} {user.lastName}
              </h3>
              {relationship && (
                <p className="text-sm text-muted-foreground tracking-tight transition-all duration-500 ease-out group-hover:translate-y-[-2px] line-clamp-1">
                  {relationship}
                </p>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-2.5">
              {!user.isDeceased && user.phone && (
                <div
                  className="flex items-start gap-2.5 text-sm transition-all duration-500"
                  style={{
                    transform: isFlipped ? 'translateX(0)' : 'translateX(-10px)',
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: '100ms',
                  }}
                >
                  <a
                    href={`tel:${user.phone}`}
                    className="flex items-start gap-2.5 flex-1 hover:text-primary cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                  <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground hover:text-primary leading-snug transition-colors">{user.phone}</span>
                  </a>
                  {(user.preferredContactMethod === 'call' || user.preferredContactMethod === 'phone') && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium whitespace-nowrap">Call Preferred</span>
                  )}
                  {user.preferredContactMethod === 'text' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium whitespace-nowrap">Text Preferred</span>
                  )}
                </div>
              )}

              {!user.isDeceased && (
                <div
                  className="flex items-start gap-2.5 text-sm transition-all duration-500"
                  style={{
                    transform: isFlipped ? 'translateX(0)' : 'translateX(-10px)',
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: '200ms',
                  }}
                >
                  <a
                    href={`mailto:${user.email}`}
                    className="flex items-start gap-2.5 flex-1 hover:text-primary cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground hover:text-primary break-all leading-snug overflow-hidden transition-colors">{user.email}</span>
                  </a>
                  {user.preferredContactMethod === 'email' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium whitespace-nowrap">Email Preferred</span>
                  )}
                </div>
              )}

              {user.address && (
                <div
                  className="flex items-start gap-2.5 text-sm transition-all duration-500"
                  style={{
                    transform: isFlipped ? 'translateX(0)' : 'translateX(-10px)',
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: '300ms',
                  }}
                >
                  <a
                    href={getMapsUrl(user.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 flex-1 hover:text-primary cursor-pointer min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground hover:text-primary leading-snug line-clamp-3 break-words overflow-hidden">{user.address}</span>
                  </a>
                </div>
              )}

              {user.favoriteTeam && (
                <div
                  className="flex items-start gap-2.5 text-sm transition-all duration-500"
                  style={{
                    transform: isFlipped ? 'translateX(0)' : 'translateX(-10px)',
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: '400ms',
                  }}
                >
                  <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="12" rx="9" ry="12"/>
                    <path d="M12 3v18M3 12h18"/>
                  </svg>
                  <span className="text-muted-foreground">{user.favoriteTeam}</span>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            {socialLinks.length > 0 && (
              <div>
                <div className="flex items-center gap-2">
                  {socialLinks.map((link, index) => (
                    <a
                      key={link.icon}
                      href={link.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-secondary/20 hover:bg-primary/20 transition-all duration-300 hover:scale-110"
                      style={{
                        opacity: isFlipped ? 1 : 0,
                        transitionDelay: `${(index + 4) * 100}ms`,
                      }}
                    >
                      <SocialIcon icon={link.icon} />
                    </a>
                  ))}
                  {user.preferredContactMethod === 'social' && (
                    <span 
                      className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium whitespace-nowrap"
                      style={{
                        opacity: isFlipped ? 1 : 0,
                        transitionDelay: `${(socialLinks.length + 4) * 100}ms`,
                      }}
                    >
                      Social Preferred
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 mt-auto border-t border-border/50 flex-shrink-0">
            <div className="flex gap-2">
              {/* Download Contact Button */}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  onDownloadContact?.()
                }}
                className={cn(
                  'group/download relative',
                  'flex items-center justify-center',
                  'p-2.5 rounded-lg',
                  'transition-all duration-300',
                  'bg-gradient-to-r from-secondary via-secondary to-secondary',
                  'hover:from-primary/10 hover:from-0% hover:via-primary/5 hover:via-100% hover:to-transparent hover:to-100%',
                  'hover:scale-[1.02] cursor-pointer',
                  'flex-shrink-0'
                )}
              >
                <div className="relative group/icon">
                  <div className={cn(
                    'absolute inset-[-6px] rounded-lg transition-all duration-300',
                    'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent',
                    'opacity-0 group-hover/download:opacity-100 scale-90 group-hover/download:scale-100'
                  )} />
                  <Download className="relative z-10 w-4 h-4 text-primary transition-all duration-300 group-hover/download:scale-110" />
                </div>
              </div>
              
              {/* View Profile Button */}
              <div
                onClick={onClick}
                className={cn(
                  'group/start relative',
                  'flex items-center justify-between',
                  'px-3 py-2.5 rounded-lg',
                  'transition-all duration-300',
                  'bg-gradient-to-r from-secondary via-secondary to-secondary',
                  'hover:from-primary/10 hover:from-0% hover:via-primary/5 hover:via-100% hover:to-transparent hover:to-100%',
                  'hover:scale-[1.02] cursor-pointer',
                  'flex-1'
                )}
              >
                <span className="text-sm font-medium transition-colors duration-300 group-hover/start:text-primary">
                  View Profile
                </span>
                <div className="relative group/icon">
                  <div className={cn(
                    'absolute inset-[-6px] rounded-lg transition-all duration-300',
                    'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent',
                    'opacity-0 group-hover/start:opacity-100 scale-90 group-hover/start:scale-100'
                  )} />
                  <ArrowUpRight className="relative z-10 w-4 h-4 text-primary transition-all duration-300 group-hover/start:translate-x-0.5 group-hover/start:scale-110" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Social Media Icon Component
function SocialIcon({ icon }: { icon: string }) {
  const className = "w-4 h-4"
  
  switch (icon) {
    case 'instagram':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    case 'facebook':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    case 'twitter':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    case 'linkedin':
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    default:
      return null
  }
}
