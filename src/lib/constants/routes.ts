export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: (id: number) => `/courses/${id}`,
  PRACTICE: (id: number) => `/practice/${id}`,
  REPORTS: '/reports',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SHARE: (code: string) => `/share/${code}`,
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
  },
  COURSES: {
    LIST: '/api/courses',
    DETAIL: (id: number) => `/api/courses/${id}`,
  },
  PRACTICE: {
    START: '/api/practice/start',
    EVALUATE: '/api/practice/evaluate',
    COMPLETE: '/api/practice/complete',
  },
  REPORTS: {
    GET: '/api/reports',
  },
  SHARES: {
    CREATE: '/api/shares/create',
    GET: (code: string) => `/api/shares/${code}`,
  },
} as const;
