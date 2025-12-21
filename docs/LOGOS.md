# Logo and Favicon System

This project uses a dynamic logo system that automatically switches between two logos based on the current date:

- **Christmas Tree Logo**: Displayed from November 1st to January 1st
- **Family Tree Logo**: Displayed all other days of the year

## Generated Icon Sizes

The following sizes are generated for both logos:
- 16x16, 32x32, 48x48, 64x64 (favicons)
- 128x128, 192x192, 256x256, 512x512 (PWA icons)

All icons are located in `/public/icons/` with the naming convention:
- `christmas-tree-{size}x{size}.png`
- `family-tree-{size}x{size}.png`

## Source Images

Source images are located in `/public/new logos/`:
- `christmas-tree-icon.png.png`
- `family-tree-icon.png.png`

Both are transparent PNG files that are processed into multiple sizes.

## Usage

### In React Components

Use the `LogoImage` component to display the correct logo:

```tsx
import { LogoImage } from '@/components/LogoImage';

function MyComponent() {
  return <LogoImage size={192} className="my-class" />;
}
```

The component automatically:
- Displays the correct logo based on the current date
- Updates at midnight if the date changes
- Handles all sizing and optimization

### Using Logo Utilities

For manual control, use the utility functions:

```tsx
import { getCurrentLogo, getLogoIconPath } from '@/lib/logo-utils';

// Get current logo type
const logoType = getCurrentLogo(); // 'christmas' | 'family'

// Get path to specific size
const iconPath = getLogoIconPath(192); // '/icons/christmas-tree-192x192.png'
```

### PWA Manifest

The PWA manifest is dynamically generated at `/api/manifest` and automatically includes the correct icons based on the current date.

## Regenerating Icons

To regenerate all favicon and icon sizes:

```bash
npm run generate-favicons
```

This script:
1. Reads the source images from `/public/new logos/`
2. Generates all required sizes in `/public/icons/`
3. Copies the appropriate favicon to `/public/favicon.ico` based on the current date

Icons are automatically regenerated before each build via the `prebuild` script.

## Build Integration

The favicon generation is integrated into the build process:
- `npm run build` automatically runs `generate-favicons` first
- This ensures icons are always up-to-date in production

## Metadata

The app's metadata (including favicon and app icons) is dynamically generated in `lib/metadata.ts` and automatically updates based on the current date.
