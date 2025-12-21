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
    // Find root users (no parent)
    const rootUsers = users.filter(u => !u.parentId)
    
    // Build a map of user id to children
    const childrenMap = new Map<string, User[]>()
    users.forEach(user => {
      if (user.parentId) {
        const children = childrenMap.get(user.parentId) || []
        children.push(user)
        childrenMap.set(user.parentId, children)
      }
    })

    // Hierarchical layout algorithm
    const nodes: Node[] = []
    const edges: Edge[] = []
    const processedUsers = new Set<string>()

    // Calculate positions using a level-based approach
    const levelMap = new Map<string, number>() // userId -> level
    const levelCounts = new Map<number, number>() // level -> count of nodes at this level

    // Assign levels (generation depth)
    function assignLevel(userId: string, level: number) {
      if (processedUsers.has(userId)) return
      processedUsers.add(userId)
      levelMap.set(userId, level)
      
      const currentCount = levelCounts.get(level) || 0
      levelCounts.set(level, currentCount + 1)

      const children = childrenMap.get(userId) || []
      children.forEach(child => assignLevel(child.id, level + 1))
    }

    // Start with root users at level 0
    rootUsers.forEach(user => assignLevel(user.id, 0))

    // Calculate x positions for each level
    const levelXPositions = new Map<number, number[]>() // level -> array of x positions
    
    levelMap.forEach((level, userId) => {
      if (!levelXPositions.has(level)) {
        levelXPositions.set(level, [])
      }
      levelXPositions.get(level)!.push(0) // placeholder
    })

    // Assign actual x positions centered by level
    const userPositions = new Map<string, { x: number; y: number }>()
    
    levelMap.forEach((level, userId) => {
      const usersAtLevel = Array.from(levelMap.entries())
        .filter(([_, l]) => l === level)
        .map(([id]) => id)
      
      const totalWidth = (usersAtLevel.length - 1) * HORIZONTAL_SPACING
      const startX = -totalWidth / 2
      
      const indexAtLevel = usersAtLevel.indexOf(userId)
      const x = startX + (indexAtLevel * HORIZONTAL_SPACING)
      const y = level * VERTICAL_SPACING
      
      userPositions.set(userId, { x, y })
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

      // Create edge from parent to this user
      if (user.parentId) {
        edges.push({
          id: `${user.parentId}-${user.id}`,
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
    })

    return { nodes, edges }
  }, [users, router])

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
    const viewport = instance.getViewport()
    const bounds = instance.getNodes()
    
    if (bounds.length > 0) {
      // Find the topmost node
      const minY = Math.min(...bounds.map(node => node.position.y))
      
      // Fit view with custom positioning to align top
      instance.fitView({
        padding: 0.2,
        minZoom: 0.5,
        maxZoom: 1.0,
      })
      
      // After fitView, adjust y position to show top card fully with some padding
      setTimeout(() => {
        const currentViewport = instance.getViewport()
        instance.setViewport({
          x: currentViewport.x,
          y: currentViewport.y + 50, // Move viewport up slightly (adds padding above top card)
          zoom: currentViewport.zoom,
        })
      }, 0)
    }
  }, [])

  return (
    <div className={`rounded-xl overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm w-full ${
      isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[600px] max-h-[calc(100vh-280px)]'
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
