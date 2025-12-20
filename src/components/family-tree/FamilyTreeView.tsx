'use client'

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { FamilyTreeNode } from './FamilyTreeNode'
import { useRouter } from 'next/navigation'

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
}

const nodeTypes = {
  familyMember: FamilyTreeNode,
}

// Constants for layout
const HORIZONTAL_SPACING = 250
const VERTICAL_SPACING = 150

export function FamilyTreeView({ users }: FamilyTreeViewProps) {
  const router = useRouter()

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

  return (
    <div className="w-full h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        className="bg-background/30"
      >
        <Background
          gap={20}
          size={1}
          className="opacity-20"
        />
        <Controls
          className="!bg-card/80 !backdrop-blur-md !border !border-border/50 !rounded-lg !shadow-lg"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-card/80 !backdrop-blur-md !border !border-border/50 !rounded-lg"
          nodeColor={() => '#7FB57F'}
          maskColor="rgba(0, 0, 0, 0.2)"
        />
      </ReactFlow>
    </div>
  )
}
