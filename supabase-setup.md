# Supabase + Netlify Deployment Guide

## Why Supabase?
- **Database**: PostgreSQL with web interface
- **Authentication**: Built-in user management
- **Real-time**: WebSocket subscriptions for live chat
- **API**: Auto-generated REST API
- **Free Tier**: Perfect for your needs

## Step-by-Step Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create new project
3. Choose region closest to your users
4. Wait for project to initialize (2-3 minutes)

### 2. Set Up Database
1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the `database-schema.sql` content
3. Click "Run" to create all tables
4. Verify tables were created in Table Editor

### 3. Configure Authentication
1. Go to Authentication > Settings
2. Enable Email authentication
3. Add your Netlify domain to Site URL
4. Configure email templates (optional)

### 4. Get API Keys
1. Go to Settings > API
2. Copy these values:
   - Project URL
   - Anon public key
   - Service role key (keep secret)

### 5. Update Frontend Code
Install Supabase client:
```bash
npm install @supabase/supabase-js
```

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 6. Deploy to Netlify
1. Push code to GitHub
2. Connect GitHub repo to Netlify
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your anon key

### 7. Configure Real-time
Enable real-time for chat:
1. Go to Database > Replication
2. Enable replication for `chat_messages` table
3. Set up Row Level Security (RLS) policies

## Total Cost: FREE
- Supabase: Free tier (500MB database, 2GB bandwidth)
- Netlify: Free tier (100GB bandwidth, 300 build minutes)

## Timeline: 30 minutes setup