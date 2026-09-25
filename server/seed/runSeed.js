const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Scheme = require('../models/Scheme');
const Category = require('../models/Category');
const StateDistrict = require('../models/StateDistrict');
const Notification = require('../models/Notification');
const {
  statesAndDistricts,
  categories,
  schemes,
  sampleNotifications,
} = require('./seedData');

dotenv.config();

const seedAll = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      Scheme.deleteMany(),
      Category.deleteMany(),
      StateDistrict.deleteMany(),
      Notification.deleteMany(),
    ]);

    console.log('[Seed] Seeding States and Union Territories...');
    await StateDistrict.insertMany(statesAndDistricts);

    console.log('[Seed] Seeding Categories...');
    await Category.insertMany(categories);

    console.log('[Seed] Seeding Schemes...');
    await Scheme.insertMany(schemes);

    console.log('[Seed] Seeding Portal Notifications...');
    await Notification.insertMany(sampleNotifications);

    // Upsert default Admin User
    const adminEmail = 'admin@sarkari.gov.in';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        fullName: 'Central Portal Administrator',
        email: adminEmail,
        mobileNumber: '9876543210',
        password: 'Admin@12345',
        state: 'Delhi',
        district: 'New Delhi',
        role: 'admin',
        isActive: true,
      });
      await admin.save();
      console.log('[Seed] Default Admin created: admin@sarkari.gov.in / Admin@12345');
    } else {
      admin.role = 'admin';
      await admin.save();
    }

    // Upsert demo Citizen User
    const citizenEmail = 'citizen@sarkari.gov.in';
    let citizen = await User.findOne({ email: citizenEmail });
    if (!citizen) {
      citizen = new User({
        fullName: 'Ramesh Kumar',
        email: citizenEmail,
        mobileNumber: '9848012345',
        password: 'Citizen@12345',
        state: 'Andhra Pradesh',
        district: 'Guntur',
        role: 'citizen',
        isActive: true,
        profileDetails: {
          age: 42,
          gender: 'Male',
          maritalStatus: 'Married',
          state: 'Andhra Pradesh',
          district: 'Guntur',
          ruralUrban: 'Rural',
          annualIncome: 95000,
          bplStatus: 'Yes',
          rationCardCategory: 'White',
          occupation: 'Farmer',
          landSize: 2.5,
        },
      });
      await citizen.save();
      console.log('[Seed] Demo Citizen created: citizen@sarkari.gov.in / Citizen@12345');
    }

    console.log('[Seed] Database seeding completed successfully!');
    console.log(`[Seed Summary]
- States/UTs: ${statesAndDistricts.length}
- Categories: ${categories.length}
- Schemes: ${schemes.length} (Central: ${schemes.filter(s => s.governmentLevel === 'Central').length}, State: ${schemes.filter(s => s.governmentLevel === 'State').length})
- Notifications: ${sampleNotifications.length}
- Admin: admin@sarkari.gov.in
- Demo Citizen: citizen@sarkari.gov.in
`);

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedAll();
