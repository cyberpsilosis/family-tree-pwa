import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getCurrentLogo } from '@/lib/logo-utils';

export async function GET() {
  const logo = getCurrentLogo();
  const iconPath = join(process.cwd(), 'public', 'icons', `${logo}-tree-favicon.png`);
  
  try {
    const imageBuffer = await readFile(iconPath);
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error loading favicon:', error);
    return new NextResponse('Favicon not found', { status: 404 });
  }
}
