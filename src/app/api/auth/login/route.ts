import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServiceClient, issueSession } from '@/lib/supabase/server-auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const client = createServiceClient();

    // Find the user in jp_users
    const { data: user, error } = await client
      .from('jp_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Old accounts migrated from Supabase Auth have no password_hash yet
    if (!user.password_hash || typeof user.password_hash !== 'string') {
      return NextResponse.json(
        { error: '该账号尚未设置密码，请联系管理员重置密码' },
        { status: 401 }
      );
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Exchange for a platform-issued session so the token passes RLS
    const session = await issueSession(client, email, password, user.nickname);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
