# FitSync AI

AI-powered hypertrophy coaching platform for intermediate to advanced lifters, with specialized support for enhanced athletes.

## Overview

FitSync AI is a mobile application that analyzes physique photos, lifting form videos, and training data to continuously optimize workout programs, macros, and technique. The application features a dark-themed, high-contrast UI designed for clinical precision and motivation.

## Features

### Core Functionality

- **AI Physique Analysis** - GPT-4o vision analysis of progress photos for proportion scoring, weak points identification, and body fat estimation
- **Personalized Training Programs** - AI-generated programs tailored to user stats, goals, and recovery capacity
- **Nutrition Tracking** - Macro calculation with medication/compound multipliers, food search, barcode scanning
- **AI Coach Chat** - Interactive coaching with full profile context for personalized responses

### Specialized Features

- **Cycle Management** - For enhanced athletes with compound tracking and safety guidance
- **Healthmaxx Module** - AI-powered health optimization for 12+ health concern categories
- **Looksmaxx Module** - Facial analysis and protocol recommendations (theoretical content)

## Tech Stack

### Frontend

- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation with tab and stack navigators
- **State Management**: TanStack React Query + AsyncStorage
- **UI**: Custom themed components with Reanimated animations

### Backend

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-4o for vision and coaching
- **Food Data**: USDA FoodData Central + OpenFoodFacts

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- OpenAI API key

### Installation

1. **Clone and install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

   Required environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `PORT` - Server port (default: 5000)

3. **Setup database**

   ```bash
   npm run db:push
   ```

4. **Start development servers**

   ```bash
   # Terminal 1 - Backend
   npm run server:dev
   
   # Terminal 2 - React Native
   npm run expo:dev
   ```

## Project Structure

```text
├── client/                 # React Native frontend
│   ├── components/         # Reusable UI components
│   ├── screens/           # App screens
│   │   └── onboarding/    # Onboarding flow screens
│   ├── navigation/        # Navigation configuration
│   ├── context/           # React context providers
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities and storage
│   └── constants/         # Theme and configuration
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   ├── knowledge/         # AI knowledge bases
│   └── utils/             # Server utilities
└── shared/                # Shared types and schemas
```

## API Endpoints

### Coach Routes

- `POST /api/coach/chat` - AI coach conversation
- `POST /api/coach/analyze-physique-detailed` - Physique photo analysis
- `POST /api/coach/generate-program` - Training program generation
- `POST /api/coach/comprehensive-macros` - Macro calculation

### Food Routes

- `GET /api/food/search` - Food database search
- `GET /api/food/barcode/:barcode` - Barcode lookup
- `GET /api/food/details/:fdcId` - Food details

### Looksmaxx Routes

- `POST /api/looksmaxx/analyze-face` - Facial analysis
- `POST /api/looksmaxx/generate-protocol` - Protocol generation

## Knowledge Bases

The AI system is powered by comprehensive training databases in `server/knowledge/`:

- **steroid-pharmacology.ts** - Compound database with dosing protocols and safety info
- **hypertrophy-science.ts** - Evidence-based training science
- **anatomy-biomechanics.ts** - Muscle anatomy and exercise selection
- **nutrition-science.ts** - Macro calculations and nutrition protocols
- **powerlifting-form.ts** - Exercise form database and cues
- **bodybuilding-coaching.ts** - Physique assessment and programming
- **posture-correction.ts** - Postural dysfunction protocols
- **hormone-optimization.ts** - Hormone optimization strategies
- **medications.ts** - Medication impacts on training/nutrition

## Design Guidelines

The app follows a bold, scientific aesthetic:

- **Primary**: #FF4500 (Vibrant orange-red)
- **Background**: #0A0A0A (Near-black)
- **Surface**: #1C1C1E (Dark gray cards)
- **Success**: #00D084 (Gains green)
- **Warning**: #FFB800 (Form correction yellow)

See `design_guidelines.md` for complete specifications.

## License

Private - All rights reserved

## Disclaimer

This application provides educational content only and is not medical advice. Consult healthcare professionals before starting any training or nutrition program. High-risk procedures and compounds are flagged and discouraged.
