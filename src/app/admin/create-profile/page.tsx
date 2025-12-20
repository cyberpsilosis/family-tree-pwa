'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus, Copy, Check } from 'lucide-react'

type SocialPlatform = 'Instagram' | 'Facebook' | 'Twitter' | 'LinkedIn'

interface SocialLink {
  id: string
  platform: SocialPlatform
  handle: string
}

interface SuccessData {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  password?: string
  emailSent?: boolean
  error?: string
}

const platformUrls: Record<SocialPlatform, (handle: string) => string> = {
  Instagram: (handle) => `https://instagram.com/${handle}`,
  Facebook: (handle) => `https://facebook.com/${handle}`,
  Twitter: (handle) => `https://x.com/${handle}`,
  LinkedIn: (handle) => `https://www.linkedin.com/in/${handle}`,
}

export default function CreateProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<SuccessData | null>(null)
  const [copied, setCopied] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [birthday, setBirthday] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [favoriteTeam, setFavoriteTeam] = useState('')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('Instagram')
  const [newHandle, setNewHandle] = useState('')
  const [parentId, setParentId] = useState('')
  const [availableParents, setAvailableParents] = useState<Array<{id: string, firstName: string, lastName: string}>>([])

  useEffect(() => {
    // Fetch existing members for parent selection
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const users = await response.json()
          setAvailableParents(Array.isArray(users) ? users : [])
        }
      } catch (error) {
        console.error('Error fetching members:', error)
      } finally {
        setIsLoadingMembers(false)
      }
    }
    fetchMembers()
  }, [])

  const addSocialLink = () => {
    if (!newHandle.trim()) return
    
    // Check if platform already exists
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Build social media object
      const socialMedia: Record<string, string> = {}
      socialLinks.forEach(link => {
        socialMedia[link.platform.toLowerCase()] = link.handle
      })

      // Use invite endpoint if sending email, otherwise use regular users endpoint
      const endpoint = sendEmail ? '/api/admin/invite' : '/api/users'
      
      // Extract birth year from birthday
      const birthDate = new Date(birthday)
      const birthYear = birthDate.getFullYear()
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          birthYear,
          birthday,
          phone: phone || undefined,
          address: address || undefined,
          favoriteTeam: favoriteTeam || undefined,
          parentId: parentId || undefined,
          socialMedia,
        }),
      })

      const data = await response.json()

      // Accept both 200 (success) and 207 (partial success - email failed)
      if (!response.ok && response.status !== 207) {
        throw new Error(data.error || 'Failed to create member')
      }

      setSuccess(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const copyPassword = () => {
    if (success && success.password) {
      navigator.clipboard.writeText(success.password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setBirthday('')
    setPhone('')
    setAddress('')
    setFavoriteTeam('')
    setParentId('')
    setSocialLinks([])
    setSuccess(null)
    setError('')
  }

  if (success) {
    return (
      <div className="relative mx-auto max-w-2xl space-y-6">
        <div className="animate-fade-up">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
            {success.emailSent ? 'Invite Sent' : 'Success'}
          </p>
          <h1 className="text-4xl font-serif font-light tracking-tight text-foreground md:text-5xl">
            Member <span className="font-semibold">Added</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {success.emailSent 
              ? 'Invite email sent successfully'
              : 'Family member has been created successfully'}
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 space-y-6">
            {success.emailSent ? (
              <>
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                  <Check className="h-6 w-6" />
                  <p className="text-lg font-medium">Email sent to {success.user.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Member Added</p>
                  <p className="text-2xl font-medium">{success.user.firstName} {success.user.lastName}</p>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <p className="text-sm text-muted-foreground mb-3">What happens next?</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>The member will receive an email with their login credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>They can access the app using the link in the email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>Installation instructions for mobile devices are included</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : success.emailSent === false && success.error ? (
              <>
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                  <p className="text-sm text-yellow-900 dark:text-yellow-100 font-medium mb-2">
                    Email Delivery Failed
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {success.error}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Member Added</p>
                  <p className="text-2xl font-medium">{success.user.firstName} {success.user.lastName}</p>
                </div>

                {success.password && (
                  <div className="border-t border-border/50 pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Generated Password</p>
                    <code className="block rounded-lg bg-secondary/50 px-4 py-3 font-mono text-lg">
                      {success.password}
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Please share this password with {success.user.firstName} manually.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Member Name</p>
                  <p className="text-2xl font-medium">{success.user.firstName} {success.user.lastName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Email</p>
                  <p className="text-lg">{success.user.email}</p>
                </div>

                {success.password && (
                  <div className="border-t border-border/50 pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Generated Password</p>
                    <p className="text-sm text-destructive-foreground mb-2">⚠️ Save this password - it will only be shown once</p>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 rounded-lg bg-secondary/50 px-4 py-3 font-mono text-lg">
                        {success.password}
                      </code>
                      <Button
                        onClick={copyPassword}
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                onClick={resetForm}
                variant="outline"
                className="flex-1"
              >
                Add Another Member
              </Button>
              <Button
                onClick={() => router.push('/admin/dashboard')}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-up">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Create</p>
        <h1 className="text-4xl font-serif font-light tracking-tight text-foreground md:text-5xl">
          Add <span className="font-semibold">Member</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">Add a new family member to the directory</p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

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
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Last Name *</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Birthday *</label>
                <Input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Phone</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Address</label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State ZIP"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Favorite Team</label>
                <select
                  value={favoriteTeam}
                  onChange={(e) => setFavoriteTeam(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a team</option>
                  <option value="49ers">49ers</option>
                  <option value="Raiders">Raiders</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Parent (Optional)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  disabled={isLoading || isLoadingMembers}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No parent (root member)</option>
                  {availableParents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.firstName} {parent.lastName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a parent to establish family tree relationships
                </p>
              </div>
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
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                  disabled={isLoading || socialLinks.length >= 4}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Twitter">Twitter</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
                <Input
                  placeholder="username"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  disabled={isLoading || socialLinks.length >= 4}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addSocialLink}
                  disabled={isLoading || !newHandle.trim() || socialLinks.length >= 4}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              {socialLinks.length >= 4 && (
                <p className="text-xs text-muted-foreground">Maximum 4 social platforms</p>
              )}
            </div>

            {/* Email Option */}
            <div className="border-t border-border/50 pt-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5 w-4 h-4 rounded border-input text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-foreground transition-colors">Send invite email to member</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {sendEmail 
                      ? 'Member will receive login credentials via email with PWA installation instructions'
                      : 'You will see the password here to share manually (email will not be sent)'}
                  </p>
                </div>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/dashboard')}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Member'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
