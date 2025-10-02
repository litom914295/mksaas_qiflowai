# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**QiFlow AI** is an intelligent feng shui analysis platform that combines traditional Chinese metaphysics with modern AI technology. The system provides personalized feng shui analysis using user birth data (八字/BaZi) and residential information (玄空飞星/Flying Stars feng shui theory).

### Key Features
- **AI-powered Analysis**: GPT-4 integration for personalized feng shui recommendations
- **Digital Compass**: High-precision directional measurements with device sensors
- **3D Visualization**: Three.js powered 3D floor plan rendering
- **BaZi Calculator**: Traditional Chinese astrology calculations
- **Subscription System**: Multi-tier SaaS model with usage quotas
- **Database**: Comprehensive PostgreSQL schema for feng shui data

## Technology Stack

### Core Technologies
- **Frontend**: Next.js 15 (App Router) + TypeScript + React 18
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI Integration**: OpenAI GPT-4 for feng shui analysis
- **3D Rendering**: Three.js with React Three Fiber
- **2D Graphics**: Konva.js with react-konva
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Payments**: Stripe integration
- **Testing**: Jest + Testing Library + Playwright

## Database Architecture

The project uses a comprehensive PostgreSQL schema with the following core modules:
- **User Management**: Users, sessions, preferences
- **Subscription System**: Plans, subscriptions, payments, usage quotas
- **BaZi Calculations**: Traditional Chinese astrology calculations
- **House Data**: House information, room layouts, compass readings
- **Feng Shui Analysis**: AI-powered analysis results and recommendations
- **AI Conversations**: Chat history and AI interactions
- **System Monitoring**: Activity logs, error tracking, system configs

Key database files:
- `database/schema.sql`: Complete database schema with tables, indexes, and triggers
- `database/schema_improvements.sql`: Performance optimization indexes and monitoring functions

## Common Development Commands

### Development Server
```bash
npm run dev          # Start development server on port 3001
npm run build        # Build production bundle
npm start            # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Testing
```bash
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run E2E tests with UI
```

### Docker & Deployment
```bash
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
npm run docker:dev   # Run with docker-compose
```

## Project Structure

### Core Application (`src/`)
```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes (auth, ai, subscription, upload, webhooks)
│   └── [locale]/          # Locale-based page routes with i18n support
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── layout/           # Layout components
│   ├── compass/          # Compass-specific components
│   ├── 3d/               # 3D rendering components
│   └── [feature]/        # Feature-specific components
├── lib/                  # Core utilities and services
│   ├── ai/               # OpenAI integration and AI routing
│   ├── auth/             # Authentication and guest session management
│   ├── bazi/             # Traditional Chinese astrology calculations
│   ├── fengshui/         # Flying Stars feng shui analysis engine
│   ├── compass/          # Sensor fusion and magnetic declination
│   ├── database/         # Supabase client and database operations
│   ├── i18n/             # Internationalization (6 languages)
│   └── utils/            # General utilities
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
├── stores/               # Zustand state stores
└── styles/               # Additional stylesheets
```

### Configuration Files
- `.claude/`: Claude Code agent configuration
- `.cursor/`: Cursor IDE configuration with MCP setup
- `.vscode/settings.json`: VSCode configuration
- `components.json`: shadcn/ui component configuration
- `tailwind.config.ts`: Tailwind CSS configuration with custom design tokens

## Business Context

**Target Users**: 
- Feng shui practitioners and consultants
- Interior designers and architects
- Homeowners seeking feng shui guidance
- Real estate professionals

**Business Model**: Freemium SaaS with tiered subscriptions (Free, Basic, Professional, Enterprise)

**Core Value Proposition**: Combines traditional feng shui wisdom (八字 + 玄空飞星) with modern AI technology to provide personalized, actionable home layout recommendations.

## Development Conventions

### Naming Conventions
- **Components**: PascalCase (`CompassTool.tsx`)
- **Pages**: kebab-case (`bazi-analysis/`)
- **Utilities**: camelCase (`calculateBazi.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Database Tables**: snake_case

### Code Quality Standards
- TypeScript strict mode enabled
- ESLint for code consistency
- Pre-commit hooks for quality checks
- 80%+ test coverage requirement
- RESTful API design with Zod validation

## Environment Variables

Required for development:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key for GPT-4
- `GUEST_SESSION_SECRET` - Secret for guest session encryption

Optional AI providers:
- `ANTHROPIC_API_KEY` - Anthropic Claude API key
- `GEMINI_API_KEY` - Google Gemini API key
- `DEEPSEEK_API_KEY` - DeepSeek API key

## Key Algorithms & Calculations

The system implements complex traditional Chinese metaphysical calculations:

1. **BaZi (八字) Calculations**: 
   - Four Pillars of Destiny computation
   - Five Elements analysis
   - Favorable/unfavorable element determination

2. **Xuankong Flying Stars (玄空飞星)**:
   - Nine Periods (九运) system (1864-2043)
   - 24 compass directions
   - Annual, monthly, daily flying star calculations

3. **AI Analysis Integration**:
   - Combines BaZi personal elements with Flying Stars house analysis
   - Generates room-specific recommendations
   - Provides confidence scores for suggestions

## Core Architecture Patterns

### Authentication System
- **Dual Auth Model**: Supports both registered users and guest sessions
- **Guest Session Management**: Encrypted temporary sessions with usage limits
- **Session Migration**: Seamless transition from guest to registered user
- **RLS Policies**: Row-level security for data isolation

### AI Service Router
- **Multi-Provider Support**: OpenAI, Anthropic, Google, DeepSeek
- **Intelligent Routing**: Cost optimization and availability-based routing
- **Template Engine**: Structured prompts for feng shui analysis
- **Cost Tracking**: Usage monitoring and budget management

### BaZi Calculation Engine
- **Hybrid Architecture**: Enhanced calculator with legacy fallback
- **Adapter Pattern**: Unified interface for multiple calculation methods
- **Caching Layer**: Performance optimization for repeated calculations
- **Timezone Handling**: Global timezone support with DST awareness

### Feng Shui Analysis Engine
- **Flying Stars Algorithm**: Complete Xuankong Flying Stars implementation
- **Plate Generation**: Tianpan, Shanpan, Xiangpan generation
- **Geju Analysis**: Pattern recognition and interpretation
- **Smart Recommendations**: Context-aware suggestion engine

### Internationalization
- **6 Language Support**: Chinese (Simplified/Traditional), English, Japanese, Korean, Thai
- **Cultural Adaptation**: Culturally appropriate feng shui terminology
- **RTL Support**: Right-to-left language support
- **Dynamic Loading**: Efficient locale-based resource loading

## Testing Strategy

### Unit Tests
- **Jest Configuration**: Custom setup for Next.js and TypeScript
- **Test Coverage**: 80%+ coverage requirement
- **Algorithm Testing**: Comprehensive tests for BaZi and feng shui calculations
- **Snapshot Testing**: UI component consistency

### Integration Tests
- **Database Integration**: Supabase integration testing
- **API Testing**: End-to-end API route testing
- **AI Provider Testing**: Mock-based AI service testing

### E2E Tests
- **Playwright Configuration**: Cross-browser testing
- **User Flows**: Critical path testing (analysis, registration, payment)
- **Mobile Testing**: Responsive design validation

## Performance Optimization

### Frontend Performance
- **Next.js App Router**: Latest routing paradigms
- **Image Optimization**: Sharp-based image processing
- **Code Splitting**: Dynamic imports for large components
- **Bundle Analysis**: Webpack bundle analyzer integration

### Backend Performance
- **Database Indexing**: Optimized indexes for common queries
- **Caching Strategy**: Redis-based caching for calculations
- **Connection Pooling**: Supabase connection optimization
- **Query Optimization**: Efficient database queries with joins

## Cultural & Domain Considerations

This project requires understanding of traditional Chinese metaphysics and feng shui principles. When working on feng shui-related features:
- Respect traditional calculation methods while making them accessible
- Maintain cultural authenticity in explanations and recommendations
- Consider both simplified and traditional Chinese character support
- Be mindful of cultural sensitivities around superstitions vs. practical advice

## Guest Session System

The platform supports anonymous users through a sophisticated guest session system:
- **Encrypted Storage**: Personal information encrypted at rest
- **Usage Quotas**: Limited analyses for guest users
- **Session Management**: Automatic cleanup and renewal
- **Migration Support**: Seamless conversion to registered user

## AI Integration Patterns

### Prompt Engineering
- **Template System**: Structured prompts for consistent analysis
- **Context Management**: Maintaining conversation context
- **Sanitization**: Input/output sanitization for safety
- **Confidence Scoring**: AI response reliability assessment

### Cost Management
- **Budget Tracking**: Real-time cost monitoring
- **Provider Selection**: Cost-optimized AI provider routing
- **Usage Analytics**: Detailed usage statistics and trends
- **Rate Limiting**: API call throttling and quotas