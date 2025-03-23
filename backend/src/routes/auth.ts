import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth';

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

const router = Router();
const prisma = new PrismaClient();

// Validation middleware
const validateRegisterInput: RequestHandler = (req, res, next) => {
  const { email, password, name } = req.body as RegisterRequest;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters long' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Invalid email format' });
    return;
  }

  next();
};

const validateLoginInput: RequestHandler = (req, res, next) => {
  const { email, password } = req.body as LoginRequest;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  next();
};

// Register new user
const registerHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body as RegisterRequest;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Login user
const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isValidPassword = await comparePasswords(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Apply validation middleware
router.post('/register', validateRegisterInput, registerHandler);
router.post('/login', validateLoginInput, loginHandler);

export default router; 