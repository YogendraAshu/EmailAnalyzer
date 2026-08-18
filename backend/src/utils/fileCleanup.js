import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.resolve("uploads");

/**
 * Safely delete a single file
 * @param {string} filePath - Absolute or relative path to file
 */
export const deleteFile = (filePath) => {
  try {
    if (!filePath) return;
    const resolvedPath = path.resolve(filePath);
    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
      console.log(`[AutoDelete] Successfully deleted file: ${path.basename(resolvedPath)}`);
    }
  } catch (err) {
    console.warn(`[AutoDelete Warning] Could not delete ${filePath}:`, err.message);
  }
};

/**
 * Safely delete multiple files
 * @param {string[]} filePaths - Array of file paths to delete
 */
export const deleteFiles = (filePaths = []) => {
  if (!Array.isArray(filePaths)) return;
  for (const fp of filePaths) {
    deleteFile(fp);
  }
};

/**
 * Clean up files in uploads directory older than maxAgeMs (default: 5 minutes)
 * @param {number} maxAgeMs - Max age in milliseconds
 */
export const cleanUploadsDir = (maxAgeMs = 5 * 60 * 1000) => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) return;

    const files = fs.readdirSync(UPLOAD_DIR);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      // Ignore hidden files / .gitkeep
      if (file.startsWith(".")) continue;

      const filePath = path.join(UPLOAD_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          const age = now - stats.mtimeMs;
          if (age >= maxAgeMs) {
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`[AutoDelete Cleanup] Removed expired file: ${file}`);
          }
        }
      } catch (fErr) {
        console.warn(`[AutoDelete Cleanup Error] File ${file}:`, fErr.message);
      }
    }

    if (deletedCount > 0) {
      console.log(`[AutoDelete Cleanup] Total ${deletedCount} expired file(s) removed from uploads/`);
    }
  } catch (err) {
    console.warn("[AutoDelete Cleanup] Directory scan error:", err.message);
  }
};

/**
 * Clean ALL files in uploads directory immediately
 */
export const cleanAllUploadsImmediately = () => {
  cleanUploadsDir(0);
};

/**
 * Start periodic background cleanup runner
 * @param {number} intervalMs - Interval between runs (default: 10 minutes)
 * @param {number} maxAgeMs - Max age of files to delete (default: 5 minutes)
 */
export const startPeriodicCleanup = (intervalMs = 10 * 60 * 1000, maxAgeMs = 5 * 60 * 1000) => {
  // Run once immediately on startup for old files
  cleanUploadsDir(maxAgeMs);

  // Set recurring timer
  setInterval(() => {
    cleanUploadsDir(maxAgeMs);
  }, intervalMs);

  console.log(`[AutoDelete Service] Periodic upload cleaner started (Runs every ${intervalMs / 60000}m, Expire: ${maxAgeMs / 60000}m)`);
};
