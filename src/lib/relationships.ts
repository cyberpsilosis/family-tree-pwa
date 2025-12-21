interface User {
  id: string
  firstName: string
  lastName: string
  parentId: string | null
  parent2Id: string | null
  friendId: string | null
}

/**
 * Calculate the relationship between two users
 * Returns a human-readable relationship string
 */
export function calculateRelationship(
  fromUserId: string,
  toUserId: string,
  allUsers: User[]
): string {
  if (fromUserId === toUserId) return 'You'

  const userMap = new Map(allUsers.map((u) => [u.id, u]))
  const fromUser = userMap.get(fromUserId)
  const toUser = userMap.get(toUserId)

  console.log('calculateRelationship:', {
    fromUserId,
    toUserId,
    fromUser: fromUser ? { id: fromUser.id, firstName: fromUser.firstName } : null,
    toUser: toUser ? { id: toUser.id, firstName: toUser.firstName } : null,
    allUserIds: allUsers.map(u => u.id)
  })

  if (!fromUser || !toUser) return 'Unknown'

  // Friend relationship
  if (toUser.id === fromUser.friendId || fromUser.id === toUser.friendId) {
    return 'Friend'
  }

  // Direct parent
  if (toUser.id === fromUser.parentId || toUser.id === fromUser.parent2Id) {
    return getParentLabel(toUser)
  }

  // Direct child
  if (fromUser.id === toUser.parentId || fromUser.id === toUser.parent2Id) {
    return getChildLabel(toUser)
  }

  // Sibling (share at least one parent)
  if (
    (fromUser.parentId && toUser.parentId && fromUser.parentId === toUser.parentId) ||
    (fromUser.parentId && toUser.parent2Id && fromUser.parentId === toUser.parent2Id) ||
    (fromUser.parent2Id && toUser.parentId && fromUser.parent2Id === toUser.parentId) ||
    (fromUser.parent2Id && toUser.parent2Id && fromUser.parent2Id === toUser.parent2Id)
  ) {
    return getSiblingLabel(toUser)
  }

  // Find common ancestor
  const fromAncestors = getAncestors(fromUser, userMap)
  const toAncestors = getAncestors(toUser, userMap)

  // Grandparent/Grandchild
  if (fromAncestors.some((a) => a.id === toUser.id)) {
    const generations = getGenerationDistance(fromUser, toUser, userMap)
    if (generations === 2) return getGrandparentLabel(toUser)
    if (generations === 3) return 'Great Grandparent'
    return `${generations - 1}x Great Grandparent`
  }

  if (toAncestors.some((a) => a.id === fromUser.id)) {
    const generations = getGenerationDistance(toUser, fromUser, userMap)
    if (generations === 2) return getGrandchildLabel(toUser)
    if (generations === 3) return 'Great Grandchild'
    return `${generations - 1}x Great Grandchild`
  }

  // Aunt/Uncle (parent's sibling)
  const fromParent = fromUser.parentId ? userMap.get(fromUser.parentId) : null
  if (
    fromParent &&
    toUser.parentId &&
    fromParent.parentId === toUser.parentId
  ) {
    return getAuntUncleLabel(toUser)
  }

  // Niece/Nephew (sibling's child)
  const toParent = toUser.parentId ? userMap.get(toUser.parentId) : null
  if (
    toParent &&
    fromUser.parentId &&
    toParent.parentId === fromUser.parentId
  ) {
    return getNieceNephewLabel(toUser)
  }

  // Cousin (share grandparent)
  const commonAncestor = findCommonAncestor(fromUser, toUser, userMap)
  if (commonAncestor) {
    const fromDistance = getGenerationDistance(fromUser, commonAncestor, userMap)
    const toDistance = getGenerationDistance(toUser, commonAncestor, userMap)

    if (fromDistance === 2 && toDistance === 2) {
      return 'Cousin'
    }
    if (fromDistance === 3 && toDistance === 3) {
      return '2nd Cousin'
    }
    if (fromDistance === 4 && toDistance === 4) {
      return '3rd Cousin'
    }

    const degree = Math.min(fromDistance, toDistance) - 1
    const removed = Math.abs(fromDistance - toDistance)
    if (removed === 0) {
      return `${degree}${getOrdinalSuffix(degree)} Cousin`
    }
    return `${degree}${getOrdinalSuffix(degree)} Cousin, ${removed}x Removed`
  }

  return 'Relative'
}

function getAncestors(user: User, userMap: Map<string, User>): User[] {
  const ancestors: User[] = []
  let current = user

  while (current.parentId) {
    const parent = userMap.get(current.parentId)
    if (!parent) break
    ancestors.push(parent)
    current = parent
  }

  return ancestors
}

function findCommonAncestor(
  user1: User,
  user2: User,
  userMap: Map<string, User>
): User | null {
  const ancestors1 = getAncestors(user1, userMap)
  const ancestors2 = getAncestors(user2, userMap)

  for (const ancestor of ancestors1) {
    if (ancestors2.some((a) => a.id === ancestor.id)) {
      return ancestor
    }
  }

  return null
}

function getGenerationDistance(
  descendant: User,
  ancestor: User,
  userMap: Map<string, User>
): number {
  let distance = 0
  let current = descendant

  while (current.id !== ancestor.id) {
    if (!current.parentId) return -1
    const parent = userMap.get(current.parentId)
    if (!parent) return -1
    distance++
    current = parent
  }

  return distance
}

function getParentLabel(user: User): string {
  // This is simplified - in a real app, you'd have a gender field
  return 'Parent'
}

function getChildLabel(user: User): string {
  return 'Child'
}

function getSiblingLabel(user: User): string {
  return 'Sibling'
}

function getGrandparentLabel(user: User): string {
  return 'Grandparent'
}

function getGrandchildLabel(user: User): string {
  return 'Grandchild'
}

function getAuntUncleLabel(user: User): string {
  return 'Aunt/Uncle'
}

function getNieceNephewLabel(user: User): string {
  return 'Niece/Nephew'
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
