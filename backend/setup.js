const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Setting up BookWorm Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');

const createEnvFile = (mongodbUri) => {
  const envContent = `PORT=5000
MONGODB_URI=${mongodbUri}
JWT_SECRET=bookworm_super_secret_jwt_key_${Date.now()}
NODE_ENV=development`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with your MongoDB URI');
};

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('📝 If you need to update your MongoDB URI, please edit the .env file manually');
  console.log('\n📋 Next steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Seed the database: npm run seed');
  console.log('3. Start the server: npm run dev');
  console.log('\n🎉 Setup complete!');
} else {
  console.log('📝 Please provide your MongoDB connection string:');
  console.log('   Examples:');
  console.log('   - MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/bookworm');
  console.log('   - Local MongoDB: mongodb://localhost:27017/bookworm');
  console.log('   - Docker MongoDB: mongodb://localhost:27017/bookworm');
  console.log('');
  
  rl.question('Enter your MongoDB URI: ', (mongodbUri) => {
    if (!mongodbUri.trim()) {
      console.log('❌ MongoDB URI is required. Please run the setup again.');
      rl.close();
      return;
    }
    
    createEnvFile(mongodbUri.trim());
    
    console.log('\n📋 Next steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Seed the database: npm run seed');
    console.log('3. Start the server: npm run dev');
    console.log('\n🎉 Setup complete!');
    
    rl.close();
  });
} 