# Sakhi Web Application

A modern web application built with React, TypeScript, and Firebase.

## Tech Stack

- React with TypeScript
- Vite for build tooling
- Firebase (Authentication, Firestore, Cloud Functions)
- Redux Toolkit for state management
- Tailwind CSS for styling
- React Router for navigation

## Project Structure

```
src/
├── assets/        # Static assets
├── components/    # Reusable UI components
├── config/        # Configuration files
├── features/      # Feature-based modules
├── hooks/         # Custom React hooks
├── layouts/       # Layout components
├── pages/         # Page components
├── services/      # API and service integrations
├── store/         # Redux store setup
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your Firebase configuration

4. Start the development server:
   ```bash
   npm run dev
   ```

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Cloud Functions
3. Copy your Firebase configuration to the `.env` file
4. Initialize Firebase in your project using the provided configuration

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Best Practices

- Use TypeScript for type safety
- Follow the feature-based folder structure
- Implement proper error handling
- Use custom hooks for reusable logic
- Follow Redux best practices for state management
- Use Tailwind CSS for consistent styling

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT
