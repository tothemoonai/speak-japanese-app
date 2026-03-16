# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese language learning web application with Android support, focused on conversation practice using AI-powered speech recognition and evaluation. The app is built with Next.js (web) and Capacitor (Android), using Sherpa-ONNX for offline ASR on Android and Web Speech API for web browsers.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5.3+
- **UI**: Tailwind CSS 3.4+, shadcn/ui (Radix UI), Framer Motion
- **State**: Zustand (global), TanStack Query (server state)
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth + Storage)
- **AI Services**: OpenAI GPT-4, Anthropic Claude, or Zhipu GLM-4 (for speech evaluation)
- **Speech (Web)**: Web Speech API (ASR + TTS)
- **Speech (Android)**: Sherpa-ONNX for offline multi-language ASR
- **Testing**: Jest, React Testing Library, Playwright (E2E)
- **Mobile**: Capacitor 6

## Common Commands

```bash
# Development
npm run dev              # Start Next.js dev server (http://localhost:3000)
npm run build            # Build for production (uses webpack)
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint
npm run type-check       # TypeScript type checking
npm run format           # Prettier formatting

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Jest in watch mode
npm run test:coverage    # Jest with coverage
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Playwright with UI

# Android-specific
npm run android:setup-asr    # Download and setup Sherpa-ONNX models
npm run android:build       # Build Android APK (assembleDebug)

# Sync Capacitor
npx cap sync android        # Sync web assets to Android
```

## Architecture

### Project Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Home page
│   ├── login/          # Authentication pages
│   ├── courses/        # Course list and detail pages
│   ├── practice/       # Practice session pages
│   ├── reports/        # Learning reports
│   ├── share/          # Share functionality
│   ├── test-asr/       # ASR testing page (web)
│   └── test-android-asr/ # Android Sherpa-ONNX testing
├── components/
│   ├── ui/             # shadcn/ui base components
│   ├── course/         # Course-related components
│   ├── practice/       # Practice session components
│   ├── report/         # Report visualization components
│   └── share/          # Share-related components
├── hooks/
│   ├── useAudioRecorder.ts    # Web audio recording
│   ├── usePCMRecorder.ts      # PCM audio for ASR
│   ├── useTTS.ts              # Text-to-speech
│   ├── useASR.ts              # Web Speech API ASR
│   ├── useLocalASR.ts         # Sherpa-ONNX WASM (web)
│   └── useLocalASRAndroid.ts  # Sherpa-ONNX native (Android)
├── services/
│   ├── supabase/       # Database services (auth, course, practice, etc.)
│   ├── processing/     # AI evaluation service
│   └── asr/            # ASR implementations (Aliyun, Volcengine, Sherpa)
├── lib/
│   ├── supabase/       # Supabase client (client.ts, server.ts)
│   └── utils/          # Utilities (cn, format, etc.)
├── store/
│   └── authStore.ts    # Zustand auth state
├── types/
│   ├── models/         # TypeScript model definitions
│   └── supabase.ts     # Supabase generated types
└── plugins/
    └── local-asr/      # Capacitor plugin for Android Sherpa-ONNX
```

### Key Architectural Patterns

1. **Service Layer Pattern**: All database operations go through services in `src/services/supabase/`. This provides abstraction and makes testing easier.

2. **Multi-Provider AI**: The evaluation service (`src/services/processing/eval.service.ts`) supports multiple AI providers (OpenAI, Anthropic, Zhipu) with automatic fallback based on available API keys.

3. **Platform-Specific ASR**:
   - **Web**: Uses Web Speech API or Sherpa-ONNX WASM
   - **Android**: Uses native Sherpa-ONNX via Capacitor plugin
   - Detection handled through `@capacitor/core` platform detection

4. **State Management Strategy**:
   - Client state: Zustand (auth, UI state)
   - Server state: TanStack Query (data fetching)
   - Form state: React Hook Form + Zod

## Path Aliases

```typescript
@/*              → src/*
@/components/*   → src/components/*
@/lib/*          → src/lib/*
@/hooks/*        → src/hooks/*
@/services/*     → src/services/*
@/types/*        → src/types/*
@/store/*        → src/store/*
@/config/*       → src/config/*
```

## Important Configuration Files

- `next.config.js`: Contains webpack config to handle Sherpa-ONNX Node.js modules exclusion on client
- `capacitor.config.ts`: Capacitor configuration with Android permissions and server URL
- `tsconfig.json`: TypeScript config with strict mode and path aliases
- `jest.config.js`: Jest configuration with Next.js integration

## Environment Variables

Required in `.env.local`:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ZHIPU_API_KEY=your_zhipu_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing Strategy

- **Unit Tests**: Located alongside source files in `__tests__` directories
- **Component Tests**: Use React Testing Library
- **E2E Tests**: Playwright in `tests/e2e/` directory
- **Test Coverage**: Configured to exclude `__tests__` directories and type definition files

## Android Development Notes

1. **Sherpa-ONNX Setup**: Run `npm run android:setup-asr` before first Android build to download ASR models.

2. **Native Plugin**: The `LocalASR` plugin is defined in `src/plugins/local-asr/` and provides bridge to Android native Sherpa-ONNX implementation.

3. **Permissions**: Android requires `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, and storage permissions (configured in `capacitor.config.ts`).

4. **Model Files**: Sherpa-ONNX models are stored in `android/app/src/main/assets/models/` and included in APK.

## AI Service Integration

The evaluation service (`eval.service.ts`) is designed to work server-side (in API routes) to protect API keys. When adding new AI providers:

1. Add provider-specific implementation in `eval.service.ts`
2. Add environment variable check
3. Implement prompt generation for the provider
4. Handle provider-specific response parsing

## Common Patterns

### Adding a New Service

```typescript
// 1. Create service in src/services/supabase/
export class MyService {
  async getData() { /* ... */ }
}

// 2. Create types in src/types/models/
export interface MyModel { /* ... */ }

// 3. Create hook in src/hooks/
export function useMyData() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['my-data'],
    queryFn: () => myService.getData(),
  });
}
```

### Adding a New Page (Next.js App Router)

```typescript
// Create file in src/app/my-page/page.tsx
export default function MyPage() {
  return <div>Content</div>;
}
```

### Platform Detection

```typescript
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();
const isAndroid = Capacitor.getPlatform() === 'android';
```

## Deployment

- **Web**: Deployed to Vercel (configured in `capacitor.config.ts` server URL)
- **Android**: Build APK with `npm run android:build`, requires Android Studio
- **Database**: Supabase handles migrations and schema

## Troubleshooting

**Sherpa-ONNX build errors**: The webpack config in `next.config.js` excludes Sherpa-ONNX from client builds. If you encounter issues, check that:
1. Platform detection is working correctly
2. Native code is only imported on Android platform
3. Web uses WASM version or Web Speech API fallback

**Type errors during build**: Currently set to `ignoreBuildErrors: true` in `next.config.js`. This is a temporary setting - fix type errors before production deployment.

**Supabase RLS issues**: Ensure Row Level Security policies are set up correctly. Users should only be able to access their own data.
