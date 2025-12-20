# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

**Source of Truth:** `PROMPT.md` contains the full project specification. This file tracks implementation progress.

## Project Overview

This is a Next.js 15 Progressive Web App (PWA) for family contact management and genealogy visualization. The app supports ~100 users with role-based access (admin vs member), authentication via JWT, and a visual family tree powered by React Flow.

### Project Scope (from PROMPT.md)

**Core Features:**
1. **Authentication System** - Custom password format for members (`[first-initial][lastname][yy]`), admin bypass, JWT cookies
2. **Admin Dashboard** - Send invites, add/edit members, manage members, upload photos
3. **Member Home Screen** - Toggle between Family Tree view (React Flow) and Card List view
4. **Profile System** - View profiles, edit own profile, download vCard contacts
5. **Family Tree Visualization** - 2D zoomable tree with React Flow, hierarchical layout, relationship calculations
6. **Progressive Web App** - Installable on mobile devices via "Add to Home Screen"

**Design Constraints:**
- **Color Scheme:** Forest green (#A3D5A3) as primary color
- **Styling:** Glassmorphism aesthetic throughout
- **Typography:** Inter (sans) for UI, Lora/Source Serif 4 (serif) for headings
- **Animations:** Subtle Framer Motion animations (fade-in-up, stagger, card hover)
- **Templates to Integrate:** 5 templates in `/templates` folder need to be merged and adapted

**Key Business Logic:**
- Password generation: `generatePassword(firstName, lastName, birthYear)` → `jsmith99`
- Relationship calculation: Complex algorithm handling cousins, nth-removed, generations
- vCard generation for contact downloads
- Email invites via Resend API with PWA installation instructions

**Key Technologies:**
- Next.js 15 (App Router) + TypeScript + React 19
- Prisma ORM + PostgreSQL database
- Tailwind CSS v4 + Framer Motion
- JWT authentication (HTTP-only cookies)
- Vercel Blob Storage (profile photos)
- Resend API (email notifications)
- next-pwa (Progressive Web App support)
- React Flow (family tree visualization)

## Implementation Status

### ✅ Completed

**Foundation & Infrastructure:**
- [x] Next.js 15 project initialized with TypeScript
- [x] Prisma schema defined with User and Admin models
- [x] Self-referencing family tree relationships (User.parentId)
- [x] Tailwind CSS v4 configured
- [x] PWA configuration (next-pwa, manifest.json)
- [x] Environment variables structure (.env.example)
- [x] Path aliases configured (@/* → src/*)
- [x] React Compiler enabled

**Authentication System:**
- [x] Password generation utility (`src/lib/password.ts:generatePassword()`)
- [x] Password hashing with bcryptjs (10 rounds)
- [x] Password validation regex (`/^[a-z][a-z]+\d{2}$/`)
- [x] JWT token utilities (`src/lib/auth.ts`)
- [x] HTTP-only cookie management (7-day expiry)
- [x] Login API route (`/api/auth/login`) with admin bypass
- [x] Logout API route (`/api/auth/logout`)
- [x] Forgot password API route (`/api/auth/forgot-password`)
- [x] `getCurrentUser()` helper for protected routes

**Components:**
- [x] LoginForm component (`src/components/auth/LoginForm.tsx`)
- [x] ForgotPasswordModal component (`src/components/auth/ForgotPasswordModal.tsx`)
- [x] ThemeToggle component (`src/components/auth/ThemeToggle.tsx`)
- [x] AdminSidebar component (`src/components/admin/AdminSidebar.tsx`)
- [x] UI primitives: button, dialog, input (Radix UI + Tailwind)

**Utilities:**
- [x] Prisma Client singleton (`src/lib/prisma.ts`)
- [x] Relationship calculation algorithm (`src/lib/relationships.ts`)
  - Handles: parent, child, sibling, grandparent, aunt/uncle, cousins, nth-removed
  - Recursive ancestor traversal
  - Common ancestor detection

**Routes:**
- [x] Landing page with login (`/` → `src/app/page.tsx`)
- [x] Root layout with PWA metadata
- [x] Admin dashboard route (`/admin/dashboard`)
- [x] Admin layout with sidebar navigation (`/admin/layout.tsx`)
- [x] Admin invite route (`/admin/invite` - placeholder)
- [x] Admin create-profile route (`/admin/create-profile` - placeholder)
- [x] Admin members route (`/admin/members` - placeholder)
- [x] Member home route (`/home`)

### 🚧 Partially Implemented

**Design System:**
- [x] Forest green color palette configured in globals.css
- [x] Glassmorphism `.glass-card` utility class created
- [x] Lora/Source Serif 4 fonts configured in theme
- [x] Forest color tokens added to Tailwind theme (forest-light, forest, forest-dark, forest-text)
- [ ] Framer Motion animations not implemented yet

**PWA:**
- [x] Basic manifest.json exists
- [ ] App icons (192x192, 512x512) not generated
- [ ] Service worker generated but not tested on mobile

### ❌ Not Started

**Admin Dashboard (PRIORITY):**
- [x] `/admin/dashboard` route with authentication check and admin-only access
- [x] Admin layout with sidebar navigation and glassmorphism styling
- [x] AdminSidebar component with menu items (Dashboard, Invite, Add Member, Members)
- [x] `/admin/invite` route with invite form
  - ✅ Full invite form with all member fields (firstName, lastName, email, birthYear, birthday, phone, favoriteTeam)
  - ✅ Social media link management (add/remove platforms)
  - ✅ Client-side URL preview, server-side URL construction
  - ✅ Success state showing email delivery status
  - ✅ Fallback for email failure (shows password for manual sharing)
  - ✅ "Send Another Invite" and "Go to Dashboard" navigation
- [x] `/admin/create-profile` route (UI label: "Add Member")
  - ✅ Form with all required fields (firstName, lastName, email, birthYear, birthday, phone, favoriteTeam)
  - ✅ Social media link management (Instagram, Facebook, Twitter, LinkedIn)
  - ✅ Client-side URL preview, server-side URL construction from handles
  - ✅ One-time password generation with success card display
  - ✅ Copyable password display with warning about one-time visibility
- [x] `/admin/members/[id]/edit` route (UI label: "Edit Member")
  - ✅ Full edit form with all member fields (firstName, lastName, email, birthYear, birthday, phone, favoriteTeam)
  - ✅ Social media link management (add/remove/edit platforms)
  - ✅ Password regeneration detection (tracks changes to firstName, lastName, birthYear)
  - ✅ Warning banner with "Regenerate Password & Email Member" button
  - ✅ Regenerate-and-email flow via Resend API
  - ✅ Success/error messaging with auto-scroll
  - ✅ Disabled warning banner after password regeneration
- [x] `/admin/members` route with member list
  - ✅ Responsive grid layout (1-3 columns based on screen size)
  - ✅ Real-time search by name, email, or phone
  - ✅ Member cards showing: name, email, phone, birthday, age, admin badge
  - ✅ Social media icons with external links (Instagram, Facebook, Twitter, LinkedIn)
  - ✅ Quick actions: Edit button (navigates to edit page), Delete button
  - ✅ Delete confirmation dialog
  - ✅ Empty states for no members and no search results
  - ✅ "Add Member" button in header
- [x] `/api/admin/invite` endpoint (Resend integration)
  - ✅ POST: Creates user and sends invite email via Resend
  - ✅ Password generation and hashing
  - ✅ Social URL construction from handles
  - ✅ Email template with login credentials, app URL, and PWA install instructions
  - ✅ Duplicate email detection
  - ✅ Graceful email failure handling (returns password for manual sharing)
- [x] `/api/users` endpoint (POST create, GET list)
  - ✅ POST: Creates user with password generation and social URL construction
  - ✅ GET: Lists all users
  - ✅ Server-side social URL construction from handles
- [x] `/api/users/[id]` endpoint (GET, PATCH, DELETE)
  - ✅ GET: Fetch single user with all profile fields
  - ✅ PATCH: Update user with optional password regeneration
  - ✅ DELETE: Remove user from system
  - ✅ Password regeneration with Resend email notification
- [ ] `/api/upload` endpoint (Vercel Blob integration)
- [ ] Admin sidebar navigation (from board-portal template)
- [ ] Profile photo upload component (from file-upload template)

**Member Features:**
- [x] `/home` route with authentication check (view toggle not yet implemented)
- [ ] `/family-tree` route (React Flow implementation)
- [ ] `/card-list` route with card grid
- [ ] `/profile/[id]` route (view profile)
- [ ] `/profile/edit` route (edit own profile)
- [ ] SearchBar component (real-time filter)
- [ ] FilterBar component (lastname, age, birth month, team)
- [ ] ProfileCard component (from minimalist-card template)
- [ ] ProfileCard hover actions (from hover-animation template)
- [ ] vCard download functionality
- [ ] React Flow family tree visualization
  - [ ] Custom nodes (compact 200px ProfileCards)
  - [ ] Hierarchical layout
  - [ ] Zoom/pan controls
  - [ ] Mini-map
  - [ ] Click node → profile detail

**Templates Integration:**
- [ ] Merge my-login template styling (glassmorphism + forest green)
- [ ] Extract board-portal sidebar navigation
- [ ] Extract minimalist-card ProfileCard design
- [ ] Extract hover-animation overlay actions
- [ ] Extract file-upload drag-and-drop with circular crop

**Email System:**
- [ ] Resend API integration (`src/lib/email.ts`)
- [ ] Invite email template with PWA instructions
- [ ] Forgot password email template

**Additional Features:**
- [ ] Theme persistence (localStorage + User.theme)
- [ ] vCard generation utility
- [ ] Relationship badge display on cards
- [ ] Contact info quick actions (tel:, mailto:, social links)

## Next Tasks

Based on the implementation status above, here are the recommended next steps in priority order:

**Recent Progress:**
- ✅ Created protected `/admin/dashboard` route (admin-only with authentication)
- ✅ Created protected `/home` route (member authentication)
- ✅ Applied forest green color scheme to Tailwind theme
- ✅ Implemented glassmorphism styling system
- ✅ Created admin layout with horizontal navigation (matching board-portal template)
- ✅ AdminHeader component with horizontal navigation and mobile menu
- ✅ Dashboard with board-portal styling: gradient cards, muted typography, atmospheric effects
- ✅ Placeholder pages for Invite, Add Member, and Members
- ✅ Fixed header spacing and typography to match board-portal design
- ✅ Implemented Add Member page (`/admin/create-profile`) with form, social media links, and success state
- ✅ Implemented Edit Member page (`/admin/members/[id]/edit`) with password regeneration detection and Resend email
- ✅ Created `/api/users/[id]` route with GET, PATCH, and DELETE endpoints
- ✅ Implemented Send Invite page (`/admin/invite`) with email integration and graceful failure handling
- ✅ Created `/api/admin/invite` route with Resend email delivery and PWA install instructions
- ✅ Implemented Members List page (`/admin/members`) with search, member cards, and quick actions

### Phase 1: Design System Foundation
1. **✅ COMPLETED: Apply Forest Green Color Scheme**
   - ✅ Updated Tailwind theme with forest color palette (forest-light, forest, forest-dark, forest-text)
   - ✅ Added glassmorphism utility class (`.glass-card`) with blur and transparency
   - ✅ Configured Lora/Source Serif 4 fonts in theme
   - ⏭️ TODO: Create `src/styles/animations.ts` with Framer Motion variants

2. **✅ COMPLETED: Protected Routes**
   - ✅ Created `/admin/dashboard` with admin-only access and redirect logic
   - ✅ Created `/home` with member authentication check
   - ✅ Both routes use glassmorphism design and forest green colors
   - ✅ Redirect to `/` if not authenticated
   - ✅ Redirect from `/admin/*` to `/home` if not admin

3. **Integrate Login Template Styling**
   - ⏭️ TODO: Apply more glassmorphism refinements to LoginForm if needed
   - ✅ Forest green shader background already implemented
   - ✅ ThemeToggle and ForgotPasswordModal already exist

### Phase 2: Admin Dashboard (High Priority - IN PROGRESS)
4. **✅ COMPLETED: Create Admin Layout & Navigation**
   - ✅ Created `src/components/admin/AdminSidebar.tsx` with glassmorphism styling
   - ✅ Created `/admin/layout.tsx` with sidebar navigation
   - ✅ Protected route check (admin-only): redirects non-authenticated to `/`, non-admin to `/home`
   - ✅ Menu items: Dashboard, Invite, Add Member, Members
   - ✅ Placeholder pages created for Invite, Add Member, Members routes

4. **Admin Dashboard Overview**
   - Create `/admin/dashboard/page.tsx`
   - Display stats: total members, recent additions, pending invites
   - Dashboard cards with glassmorphism styling

5. **✅ COMPLETED: Send Invite Feature**:
   - ✅ Created `/admin/invite/page.tsx` with full form implementation
   - ✅ Created `/api/admin/invite/route.ts` with Resend integration
   - ✅ All form fields: firstName, lastName, email, birthYear, birthday, phone, favoriteTeam
   - ✅ Social media link management (same as Add Member)
   - ✅ Email template features:
     - Welcome message with member's name
     - Login credentials (email + generated password)
     - Forest green CTA button linking to app
     - Step-by-step PWA installation instructions for iOS and Android
     - PWA benefits explanation
   - ✅ Success states:
     - Email sent successfully: Shows confirmation with "What happens next" guide
     - Email failed: Shows yellow warning with generated password for manual sharing
   - ✅ Duplicate email detection (prevents creating duplicate users)
   - ✅ Navigation: "Send Another Invite" or "Go to Dashboard"
   - ⏭️ NOTE: Uses Resend test domain (onboarding@resend.dev) - needs custom domain for production

6. **User CRUD APIs**
   - Create `/api/users/route.ts` (POST create, GET list all)
   - Create `/api/users/[id]/route.ts` (GET one, PATCH update, DELETE)
   - Validation and error handling

7. **Profile Photo Upload**
   - Extract file upload component from `templates/file-upload/`
   - Create `/api/upload/route.ts` with Vercel Blob integration
   - Implement circular crop for profile photos
   - Add to Add Member / Edit Member forms

8. **✅ COMPLETED: Add Member Page** (`/admin/create-profile`)
   - ✅ Created `/admin/create-profile/page.tsx` with full form implementation
   - ✅ Created `/api/users/route.ts` with POST (create) and GET (list) endpoints
   - ✅ Form fields: firstName, lastName, email, birthYear, birthday, phone, favoriteTeam
   - ✅ Password generation: generates `[first-initial][lastname][yy]` format on submit
   - ✅ Success state displays plain password ONLY ONCE with copy button and warning
   - ✅ Social media section: Add/remove links for Instagram, Facebook, Twitter, LinkedIn
   - ✅ Client-side URL preview, server constructs full URLs from handles
   - ✅ Validation: Required fields, platform uniqueness, max 4 social links
   - ✅ Navigation: "Add another member" or "Go to Dashboard" buttons after success
   - ⏭️ TODO: Profile photo upload integration (requires Vercel Blob setup)
   - ⏭️ TODO: Parent/relationship assignment (requires member selector)

9. **✅ COMPLETED: Edit Member Page** (`/admin/members/[id]/edit`):
   - ✅ Created `/admin/members/[id]/edit/page.tsx` with full edit form
   - ✅ Created `/api/users/[id]/route.ts` with GET (fetch user), PATCH (update), DELETE endpoints
   - ✅ Form pre-populated with existing member data via GET /api/users/[id]
   - ✅ All form fields: firstName, lastName, email, birthYear, birthday, phone, favoriteTeam
   - ✅ Password regeneration detection:
     - Tracks original values of firstName, lastName, birthYear on load
     - Compares current values to original on every change
     - Shows yellow warning card when password fields change
   - ✅ Warning banner implementation:
     - AlertTriangle icon with yellow styling
     - Message: "You changed fields used to generate this member's password. Click 'Regenerate password' to update it and notify the member."
     - "Regenerate Password & Email Member" button
   - ✅ Regenerate password flow:
     - Generates new password from current firstName/lastName/birthYear
     - Hashes with bcrypt and saves to User.password via PATCH /api/users/[id]
     - Sends email via Resend API:
       - Subject: "Your Family Tree password has been updated"
       - Body: Includes new password, app URL, and PWA install instructions
     - Success message: "Password regenerated and emailed to [email]"
     - Updates original values to hide warning after successful regeneration
   - ✅ Social media section:
     - Pre-populated with existing links (extracts handles from stored URLs)
     - Same add/remove/edit UI as Add Member
     - Client-side URL preview, server-side URL construction
   - ✅ Save without regeneration: Updates profile without changing password
   - ✅ Success/error messaging with auto-scroll to top
   - ⏭️ TODO: Profile photo upload integration (requires Vercel Blob setup)

10. **✅ COMPLETED: Admin Members List**:
    - ✅ Created `/admin/members/page.tsx` with full member directory
    - ✅ Fetches all users via GET /api/users on page load
    - ✅ Responsive grid layout:
      - Mobile (< 768px): 1 column
      - Tablet (768px - 1024px): 2 columns
      - Desktop (> 1024px): 3 columns
    - ✅ Search functionality:
      - Real-time filtering by firstName, lastName, email, or phone
      - Search icon in input field
      - Updates member count dynamically
    - ✅ Member cards display:
      - Name with admin badge (if applicable)
      - Email with mail icon
      - Phone with phone icon (if available)
      - Birthday with calendar icon (formatted as "Mon Day, Year • Age X")
      - Social media icons (Instagram, Facebook, Twitter, LinkedIn) as clickable links
      - Glassmorphism card styling with hover effect (border-primary/50)
    - ✅ Quick actions:
      - Edit button: Navigates to `/admin/members/[id]/edit`
      - Delete button: Confirms with native dialog, calls DELETE /api/users/[id], removes from UI
      - Loading states for delete operation
    - ✅ Empty states:
      - No members: "Get started by adding your first family member"
      - No search results: "Try adjusting your search query"
    - ✅ Header with "Add Member" button (navigates to /admin/create-profile)

### Phase 3: Member Features
11. **ProfileCard Component**
    - Extract from `templates/minimalist-card/`
    - Add relationship badge
    - Compact 200px version for tree view
    - Extract hover actions from `templates/hover-animation/`

12. **Member Home Screen**
    - Create `/home/page.tsx`
    - View toggle: Family Tree | Card List
    - SearchBar and FilterBar components
    - Protected route (requires auth)

13. **Card List View**
    - Create `/card-list/page.tsx` (or integrate into /home)
    - Responsive grid of ProfileCards
    - Real-time search/filter functionality
    - Framer Motion stagger animations

14. **Family Tree View**
    - Create `/family-tree/page.tsx`
    - Integrate React Flow library
    - Custom nodes using ProfileCard (compact)
    - Hierarchical layout algorithm
    - Zoom/pan controls, mini-map
    - Click handler → profile detail

15. **Profile Pages**
    - Create `/profile/[id]/page.tsx` (view any profile)
    - Create `/profile/edit/page.tsx` (edit own profile)
    - Display all User fields with social links
    - vCard download button
    - Contact quick actions (tel:, mailto:, social)

### Phase 4: Polish & Deployment
16. **vCard Generation**
    - Create utility in `src/lib/` to generate .vcf files
    - Implement download trigger

17. **Theme Persistence**
    - localStorage integration in ThemeToggle
    - Sync with User.theme database field

18. **PWA Testing**
    - Generate app icons (192x192, 512x512)
    - Test installation on Android/iOS
    - Test offline mode

19. **Deployment**
    - Deploy to Vercel
    - Configure environment variables
    - Set up Vercel Postgres database
    - Test email delivery (Resend)
    - Test blob storage (profile photos)

### Critical Path Items
**Before deploying, ensure:**
- [ ] Admin can add new members and send invites
- [ ] Members can log in and view family tree
- [ ] Relationship calculations work correctly
- [ ] PWA is installable on mobile
- [ ] All API endpoints have proper authentication checks
- [ ] No secrets exposed in client-side code

## Doc Sync Summary (Phase 1 - December 20, 2024)

**PROMPT.md Updates**:
- Updated "Add New Member" section to reflect full implementation status:
  - Documented route (`/admin/create-profile`) and files (`page.tsx`, `/api/users/route.ts`)
  - Listed all implemented form fields (required: firstName, lastName, email, birthYear, birthday; optional: phone, favoriteTeam)
  - Documented social media management with client-side preview and server-side URL construction
  - Documented password generation, hashing, and one-time display with copy-to-clipboard
  - Documented success state with glass-card design and navigation actions
  - Documented validation rules and error handling
- Updated "API Routes" section to document `/api/users`:
  - POST endpoint: Creates users with password generation and social URL construction
  - GET endpoint: Lists all users for admin tools
  - Documented request/response structure and behavior
- Changed Edit Member route from `/admin/edit-profile/[id]` to `/admin/members/[id]/edit` for consistency
- Added "Future / Planned Features" section with explicit TODOs:
  - Profile photo upload (Vercel Blob integration)
  - Parent/relationship assignment (member selector)
  - Edit Member page with password regeneration + Resend email
  - Send Invite page with Resend email integration

**WARP.md Updates**:
- Implementation Status already reflected the completed Add Member page
- Next Tasks already listed the remaining TODOs
- No additional changes needed to WARP.md beyond this summary section

**Key Documentation Changes**:
1. PROMPT.md now accurately reflects the current implementation state of the Add Member feature
2. Clearly marked implemented vs. TODO features with visual indicators (✅ vs. TODO)
3. Documented the full user flow from form submission to success state
4. Established `/api/users` as the source of truth for user CRUD operations
5. Consolidated future work items under a dedicated "Future / Planned Features" section

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server at http://localhost:3000
npm run build        # Production build (includes PWA generation)
npm start            # Start production server
```

### Database Management
```bash
npx prisma generate  # Generate Prisma Client after schema changes
npx prisma migrate dev --name <migration_name>  # Create and apply migration
npx prisma studio    # Open database GUI at http://localhost:5555
npx prisma db push   # Push schema changes without creating migration (dev only)
npx prisma db seed   # Seed database (if seed script exists)
```

### Code Quality
```bash
npm run lint         # Run ESLint (Next.js config)
npx tsc --noEmit     # Type-check without emitting files
```

**Note:** This project does NOT have test scripts configured. There is no test framework (Jest/Vitest/Playwright) set up.

## Environment Setup

Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage token for profile photos
- `RESEND_API_KEY` - Resend API key for sending emails
- `JWT_SECRET` - Secret key for JWT token signing
- `ADMIN_PASSWORD` - Plain text admin password (special auth bypass)
- `NEXT_PUBLIC_APP_URL` - App URL for emails and redirects

**Windows Development Note:** You're on Windows with PowerShell. When running shell commands, use PowerShell syntax (e.g., `Get-ChildItem` instead of `ls`, `$env:VAR` instead of `$VAR`).

## Architecture Overview

### Authentication System
- **Password Format for Members:** `[first-initial][lastname][yy]`
  - Example: John Smith born 1999 → `jsmith99`
  - Generated by `src/lib/password.ts:generatePassword()`
  - Validated with regex: `/^[a-z][a-z]+\d{2}$/`
- **Admin Authentication:** Uses `ADMIN_PASSWORD` from environment (plain text comparison)
- **JWT Storage:** HTTP-only cookies with 7-day expiry
- **Authorization:** `src/lib/auth.ts` provides token generation, verification, and cookie management
- **Password Hashing:** bcrypt with 10 salt rounds (see `src/lib/password.ts`)

### Password Management (Add/Edit Member)

**Add Member Flow:**
- When admin adds a new member:
  - Password is generated once using `generatePassword(firstName, lastName, birthYear)`
  - Password is hashed with bcrypt and stored in `User.password`
  - Plain password is displayed ONLY ONCE in a success card/modal
  - Admin manually shares the password with the member (no auto-email)

**Edit Member Flow:**
- Editing member fields does NOT automatically change the password
- If admin changes `firstName`, `lastName`, or `birthYear`:
  - UI detects the change by comparing to original values
  - Shows warning banner: "You changed fields used to generate this member's password. Click 'Regenerate password' to update it and notify the member."
  - Displays "Regenerate password" button
- When admin clicks "Regenerate password":
  - New password is computed from CURRENT firstName/lastName/birthYear
  - Password is hashed and saved to `User.password`
  - Email sent to member via Resend:
    - Subject: "Your Family Tree password has been updated"
    - Body: Explanation of correction + new password + app URL
  - Success toast: "Password regenerated and emailed to [email]"
- **Important:** No silent password changes - regeneration only on explicit button click

### Social Media URL Construction

**User Input:**
- Admin enters only the handle/username (e.g., "johnsmith")
- Platform is selected from dropdown: Instagram, Facebook, Twitter, LinkedIn

**Server-Side URL Construction (in `/api/users`):**
- Instagram handle → `https://instagram.com/{handle}` → saved to `User.instagram`
- Facebook handle → `https://facebook.com/{handle}` → saved to `User.facebook`
- Twitter handle → `https://x.com/{handle}` → saved to `User.twitter`
- LinkedIn handle → `https://www.linkedin.com/in/{handle}` → saved to `User.linkedin`

**Rules:**
- Admin can add up to 4 platforms
- Each platform can only be added once
- On edit, handles are extracted from stored URLs for display

### Database Schema (Prisma)
Located in `prisma/schema.prisma`:

**User Model:**
- Self-referencing relationship via `parentId` → `parent` / `children` for family tree
- Authentication: `email` (unique), `password` (hashed)
- Profile: name, birthday, `birthYear` (last 2 digits), contact info, social media, theme preference
- `isAdmin` flag for role-based access
- `favoriteTeam` field for sports team preference (49ers/Raiders/Other)

**Admin Model:**
- Separate admin entity (not stored in User table)
- Currently only supports one admin record

**Generated Files:**
- Prisma Client is generated to `src/generated/prisma/` (not the default `node_modules/.prisma`)
- These files are gitignored and regenerated on `prisma generate`

### Application Structure

**Routes:**
- `/` - Landing page with login form (public)
- `/home` - Member home screen with family tree/card list toggle (requires auth)
- `/family-tree` - Visual family tree view using React Flow
- `/card-list` - Grid view of family member cards
- `/profile/[id]` - View member profile
- `/profile/edit` - Edit own profile (members only)
- `/admin/*` - Admin dashboard routes (admin only)

**API Routes:**
- `/api/auth/login` - POST: Authenticate user (checks admin password OR user bcrypt hash)
- `/api/auth/logout` - POST: Clear auth cookie
- `/api/auth/forgot-password` - POST: Send password reset email via Resend
- `/api/admin/invite` - POST: Send invite email with generated password
- `/api/users` - POST: Create user, GET: List all users
- `/api/users/[id]` - PATCH: Update user, DELETE: Delete user
- `/api/upload` - POST: Upload profile photo to Vercel Blob

**Components:**
- `src/components/auth/` - Authentication components (LoginForm, ForgotPasswordModal, ThemeToggle)
- `src/components/ui/` - Reusable UI primitives (button, dialog, input) using Radix UI + Tailwind
- Design system uses **forest green (#A3D5A3)** as primary color with glassmorphism styling

**Utilities:**
- `src/lib/prisma.ts` - Global Prisma Client singleton (prevents hot-reload connection issues)
- `src/lib/auth.ts` - JWT token utilities and cookie management
- `src/lib/password.ts` - Password generation, hashing, and validation
- `src/lib/relationships.ts` - Complex family relationship calculation algorithm
  - Calculates relationships: parent, child, sibling, grandparent, cousin, nth-cousin-x-removed, etc.
  - Uses recursive ancestor traversal and common ancestor detection

**Path Aliases:**
- `@/*` maps to `src/*` (configured in `tsconfig.json`)

### Progressive Web App (PWA)
- Configured via `next-pwa` in `next.config.ts`
- Service worker and workbox files generated to `public/` during build
- **Disabled in development** (`NODE_ENV === "development"`)
- PWA assets: `manifest.json`, service worker, app icons in `public/`
- App is installable on mobile devices ("Add to Home Screen")

### Key Project Files
- `prompt.md` - Original project requirements and feature specifications (comprehensive build guide)
- `templates/` - Template components to be integrated (login, board portal, cards, file upload, hover animations)

## Development Guidelines

### Code Style
- Use React 19 features and patterns
- Prefer async/await over promises
- Use TypeScript strict mode (enabled in `tsconfig.json`)
- Follow Next.js App Router conventions (server components by default)
- Use Server Actions where appropriate instead of API routes

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <descriptive_name>`
3. Prisma Client is automatically regenerated
4. **Never manually edit files in `src/generated/prisma/`**

### Adding New Routes
- Create route folders in `src/app/` following Next.js App Router structure
- Use `layout.tsx` for shared layouts
- Use `page.tsx` for route pages
- Use `route.ts` for API endpoints

### Authentication Pattern
For protected routes:
```typescript
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/')
  if (user.isAdmin) {
    // Admin-only logic
  }
  // ...
}
```

### Family Relationship Calculations
When displaying relationships between users, use `src/lib/relationships.ts:calculateRelationship(fromUserId, toUserId, allUsers)`. This handles:
- Direct relationships (parent, child, sibling)
- Extended family (grandparent, aunt/uncle, niece/nephew)
- Cousins (1st, 2nd, 3rd, with "x times removed")
- Edge cases (common ancestor detection, generation distance)

### Deprecated Patterns
- **Do NOT use v1 anywhere in the codebase** - always use updated versions
- Do NOT use `bcrypt` package - use `bcryptjs` instead (already configured in `src/lib/password.ts`)

## React Compiler
This project has React Compiler enabled (`reactCompiler: true` in `next.config.ts`). The compiler automatically optimizes React components - you don't need to manually use `useMemo` or `useCallback` in most cases.

## Important Notes
- **No Testing Framework:** Tests are not configured. If adding tests, you'll need to set up Jest/Vitest/Playwright first.
- **Turbopack:** Enabled with empty config to silence warnings
- **TypeScript Target:** ES2017 (not ESNext) for broader compatibility
- **Templates Folder:** Contains reference implementations to be integrated - see `prompt.md` for details
- **Generated Prisma Files:** Excluded from tsconfig via `exclude: ["node_modules", "templates"]`

## Common Workflows

### Creating a New User (Admin)
1. Generate password: `generatePassword(firstName, lastName, birthYear)`
2. Hash password: `await hashPassword(password)`
3. Create user via Prisma: `prisma.user.create()`
4. Send invite email via Resend with password and app URL

### Sending Emails
Use Resend API with `RESEND_API_KEY`:
- Import resend SDK
- Use for: forgot password, user invites, notifications
- Include "Add to Home Screen" instructions for PWA installation

### Profile Photo Upload
1. Upload to Vercel Blob via `/api/upload`
2. Returns URL to store in `User.profilePhotoUrl`
3. Display using Next.js `<Image>` component with proper sizing

### Theme Management
- User preference stored in `User.theme` field ("light" or "dark")
- Toggleable via `ThemeToggle` component
- Applies to entire app with Tailwind dark mode classes
