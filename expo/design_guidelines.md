# FitSync AI - Design Guidelines

## 1. Brand Identity

**Purpose**: An AI-powered hypertrophy coaching system that analyzes physique photos, lifting form videos, and training data to continuously optimize programs, macros, and technique.

**Aesthetic Direction**: Bold scientific confidence

- High-contrast, data-driven design that feels clinical yet motivating
- Sharp edges, clear hierarchy, trust-building precision
- Think: Tesla dashboard meets medical app - authoritative but not sterile
- Memorable element: Animated muscle heatmaps that visualize progress with scientific accuracy

**User Profile**: Serious lifters (intermediate to advanced) who want AI-driven optimization, not cheerleading.

## 2. Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs)

- **Home** (Dashboard)
- **Train** (Program & Session Logging)
- **Physique** (Photo Analysis & Progress)
- **Nutrition** (Macros & Food Logging)

**Floating Action Button**: Camera icon (positioned above tab bar center) - Quick access to upload form video or physique photo

**Modal Screens**: Onboarding flow, Weekly Update ritual, Settings

## 3. Screen Specifications

### Onboarding Flow (Modal Stack)

**Welcome Screen**

- Layout: Centered logo, tagline, auth buttons
- Components: Apple/Google SSO buttons, legal links
- Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

**Stats Input Screen**

- Layout: Scrollable form with header
- Header: Back button (left), "Skip" (right, disabled on first launch)
- Components: Text fields (Height, Weight, Age), segmented control (Goal: Cut/Bulk/Recomp), Submit button below form
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Initial Photos Screen**

- Layout: Camera overlay with pose guides, 3 capture zones (front/side/back)
- Header: Progress indicator (Step 3/4), Cancel (left)
- Components: Silhouette overlay, capture buttons per angle, Skip button (subtle)
- Safe area: top = headerHeight + Spacing.xl, bottom = insets.bottom + Spacing.xl

### Home Tab

**Dashboard Screen**

- Layout: Scrollable content, transparent header
- Header: Date (title), Settings icon (right)
- Components:
  - Hero card: "Today's Training" with muscle group, exercise count
  - Macro rings (circular progress: Protein/Fat/Carbs)
  - Weight trend line chart (7-day)
  - Recovery score tile with emoji indicator
  - Coach notes card (AI-generated insight)
  - Photo reminder badge (if due)
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

### Train Tab

**Program Overview Screen**

- Layout: Scrollable, transparent header
- Header: "Program" (title), Calendar icon (right)
- Components:
  - Weekly calendar grid (M-S), each day card shows muscle group + volume
  - Volume distribution pie chart
  - RIR target legend
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Training Session Screen** (pushed from Program Overview)

- Layout: Scrollable list, default header
- Header: Back (left), "Finish" (right, disabled until all sets logged)
- Components:
  - Exercise cards: name, sets x reps, target RIR, tempo cue, "Upload Form" icon
  - Per-set input: weight, reps, RIR selector (1-4 buttons), rest timer
  - Notes field (collapsible)
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Form Analysis Screen** (modal from session or floating button)

- Layout: Video player, scrollable results
- Header: Close (left), "How to Film" (right)
- Components: Exercise picker, upload button, after analysis: rep score, cue list, bar path visualization, hot reps highlight
- Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

### Physique Tab

**Photo History Screen**

- Layout: Grid of weekly photos, transparent header
- Header: "Progress" (title), Compare icon (right)
- Components: Photo grid (tap to view), slider compare mode, metric delta cards
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Symmetry Map Screen** (pushed from Photo History)

- Layout: Scrollable, default header
- Header: Back (left), "Export" (right)
- Components: Body diagram with L/R % differences, suggested fix cards, set allocation table
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Weekly Update Flow** (modal, triggered weekly)

- Photo capture screen (same as onboarding)
- Results screen: muscle heatmap, delta list, posture flags, "Top 3 Changes" card, "Apply Program" button

### Nutrition Tab

**Macro Dashboard Screen**

- Layout: Scrollable, transparent header
- Header: "Nutrition" (title), History icon (right)
- Components: Macro ring chart, calorie counter, protein/fat/carb bars, "Next Week Preview" card
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Log Food Screen** (modal from floating button on Nutrition tab)

- Layout: Scrollable list with search
- Header: Close (left), "Add" (right)
- Components: Quick-add buttons (protein/carb/fat sources), favorites list, manual entry form
- Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

### Daily Check-In Screen (modal, triggered daily)

- Layout: Scrollable form
- Header: Close (left)
- Components: Sleep slider, stress slider (1-7), soreness body map (tap segments), weight input, notes field, Submit button
- Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

### Supplement/Compound Info Screen (pushed from Settings)

- Layout: Scrollable, default header
- Header: Back (left), "Disclaimer" (right)
- Components:
  - WARNING banner: "AI-generated educational content. Not medical advice."
  - User profile summary card (age, build, experience level)
  - Compound cards: name, dosage ranges, cycle length, benefits, risks
  - "Learn More" links to educational resources
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

## 4. Color Palette

- **Primary**: #FF4500 (Vibrant orange-red, energetic and bold)
- **Background**: #0A0A0A (Near-black, depth)
- **Surface**: #1C1C1E (Dark gray cards)
- **Surface Elevated**: #2C2C2E (Lighter overlays)
- **Text Primary**: #FFFFFF
- **Text Secondary**: #ABABAB
- **Success**: #00D084 (Gains green)
- **Warning**: #FFB800 (Form correction yellow)
- **Error**: #FF3B30
- **Chart Colors**: [#FF4500, #00D084, #4A90E2, #F5A623, #BD10E0] (high contrast)

## 5. Typography

- **Primary Font**: System (SF Pro on iOS)
- **Type Scale**:
  - H1: 34pt Bold (screen titles)
  - H2: 28pt Bold (section headers)
  - H3: 20pt Semibold (card titles)
  - Body: 16pt Regular
  - Caption: 13pt Regular (metadata)
  - Data: 24pt Mono Semibold (weight, macros, metrics)

## 6. Assets to Generate

**App Icon** (icon.png): Stylized muscle fiber pattern in orange-red gradient, sharp geometric edges. WHERE USED: Device home screen.

**Splash Icon** (splash-icon.png): Same muscle fiber icon on dark background. WHERE USED: App launch.

**Empty States**:

- empty-program.png: Clipboard with checkmarks, minimal line art. WHERE USED: Program Overview (before first program generated).
- empty-photos.png: Camera outline with dotted frame. WHERE USED: Physique tab (no photos yet).
- empty-nutrition.png: Plate with fork/knife outline. WHERE USED: Food log (no entries).

**Pose Guide Silhouettes**:

- pose-front.png, pose-side.png, pose-back.png: Human silhouette outlines for photo alignment. WHERE USED: Photo capture overlays.

**Default Avatar** (avatar-default.png): Abstract muscular torso silhouette. WHERE USED: Profile/Settings screen.

**Muscle Heatmap Asset** (muscle-diagram.png): Anatomical muscle group diagram (front/back views). WHERE USED: Weekly Update results, Symmetry Map.
