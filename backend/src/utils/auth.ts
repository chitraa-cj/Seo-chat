import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: User): string => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 