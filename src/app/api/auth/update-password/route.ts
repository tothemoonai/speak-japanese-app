import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServiceClient, findAuthUserIdByEmail } from '@/lib/supabase/server-auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const client = createServiceClient();

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update in jp_users (source of truth)
    const { error } = await client
      .from('jp_users')
      .update({ password_hash: passwordHash })
      .eq('email', email);

    if (error) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    // Keep the auth user in sync so signInWithPassword works with the new password
    const authId = await findAuthUserIdByEmail(client, email);
    if (authId) {
      const { error: authError } = await client.auth.admin.updateUserById(authId, { password });
      if (authError) {
        console.error('Auth password sync error:', authError);
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Update password error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
