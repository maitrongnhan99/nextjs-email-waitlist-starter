# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js Email Waitlist Starter** - a complete, production-ready template for building email waitlist landing pages. The project features dual integration with Supabase (database) and ConvertKit (email marketing), a comprehensive admin dashboard, and modern development practices.

**Purpose**: This starter template helps developers quickly launch professional waitlist pages without building from scratch. It's designed to be highly customizable while providing robust, production-ready features out of the box.

## Development Commands

```bash
# Development
pnpm run dev          # Start development server on localhost:3000

# Build & Production
pnpm run build        # Build production bundle
pnpm run start        # Start production server

# Code Quality
pnpm run lint         # Run ESLint

# Package Management
pnpm install          # Install dependencies
pnpm add <package>    # Add new dependency
pnpm remove <package> # Remove dependency
```

## Architecture Overview

### Core Stack
- **Next.js 15** with App Router
- **TailwindCSS 4.0** with @theme syntax
- **TypeScript** throughout
- **pnpm** for package management
- **Supabase** for PostgreSQL database
- **ConvertKit** for email marketing
- **Lucide React** for icons

### Key Files Structure
```
src/
├── app/
│   ├── api/
│   │   ├── waitlist/route.ts    # Main API endpoint for email collection
│   │   └── stats/route.ts       # Analytics endpoint
│   ├── globals.css              # TailwindCSS 4.0 with custom theme
│   ├── layout.tsx              # Root layout with SEO metadata
│   └── page.tsx                # Main landing page component
└── lib/
    └── supabase.ts             # Supabase client with graceful fallbacks
```

## Database Schema

### Waitlist Table
The `waitlist` table includes:
- `id` (UUID, primary key)
- `email` (unique, indexed)
- `first_name` (optional)
- `subscribed_at` (timestamptz, indexed)
- `convertkit_subscriber_id` (sync tracking)
- `source` (traffic source)
- `created_at`/`updated_at` (audit timestamps)

### Feature Requests Table
The `feature_requests` table includes:
- `id` (UUID, primary key)
- `email` (text, indexed)
- `feature_request` (text, required)
- `created_at`/`updated_at` (audit timestamps)

Row Level Security (RLS) is enabled with policies for public inserts and service role access.

## API Architecture

### POST `/api/waitlist`
- Validates email format and uniqueness
- Saves to Supabase database
- Syncs to ConvertKit if configured
- Returns total signup count
- Graceful fallbacks if services are unavailable

### GET `/api/waitlist`
- Returns current waitlist statistics
- Handles database unavailability gracefully

### POST `/api/feature-requests`
- Validates email format and feature request content (10-1000 characters)
- Saves feature requests to Supabase database
- Provides detailed error messages for validation failures
- Returns submission confirmation with request ID

### GET `/api/feature-requests`
- Returns feature request statistics
- Handles database unavailability gracefully

### GET `/api/dashboard`
- **Authentication Required**: ADMIN_SECRET_KEY via query param or Authorization header
- Returns comprehensive dashboard analytics:
  - Subscriber counts and growth metrics
  - Recent activity feed
  - Source distribution data
  - Daily signup trends
  - ConvertKit sync statistics

### GET `/api/dashboard/subscribers`
- **Authentication Required**: ADMIN_SECRET_KEY via query param or Authorization header
- Returns paginated subscriber list with search/filter capabilities
- Supports CSV export with `format=csv` parameter
- Query parameters: page, limit, search, source, sortBy, sortOrder

### Error Handling Pattern
The API uses a defensive programming approach:
- Validates inputs thoroughly
- Checks service availability before operations
- Provides meaningful error messages
- Continues operation if optional services (ConvertKit) fail
- Logs errors without exposing sensitive information

## Environment Configuration

Required environment variables:
```
# Supabase (required for core functionality)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ConvertKit (optional email marketing)
CONVERTKIT_API_SECRET=your_api_secret
CONVERTKIT_FORM_ID=your_form_id

# Admin Dashboard (required for admin access)
ADMIN_SECRET_KEY=your_admin_secret_key
```

## TailwindCSS 4.0 Features

The project uses TailwindCSS 4.0 with:
- `@theme` syntax for custom CSS variables
- Custom gradient utilities
- Modern CSS features (container queries, view transitions)
- Mobile-first responsive design

## Key Implementation Patterns

### Supabase Client Pattern
The Supabase client (`src/lib/supabase.ts`) includes:
- Graceful fallback to `null` if not configured
- Type definitions for database schema (WaitlistEntry, FeatureRequest)
- Checks for placeholder values in environment variables

### Dual Service Integration
The waitlist API demonstrates:
- Primary service (Supabase) for core functionality
- Secondary service (ConvertKit) for enhancement
- Graceful degradation when services are unavailable
- Proper error handling and logging

### Next.js App Router Usage
- Server Components for performance
- Client Components (`'use client'`) for interactivity
- Route handlers for API endpoints
- Proper TypeScript integration

## Development Notes

- This is a **starter template** designed for customization and reuse
- The project uses **pnpm** for faster installations and better disk efficiency
- Project builds successfully even without configured services (graceful fallbacks)
- Database schema is in `supabase-schema.sql` and easily extendable
- All API endpoints handle service unavailability gracefully
- TypeScript types are defined alongside database configuration
- The landing page includes interactive elements (FAQ, countdown timer, congratulations modal)
- Modal system uses smooth animations with TailwindCSS keyframes
- Feature request functionality integrated into post-signup user flow
- **Admin Dashboard** available at `/dashboard?secret=ADMIN_SECRET_KEY` with comprehensive analytics
- `.npmrc` contains pnpm optimizations for performance and reliability

## Starter Template Guidelines

When customizing this starter:
- Maintain the existing error handling patterns
- Follow the established TypeScript type definitions
- Keep the graceful fallback architecture for services
- Preserve the responsive design approach
- Consider extending rather than replacing existing functionality

## Admin Dashboard Features

### Access
- URL: `/dashboard?secret=YOUR_ADMIN_SECRET_KEY`
- Redirects to homepage if authentication fails
- Server-side secret key validation

### Overview Tab
- Real-time subscriber statistics
- Growth metrics (daily, weekly, monthly)
- ConvertKit sync status
- Recent signup activity feed
- Visual analytics cards

### Subscribers Tab
- Paginated subscriber list (20 per page)
- Search functionality (email/name)
- Filter by traffic source
- CSV export capability
- Sync status indicators
- Responsive table design

### Security Features
- Environment variable authentication
- Input sanitization and validation
- Secure error handling
- Rate limiting protection

## Testing Database Setup

To set up the Supabase database:
1. Create a new Supabase project
2. Run the SQL from `supabase-schema.sql` in the SQL Editor
3. Configure environment variables
4. Test the API endpoints at `/api/waitlist`