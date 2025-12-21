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
}

interface FamilyTreeViewProps {
  users: User[]
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
  function FamilyTreeView({ users, currentUserId, isFullscreen = false }, ref) {
  const router = useRouter()
  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null)

  // Build the family tree structure
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    // Find root users (no parents and no friendId - friends are positioned with their friend)
    const rootUsers = users.filter(u => !u.parentId && !u.parent2Id && !u.friendId)
    
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

    // Now handle friends - they should be at the same level as their friend
    // Important: We DON'T call assignLevel for friends, just set their level directly
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

    // Assign positions with friends positioned next to each other
    const userPositions = new Map<string, { x: number; y: number }>()
    const friendPairs = new Set<string>()
    
    // Build friend pairs set
    users.forEach(user => {
      if (user.friendId) {
        const pairKey = [user.id, user.friendId].sort().join('-')
        friendPairs.add(pairKey)
      }
    })

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
          
          // Separate actual children from friends
          const actualChildren: string[] = []
          const childFriends: Array<{friendId: string, childId: string}> = []
          
          children.forEach(childId => {
            actualChildren.push(childId)
            
            // Check if someone has this child as a friend
            const friendOfChild = friendsOnly.find(fId => {
              const f = users.find(u => u.id === fId)
              return f?.friendId === childId
            })
            
            if (friendOfChild) {
              childFriends.push({ friendId: friendOfChild, childId })
              friendsOnly.splice(friendsOnly.indexOf(friendOfChild), 1)
            }
          })
          
          // Center ONLY the actual children under the parent(s)
          const childrenWidth = (actualChildren.length - 1) * HORIZONTAL_SPACING
          const childrenStartX = centerX - (childrenWidth / 2)
          
          actualChildren.forEach((childId, index) => {
            const childX = childrenStartX + (index * HORIZONTAL_SPACING)
            userPositions.set(childId, { x: childX, y })
            
            // Position friend directly to the left of their child
            const friendPair = childFriends.find(cf => cf.childId === childId)
            if (friendPair) {
              userPositions.set(friendPair.friendId, {
                x: childX - HORIZONTAL_SPACING,
                y
              })
            }
          })
        })
        
        // Position any remaining friends-only users
        friendsOnly.forEach((userId, index) => {
          userPositions.set(userId, { x: index * HORIZONTAL_SPACING, y })
        })
      }
    })

    // Create nodes
    users.forEach(user => {
      const position = userPositions.get(user.id) || { x: 0, y: 0 }
      
      nodes.push({
        id: user.id,
        type: 'familyMember',
        position,
        data: {
          user,
          relationship: currentUserId ? (
            user.id === currentUserId ? 'Self' : calculateRelationship(currentUserId, user.id, users)
          ) : undefined,
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

    // Create friend edges (after all nodes are created)
    const createdFriendEdges = new Set<string>()
    users.forEach(user => {
      if (user.friendId) {
        const pairKey = [user.id, user.friendId].sort().join('-')
        if (!createdFriendEdges.has(pairKey)) {
          createdFriendEdges.add(pairKey)
          
          // Determine which user is on the left
          const sourcePos = userPositions.get(user.id)
          const targetPos = userPositions.get(user.friendId)
          
          let sourceHandle = 'friend-right'
          let targetHandle = 'friend-left'
          
          // If friend is to the left, swap handles
          if (sourcePos && targetPos && sourcePos.x > targetPos.x) {
            sourceHandle = 'friend-left'
            targetHandle = 'friend-right'
          }
          
          edges.push({
            id: `friend-${pairKey}`,
            source: user.id,
            sourceHandle: sourceHandle,
            target: user.friendId,
            targetHandle: targetHandle,
            type: ConnectionLineType.Straight,
            animated: false,
            style: { stroke: '#06b6d4', strokeWidth: 2, strokeDasharray: '5,5' },
          })
        }
      }
    })

    return { nodes, edges }
  }, [users, currentUserId, router])

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
