// src/routes/authRoutes.ts - FIXED VERSION
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { auth } from '../middleware/auth';
import Employee from '../models/Employee';   // adjust path to your Employee model
import { Document } from 'mongoose';   // add this line

const router = express.Router();

// Signup route
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('\n📝 ========== SIGNUP ATTEMPT ==========');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🎭 Role: ${role}`);
    console.log(`🔑 Password length: ${password?.length}`);

    // Validate required fields
    if (!name || !email || !password || !role) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      console.log('❌ Email already in use:', email);
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered. Please use a different email or try logging in.'
      });
    }

    // Check if username already exists
    const username = email.split('@')[0];
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      console.log('❌ Username already taken:', username);
      const alternativeUsername = `${username}${Date.now().toString().slice(-4)}`;
      console.log('💡 Suggested alternative username:', alternativeUsername);
    }

    // For signup, only allow superadmin role
    if (role !== 'superadmin') {
      console.log('❌ Invalid role for signup:', role);
      return res.status(403).json({
        success: false,
        message: 'Only Super Admin can sign up directly. Other roles must be created by an administrator.'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    console.log('✅ All validations passed, creating user...');

    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Plain password - will be hashed by pre-save hook
      role: 'superadmin',
      username: email.split('@')[0],
      firstName: name.split(' ')[0],
      lastName: name.split(' ').slice(1).join(' ') || '',
      isActive: true,
      // site: 'Mumbai Office',
      joinDate: new Date()
    });

    await newUser.save();
    console.log('✅ User created successfully:', newUser.email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // User response without password
    const userResponse = {
      _id: newUser._id.toString(),
      id: newUser._id.toString().slice(-6),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      joinDate: newUser.joinDate.toISOString().split('T')[0],
      // site: newUser.site || '',
      department: newUser.department || ''
    };

    console.log(`\n✅ ========== SIGNUP COMPLETE ==========`);
    console.log(`👤 User: ${userResponse.email}`);
    console.log(`🎭 Role: ${userResponse.role}`);
    console.log(`🔑 Token: ${token.substring(0, 20)}...`);
    console.log(`========================================\n`);

    res.status(201).json({
      success: true,
      message: 'Super Admin account created successfully!',
      user: userResponse,
      token
    });
  } catch (error: any) {
    console.error('🔥 SIGNUP ERROR:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = 'This email is already registered.';
      if (field === 'username') {
        message = 'This username is already taken.';
      }
      
      return res.status(409).json({
        success: false,
        message
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during signup'
    });
  }
});

// Login route - FIXED VERSION
// Login route - FIXED VERSION (with correct TypeScript types)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    console.log('\n🔐 ========== LOGIN ATTEMPT ==========');
    console.log(`📧 Email: ${email}`);
    console.log(`🎭 Requested role: ${role}`);
    console.log(`🔑 Password length: ${password?.length}`);

    // Validate required fields
    if (!email || !password || !role) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // ⬇️⬇️⬇️ FIX: explicitly type the user variable ⬇️⬇️⬇️
 let user = await User.findOne({ email }).select('+password') as any;

    // If not found by email, try employeeId
    if (!user) {
      const employee = await Employee.findOne({ employeeId: email });
      if (employee?.email) {
       user = await User.findOne({ email: employee.email }).select('+password') as any;
      }
    }

    console.log('✅ User found in database:', { 
      email: user?.email, 
      role: user?.role, 
      isActive: user?.isActive,
      hasPassword: !!user?.password,
      passwordPreview: user?.password ? user.password.substring(0, 30) + '...' : 'NO PASSWORD',
      passwordLength: user?.password ? user.password.length : 0
    });

    // Check if user exists
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ Account is inactive');
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact administrator.'
      });
    }

    // Verify password
    console.log('🔐 Starting password comparison...');
    const isValidPassword = await user.comparePassword(password);
    console.log(`🔐 Password comparison result: ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify role
    if (user.role !== role) {
      console.log('❌ Role mismatch:', { 
        expected: role, 
        actual: user.role,
        note: `User is registered as ${user.role}, not ${role}`
      });
      return res.status(403).json({
        success: false,
        message: `You are registered as ${user.role}, not ${role}. Please select the correct role.`
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    console.log('✅ Last login timestamp updated');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log(`🔑 Token generated: ${token.substring(0, 20)}...`);

    // User response without password
    const userResponse = {
      _id: user._id.toString(),
      id: user._id.toString().slice(-6),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      joinDate: user.joinDate.toISOString().split('T')[0],
      lastLogin: user.lastLogin,
      department: user.department || '',
      phone: user.phone || '',
      avatar: user.avatar || ''
    };

    console.log(`\n✅ ========== LOGIN SUCCESSFUL ==========`);
    console.log(`👤 User: ${userResponse.email}`);
    console.log(`🎭 Role: ${userResponse.role}`);
    console.log(`📅 Joined: ${userResponse.joinDate}`);
    console.log(`==========================================\n`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error: any) {
    console.error('🔥 LOGIN ERROR:', error);
    console.error('🔥 Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userResponse = {
      _id: user._id.toString(),
      id: user._id.toString().slice(-6),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      joinDate: user.joinDate.toISOString().split('T')[0],
      lastLogin: user.lastLogin,
      department: user.department || '',
      // site: user.site || '',
      phone: user.phone || '',
      avatar: user.avatar || ''
    };

    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Verify token
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
        name: decoded.name
      }
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Get user statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching stats'
    });
  }
});

// Create default admin
router.post('/create-default-admin', async (req: Request, res: Response) => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists'
      });
    }

    const admin = new User({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'superadmin',
      username: 'admin',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      // site: 'Mumbai Office',
      joinDate: new Date()
    });

    await admin.save();

    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Default admin created successfully',
      user: {
        _id: admin._id.toString(),
        id: admin._id.toString().slice(-6),
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating admin'
    });
  }
});

// Get current user info (with auth middleware)
router.get('/current-user', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Error in /current-user route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user data' 
    });
  }
});

// Debug endpoint - Test passwords without login - FIXED VERSION
router.post('/debug-password-check', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n🔍 ========== PASSWORD DEBUG ==========');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password to test: ${password}`);
    console.log(`🔑 Password length: ${password?.length}`);
    
    // FIXED: Find user by email only
    const user = await User.findOne({ email: email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    console.log(`✅ Found user: ${user.email}`);
    console.log(`🔍 Role: ${user.role}`);
    console.log(`🔍 Is active: ${user.isActive}`);
    console.log(`🔍 Stored password: ${user.password.substring(0, 60)}...`);
    console.log(`🔍 Password length: ${user.password.length}`);
    console.log(`🔍 Is bcrypt hash? ${user.password.startsWith('$2') ? '✅ Yes' : '❌ No'}`);
    
    if (user.password.startsWith('$2a$')) console.log(`🔍 Hash type: bcrypt $2a$`);
    else if (user.password.startsWith('$2b$')) console.log(`🔍 Hash type: bcrypt $2b$`);
    else if (user.password.startsWith('$2y$')) console.log(`🔍 Hash type: bcrypt $2y$`);
    else console.log(`🔍 Hash type: PLAIN TEXT (UNSAFE!)`);
    
    // Try bcrypt compare
    console.log('\n🔐 Testing bcrypt compare...');
    let bcryptResult = false;
    let bcryptError = null;
    
    try {
      if (user.password.startsWith('$2')) {
        bcryptResult = await bcrypt.compare(password, user.password);
        console.log(`🔐 Bcrypt result: ${bcryptResult ? '✅ MATCH' : '❌ NO MATCH'}`);
      } else {
        console.log('⚠️ Not a bcrypt hash, skipping bcrypt compare');
      }
    } catch (error: any) {
      bcryptError = error.message;
      console.log(`❌ Bcrypt error: ${error.message}`);
    }
    
    // Try direct comparison
    console.log('\n🔐 Testing direct comparison...');
    const directResult = user.password === password;
    console.log(`🔐 Direct result: ${directResult ? '✅ MATCH' : '❌ NO MATCH'}`);
    
    // Final result
    const finalResult = bcryptResult || directResult;
    
    console.log(`\n📊 ========== FINAL RESULT ==========`);
    console.log(`🔐 Password is correct? ${finalResult ? '✅ YES' : '❌ NO'}`);
    
    if (!finalResult) {
      console.log('\n🔍 Testing common passwords...');
      const commonPasswords = [
        '123456', 'password', 'admin123', 'Admin@123', 'password123', 'admin',
        '12345678', '123456789', '12345', '1234', 'admin@123', 'Admin123',
        'Admin@1234', 'admin@1234', 'Password@123', 'Password123'
      ];
      
      for (const pwd of commonPasswords) {
        try {
          if (user.password.startsWith('$2')) {
            const match = await bcrypt.compare(pwd, user.password);
            if (match) {
              console.log(`✅ Password might be: "${pwd}"`);
              break;
            }
          } else if (user.password === pwd) {
            console.log(`✅ Password is: "${pwd}"`);
            break;
          }
        } catch (e) {
          // Ignore
        }
      }
    }
    
    console.log(`=====================================\n`);
    
    res.json({
      success: true,
      result: finalResult,
      user: {
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      passwordInfo: {
        isHashed: user.password.startsWith('$2'),
        hashLength: user.password.length,
        hashType: user.password.startsWith('$2a$') ? 'bcrypt $2a$' : 
                 user.password.startsWith('$2b$') ? 'bcrypt $2b$' : 
                 user.password.startsWith('$2y$') ? 'bcrypt $2y$' : 'plain-text',
        hashPreview: user.password.substring(0, 30),
        comparisonMethods: {
          bcrypt: bcryptResult,
          direct: directResult,
          bcryptError: bcryptError
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Emergency password reset (development only) - FIXED VERSION
router.post('/emergency-reset', async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Not allowed in production'
      });
    }
    
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email and new password required'
      });
    }
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    console.log(`\n🆘 ========== EMERGENCY RESET ==========`);
    console.log(`📧 User: ${user.email}`);
    console.log(`🔐 Old hash: ${user.password?.substring(0, 30) || 'NULL'}...`);
    console.log(`🔑 New password: ${newPassword}`);
    console.log(`🔑 New password length: ${newPassword.length}`);
    
    // Force set password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    
    await user.save();
    
    // Verify - FIXED: Find by email only
    const updatedUser = await User.findOne({ email: email }).select('+password');
    
    if (!updatedUser) {
      console.log('❌ Failed to retrieve updated user');
      return res.status(500).json({
        success: false,
        error: 'Failed to verify password update'
      });
    }
    
    console.log(`\n✅ Verification:`);
    console.log(`   New hash: ${updatedUser.password.substring(0, 30)}...`);
    console.log(`   Hash length: ${updatedUser.password.length}`);
    console.log(`   Is hashed? ${updatedUser.password.startsWith('$2')}`);
    
    const match = await bcrypt.compare(newPassword, updatedUser.password);
    console.log(`   Password matches? ${match ? '✅ YES' : '❌ NO'}`);
    console.log(`=====================================\n`);
    
    res.json({
      success: true,
      message: `Password for ${email} has been reset`,
      note: 'Try logging in with the new password',
      debug: {
        email: email,
        newPasswordSet: true,
        isHashed: updatedUser.password.startsWith('$2'),
        verification: match
      }
    });
    
  } catch (error: any) {
    console.error('❌ Emergency reset error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test password storage endpoint - FIXED VERSION
router.post('/test-password-storage', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n🧪 ========== TEST PASSWORD STORAGE ==========');
    console.log('Email:', email);
    console.log('Password to store:', password);
    
    // Create a test user
    const testUser = new User({
      email: email || 'test_' + Date.now() + '@test.com',
      password: password || 'Test@123',
      name: 'Test User',
      role: 'superadmin',
      isActive: true,
      username: 'testuser',
      // site: 'Test Site'
    });
    
    console.log('\n🔍 BEFORE SAVE:');
    console.log('   Plain password:', testUser.password);
    
    await testUser.save();
    
    console.log('\n🔍 AFTER SAVE:');
    console.log('   User saved with ID:', testUser._id);
    
    // Retrieve to see what was stored
    const savedUser = await User.findById(testUser._id).select('+password');
    
    if (!savedUser) {
      console.log('❌ Failed to retrieve saved user');
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve saved user'
      });
    }
    
    console.log('\n🔍 RETRIEVED FROM DB:');
    console.log('   Has password field?', !!savedUser.password);
    console.log('   Password length:', savedUser.password.length);
    console.log('   Is bcrypt hash?', savedUser.password.startsWith('$2'));
    console.log('   Hash preview:', savedUser.password.substring(0, 30) + '...');
    
    // Test comparison
    const match = await bcrypt.compare(password || 'Test@123', savedUser.password);
    console.log('\n🔐 PASSWORD COMPARISON:');
    console.log('   Match?', match ? '✅ YES' : '❌ NO');
    
    console.log('===========================================\n');
    
    res.json({
      success: true,
      message: 'Test completed',
      storedHash: savedUser.password.substring(0, 30) + '...',
      isHashed: savedUser.password.startsWith('$2'),
      canLogin: !!savedUser.password
    });
    
  } catch (error: any) {
    console.error('🧪 Test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;