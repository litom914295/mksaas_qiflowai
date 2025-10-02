# GEMINI Context for QiFlow AI

This document provides a comprehensive overview of the QiFlow AI project, its architecture, and development conventions to be used as instructional context.

## 1. Project Overview

**QiFlow AI** is an intelligent Feng Shui analysis platform that combines traditional Chinese wisdom (like Bazi and Xuan Kong Flying Stars) with modern AI technology. The core of the project is a web application built with **Next.js 14 (App Router)**, **React 18**, and **TypeScript**.

The platform is designed to provide users with personalized and intuitive Feng Shui analysis by overlaying Flying Star charts on floor plans and integrating AI-driven recommendations. It supports both registered users and a seamless "guest" experience.

**Key Technologies:**
- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Backend & Database:** The application relies on a **PostgreSQL** database to store user data, analysis results, and house information. The `docker-compose.yml` file defines the local development setup, including a `postgres` service.
- **Internationalization:** `next-intl` is used for i18n, with `zh-CN` as the default locale. All user-facing routes are prefixed with a locale.
- **Deployment:** The project is containerized using **Docker** and includes an **Nginx** configuration for reverse proxying, rate limiting, and serving in production.

## 2. Architecture and Key Features

### Frontend & UI
- The project uses the **Next.js App Router** paradigm, with routes organized under `src/app/[locale]`.
- UI components are built using **shadcn/ui** and are located in `src/components/ui`.
- The overall structure is modular, with feature-specific components in directories like `src/components/analysis`, `src/components/compass`, etc.

### Database Schema (`database/schema.sql`)
The PostgreSQL database is central to the application and features a well-defined schema:
- `users`: Stores registered user information, with encrypted fields for sensitive data like birth details.
- `guest_sessions`: Manages temporary sessions for guest users, allowing them to experience core features. It includes logic for merging guest data into a user account upon registration.
- `bazi_calculations`: Stores the results of Bazi (八字) personality analysis.
- `houses`: Contains information about user-submitted properties, including floor plans and facing direction.
- `fengshui_analyses`: Stores the results of Feng Shui analysis, linking users, houses, and Bazi calculations.

### Guest Analysis Flow
A key feature is the comprehensive guest analysis journey, which allows non-registered users to:
1.  Input personal details (birth date, time, etc.).
2.  Provide house details and measure its orientation using a digital compass.
3.  Receive a complete Bazi and Xuan Kong Flying Stars analysis report.
This entire flow is implemented in the `[locale]/guest-analysis` route and detailed in the `GUEST_ANALYSIS_IMPLEMENTATION_REPORT.md`.

### Internationalization (i18n)
- The `src/middleware.ts` is responsible for handling locale detection and redirection.
- It ensures that all user-facing paths are prefixed with a supported locale (e.g., `/zh-CN/...`).
- The default locale is `zh-CN`, and any request to the root `/` is redirected to `/zh-CN`.

## 3. Building and Running the Project

The `package.json` file contains all the necessary scripts for development, testing, and building.

### Environment Setup
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Configure environment variables:**
    ```bash
    cp .env.example .env.local
    # Edit .env.local to add necessary API keys and secrets.
    ```

### Key Scripts
- **Development:** Start the local development server.
  ```bash
  npm run dev
  ```
- **Docker Development:** Run the entire stack (Next.js, Postgres, Redis) using Docker.
  ```bash
  docker-compose up --build
  ```
- **Build:** Create a production-ready build.
  ```bash
  npm run build
  ```
- **Start Production Server:** Run the production build.
  ```bash
  npm run start
  ```
- **Linting & Formatting:** Check for code quality and format files.
  ```bash
  npm run lint
  npm run format
  ```
- **Testing:** Run unit and integration tests with Jest.
  ```bash
  npm run test
  ```

## 4. Development Conventions

- **Code Style:** The project uses ESLint and Prettier to enforce a consistent code style. Run `npm run lint` and `npm run format` before committing.
- **TypeScript:** The codebase is strictly typed. Path aliases like `@/*` are configured in `tsconfig.json` to simplify imports.
- **Component Structure:** Follow the existing modular structure. Reusable, generic UI elements go in `src/components/ui`, while feature-specific components are organized in subdirectories under `src/components`.
- **State Management:** While not explicitly defined in the provided files, the presence of a `src/stores` directory suggests a centralized state management solution (like Zustand or Jotai) is likely used.
- **Database:** Schema changes should be made in `database/schema.sql` and other related SQL files. The schema makes extensive use of foreign keys, custom types, and encrypted columns for data integrity and security.
