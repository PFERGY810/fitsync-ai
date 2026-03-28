# FitSync AI - Product Requirements Document v2.0

## 1. Executive Summary

FitSync AI is an AI-powered hypertrophy coaching platform for intermediate to advanced lifters, with
specialized support for enhanced athletes. It integrates training, nutrition, recovery, and physique
analysis using GPT-4o vision and structured coaching logic.

## 2. Target Users

- Primary: Enhanced athletes (on-cycle bodybuilders and physique competitors)
- Secondary: Natural intermediate+ lifters optimizing performance and aesthetics
- Tertiary: Looksmaxxers seeking facial and physique optimization

## 3. Core Value Propositions

- AI physique analysis with weak point identification and posture cues
- Medication- and compound-aware macro and training adjustments
- Cycle management with safety-oriented guidance and monitoring reminders
- Looksmaxx protocols with risk gating and safety disclosures (theoretical content)

## 4. Feature Specifications

### 4.1 Onboarding Flow

Steps and validation rules:

1. Account creation
   - Email: required, valid email format
   - Password: min 8 chars, 1 letter + 1 number
2. Basic profile
   - Height: required, accepts cm or ft/in
   - Weight: required, accepts lbs or kg
   - Age: required, 16-80 range
   - Sex: required (male/female)
3. Goal + experience
   - Goal: cut/bulk/recomp/maintain (required)
   - Experience: beginner/intermediate/advanced/elite (required)
4. Strength goals
   - Bench, squat, deadlift, OHP, pull-ups (current + target)
5. Health + medications
   - Conditions list + custom entries
   - Medications with dosage and frequency
6. Cycle status
   - Natural/enhanced; compound list if enhanced
7. Training program selection
   - Template or custom schedule
8. Progress photos (optional)
   - Front/side/back/legs with guidance
9. Physique analysis (if photos exist)
10. Macro calculation
11. Program generation

### 4.2 Training Module

- Program generation based on profile, physique analysis, and strength goals
- Machine vs free-weight guidance based on weak points and recovery
- Periodization auto-adjustment (weekly volume/intensity changes)
- Adaptive split updates from recovery + progress signals

### 4.3 Nutrition Module

- Macro calculation with validated profile inputs
- Medication and compound multipliers
- Food search and barcode scanning
- Grocery list generation by budget and location

### 4.4 AI Coach

- System prompt with profile, macros, program, meds, and recent check-ins
- Real-time contextual answers, no invented data
- References to user-specific weak points and posture flags

### 4.5 Looksmaxxing Module (NEW)

Scope:

- Facial analysis from photo uploads
- Protocol selection (bone, fat, skin, jawline)
- Compound stack builder (theoretical)
- Treatment tracker and progress comparison

Safety:

- Risk gating required before access
- Explicit warnings: theoretical content, not medical advice
- High-risk procedures are flagged and discouraged

## 5. Technical Architecture

- React Native (Expo) client
- Express + Drizzle ORM server
- Postgres database
- OpenAI GPT-4o for vision + coaching
- FoodData Central (USDA) + OpenFoodFacts for nutrition

## 6. API Contracts (summary)

- `POST /api/coach/chat`
- `POST /api/coach/analyze-physique-detailed`
- `POST /api/coach/generate-program`
- `POST /api/coach/comprehensive-macros`
- `GET /api/food/search`
- `GET /api/food/barcode/:barcode`
- `GET /api/food/details/:fdcId`
- `POST /api/looksmaxx/analyze-face`
- `POST /api/looksmaxx/generate-protocol`
- `GET /api/looksmaxx/compounds`
- `POST /api/looksmaxx/log-treatment`
- `GET /api/looksmaxx/progress`

## 7. Success Metrics

- Onboarding completion rate > 70%
- Weekly active users > 40% of registered
- Macro adherence tracking usage > 50%
- Program updates accepted > 60%
- Looksmaxx module usage > 25% of total users

## 8. Risks and Compliance

- Health/medical content must include explicit disclaimers
- High-risk procedures must be flagged and discouraged
- Avoid storing sensitive health info without explicit consent
