const fs = require('fs');
const path = require('path');

// Paths
const envTxtPath = path.join(__dirname, '..', 'env.txt');
const envPath = path.join(__dirname, '..', '.env');

function syncEnvFile() {
  try {
    // Check if env.txt exists
    if (!fs.existsSync(envTxtPath)) {
      console.log('⚠️  env.txt not found. Skipping sync.');
      return;
    }

    // Read env.txt content
    const envTxtContent = fs.readFileSync(envTxtPath, 'utf8');
    
    // Filter out comments and empty lines for .env
    const envContent = envTxtContent
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('#') && trimmed.includes('=');
      })
      .join('\n');

    // Write to .env
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Successfully synced env.txt to .env');
    console.log(`📄 Copied ${envContent.split('\n').length} environment variables`);
    
  } catch (error) {
    console.error('❌ Error syncing env files:', error.message);
  }
}

// Run the sync
syncEnvFile(); 