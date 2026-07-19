// src/app/api/auth/session/route.js
// POST → Set admin session cookie (called after successful Firebase login)
// DELETE → Clear session cookie (called on logout)

import { NextResponse } from 'next/server';

// Support multiple admin emails (comma-separated in env)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// POST /api/auth/session — verify email is admin and set cookie
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    if (ADMIN_EMAILS.length === 0) {
      return NextResponse.json({ error: 'Admin emails not configured on server' }, { status: 500 });
    }

    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return NextResponse.json({ error: 'Access denied. Not an admin account.' }, { status: 403 });
    }

    // Set secure httpOnly cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/auth/session — clear session cookie (logout)
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}
