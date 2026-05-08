import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

// Create a JWT for Supabase PostgREST
async function createSupabaseToken(userId: string, email: string) {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET is not defined in environment variables');
  }

  const encodedSecret = new TextEncoder().encode(secret);
  
  // Create a JWT that Supabase PostgREST understands
  // The 'sub' claim maps to auth.uid() in RLS
  const jwt = await new jose.SignJWT({
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
    sub: userId,
    email: email,
    role: 'authenticated'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(encodedSecret);
    
  return jwt;
}

export async function POST(request: Request) {
  try {
    const { email, password, nickname } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const client = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if user already exists
    const { data: existingUser } = await client
      .from('jp_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into jp_users (trigger will auto-insert into public.users)
    const { data: user, error } = await client
      .from('jp_users')
      .insert({
        email,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error || !user) {
      console.error('Registration error:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
    
    // If nickname is provided, update public.users
    if (nickname) {
      await client.from('jp_users').update({ nickname }).eq('id', user.id);
    }

    // Create session token
    const token = await createSupabaseToken(user.id, user.email);

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { nickname: nickname || email.split('@')[0] }
      },
      session: {
        access_token: token,
        refresh_token: token,
        expires_in: 604800, // 7 days
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
