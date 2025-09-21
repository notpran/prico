import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
// In a real app, you'd use a proper email service
import { sendVerificationEmail } from '../../services/emailService'; 

const router = Router();

// Signup
router.post('/auth/signup', async (req, res) => {
  try {
    const { email, username, displayName, age, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      username,
      displayName,
      age,
      passwordHash,
    });

    await user.save();

    // Email verification
    const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({ message: 'User created. Please check your email for verification.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify Email
router.get('/auth/verify', async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { userId: string };
    
    await User.findByIdAndUpdate(decoded.userId, { emailVerified: true });

    res.send('Email verified successfully!');
  } catch (error) {
    res.status(400).send('Invalid or expired verification link.');
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.emailVerified) {
      return res.status(401).json({ message: 'Invalid credentials or email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
