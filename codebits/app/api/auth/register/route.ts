import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import {
  RegisterSchema,
  sanitizePhone,
  hashPassword,
  createSessionToken,
  COOKIE_NAME,
} from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Defensive Zod Validation (rejection of malformed inputs & injection)
    const sanitized = {
      ...body,
      phone: typeof body.phone === 'string' ? sanitizePhone(body.phone) : body.phone,
    };

    const parseResult = RegisterSchema.safeParse(sanitized);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password, department } = parseResult.data;

    await connectToDatabase();

    // 2. Check for duplicate account
    const existing = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existing) {
      const field = existing.email === email ? 'Email address' : 'Mobile number';
      return NextResponse.json(
        { success: false, error: `${field} is already registered.` },
        { status: 409 }
      );
    }

    // 3. Hash Password & Enforce Student Role (prevents privilege escalation injection)
    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      role: 'student', // Strictly enforced on backend
      department: department || 'Engineering',
    });

    const profile = {
      id: newUser._id.toString(),
      full_name: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: 'student' as const,
    };

    // 4. Create Token and set HttpOnly Cookie
    const token = await createSessionToken(profile, true);

    const response = NextResponse.json({
      success: true,
      user: profile,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
