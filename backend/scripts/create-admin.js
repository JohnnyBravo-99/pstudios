const mongoose = require('mongoose');
const User = require('../src/models/User');

// Load environment variables
const envFile = process.env.NODE_ENV === 'development' 
  ? '.env.development' 
  : '.env';
require('dotenv').config({ path: envFile });

async function createAdminUser() {
  try {
    // Connect to MongoDB - use dev database in development
    const getDatabaseUrl = () => {
      if (process.env.DATABASE_URL) {
        const url = process.env.DATABASE_URL;
        if (process.env.NODE_ENV === 'development') {
          const correctedUrl = url.replace(/mongodb:\/\/[^:]+:\d+/, (match) => {
            if (match.includes(':3000')) {
              return match.replace(':3000', ':27017');
            }
            return match;
          });
          return correctedUrl;
        }
        return url;
      }
      if (process.env.NODE_ENV === 'development') {
        return 'mongodb://localhost:27017/pstudios-dev';
      }
      return 'mongodb://localhost:27017/pstudios';
    };
    
    const databaseUrl = getDatabaseUrl();
    await mongoose.connect(databaseUrl);
    console.log('Connected to MongoDB:', databaseUrl);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'jarnold@paradigmstudios.art' });
    if (existingAdmin) {
      console.log('Admin user already exists: jarnold@paradigmstudios.art');
      console.log('Password is set:', existingAdmin.isPasswordSet);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Get admin credentials from environment or command line args
    const adminEmail = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.argv[3] || process.env.ADMIN_PASSWORD || 'changeme';

    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      passwordHash: adminPassword, // This will be hashed by the pre-save middleware
      role: 'admin'
    });

    await adminUser.save();
    console.log('\n✅ Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('IMPORTANT: Change this password immediately after first login!\n');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdminUser();

