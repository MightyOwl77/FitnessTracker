
# Fitness Transformation App - Wireframe Descriptions

## Navigation Structure

- **Top Navigation Bar**: Links to switch between stages
  - Input Data
  - Set Goals
  - View Plan
  - Daily Log
  - Body Stats
- **Mobile Navigation**: Collapsible menu for smaller screens

## Page Wireframes

### Welcome/Login Page

- App logo and tagline "Transform Your Body. Transform Your Life."
- Login form or continue as guest option
- Brief value proposition highlighting scientific approach
- Onboarding modal for first-time users with 4-step introduction

### User Data Collection (Stage 1)

**Layout Elements:**
- Form with labeled input fields:
  - Age (number input)
  - Gender (radio buttons: male/female)
  - Height (number input with cm unit)
  - Current Weight (number input with kg unit)
  - Activity Level (dropdown menu)
- Calculate BMR button
- Results card displaying calculated BMR
- Next button to proceed to Stage 2

### Weight Loss Goals (Stage 2)

**Layout Elements:**
- Current stats summary (weight, BMR, etc.)
- Form for goal inputs:
  - Target Weight (number input with kg unit)
  - Time Frame (slider or dropdown for weeks)
  - Weight Lifting Sessions (1-5, dropdown)
  - Cardio Sessions (0-7, dropdown)
  - Steps per Day (input with default 10,000)
- Dynamic calculation display:
  - Total weight loss target
  - Weekly rate (kg/week)
  - Total deficit needed
  - Daily food intake recommendation
- Warning alert (if deficit exceeds 1000 calories)
- Calculate Plan & Continue button

### View Plan (Stage 3)

**Layout Elements:**
- Plan overview card with summary statistics
- Nutrition table:
  - Total daily calories
  - Protein (g and %)
  - Fats (g and %)
  - Carbs (g and %)
- Training schedule card:
  - Weight training days
  - Cardio sessions
  - Daily step goal
- Tips and recommendations section
- Edit Plan button
- Start Tracking button to proceed to Daily Log

### Daily Log (Stage 4)

**Layout Elements:**
- Date selector (defaulted to current date)
- Body measurements section:
  - Weight input (required)
  - Fat % input (optional)
  - Muscle % input (optional)
- Calories In section:
  - Macros input fields (protein, fats, carbs)
  - Calculate button
  - Total calories display with macro percentages
- Calories Out section:
  - Steps input
  - Weight lifting duration/intensity
  - Cardio duration/intensity
  - BMR display (auto-filled)
  - Total calories out calculation
- Summary section:
  - Daily deficit display
  - Progress toward goal visualization
- Save button
- View History link

### Body Stats (Stage 5)

**Layout Elements:**
- Date range selector
- Graph/chart display showing:
  - Weight trend line
  - Body fat % line (if available)
  - Muscle mass line (if available)
- Data table with daily entries
- Statistics panel showing:
  - Total weight lost
  - Weekly average change
  - Projected goal date
- Reset graph button
- Export data option

### Dashboard

**Layout Elements:**
- Progress overview card:
  - Starting weight
  - Current weight
  - Goal weight
  - Progress percentage
- Quick action buttons:
  - Log today's progress
  - View body stats
  - Adjust plan
  - View nutrition guide
- Recent logs summary
- Motivational section with tip of the day

## Common UI Elements

- **Cards**: Contain related information with clear headers
- **Buttons**: Large, touch-friendly with consistent green/gray color scheme
- **Inputs**: Clearly labeled with appropriate validation
- **Charts**: Clean, responsive visualizations of progress data
- **Alerts**: Color-coded for information, warnings, or success messages
- **Icons**: Used consistently to represent concepts (food, exercise, measurements)

## Responsive Considerations

- Single column layout on mobile devices
- Multi-column grid on tablets and desktops
- Collapsible sections for complex forms
- Touch-optimized inputs and controls
- Accessible font sizes and contrast ratios
