import { createClient } from '@supabase/supabase-js';

/**
 * 服务端 Supabase 客户端（Secret key，绕过 RLS）
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}

type ServiceClient = ReturnType<typeof createServiceClient>;

/**
 * 通过 email 查找 auth.users 中的用户 id
 */
export async function findAuthUserIdByEmail(
  client: ServiceClient,
  email: string
): Promise<string | null> {
  let page = 1;
  for (;;) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`Failed to list auth users: ${error.message}`);
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit.id;
    if (data.users.length < 200 || !data.nextPage) return null;
    page++;
  }
}

/**
 * 密码校验通过后，换取 Supabase 平台官方签发的 session。
 *
 * 本项目已禁用旧版 API key，PostgREST 只接受平台 ES256 token，
 * 因此不能用 SUPABASE_JWT_SECRET 自签 HS256 token。
 * jp_users.password_hash 是密码的唯一数据源：如果 auth.users 里的
 * 密码与 jp_users 不一致（或用户不存在），先同步再登录。
 */
export async function issueSession(
  client: ServiceClient,
  email: string,
  password: string,
  nickname?: string
) {
  const first = await client.auth.signInWithPassword({ email, password });
  if (!first.error && first.data.session) {
    return first.data.session;
  }

  const authId = await findAuthUserIdByEmail(client, email);
  if (authId) {
    const { error } = await client.auth.admin.updateUserById(authId, {
      password,
      email_confirm: true,
    });
    if (error) throw new Error(`Failed to sync auth password: ${error.message}`);
  } else {
    const { error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: nickname ? { nickname } : undefined,
    });
    if (error) throw new Error(`Failed to create auth user: ${error.message}`);
  }

  const retry = await client.auth.signInWithPassword({ email, password });
  if (retry.error || !retry.data.session) {
    throw new Error(retry.error?.message || 'Failed to issue session');
  }
  return retry.data.session;
}
