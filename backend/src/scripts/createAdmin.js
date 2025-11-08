const userService = require('../services/userService');
require('dotenv').config();

async function initializeAdmin() {
  try {
    console.log('🚀 Starting admin initialization...');

    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!@#';

    console.log(`📧 Admin email: ${adminEmail}`);

    // Check if admin already exists
    const existingAdmin = await userService.getUserByEmail(adminEmail);
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log(`👤 Admin UID: ${existingAdmin.uid}`);
      console.log(`🔐 Role: ${existingAdmin.role}`);
      
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        await userService.updateUserRole(existingAdmin.uid, 'admin');
        console.log('✅ Updated existing user role to admin');
      }
      
      return;
    }

    // Create new admin user
    console.log('👨‍💼 Creating new admin user...');
    const adminUser = await userService.createUser(
      adminEmail,
      adminPassword,
      'admin',
      {
        firstName: 'System',
        lastName: 'Administrator',
        createdBy: 'system_initialization'
      }
    );

    console.log('✅ Admin user created successfully!');
    console.log(`👤 Admin UID: ${adminUser.uid}`);
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔐 Role: ${adminUser.role}`);
    
    console.log('\n🔑 ADMIN LOGIN CREDENTIALS:');
    console.log('================================');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('================================');
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Error initializing admin:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️  Admin email already exists in Firebase Auth');
      console.log('🔍 Checking Firestore for user data...');
      
      try {
        // Try to get the user by email and create Firestore record
        const authUser = await require('../config/firebase').auth.getUserByEmail(adminEmail);
        
        // Create Firestore record for existing auth user
        await require('../config/firebase').firestore
          .collection('users')
          .doc(authUser.uid)
          .set({
            email: adminEmail,
            role: 'admin',
            firstName: 'System',
            lastName: 'Administrator',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            createdBy: 'system_initialization'
          });
          
        console.log('✅ Created Firestore record for existing auth user');
        console.log(`👤 Admin UID: ${authUser.uid}`);
        
      } catch (firestoreError) {
        console.error('❌ Error creating Firestore record:', firestoreError);
      }
    }
  }
}

// Run the initialization
initializeAdmin()
  .then(() => {
    console.log('\n🎉 Admin initialization completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Admin initialization failed:', error);
    process.exit(1);
  });