const userService = require('../services/userService');
require('dotenv').config();

async function initializeAdmin() {
  try {
    console.log('🔧 Initializing admin account...');

    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!@#';

    // Check if admin already exists
    console.log(`📧 Checking if admin exists: ${adminEmail}`);
    const existingAdmin = await userService.getUserByEmail(adminEmail);

    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      console.log('📋 Admin Details:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   UID: ${existingAdmin.uid}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);
      return;
    }

    // Create admin account
    console.log('🏗️  Creating admin account...');
    const adminData = await userService.createUser(
      adminEmail,
      adminPassword,
      'admin',
      {
        firstName: 'System',
        lastName: 'Administrator',
        isInitialAdmin: true
      }
    );

    console.log('✅ Admin account created successfully!');
    console.log('📋 Admin Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ${adminData.role}`);
    console.log(`   UID: ${adminData.uid}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');
    console.log('💾 Save these credentials in a secure location.');

  } catch (error) {
    console.error('❌ Error initializing admin account:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️  Admin email already exists in Firebase Auth, but not in Firestore.');
      console.log('📧 Please check your Firebase console or use a different email.');
    } else if (error.code === 'auth/weak-password') {
      console.log('🔒 Password is too weak. Please use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('📧 Invalid email address format.');
    } else {
      console.log('💡 Make sure your Firebase configuration is correct in .env file.');
    }
    
    process.exit(1);
  }
}

// Check if required environment variables are set
function checkEnvironment() {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('');
    console.error('📝 Please create a .env file based on .env.example');
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  console.log('🚀 Admin Initialization Script');
  console.log('================================');
  
  checkEnvironment();
  initializeAdmin()
    .then(() => {
      console.log('🎉 Admin initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeAdmin };