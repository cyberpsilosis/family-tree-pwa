'use client'

import { Handle, Position } from 'reactflow'
import { cn } from '@/lib/utils'
import { getRelationshipBadgeStyle } from '@/lib/relationshipColors'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
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
  parent2Id: string | null
  friendId: string | null
  relationshipType: string | null
  isDeceased?: boolean
}

interface FamilyTreeNodeProps {
  data: {
    user: User
    relationship?: string
    onClick?: (userId: string) => void
  }
}

export function FamilyTreeNode({ data }: FamilyTreeNodeProps) {
  const { user, relationship, onClick } = data

  const handleClick = () => {
    onClick?.(user.id)
  }

  return (
    <div
      className={cn(
        'w-[200px] rounded-xl',
        'bg-card/80 backdrop-blur-md border border-border/50',
        'hover:border-primary/50 transition-all duration-300',
        'cursor-pointer group',
        'hover:scale-105 hover:shadow-lg'
      )}
      onClick={handleClick}
    >
      {/* Handle for incoming edges (from parent) */}
      {user.parentId && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2 !h-2 !bg-primary !border-2 !border-background"
        />
      )}

      <div className="p-4 text-center space-y-2">
        {/* Profile Photo Placeholder */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
          {user.profilePhotoUrl ? (
            <img
              src={user.profilePhotoUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-primary">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          )}
        </div>
        
        {/* Name */}
        <div>
          <h3 className="text-sm font-semibold leading-tight">
            {user.firstName} {user.lastName}
          </h3>
          {relationship && (() => {
            const style = getRelationshipBadgeStyle(relationship)
            return (
              <span className={cn(
                "inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full backdrop-blur-sm",
                style.bg,
                style.text,
                "border",
                style.border
              )}>
                {relationship}
              </span>
            )
          })()}
        </div>
      </div>

      {/* Handle for outgoing edges (to children) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-primary !border-2 !border-background"
      />
      
      {/* Handles for friend connections (left and right sides) - both source and target */}
      <Handle
        type="source"
        position={Position.Left}
        id="friend-left"
        className="!w-2 !h-2 !bg-cyan-500 !border-2 !border-background"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="friend-left"
        className="!w-2 !h-2 !bg-cyan-500 !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="friend-right"
        className="!w-2 !h-2 !bg-cyan-500 !border-2 !border-background"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="friend-right"
        className="!w-2 !h-2 !bg-cyan-500 !border-2 !border-background"
      />
    </div>
  )
}
