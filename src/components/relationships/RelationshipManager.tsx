'use client'

import { useState, useEffect } from 'react'
import { X, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Relationship {
  id: string
  userId: string
  relatedUserId: string
  relationshipType: string
  isPrimary: boolean
  relatedUser: {
    id: string
    firstName: string
    lastName: string
    profilePhotoUrl: string | null
  }
}

interface RelationshipManagerProps {
  userId: string
  availableMembers: Array<{ id: string; firstName: string; lastName: string }>
  disabled?: boolean
}

export function RelationshipManager({ userId, availableMembers, disabled = false }: RelationshipManagerProps) {
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  
  // Add relationship state
  const [relationshipType, setRelationshipType] = useState<'friend' | 'partner' | 'married'>('friend')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [unavailableRomanticPartners, setUnavailableRomanticPartners] = useState<string[]>([])

  useEffect(() => {
    loadRelationships()
    loadUnavailablePartners()
  }, [userId])

  const loadRelationships = async () => {
    try {
      const response = await fetch(`/api/relationships?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setRelationships(data)
      }
    } catch (err) {
      console.error('Failed to load relationships:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUnavailablePartners = async () => {
    try {
      const response = await fetch('/api/relationships/available')
      if (response.ok) {
        const data = await response.json()
        setUnavailableRomanticPartners(data.unavailableUserIds || [])
      }
    } catch (err) {
      console.error('Failed to load unavailable partners:', err)
    }
  }

  const addRelationship = async () => {
    if (!selectedMemberId) {
      setError('Please select a family member')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          relatedUserId: selectedMemberId,
          relationshipType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add relationship')
      }

      // Reload relationships
      await loadRelationships()
      await loadUnavailablePartners()
      
      // Reset form
      setSelectedMemberId('')
      setRelationshipType('friend')
      setIsAdding(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const removeRelationship = async (relationshipId: string) => {
    if (!confirm('Remove this relationship?')) return

    try {
      const response = await fetch(`/api/relationships/${relationshipId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadRelationships()
        await loadUnavailablePartners()
      }
    } catch (err) {
      console.error('Failed to remove relationship:', err)
    }
  }

  // Filter available members based on relationship type
  const getAvailableMembers = () => {
    let filtered = availableMembers.filter(m => m.id !== userId)
    
    // Already connected members
    const connectedIds = relationships.map(r => r.relatedUserId)
    
    // For romantic relationships, exclude those already in relationships
    if (relationshipType === 'partner' || relationshipType === 'married') {
      filtered = filtered.filter(m => 
        !unavailableRomanticPartners.includes(m.id) &&
        !connectedIds.includes(m.id)
      )
    } else {
      // For friends, allow duplicates but show if already connected
      // We'll just show all available
    }
    
    return filtered
  }

  const getRelationshipBadge = (type: string, isPrimary: boolean) => {
    let colorClass = 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600'
    if (type === 'partner') colorClass = 'bg-red-500/10 border-red-500/20 text-red-600'
    if (type === 'married') colorClass = 'bg-amber-500/10 border-amber-500/20 text-amber-600'
    
    return (
      <div className="flex items-center gap-2">
        <span className={cn(
          'px-2 py-1 text-xs rounded-md border',
          colorClass
        )}>
          {type === 'friend' && 'Friend'}
          {type === 'partner' && 'Partner'}
          {type === 'married' && 'Married'}
        </span>
        {isPrimary && (
          <span className="px-2 py-1 text-xs rounded-md border border-primary/20 bg-primary/10 text-primary">
            Primary
          </span>
        )}
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading relationships...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Relationships</h3>
        {!isAdding && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Relationship
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Existing relationships */}
      {relationships.length > 0 && (
        <div className="space-y-2">
          {relationships.map((rel) => (
            <div
              key={rel.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border/50"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {rel.relatedUser.firstName} {rel.relatedUser.lastName}
                </p>
                {getRelationshipBadge(rel.relationshipType, rel.isPrimary)}
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRelationship(rel.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new relationship form */}
      {isAdding && (
        <div className="space-y-3 p-4 rounded-lg border border-border bg-background/50">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Relationship Type
            </label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as any)}
              disabled={isSaving}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
            >
              <option value="friend">Family Friend</option>
              <option value="partner">Partner</option>
              <option value="married">Married</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {relationshipType === 'friend' && 'Can have multiple friends'}
              {relationshipType === 'partner' && 'Exclusive - only one partner allowed'}
              {relationshipType === 'married' && 'Exclusive - only one spouse allowed'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Connected To *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground"
            >
              <option value="">Select family member...</option>
              {getAvailableMembers().map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAdding(false)
                setError('')
                setSelectedMemberId('')
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={addRelationship}
              disabled={isSaving || !selectedMemberId}
            >
              {isSaving ? 'Adding...' : 'Add Relationship'}
            </Button>
          </div>
        </div>
      )}

      {relationships.length === 0 && !isAdding && (
        <p className="text-sm text-muted-foreground">No relationships added yet.</p>
      )}
    </div>
  )
}
