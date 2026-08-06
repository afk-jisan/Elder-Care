import jwt from 'jsonwebtoken';
import { User, ROLES } from '../models/User.js';

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.create({ name, email, phone, password, role });
    const token = signToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.json({ message: 'Logged out. Discard the token on the client.' });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}
