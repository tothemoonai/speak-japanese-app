import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
    }

    // 1. 查找用户
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.%${email}%,nickname.ilike.%${email}%`)
      .limit(1);

    if (userError) throw userError;

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // 2. 查询练习记录
    const { data: practices, error: practiceError } = await supabase
      .from('practice_records')
      .select('overall_score, course_id, created_at')
      .eq('user_id', user.id)
      .not('overall_score', 'is', null);

    if (practiceError) throw practiceError;

    const totalPractices = practices?.length || 0;
    const averageScore = totalPractices > 0
      ? Math.round(practices.reduce((sum, p) => sum + (p.overall_score || 0), 0) / totalPractices)
      : 0;

    // 获取不同课程数
    const uniqueCourses = new Set(practices?.map(p => p.course_id) || []);
    const coursesCount = uniqueCourses.size;

    // 3. 计算应该的等级
    let shouldLevel = 'beginner';
    if (totalPractices >= 20 && averageScore >= 85 && coursesCount >= 5) {
      shouldLevel = 'advanced';
    } else if (totalPractices >= 5 && averageScore >= 80 && coursesCount >= 2) {
      shouldLevel = 'intermediate';
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        current_level: user.level,
      },
      stats: {
        total_practices: totalPractices,
        average_score: averageScore,
        courses_practiced: coursesCount,
      },
      level_check: {
        current: user.level,
        should_be: shouldLevel,
        is_correct: user.level === shouldLevel,
      },
      upgrade_requirements: {
        beginner_to_intermediate: {
          practices: 5,
          score: 80,
          courses: 2,
          current_practices: totalPractices,
          current_score: averageScore,
          current_courses: coursesCount,
          can_upgrade: totalPractices >= 5 && averageScore >= 80 && coursesCount >= 2,
        },
        intermediate_to_advanced: {
          practices: 20,
          score: 85,
          courses: 5,
          current_practices: totalPractices,
          current_score: averageScore,
          current_courses: coursesCount,
          can_upgrade: totalPractices >= 20 && averageScore >= 85 && coursesCount >= 5,
        },
      },
    });
  } catch (error: any) {
    console.error('Error checking user level:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
