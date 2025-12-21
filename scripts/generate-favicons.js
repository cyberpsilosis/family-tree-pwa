const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZES = [16, 32, 48, 64, 128, 192, 256, 512];
const INPUT_DIR = path.join(__dirname, '../public/new logos');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

const logos = {
  christmas: path.join(INPUT_DIR, 'christmas-tree-icon.png.png'),
  family: path.join(INPUT_DIR, 'family-tree-icon.png.png')
};

async function generateFavicons() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Generating favicons...');

  // Generate icons for both logos
  for (const [type, inputPath] of Object.entries(logos)) {
    console.log(`\nProcessing ${type} tree logo...`);
    
    for (const size of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `${type}-tree-${size}x${size}.png`);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`  ✓ Generated ${size}x${size}`);
    }

    // Generate ICO file (16x16, 32x32, 48x48)
    const icoSizes = [16, 32, 48];
    const icoPath = path.join(OUTPUT_DIR, `${type}-tree-favicon.ico`);
    
    // For ICO, we'll generate a 32x32 version (most common)
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(icoPath.replace('.ico', '.png'));
    
    console.log(`  ✓ Generated favicon.ico (as PNG)`);
  }

  // Copy the appropriate favicon to root
  const currentMonth = new Date().getMonth();
  const isChristmasSeason = currentMonth >= 10 || currentMonth === 0; // Nov (10), Dec (11), Jan (0)
  
  const activeFavicon = isChristmasSeason ? 'christmas' : 'family';
  const faviconSource = path.join(OUTPUT_DIR, `${activeFavicon}-tree-32x32.png`);
  const faviconDest = path.join(__dirname, '../public/favicon.ico');
  
  fs.copyFileSync(faviconSource, faviconDest);
  console.log(`\n✓ Copied ${activeFavicon} tree favicon to /public/favicon.ico`);

  console.log('\n✨ All favicons generated successfully!');
}

generateFavicons().catch(console.error);
