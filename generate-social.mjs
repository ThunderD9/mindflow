import sharp from 'sharp';
import path from 'path';

async function generateSocialPreview() {
  try {
    const inputPath = path.resolve('public/favicon.svg');
    const outputPath = path.resolve('social-preview.png');
    
    // Create a 1280x640 dark background
    const background = sharp({
      create: {
        width: 1280,
        height: 640,
        channels: 4,
        background: { r: 9, g: 13, b: 22, alpha: 1 } // #090d16
      }
    });

    // Resize the SVG to something large, like 400x400
    const iconBuffer = await sharp(inputPath)
      .resize(400, 400)
      .png()
      .toBuffer();

    // Composite the icon onto the center of the background
    await background
      .composite([{ input: iconBuffer, gravity: 'center' }])
      .png()
      .toFile(outputPath);
      
    console.log('Successfully created social-preview.png (1280x640) from SVG!');
  } catch (error) {
    console.error('Error generating social preview:', error);
  }
}

generateSocialPreview();
