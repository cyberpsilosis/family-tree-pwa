'use client'

import { User } from '@prisma/client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, X, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/auth/ThemeToggle'

interface EditProfileFormProps {
  user: User
}

type SocialPlatform = 'Instagram' | 'Facebook' | 'Twitter' | 'LinkedIn'

interface SocialLink {
  platform: SocialPlatform
  handle: string
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Extract handles from URLs
  const extractHandle = (url: string | null): string => {
    if (!url) return ''
    const match = url.match(/(?:instagram\.com|facebook\.com|x\.com|linkedin\.com\/in)\/([^\/\?]+)/)
    return match ? match[1] : ''
  }

  const initialSocialLinks: SocialLink[] = []
  if (user.instagram) initialSocialLinks.push({ platform: 'Instagram', handle: extractHandle(user.instagram) })
  if (user.facebook) initialSocialLinks.push({ platform: 'Facebook', handle: extractHandle(user.facebook) })
  if (user.twitter) initialSocialLinks.push({ platform: 'Twitter', handle: extractHandle(user.twitter) })
  if (user.linkedin) initialSocialLinks.push({ platform: 'LinkedIn', handle: extractHandle(user.linkedin) })

  const [formData, setFormData] = useState({
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    favoriteTeam: user.favoriteTeam || '',
    preferredContactMethod: user.preferredContactMethod || '',
  })

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks)

  const addSocialLink = () => {
    if (socialLinks.length >= 4) return
    setSocialLinks([...socialLinks, { platform: 'Instagram', handle: '' }])
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks]
    updated[index][field] = value as any
    setSocialLinks(updated)
  }

  const getPlatformUrl = (platform: SocialPlatform, handle: string): string => {
    const baseUrls = {
      Instagram: 'https://instagram.com/',
      Facebook: 'https://facebook.com/',
      Twitter: 'https://x.com/',
      LinkedIn: 'https://www.linkedin.com/in/',
    }
    return `${baseUrls[platform]}${handle}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Build social media object
      const socialMedia: Record<string, string | null> = {
        instagram: null,
        facebook: null,
        twitter: null,
        linkedin: null,
      }

      socialLinks.forEach((link) => {
        if (link.handle.trim()) {
          const key = link.platform.toLowerCase()
          socialMedia[key] = getPlatformUrl(link.platform, link.handle.trim())
        }
      })

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address || null,
          favoriteTeam: formData.favoriteTeam || null,
          preferredContactMethod: formData.preferredContactMethod || null,
          ...socialMedia,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push(`/profile/${user.id}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const platformIcons = {
    Instagram: Instagram,
    Facebook: Facebook,
    Twitter: Twitter,
    LinkedIn: Linkedin,
  }

  const availablePlatforms: SocialPlatform[] = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn']
  const usedPlatforms = socialLinks.map((link) => link.platform)

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <ThemeToggle />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground">Edit Profile</h1>
        <p className="text-muted-foreground mt-2">Update your contact information and preferences</p>
      </motion.div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600"
        >
          Profile updated successfully! Redirecting...
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="glass-card p-6 space-y-6"
      >
        {/* Name (Read-only) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              First Name
            </label>
            <input
              type="text"
              value={user.firstName}
              disabled
              className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={user.lastName}
              disabled
              className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>

        {/* Birthday (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Birthday
          </label>
          <input
            type="text"
            value={new Date(user.birthday).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
            disabled
            className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Preferred Contact Method */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Preferred Contact Method
          </label>
          <select
            value={formData.preferredContactMethod}
            onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select...</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="text">Text</option>
          </select>
        </div>

        {/* Favorite Team */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Favorite Team
          </label>
          <select
            value={formData.favoriteTeam}
            onChange={(e) => setFormData({ ...formData, favoriteTeam: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select...</option>
            <option value="49ers">49ers</option>
            <option value="Raiders">Raiders</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Social Media Links */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-foreground">
              Social Media
            </label>
            {socialLinks.length < 4 && (
              <button
                type="button"
                onClick={addSocialLink}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            )}
          </div>

          <div className="space-y-3">
            {socialLinks.map((link, index) => {
              const Icon = platformIcons[link.platform]
              return (
                <div key={index} className="flex gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                    className="w-40 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {availablePlatforms
                      .filter((p) => p === link.platform || !usedPlatforms.includes(p))
                      .map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                  </select>

                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      value={link.handle}
                      onChange={(e) => updateSocialLink(index, 'handle', e.target.value)}
                      placeholder="username"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )
            })}

            {socialLinks.length === 0 && (
              <p className="text-sm text-muted-foreground">No social media links added yet.</p>
            )}

            {/* URL Previews */}
            {socialLinks.some((link) => link.handle.trim()) && (
              <div className="mt-3 p-3 bg-background/50 rounded-lg space-y-1">
                <p className="text-xs text-muted-foreground font-medium mb-2">Preview:</p>
                {socialLinks
                  .filter((link) => link.handle.trim())
                  .map((link, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      {link.platform}: {getPlatformUrl(link.platform, link.handle)}
                    </p>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-border rounded-lg text-foreground hover:bg-background/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}
