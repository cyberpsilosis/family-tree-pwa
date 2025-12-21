'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { X, Plus, AlertTriangle, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react'
import ProfilePhotoUpload from '@/components/admin/ProfilePhotoUpload'
import { formatAddressWithUnit, parseAddress } from '@/lib/address'
import { cn } from '@/lib/utils'
import { toDateInputValue } from '@/lib/date'

type SocialPlatform = 'Instagram' | 'Facebook' | 'Twitter' | 'LinkedIn'

interface SocialLink {
  id: string
  platform: SocialPlatform
  handle: string
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  birthYear: number
  birthday: string
  phone: string | null
  address: string | null
  favoriteTeam: string | null
  customCardText: string | null
  instagram: string | null
  facebook: string | null
  twitter: string | null
  linkedin: string | null
  profilePhotoUrl: string | null
  parentId: string | null
}

const platformUrls: Record<SocialPlatform, (handle: string) => string> = {
  Instagram: (handle) => `https://instagram.com/${handle}`,
  Facebook: (handle) => `https://facebook.com/${handle}`,
  Twitter: (handle) => `https://x.com/${handle}`,
  LinkedIn: (handle) => `https://www.linkedin.com/in/${handle}`,
}

// Extract handle from stored URL
const extractHandle = (url: string | null, platform: SocialPlatform): string => {
  if (!url) return ''
  
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    if (platform === 'LinkedIn') {
      // Extract from /in/{handle}
      const match = pathname.match(/\/in\/([^/]+)/)
      return match ? match[1] : ''
    }
    
    // For other platforms, handle is after first /
    return pathname.substring(1)
  } catch {
    return ''
  }
}

export default function EditMemberPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [availableParents, setAvailableParents] = useState<Array<{id: string, firstName: string, lastName: string}>>([])
  
  // Original values for password field change detection
  const [originalFirstName, setOriginalFirstName] = useState('')
  const [originalLastName, setOriginalLastName] = useState('')
  const [originalBirthYear, setOriginalBirthYear] = useState(0)
  
  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [birthday, setBirthday] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [favoriteTeam, setFavoriteTeam] = useState('')
  const [customCardText, setCustomCardText] = useState('')
  const [parentId, setParentId] = useState('')
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('Instagram')
  const [newHandle, setNewHandle] = useState('')
  
  // Detect if password-related fields changed
  const birthYear = birthday ? new Date(birthday).getFullYear() : 0
  const passwordFieldsChanged =
    firstName !== originalFirstName ||
    lastName !== originalLastName ||
    birthYear !== originalBirthYear
  
  // Fetch available parents on mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const members = await response.json()
          setAvailableParents(members)
        }
      } catch (err) {
        console.error('Failed to load members:', err)
      } finally {
        setIsLoadingMembers(false)
      }
    }
    fetchMembers()
  }, [])
  
  useEffect(() => {
    if (!userId) return
    
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }
        
        const user: User = await response.json()
        
        // Set form fields
        setFirstName(user.firstName)
        setLastName(user.lastName)
        setEmail(user.email)
        setBirthday(toDateInputValue(user.birthday))
        setPhone(user.phone || '')
        
        // Parse address into street address and unit number
        const { address: mainAddress, unit } = parseAddress(user.address)
        setAddress(mainAddress)
        setUnitNumber(unit)
        
        setFavoriteTeam(user.favoriteTeam || '')
        setCustomCardText(user.customCardText || '')
        setParentId(user.parentId || '')
        setProfilePhotoUrl(user.profilePhotoUrl || null)
        
        // Set original values for change detection
        setOriginalFirstName(user.firstName)
        setOriginalLastName(user.lastName)
        setOriginalBirthYear(user.birthYear)
        
        // Parse social media links
        const links: SocialLink[] = []
        if (user.instagram) {
          links.push({
            id: 'instagram',
            platform: 'Instagram',
            handle: extractHandle(user.instagram, 'Instagram'),
          })
        }
        if (user.facebook) {
          links.push({
            id: 'facebook',
            platform: 'Facebook',
            handle: extractHandle(user.facebook, 'Facebook'),
          })
        }
        if (user.twitter) {
          links.push({
            id: 'twitter',
            platform: 'Twitter',
            handle: extractHandle(user.twitter, 'Twitter'),
          })
        }
        if (user.linkedin) {
          links.push({
            id: 'linkedin',
            platform: 'LinkedIn',
            handle: extractHandle(user.linkedin, 'LinkedIn'),
          })
        }
        setSocialLinks(links)
        
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user')
        setIsLoading(false)
      }
    }
    
    fetchUser()
  }, [userId])
  
  const addSocialLink = () => {
    if (!newHandle.trim()) return
    
    if (socialLinks.some(link => link.platform === newPlatform)) {
      setError(`${newPlatform} link already added`)
      return
    }
    
    setSocialLinks([
      ...socialLinks,
      {
        id: Math.random().toString(36).substr(2, 9),
        platform: newPlatform,
        handle: newHandle.trim(),
      },
    ])
    setNewHandle('')
    setError('')
  }
  
  const removeSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id))
  }
  
  const handleSave = async (regeneratePassword: boolean = false) => {
    if (regeneratePassword) {
      setIsRegenerating(true)
    } else {
      setIsSaving(true)
    }
    setError('')
    setSuccess('')
    
    try {
      const socialMedia: Record<string, string> = {}
      socialLinks.forEach(link => {
        socialMedia[link.platform.toLowerCase()] = link.handle
      })
      
      // Format address with unit number if provided
      const fullAddress = address ? formatAddressWithUnit(address, unitNumber) : undefined
      
      // Extract birth year from birthday
      const birthYear = new Date(birthday).getFullYear()
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          birthYear,
          birthday,
          phone: phone || undefined,
          address: fullAddress || undefined,
          favoriteTeam: favoriteTeam || undefined,
          customCardText: customCardText || undefined,
          parentId: parentId || undefined,
          profilePhotoUrl: profilePhotoUrl,
          socialMedia,
          regeneratePassword,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update member')
      }
      
      if (regeneratePassword) {
        setSuccess(`Password regenerated and emailed to ${email}`)
        // Update original values so warning disappears
        setOriginalFirstName(firstName)
        setOriginalLastName(lastName)
        setOriginalBirthYear(new Date(birthday).getFullYear())
      } else {
        setSuccess('Profile updated successfully')
      }
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSaving(false)
      setIsRegenerating(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="relative mx-auto max-w-2xl">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading member...</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="relative mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-up">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Edit</p>
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground md:text-5xl">
          Edit <span className="font-semibold">Member</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">Update member profile information</p>
      </div>
      
      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          {success}
        </div>
      )}
      
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      
      {/* Password Field Change Warning */}
      {passwordFieldsChanged && (
        <Card className="bg-yellow-500/10 backdrop-blur-sm border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Password-related fields changed
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                  You changed fields used to generate this member's password. Click "Regenerate password" to update it and notify the member.
                </p>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={isRegenerating || isSaving}
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                  size="sm"
                >
                  {isRegenerating ? 'Regenerating...' : 'Regenerate Password & Email Member'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">First Name *</label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isSaving || isRegenerating}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Last Name *</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isSaving || isRegenerating}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Email *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSaving || isRegenerating}
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Birthday *</label>
                <Input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                  disabled={isSaving || isRegenerating}
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Phone</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSaving || isRegenerating}
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Mailing Address</label>
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State ZIP or PO Box 123"
                  disabled={isSaving || isRegenerating}
                  rows={2}
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Unit/Apt #</label>
                <Input
                  type="text"
                  placeholder="4B"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  disabled={isSaving || isRegenerating}
                  className="max-w-xs"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Card Display Text</label>
                <select
                  value={favoriteTeam}
                  onChange={(e) => {
                    setFavoriteTeam(e.target.value)
                    if (e.target.value !== 'Other') {
                      setCustomCardText('')
                    }
                  }}
                  disabled={isSaving || isRegenerating}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">None (show phone)</option>
                  <option value="49ers">49ers fan</option>
                  <option value="Raiders">Raiders fan</option>
                  <option value="Other">Custom text...</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  This will appear on the front of the profile card
                </p>
              </div>
              
              {favoriteTeam === 'Other' && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Custom Text
                  </label>
                  <Input
                    type="text"
                    value={customCardText}
                    onChange={(e) => setCustomCardText(e.target.value)}
                    placeholder="e.g., 'Dodgers fan', 'Coffee lover', 'Book enthusiast'"
                    disabled={isSaving || isRegenerating}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter any text you'd like to display on the card
                  </p>
                </div>
              )}
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Parent Member</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  disabled={isSaving || isRegenerating || isLoadingMembers}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No parent (root member)</option>
                  {availableParents
                    .filter(member => member.id !== userId)
                    .map(member => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a parent to establish family tree relationships
                </p>
              </div>
            </div>
            
            {/* Profile Photo */}
            <div className="border-t border-border/50 pt-6">
              <ProfilePhotoUpload
                currentPhotoUrl={profilePhotoUrl}
                onUploadComplete={setProfilePhotoUrl}
                onRemove={() => setProfilePhotoUrl(null)}
              />
            </div>
            
            {/* Social Media */}
            <div className="space-y-4 border-t border-border/50 pt-6">
              <h3 className="text-lg font-medium">Social Media</h3>
              
              {socialLinks.length > 0 && (
                <div className="space-y-2">
                  {socialLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 rounded-lg bg-secondary/20 p-3 border border-border/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{link.platform}</p>
                        <p className="text-xs text-muted-foreground">
                          {platformUrls[link.platform](link.handle)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSocialLink(link.id)}
                        disabled={isSaving || isRegenerating}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  {[
                    { platform: 'Instagram' as SocialPlatform, icon: Instagram },
                    { platform: 'Facebook' as SocialPlatform, icon: Facebook },
                    { platform: 'Twitter' as SocialPlatform, icon: Twitter },
                    { platform: 'LinkedIn' as SocialPlatform, icon: Linkedin },
                  ].map(({ platform, icon: Icon }) => (
                    <Button
                      key={platform}
                      type="button"
                      variant={newPlatform === platform ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setNewPlatform(platform)}
                      disabled={isSaving || isRegenerating || socialLinks.length >= 4}
                      className={cn(
                        'transition-all',
                        newPlatform === platform && 'ring-2 ring-primary ring-offset-2'
                      )}
                      title={platform}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="username"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    disabled={isSaving || isRegenerating || socialLinks.length >= 4}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addSocialLink}
                    disabled={isSaving || isRegenerating || !newHandle.trim() || socialLinks.length >= 4}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
              {socialLinks.length >= 4 && (
                <p className="text-xs text-muted-foreground">Maximum 4 social platforms</p>
              )}
            </div>
            
            {/* Submit */}
            <div className="flex gap-4 pt-6 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/members')}
                disabled={isSaving || isRegenerating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || isRegenerating}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
