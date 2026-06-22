import mongoose from 'mongoose';
import User from '../models/User';
import Employee from '../models/Employee';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_PASSWORD = 'Sk@123';

async function createUsersForEmployees() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    const employees = await Employee.find({});
    console.log(`📋 Found ${employees.length} employees`);

    let created = 0;
    let skipped = 0;

    for (const emp of employees) {
      // Skip if employee has no email
      if (!emp.email) {
        console.log(`⚠️ Employee ${emp.name} has no email – skipping`);
        skipped++;
        continue;
      }

      // Check if a User already exists with this email
      const existingUser = await User.findOne({ email: emp.email });
      if (existingUser) {
        console.log(`⏩ User already exists for ${emp.email} – skipping`);
        skipped++;
        continue;
      }

      // Create new User
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      const newUser = new User({
        name: emp.name,
        email: emp.email,
        password: hashedPassword,
        role: 'employee',
        isActive: true,
        username: emp.email.split('@')[0],
        firstName: emp.name.split(' ')[0],
        lastName: emp.name.split(' ').slice(1).join(' ') || '',
        joinDate: new Date(),
      });

      await newUser.save();
      console.log(`✅ Created user for ${emp.email}`);
      created++;
    }

    console.log(`\n📊 Summary: ${created} users created, ${skipped} skipped.`);
    console.log(`🔑 Default password for all new users: "${DEFAULT_PASSWORD}"`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createUsersForEmployees();