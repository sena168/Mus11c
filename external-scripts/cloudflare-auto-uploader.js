const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

// Configuration - Replace with your actual values
const CONFIG = {
  // Cloudflare R2 credentials
  cloudflare: {
    accountId: 'your-cloudflare-account-id',
    accessKeyId: 'your-r2-access-key',
    secretAccessKey: 'your-r2-secret-key',
    bucketName: 'your-music-bucket',
    region: 'auto', // Always 'auto' for R2
    endpoint: 'https://your-account-id.r2.cloudflarestorage.com'
  },
  
  // Local paths
  paths: {
    songsFolder: './songs_to_upload',
    outputFile: './song_links.json',
    appConfigFile: './app_config.js' // Your app's config file
  },
  
  // URL format for accessing files
  publicUrl: 'https://your-custom-domain.com' // or direct R2 URL
};

// Initialize AWS SDK for R2
const s3 = new AWS.S3({
  endpoint: CONFIG.cloudflare.endpoint,
  accessKeyId: CONFIG.cloudflare.accessKeyId,
  secretAccessKey: CONFIG.cloudflare.secretAccessKey,
  region: CONFIG.cloudflare.region,
  signatureVersion: 'v4'
});

// Get all audio files from the folder
function getAudioFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`📁 Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
    console.log('❌ No songs found! Add your songs to the songs_to_upload folder.');
    return [];
  }
  
  const files = fs.readdirSync(dir);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.mp3', '.wav', '.flac', '.m4a', '.aac'].includes(ext);
  });
}

// Upload single file to R2
async function uploadFile(filePath, fileName) {
  const fileContent = fs.readFileSync(filePath);
  const fileSize = fs.statSync(filePath).size;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  
  console.log(`📤 Uploading: ${fileName} (${fileSizeMB}MB)...`);
  
  const uploadParams = {
    Bucket: CONFIG.cloudflare.bucketName,
    Key: fileName,
    Body: fileContent,
    ContentType: getContentType(fileName),
    // Make file publicly accessible
    ACL: 'public-read'
  };
  
  try {
    const result = await s3.upload(uploadParams).promise();
    const publicUrl = `${CONFIG.publicUrl}/${fileName}`;
    
    console.log(`✅ Uploaded: ${fileName}`);
    console.log(`🔗 URL: ${publicUrl}`);
    
    return {
      success: true,
      fileName: fileName,
      originalName: fileName,
      url: publicUrl,
      size: fileSizeMB,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, error.message);
    return {
      success: false,
      fileName: fileName,
      error: error.message
    };
  }
}

// Get content type based on file extension
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const contentTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac'
  };
  return contentTypes[ext] || 'audio/mpeg';
}

// Check if file already exists in R2
async function fileExists(fileName) {
  try {
    await s3.headObject({
      Bucket: CONFIG.cloudflare.bucketName,
      Key: fileName
    }).promise();
    return true;
  } catch (error) {
    if (error.statusCode === 404) {
      return false;
    }
    throw error;
  }
}

// Generate song metadata from filename
function generateSongMetadata(fileName) {
  const nameWithoutExt = path.parse(fileName).name;
  
  // Try to parse "Artist - Title" format
  const parts = nameWithoutExt.split(' - ');
  if (parts.length >= 2) {
    return {
      title: parts[1].trim(),
      artist: parts[0].trim(),
      filename: nameWithoutExt
    };
  }
  
  // Fallback to just filename
  return {
    title: nameWithoutExt,
    artist: 'Unknown Artist',
    filename: nameWithoutExt
  };
}

// Update your app configuration
function updateAppConfig(songData) {
  const configContent = `// Auto-generated song configuration
// Last updated: ${new Date().toISOString()}

export const SONGS = ${JSON.stringify(songData, null, 2)};

export const SONG_URLS = {
${songData.map(song => `  "${song.id}": "${song.url}"`).join(',\n')}
};

// Usage in your app:
// import { SONGS, SONG_URLS } from './app_config.js';
// const songUrl = SONG_URLS[songId];
`;
  
  fs.writeFileSync(CONFIG.paths.appConfigFile, configContent);
  console.log(`📝 Updated app config: ${CONFIG.paths.appConfigFile}`);
}

// Main upload function
async function uploadAllSongs() {
  console.log('🎵 Starting batch upload to Cloudflare R2...\n');
  
  const audioFiles = getAudioFiles(CONFIG.paths.songsFolder);
  if (audioFiles.length === 0) {
    return;
  }
  
  console.log(`📁 Found ${audioFiles.length} audio files to upload\n`);
  
  const results = [];
  const songData = [];
  let uploadedCount = 0;
  let skippedCount = 0;
  
  for (const fileName of audioFiles) {
    const filePath = path.join(CONFIG.paths.songsFolder, fileName);
    
    // Check if file already exists
    try {
      const exists = await fileExists(fileName);
      if (exists) {
        console.log(`⏭️  Skipping: ${fileName} (already exists)`);
        skippedCount++;
        
        // Still add to song data
        const metadata = generateSongMetadata(fileName);
        songData.push({
          id: songData.length + 1,
          ...metadata,
          url: `${CONFIG.publicUrl}/${fileName}`,
          status: 'existing'
        });
        
        continue;
      }
    } catch (error) {
      console.log(`⚠️  Warning: Could not check if ${fileName} exists, will attempt upload`);
    }
    
    // Upload the file
    const result = await uploadFile(filePath, fileName);
    results.push(result);
    
    if (result.success) {
      uploadedCount++;
      
      // Generate song metadata
      const metadata = generateSongMetadata(fileName);
      songData.push({
        id: songData.length + 1,
        ...metadata,
        url: result.url,
        size: result.size,
        uploadedAt: result.uploadedAt,
        status: 'uploaded'
      });
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results
  const summaryData = {
    totalFiles: audioFiles.length,
    uploaded: uploadedCount,
    skipped: skippedCount,
    failed: results.filter(r => !r.success).length,
    songs: songData,
    generatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(CONFIG.paths.outputFile, JSON.stringify(summaryData, null, 2));
  console.log(`\n💾 Saved results to: ${CONFIG.paths.outputFile}`);
  
  // Update app configuration
  updateAppConfig(songData);
  
  // Show summary
  console.log('\n📊 UPLOAD SUMMARY:');
  console.log(`   Total files: ${audioFiles.length}`);
  console.log(`   ✅ Uploaded: ${uploadedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Failed: ${results.filter(r => !r.success).length}`);
  console.log(`   🔗 All URLs saved to: ${CONFIG.paths.outputFile}`);
  console.log(`   ⚙️  App config updated: ${CONFIG.paths.appConfigFile}`);
  
  if (results.some(r => !r.success)) {
    console.log('\n❌ Failed uploads:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ${r.fileName}: ${r.error}`);
    });
  }
}

// Test connection to R2
async function testConnection() {
  console.log('🔍 Testing connection to Cloudflare R2...');
  
  try {
    const result = await s3.listObjectsV2({
      Bucket: CONFIG.cloudflare.bucketName,
      MaxKeys: 1
    }).promise();
    
    console.log('✅ Connection successful!');
    console.log(`📦 Bucket: ${CONFIG.cloudflare.bucketName}`);
    console.log(`📊 Objects in bucket: ${result.KeyCount || 0}`);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Check your configuration:');
    console.log('   - Account ID');
    console.log('   - Access Key ID');
    console.log('   - Secret Access Key');
    console.log('   - Bucket Name');
    console.log('   - Endpoint URL');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Cloudflare R2 Auto Uploader Starting...\n');
  
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Please fix connection issues before proceeding.');
    return;
  }
  
  console.log('');
  
  // Start upload process
  await uploadAllSongs();
  
  console.log('\n🎉 Upload process completed!');
  console.log('💡 Pro tip: You can run this script anytime to upload new songs.');
  console.log('   It will automatically skip files that already exist.');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  uploadAllSongs,
  testConnection,
  CONFIG
};