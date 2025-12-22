# Next Session: Complete Family Tree Multi-Relationship Implementation

## What's Been Completed ✅

### Database & Backend
1. ✅ `UserRelationship` junction table created (many-to-many relationships)
2. ✅ Migration applied (schema.prisma updated)
3. ✅ Helper functions in `src/lib/user-relationships.ts`
   - `addUserRelationship()` - Validates romantic exclusivity, tracks primary
   - `getUserRelationships()` - Fetches all relationships for a user
   - `removeUserRelationship()` - Deletes a relationship
   - `getUsersInRomanticRelationships()` - For filtering

### API Endpoints
4. ✅ `/api/relationships` (GET, POST) - Manage relationships
5. ✅ `/api/relationships/[id]` (DELETE) - Remove specific relationship
6. ✅ `/api/relationships/available` (GET) - Get unavailable romantic partners

### Components
7. ✅ `RelationshipManager` component (`src/components/relationships/RelationshipManager.tsx`)
   - Add multiple relationships
   - Show primary badge
   - Filter romantic partners
   - Remove relationships

### Forms Integrated
8. ✅ Admin edit member form - Uses RelationshipManager
9. ✅ Member edit profile form - Uses RelationshipManager
10. ✅ Create forms (admin, join) - Keep legacy single selector (for new users)

### Data Loading
11. ✅ Home page loads UserRelationship data
12. ✅ MemberHomeClient accepts relationships prop
13. ✅ Passes relationships to FamilyTreeView

### Terminology
14. ✅ "Partner" replaces "Boyfriend/Girlfriend" everywhere

## What Needs to Be Completed ❌

### Critical Task: Update FamilyTreeView
**File:** `src/components/family-tree/FamilyTreeView.tsx`

The FamilyTreeView component needs three major updates:

#### 1. Accept relationships prop
```typescript
interface FamilyTreeViewProps {
  users: User[]
  relationships: Relationship[]  // ADD THIS
  currentUserId?: string
  isFullscreen?: boolean
}
```

#### 2. Rewrite positioning algorithm
Currently uses simple `friendId` for placement. Needs:
- **Romantic partners (partner/married)**: Place on INNER side (towards siblings)
- **Friends**: Place on OUTER side (away from siblings)
- **Multiple friends**: Stack vertically moving outward
- **Shared friends**: Use primary relationship position, draw secondary lines

**Positioning Logic:**
```typescript
// For each user with relationships:
const userRelationships = relationships.filter(r => 
  r.userId === user.id || r.relatedUserId === user.id
)

// Romantic relationships (partner/married)
const romanticRels = userRelationships.filter(r => 
  r.relationshipType === 'partner' || r.relationshipType === 'married'
)

// Friend relationships
const friendRels = userRelationships.filter(r => 
  r.relationshipType === 'friend'
)

// Position romantic partners
romanticRels.forEach(rel => {
  const partnerId = rel.userId === user.id ? rel.relatedUserId : rel.userId
  
  // Determine if user is leftmost/rightmost in sibling group
  const siblings = users.filter(u => u.parentId === user.parentId)
  const isLeftmost = siblings[0].id === user.id
  const isRightmost = siblings[siblings.length - 1].id === user.id
  
  if (isLeftmost) {
    // Partner goes on right (inner side)
    partnerX = userX + HORIZONTAL_SPACING
  } else if (isRightmost) {
    // Partner goes on left (inner side)
    partnerX = userX - HORIZONTAL_SPACING
  } else {
    // Default: partner on right
    partnerX = userX + HORIZONTAL_SPACING
  }
  
  partnerY = userY  // Same level
})

// Position friends
friendRels.forEach((rel, index) => {
  const friendId = rel.userId === user.id ? rel.relatedUserId : rel.userId
  
  // Check if this is primary (determines position)
  if (rel.isPrimary && (rel.userId === user.id || rel.relatedUserId === user.id)) {
    // This user determines the position
    if (isLeftmost) {
      friendX = userX - HORIZONTAL_SPACING * 0.8  // Left/outer
    } else {
      friendX = userX + HORIZONTAL_SPACING * 0.8  // Right/outer
    }
    
    // Stack multiple friends vertically
    friendY = userY + (index * VERTICAL_SPACING)
  }
})
```

#### 3. Update edge rendering for primary/secondary
```typescript
// Create edges for relationships
relationships.forEach(rel => {
  const sourceId = rel.userId
  const targetId = rel.relatedUserId
  
  // Determine color based on type
  let edgeColor = '#06b6d4'  // cyan for friend
  if (rel.relationshipType === 'partner') edgeColor = '#ef4444'  // red
  if (rel.relationshipType === 'married') edgeColor = '#f59e0b'  // gold
  
  // Primary vs secondary styling
  const edgeStyle = {
    stroke: edgeColor,
    strokeWidth: 2,
    strokeDasharray: rel.isPrimary ? '0' : '5,5',  // Solid vs dashed
    opacity: rel.isPrimary ? 1 : 0.3,  // Full vs faint
  }
  
  edges.push({
    id: `relationship-${rel.id}`,
    source: sourceId,
    target: targetId,
    type: ConnectionLineType.Straight,
    animated: false,
    style: edgeStyle,
  })
})
```

### Secondary Tasks

#### Update existing legacy edges
The current code creates edges from `user.friendId`. These need to coexist with the new relationship edges:
```typescript
// Legacy edge creation (keep for backward compatibility)
if (user.friendId && !hasRelationshipEdge(user.id, user.friendId)) {
  // Create legacy edge...
}
```

#### Handle both systems
Users might have BOTH:
- Legacy `friendId` field (old single friendship)
- New `UserRelationship` records (multi-friendships)

The view should show both until all legacy data is migrated.

## Testing Checklist

After implementing the FamilyTreeView updates:
- [ ] View tree with legacy friendId relationships (backward compatibility)
- [ ] Add single friend via RelationshipManager
- [ ] Verify friend appears on outer side
- [ ] Add romantic partner via RelationshipManager  
- [ ] Verify partner appears on inner side
- [ ] Add second friend to same person
- [ ] Verify both friends stack vertically
- [ ] Verify primary friend has solid line
- [ ] Verify secondary friend has faint dashed line
- [ ] Add romantic partner to someone already partnered (should fail)
- [ ] Check colors: cyan (friend), red (partner), gold (married)

## Next Session Prompt

Use this prompt to continue:

```
Continue implementing the family tree multi-relationship feature. 

Current status:
- Database, API endpoints, and RelationshipManager component are complete
- Forms are integrated (admin edit, member edit)
- Data is loaded and passed to FamilyTreeView

TASK: Update src/components/family-tree/FamilyTreeView.tsx to:
1. Accept relationships prop (array of UserRelationship records)
2. Rewrite positioning algorithm:
   - Romantic partners (partner/married) go on INNER side (towards siblings)
   - Friends go on OUTER side (away from siblings)  
   - Multiple friends stack vertically outward
   - Shared friends use primary connection's position
3. Update edge rendering:
   - Primary relationship: solid line, full opacity
   - Secondary relationship: dashed line (strokeDasharray: '5,5'), 0.3 opacity
   - Colors: cyan (friend), red (partner), gold (married)

Files to modify:
- src/components/family-tree/FamilyTreeView.tsx

Reference files:
- NEXT_SESSION.md (this file) for detailed requirements
- src/lib/user-relationships.ts for relationship data structure
- src/components/relationships/RelationshipManager.tsx for example usage

Important notes:
- Keep backward compatibility with legacy friendId field
- Primary relationship = first person to add connection (rel.isPrimary === true)
- Romantic relationships are mutually exclusive (already validated in API)
- Friends can be shared (multiple people can connect to same friend)

See NEXT_SESSION.md for positioning algorithm pseudocode and edge styling details.
```

## Files Modified This Session

### Created
- `prisma/migrations/20251222052814_add_many_to_many_relationships/migration.sql`
- `src/lib/user-relationships.ts`
- `src/app/api/relationships/route.ts`
- `src/app/api/relationships/[id]/route.ts`
- `src/app/api/relationships/available/route.ts`
- `src/components/relationships/RelationshipManager.tsx`

### Modified
- `prisma/schema.prisma` - Added UserRelationship model
- `src/lib/relationshipColors.ts` - Partner terminology
- `src/components/family-tree/FamilyTreeView.tsx` - Partner terminology
- `src/app/admin/create-profile/page.tsx` - Partner terminology
- `src/app/admin/members/[id]/edit/page.tsx` - Integrated RelationshipManager
- `src/components/profile/EditProfileForm.tsx` - Integrated RelationshipManager
- `src/components/auth/JoinForm.tsx` - Partner terminology
- `src/app/home/page.tsx` - Load relationships data
- `src/components/member/MemberHomeClient.tsx` - Accept relationships prop

## Key Concepts

### Primary vs Secondary Relationships
- **Primary**: First person to add the connection determines node placement
- **Secondary**: Additional connections to the same person (faint lines)
- Stored in `UserRelationship.isPrimary` field

### Relationship Types
- **friend**: Can have multiple, allows sharing, cyan line
- **partner**: Exclusive (only one), red line
- **married**: Exclusive (only one), gold line

### Positioning Rules
- **Family members**: Normal hierarchical layout (parents above children)
- **Romantic partners**: INNER side (between person and their siblings)
- **Friends**: OUTER side (away from family structure)
- **Multiple friends**: Stack vertically moving outward

### Backward Compatibility
- Legacy `User.friendId` and `User.relationshipType` fields still exist
- New system uses `UserRelationship` table
- Both should work until legacy data is fully migrated

## Migration Notes

If you need to migrate existing legacy relationships:
```sql
-- SQL to migrate existing friendId relationships
INSERT INTO "UserRelationship" ("id", "userId", "relatedUserId", "relationshipType", "isPrimary", "createdAt")
SELECT 
  gen_random_uuid(),
  id,
  "friendId",
  COALESCE("relationshipType", 'friend'),
  true,
  NOW()
FROM "User"
WHERE "friendId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "UserRelationship" ur
    WHERE ur."userId" = "User".id 
      AND ur."relatedUserId" = "User"."friendId"
  );
```

Or use the helper function:
```typescript
import { migrateLegacyRelationship } from '@/lib/user-relationships'

// Migrate all users
const users = await prisma.user.findMany()
for (const user of users) {
  await migrateLegacyRelationship(user.id)
}
```

## Questions/Issues

If you encounter issues:
1. Check browser console for API errors
2. Verify relationships are loaded: `console.log(relationships)` in FamilyTreeView
3. Check database: `SELECT * FROM "UserRelationship";`
4. Verify romantic exclusivity works by trying to add second partner (should fail)

Good luck! The foundation is solid, just needs the tree layout algorithm rewrite.
