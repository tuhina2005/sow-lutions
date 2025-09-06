# 🛠️ Complete Installation Guide

## Step 1: Install Supabase CLI

### Option A: Using npm (Recommended)
```bash
npm install -g supabase
```

### Option B: Using Chocolatey (Windows)
```bash
choco install supabase
```

### Option C: Using Scoop (Windows)
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Option D: Download Binary
1. Go to [Supabase CLI Releases](https://github.com/supabase/cli/releases)
2. Download the Windows binary
3. Add it to your PATH

## Step 2: Verify Installation
```bash
supabase --version
```

## Step 3: Login to Supabase
```bash
supabase login
```

## Step 4: Initialize Supabase in Your Project
```bash
cd D:\SIH\latest-agri-\latest-agri-
supabase init
```

## Step 5: Link to Your Supabase Project
```bash
supabase link --project-ref your-project-id
```

## Step 6: Apply Database Migration
```bash
supabase db push
```

## Alternative: Manual Database Setup

If you prefer not to use the CLI, you can set up the database manually:

### 1. Go to Supabase Dashboard
- Visit [supabase.com](https://supabase.com)
- Open your project
- Go to SQL Editor

### 2. Run the Migration SQL
Copy and paste the entire content from:
`supabase/migrations/20250105060000_agritech_chatbot_schema.sql`

### 3. Execute the SQL
Click "Run" to create all tables and sample data.

## Step 7: Set Environment Variables

Create a `.env` file in your project root:

```env
# Get these from Supabase Dashboard > Settings > API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Get this from Google AI Studio
VITE_GEMINI_API_KEY=AIzaSyC_your-gemini-key-here
```

## Step 8: Install Dependencies
```bash
npm install
```

## Step 9: Start Development Server
```bash
npm run dev
```

## Step 10: Access the Chatbot
1. Open `http://localhost:5173`
2. Click "AI Assistant" in the sidebar
3. Or go to `/agritech-chatbot`

## Troubleshooting

### If Supabase CLI Installation Fails:

**Windows PowerShell (Run as Administrator):**
```powershell
# Install via npm
npm install -g supabase

# Or install via winget
winget install Supabase.CLI
```

**Alternative: Use Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the migration SQL from the file
4. Paste and run it manually

### If Environment Variables Don't Work:
1. Make sure `.env` file is in the project root
2. Restart the development server after adding variables
3. Check that variable names start with `VITE_`

### If Database Connection Fails:
1. Verify Supabase URL and anon key are correct
2. Check that the migration was applied successfully
3. Ensure your Supabase project is active

## Quick Test

After setup, test if everything works:

1. **Start the app**: `npm run dev`
2. **Go to chatbot**: Click "AI Assistant"
3. **Setup profile**: Enter your details
4. **Ask a question**: "What crops are suitable for my soil?"
5. **Check response**: Should get agricultural advice

## Need Help?

If you're still having issues:
1. Check the browser console (F12) for errors
2. Verify all API keys are working
3. Make sure the database migration was successful
4. Try the manual database setup method

The chatbot should work once you have:
- ✅ Supabase CLI installed and configured
- ✅ Database migration applied
- ✅ Environment variables set
- ✅ Development server running
