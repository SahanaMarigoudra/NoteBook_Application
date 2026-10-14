import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { env } from '../config/env.js';

async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || process.argv[2] || 'admin@notespace.io').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || process.argv[3] || 'AdminPassword123!';
  const adminName = process.env.ADMIN_NAME || process.argv[4] || 'System Administrator';

  console.log(`Connecting to MongoDB: ${env.MONGODB_URI.replace(/\/\/[^@]+@/, '//***@')}...`);
  await mongoose.connect(env.MONGODB_URI);

  try {
    // 1. Initialize SystemSettings if not existing
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({
        appName: 'NoteSpace',
        allowRegistration: true,
        sessionTimeoutMinutes: 10080,
        maintenanceMode: false,
        maxNotesPerUser: 1000,
        passwordMinLength: 8,
      });
      console.log('✅ Initialized default SystemSettings');
    }

    // 2. Check for existing admin user
    let user = await User.findOne({ email: adminEmail }).select('+passwordHash');

    if (user) {
      console.log(`User ${adminEmail} found. Updating to admin role...`);
      const passwordHash = await bcrypt.hash(adminPassword, env.BCRYPT_ROUNDS);
      user.role = 'admin';
      user.status = 'active';
      user.passwordHash = passwordHash;
      user.name = adminName;
      await user.save();
      console.log(`✅ User ${adminEmail} successfully promoted to Administrator!`);
    } else {
      console.log(`Creating new Administrator account: ${adminEmail}...`);
      const passwordHash = await bcrypt.hash(adminPassword, env.BCRYPT_ROUNDS);
      user = await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
        status: 'active',
        lastActiveAt: new Date(),
      });
      console.log(`✅ Administrator created successfully! (Email: ${adminEmail})`);
    }

    // Record audit log for admin bootstrap
    await AuditLog.create({
      actorId: user._id,
      actorEmail: adminEmail,
      action: 'system_action',
      targetType: 'user',
      targetId: String(user._id),
      details: { role: 'admin', bootstrapped: true },
      ipAddress: '127.0.0.1',
      status: 'success',
      reason: 'Administrator account seeded via CLI script',
    });

    console.log('✅ Audit log recorded');
    console.log('--------------------------------------------------');
    console.log('Admin Credentials:');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('❌ Failed to seed administrator:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

seedAdmin();
