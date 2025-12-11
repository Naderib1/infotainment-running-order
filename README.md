# Infotainment Running Order Generator

A modern web application for creating and managing running orders for infotainment at sports events.

## Features

- 📋 Create and manage running order items with detailed information
- 🏟️ Support for multiple stadiums and teams
- 🎨 Beautiful, responsive UI with dark mode support
- 📄 Export to PDF and HTML for printing
- 👤 **User authentication** - Each user has their own data
- ☁️ **Cloud sync** - Data persists across devices and refreshes
- 📁 Save and load templates

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Setting Up User Authentication & Database (Supabase)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"** and fill in the details
3. Wait for the project to be created (takes ~2 minutes)

### 2. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` from this repo
3. Paste and click **"Run"** to create the tables

### 3. Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy your **Project URL** and **anon public** key

### 4. Configure Environment Variables

**For local development:**
```bash
cp .env.example .env
# Edit .env and add your Supabase URL and anon key
```

**For Railway deployment:**
1. Go to your Railway project
2. Click on **Variables**
3. Add these environment variables:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

### 5. Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. (Optional) Disable email confirmation for easier testing:
   - Go to **Authentication** → **Settings**
   - Turn off "Enable email confirmations"

## Updating the Default Template

The app automatically loads from `public/default-template.json` on startup.

**To update the template:**

1. Make your changes in the app
2. Click "Save Template" to download the updated JSON
3. Rename the downloaded file to `default-template.json`
4. Replace `public/default-template.json` with your new file
5. Commit and push to GitHub
6. Railway will automatically redeploy with the new template

## Deployment on Railway

This project is configured for easy deployment on Railway:

1. Connect your GitHub repository to Railway
2. Railway will automatically detect it as a Vite/Node.js project
3. Set the build command: `npm run build`
4. Set the start command: `npm run preview` or use a static file server

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui components

