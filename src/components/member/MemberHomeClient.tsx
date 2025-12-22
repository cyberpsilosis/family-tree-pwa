'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Grid3x3, Network, ArrowUpDown, ArrowUp, ArrowDown, LogOut, User, ZoomIn, ZoomOut, Minimize, Maximize2, Minimize2, Menu, X, Download, Heart } from 'lucide-react'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/auth/ThemeToggle'
import { FamilyTreeView, FamilyTreeViewRef } from '@/components/family-tree/FamilyTreeView'
import { downloadVCard, downloadAllContactsVCard } from '@/lib/vcard'
import { calculateRelationship } from '@/lib/relationships'
import { useRouter } from 'next/navigation'
import { ReactFlowProvider, useReactFlow } from 'reactflow'
import { getLogoIconPath } from '@/lib/logo-utils'
import Image from 'next/image'
import { DonateModal } from '@/components/donate/donate-modal'

type ViewMode = 'grid' | 'tree'

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
  parentId: string | null
  parent2Id: string | null
  friendId: string | null
  relationshipType: string | null
  preferredContactMethod: string | null
}

interface Relationship {
  id: string
  userId: string
  relatedUserId: string
  relationshipType: 'friend' | 'partner' | 'married'
  isPrimary: boolean
  createdAt?: Date
}

interface MemberHomeClientProps {
  users: User[]
  relationships: Relationship[]
  currentUserId: string
}

// Tree controls component that uses ReactFlow hooks
function TreeControls({ isFullscreen, onToggleFullscreen }: { isFullscreen: boolean, onToggleFullscreen: () => void }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <div className="flex gap-3">
      <Button
        onClick={() => zoomIn()}
        variant="secondary"
        size="default"
        className="h-11 px-5"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5" />
      </Button>
      <Button
        onClick={() => zoomOut()}
        variant="secondary"
        size="default"
        className="h-11 px-5"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5" />
      </Button>
      <Button
        onClick={() => fitView({ padding: 0.2 })}
        variant="secondary"
        size="default"
        className="h-11 px-5"
        title="Center View"
      >
        <Minimize className="w-5 h-5" />
      </Button>
      <Button
        onClick={onToggleFullscreen}
        variant="secondary"
        size="default"
        className="h-11 px-5"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 className="w-5 h-5" />
        ) : (
          <Maximize2 className="w-5 h-5" />
        )}
      </Button>
    </div>
  )
}

function MemberHomeClientInner({ users, relationships, currentUserId }: MemberHomeClientProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [birthMonthFilter, setBirthMonthFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'birthday'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [currentDonations, setCurrentDonations] = useState(0)
  const treeViewRef = useRef<FamilyTreeViewRef>(null)

  // Get current user info
  const currentUser = users.find(u => u.id === currentUserId)

  // Fetch current donation total
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch('/api/donations')
        const data = await res.json()
        if (data.total) {
          setCurrentDonations(data.total)
        }
      } catch (err) {
        console.error('Failed to fetch donations:', err)
      }
    }
    fetchDonations()
  }, [])

  // Search suggestions for tree view
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || viewMode !== 'tree') return []
    return users
      .filter(user => 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5)
  }, [users, searchQuery, viewMode])

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery))

      // Only apply birth month filter in grid view
      const birthMonth = viewMode === 'grid' && birthMonthFilter !== 'all' ? 
        new Date(user.birthday + 'T00:00:00Z').getUTCMonth() + 1 === parseInt(birthMonthFilter)
        : true

      return matchesSearch && birthMonth
    })

    // Sort users (only in grid view)
    if (viewMode === 'grid') {
      filtered.sort((a, b) => {
        let comparison = 0
        
        if (sortBy === 'name') {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
          comparison = nameA.localeCompare(nameB)
        } else if (sortBy === 'age') {
          // Sort by age: older people first (earlier birthdays = smaller timestamps)
          comparison = new Date(a.birthday).getTime() - new Date(b.birthday).getTime()
        } else if (sortBy === 'birthday') {
          // Sort by birthday: January to December
          const dateA = new Date(a.birthday)
          const dateB = new Date(b.birthday)
          const monthA = dateA.getMonth()
          const dayA = dateA.getDate()
          const monthB = dateB.getMonth()
          const dayB = dateB.getDate()
          
          if (monthA !== monthB) {
            comparison = monthA - monthB
          } else {
            comparison = dayA - dayB
          }
        }
        
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [users, searchQuery, birthMonthFilter, sortBy, sortDirection, viewMode])

  const months = [
    { value: 'all', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  const handleDownloadContact = (user: User) => {
    downloadVCard({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      birthday: user.birthday,
      profilePhotoUrl: user.profilePhotoUrl,
      instagram: user.instagram,
      facebook: user.facebook,
      twitter: user.twitter,
      linkedin: user.linkedin,
    })
  }

  const handleViewProfile = (userId: string) => {
    router.push(`/profile/${userId}`)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleDownloadAllContacts = () => {
    downloadAllContactsVCard(users.map(user => ({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      birthday: user.birthday,
      profilePhotoUrl: user.profilePhotoUrl,
      instagram: user.instagram,
      facebook: user.facebook,
      twitter: user.twitter,
      linkedin: user.linkedin,
    })))
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Fixed mobile menu button - only hamburger stays locked */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card transition-colors shadow-lg"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl w-full flex flex-col gap-6 p-4 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mobile Header - Centered Logo */}
            <div className="md:hidden flex flex-col items-center gap-2 pt-12">
              {/* Logo centered at top */}
              <div className="flex justify-center">
                <Image
                  src={getLogoIconPath(192)}
                  alt="Family Tree Logo"
                  width={56}
                  height={56}
                />
              </div>
              
              {/* Title and member count */}
              <div className="text-center">
                <h1 className="text-3xl font-serif font-light tracking-tight text-foreground">
                  Family <span className="font-semibold">Tree</span>
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'member' : 'members'}
                </p>
              </div>

            </div>
          </motion.div>

          {/* Mobile dropdown menu - Fixed positioning */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden fixed top-16 right-4 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[200px]"
            >
                <button
                  onClick={() => {
                    router.push('/profile/edit')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <User className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => {
                    handleDownloadAllContacts()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All Contacts</span>
                </button>
                <button
                  onClick={() => {
                    setShowDonateModal(true)
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-forest/20 text-forest transition-colors text-left border border-forest/30"
                >
                  <Heart className="w-4 h-4" />
                  <span>Donate</span>
                </button>
                <div className="flex items-center gap-2 px-4 py-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Desktop Header - Original Layout */}
            <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Image
                  src={getLogoIconPath(192)}
                  alt="Family Tree Logo"
                  width={64}
                  height={64}
                />
              </div>
              <div>
                <h1 className="text-5xl font-serif font-light tracking-tight text-foreground">
                  Family <span className="font-semibold">Tree</span>
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/profile/edit')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                title="Edit Profile"
              >
                <User className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={handleDownloadAllContacts}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                title="Download All Contacts"
              >
                <Download className="w-4 h-4" />
                <span>Download Contacts</span>
              </button>
              <button
                onClick={() => setShowDonateModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest/15 border border-forest/30 text-forest hover:bg-forest/20 hover:border-forest/40 transition-colors shadow-[0_0_20px_rgba(163,213,163,0.4)] hover:shadow-[0_0_25px_rgba(163,213,163,0.5)]"
                title="Donate"
              >
                <Heart className="w-4 h-4" />
                <span>Donate</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
              <ThemeToggle />
            </div>
            </div>
          </motion.div>

          {/* Controls - Hide in fullscreen tree view */}
          {!(viewMode === 'tree' && isFullscreen) && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 py-0">
            <CardContent className="p-4 space-y-4">
              {/* View Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span>Card View</span>
                </button>
                <button
                  onClick={() => setViewMode('tree')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'tree'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  <span>Tree View</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={viewMode === 'tree' ? "Search by name..." : "Search by name, email, or phone..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (viewMode === 'tree') {
                      setShowSearchSuggestions(e.target.value.trim().length > 0)
                    }
                  }}
                  onFocus={() => viewMode === 'tree' && searchQuery.trim().length > 0 && setShowSearchSuggestions(true)}
                  className="pl-10 h-10"
                />
                {/* Search suggestions for tree view */}
                {viewMode === 'tree' && showSearchSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                    {searchSuggestions.map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                          treeViewRef.current?.focusOnPerson(user.id)
                          setShowSearchSuggestions(false)
                          setSearchQuery('')
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-secondary transition-colors flex items-center gap-2"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.friendId ? 'Family Friend' : (user.id === currentUserId ? 'Self' : calculateRelationship(currentUserId, user.id, users))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filters and Sort - Only show in grid view */}
              {viewMode === 'grid' && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs sm:text-sm">
                  {/* Birth Month Filter */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-muted-foreground whitespace-nowrap hidden sm:inline">Birth Month:</span>
                    <span className="text-muted-foreground whitespace-nowrap sm:hidden">Month:</span>
                    <select
                      value={birthMonthFilter}
                      onChange={(e) => setBirthMonthFilter(e.target.value)}
                      className="flex-1 min-w-0 rounded-lg border border-input bg-background px-2 py-2 text-xs sm:text-sm font-medium h-10"
                    >
                      {months.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.value === 'all' ? 'All' : month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <button
                      onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="flex-shrink-0 p-1.5 rounded hover:bg-secondary transition-colors"
                      title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {sortDirection === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      )}
                    </button>
                    <span className="text-muted-foreground whitespace-nowrap">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'age' | 'birthday')}
                      className="flex-1 min-w-0 rounded-lg border border-input bg-background px-2 py-2 text-xs sm:text-sm font-medium h-10"
                    >
                      <option value="name">Name</option>
                      <option value="age">Age</option>
                      <option value="birthday">Birthday</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Tree Controls - Show in tree view */}
              {viewMode === 'tree' && (
                <TreeControls isFullscreen={isFullscreen} onToggleFullscreen={() => setIsFullscreen(!isFullscreen)} />
              )}
            </CardContent>
          </Card>
          )}

          {/* Content Area */}
          <div className="pb-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start justify-items-center">
                {filteredUsers.map((user, index) => (
              <ProfileCard
                key={user.id}
                user={user}
                relationship={user.friendId ? 'Family Friend' : (user.id === currentUserId ? 'Self' : calculateRelationship(currentUserId, user.id, users))}
                variant="full"
                onClick={() => handleViewProfile(user.id)}
                onDownloadContact={() => handleDownloadContact(user)}
                />
                ))}
              </div>
            ) : (
              <div className={isFullscreen ? "fixed inset-0 z-50 bg-gradient-to-br from-background via-background to-primary/5 p-4" : "h-[600px] flex flex-col"}>
                {isFullscreen && (
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-light tracking-tight text-foreground">
                      Family <span className="font-semibold">Tree</span>
                    </h2>
                    <TreeControls isFullscreen={isFullscreen} onToggleFullscreen={() => setIsFullscreen(!isFullscreen)} />
                  </div>
                )}
                <FamilyTreeView 
                  ref={treeViewRef}
                  users={users}
                  relationships={relationships}
                  currentUserId={currentUserId}
                  isFullscreen={isFullscreen}
                />
              </div>
            )}

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No members found. Try adjusting your search or filters.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Donate Modal */}
      <DonateModal 
        isOpen={showDonateModal} 
        onClose={() => setShowDonateModal(false)}
        currentDonations={currentDonations}
        userEmail={currentUser?.email}
        userName={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : undefined}
      />
    </div>
  )
}

// Main export with ReactFlow provider
export function MemberHomeClient(props: MemberHomeClientProps) {
  return (
    <ReactFlowProvider>
      <MemberHomeClientInner {...props} />
    </ReactFlowProvider>
  )
}
