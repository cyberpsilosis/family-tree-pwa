'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Grid3x3, Network, ArrowUpDown, LogOut, User } from 'lucide-react'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/auth/ThemeToggle'
import { FamilyTreeView } from '@/components/family-tree/FamilyTreeView'
import { downloadVCard } from '@/lib/vcard'
import { calculateRelationship } from '@/lib/relationships'
import { useRouter } from 'next/navigation'

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
  instagram: string | null
  facebook: string | null
  twitter: string | null
  linkedin: string | null
  profilePhotoUrl: string | null
  isAdmin: boolean
  parentId: string | null
}

interface MemberHomeClientProps {
  users: User[]
  currentUserId: string
}

export function MemberHomeClient({ users, currentUserId }: MemberHomeClientProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [birthMonthFilter, setBirthMonthFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'birthday'>('name')

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery))

      const birthMonth = birthMonthFilter === 'all' ? true : 
        new Date(user.birthday + 'T00:00:00Z').getUTCMonth() + 1 === parseInt(birthMonthFilter)

      return matchesSearch && birthMonth
    })

    // Sort users
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.lastName} ${a.firstName}`.toLowerCase()
        const nameB = `${b.lastName} ${b.firstName}`.toLowerCase()
        return nameA.localeCompare(nameB)
      } else if (sortBy === 'age') {
        return new Date(a.birthday + 'T00:00:00Z').getTime() - new Date(b.birthday + 'T00:00:00Z').getTime()
      } else if (sortBy === 'birthday') {
        const dateA = new Date(a.birthday + 'T00:00:00Z')
        const dateB = new Date(b.birthday + 'T00:00:00Z')
        const monthA = dateA.getUTCMonth()
        const dayA = dateA.getUTCDate()
        const monthB = dateB.getUTCMonth()
        const dayB = dateB.getUTCDate()
        
        if (monthA !== monthB) return monthA - monthB
        return dayA - dayB
      }
      return 0
    })

    return filtered
  }, [users, searchQuery, birthMonthFilter, sortBy])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-4xl font-serif font-light tracking-tight text-foreground md:text-5xl">
              Family <span className="font-semibold">Directory</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'member' : 'members'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/profile/edit')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              title="Edit Profile"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Controls */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 space-y-4">
            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  Card View
                </button>
                <button
                  onClick={() => setViewMode('tree')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'tree'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  Family Tree
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-2">
              {/* Birth Month Filter */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground whitespace-nowrap">Birth Month:</span>
                <select
                  value={birthMonthFilter}
                  onChange={(e) => setBirthMonthFilter(e.target.value)}
                  className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm font-medium"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.value === 'all' ? 'All' : month.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2 text-sm">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'age' | 'birthday')}
                  className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm font-medium"
                >
                  <option value="name">Name</option>
                  <option value="age">Age</option>
                  <option value="birthday">Birthday</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        {viewMode === 'grid' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
          >
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProfileCard
                  user={user}
                  relationship={user.id === currentUserId ? 'Self' : calculateRelationship(currentUserId, user.id, users)}
                  variant="full"
                  onClick={() => handleViewProfile(user.id)}
                  onDownloadContact={() => handleDownloadContact(user)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FamilyTreeView users={filteredUsers} currentUserId={currentUserId} />
          </motion.div>
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
  )
}
