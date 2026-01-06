const mongoose = require('mongoose');
const User = require('../src/models/User');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'development' 
  ? '.env.development' 
  : '.env';
require('dotenv').config({ path: envFile });

async function seedAdminUser() {
  try {
    // Connect to MongoDB - use dev database in development
    const getDatabaseUrl = () => {
      if (process.env.DATABASE_URL) {
        const url = process.env.DATABASE_URL;
        // In development, ensure MongoDB port is 27017 (not 3000)
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
      // Development default: use separate dev database on port 27017
      if (process.env.NODE_ENV === 'development') {
        return 'mongodb://localhost:27017/pstudios-dev';
      }
      // Production default
      return 'mongodb://localhost:27017/pstudios';
    };
    
    const databaseUrl = getDatabaseUrl();
    await mongoose.connect(databaseUrl);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@pstudios.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user with environment variable or default
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme';

    const adminUser = new User({
      email: adminEmail,
      passwordHash: adminPassword, // This will be hashed by the pre-save middleware
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('IMPORTANT: Change the password immediately after first login!');

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdminUser();
