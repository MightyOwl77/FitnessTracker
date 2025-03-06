
# Body Transform - Fitness Transformation App

A comprehensive fitness transformation web application that helps users plan and track their fitness journey with personalized weight loss plans, calorie tracking, and body stats monitoring.

## Features

- **User Profile Management**: Personalized BMR calculation using Mifflin-St Jeor formula
- **Goal Setting**: Science-based weight loss planning with adaptive deficit calculations
- **Body Stats Tracking**: Track weight, body fat, measurements, and performance metrics
- **Daily Logging**: Log nutrition, activity, and recovery metrics
- **Progress Visualization**: Charts to visualize transformation journey

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: In-memory storage with PostgreSQL schema definitions (Drizzle ORM)

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   └── App.tsx         # Main application component
│   └── index.html          # HTML entry point
├── server/                 # Backend Express application
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage implementation
│   └── vite.ts             # Vite development server setup
└── shared/                 # Shared code between client and server
    └── schema.ts           # Data schemas and types
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## API Endpoints

### User Profile

- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create or update user profile

### User Goals

- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create or update user goals

### Daily Logs

- `GET /api/logs` - Get all daily logs
- `GET /api/logs/:date` - Get log for specific date
- `POST /api/logs` - Create or update daily log

### Body Stats

- `GET /api/stats` - Get all body stats
- `GET /api/stats/:date` - Get stats for specific date
- `POST /api/stats` - Create or update body stats

## Scientific Approach

This application implements evidence-based principles for fat loss:

1. **BMR Calculation**: Uses the Mifflin-St Jeor formula
2. **Optimal Deficit**: Calculates appropriate caloric deficit based on body fat levels
3. **Protein Prioritization**: Sets protein recommendations based on lean body mass
4. **Progressive Overload**: Tracks strength metrics to ensure muscle retention
5. **Adaptive Diet Strategy**: Includes refeed days and diet breaks for long-term success

## Future Enhancements

- User authentication and multi-user support
- Image-based progress tracking
- AI-based workout recommendations
- Meal planning and recipe database
