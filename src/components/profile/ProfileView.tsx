'use client'

import { User } from '@prisma/client'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Download,
  Edit,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Heart
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { downloadVCard } from '@/lib/vcard'
import { getMapsUrl } from '@/lib/maps'
import { getRelationshipBadgeStyle } from '@/lib/relationshipColors'
import { ThemeToggle } from '@/components/auth/ThemeToggle'
import { formatBirthday, calculateAge } from '@/lib/date'

// Partial types for optimized queries
type PartialUser = {
  id: string
  firstName: string
  lastName: string
  profilePhotoUrl: string | null
  birthday?: Date
}

interface ProfileViewProps {
  member: User & {
    parent: PartialUser | null
    parent2: PartialUser | null
    children: PartialUser[]
  }
  relationship: string
  currentUserId: string
  siblings: PartialUser[]
}

export default function ProfileView({ member, relationship, currentUserId, siblings }: ProfileViewProps) {
  const router = useRouter()
  const isOwnProfile = member.id === currentUserId

  const handleBackClick = () => {
    // When viewing own profile, always go to home to avoid navigation loop with edit page
    if (isOwnProfile) {
      router.push('/home')
    } else {
      router.back()
    }
  }

  // Convert Prisma Date to ISO string if needed
  const birthdayString = typeof member.birthday === 'string' 
    ? member.birthday 
    : member.birthday.toISOString()

  const age = calculateAge(birthdayString)
  const formattedBirthday = formatBirthday(birthdayString, 'long')

  const handleDownloadContact = () => {
    downloadVCard({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      address: member.address,
      birthday: birthdayString,
      profilePhotoUrl: member.profilePhotoUrl,
      instagram: member.instagram,
      facebook: member.facebook,
      twitter: member.twitter,
      linkedin: member.linkedin,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <div className="flex items-center gap-2">
          {isOwnProfile && (
            <button
              onClick={() => router.push('/profile/edit')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-6xl font-serif text-primary">
              {member.profilePhotoUrl ? (
                <img
                  src={member.profilePhotoUrl}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                `${member.firstName[0]}${member.lastName[0]}`
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                  {member.firstName} {member.lastName}
                </h1>
                {!isOwnProfile && relationship !== 'You' && (() => {
                  const style = getRelationshipBadgeStyle(relationship)
                  return (
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm border ${style.bg} ${style.border}`}>
                      <Heart className={`w-4 h-4 ${style.text}`} />
                      <span className={`text-sm font-medium ${style.text}`}>{relationship}</span>
                    </div>
                  )
                })()}
              </div>
            </div>

            <div className="space-y-3">
              {/* Birthday & Age */}
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                <span>{formattedBirthday} • {age} years old</span>
              </div>

              {/* Phone */}
              {!member.isDeceased && member.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <a
                    href={`tel:${member.phone}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {member.phone}
                  </a>
                  {(member.preferredContactMethod === 'call' || member.preferredContactMethod === 'phone') && (
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Call Preferred</span>
                  )}
                  {member.preferredContactMethod === 'text' && (
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Text Preferred</span>
                  )}
                </div>
              )}

              {/* Email */}
              {!member.isDeceased && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <a
                    href={`mailto:${member.email}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {member.email}
                  </a>
                  {member.preferredContactMethod === 'email' && (
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Email Preferred</span>
                  )}
                </div>
              )}

              {/* Address */}
              {member.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <a
                    href={getMapsUrl(member.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground whitespace-pre-line hover:text-primary transition-colors"
                  >
                    {member.address}
                  </a>
                </div>
              )}

              {/* Favorite Team */}
              {!member.isDeceased && member.favoriteTeam && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="12" rx="9" ry="12"/>
                    <path d="M12 3v18M3 12h18"/>
                  </svg>
                  <span className="text-muted-foreground">
                    Favorite Team: <span className="font-medium">{member.favoriteTeam}</span>
                  </span>
                </div>
              )}

              {/* Job Information */}
              {(member.jobTitle || member.occupation) && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  <div className="text-muted-foreground">
                    {member.jobTitle && <div className="font-medium">{member.jobTitle}</div>}
                    {member.occupation && <div className="text-sm">{member.occupation}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        {(member.instagram || member.facebook || member.twitter || member.linkedin) && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Connect</h3>
            <div className="flex items-center gap-4">
              {member.instagram && (
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {member.facebook && (
                <a
                  href={member.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {member.twitter && (
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {member.preferredContactMethod === 'social' && (
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Social Preferred</span>
              )}
            </div>
          </div>
        )}

        {/* Download Contact Button */}
        <div className="mt-6">
          <button
            onClick={handleDownloadContact}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download Contact</span>
          </button>
        </div>
      </motion.div>

      {/* Family Section */}
      {(member.parent || member.parent2 || siblings.length > 0 || member.children.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Family</h2>
          
          <div className="space-y-4">
            {/* Parents */}
            {(member.parent || member.parent2) && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {member.parent && member.parent2 ? 'Parents' : 'Parent'}
                </h3>
                <div className="space-y-2">
                  {member.parent && (
                    <button
                      onClick={() => router.push(`/profile/${member.parent!.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors text-left w-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-serif text-primary">
                        {member.parent.profilePhotoUrl ? (
                          <img
                            src={member.parent.profilePhotoUrl}
                            alt={`${member.parent.firstName} ${member.parent.lastName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          `${member.parent.firstName[0]}${member.parent.lastName[0]}`
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {member.parent.firstName} {member.parent.lastName}
                        </div>
                      </div>
                    </button>
                  )}
                  {member.parent2 && (
                    <button
                      onClick={() => router.push(`/profile/${member.parent2!.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors text-left w-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-serif text-primary">
                        {member.parent2.profilePhotoUrl ? (
                          <img
                            src={member.parent2.profilePhotoUrl}
                            alt={`${member.parent2.firstName} ${member.parent2.lastName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          `${member.parent2.firstName[0]}${member.parent2.lastName[0]}`
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {member.parent2.firstName} {member.parent2.lastName}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Siblings */}
            {siblings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Siblings ({siblings.length})
                </h3>
                <div className="space-y-2">
                  {siblings.map((sibling) => (
                    <button
                      key={sibling.id}
                      onClick={() => router.push(`/profile/${sibling.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors text-left w-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-serif text-primary">
                        {sibling.profilePhotoUrl ? (
                          <img
                            src={sibling.profilePhotoUrl}
                            alt={`${sibling.firstName} ${sibling.lastName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          `${sibling.firstName[0]}${sibling.lastName[0]}`
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {sibling.firstName} {sibling.lastName}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Children */}
            {member.children.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Children ({member.children.length})
                </h3>
                <div className="space-y-2">
                  {member.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => router.push(`/profile/${child.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors text-left w-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-serif text-primary">
                        {child.profilePhotoUrl ? (
                          <img
                            src={child.profilePhotoUrl}
                            alt={`${child.firstName} ${child.lastName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          `${child.firstName[0]}${child.lastName[0]}`
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {child.firstName} {child.lastName}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
