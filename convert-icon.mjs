import sharp from 'sharp';
import path from 'path';

async function convertIcon() {
  try {
    const inputPath = path.resolve('public/favicon.svg');
    const outputPath = path.resolve('public/icon.png');
    
    await sharp(inputPath)
      .resize(512, 512)
      .png()
      .toFile(outputPath);
      
    console.log('Successfully converted SVG to PNG for Electron App Icon!');
  } catch (error) {
    console.error('Error converting icon:', error);
  }
}

convertIcon();
