'use client'

import React, { useCallback, useMemo, useImperativeHandle, forwardRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { FamilyTreeNode } from './FamilyTreeNode'
import { useRouter } from 'next/navigation'
import { calculateRelationship } from '@/lib/relationships'

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
}

interface Relationship {
  id: string
  userId: string
  relatedUserId: string
  relationshipType: 'friend' | 'partner' | 'married'
  isPrimary: boolean
  createdAt: Date
}

interface FamilyTreeViewProps {
  users: User[]
  relationships?: Relationship[]
  currentUserId?: string
  isFullscreen?: boolean
}

export interface FamilyTreeViewRef {
  focusOnPerson: (userId: string) => void
}

const nodeTypes = {
  familyMember: FamilyTreeNode,
}

// Constants for layout
const HORIZONTAL_SPACING = 280
const VERTICAL_SPACING = 200

export const FamilyTreeView = forwardRef<FamilyTreeViewRef, FamilyTreeViewProps>(
  function FamilyTreeView({ users, relationships = [], currentUserId, isFullscreen = false }, ref) {
  const router = useRouter()
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null)

  // Build the family tree structure
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    // Find root users (no parents and no relationships that would position them elsewhere)
    const usersWithRelationships = new Set<string>()
    relationships.forEach(rel => {
      if (rel.isPrimary && rel.relationshipType === 'friend') {
        // Only the related user (friend) is positioned by relationship
        usersWithRelationships.add(rel.relatedUserId)
      } else if (rel.relationshipType === 'partner' || rel.relationshipType === 'married') {
        // Both users in romantic relationship can position each other
        usersWithRelationships.add(rel.userId)
        usersWithRelationships.add(rel.relatedUserId)
      }
    })
    
    // Root users: no parents and (no legacy friendId or no new relationships that position them)
    const rootUsers = users.filter(u => 
      !u.parentId && !u.parent2Id && !u.friendId && !usersWithRelationships.has(u.id)
    )
    
    // Build a map of user id to children (for both parent1 and parent2)
    const childrenMap = new Map<string, User[]>()
    users.forEach(user => {
      if (user.parentId) {
        const children = childrenMap.get(user.parentId) || []
        children.push(user)
        childrenMap.set(user.parentId, children)
      }
      if (user.parent2Id) {
        const children = childrenMap.get(user.parent2Id) || []
        if (!children.includes(user)) { // Avoid duplicates
          children.push(user)
          childrenMap.set(user.parent2Id, children)
        }
      }
    })

    // Hierarchical layout algorithm
    const nodes: Node[] = []
    const edges: Edge[] = []
    const processedUsers = new Set<string>()

    // Calculate positions using a level-based approach
    const levelMap = new Map<string, number>() // userId -> level
    const levelGroups = new Map<number, string[]>() // level -> array of user ids

    // Assign levels (generation depth) - only through parent relationships
    function assignLevel(userId: string, level: number) {
      if (levelMap.has(userId)) return
      levelMap.set(userId, level)
      
      if (!levelGroups.has(level)) {
        levelGroups.set(level, [])
      }
      levelGroups.get(level)!.push(userId)

      // Only traverse down to children (not friends)
      const children = childrenMap.get(userId) || []
      children.forEach(child => assignLevel(child.id, level + 1))
    }

    // Start with root users at level 0
    rootUsers.forEach(user => assignLevel(user.id, 0))
    
    // Also process children from both parents to ensure all children are included
    // This handles cases where a child might only be in parent2's children map
    users.forEach(user => {
      if ((user.parentId || user.parent2Id) && !levelMap.has(user.id)) {
        // Find the parent that has been assigned a level
        const parent1Level = user.parentId ? levelMap.get(user.parentId) : undefined
        const parent2Level = user.parent2Id ? levelMap.get(user.parent2Id) : undefined
        const parentLevel = parent1Level ?? parent2Level
        
        if (parentLevel !== undefined) {
          assignLevel(user.id, parentLevel + 1)
        }
      }
    })

    // Now handle legacy friends - they should be at the same level as their friend
    users.forEach(user => {
      if (user.friendId && !levelMap.has(user.id)) {
        const friendLevel = levelMap.get(user.friendId)
        if (friendLevel !== undefined) {
          levelMap.set(user.id, friendLevel)
          if (!levelGroups.has(friendLevel)) {
            levelGroups.set(friendLevel, [])
          }
          levelGroups.get(friendLevel)!.push(user.id)
        }
      }
    })
    
    // Handle new relationship-based positioning
    relationships.forEach(rel => {
      // For friends, the related user goes at same level as userId
      if (rel.isPrimary && rel.relationshipType === 'friend') {
        const userLevel = levelMap.get(rel.userId)
        if (userLevel !== undefined && !levelMap.has(rel.relatedUserId)) {
          levelMap.set(rel.relatedUserId, userLevel)
          if (!levelGroups.has(userLevel)) {
            levelGroups.set(userLevel, [])
          }
          levelGroups.get(userLevel)!.push(rel.relatedUserId)
        }
      }
      // For romantic relationships, both should be at same level
      if (rel.relationshipType === 'partner' || rel.relationshipType === 'married') {
        const userLevel = levelMap.get(rel.userId)
        const relatedLevel = levelMap.get(rel.relatedUserId)
        
        if (userLevel !== undefined && !levelMap.has(rel.relatedUserId)) {
          levelMap.set(rel.relatedUserId, userLevel)
          if (!levelGroups.has(userLevel)) {
            levelGroups.set(userLevel, [])
          }
          levelGroups.get(userLevel)!.push(rel.relatedUserId)
        } else if (relatedLevel !== undefined && !levelMap.has(rel.userId)) {
          levelMap.set(rel.userId, relatedLevel)
          if (!levelGroups.has(relatedLevel)) {
            levelGroups.set(relatedLevel, [])
          }
          levelGroups.get(relatedLevel)!.push(rel.userId)
        }
      }
    })

    // Assign positions
    const userPositions = new Map<string, { x: number; y: number }>()
    const positionedByRelationship = new Set<string>()

    // Position users level by level
    Array.from(levelGroups.keys()).sort((a, b) => a - b).forEach(level => {
      const usersAtLevel = levelGroups.get(level)!
      const y = level * VERTICAL_SPACING
      
      if (level === 0) {
        // Root level - handle parent pairs
        const processed = new Set<string>()
        const positions: { userId: string; x: number }[] = []
        let xOffset = 0
        
        // Find parent pairs (users who share children)
        const parentPairs = new Map<string, string>()
        users.forEach(user => {
          if (user.parentId && user.parent2Id) {
            if (!parentPairs.has(user.parentId)) {
              parentPairs.set(user.parentId, user.parent2Id)
            }
            if (!parentPairs.has(user.parent2Id)) {
              parentPairs.set(user.parent2Id, user.parentId)
            }
          }
        })
        
        usersAtLevel.forEach(userId => {
          if (processed.has(userId)) return
          
          const partnerId = parentPairs.get(userId)
          if (partnerId && usersAtLevel.includes(partnerId) && !processed.has(partnerId)) {
            // Position both partners side by side
            positions.push({ userId, x: xOffset * HORIZONTAL_SPACING })
            positions.push({ userId: partnerId, x: (xOffset + 1) * HORIZONTAL_SPACING })
            processed.add(userId)
            processed.add(partnerId)
            xOffset += 2
          } else if (!processed.has(userId)) {
            // Position single parent
            positions.push({ userId, x: xOffset * HORIZONTAL_SPACING })
            processed.add(userId)
            xOffset += 1
          }
        })
        
        // Center all positions
        const totalWidth = (xOffset - 1) * HORIZONTAL_SPACING
        const centerOffset = -totalWidth / 2
        positions.forEach(({ userId, x }) => {
          userPositions.set(userId, { x: x + centerOffset, y })
        })
      } else {
        // Group children by parent and position each family group
        const familyGroups = new Map<string, string[]>() // parentId -> children
        const friendsOnly: string[] = [] // users with no parent (only friendId)
        
        // Find parent pairs (users who share children)
        const parentPairs = new Map<string, string>() // parentId -> partnerId
        users.forEach(user => {
          if (user.parentId && user.parent2Id) {
            // These two parents are partners
            if (!parentPairs.has(user.parentId)) {
              parentPairs.set(user.parentId, user.parent2Id)
            }
            if (!parentPairs.has(user.parent2Id)) {
              parentPairs.set(user.parent2Id, user.parentId)
            }
          }
        })
        
        usersAtLevel.forEach(userId => {
          const user = users.find(u => u.id === userId)!
          if (user.parentId || user.parent2Id) {
            // Use parentId as primary, or parent2Id if no parentId
            const primaryParent = user.parentId || user.parent2Id!
            if (!familyGroups.has(primaryParent)) {
              familyGroups.set(primaryParent, [])
            }
            if (!familyGroups.get(primaryParent)!.includes(userId)) {
              familyGroups.get(primaryParent)!.push(userId)
            }
          } else {
            friendsOnly.push(userId)
          }
        })
        
        // Position each family group centered under their parent(s)
        familyGroups.forEach((children, parentId) => {
          const parentPos = userPositions.get(parentId)
          if (!parentPos) return
          
          // Check if this parent has a partner
          const parent = users.find(u => u.id === parentId)!
          const partnerIds = parentPairs.get(parentId)
          const partnerPos = partnerIds ? userPositions.get(partnerIds) : null
          
          // Calculate center point between parents (or just parent if single)
          const centerX = partnerPos ? (parentPos.x + partnerPos.x) / 2 : parentPos.x
          
          // Sort children: those with friends go on the outside edges
          const childrenWithFriends: string[] = []
          const childrenWithoutFriends: string[] = []
          
          children.forEach(childId => {
            // Check if this child has a friend
            const hasFriend = users.some(u => u.id !== childId && u.friendId === childId)
            if (hasFriend) {
              childrenWithFriends.push(childId)
            } else {
              childrenWithoutFriends.push(childId)
            }
          })
          
          // Arrange: [friendChild, ...middle children..., friendChild]
          // Put one child with friend on left, others in middle, another with friend on right
          const orderedChildren: string[] = []
          if (childrenWithFriends.length > 0) {
            orderedChildren.push(childrenWithFriends[0]) // Left edge
          }
          orderedChildren.push(...childrenWithoutFriends) // Middle
          if (childrenWithFriends.length > 1) {
            orderedChildren.push(childrenWithFriends[1]) // Right edge
          }
          // If there are more than 2 children with friends, add them to the right
          if (childrenWithFriends.length > 2) {
            orderedChildren.push(...childrenWithFriends.slice(2))
          }
          
          // Position the ordered children
          const childrenWidth = (orderedChildren.length - 1) * HORIZONTAL_SPACING
          const childrenStartX = centerX - (childrenWidth / 2)
          
          orderedChildren.forEach((childId, index) => {
            const childX = childrenStartX + (index * HORIZONTAL_SPACING)
            userPositions.set(childId, { x: childX, y })
            
            // Position relationships for this child
            const childRelationships = relationships.filter(rel => 
              rel.userId === childId || rel.relatedUserId === childId
            )
            
            // Separate romantic and friend relationships
            const romanticRels = childRelationships.filter(rel =>
              rel.relationshipType === 'partner' || rel.relationshipType === 'married'
            )
            const friendRels = childRelationships.filter(rel =>
              rel.relationshipType === 'friend' && rel.isPrimary && rel.userId === childId
            )
            
            // Position romantic partner (inner side - towards siblings)
            romanticRels.forEach(rel => {
              const partnerId = rel.userId === childId ? rel.relatedUserId : rel.userId
              if (!userPositions.has(partnerId)) {
                // Determine if child is on left or right edge
                const isLeftmost = index === 0
                const isRightmost = index === orderedChildren.length - 1
                
                let partnerX: number
                if (isLeftmost) {
                  // Partner goes on right (inner side)
                  partnerX = childX + HORIZONTAL_SPACING * 0.8
                } else if (isRightmost) {
                  // Partner goes on left (inner side)
                  partnerX = childX - HORIZONTAL_SPACING * 0.8
                } else {
                  // Middle child: partner goes on right by default
                  partnerX = childX + HORIZONTAL_SPACING * 0.8
                }
                
                userPositions.set(partnerId, { x: partnerX, y })
                positionedByRelationship.add(partnerId)
              }
            })
            
            // Position friends (outer side - away from siblings)
            friendRels.forEach((rel, friendIndex) => {
              const friendId = rel.relatedUserId
              if (!userPositions.has(friendId)) {
                // Determine outer side based on position
                const isLeftSide = childX < centerX
                const outerMultiplier = 1.4 + (friendIndex * 0.6) // Stack friends vertically
                
                userPositions.set(friendId, {
                  x: isLeftSide 
                    ? childX - HORIZONTAL_SPACING * outerMultiplier  // Left/outer
                    : childX + HORIZONTAL_SPACING * outerMultiplier, // Right/outer
                  y: y + (friendIndex * VERTICAL_SPACING * 0.3) // Slight vertical offset for multiple friends
                })
                positionedByRelationship.add(friendId)
              }
            })
            
            // Handle legacy friendId positioning (backward compatibility)
            const friendOfChild = friendsOnly.find(fId => {
              const f = users.find(u => u.id === fId)
              return f?.friendId === childId
            })
            
            if (friendOfChild && !positionedByRelationship.has(friendOfChild)) {
              const isLeftSide = childX < centerX
              
              userPositions.set(friendOfChild, {
                x: isLeftSide 
                  ? childX - HORIZONTAL_SPACING * 0.8
                  : childX + HORIZONTAL_SPACING * 0.8,
                y
              })
              
              const friendIndex = friendsOnly.indexOf(friendOfChild)
              if (friendIndex > -1) {
                friendsOnly.splice(friendIndex, 1)
              }
            }
          })
        })
        
        // Position any remaining friends that weren't processed
        friendsOnly.forEach(userId => {
          const user = users.find(u => u.id === userId)!
          if (user.friendId) {
            const friendPos = userPositions.get(user.friendId)
            if (friendPos) {
              // Default to left side
              userPositions.set(userId, {
                x: friendPos.x - HORIZONTAL_SPACING * 0.8,
                y: friendPos.y
              })
            }
          }
        })
        
      }
    })

    // Create nodes
    users.forEach(user => {
      const position = userPositions.get(user.id) || { x: 0, y: 0 }
      
      // Determine relationship badge
      let relationship: string | undefined
      if (user.friendId && user.relationshipType) {
        // Show relationship type for users with friendId
        if (user.relationshipType === 'partner') {
          relationship = 'Partner'
        } else if (user.relationshipType === 'married') {
          relationship = 'Married'
        } else if (user.relationshipType === 'friend') {
          relationship = 'Family Friend'
        }
      } else if (user.friendId) {
        // Fallback for users with friendId but no relationshipType
        relationship = 'Family Friend'
      } else if (currentUserId) {
        // For family members, calculate relationship based on currentUserId
        relationship = user.id === currentUserId ? 'Self' : calculateRelationship(currentUserId, user.id, users)
      }
      
      nodes.push({
        id: user.id,
        type: 'familyMember',
        position,
        data: {
          user,
          relationship,
          onClick: (userId: string) => {
            router.push(`/profile/${userId}`)
          },
        },
      })

      // Create edge from parent1 to this user
      if (user.parentId) {
        edges.push({
          id: `parent1-${user.parentId}-${user.id}`,
          source: user.parentId,
          target: user.id,
          type: ConnectionLineType.SmoothStep,
          animated: false,
          style: { stroke: '#7FB57F', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#7FB57F',
          },
        })
      }
      
      // Create edge from parent2 to this user
      if (user.parent2Id) {
        edges.push({
          id: `parent2-${user.parent2Id}-${user.id}`,
          source: user.parent2Id,
          target: user.id,
          type: ConnectionLineType.SmoothStep,
          animated: false,
          style: { stroke: '#7FB57F', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#7FB57F',
          },
        })
      }
    })

    // Create edges for new relationship system
    const createdRelationshipEdges = new Set<string>()
    relationships.forEach(rel => {
      const pairKey = [rel.userId, rel.relatedUserId].sort().join('-')
      
      // Determine edge color based on type
      let edgeColor = '#06b6d4' // cyan for friend
      if (rel.relationshipType === 'partner') edgeColor = '#ef4444' // red
      if (rel.relationshipType === 'married') edgeColor = '#f59e0b' // gold
      
      // Primary vs secondary styling
      const strokeDasharray = rel.isPrimary ? '0' : '5,5' // Solid vs dashed
      const opacity = rel.isPrimary ? 1 : 0.3 // Full vs faint
      
      // Determine handles based on position
      const sourcePos = userPositions.get(rel.userId)
      const targetPos = userPositions.get(rel.relatedUserId)
      
      let sourceHandle = 'friend-right'
      let targetHandle = 'friend-left'
      
      if (sourcePos && targetPos && sourcePos.x > targetPos.x) {
        sourceHandle = 'friend-left'
        targetHandle = 'friend-right'
      }
      
      edges.push({
        id: `relationship-${rel.id}`,
        source: rel.userId,
        sourceHandle: sourceHandle,
        target: rel.relatedUserId,
        targetHandle: targetHandle,
        type: ConnectionLineType.Straight,
        animated: false,
        style: { 
          stroke: edgeColor, 
          strokeWidth: 2, 
          strokeDasharray: strokeDasharray,
          opacity: opacity
        },
      })
      
      createdRelationshipEdges.add(pairKey)
    })
    
    // Create legacy friend edges (backward compatibility)
    const createdFriendEdges = new Set<string>()
    users.forEach(user => {
      if (user.friendId) {
        const pairKey = [user.id, user.friendId].sort().join('-')
        
        // Skip if already handled by new relationship system
        if (createdRelationshipEdges.has(pairKey)) return
        
        if (!createdFriendEdges.has(pairKey)) {
          createdFriendEdges.add(pairKey)
          
          const sourcePos = userPositions.get(user.id)
          const targetPos = userPositions.get(user.friendId)
          
          let sourceHandle = 'friend-right'
          let targetHandle = 'friend-left'
          
          if (sourcePos && targetPos && sourcePos.x > targetPos.x) {
            sourceHandle = 'friend-left'
            targetHandle = 'friend-right'
          }
          
          // Determine edge color and style based on legacy relationship type
          let edgeColor = '#06b6d4' // Default cyan for friends
          let strokeDasharray = '5,5' // Dashed by default
          
          if (user.relationshipType === 'married') {
            edgeColor = '#f59e0b' // Gold/amber for married
            strokeDasharray = '0' // Solid line
          } else if (user.relationshipType === 'partner') {
            edgeColor = '#ef4444' // Red for partner
            strokeDasharray = '0' // Solid line
          }
          
          edges.push({
            id: `friend-${pairKey}`,
            source: user.id,
            sourceHandle: sourceHandle,
            target: user.friendId,
            targetHandle: targetHandle,
            type: ConnectionLineType.Straight,
            animated: false,
            style: { stroke: edgeColor, strokeWidth: 2, strokeDasharray: strokeDasharray },
          })
        }
      }
    })

    return { nodes, edges }
  }, [users, relationships, currentUserId, router])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const userId = node.id
    router.push(`/profile/${userId}`)
  }, [router])

  // Expose method to focus on a specific person
  useImperativeHandle(ref, () => ({
    focusOnPerson: (userId: string) => {
      if (!reactFlowInstance) return
      
      const node = reactFlowInstance.getNode(userId)
      if (!node) return

      // Get connected nodes (parent and children)
      const connectedNodeIds = new Set<string>()
      connectedNodeIds.add(userId)
      
      edges.forEach(edge => {
        if (edge.source === userId) connectedNodeIds.add(edge.target)
        if (edge.target === userId) connectedNodeIds.add(edge.source)
      })

      // Calculate bounds for the focused node and first connections
      const connectedNodes = Array.from(connectedNodeIds)
        .map(id => reactFlowInstance.getNode(id))
        .filter((n): n is Node => n !== undefined)

      if (connectedNodes.length === 0) return

      // Node dimensions (approximate card size)
      const nodeWidth = 220
      const nodeHeight = 150

      const xValues = connectedNodes.map(n => n.position.x)
      const yValues = connectedNodes.map(n => n.position.y)
      
      const minX = Math.min(...xValues)
      const maxX = Math.max(...xValues) + nodeWidth
      const minY = Math.min(...yValues)
      const maxY = Math.max(...yValues) + nodeHeight

      const width = maxX - minX
      const height = maxY - minY

      // Center on the focused area with padding
      reactFlowInstance.fitBounds(
        { x: minX, y: minY, width: width, height: height },
        { padding: 0.4, duration: 600 }
      )
    },
  }), [reactFlowInstance, edges])

  // Position tree at top when initialized
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance)
    
    if (nodes.length > 0) {
      // First fit the entire tree in view
      instance.fitView({
        padding: 0.15,
        minZoom: 0.3,
        maxZoom: 1.0,
      })
      
      // Then adjust to position top nodes near the top with proper padding
      setTimeout(() => {
        const currentViewport = instance.getViewport()
        // Positive y pushes viewport down (shows top of content)
        instance.setViewport({
          x: currentViewport.x,
          y: 30, // Fixed position to keep top nodes visible with padding
          zoom: currentViewport.zoom,
        })
      }, 50)
    }
  }, [nodes])

  return (
    <div className={`rounded-xl overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm w-full ${
      isFullscreen ? 'h-[calc(100vh-120px)]' : 'flex-1 h-full'
    }`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={onInit}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        minZoom={0.1}
        maxZoom={1.5}
        className="bg-background/30"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          gap={20}
          size={1}
          className="opacity-20"
        />
      </ReactFlow>
    </div>
  )
})
