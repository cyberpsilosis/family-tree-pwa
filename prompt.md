# Family Tree PWA — Full Build Prompt

## Project Overview
Build a complete Next.js 15 + TypeScript + Tailwind CSS PWA for family contact management with ~100 users.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Prisma + PostgreSQL (Vercel Postgres)
- **Storage**: Vercel Blob (profile photos)
- **Email**: Resend API
- **Auth**: JWT (HTTP-only cookies)
- **PWA**: next-pwa
- **Family Tree**: React Flow (2D zoomable)

---

## Templates to Merge (Located in `/templates` folder)

### 1. Login Page (Already Built)
**Location**: `/templates/my-login/`
**Use For**: Landing page authentication
**Modifications Needed**:
- Add ThemeToggle component (sun/moon icon) in top-right
- Add "Forgot Password" button → opens modal
- Replace primary colors with forest green (#A3D5A3)
- Apply glassmorphism styling
- Add password validation: `[first-initial][lastname][yy]` format
- Check admin password → redirect to `/admin/dashboard`
- Regular user → redirect to `/home`

### 2. Board Portal Template
**Location**: `/templates/board-portal/`
**Use For**: Admin dashboard layout
**Extract**:
- Sidebar navigation
- Member directory grid
- Dashboard cards
**Adapt**:
- Replace "Board Members" with "Family Members"
- Add sections: Send Invite, Add Member, Member List
- Apply glassmorphism styling

### 3. Minimalist Card Template
**Location**: `/templates/minimalist-card/`
**Use For**: Profile cards in card list view and family tree nodes
**Extract**:
- Card design with photo + name
- Glassmorphic styling
**Adapt**:
- Add relationship badge (e.g., "Mom", "Cousin")
- Make compact version (200px wide) for tree view
- Apply forest green accents

### 4. Hover Animation Template
**Location**: `/templates/hover-animation/`
**Use For**: Quick actions on profile card hover
**Extract**:
- Hover overlay animation
- Action button group
**Adapt**:
- Add 5 action buttons:
  - 👤 View Profile
  - 📞 Call (opens tel: link)
  - ✉️ Email (opens mailto: link)
  - 📸 Instagram (opens profile URL)
  - 📥 Download Contact (generates vCard file)

### 5. Animated File Upload Template
**Location**: `/templates/file-upload/`
**Use For**: Profile photo upload
**Extract**:
- Drag-and-drop zone
- Image preview + crop
- Upload progress animation
**Adapt**:
- Integrate with Vercel Blob API (`/api/upload`)
- Circular crop for profile photos
- Apply glassmorphism to upload zone

---

## Core Features to Build

### 1. Authentication System
**Routes**:
- `/` — Landing page with login form
- `/api/auth/login` — POST (validate password, return JWT)
- `/api/auth/logout` — POST
- `/api/auth/forgot-password` — POST (send email via Resend)

**Password Format**:
- Members: `[first-initial][lastname][yy]`
  - Example: John Smith born 1999 → `jsmith99`
- Admin: Use `ADMIN_PASSWORD` from .env

**Logic**:
```typescript
// Password generation
function generatePassword(firstName: string, lastName: string, birthYear: number): string {
  const firstInitial = firstName.charAt(0).toLowerCase();
  const lastNameLower = lastName.toLowerCase();
  const yearShort = birthYear.toString().slice(-2);
  return `${firstInitial}${lastNameLower}${yearShort}`;
}

// Authentication
- Hash passwords with bcrypt (10 rounds)
- Generate JWT with 7-day expiry
- Store in HTTP-only cookie
- Redirect based on role (admin vs member)
```

**Components**:
- `LoginForm.tsx` (from my-login template + modifications)
- `ThemeToggle.tsx` (sun/moon icon, saves to localStorage + user preferences)
- `ForgotPasswordModal.tsx` (email input → submit → success message)

---

### 2. Admin Dashboard
**Routes**:
- `/admin/dashboard` — Overview
- `/admin/invite` — Send invite email
- `/admin/create-profile` — Create new member
- `/admin/edit-profile/[id]` — Edit any member
- `/admin/members` — List all members

**API Routes**:
- `/api/admin/invite` — POST (send invite via Resend) — **TODO**
- `/api/users` — **✅ IMPLEMENTED**
  - **File**: `src/app/api/users/route.ts`
  - **POST**: Create new user
    - Accepts payload: firstName, lastName, email, birthYear, birthday, phone, favoriteTeam, socialMedia (object with platform handles)
    - Generates password using `generatePassword()` from `src/lib/password.ts`
    - Hashes password with bcrypt (10 rounds) using `hashPassword()` from `src/lib/password.ts`
    - Constructs full social URLs from handles (Instagram, Facebook, Twitter, LinkedIn)
    - Creates User record with `isAdmin: false`
    - Returns created user data + plain password (ONLY TIME password is visible)
  - **GET**: List all users
    - Returns array of all User records
    - Used for admin member list and future member selectors
- `/api/users/[id]` — GET (one user), PATCH (update), DELETE — **TODO**
- `/api/upload` — POST (upload to Vercel Blob) — **TODO**

**Features**:
1. **Send Invite**:
   - Form: name, email, relationship, birthday
   - Generate password automatically
   - Send email with: greeting, password, app URL, "Add to Home Screen" instructions
   
2. **Add New Member** (page: `/admin/create-profile`) — **✅ IMPLEMENTED**:
   
   **Route**: `/admin/create-profile`
   **File**: `src/app/admin/create-profile/page.tsx`
   **API**: `POST /api/users` (in `src/app/api/users/route.ts`)
   
   **Form Fields**:
   - **Required**: firstName, lastName, email, birthYear (4-digit number), birthday (date)
   - **Optional**: phone, favoriteTeam (select: "49ers", "Raiders", "Other")
   - **Not yet implemented**: profile photo upload, parent/relationship assignment
   
   **Password Behavior**:
   - When the admin submits the form:
     - The app generates the initial password using `generatePassword(firstName, lastName, birthYear)`
     - Example: John Smith born 1999 → `jsmith99`
     - The password is hashed with bcrypt (10 rounds) and stored in `User.password`
     - The API returns the plain password in the response (ONLY TIME it's accessible)
     - The plain password is shown ONLY ONCE to the admin in a success card with:
       - Member name and email
       - The generated password in a code block
       - Warning: "⚠️ Save this password - it will only be shown once"
       - Copy-to-clipboard button with success feedback
     - Admin should copy/save it to share with the member manually
   - The password is NOT automatically emailed (admin shares it)
   
   **Social Media Section**:
   - Admin clicks "Add" button to add a social link
   - Each link has:
     - Platform selector dropdown: ["Instagram", "Facebook", "Twitter", "LinkedIn"]
     - Handle/username input field (plain text, no URL)
     - Remove (X) button
   - Admin enters ONLY the handle/username (e.g., "johnsmith")
   - Client-side URL preview is shown for each added link:
     - Instagram: `https://instagram.com/{handle}`
     - Facebook: `https://facebook.com/{handle}`
     - Twitter: `https://x.com/{handle}`
     - LinkedIn: `https://www.linkedin.com/in/{handle}`
   - On the server (in `POST /api/users`), full URLs are constructed from handles:
     - Instagram → `https://instagram.com/{handle}` → saved to `User.instagram`
     - Facebook → `https://facebook.com/{handle}` → saved to `User.facebook`
     - Twitter → `https://x.com/{handle}` → saved to `User.twitter`
     - LinkedIn → `https://www.linkedin.com/in/{handle}` → saved to `User.linkedin`
   - Constraints:
     - Admin can add up to 4 platforms
     - Each platform can only be added once (enforced in UI)
   
   **Success State**:
   - Glass-card design matching the admin aesthetic
   - Displays member name and email
   - Shows the generated password with:
     - Warning about one-time visibility
     - Copy-to-clipboard button (shows checkmark on copy)
   - Navigation actions:
     - "Add Another Member" button (resets form)
     - "Go to Dashboard" button (returns to admin dashboard)
   
   **Validation**:
   - Required fields must be filled
   - Email must be valid
   - Birth year must be 4 digits between 1900-2100
   - Birthday must be a valid date
   - Errors shown inline with red destructive styling

3. **Edit Member** (page: `/admin/members/[id]/edit`) — **TODO**:
   - **Form fields**: Same as Add Member (name, birthday, phone, email, etc.)
   - Pre-populated with existing member data
   - Use Animated File Upload for photo changes
   
   **Password Regeneration Behavior**:
   - Editing member fields does NOT automatically change the password
   - If admin changes any of these "password-related fields":
     - `firstName`
     - `lastName`
     - `birthYear`
   - The UI must:
     - Detect the change (compare to original values)
     - Show a warning toast or inline banner:
       > "You changed fields used to generate this member's password. Click 'Regenerate password' to update it and notify the member."
     - Display a "Regenerate password" button next to the warning
   
   **What "Regenerate password" does**:
   - Compute a new password from the CURRENT `firstName`, `lastName`, `birthYear` using the same `[first-initial][lastname][yy]` rule
   - Hash the new password with bcrypt and save it to `User.password`
   - Send an email to the member (via Resend API) with:
     - Subject: "Your Family Tree password has been updated"
     - Body: Explain that their details were corrected and this is their new password
     - Include the new plain password
     - Include app URL and "Add to Home Screen" instructions
   - Show a success toast:
     > "Password regenerated and emailed to [member email]."
   
   **Important**: No silent password changes. Regeneration only happens when the admin explicitly clicks the "Regenerate password" button.
   
   **Social Media Section (Edit)**:
   - Same behavior as Add Member
   - Pre-populated with existing social links (extract handle from stored URLs)
   - Admin can add/remove/edit platforms

4. **Member List** (page: `/admin/members`) — **TODO**:
   - Grid of profile cards
   - Quick edit/delete actions
   - Will use `GET /api/users` to fetch member list

---

## Future / Planned Features

### Admin Features (TODO)
- **Profile Photo Upload**:
  - Integrate Vercel Blob Storage (free tier)
  - Implement drag-and-drop file upload with circular crop
  - Add to Add Member and Edit Member forms
  - API: `POST /api/upload` with Vercel Blob integration

- **Parent/Relationship Assignment**:
  - Add member selector dropdown to Add/Edit Member forms
  - Allow admin to set User.parentId to establish family tree relationships
  - Use `GET /api/users` to populate member options

- **Edit Member Page** (`/admin/members/[id]/edit`):
  - Full edit form with password regeneration detection
  - Email notification via Resend when password is regenerated
  - API: `GET /api/users/[id]`, `PATCH /api/users/[id]`

- **Send Invite Page** (`/admin/invite`):
  - Email-based invite system with Resend API
  - Include generated password and PWA installation instructions
  - API: `POST /api/admin/invite`

---

### 3. Member Home Screen
**Route**: `/home`

**Components**:
- View toggle: "Family Tree" | "Card List"
- SearchBar (real-time filter by name/email/phone)
- FilterBar (last name, age group, birth month, sports team)

**Two Views**:

#### A. Family Tree View
**Route**: `/family-tree` (or same as /home with toggle)

**Implementation**:
- Use React Flow library
- Custom nodes: ProfileCard (compact 200px version)
- Layout: Hierarchical (grandparents top → children bottom)
- Connections: Parent-child lines (forest green, 2px)
- Features:
  - Zoom in/out (mouse wheel or +/- buttons)
  - Pan (click-and-drag)
  - Fit View button (reset zoom)
  - Click node → open profile detail
  - Mini-map in corner

#### B. Card List View
**Route**: `/card-list` (or same as /home with toggle)

**Implementation**:
- Responsive grid of ProfileCards
- Show relationship badge on each card
- Hover → show action buttons overlay (from Hover Animation template)
- Search filters applied in real-time
- Framer Motion stagger animation on load

---

### 4. Profile System
**Routes**:
- `/profile/[id]` — View any member's profile
- `/profile/edit` — Edit own profile (members only)

**Display Fields**:
- Profile photo
- Name, birthday (show age)
- Phone, email, preferred contact method
- Social media links (Instagram, Facebook, Twitter, LinkedIn)
- Address
- Relationship to logged-in user (calculated dynamically)
- Favorite sports team (49ers, Raiders, Other)

**Edit Features**:
- Members can edit own profile only
- Admins can edit any profile
- Use Animated File Upload for photo changes
- All fields editable except relationship

**vCard Download**:
- Generate .vcf file with contact info
- Trigger download on "Add to Contacts" button click

---

### 5. Relationship Calculation
**Logic**:
Build family tree graph from parent-child relationships, then calculate:
- Parent/Child: Direct link in User.parentId
- Sibling: Same parentId
- Grandparent/Grandchild: Two generations apart
- Aunt/Uncle: Parent's sibling
- Cousin: Parent's sibling's child
- 2nd Cousin: Grandparent's sibling's grandchild

**Implementation**:
```typescript
// src/lib/relationships.ts
function calculateRelationship(
  fromUserId: string, 
  toUserId: string, 
  allUsers: User[]
): string {
  // Build tree, find common ancestor, count generations
  // Return: "Mom", "Sister", "Cousin", "2nd Cousin", etc.
}
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String   @id @default(cuid())
  firstName             String
  lastName              String
  birthYear             Int      // last two digits (99 = 1999)
  password              String   // hashed with bcrypt
  email                 String   @unique
  phone                 String?
  birthday              DateTime
  preferredContactMethod String? // "phone", "email", "text"
  instagram             String?
  facebook              String?
  twitter               String?
  linkedin              String?
  profilePhotoUrl       String?
  address               String?
  theme                 String   @default("light") // "light" or "dark"
  isAdmin               Boolean  @default(false)
  favoriteTeam          String?  // "49ers", "Raiders", "Other"
  
  // Family tree relationships
  parentId              String?
  parent                User?    @relation("FamilyTree", fields: [parentId], references: [id])
  children              User[]   @relation("FamilyTree")
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Admin {
  id        String   @id @default(cuid())
  password  String   // hashed admin password
  email     String   @unique
  createdAt DateTime @default(now())
}
```

**Setup Commands**:
```bash
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
```

---

## Design System

### Colors
```typescript
// tailwind.config.ts
colors: {
  forest: {
    light: '#A3D5A3',
    DEFAULT: '#7FB57F',
    dark: '#5A8D5A',
    text: '#2C3E2C',
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
}
```

### Typography
```typescript
fontFamily: {
  serif: ['"Lora"', '"Source Serif 4"', 'serif'],
  sans: ['"Inter"', 'system-ui', 'sans-serif'],
}
```

### Glassmorphism
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(163, 213, 163, 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark .glass-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(163, 213, 163, 0.2);
}
```

### Animations (Framer Motion)
```typescript
// Subtle, lightweight animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.05 } }
};

const cardHover = {
  whileHover: { scale: 1.02, transition: { duration: 0.2 } }
};
```

---

## PWA Configuration

### Install next-pwa
```bash
npm install next-pwa
```

### next.config.js
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
});
```

### public/manifest.json
```json
{
  "name": "Family Tree",
  "short_name": "FamilyTree",
  "description": "Family contact directory",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#A3D5A3",
  "theme_color": "#A3D5A3",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## File Structure

```
family-tree-pwa/
├── .env.local
├── prisma/
│   └── schema.prisma
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              (Login landing)
│   │   ├── home/page.tsx
│   │   ├── family-tree/page.tsx
│   │   ├── card-list/page.tsx
│   │   ├── profile/
│   │   │   ├── [id]/page.tsx
│   │   │   └── edit/page.tsx
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── invite/page.tsx
│   │   │   ├── create-profile/page.tsx
│   │   │   └── members/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── admin/
│   │       └── upload/
│   ├── components/
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── profile/
│   │   ├── family-tree/
│   │   └── ui/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── relationships.ts
│   │   ├── password.ts
│   │   └── email.ts
│   └── styles/
│       └── animations.ts
└── templates/
    ├── my-login/
    ├── board-portal/
    ├── minimalist-card/
    ├── hover-animation/
    └── file-upload/
```

---

## Build Instructions

### Step 1: Initialize Project
```bash
npx create-next-app@latest family-tree-pwa --typescript --tailwind --app
cd family-tree-pwa
```

### Step 2: Install All Dependencies
```bash
npm install @prisma/client framer-motion bcrypt jsonwebtoken resend reactflow next-pwa
npm install -D prisma @types/bcrypt @types/jsonwebtoken
npm install @vercel/blob
```

### Step 3: Set Up Database
```bash
npx prisma init
# (Copy schema from above)
npx prisma migrate dev --name init
npx prisma generate
```

### Step 4: Merge Templates
1. Copy components from `/templates/my-login/` to `src/components/auth/`
2. Extract UI components from all templates to `src/components/ui/`
3. Adapt each template per instructions above
4. Apply forest green color scheme everywhere
5. Apply glassmorphism styling to all cards

### Step 5: Build Core Features
1. Authentication system (login, JWT, cookies)
2. Admin dashboard (invite, add/edit members)
3. Member home (view toggle, search, filters)
4. Family tree visualization (React Flow)
5. Profile detail and edit screens
6. Relationship calculation logic

### Step 6: Configure PWA
1. Create manifest.json
2. Generate icons (192x192, 512x512)
3. Configure next-pwa
4. Test installation on mobile

### Step 7: Deploy to Vercel
```bash
git init
git add .
git commit -m "Initial commit"
vercel deploy
```

**Add environment variables in Vercel dashboard:**
- DATABASE_URL
- BLOB_READ_WRITE_TOKEN
- RESEND_API_KEY
- JWT_SECRET
- ADMIN_PASSWORD

---

## Testing Checklist

### Authentication
- [ ] Member login with correct password format
- [ ] Admin login with admin password
- [ ] Forgot password email delivery
- [ ] Theme toggle persists across sessions
- [ ] JWT token expiry (7 days)

### Admin Features
- [ ] Send invite email (receives with password)
- [ ] Add new member with photo upload
- [ ] Edit any member profile
- [ ] Delete member

### Member Features
- [ ] View all family members in card list
- [ ] Search by name/email/phone
- [ ] Filter by last name, age, birth month, team
- [ ] Hover card shows action buttons
- [ ] View profile detail page
- [ ] Edit own profile
- [ ] Download contact vCard
- [ ] See correct relationship labels

### Family Tree
- [ ] Tree displays all members hierarchically
- [ ] Zoom in/out works
- [ ] Pan works
- [ ] Click node opens profile
- [ ] Connecting lines show parent-child relationships
- [ ] Mini-map navigation

### PWA
- [ ] Installable on Android
- [ ] Installable on iOS
- [ ] Offline mode (cached assets)
- [ ] Add to Home Screen works

---

## Key Implementation Notes

### 1. Password Validation
```typescript
// On login, validate format
const isValidMemberPassword = /^[a-z][a-z]+\\d{2}$/.test(password);
```

### 2. Relationship Calculation
Build graph, traverse to find common ancestor, count hops.

### 3. vCard Generation
```typescript
function generateVCard(user: User): string {
  return `BEGIN:VCARD
VERSION:3.0
FN:${user.firstName} ${user.lastName}
TEL:${user.phone}
EMAIL:${user.email}
END:VCARD`;
}
```

### 4. Vercel Blob Upload
```typescript
// /api/upload/route.ts
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  const file = await request.formData().get('file') as File;
  const blob = await put(file.name, file, { access: 'public' });
  return Response.json({ url: blob.url });
}
```

### 5. Resend Email
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Family Tree <noreply@yourdomain.com>',
  to: email,
  subject: 'You're invited!',
  html: `<p>Your password: ${password}</p>
         <p><a href="${appUrl}">Open Family Tree</a></p>`
});
```

---

## Final Output

A fully functional PWA with:
- ✅ Secure authentication (member + admin)
- ✅ Admin dashboard (invite, add/edit members)
- ✅ Member directory (search, filter, view)
- ✅ 2D zoomable family tree
- ✅ Profile management (view, edit, download contact)
- ✅ Glassmorphism UI with forest green accents
- ✅ PWA installable on mobile
- ✅ Free-tier deployment (Vercel)

Build this end-to-end, ensuring all templates are properly merged and styled consistently.
