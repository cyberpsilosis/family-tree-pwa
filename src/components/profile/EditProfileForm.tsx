'use client'

import { User } from '@prisma/client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, X, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/auth/ThemeToggle'
import { formatBirthday } from '@/lib/date'

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
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('Instagram')
  const [newHandle, setNewHandle] = useState('')

  const addSocialLink = () => {
    if (!newHandle.trim() || socialLinks.length >= 4) return
    
    // Check if platform already exists
    if (socialLinks.some(link => link.platform === newPlatform)) {
      setError(`${newPlatform} link already added`)
      return
    }
    
    setSocialLinks([...socialLinks, { platform: newPlatform, handle: newHandle.trim() }])
    setNewHandle('')
    setError('')
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
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
            value={formatBirthday(user.birthday, 'long')}
            disabled
            className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
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
          <h3 className="text-sm font-medium text-foreground mb-4">Social Media</h3>
          
          {/* Existing Links */}
          {socialLinks.length > 0 && (
            <div className="space-y-2 mb-4">
              {socialLinks.map((link, index) => {
                const Icon = platformIcons[link.platform]
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg bg-secondary/20 p-3 border border-border/50"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{link.platform}</p>
                      <p className="text-xs text-muted-foreground">
                        {getPlatformUrl(link.platform, link.handle)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add New Link */}
          <div className="space-y-3">
            <div className="flex gap-2">
              {[
                { platform: 'Instagram' as SocialPlatform, icon: Instagram },
                { platform: 'Facebook' as SocialPlatform, icon: Facebook },
                { platform: 'Twitter' as SocialPlatform, icon: Twitter },
                { platform: 'LinkedIn' as SocialPlatform, icon: Linkedin },
              ].map(({ platform, icon: Icon }) => {
                const isSelected = newPlatform === platform
                const isDisabled = socialLinks.length >= 4 || socialLinks.some(link => link.platform === platform)
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setNewPlatform(platform)}
                    disabled={isDisabled}
                    className={`flex-1 p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2'
                        : 'bg-background border-border hover:border-primary/50'
                    } ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    title={platform}
                  >
                    <Icon className="w-5 h-5 mx-auto" />
                  </button>
                )
              })}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="username"
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                disabled={socialLinks.length >= 4}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <button
                type="button"
                onClick={addSocialLink}
                disabled={!newHandle.trim() || socialLinks.length >= 4}
                className="px-4 py-2 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
          
          {socialLinks.length >= 4 && (
            <p className="text-xs text-muted-foreground mt-2">Maximum 4 social platforms</p>
          )}
          
          {socialLinks.length === 0 && (
            <p className="text-sm text-muted-foreground">No social media links added yet.</p>
          )}
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
