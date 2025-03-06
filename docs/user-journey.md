
# Fitness Transformation App - User Journey

## Overview

The FitTransform app helps users achieve their fitness goals through a structured, data-driven approach to weight loss and muscle retention. The application guides users through a series of stages, from initial data collection to daily progress tracking.

## User Journey

### Stage 1: User Data Collection for BMR

**Purpose:** Gather essential user metrics to calculate basal metabolic rate

**User Flow:**
1. User enters basic information:
   - Age (years)
   - Gender (male/female)
   - Height (cm)
   - Current weight (kg)
   - Activity level (dropdown: sedentary, lightly active, moderately active, very active)
2. System calculates BMR using the Mifflin-St Jeor formula
3. BMR result is displayed to the user

### Stage 2: Weight Loss Goals and Time Frame

**Purpose:** Define realistic weight loss targets and timeframe

**User Flow:**
1. User enters:
   - Target weight (kg)
   - Time frame (weeks)
   - Weight lifting sessions per week (1-5)
   - Cardio sessions per week (0-7)
   - Steps per day (default 10,000)
2. System calculates:
   - Total calorie deficit needed (7700 calories = 1 kg of fat)
   - Daily deficit required
   - Weekly activity calorie burn from exercise
   - Recommended daily food intake
3. System validates goals:
   - Warning if daily deficit exceeds 1000 calories
   - Suggestion to adjust goal or time frame if too aggressive

### Stage 3: Show Plan

**Purpose:** Present personalized nutrition and exercise recommendations

**User Flow:**
1. System generates based on user data:
   - Daily calorie target
   - Macro breakdown:
     - Protein: 1.6g/kg of body weight
     - Fats: 0.8g/kg
     - Remaining calories from carbs
   - Training schedule (default 4 days/week weight lifting)
   - Step goal (default 8000 steps/day)
2. Results are displayed in a neat table format

### Stage 4: Daily Log for Deficit Tracking

**Purpose:** Enable daily tracking of nutrition and activity

**User Flow:**
1. User logs daily data:
   - Calories in: total calories eaten
   - Macros: protein, fats, carbs (grams)
   - Calories out:
     - BMR (auto-filled)
     - Weight lifting (estimate 300 cal/hour)
     - Steps (0.04 cal/step)
     - Cardio (estimate 600 cal/hour)
2. System calculates daily deficit
3. History of past logs is accessible

### Stage 5: Log Daily Weight, Body Fat, and Muscle

**Purpose:** Track body composition changes over time

**User Flow:**
1. User inputs:
   - Daily weight (kg)
   - Body fat percentage (optional)
   - Muscle mass (optional)
2. System stores data linked to date
3. System displays graph/table of trends over time

## Advanced Features

### Smart Adaptation & Insights

- AI-driven recommendations to adjust diet & training based on progress
- Progress forecasting (estimated time to hit target body fat)
- Plateau breaking suggestions (adjust calories, training, implement refeed)

### Recovery & Lifestyle

- Sleep tracking (7-9 hours recommendation) 
- Stress management integration
- Rest and deload recommendations
- Refeed and diet break scheduling

## Design Principles

- Clean, modern interface with fitness-themed aesthetics (greens and grays)
- Mobile-first approach with big buttons and clear text
- Simple navigation between stages
- Progress visualization through charts and progress bars

## User Progression Path

1. **Onboarding**: User profile creation and initial data collection
2. **Goal Setting**: Establishing realistic targets and timeframes
3. **Plan Generation**: Creating personalized nutrition and workout plan
4. **Daily Tracking**: Logging nutrition, activity and body metrics
5. **Progress Analysis**: Visualizing changes and adapting the plan
6. **Achievement**: Reaching target weight and transitioning to maintenance
