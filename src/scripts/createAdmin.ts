import bcrypt from 'bcrypt';
import User from '../models/User';
import { connectDB } from '../config/database';

async function createTestUser() {
  try {
    await connectDB();

    const username = 'testuser';
    const email = 'testuser@example.com';
    const password = 'testpass123';
    const isAdmin = false;

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      console.log('User already exists:', {
        id: existing._id,
        username: existing.username,
        email: existing.email,
        isAdmin: existing.isAdmin
      });
      process.exit(0);
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password,
      isAdmin
    });

    console.log('Test user created successfully:', {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser(); 