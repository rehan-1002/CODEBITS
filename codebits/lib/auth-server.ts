import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { User, IUser } from '@/models/User';
import { Profile } from '@/types/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'codebits_mrf_mumbai_university_super_secret_key_2026_secure'
);

export const COOKIE_NAME = 'codebits_token';

// -------------------------------------------------------------
// STRICT DEFENSIVE ZOD SCHEMAS (Blocks Injection & Malformed Data)
// -------------------------------------------------------------
export const RegisterSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  department: z.string().trim().max(80).optional(),
});

export const LoginSchema = z.object({
  identifier: z.string().trim().min(3, 'Identifier is required').max(100),
  password: z.string().min(1, 'Password is required').max(100),
  rememberSession: z.boolean().optional(),
});

// Normalize phone number (removes +91, leading 0, non-digits)
export function sanitizePhone(input: string): string {
  return input.replace(/\D/g, '').replace(/^(?:91|0)(?=\d{10}$)/, '');
}

// -------------------------------------------------------------
// JWT TOKEN MANAGEMENT
// -------------------------------------------------------------
export async function createSessionToken(profile: Profile, remember = true): Promise<string> {
  const exp = remember ? '30d' : '24h';
  return new SignJWT({
    id: profile.id,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    full_name: profile.full_name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<Profile | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      full_name: payload.full_name as string,
      email: payload.email as string,
      phone: payload.phone as string,
      role: (payload.role as 'student' | 'admin') || 'student',
    };
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// PASSWORD HASHING
// -------------------------------------------------------------
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// -------------------------------------------------------------
// SEED OFFICIAL ADMIN (Prof. MRF / CODEBITS)
// -------------------------------------------------------------
export async function ensureAdminUser(): Promise<void> {
  await connectToDatabase();
  const existingAdmin = await User.findOne({
    $or: [{ username: 'codebits' }, { phone: '9920336099' }],
  });

  if (!existingAdmin) {
    const passwordHash = await hashPassword('codebits@mrf');
    await User.create({
      fullName: 'Prof. Rohit Falake (M.R.F)',
      username: 'codebits',
      email: 'mrf@codebits.ac.in',
      phone: '9920336099',
      passwordHash,
      role: 'admin',
      department: 'Computer Engineering',
    });
  }
}
