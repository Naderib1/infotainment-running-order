# Infotainment Running Order Generator

A modern web application for creating and managing running orders for infotainment at sports events.

## Features

- 📋 Create and manage running order items with detailed information
- 🏟️ Support for multiple stadiums and teams
- 🎨 Beautiful, responsive UI with dark mode support
- 📄 Export to PDF and HTML for printing
- 💾 Auto-save to local storage
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

