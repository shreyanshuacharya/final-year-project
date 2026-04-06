# CaféFlow Authentication System

A complete authentication system for the CaféFlow Café Management System built with Next.js 14, Supabase, and Tailwind CSS.

Created by: Shreyanshu Acharya (Student ID: 2431324)

## Features

- User Registration (Sign Up)
- User Login (Sign In)
- User Logout
- Protected Routes (Dashboard)
- Email/Password Authentication
- Role-based User Management (Staff, Manager, Admin)
- Session Management with Middleware
- Responsive Design with Tailwind CSS
- Type-safe with TypeScript

## Prerequisites

- Node.js 
- npm 
- A Supabase account

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

1. Go to supabase.com and create a free account
2. Click "New Project"
3. Fill in your project details (Name: CaféFlow)
4. Wait for the project to be created

### 3. Get Your Supabase Credentials

1. Go to Settings -> API
2. Copy the Project URL
3. Copy the Anon/Public Key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the Database Schema

1. Go to SQL Editor in your Supabase dashboard
2. Copy the SQL from `supabase-schema.sql`
3. Paste and run it

### 6. Disable Email Confirmation (for testing)

1. Go to Authentication -> Providers -> Email
2. Turn off "Confirm email"
3. Click Save

## Running the Application

Development mode:
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Production build:
```bash
npm run build
npm start
```

## Project Structure
```
cafeflow-auth/
├── app/
│   ├── dashboard/
│   ├── login/
│   ├── signup/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── LogoutButton.tsx
├── lib/
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── types/
│   └── database.types.ts
├── middleware.ts
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## User Roles

The system supports three user roles:

1. Staff - Basic access to POS and order management
2. Manager - Staff permissions + menu management, reports, inventory
3. Admin - Full system access + user management, system configuration

## Pages

### Home Page (/)
Landing page with CaféFlow branding and links to Login and Sign Up. Auto-redirects to dashboard if already logged in.

### Login Page (/login)
Email/password authentication with "Remember me" option and link to sign up page.

### Sign Up Page (/signup)
User registration form with email, password, username fields and role selection (Staff/Manager/Admin).

### Dashboard Page (/dashboard)
Protected route that displays user information and feature cards for different modules (Point of Sale, Order Management, Inventory, Menu Management, Analytics, Settings).

## Testing

### Test Account Creation

1. Go to http://localhost:3000/signup
2. Fill in the form (Email: test@example.com, Password: test123456, Role: Staff)
3. Click "Sign Up"
4. You should see a success message

### Test Login

1. Go to http://localhost:3000/login
2. Enter your credentials
3. Click "Sign In"
4. You should be redirected to the dashboard

### Test Logout

1. From the dashboard, click the "Logout" button
2. You should be redirected to the login page

## Database Schema
```typescript
interface User {
  id: string
  email: string
  username?: string
  role: 'staff' | 'manager' | 'admin'
  created_at: string
  updated_at: string
}
```

## Security Features

- Password hashing (handled by Supabase)
- JWT-based sessions
- HTTPS only cookies (in production)
- Row Level Security (RLS) on database
- Middleware for route protection
- CSRF protection
- XSS protection via React

## Troubleshooting

### "Invalid API key" Error

Check that your `.env.local` file has the correct Supabase credentials. Restart the development server after changing environment variables.

### "Email not confirmed" Error

Disable email confirmation in Supabase settings for development.

### Redirect Loop

Clear your browser cookies and check middleware configuration.

### TypeScript Errors

Run `npm install` to ensure all dependencies are installed. Restart your IDE if needed.

## Resources

- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs

## Author

Shreyanshu Acharya
Student ID: 2431324
Section: L6CG24
University of Wolverhampton / Herald College Kathmandu