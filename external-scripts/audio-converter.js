const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const INPUT_DIR = './input_songs';  // Put your original songs here
const OUTPUT_DIR = './output_songs'; // Processed songs go here
const QUALITIES = {
  low: '64k',     // ~2MB per song
  medium: '128k', // ~4MB per song  
  high: '320k'    // ~10MB per song
};

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get all audio files from input directory
function getAudioFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.mp3', '.wav', '.flac', '.m4a', '.aac'].includes(ext);
  });
}

// Convert single file to multiple qualities
function convertFile(inputFile) {
  const fileName = path.parse(inputFile).name;
  const inputPath = path.join(INPUT_DIR, inputFile);
  
  console.log(`🎵 Processing: ${fileName}...`);
  
  Object.entries(QUALITIES).forEach(([qualityName, bitrate]) => {
    const outputFileName = `${fileName}_${qualityName}.mp3`;
    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    
    // Skip if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`   ⏭️  ${qualityName} already exists, skipping...`);
      return;
    }
    
    try {
      // FFmpeg command to convert
      const command = `ffmpeg -i "${inputPath}" -b:a ${bitrate} -map_metadata 0 "${outputPath}"`;
      
      console.log(`   🔄 Creating ${qualityName} quality (${bitrate})...`);
      execSync(command, { stdio: 'pipe' });
      
      // Get file size for confirmation
      const stats = fs.statSync(outputPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`   ✅ ${qualityName}: ${sizeInMB}MB`);
      
    } catch (error) {
      console.error(`   ❌ Error processing ${qualityName}:`, error.message);
    }
  });
  
  console.log(`✨ Finished processing: ${fileName}\n`);
}

// Batch process all files
function processAllFiles() {
  const audioFiles = getAudioFiles(INPUT_DIR);
  
  if (audioFiles.length === 0) {
    console.log('❌ No audio files found in input directory!');
    console.log(`📁 Make sure to put your audio files in: ${INPUT_DIR}`);
    return;
  }
  
  console.log(`🚀 Found ${audioFiles.length} audio files to process...\n`);
  
  const startTime = Date.now();
  
  audioFiles.forEach(convertFile);
  
  const endTime = Date.now();
  const totalTime = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`🎉 All done! Processed ${audioFiles.length} files in ${totalTime} seconds`);
  console.log(`📁 Check your converted files in: ${OUTPUT_DIR}`);
  
  // Show summary
  showSummary();
}

// Show processing summary
function showSummary() {
  const outputFiles = fs.readdirSync(OUTPUT_DIR);
  const totalFiles = outputFiles.length;
  
  let totalSize = 0;
  outputFiles.forEach(file => {
    const filePath = path.join(OUTPUT_DIR, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
  });
  
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  
  console.log('\n📊 SUMMARY:');
  console.log(`   Total files created: ${totalFiles}`);
  console.log(`   Total size: ${totalSizeMB}MB`);
  console.log(`   Average size per file: ${(totalSizeMB / totalFiles).toFixed(2)}MB`);
}

// Helper function to check if FFmpeg is installed
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    console.log('✅ FFmpeg is installed and ready!');
    return true;
  } catch (error) {
    console.log('❌ FFmpeg not found!');
    console.log('📥 Please install FFmpeg first:');
    console.log('   Windows: Download from https://ffmpeg.org/download.html');
    console.log('   Mac: brew install ffmpeg');
    console.log('   Linux: sudo apt install ffmpeg');
    return false;
  }
}

// Main execution
function main() {
  console.log('🎼 Audio Quality Converter Starting...\n');
  
  // Check if FFmpeg is available
  if (!checkFFmpeg()) {
    return;
  }
  
  // Create input directory if it doesn't exist
  if (!fs.existsSync(INPUT_DIR)) {
    fs.mkdirSync(INPUT_DIR, { recursive: true });
    console.log(`📁 Created input directory: ${INPUT_DIR}`);
    console.log('   Please add your audio files there and run the script again.');
    return;
  }
  
  // Start processing
  processAllFiles();
}

// Run the script
main();