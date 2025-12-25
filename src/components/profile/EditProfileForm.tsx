'use client'

import { User } from '@prisma/client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, X, Instagram, Facebook, Twitter, Linkedin, AlertTriangle, Copy } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/auth/ThemeToggle'
import { RelationshipManager } from '@/components/relationships/RelationshipManager'
import { formatBirthday } from '@/lib/date'
import ProfilePhotoUpload from '@/components/admin/ProfilePhotoUpload'
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete'
import { formatAddressWithUnit, parseAddress } from '@/lib/address'

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  // Extract handles from URLs - memoized to avoid recomputation
  const extractHandle = useCallback((url: string | null): string => {
    if (!url) return ''
    const match = url.match(/(?:instagram\.com|facebook\.com|x\.com|linkedin\.com\/in)\/([^\/\?]+)/)
    return match ? match[1] : ''
  }, [])

  // Memoize initial social links to avoid recomputation on every render
  const initialSocialLinks: SocialLink[] = useMemo(() => {
    const links: SocialLink[] = []
    if (user.instagram) links.push({ platform: 'Instagram', handle: extractHandle(user.instagram) })
    if (user.facebook) links.push({ platform: 'Facebook', handle: extractHandle(user.facebook) })
    if (user.twitter) links.push({ platform: 'Twitter', handle: extractHandle(user.twitter) })
    if (user.linkedin) links.push({ platform: 'LinkedIn', handle: extractHandle(user.linkedin) })
    return links
  }, [user.instagram, user.facebook, user.twitter, user.linkedin, extractHandle])

  // Parse address and unit from existing address
  const { address: parsedAddress, unit: parsedUnit } = parseAddress(user.address || '')
  const { address: parsedShippingAddress, unit: parsedShippingUnit } = parseAddress(user.shippingAddress || '')
  
  // Initialize all state variables BEFORE callbacks that reference them
  const [formData, setFormData] = useState({
    email: user.email,
    phone: user.phone || '',
    address: parsedAddress,
    shippingAddress: parsedShippingAddress,
    favoriteTeam: user.favoriteTeam || '',
    customCardText: user.customCardText || '',
    jobTitle: user.jobTitle || '',
    occupation: user.occupation || '',
    preferredContactMethod: user.preferredContactMethod || '',
  })
  
  const [unitNumber, setUnitNumber] = useState(parsedUnit)
  const [shippingUnitNumber, setShippingUnitNumber] = useState(parsedShippingUnit)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(user.profilePhotoUrl || null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks)
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('Instagram')
  const [newHandle, setNewHandle] = useState('')
  const [availableMembers, setAvailableMembers] = useState<Array<{id: string, firstName: string, lastName: string, birthday?: string, parentId?: string | null, parent2Id?: string | null}>>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)

  // Lazy load available members only when RelationshipManager is expanded/used
  // This avoids blocking initial page load with unnecessary API calls
  const fetchMembersIfNeeded = useCallback(async () => {
    if (availableMembers.length === 0 && !isLoadingMembers) {
      setIsLoadingMembers(true)
      try {
        const response = await fetch('/api/users?public=true', {
          cache: 'force-cache', // Use browser cache
        })
        if (response.ok) {
          const users = await response.json()
          setAvailableMembers(Array.isArray(users) ? users : [])
        }
      } catch (error) {
        console.error('Error fetching members:', error)
      } finally {
        setIsLoadingMembers(false)
      }
    }
  }, [availableMembers.length, isLoadingMembers])

  // Load members on mount with a slight delay to not block initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembersIfNeeded()
    }, 100) // 100ms delay to allow initial UI to render first
    
    return () => clearTimeout(timer)
  }, [fetchMembersIfNeeded])

  // Track changes to detect unsaved edits - optimized to reduce recalculations
  const hasUnsavedChangesComputed = useMemo(() => {
    const currentFullAddress = formatAddressWithUnit(formData.address, unitNumber)
    const currentFullShippingAddress = formatAddressWithUnit(formData.shippingAddress, shippingUnitNumber)
    const hasFormChanges = 
      formData.email !== user.email ||
      formData.phone !== (user.phone || '') ||
      currentFullAddress !== (user.address || '') ||
      currentFullShippingAddress !== (user.shippingAddress || '') ||
      formData.favoriteTeam !== (user.favoriteTeam || '') ||
      formData.customCardText !== (user.customCardText || '') ||
      formData.jobTitle !== (user.jobTitle || '') ||
      formData.occupation !== (user.occupation || '') ||
      formData.preferredContactMethod !== (user.preferredContactMethod || '')

    const hasPhotoChanges = profilePhotoUrl !== (user.profilePhotoUrl || null)

    // More efficient comparison - compare length and individual items instead of JSON.stringify
    const hasSocialChanges = 
      socialLinks.length !== initialSocialLinks.length ||
      socialLinks.some((link, idx) => 
        !initialSocialLinks[idx] || 
        link.platform !== initialSocialLinks[idx].platform || 
        link.handle !== initialSocialLinks[idx].handle
      )

    return hasFormChanges || hasPhotoChanges || hasSocialChanges
  }, [formData, profilePhotoUrl, socialLinks, user, initialSocialLinks, unitNumber, shippingUnitNumber])

  // Update state only when computed value changes
  useEffect(() => {
    setHasUnsavedChanges(hasUnsavedChangesComputed)
  }, [hasUnsavedChangesComputed])

  // Prevent navigation if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !success) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, success])

  const handleBackClick = () => {
    if (hasUnsavedChanges && !success) {
      setShowExitModal(true)
    } else {
      router.back()
    }
  }

  const handleCancelClick = () => {
    if (hasUnsavedChanges && !success) {
      setShowExitModal(true)
    } else {
      router.back()
    }
  }

  const confirmExit = () => {
    setShowExitModal(false)
    router.back()
  }

  const addSocialLink = useCallback(() => {
    if (!newHandle.trim() || socialLinks.length >= 4) return
    
    // Check if platform already exists
    if (socialLinks.some(link => link.platform === newPlatform)) {
      setError(`${newPlatform} link already added`)
      return
    }
    
    setSocialLinks([...socialLinks, { platform: newPlatform, handle: newHandle.trim() }])
    setNewHandle('')
    setError('')
  }, [newHandle, socialLinks, newPlatform])

  const removeSocialLink = useCallback((index: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index))
  }, [])

  const getPlatformUrl = useCallback((platform: SocialPlatform, handle: string): string => {
    const baseUrls = {
      Instagram: 'https://instagram.com/',
      Facebook: 'https://facebook.com/',
      Twitter: 'https://x.com/',
      LinkedIn: 'https://www.linkedin.com/in/',
    }
    return `${baseUrls[platform]}${handle}`
  }, [])

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

      // Format addresses with unit
      const fullAddress = formatAddressWithUnit(formData.address, unitNumber)
      const fullShippingAddress = formatAddressWithUnit(formData.shippingAddress, shippingUnitNumber)
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone || null,
          address: fullAddress || null,
          shippingAddress: fullShippingAddress || null,
          favoriteTeam: formData.favoriteTeam || null,
          customCardText: formData.customCardText || null,
          jobTitle: formData.jobTitle || null,
          occupation: formData.occupation || null,
          preferredContactMethod: formData.preferredContactMethod || null,
          profilePhotoUrl: profilePhotoUrl || null,
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

  // Calculate age from birthday
  const calculateAge = (birthday: string | undefined): number | null => {
    if (!birthday) return null
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

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
            onClick={handleBackClick}
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

        {/* Profile Photo */}
        <div className="border-t border-border pt-6">
          <ProfilePhotoUpload
            currentPhotoUrl={profilePhotoUrl}
            onUploadComplete={setProfilePhotoUrl}
            onRemove={() => setProfilePhotoUrl(null)}
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

        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="e.g., Software Engineer, Teacher, Retired"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Occupation/Industry
          </label>
          <input
            type="text"
            value={formData.occupation}
            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            placeholder="e.g., Technology, Healthcare, Education"
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

        {/* Physical Address */}
        <div>
          <AddressAutocomplete
            label="Physical Address"
            value={formData.address}
            onChange={(address) => setFormData({ ...formData, address })}
            unitNumber={unitNumber}
            onUnitNumberChange={setUnitNumber}
            placeholder="123 Main St, City, State ZIP"
          />
        </div>

        {/* Shipping Address */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-foreground">
                Shipping Address
              </label>
              <InfoTooltip
                title="Holiday Cards & Gifts"
                content="Where should we send family mailings, cards, and gifts? This is often different from your home address (like a P.O. Box or work address)."
                icon="🎁"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, shippingAddress: formData.address })
                setShippingUnitNumber(unitNumber)
              }}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Copy className="w-3 h-3" />
              Same as physical
            </button>
          </div>
          <AddressAutocomplete
            label=""
            value={formData.shippingAddress}
            onChange={(address) => setFormData({ ...formData, shippingAddress: address })}
            unitNumber={shippingUnitNumber}
            onUnitNumberChange={setShippingUnitNumber}
            placeholder="123 Main St, City, State ZIP"
          />
        </div>

        {/* Preferred Contact Method */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-foreground">
              Preferred Contact Method
            </label>
            <InfoTooltip
              title="How to Reach You"
              content="Let family know the best way to reach you. This helps others respect your communication preferences."
              icon="📞"
            />
          </div>
          <select
            value={formData.preferredContactMethod}
            onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select...</option>
            <option value="call">Call</option>
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="social">Social Media</option>
          </select>
        </div>

        {/* Card Display Text */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-foreground">
              Card Display Text
            </label>
            <InfoTooltip
              title="Profile Card Tagline"
              content="This text appears on your profile card in the family tree. It's a fun way to show your personality! Leave it blank to display your phone number instead."
              icon="🎨"
            />
          </div>
          <select
            value={formData.favoriteTeam}
            onChange={(e) => {
              setFormData({ 
                ...formData, 
                favoriteTeam: e.target.value,
                customCardText: e.target.value !== 'Other' ? '' : formData.customCardText
              })
            }}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">None (show phone)</option>
            <option value="49ers">49ers fan</option>
            <option value="Raiders">Raiders fan</option>
            <option value="Other">Custom text...</option>
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            This will appear on the front of your profile card
          </p>
        </div>

        {/* Custom Card Text - Only shown when "Other" is selected */}
        {formData.favoriteTeam === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Custom Text
            </label>
            <input
              type="text"
              value={formData.customCardText}
              onChange={(e) => setFormData({ ...formData, customCardText: e.target.value })}
              placeholder="e.g., 'Dodgers fan', 'Coffee lover', 'Book enthusiast'"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter any text you'd like to display on your card
            </p>
          </div>
        )}

        {/* Relationships */}
        <div className="border-t border-border pt-6">
          <RelationshipManager 
            userId={user.id}
            availableMembers={availableMembers}
            disabled={isSubmitting}
            calculateAge={calculateAge}
            currentMemberParentId={user.parentId || undefined}
            currentMemberParent2Id={user.parent2Id || undefined}
          />
        </div>

        {/* Social Media Links */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-medium text-foreground">Social Media</h3>
            <InfoTooltip
              title="Connect with Family"
              content="Your social links appear on your profile page so family members can easily find and follow you on their favorite platforms!"
              icon="📱"
            />
          </div>
          
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
            onClick={handleCancelClick}
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

      {/* Unsaved Changes Modal */}
      <AnimatePresence>
        {showExitModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="glass-card p-6 m-4">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-center mb-2">
                  Unsaved Changes
                </h3>

                {/* Message */}
                <p className="text-muted-foreground text-center mb-6">
                  You have unsaved changes. Are you sure you want to leave without saving?
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExitModal(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-background/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmExit}
                    className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    Leave Without Saving
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
