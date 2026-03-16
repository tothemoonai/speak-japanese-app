/**
 * Get user level from user object
 * Level can be in different locations depending on the data source
 */
export function getUserLevel(user: any): 'beginner' | 'intermediate' | 'advanced' {
  if (!user) return 'beginner';

  // Try different possible locations for level
  return (
    user.level ||
    user.user_metadata?.level ||
    user.user_metadata?.nickname || 'beginner'
  );
}

/**
 * Get user nickname from user object
 */
export function getUserNickname(user: any): string {
  if (!user) return '';

  return (
    user.nickname ||
    user.user_metadata?.nickname ||
    user.email?.split('@')[0] ||
    ''
  );
}
