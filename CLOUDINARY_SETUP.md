# Cloudinary Setup Guide

## Why Cloudinary?

Your project was originally configured for Vercel Blob, but you hit the free tier limits (0 GB storage, 0/10k operations). Cloudinary offers a **much more generous free tier**:

- **25 GB storage** (vs. Vercel Blob's restrictive limits)
- **25 GB bandwidth/month**
- Automatic image optimization (format, quality, compression)
- Face detection for smart cropping
- Built-in CDN
- No credit card required for free tier

For a family tree app with ~100 users, this is more than enough.

---

## Setup Steps

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (no credit card needed)
3. Verify your email

### 2. Get Your Credentials

After signing up, you'll see your **Dashboard** with:

- **Cloud Name**: e.g., `dxxxxxx`
- **API Key**: e.g., `123456789012345`
- **API Secret**: e.g., `abcdefghijklmnopqrstuvwxyz123`

### 3. Add to Environment Variables

Update your `.env.local` file:

```env
# Cloudinary (for profile photos)
CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="your_api_secret_here"
```

**Note:** Replace `your_cloud_name_here`, etc. with your actual credentials from the Cloudinary dashboard.

### 4. Deploy to Vercel

When deploying, add these environment variables in your Vercel project settings:
- Dashboard → Settings → Environment Variables
- Add all three Cloudinary variables

---

## What's Already Configured

✅ **API Route**: `/api/upload` is ready to go  
✅ **Auto-optimization**: Images are resized to 400x400px with face detection  
✅ **Smart cropping**: Uses `gravity: 'face'` to center on faces  
✅ **Quality**: Automatic quality optimization  
✅ **Format**: Auto-converts to best format (WebP when supported)  
✅ **Organization**: All uploads go to `family-tree/profile-photos/` folder

---

## Usage Example

### Frontend (React Component)

```tsx
async function handleUpload(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  console.log('Uploaded URL:', data.url);
  // Store data.url in User.profilePhotoUrl
}
```

### API Response

```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v123456/family-tree/profile-photos/abc123.jpg",
  "publicId": "family-tree/profile-photos/abc123"
}
```

---

## Image Transformations

Cloudinary automatically applies these transformations:

1. **Resize**: 400x400px
2. **Crop**: `fill` with face detection (`gravity: 'face'`)
3. **Quality**: Automatic (`quality: 'auto'`)
4. **Format**: Best format for browser (`fetch_format: 'auto'`)

You can customize transformations in `src/app/api/upload/route.ts`.

---

## Viewing Uploaded Images

1. Go to [cloudinary.com/console](https://cloudinary.com/console)
2. Click **Media Library** in the left sidebar
3. Navigate to **family-tree/profile-photos/**
4. All profile photos will be organized here

---

## Free Tier Limits

- **25 GB** storage
- **25 GB** bandwidth/month
- **25,000** transformations/month
- **500,000** total transformations

For ~100 users with profile photos:
- Storage: ~100 MB (1 MB per photo)
- Bandwidth: Depends on views, but 25 GB = ~25,000 page loads
- **You'll be well within limits!**

---

## Troubleshooting

### "Invalid API Key"
- Double-check your `.env.local` credentials
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env.local`

### "Upload failed"
- Check file size (Cloudinary free tier supports up to 10 MB per image)
- Ensure file is an image format (JPEG, PNG, WebP, etc.)
- Check browser console for detailed error

### Images not displaying
- Verify the URL returned from `/api/upload`
- Check if Cloudinary URL is accessible in browser
- Ensure `User.profilePhotoUrl` is correctly saved to database

---

## Next Steps

Now that Cloudinary is configured, you can:

1. **Add photo upload UI** to `/admin/create-profile` and `/admin/members/[id]/edit`
2. **Display photos** in ProfileCard components
3. **Test uploads** in development before deploying

The API is ready to go — just add the frontend UI! 🎉
