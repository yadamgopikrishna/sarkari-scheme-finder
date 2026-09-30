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

    console.log('[Seed] Seeding Schemes with Government Application Schedules...');
    const enrichedSchemes = schemes.map((s) => {
      const isEducation = s.category === 'Education' || s.eligibilityCriteria?.studentOnly;
      const isCrop = s.schemeCode === 'PMFBY' || (s.schemeName && (s.schemeName.toLowerCase().includes('fasal') || s.schemeName.toLowerCase().includes('sahay')));
      const isSkill = s.category === 'Employment & Skill Development' || s.category === 'Skill Development';

      let startDate = new Date('2026-04-01');
      let endDate = new Date('2027-03-31');
      let applicationSchedule = 'Continuous / Round-the-Year Enrollment (FY 2026-27)';
      let applicationDeadline = '31 March 2027 (Annual DBT Review Cycle)';
      let disbursementSchedule = 'Direct Benefit Transfer (DBT) via Aadhaar-linked Bank Account / PFMS';

      if (isEducation) {
        startDate = new Date('2026-07-01');
        endDate = new Date('2026-11-30');
        applicationSchedule = 'Academic Year 2026-27 Active Window';
        applicationDeadline = '30 November 2026 (Portal Registration Deadline)';
        disbursementSchedule = 'Semester-wise DBT directly credited to verified student bank account';
      } else if (isCrop) {
        startDate = new Date('2026-06-01');
        endDate = new Date('2026-12-31');
        applicationSchedule = 'Kharif & Rabi Seasons 2026-27 Window';
        applicationDeadline = '31 December 2026 (Rabi Cutoff Deadline)';
        disbursementSchedule = 'Claims directly settled through National Crop Insurance Portal (NCIP)';
      } else if (isSkill) {
        startDate = new Date('2026-04-01');
        endDate = new Date('2027-03-31');
        applicationSchedule = 'Quarterly Training Batches (FY 2026-27)';
        applicationDeadline = 'Ongoing Admissions for Next Batch';
        disbursementSchedule = 'Stipend credited directly via DBT during active training phase';
      }

      return {
        ...s,
        startDate: s.startDate || startDate,
        endDate: s.endDate || endDate,
        applicationSchedule: s.applicationSchedule || applicationSchedule,
        applicationDeadline: s.applicationDeadline || applicationDeadline,
        disbursementSchedule: s.disbursementSchedule || disbursementSchedule,
      };
    });
    await Scheme.insertMany(enrichedSchemes);

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
