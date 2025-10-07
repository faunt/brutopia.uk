import { glob } from "glob";
import fs from "fs/promises";
import path from "path";

// --- CONFIG ---
const IMAGE_DIR = "../img";

async function cleanupRedundantImages() {
  console.log("🧹 Cleaning up redundant image files...");
  
  // Find all generated images (with size suffixes)
  const generatedImages = await glob(`${IMAGE_DIR}/**/*-{400,800,1200,1600}.{png,avif,webp}`);
  const aliasImages = await glob(`${IMAGE_DIR}/**/*-{400,800,1200,1600}-{400,800,1200,1600}.{png,avif,webp}`);
  
  const allRedundantImages = [...generatedImages, ...aliasImages];
  
  console.log(`Found ${allRedundantImages.length} redundant image files to remove`);
  
  let removedCount = 0;
  for (const file of allRedundantImages) {
    try {
      await fs.unlink(file);
      removedCount++;
      console.log(`  ✓ Removed ${file}`);
    } catch (error) {
      console.log(`  ✗ Failed to remove ${file}: ${error.message}`);
    }
  }
  
  console.log(`\n🎉 Cleanup complete! Removed ${removedCount} redundant image files.`);
  console.log("Now you can run the optimized image generation with: npm run optimize:images");
}

cleanupRedundantImages().catch(console.error);

