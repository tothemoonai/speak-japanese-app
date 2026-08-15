import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabase/server-auth';

export async function POST(request: Request) {
  try {
    const { email, password, nickname } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const client = createServiceClient();

    // Check if user already exists
    const { data: existingUser } = await client
      .from('jp_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Create the auth user first: its id becomes jp_users.id so that
    // platform-issued tokens (sub = auth id) line up with RLS policies
    const { data: authUser, error: authError } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: nickname ? { nickname } : undefined,
    });

    if (authError || !authUser.user) {
      if (authError?.message?.includes('already')) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }
      console.error('Registration error (auth):', authError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Hash password for jp_users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const { data: user, error: insertError } = await client
      .from('jp_users')
      .insert({
        id: authUser.user.id,
        email,
        password_hash: passwordHash,
        nickname: nickname || email.split('@')[0],
      })
      .select()
      .single();

    if (insertError || !user) {
      // Roll back the auth user so a retry doesn't hit "already registered"
      await client.auth.admin.deleteUser(authUser.user.id);
      console.error('Registration error (jp_users):', insertError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Sign in to get a platform-issued session
    const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      console.error('Registration sign-in error:', signInError);
      return NextResponse.json({ error: signInError?.message || 'Failed to sign in' }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { nickname: user.nickname || email.split('@')[0] },
      },
      session: {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        expires_in: signInData.session.expires_in,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
