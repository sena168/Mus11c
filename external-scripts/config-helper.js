const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function setupConfiguration() {
  console.log('🔧 Cloudflare R2 Configuration Helper');
  console.log('=====================================\n');
  
  console.log('📝 I\'ll help you set up your Cloudflare R2 configuration step by step.\n');
  
  // Get Cloudflare credentials
  console.log('1️⃣ Cloudflare Account Information:');
  const accountId = await ask('   Enter your Cloudflare Account ID: ');
  const accessKeyId = await ask('   Enter your R2 Access Key ID: ');
  const secretAccessKey = await ask('   Enter your R2 Secret Access Key: ');
  const bucketName = await ask('   Enter your R2 Bucket Name: ');
  
  console.log('\n2️⃣ Domain Configuration:');
  console.log('   You can use either:');
  console.log('   - Your custom domain (e.g., https://music.yourdomain.com)');
  console.log('   - Direct R2 URL (e.g., https://pub-xxx.r2.dev)');
  const publicUrl = await ask('   Enter your public URL (without trailing slash): ');
  
  console.log('\n3️⃣ Folder Configuration:');
  const songsFolder = await ask('   Songs folder path (default: ./songs_to_upload): ') || './songs_to_upload';
  const outputFile = await ask('   Output file path (default: ./song_links.json): ') || './song_links.json';
  const appConfigFile = await ask('   App config file path (default: ./app_config.js): ') || './app_config.js';
  
  // Generate endpoint
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  
  // Create configuration object
  const config = {
    cloudflare: {
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      region: 'auto',
      endpoint
    },
    paths: {
      songsFolder,
      outputFile,
      appConfigFile
    },
    publicUrl
  };
  
  // Generate the configuration file
  const configContent = `// Auto-generated Cloudflare R2 configuration
// Generated on: ${new Date().toISOString()}

const CONFIG = ${JSON.stringify(config, null, 2)};

module.exports = CONFIG;
`;
  
  // Save configuration
  fs.writeFileSync('./r2-config.js', configContent);
  
  console.log('\n✅ Configuration saved to r2-config.js');
  console.log('\n📋 Your configuration:');
  console.log('================================');
  console.log(`Account ID: ${accountId}`);
  console.log(`Bucket Name: ${bucketName}`);
  console.log(`Public URL: ${publicUrl}`);
  console.log(`Songs Folder: ${songsFolder}`);
  console.log(`Endpoint: ${endpoint}`);
  
  console.log('\n🚀 Next steps:');
  console.log('1. Create the songs folder and add your music files');
  console.log('2. Update the main uploader script to use this config');
  console.log('3. Run the uploader script');
  
  // Generate updated uploader script
  const uploaderContent = `const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const CONFIG = require('./r2-config.js');

// Initialize AWS SDK for R2
const s3 = new AWS.S3({
  endpoint: CONFIG.cloudflare.endpoint,
  accessKeyId: CONFIG.cloudflare.accessKeyId,
  secretAccessKey: CONFIG.cloudflare.secretAccessKey,
  region: CONFIG.cloudflare.region,
  signatureVersion: 'v4'
});

// Test connection
async function testConnection() {
  console.log('🔍 Testing connection to Cloudflare R2...');
  
  try {
    const result = await s3.listObjectsV2({
      Bucket: CONFIG.cloudflare.bucketName,
      MaxKeys: 1
    }).promise();
    
    console.log('✅ Connection successful!');
    console.log(\`📦 Bucket: \${CONFIG.cloudflare.bucketName}\`);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

// Quick test
testConnection().then(success => {
  if (success) {
    console.log('\\n🎉 Your configuration is working!');
    console.log('You can now run the full uploader script.');
  } else {
    console.log('\\n❌ Please check your configuration and try again.');
  }
});
`;
  
  fs.writeFileSync('./test-connection.js', uploaderContent);
  console.log('\n📁 Created test-connection.js - run this to verify your setup');
  
  rl.close();
}

console.log('🎵 Welcome to the Cloudflare R2 Auto Upload Setup!');
console.log('==================================================\n');

setupConfiguration().catch(console.error);