import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import {
  LoginSchema,
  sanitizePhone,
  comparePassword,
  createSessionToken,
  ensureAdminUser,
  COOKIE_NAME,
} from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod defensive validation (rejects non-strings and query operators)
    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid credentials' },
        { status: 400 }
      );
    }

    const { identifier, password, rememberSession } = parseResult.data;

    await connectToDatabase();
    await ensureAdminUser(); // Ensure Prof. MRF admin exists

    const trimmed = identifier.trim().toLowerCase();
    const phoneClean = sanitizePhone(trimmed);

    // 2. Safe Parameterized Query (NoSQL injection impossible because values are strictly typed strings)
    const user = await User.findOne({
      $or: [
        { email: trimmed },
        { username: trimmed },
        ...(phoneClean.length === 10 ? [{ phone: phoneClean }] : []),
      ],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this identifier.' },
        { status: 401 }
      );
    }

    // 3. Cryptographic Password Comparison
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    const profile = {
      id: user._id.toString(),
      full_name: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const token = await createSessionToken(profile, !!rememberSession);

    const response = NextResponse.json({
      success: true,
      user: profile,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberSession ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
