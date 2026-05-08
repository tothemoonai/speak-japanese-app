import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('jp_users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ isAdmin: profile?.is_admin === true });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
