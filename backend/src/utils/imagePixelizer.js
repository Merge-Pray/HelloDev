import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

/**
 * Downloads an image from URL and converts it to pixel art
 * @param {string} imageUrl - URL of the image to pixelize
 * @param {number} gridSize - Size of the pixel grid (default: 16)
 * @returns {Promise<{pixels: string[], imageDataUrl: string}>}
 */
export async function pixelizeImageFromUrl(imageUrl, gridSize = 16) {
  try {
    console.log('🎨 Starting image pixelization...');
    console.log('📥 Downloading image from:', imageUrl);
    
    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    console.log('✅ Image downloaded, size:', buffer.length, 'bytes');
    
    // Load image with canvas
    const img = await loadImage(buffer);
    console.log('✅ Image loaded, dimensions:', img.width, 'x', img.height);
    
    // Create canvas for resizing
    const canvas = createCanvas(gridSize, gridSize);
    const ctx = canvas.getContext('2d');
    
    // Calculate scale to fit image into grid while maintaining aspect ratio
    const scale = Math.min(gridSize / img.width, gridSize / img.height);
    const scaledWidth = Math.max(1, Math.floor(img.width * scale));
    const scaledHeight = Math.max(1, Math.floor(img.height * scale));
    const offsetX = Math.floor((gridSize - scaledWidth) / 2);
    const offsetY = Math.floor((gridSize - scaledHeight) / 2);
    
    // Clear canvas and draw scaled image
    ctx.clearRect(0, 0, gridSize, gridSize);
    ctx.fillStyle = '#ffffff'; // White background
    ctx.fillRect(0, 0, gridSize, gridSize);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
    
    console.log('✅ Image scaled to grid size:', gridSize, 'x', gridSize);
    
    // Extract pixel data
    const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
    const data = imageData.data;
    const pixels = [];
    
    // Convert RGBA to hex colors
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const index = (y * gridSize + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];
        
        // If alpha is very low, treat as white background
        const hex = a < 10 
          ? '#ffffff' 
          : '#' + [r, g, b]
              .map(v => v.toString(16).padStart(2, '0'))
              .join('');
        
        pixels.push(hex);
      }
    }
    
    console.log('✅ Pixel data extracted, total pixels:', pixels.length);
    
    // Create high-resolution output image (512x512 like in frontend)
    const outputSize = 512;
    const outputCanvas = createCanvas(outputSize, outputSize);
    const outputCtx = outputCanvas.getContext('2d');
    outputCtx.imageSmoothingEnabled = false;
    
    const cellSize = outputSize / gridSize;
    
    // Fill background
    outputCtx.fillStyle = '#ffffff';
    outputCtx.fillRect(0, 0, outputSize, outputSize);
    
    // Draw pixels
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const pixelIndex = y * gridSize + x;
        outputCtx.fillStyle = pixels[pixelIndex];
        outputCtx.fillRect(
          Math.floor(x * cellSize), 
          Math.floor(y * cellSize), 
          Math.ceil(cellSize), 
          Math.ceil(cellSize)
        );
      }
    }
    
    // Convert to data URL
    const imageDataUrl = outputCanvas.toDataURL('image/png');
    console.log('✅ High-res pixelized image created');
    
    return {
      pixels,
      imageDataUrl,
      gridSize
    };
    
  } catch (error) {
    console.error('❌ Error in pixelizeImageFromUrl:', error);
    throw new Error(`Failed to pixelize image: ${error.message}`);
  }
}

/**
 * Converts a data URL to a Buffer for upload
 * @param {string} dataUrl - Data URL string
 * @returns {Buffer}
 */
export function dataUrlToBuffer(dataUrl) {
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Generates a random pixel avatar (like the frontend randomizePixels function)
 * @param {number} gridSize - Size of the pixel grid (default: 16)
 * @returns {string[]} Array of hex color strings
 */
export function generateRandomPixelAvatar(gridSize = 16) {
  console.log('🎲 Generating random pixel avatar with grid size:', gridSize);
  
  const palette = [
    "#000000", "#ffffff",
    "#5d3f94", "#a78bfa", "#9333ea",
    "#ef4444", "#f59e0b", "#10b981", "#3b82f6"
  ];
  
  const pick = () => palette[Math.floor(Math.random() * palette.length)];
  
  const arr = Array.from({ length: gridSize * gridSize }, () => "#ffffff");
  
  // Symmetrisches Gesicht / Pattern (linke Hälfte füllen, rechte spiegeln)
  const half = Math.ceil(gridSize / 2);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < half; x++) {
      const useColor =
        Math.random() < 0.15 ? pick() :
        Math.random() < 0.6 ? "#ffffff" : pick();
      arr[y * gridSize + x] = useColor;
      arr[y * gridSize + (gridSize - 1 - x)] = useColor;
    }
  }
  
  // Rauschflecken / Akzente
  const blobs = 2 + Math.floor(Math.random() * 4);
  for (let b = 0; b < blobs; b++) {
    const cx = Math.floor(Math.random() * gridSize);
    const cy = Math.floor(Math.random() * gridSize);
    const r = 1 + Math.floor(Math.random() * (gridSize / 8));
    const color = pick();
    for (let y = Math.max(0, cy - r); y < Math.min(gridSize, cy + r); y++) {
      for (let x = Math.max(0, cx - r); x < Math.min(gridSize, cx + r); x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r && Math.random() < 0.8) {
          arr[y * gridSize + x] = color;
        }
      }
    }
  }
  
  // Augen-Punkte (bei kleineren Grids)
  if (gridSize >= 16) {
    const ey = Math.floor(gridSize / 3);
    const ex = Math.floor(gridSize / 4);
    const eyeC = "#000000";
    arr[ey * gridSize + Math.floor(gridSize / 2 - ex)] = eyeC;
    arr[ey * gridSize + Math.floor(gridSize / 2 + ex)] = eyeC;
  }
  
  console.log('✅ Random pixel avatar generated with', arr.length, 'pixels');
  return arr;
}

/**
 * Creates a high-resolution PNG from pixel array (like the frontend toPNGDataURL)
 * @param {string[]} pixels - Array of hex color strings
 * @param {number} gridSize - Size of the pixel grid
 * @param {number} outputSize - Output image size in pixels (default: 512)
 * @returns {Promise<string>} Data URL of the generated PNG
 */
export async function pixelsToDataURL(pixels, gridSize, outputSize = 512) {
  console.log('🖼️ Converting pixels to PNG...');
  
  const { createCanvas } = await import('canvas');
  const canvas = createCanvas(outputSize, outputSize);
  const ctx = canvas.getContext('2d');
  
  ctx.imageSmoothingEnabled = false;
  const cellSize = outputSize / gridSize;
  
  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputSize, outputSize);
  
  // Draw pixels
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const pixelIndex = y * gridSize + x;
      ctx.fillStyle = pixels[pixelIndex];
      ctx.fillRect(
        Math.floor(x * cellSize), 
        Math.floor(y * cellSize), 
        Math.ceil(cellSize), 
        Math.ceil(cellSize)
      );
    }
  }
  
  const dataUrl = canvas.toDataURL('image/png');
  console.log('✅ PNG generated from pixels');
  return dataUrl;
}

/**
 * Generates a complete random avatar (pixels + image) and uploads to Cloudinary
 * @param {string} userId - User ID for Cloudinary folder
 * @param {object} cloudinary - Cloudinary instance
 * @param {number} gridSize - Size of the pixel grid (default: 16)
 * @returns {Promise<{pixels: string[], avatarUrl: string, avatarData: string}>}
 */
export async function generateAndUploadRandomAvatar(userId, cloudinary, gridSize = 16) {
  try {
    console.log('🎨 Generating complete random avatar for user:', userId);
    
    // 1. Generate random pixel array
    const pixels = generateRandomPixelAvatar(gridSize);
    
    // 2. Create PNG from pixels
    const imageDataUrl = await pixelsToDataURL(pixels, gridSize, 512);
    
    // 3. Convert to buffer for upload
    const imageBuffer = dataUrlToBuffer(imageDataUrl);
    
    // 4. Upload to Cloudinary
    const folder = `avatars/${userId}`;
    console.log('☁️ Uploading random avatar to Cloudinary...');
    
    const cloudinaryResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          allowed_formats: ['png'],
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(imageBuffer);
    });
    
    console.log('✅ Random avatar uploaded to Cloudinary successfully');
    
    return {
      pixels,
      avatarUrl: cloudinaryResult.secure_url,
      avatarData: JSON.stringify(pixels), // Ready for database storage
    };
    
  } catch (error) {
    console.error('❌ Error generating and uploading random avatar:', error);
    throw new Error(`Failed to generate random avatar: ${error.message}`);
  }
}
