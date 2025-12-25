'use client'
// v2.0 - Fixed registration endpoint
import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus, Instagram, Facebook, Twitter, Linkedin, CheckCircle2, PartyPopper, Copy } from 'lucide-react'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { NameAutocomplete } from '@/components/ui/NameAutocomplete'
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete'
import ProfilePhotoUpload from '@/components/admin/ProfilePhotoUpload'
import { formatAddressWithUnit } from '@/lib/address'

type SocialPlatform = 'Instagram' | 'Facebook' | 'Twitter' | 'LinkedIn'

interface SocialLink {
  id: string
  platform: SocialPlatform
  handle: string
}

const platformUrls: Record<SocialPlatform, (handle: string) => string> = {
  Instagram: (handle) => `https://instagram.com/${handle}`,
  Facebook: (handle) => `https://facebook.com/${handle}`,
  Twitter: (handle) => `https://x.com/${handle}`,
  LinkedIn: (handle) => `https://www.linkedin.com/in/${handle}`,
}

export function JoinForm() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [birthday, setBirthday] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingUnitNumber, setShippingUnitNumber] = useState('')
  const [favoriteTeam, setFavoriteTeam] = useState('')
  const [customCardText, setCustomCardText] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [occupation, setOccupation] = useState('')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('Instagram')
  const [newHandle, setNewHandle] = useState('')
  const [parentId, setParentId] = useState('')
  const [parent2Id, setParent2Id] = useState('')
  const [friendId, setFriendId] = useState('')
  const [relationshipType, setRelationshipType] = useState('')
  const [showFamilyTooltip, setShowFamilyTooltip] = useState(false)
  const [availableParents, setAvailableParents] = useState<Array<{id: string, firstName: string, lastName: string, birthday?: string, parentId?: string | null, parent2Id?: string | null}>>([])
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    // Fetch existing members for parent selection
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/users?public=true')
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

  // WebGL background animation (same as login screen)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2')
    if (!gl) return

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const vertexShaderSource = `#version 300 es
      in vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fragmentShaderSource = `#version 300 es
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform vec2 mouse;
      out vec4 fragColor;

      vec3 palette(float t) {
        vec3 a = vec3(0.4, 0.6, 0.4);
        vec3 b = vec3(0.3, 0.5, 0.3);
        vec3 c = vec3(0.6, 0.8, 0.6);
        vec3 d = vec3(0.263, 0.516, 0.357);
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        vec2 uv0 = uv;
        
        vec2 mouseFromCenter = mouse - 0.5;
        float distanceFromCenter = length(mouseFromCenter);
        
        vec2 mouseUV = (mouse * 2.0 - 1.0) * vec2(resolution.x / resolution.y, 1.0);
        
        float distFromMouse = length(uv - mouseUV);
        float mouseInfluence = smoothstep(0.8, 0.0, distFromMouse);
        
        vec2 dirToMouse = (mouseUV - uv) * mouseInfluence * 0.3;
        uv += dirToMouse;
        
        vec2 mouseOffset = mouseFromCenter * 0.05;
        uv0 += mouseOffset;
        
        uv.y += sin(uv.x * 3.0 + time + distanceFromCenter * 0.5) * distanceFromCenter * 0.02;
        uv.x += cos(uv.y * 3.0 + time + distanceFromCenter * 0.5) * distanceFromCenter * 0.02;
        
        vec3 finalColor = vec3(0.0);
        
        for (float i = 0.0; i < 4.0; i++) {
          uv = fract(uv * 1.5) - 0.5;
          
          float d = length(uv) * exp(-length(uv0));
          
          vec3 col = palette(length(uv0) + i * 0.4 + time * 0.4 + distanceFromCenter * 0.03);
          
          float animSpeed = 1.0 + distanceFromCenter * 0.05;
          d = sin(d * 8.0 + time * animSpeed + distanceFromCenter * 0.2) / 8.0;
          d = abs(d);
          
          float intensity = 1.2 + distanceFromCenter * 0.03;
          d = pow(0.01 / d, intensity);
          
          finalColor += col * d;
        }
        
        fragColor = vec4(finalColor, 1.0);
      }
    `

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) return

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) return

    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')

    const resolutionLocation = gl.getUniformLocation(program, 'resolution')
    const timeLocation = gl.getUniformLocation(program, 'time')
    const mouseLocation = gl.getUniformLocation(program, 'mouse')

    gl.useProgram(program)

    const startTime = Date.now()
    const render = () => {
      const time = (Date.now() - startTime) * 0.001

      const lerpFactor = 0.08
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * lerpFactor
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * lerpFactor

      // Bind buffer and set up vertex attributes for each frame
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform1f(timeLocation, time)
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(buffer)
    }
  }, [])

  const firstNameSuggestions = useMemo(() => {
    return [...new Set(availableParents.map(p => p.firstName))]
  }, [availableParents])

  const lastNameSuggestions = useMemo(() => {
    return [...new Set(availableParents.map(p => p.lastName))]
  }, [availableParents])

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

  // Get siblings (members who share same parent(s))
  const getSiblingIds = useMemo(() => {
    if (!parentId && !parent2Id) return []
    
    return availableParents
      .filter(member => {
        // Check if they share at least one parent
        const shareParent1 = parentId && (member.parentId === parentId || member.parent2Id === parentId)
        const shareParent2 = parent2Id && (member.parentId === parent2Id || member.parent2Id === parent2Id)
        
        return shareParent1 || shareParent2
      })
      .map(m => m.id)
  }, [availableParents, parentId, parent2Id])

  // Filter members who are 16+ for parents, partners, and spouses
  const eligibleForParentsAndPartners = useMemo(() => {
    return availableParents.filter(member => {
      const age = calculateAge(member.birthday)
      return age !== null && age >= 16
    })
  }, [availableParents])

  // Filter for romantic partners (excludes parents and siblings)
  const eligibleForRomanticPartners = useMemo(() => {
    const parentIds = [parentId, parent2Id].filter(Boolean)
    const siblingIds = getSiblingIds
    
    return eligibleForParentsAndPartners.filter(member => {
      // Exclude parents
      if (parentIds.includes(member.id)) return false
      
      // Exclude siblings
      if (siblingIds.includes(member.id)) return false
      
      return true
    })
  }, [eligibleForParentsAndPartners, parentId, parent2Id, getSiblingIds])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const socialMedia: Record<string, string> = {}
      socialLinks.forEach(link => {
        socialMedia[link.platform.toLowerCase()] = link.handle
      })

      const fullAddress = address ? formatAddressWithUnit(address, unitNumber) : undefined
      const fullShippingAddress = shippingAddress ? formatAddressWithUnit(shippingAddress, shippingUnitNumber) : undefined

      const birthDate = new Date(birthday)
      const birthYear = birthDate.getFullYear()
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: email || undefined,
          birthYear,
          birthday,
          phone: phone || undefined,
          address: fullAddress || undefined,
          shippingAddress: fullShippingAddress || undefined,
          favoriteTeam: favoriteTeam || undefined,
          customCardText: customCardText || undefined,
          jobTitle: jobTitle || undefined,
          occupation: occupation || undefined,
          parentId: parentId || undefined,
          parent2Id: parent2Id || undefined,
          friendId: friendId || undefined,
          relationshipType: relationshipType || undefined,
          profilePhotoUrl: profilePhotoUrl || undefined,
          socialMedia,
        }),
      })

      const data = await response.json()

      if (!response.ok && response.status !== 207) {
        throw new Error(data.error || 'Failed to add your profile')
      }

      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="dark relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 backdrop-blur-2xl bg-background/20" />

        <div className="relative z-10 w-full max-w-md">
          <Card className="glass-card p-8 text-center">
            <PartyPopper className="w-16 h-16 mx-auto mb-4 text-forest" />
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to the Family!</h2>
            <p className="text-muted-foreground mb-6">
              Your profile has been added to the family tree. You'll receive an email with your login credentials shortly.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Login
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="dark relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 backdrop-blur-2xl bg-background/20" />

      <div className="relative z-10 w-full max-w-2xl my-8">
        <Card className="glass-card p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2 font-[family-name:var(--font-celtic)]">
              Add Yourself to the Family Tree
            </h1>
            <p className="text-sm text-muted-foreground">
              Fill out the form below to join the family directory
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-6">
            {/* Quick Info Banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <span className="font-semibold">Quick start:</span> Only 4 required fields - Name, Email & Birthday. Everything else is optional!
              </p>
            </div>
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Profile Photo (Optional)
              </label>
              <ProfilePhotoUpload
                currentPhotoUrl={profilePhotoUrl}
                onUploadComplete={setProfilePhotoUrl}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  First Name <span className="text-destructive">*</span>
                </label>
                <NameAutocomplete
                  value={firstName}
                  onChange={setFirstName}
                  suggestions={firstNameSuggestions}
                  placeholder="First name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <NameAutocomplete
                  value={lastName}
                  onChange={setLastName}
                  suggestions={lastNameSuggestions}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Birthday <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Optional Contact & Personal Details - Collapsible on Mobile */}
            <CollapsibleSection
              title="Contact & Personal Details"
              icon="📝"
              badge="Optional"
              defaultOpen={false}
            >
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Job Title
                </label>
                <Input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Software Engineer, Teacher, Retired"
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Occupation/Industry
                </label>
                <Input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g., Technology, Healthcare, Education"
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>

              {/* Card Display Text */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Card Display Text
                  </label>
                  <InfoTooltip
                    title="Profile Card Tagline"
                    content="This text appears on your profile card in the family tree. It's a fun way to show your personality! Leave it blank to display your phone number instead."
                    icon="🎨"
                  />
                </div>
                <select
                  value={favoriteTeam}
                  onChange={(e) => {
                    setFavoriteTeam(e.target.value)
                    if (e.target.value !== 'Other') {
                      setCustomCardText('')
                    }
                  }}
                  className="w-full h-12 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground touch-manipulation"
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
              {favoriteTeam === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Custom Text
                  </label>
                  <Input
                    type="text"
                    value={customCardText}
                    onChange={(e) => setCustomCardText(e.target.value)}
                    placeholder="e.g., 'Dodgers fan', 'Coffee lover', 'Book enthusiast'"
                    className="bg-background/50 backdrop-blur-sm"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {customCardText.length}/100 characters
                  </p>
                </div>
              )}
            </CollapsibleSection>

            {/* Addresses - Collapsible */}
            <CollapsibleSection
              title="Addresses"
              icon="🏠"
              badge="Optional"
              defaultOpen={false}
            >
              {/* Physical Address */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Physical Address
                </label>
                <AddressAutocomplete
                  value={address}
                  onChange={setAddress}
                  unitNumber={unitNumber}
                  onUnitNumberChange={setUnitNumber}
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-muted-foreground">
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
                      setShippingAddress(address)
                      setShippingUnitNumber(unitNumber)
                    }}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Same as physical
                  </button>
                </div>
                <AddressAutocomplete
                  value={shippingAddress}
                  onChange={setShippingAddress}
                  unitNumber={shippingUnitNumber}
                  onUnitNumberChange={setShippingUnitNumber}
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>
            </CollapsibleSection>

            {/* Family Relationships - Collapsible */}
            <CollapsibleSection
              title="Family Relationships"
              icon="👨‍👩‍👧‍👦"
              badge="Optional"
              defaultOpen={false}
            >
              {/* Prominent info banner */}
              <div className="bg-[#FFB7C5]/20 border border-[#FFB7C5] rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">🌸</span>
                    <span className="text-sm font-medium text-foreground">Can't find someone? Click to learn why →</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFamilyTooltip(true)}
                    className="px-3 py-1.5 bg-[#FFB7C5] hover:bg-[#FF9BB0] text-gray-900 font-medium rounded-md transition-colors text-sm whitespace-nowrap touch-manipulation"
                  >
                    Read More
                  </button>
                </div>
              </div>

              {/* Hidden tooltip that opens when button is clicked */}
              {showFamilyTooltip && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-[100]"
                    onClick={() => setShowFamilyTooltip(false)}
                  />
                  <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm z-[101]">
                    <div className="bg-[#FFB7C5] text-gray-900 rounded-xl shadow-2xl p-5 relative">
                      <button
                        onClick={() => setShowFamilyTooltip(false)}
                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="flex items-start gap-2 mb-3 pr-8">
                        <span className="text-xl flex-shrink-0">🌸</span>
                        <h3 className="font-semibold text-lg leading-tight">Family Members</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-800">
                        Not all family members may be available in the relationship options until they join. Don't worry - you can add additional relationships later in your profile settings!
                      </p>
                      <button
                        onClick={() => setShowFamilyTooltip(false)}
                        className="mt-4 w-full py-2.5 px-4 bg-white/90 hover:bg-white text-gray-900 font-medium rounded-lg transition-colors"
                      >
                        Got it!
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-muted-foreground">
                      Parent/Guardian (Optional)
                    </label>
                    <InfoTooltip
                      title="Can't Find Your Parent?"
                      content="Not everyone has joined the family tree yet! You can always update your parent information later from your profile settings after they join."
                      icon="👨‍👩‍👧"
                    />
                  </div>
                  <select
                    value={parentId}
                    onChange={(e) => {
                      setParentId(e.target.value)
                      if (e.target.value) {
                        setFriendId('') // Clear friend if parent is selected
                      }
                    }}
                    disabled={isLoadingMembers}
                    className="w-full h-12 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground touch-manipulation"
                  >
                    <option value="">No parent 1</option>
                    {eligibleForParentsAndPartners.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.firstName} {parent.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Other Parent/Guardian (Optional)
                  </label>
                  <select
                    value={parent2Id}
                    onChange={(e) => {
                      setParent2Id(e.target.value)
                      if (e.target.value) {
                        setFriendId('') // Clear friend if parent is selected
                      }
                    }}
                    disabled={isLoadingMembers}
                    className="w-full h-12 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground touch-manipulation"
                  >
                    <option value="">No parent 2</option>
                    {eligibleForParentsAndPartners.filter(p => p.id !== parentId).map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.firstName} {parent.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 border-t border-border/50 pt-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-muted-foreground">
                      Additional Connection (Optional)
                    </label>
                    <InfoTooltip
                      title="Special Relationships"
                      content="Create a colored line in the family tree to show close relationships like partners, spouses, or family friends. Partners and spouses must be 16+ and cannot be parents or siblings."
                      icon="💕"
                    />
                  </div>
                  <select
                    value={relationshipType}
                    onChange={(e) => {
                      setRelationshipType(e.target.value)
                      if (!e.target.value) {
                        setFriendId('') // Clear friend if no relationship type
                      }
                    }}
                    disabled={isLoadingMembers}
                    className="w-full h-12 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground touch-manipulation"
                  >
                    <option value="">None</option>
                    <option value="friend">Family Friend</option>
                    <option value="partner">Partner</option>
                    <option value="married">Married</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect to a friend, partner, or spouse (separate from parent relationships)
                  </p>
                </div>

                {relationshipType && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Connected To *
                    </label>
                    <select
                      value={friendId}
                      onChange={(e) => setFriendId(e.target.value)}
                      disabled={isLoadingMembers}
                      className="w-full h-12 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground touch-manipulation"
                    >
                      <option value="">Select family member...</option>
                      {(relationshipType === 'friend' ? availableParents : eligibleForRomanticPartners).map((friend) => (
                        <option key={friend.id} value={friend.id}>
                          {friend.firstName} {friend.lastName}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {relationshipType === 'married' && 'Gold line will connect to spouse (must be 16+, excludes parents and siblings)'}
                      {relationshipType === 'partner' && 'Red line will connect to partner (must be 16+, excludes parents and siblings)'}
                      {relationshipType === 'friend' && 'Cyan line will connect to friend (placed at same tree level)'}
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Social Media - Collapsible */}
            <CollapsibleSection
              title="Social Media"
              icon="📱"
              badge="Optional"
              defaultOpen={false}
            >
              
              {/* Existing Links */}
              {socialLinks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {socialLinks.map(link => {
                    const platformIcons = {
                      Instagram: Instagram,
                      Facebook: Facebook,
                      Twitter: Twitter,
                      LinkedIn: Linkedin,
                    }
                    const Icon = platformIcons[link.platform]
                    return (
                      <div
                        key={link.id}
                        className="flex items-center gap-3 rounded-lg bg-secondary/20 p-3 border border-border/50"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{link.platform}</p>
                          <p className="text-xs text-muted-foreground">
                            {platformUrls[link.platform](link.handle)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSocialLink(link.id)}
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
              {socialLinks.length < 4 && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {[
                      { platform: 'Instagram' as SocialPlatform, icon: Instagram },
                      { platform: 'Facebook' as SocialPlatform, icon: Facebook },
                      { platform: 'Twitter' as SocialPlatform, icon: Twitter },
                      { platform: 'LinkedIn' as SocialPlatform, icon: Linkedin },
                    ].map(({ platform, icon: Icon }) => {
                      const isSelected = newPlatform === platform
                      const isDisabled = socialLinks.some(link => link.platform === platform)
                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => setNewPlatform(platform)}
                          disabled={isDisabled}
                          className={`flex-1 p-4 rounded-lg border transition-all touch-manipulation ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2'
                              : 'bg-background/50 backdrop-blur-sm border-border hover:border-primary/50'
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
                    <Input
                      type="text"
                      placeholder="username"
                      value={newHandle}
                      onChange={(e) => setNewHandle(e.target.value)}
                      className="flex-1 bg-background/50 backdrop-blur-sm"
                    />
                    <Button
                      type="button"
                      onClick={addSocialLink}
                      disabled={!newHandle.trim()}
                      variant="outline"
                      className="px-4 h-12 touch-manipulation"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              )}
              
              {socialLinks.length >= 4 && (
                <p className="text-xs text-muted-foreground mt-2">Maximum 4 social platforms</p>
              )}
              
              {socialLinks.length === 0 && (
                <p className="text-sm text-muted-foreground">No social media links added yet.</p>
              )}
            </CollapsibleSection>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base touch-manipulation"
              disabled={isLoading}
            >
              {isLoading ? 'Adding Your Profile...' : 'Join the Family Tree'}
            </Button>

            <div className="text-center">
              <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← Back to login
              </a>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
