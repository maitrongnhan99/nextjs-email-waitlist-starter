# Next.js Email Waitlist Starter

🚀 A complete, production-ready Next.js starter for building email waitlist landing pages with built-in analytics, admin dashboard, and dual integration (Supabase + ConvertKit).

## Why This Starter?

Stop building waitlist pages from scratch! This comprehensive starter gives you everything you need to launch a professional email waitlist in minutes, not days. Perfect for product launches, newsletter signups, and building anticipation for your next big idea.

## ✨ Key Features

### 🎯 **Complete Email Collection System**
- Beautiful, responsive waitlist landing page
- Real-time email validation and duplicate prevention
- Congratulations modal with feature request collection
- Smooth animations and modern UX

### 📊 **Admin Dashboard & Analytics**
- Secure admin dashboard with comprehensive analytics
- Real-time subscriber stats and growth metrics
- Searchable subscriber management with CSV export
- ConvertKit sync status monitoring

### 🔗 **Dual Integration Architecture**
- **Supabase**: PostgreSQL database with Row Level Security
- **ConvertKit**: Email marketing automation
- Graceful fallbacks if services are unavailable
- Environment-based configuration

### 🛠️ **Modern Tech Stack**
- 🚀 **Next.js 15** - Latest version with App Router
- 🎨 **TailwindCSS 4.0** - Modern styling with CSS variables
- ⚡ **TypeScript** - Full type safety throughout
- 📦 **pnpm** - Fast, efficient package management
- 📱 **Mobile-First** - Responsive design for all devices

## 📍 Quick Start

```bash
# Clone this starter
git clone https://github.com/yourusername/nextjs-email-waitlist-starter.git
cd nextjs-email-waitlist-starter

# Install dependencies (requires pnpm)
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your waitlist in action!

## 📦 Tech Stack

| Category | Technology | Purpose |
|----------|------------|----------|
| **Framework** | Next.js 15 | React framework with App Router |
| **Styling** | TailwindCSS 4.0 | Utility-first CSS with modern features |
| **Database** | Supabase | PostgreSQL with real-time capabilities |
| **Email Marketing** | ConvertKit | Email automation and marketing |
| **Language** | TypeScript | Type-safe development |
| **Package Manager** | pnpm | Fast, efficient dependency management |
| **Icons** | Lucide React | Beautiful, consistent icon set |
| **Deployment** | Vercel (recommended) | Optimized for Next.js applications |

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **pnpm** (install with: `npm install -g pnpm`)
3. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
4. **ConvertKit Account**: Sign up at [convertkit.com](https://convertkit.com)
5. **Admin Secret**: Choose a strong secret key for dashboard access

### Installation

1. **Clone the starter**
   ```bash
   git clone https://github.com/yourusername/nextjs-email-waitlist-starter.git
   cd nextjs-email-waitlist-starter
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your credentials in `.env.local`:
   ```env
   # ConvertKit API Credentials
   CONVERTKIT_API_SECRET=your_api_secret_here
   CONVERTKIT_FORM_ID=your_form_id_here
   NEXT_PUBLIC_CONVERTKIT_ACCOUNT_ID=your_account_id_here

   # Supabase Credentials
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Set up Supabase database**
   
   Run the SQL schema in your Supabase SQL Editor:
   ```bash
   # Copy the contents of supabase-schema.sql and run in Supabase SQL Editor
   ```

5. **Run the development server**
   ```bash
   pnpm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### ConvertKit Setup

1. Get your **API Secret** from ConvertKit Account Settings
2. Create a **Form** and get the Form ID
3. Add credentials to your `.env.local` file

### Supabase Setup

1. Create a new Supabase project
2. Run the provided SQL schema (`supabase-schema.sql`)
3. Get your project URL and anon key
4. Add credentials to your `.env.local` file

## Database Schema

The `waitlist` table includes:
- `id` - UUID primary key
- `email` - Unique email address
- `first_name` - Optional first name
- `subscribed_at` - Subscription timestamp
- `convertkit_subscriber_id` - ConvertKit sync ID
- `source` - Traffic source tracking
- `created_at` / `updated_at` - Audit timestamps

## API Routes

### POST `/api/waitlist`
Subscribe user to waitlist
- Validates email format
- Checks for duplicates in Supabase
- Saves to Supabase database
- Subscribes to ConvertKit
- Returns total signup count

### GET `/api/waitlist`
Get waitlist statistics
- Returns total signups from Supabase

### GET `/api/stats`
Get detailed analytics
- Total signups
- Weekly growth rate
- Recent activity metrics

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

**Note**: Vercel automatically detects pnpm and uses it for builds when `pnpm-lock.yaml` is present.

### Other Platforms

Ensure environment variables are set in your deployment platform. Most modern platforms (Netlify, Railway, etc.) automatically detect and use pnpm when `pnpm-lock.yaml` is present.

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── waitlist/route.ts    # Waitlist subscription API
│   │   └── stats/route.ts       # Analytics API
│   ├── globals.css              # Global styles with TailwindCSS 4.0
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main landing page
└── lib/
    └── supabase.ts             # Supabase client configuration
```

### Key Features

- **Dual Integration**: Data saved to both Supabase and ConvertKit
- **Error Handling**: Graceful fallbacks if services fail
- **Type Safety**: Full TypeScript support
- **Responsive**: Mobile-first design approach
- **Performance**: Optimized for Core Web Vitals

## 🎨 Customization Guide

### 🌈 Quick Customizations

#### **1. Branding & Content**
```typescript
// src/app/page.tsx - Update main content
const heroTitle = "Get early access" // Change this
const heroDescription = "Be amongst the first..." // And this

// src/app/layout.tsx - Update meta tags
title: "Your Product Waitlist"
description: "Join the waitlist for..."
```

#### **2. Colors & Styling**
```css
/* src/app/globals.css - Update theme colors */
@theme {
  /* Change lime-400 to your brand color */
  --color-primary: lime-400;
}
```

#### **3. FAQ & Features**
```typescript
// src/app/page.tsx - Update FAQ items
const faqItems = [
  {
    question: "What is your product?",
    answer: "Your custom answer here..."
  }
]
```

### 🛠️ Advanced Customizations

#### **Database Schema**
```sql
-- Add custom fields to supabase-schema.sql
ALTER TABLE waitlist ADD COLUMN company TEXT;
ALTER TABLE waitlist ADD COLUMN referral_source TEXT;
```

#### **New Features**
- 📊 **Analytics**: Add Google Analytics, Plausible, or PostHog
- 📧 **Email Providers**: Swap ConvertKit for Mailchimp, Sendgrid, etc.
- 🗺️ **Localization**: Add multi-language support
- 🔗 **Integrations**: Connect to Slack, Discord, webhooks

#### **UI Components**
```typescript
// Create custom components in src/components/
// Follow existing patterns for consistency
import { ComponentName } from '@/components/ComponentName'
```

### 🎯 **Deployment Tips**

> ⚡ **Pro Tip**: Most platforms auto-detect pnpm when `pnpm-lock.yaml` is present!

- **Vercel**: Automatic Next.js optimization
- **Netlify**: Supports Edge Functions
- **Railway**: Simple deployment with database
- **DigitalOcean**: App Platform ready

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with details

---

Built with ❤️ using Next.js, TailwindCSS, Supabase, and ConvertKit.