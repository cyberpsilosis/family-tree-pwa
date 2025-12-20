'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/auth/ThemeToggle'
import { ProfileCard } from '@/components/profile/ProfileCard'

// Mock user data for preview
const mockUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com',
    phone: '555-0123',
    birthday: '1990-05-15',
    birthYear: 1990,
    favoriteTeam: '49ers',
    instagram: 'https://instagram.com/johnsmith',
    facebook: 'https://facebook.com/johnsmith',
    twitter: null,
    linkedin: 'https://www.linkedin.com/in/johnsmith',
    profilePhotoUrl: null,
    isAdmin: false,
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@example.com',
    phone: '555-0456',
    birthday: '1985-12-20',
    birthYear: 1985,
    favoriteTeam: 'Raiders',
    instagram: 'https://instagram.com/sarahj',
    facebook: null,
    twitter: 'https://x.com/sarahj',
    linkedin: null,
    profilePhotoUrl: null,
    isAdmin: true,
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael@example.com',
    phone: null,
    birthday: '2000-03-08',
    birthYear: 2000,
    favoriteTeam: 'Other',
    instagram: null,
    facebook: null,
    twitter: null,
    linkedin: null,
    profilePhotoUrl: null,
    isAdmin: false,
  },
]

export default function PreviewPage() {
  const [selectedView, setSelectedView] = useState<'grid' | 'compact'>('grid')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-serif font-light tracking-tight text-foreground">
              Component <span className="font-semibold">Preview</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Development preview for ProfileCard components
            </p>
          </div>
          <ThemeToggle />
        </div>
        
        {/* View Toggle */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedView('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Grid View (Full Cards)
              </button>
              <button
                onClick={() => setSelectedView('compact')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'compact'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Compact View (Tree Nodes)
              </button>
            </div>
          </CardContent>
        </Card>
        
        {/* Preview Area */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium">
            {selectedView === 'grid' ? 'Full Profile Cards' : 'Compact Tree Nodes'}
          </h2>
          
          <div className={selectedView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start' : 'flex flex-wrap gap-4'}>
            {mockUsers.map((user, index) => (
              <ProfileCard
                key={user.id}
                user={user}
                variant={selectedView === 'compact' ? 'compact' : 'full'}
                relationship={index === 0 ? 'Cousin' : index === 1 ? 'Aunt' : undefined}
                onClick={() => alert(`View profile: ${user.firstName} ${user.lastName}`)}
                onDownloadContact={() => alert(`Download contact: ${user.firstName} ${user.lastName}`)}
              />
            ))}
          </div>
        </div>
        
        {/* Component Specs */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Component Specifications</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Full Card Size:</div>
                <div className="font-mono">Variable (responsive)</div>
                
                <div className="text-muted-foreground">Compact Node Size:</div>
                <div className="font-mono">200px × auto</div>
                
                <div className="text-muted-foreground">Design Style:</div>
                <div>Glassmorphism</div>
                
                <div className="text-muted-foreground">Hover Effect:</div>
                <div>Border glow (primary/50)</div>
                
                <div className="text-muted-foreground">Animation:</div>
                <div>Framer Motion fade-in-up</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
