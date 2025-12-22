/**
 * Get glassmorphic badge colors based on relationship type
 */
export function getRelationshipBadgeStyle(relationship: string): {
  bg: string
  border: string
  text: string
} {
  const rel = relationship.toLowerCase()

  // Self
  if (rel === 'self' || rel === 'you') {
    return {
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      text: 'text-primary',
    }
  }

  // Parents
  if (rel.includes('mother') || rel.includes('mom') || rel.includes('father') || rel.includes('dad') || rel.includes('parent')) {
    return {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
    }
  }

  // Children
  if (rel.includes('son') || rel.includes('daughter') || rel.includes('child')) {
    return {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-600 dark:text-purple-400',
    }
  }

  // Siblings
  if (rel.includes('brother') || rel.includes('sister') || rel.includes('sibling')) {
    return {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-600 dark:text-green-400',
    }
  }

  // Grandparents
  if (rel.includes('grand') && (rel.includes('mother') || rel.includes('father') || rel.includes('parent'))) {
    return {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-600 dark:text-indigo-400',
    }
  }

  // Grandchildren
  if (rel.includes('grand') && (rel.includes('son') || rel.includes('daughter') || rel.includes('child'))) {
    return {
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      text: 'text-pink-600 dark:text-pink-400',
    }
  }

  // Aunts/Uncles
  if (rel.includes('aunt') || rel.includes('uncle')) {
    return {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      text: 'text-orange-600 dark:text-orange-400',
    }
  }

  // Nieces/Nephews
  if (rel.includes('niece') || rel.includes('nephew')) {
    return {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-600 dark:text-yellow-400',
    }
  }

  // Cousins
  if (rel.includes('cousin')) {
    return {
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      text: 'text-teal-600 dark:text-teal-400',
    }
  }

  // Spouse/Partner
  if (rel.includes('spouse') || rel.includes('husband') || rel.includes('wife') || rel.includes('partner')) {
    return {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
    }
  }

  // Partner (boyfriend/girlfriend)
  if (rel.includes('partner') || rel.includes('boyfriend') || rel.includes('girlfriend')) {
    return {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-600 dark:text-red-400',
    }
  }

  // Married
  if (rel.includes('married') || rel.includes('spouse')) {
    return {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
    }
  }

  // Friend
  if (rel.includes('friend')) {
    return {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-600 dark:text-cyan-400',
    }
  }

  // Family (generic label for friends/partners viewing family members)
  if (rel === 'family') {
    return {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-600 dark:text-cyan-400',
    }
  }

  // Default/Unknown
  return {
    bg: 'bg-muted/20',
    border: 'border-muted/30',
    text: 'text-muted-foreground',
  }
}
