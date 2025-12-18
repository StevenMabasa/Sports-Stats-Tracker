# Sport Stats Tracker

A comprehensive React + TypeScript + Vite web application for tracking sports statistics across multiple disciplines including football and Formula 1, with role-based access control and real-time features powered by Supabase.

**Live Demo:** [https://blue-ocean-09d10ab03.1.azurestaticapps.net/](https://blue-ocean-09d10ab03.1.azurestaticapps.net/)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Features](#features)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Technology Stack](#technology-stack)
 - [Documentation](#documentation)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`
- **npm** (comes with Node.js) or **yarn**
  - Verify npm: `npm --version`
- **Git** for version control
- **Supabase Account** (for authentication and database)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Siyabonga-Alfred-Nyembe/Sport-Stats-Tracker
   cd Sport-Stat-Tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment variables

Create a `.env` in the project root (do not commit). Vite exposes variables prefixed with `VITE_` to the client.

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Restart the dev server after changing env vars.

## Running the Application

### Development Server
```bash
npm run dev
# or
yarn dev
```

The application will start on `http://localhost:5173`

### Production Build
```bash
npm run build
# or
yarn build
```

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
Sport-Stats-Tracker/
├── src/
│   ├── __test__/              # Comprehensive test suite
│   │   ├── __snapshots__/     # Test snapshots
│   │   └── *.test.tsx         # Component and service tests
│   ├── components/            # Reusable components
│   │   ├── ProtectedRoute.tsx # Route protection
│   │   └── RoleSelection.tsx  # Role selection component
│   ├── pages/                 # Page components
│   │   ├── userDashboard/     # User dashboard pages
│   │   │   ├── RedesignedDashboard.tsx
│   │   │   ├── TeamStatsPage.tsx
│   │   │   └── components/     # Dashboard-specific components
│   │   ├── coachDashboard/    # Coach management pages
│   │   │   ├── CoachDashboard.tsx
│   │   │   ├── components/     # Coach-specific components
│   │   │   └── hooks/         # Custom hooks
│   │   ├── f1/                # Formula 1 pages
│   │   │   ├── F1Dashboard.tsx
│   │   │   ├── F1DriversPage.tsx
│   │   │   ├── F1TeamPage.tsx
│   │   │   ├── F1StatsPage.tsx
│   │   │   └── F1ResultsPage.tsx
│   │   ├── landingPage.tsx     # Landing page
│   │   ├── login.tsx          # Authentication
│   │   ├── signup.tsx         # User registration
│   │   ├── TeamSetup.tsx      # Team setup page
│   │   └── AdminDashboard.tsx # Admin interface
│   ├── services/              # API services
│   │   ├── matchService.ts    # Match data management
│   │   ├── playerService.ts   # Player data management
│   │   ├── teamService.ts     # Team data management
│   │   ├── chatService.ts     # Real-time chat
│   │   └── *.ts               # Other service modules
│   ├── Styles/                # CSS stylesheets
│   │   ├── landingPage.css
│   │   ├── signUpLogin.css
│   │   ├── user-dashboard.css
│   │   ├── coach-dashboard.css
│   │   └── admin-dashboard.css
│   ├── images/                # Static assets
│   ├── App.tsx                # Main app with routing
│   ├── main.tsx               # Application entry point
│   ├── types.ts               # TypeScript type definitions
│   └── chartSetup.js          # Chart configuration
├── docs/                      # Documentation
│   ├── architecture/          # Architecture documentation
│   ├── features/              # Feature documentation
│   └── services/              # Service documentation
├── API's/                     # Backend API
│   └── server.js              # Express server
├── supabaseClient.ts          # Supabase configuration
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
└── staticwebapp.config.json   # Azure deployment config
```

## Features

### Role-Based Access Control
- **Fan Role**: View team statistics, player performance, match results, and F1 data
- **Coach Role**: Manage team rosters, create lineups, track player statistics, and analyze team performance
- **Admin Role**: Full system access including user management and administrative functions

### Sports Statistics Tracking
- **Football Statistics**: Player stats, team performance, match results, and advanced analytics
- **Formula 1 Integration**: Driver standings, team performance, race results, and championship statistics
- **Real-time Updates**: Live statistics and match updates using Supabase real-time subscriptions

### Dashboard Features
- **User Dashboard**: Personalized overview with recent activity, favorite teams/players, and quick access
- **Coach Dashboard**: Team management tools, lineup creation, player performance analysis
- **Admin Dashboard**: System-wide oversight, user management, and administrative controls
- **F1 Dashboard**: Dedicated Formula 1 statistics and race information

### Data Management
- **Player Management**: Comprehensive player profiles with detailed statistics
- **Team Management**: Team setup, roster management, and performance tracking
- **Match Tracking**: Match scheduling, results recording, and statistical analysis
- **Favorites System**: Save favorite teams, players, and matches for quick access

### Interactive Features
- **Real-time Chat**: Team communication and match discussions
- **Data Visualization**: Charts and graphs for statistical analysis
- **Export Capabilities**: Generate reports and export data (PDF support)
- **Responsive Design**: Mobile-friendly interface across all devices

### Role-Based Access Control
- **Fan Role**: Access to view team statistics, player performance, match results, and F1 data
- **Coach Role**: Full team management including roster creation, lineup management, player statistics tracking, and team performance analysis
- **Admin Role**: Complete system access including user management, role assignments, and administrative oversight
- **Protected Routes**: Secure navigation based on user authentication and role permissions

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run server` | Start Express backend server with nodemon |
| `npm run build` | Create optimized production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run test` | Run Vitest tests |
| `npm run test:coverage` | Run tests with coverage report |

## Testing

This project uses Vitest for comprehensive testing with coverage reporting:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test -- --watch
```

The project includes extensive test coverage for:
- Component testing with React Testing Library
- Service layer testing for API interactions
- Integration tests for user workflows
- Snapshot testing for UI consistency

Test files are located in `src/__test__/` with comprehensive coverage of components, services, and user interactions.

## Deployment

### Microsoft Azure (Recommended)
1. Connect your GitHub repository to Microsoft Azure
2. Add environment variables in Microsoft Azure dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the project: `npm run build`
2. Upload the `dist/` folder to your hosting provider
3. Configure environment variables on your hosting platform

## Technology Stack

### Frontend
- **React 18.3.1** - UI library with hooks and functional components
- **TypeScript** - Type safety and enhanced development experience
- **Vite 7.1.9** - Fast build tool and development server
- **React Router Dom 7.8.1** - Client-side routing and navigation
- **React Hook Form 7.62.0** - Form handling and validation
- **React Icons 5.5.0** - Icon library for UI components

### Data Visualization & Charts
- **React Chart.js 2 5.3.0** - Chart.js integration for React
- **Recharts 3.1.2** - Composable charting library
- **HTML2Canvas 1.4.1** - Canvas rendering for exports
- **jsPDF 3.0.2** - PDF generation for reports

### Backend & Database
- **Supabase 2.56.0** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication and authorization
- **Express 4.21.2** - Node.js web framework
- **Node.js** - Runtime environment

### Authentication & Security
- **Supabase Auth UI React 0.4.7** - Pre-built auth components
- **Supabase Auth UI Shared 0.1.8** - Shared auth utilities
- **bcrypt 6.0.0** - Password hashing
- **crypto-js 4.2.0** - Cryptographic functions
- **js-sha256 0.11.1** - SHA-256 hashing

### Development & Testing
- **Vitest 3.2.4** - Fast unit testing framework
- **Testing Library** - React component testing utilities
- **Jest 30.0.5** - JavaScript testing framework
- **ESLint 9.33.0** - Code linting and quality
- **TypeScript ESLint 8.39.1** - TypeScript-specific linting rules

### Build & Deployment
- **Vite** - Build tool and bundler
- **TypeScript 5.8.3** - Type system
- **Azure Static Web Apps** - Cloud deployment platform

## Documentation

- See `docs/` for feature and architecture docs:
  - [Chat component](docs/features/chat.md)
  - [chatService API](docs/services/chatService.md)
  - [Architecture overview](docs/architecture.md)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages
5. Push to your fork and create a pull request
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
