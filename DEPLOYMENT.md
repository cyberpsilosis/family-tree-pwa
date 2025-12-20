# Deployment Checklist

## ✅ Completed Features

### Core Functionality
- [x] Authentication system (JWT, HTTP-only cookies)
- [x] Admin dashboard with full CRUD operations
- [x] Member home with family tree and card views
- [x] Profile photo upload (Cloudinary integration)
- [x] vCard contact download
- [x] Email system (Resend API)
- [x] Family tree visualization (React Flow)
- [x] Parent/child relationship management
- [x] Social media links
- [x] PWA configuration

### Admin Features
- [x] Send invite emails with auto-generated passwords
- [x] Add new members with profile photos
- [x] Edit member profiles with password regeneration
- [x] Delete members
- [x] View all members in searchable list
- [x] Upload profile photos via drag-and-drop

### Member Features
- [x] View family directory (grid and tree views)
- [x] Search and filter members
- [x] Download contact info as vCard
- [x] View relationship labels
- [x] Interactive family tree with zoom/pan

---

## 🚀 Deployment Steps

### 1. Environment Variables

Add these to your `.env.local` (and Vercel):

```env
# Database (Vercel Postgres)
DATABASE_URL="postgresql://..."

# Cloudinary (Profile Photos)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Resend (Email)
RESEND_API_KEY="re_..."

# Auth
JWT_SECRET="your-random-secret-key"
ADMIN_PASSWORD="your-admin-password"

# App URL
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

### 2. Set Up Services

**Cloudinary** (Free - 25GB storage):
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials from Dashboard
3. Add to environment variables

**Resend** (Free - 100 emails/day):
1. Sign up at [resend.com](https://resend.com)
2. Create API key
3. Add domain (or use `onboarding@resend.dev` for testing)

**Vercel Postgres**:
1. Create database in Vercel project
2. Copy `DATABASE_URL`
3. Run migrations: `npx prisma migrate deploy`

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Create admin user manually via Prisma Studio
npx prisma studio
```

### 4. Deploy to Vercel

```bash
# Push to git
git add .
git commit -m "Complete family tree PWA with Cloudinary and vCard"
git push

# Deploy via Vercel CLI or dashboard
vercel --prod
```

### 5. Post-Deployment

- [ ] Test login (admin and member)
- [ ] Upload a test photo
- [ ] Send test invite email
- [ ] Download a vCard
- [ ] Test PWA installation on mobile
- [ ] Verify family tree visualization

---

## 📱 PWA Installation Instructions

### iOS (Safari)
1. Open app in Safari
2. Tap Share button
3. Scroll down and tap "Add to Home Screen"
4. Confirm

### Android (Chrome)
1. Open app in Chrome
2. Tap menu (3 dots)
3. Tap "Add to Home Screen"
4. Confirm

---

## 🔧 Missing Features (Optional Enhancements)

### PWA Icons
- [ ] Generate 192x192px icon
- [ ] Generate 512x512px icon
- [ ] Update `public/manifest.json`

### Future Enhancements
- [ ] Theme persistence (localStorage + User.theme)
- [ ] Profile pages (`/profile/[id]`)
- [ ] Edit own profile (member self-service)
- [ ] Forgot password flow
- [ ] Advanced search filters
- [ ] Birthday notifications
- [ ] Family event calendar

---

## 🧪 Testing

### Admin Workflow
1. Login as admin
2. Go to "Add Member"
3. Fill form + upload photo
4. Toggle "Send invite email"
5. Create member
6. Verify email received
7. Edit member profile
8. Change name → see password warning
9. Regenerate password

### Member Workflow
1. Login with generated password
2. View family directory
3. Search for members
4. Toggle to tree view
5. Click a profile card
6. Download contact as vCard
7. Test social media links

---

## 📊 Service Limits

### Cloudinary (Free Tier)
- Storage: 25 GB
- Bandwidth: 25 GB/month
- Transformations: 25,000/month
- **Estimate**: ~25,000 profile photos

### Resend (Free Tier)
- 100 emails/day
- 3,000 emails/month
- **Estimate**: ~30 invites/day

### Vercel (Hobby)
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless function execution

---

## 🐛 Troubleshooting

### "Upload failed"
- Check Cloudinary credentials
- Verify file size (<10MB)
- Check browser console for errors

### "Email not received"
- Check Resend API key
- Verify email address is valid
- Check spam folder
- Use Resend test domain for development

### "Password incorrect"
- Verify password format: `[first-initial][lastname][yy]`
- Example: John Smith born 1999 → `jsmith99`
- Check birthday year matches

### "Database connection failed"
- Verify DATABASE_URL is correct
- Run `npx prisma generate`
- Check Vercel Postgres is active

---

## 📝 Admin Notes

### Password Generation Logic
Members receive auto-generated passwords:
- Format: `[first-initial][lastname][yy]`
- Example: Sarah Johnson born 1995 → `sjohnson95`

If you edit name/birthYear:
- Warning appears
- Click "Regenerate Password" button
- New password emailed automatically

### Photo Upload
- Max size: 10MB
- Auto-resized to 400x400px
- Face detection cropping
- Stored on Cloudinary CDN

### Family Tree
- Assign parent via dropdown
- Tree auto-updates
- Supports unlimited depth
- Relationship labels calculated automatically

---

## ✅ Final Checks

Before going live:
- [ ] All environment variables set
- [ ] Database migrated
- [ ] Admin account created
- [ ] Test emails working
- [ ] Photo upload working
- [ ] PWA installable
- [ ] Mobile responsive
- [ ] Dark mode working

---

## 🎉 You're Ready!

Your Family Tree PWA is complete and production-ready. All core features are implemented:
- ✅ Cloudinary photo uploads
- ✅ vCard downloads
- ✅ Email invites
- ✅ Family tree visualization
- ✅ Full admin dashboard
- ✅ PWA installable

Deploy and share with your family! 🌳
