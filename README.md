# Idyll Productions - Editor Management System

A comprehensive video editing management platform built with React, TypeScript, and Vite. This is a clean template ready for your own backend integration.

## Features

### Welcome Page
- Login for existing users
- Create account for new users  
- View portfolio showcase (links to idyllproductions.com)
- About us information
- Guest mode demos for all user roles

### User Authentication Flow
- **New Users**: Create Account → Email Verification → Approval Page → Dashboard Access
- **Existing Users**: Direct login with username/password
- **Guest Mode**: Instant access to explore all features

### Editor Dashboard
- **Profile Management**: Change username/password
- **Task Management**: View assigned tasks with deadlines, status tracking, file links
- **Meeting Calendar**: Custom calendar with assigned meetings
- **Live Chat**: Real-time communication with moderators
- **Payout Requests**: Submit and track payment requests

### Management Panel (Moderators & Owners)
- **User Approval**: Review and approve new editor applications
- **User Management**: Manage roles (Editor, Moderator, Owner)
- **Task Assignment**: Create and assign editing tasks
- **Meeting Management**: Schedule and manage team meetings
- **Payout Management**: Handle editor payment requests
- **Team Chat**: Live communication with all team members
- **Notification Center**: Track pending tasks, meetings, and payouts

### User Roles
- **Editor**: Access to personal dashboard and tasks
- **Moderator**: Management panel access for team coordination
- **Owner**: Full management access to all features

## Tech Stack
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- **No external dependencies** - ready for your own backend

## Premium UI Features
- **Custom Cursor**: Soft blue glow effect
- **Card Tilt Effects**: 3D parallax on hover
- **Smooth Animations**: Professional bouncy entrance effects
- **Glass Morphism**: Subtle blur effects and depth
- **SF Pro Font**: Professional typography

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Customization

### Authentication
Replace the placeholder authentication functions in `App.tsx`:
- `handleLogin()` - Connect to your login API
- `handleCreateAccount()` - Connect to your registration API
- Add your own user session management

### Backend Integration
The app is structured to easily connect to your backend:
- User management APIs
- Task assignment system
- File upload/storage
- Real-time chat
- Payment processing

### Environment Setup
- No `.env` files included - add your own configuration
- No API keys required for demo mode
- Clean template ready for your services

## Demo Mode
- **Guest Access**: Try all features without authentication
- **Role Switching**: Experience Editor, Moderator, and Owner views
- **Full Functionality**: All UI interactions work with demo data

## Deployment
Built files are generated in the `dist` folder and can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages.

---

**Ready to customize with your own backend and branding!** 🚀
