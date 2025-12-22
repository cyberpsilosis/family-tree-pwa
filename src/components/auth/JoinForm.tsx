'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus, Instagram, Facebook, Twitter, Linkedin, CheckCircle2, PartyPopper } from 'lucide-react'
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
  const [favoriteTeam, setFavoriteTeam] = useState('')
  const [customCardText, setCustomCardText] = useState('')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('Instagram')
  const [newHandle, setNewHandle] = useState('')
  const [parentId, setParentId] = useState('')
  const [parent2Id, setParent2Id] = useState('')
  const [friendId, setFriendId] = useState('')
  const [relationshipType, setRelationshipType] = useState('')
  const [availableParents, setAvailableParents] = useState<Array<{id: string, firstName: string, lastName: string}>>([])
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

      const birthDate = new Date(birthday)
      const birthYear = birthDate.getFullYear()
      
      const response = await fetch('/api/admin/invite', {
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
          favoriteTeam: favoriteTeam || undefined,
          customCardText: customCardText || undefined,
          parentId: parentId || undefined,
          parent2Id: parent2Id || undefined,
          friendId: friendId || undefined,
          relationshipType: relationshipType || undefined,
          profilePhotoUrl: profilePhotoUrl || undefined,
          isDeceased: false,
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

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Phone Number (Optional)
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="bg-background/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Favorite Team (Optional)
                </label>
                <select
                  value={favoriteTeam}
                  onChange={(e) => setFavoriteTeam(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground"
                >
                  <option value="">Select team...</option>
                  <option value="49ers">49ers</option>
                  <option value="Raiders">Raiders</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Address (Optional)
              </label>
              <AddressAutocomplete
                value={address}
                onChange={setAddress}
                unitNumber={unitNumber}
                onUnitNumberChange={setUnitNumber}
                placeholder="123 Main St, City, State ZIP"
              />
            </div>

            {/* Family Relationships */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Family Relationships (Optional)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Parent 1 (Optional)
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => {
                      setParentId(e.target.value)
                      if (e.target.value) {
                        setFriendId('') // Clear friend if parent is selected
                      }
                    }}
                    disabled={isLoadingMembers}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground"
                  >
                    <option value="">No parent 1</option>
                    {availableParents.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.firstName} {parent.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Parent 2 (Optional)
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
                    className="w-full h-10 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground"
                  >
                    <option value="">No parent 2</option>
                    {availableParents.filter(p => p.id !== parentId).map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.firstName} {parent.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!parentId && !parent2Id && (
                <div className="space-y-4 border-t border-border/50 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Relationship Type (Optional)
                    </label>
                    <select
                      value={relationshipType}
                      onChange={(e) => {
                        setRelationshipType(e.target.value)
                        if (!e.target.value) {
                          setFriendId('') // Clear friend if no relationship type
                        }
                      }}
                      disabled={isLoadingMembers}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground"
                    >
                      <option value="">No relationship</option>
                      <option value="friend">Family Friend</option>
                      <option value="partner">Partner</option>
                      <option value="married">Married</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select relationship type for non-blood relatives
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
                        className="w-full h-10 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground"
                      >
                        <option value="">Select family member...</option>
                        {availableParents.map((friend) => (
                          <option key={friend.id} value={friend.id}>
                            {friend.firstName} {friend.lastName}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {relationshipType === 'married' && 'Gold line will connect to spouse'}
                        {relationshipType === 'partner' && 'Red line will connect to partner'}
                        {relationshipType === 'friend' && 'Cyan line will connect to friend (placed at same tree level)'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Social Media */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Social Media (Optional)
              </label>
              
              {socialLinks.length > 0 && (
                <div className="space-y-2 mb-3">
                  {socialLinks.map(link => (
                    <div key={link.id} className="flex items-center gap-2 p-2 rounded-md bg-background/30 backdrop-blur-sm">
                      {link.platform === 'Instagram' && <Instagram className="w-4 h-4 text-forest" />}
                      {link.platform === 'Facebook' && <Facebook className="w-4 h-4 text-forest" />}
                      {link.platform === 'Twitter' && <Twitter className="w-4 h-4 text-forest" />}
                      {link.platform === 'LinkedIn' && <Linkedin className="w-4 h-4 text-forest" />}
                      <span className="text-sm flex-1">{platformUrls[link.platform](link.handle)}</span>
                      <button
                        type="button"
                        onClick={() => removeSocialLink(link.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {socialLinks.length < 4 && (
                <div className="flex gap-2">
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                    className="h-10 px-3 rounded-md border border-input bg-background/50 backdrop-blur-sm text-foreground"
                  >
                    {(['Instagram', 'Facebook', 'Twitter', 'LinkedIn'] as SocialPlatform[])
                      .filter(p => !socialLinks.some(link => link.platform === p))
                      .map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))
                    }
                  </select>
                  <Input
                    type="text"
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    placeholder="username"
                    className="flex-1 bg-background/50 backdrop-blur-sm"
                  />
                  <Button
                    type="button"
                    onClick={addSocialLink}
                    variant="outline"
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Custom Card Text */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Custom Card Message (Optional)
              </label>
              <Input
                type="text"
                value={customCardText}
                onChange={(e) => setCustomCardText(e.target.value)}
                placeholder="A personal message for your profile card"
                className="bg-background/50 backdrop-blur-sm"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customCardText.length}/100 characters
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12"
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
