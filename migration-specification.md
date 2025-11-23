# TaskLoom Migration Specification
## Complete Feature Specification for Native macOS/iOS Migration

**Document Version:** 1.0
**Created:** 2025-10-12
**Purpose:** Comprehensive feature specification for migrating the TaskLoom web prototype to native Swift applications

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Complete Data Model](#complete-data-model)
3. [Feature Inventory by Module](#feature-inventory-by-module)
4. [User Workflows](#user-workflows)
5. [Business Logic & Rules](#business-logic--rules)
6. [Gamification System](#gamification-system)
7. [Spaced Repetition System (SM-2)](#spaced-repetition-system-sm-2)
8. [AI Integration Points](#ai-integration-points)
9. [Data Persistence Requirements](#data-persistence-requirements)
10. [Edge Cases & Special Behaviors](#edge-cases--special-behaviors)

---

## Application Overview

TaskLoom is a comprehensive study planner and productivity application designed for students (GCSE, A-Levels, University). It combines task management, schedule planning, focus sessions with Pomodoro timers, flashcard-based spaced repetition, and gamification elements to help students manage their academic workload effectively.

### Core Value Propositions

1. **Unified Study Management** - All study-related activities in one place
2. **AI-Assisted Planning** - Smart suggestions for schedules and topic generation
3. **Spaced Repetition Learning** - Scientific approach to flashcard review using SM-2 algorithm
4. **Gamification** - XP, levels, achievements, and social competition to maintain motivation
5. **Focus-Oriented** - Pomodoro timer integration with session tracking
6. **Progress Tracking** - Comprehensive analytics on study habits and performance

### Target Users

- **Primary:** GCSE students (ages 14-16)
- **Secondary:** A-Level students (ages 16-18)
- **Tertiary:** University students
- **Other:** Self-learners and lifelong learners

---

## Complete Data Model

### User

```
User {
  id: String (UUID)
  name: String
  email: String
  educationStage: 'gcse' | 'alevels' | 'university' | 'other'
  totalXP: Number (default: 0)
  level: Number (default: 0, calculated from totalXP)
  createdAt: Date
}
```

**Business Rules:**
- Single user per app instance (local-first application)
- Level calculated as: floor(sqrt(totalXP / 100))
- XP accumulates from: tasks completed, study sessions, flashcard reviews, streak bonuses

---

### Subject

```
Subject {
  id: String (UUID)
  name: String
  color: String (hex color)
  emoji: String? (optional single emoji)
  examBoard: String? (e.g., "AQA", "Edexcel", "OCR")
  decoration: 'shimmer' | 'emoji-drift'? (visual effect type)
  decorationEmoji: String? (emoji for drift decoration)
  gradientHue: Number? (0-360, HSL hue for gradient coloring)
  createdAt: Date
}
```

**Business Rules:**
- Subject names must be unique per user
- Default color assigned cyclically from predefined palette if not specified
- Subjects can be customized with emojis and visual decorations
- Deleting a subject cascades to delete all associated exams, topics, and resources

---

### Exam

```
Exam {
  id: String (UUID)
  subjectId: String (FK to Subject)
  name: String
  date: Date
  time: String? (HH:mm format, optional)
  createdAt: Date
}
```

**Business Rules:**
- Exams are associated with exactly one subject
- Exams are displayed as "Upcoming" or "Completed" based on current date/time
- Live countdown displayed for upcoming exams
- Completed exams can be bulk-deleted or individually deleted

---

### Topic

```
Topic {
  id: String (UUID)
  subjectId: String (FK to Subject)
  name: String
  group: String? (optional grouping/category)
  parentTopicId: String? (FK to Topic, for nested subtopics)
  order: Number? (display order within parent or subject)
  lastReviewed: Date? (automatically updated when covered in focus session)
  confidence: 'not-started' | 'struggling' | 'moderate' | 'confident' | 'mastered'?
  createdAt: Date
}
```

**Business Rules:**
- Topics can be nested (parent-child relationship via parentTopicId)
- Topics can be grouped (e.g., "Algebra", "Geometry" within Math subject)
- Confidence level manually set by user
- lastReviewed automatically updated when topic is covered in a focus session
- Supports bulk operations (multi-select delete)
- Supports AI-generated topic lists based on subject name
- Search functionality across topic names and groups

---

### Resource

```
Resource {
  id: String (UUID)
  subjectId: String (FK to Subject)
  name: String
  type: 'link' | 'file' | 'note' | 'folder'
  url: String? (for links and files)
  content: String? (for notes)
  parentFolderId: String? (FK to Resource where type='folder')
  createdAt: Date
}
```

**Business Rules:**
- Resources are organized in a folder hierarchy (parentFolderId)
- Folders can contain other resources
- Links and files have URLs, notes have content
- Breadcrumb navigation for folder hierarchy
- Sortable by name, type, or date
- Resources accessible during focus sessions if subject selected

---

### Task

```
Task {
  id: String (UUID)
  title: String
  description: String?
  subjectId: String? (FK to Subject)
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
  dueDate: Date?
  estimatedMinutes: Number?
  completedAt: Date? (set when status changes to completed)
  createdAt: Date
}
```

**Business Rules:**
- Tasks can be associated with a subject (optional)
- Priority affects XP rewards (high=50, medium=25, low=10)
- Completing a task awards XP and updates daily goal
- Tasks can be filtered by status and subject
- Tasks track total focus time across all sessions
- Due date shown in "Due Soon" section (next 7 days)
- Overdue tasks highlighted

**XP Awards:**
- Low priority: 10 XP
- Medium priority: 25 XP
- High priority: 50 XP

---

### StudyBlock

```
StudyBlock {
  id: String (UUID)
  title: String
  date: Date
  startTime: String (HH:mm format)
  endTime: String (HH:mm format)
  subjectId: String? (FK to Subject)
  taskIds: String[] (array of Task IDs)
  completed: Boolean
  createdAt: Date
}
```

**Business Rules:**
- Study blocks represent planned study time on calendar
- Can be associated with a subject and linked to multiple tasks
- Duration calculated from startTime and endTime
- Displayed in weekly calendar view (7-day rolling window)
- Can be created manually or via AI suggestion
- Multi-select mode for bulk deletion
- Editable in-place

---

### FocusSession

```
FocusSession {
  id: String (UUID)
  taskId: String? (FK to Task)
  subjectId: String? (FK to Subject)
  topicIds: String[] (array of Topic IDs)
  startTime: Date
  endTime: Date?
  durationMinutes: Number (actual duration)
  notes: String?
  pomodoroCount: Number (number of completed pomodoros)
  completed: Boolean
  createdAt: Date
}
```

**Business Rules:**
- Focus sessions use Pomodoro technique (default: 25min work, 5min short break, 15min long break)
- Every N pomodoros (default: 4) triggers long break instead of short break
- Completing session awards XP based on duration (5 XP per minute)
- Completing session updates topic lastReviewed dates
- Completing session updates daily goal progress
- Completing session triggers streak bonus if applicable
- Completing session triggers achievement checks
- Can mark task as completed upon finishing session
- Timer states: idle, work, shortBreak, longBreak
- Timer can be paused, resumed, or skipped
- Resources accessible during session if subject selected

**XP Awards:**
- 5 XP per minute of focus time
- Streak bonus: 25 XP if current streak > 0

---

### WeeklyReview

```
WeeklyReview {
  id: String (UUID)
  weekStart: Date (normalized to Monday 00:00)
  weekEnd: Date (normalized to Sunday 23:59)
  totalMinutes: Number
  sessionsCompleted: Number
  deadlinesMet: Number
  deadlinesMissed: Number
  wentWell: String (user input)
  needsAttention: String (user input)
  topPriority: String (user input)
  aiSummary: String (AI-generated summary)
  createdAt: Date
}
```

**Business Rules:**
- One review per week, identified by weekStart date
- Week starts on Monday
- AI summary generated from session data, task completion, and topic review patterns
- Reviews are manually created by user (not auto-generated)

**Note:** Weekly Review feature is marked as "Coming Soon" in current prototype

---

### AppSettings

```
AppSettings {
  pomodoroDuration: Number (minutes, default: 25)
  shortBreakDuration: Number (minutes, default: 5)
  longBreakDuration: Number (minutes, default: 15)
  pomodorosUntilLongBreak: Number (default: 4)
  whiteNoiseEnabled: Boolean (default: false)
  whiteNoiseType: 'rain' | 'cafe' | 'nature' | 'none' (default: 'none')
}
```

**Business Rules:**
- Single settings object per app (ID: 'default')
- Settings persist across sessions
- Settings affect all future focus sessions

---

## Flashcard System

### Deck

```
Deck {
  id: String (UUID)
  name: String
  description: String?
  color: String? (hex color for visual distinction)
  parentDeckId: String? (FK to Deck, for nested subdecks)
  subjectId: String? (FK to Subject)
  topicId: String? (FK to Topic)
  order: Number? (display order)
  createdAt: Date
}
```

**Business Rules:**
- Decks can be nested (parent-child relationship)
- Decks can be associated with subjects and topics
- Color helps visually distinguish decks
- Deleting deck cascades to delete all flashcards in deck (and subdecks)
- Statistics calculated: total cards, due cards, new cards

---

### Flashcard

```
Flashcard {
  id: String (UUID)
  deckId: String (FK to Deck)
  front: String (question/prompt)
  back: String (answer/explanation)
  easeFactor: Number (SM-2 ease factor, default: 2.5)
  interval: Number (days until next review, default: 0)
  repetitions: Number (successful repetitions count, default: 0)
  nextReviewDate: Date (calculated by SM-2)
  lastReviewedAt: Date?
  suspended: Boolean (cards can be temporarily suspended, default: false)
  createdAt: Date
}
```

**Business Rules:**
- Uses SM-2 spaced repetition algorithm
- Cards "due" when nextReviewDate <= today
- Suspended cards excluded from due count and study sessions
- Supports bulk operations (add multiple cards)
- Review updates SM-2 parameters and schedules next review

---

### FlashcardReview

```
FlashcardReview {
  id: String (UUID)
  flashcardId: String (FK to Flashcard)
  deckId: String (FK to Deck)
  difficulty: 'again' | 'hard' | 'good' | 'easy'
  previousEaseFactor: Number
  newEaseFactor: Number
  previousInterval: Number
  newInterval: Number
  reviewedAt: Date
}
```

**Business Rules:**
- Tracks every flashcard review for analytics
- Stores before/after SM-2 parameters for review history
- Reviewing a card awards XP (5 XP per card)
- Reviewing updates daily goal progress
- Difficulty mapping for SM-2:
  - again: quality 0 (complete failure)
  - hard: quality 3 (difficult recall)
  - good: quality 4 (moderate recall)
  - easy: quality 5 (perfect recall)

**XP Awards:**
- 5 XP per flashcard reviewed

---

## Gamification System

### XPEvent

```
XPEvent {
  id: String (UUID)
  type: 'task-completed' | 'study-session' | 'flashcard-reviewed' | 'streak-bonus'
  amount: Number (XP awarded)
  description: String
  createdAt: Date
}
```

**Business Rules:**
- Every XP award creates an event for tracking
- Events used for analytics and leaderboards
- User's totalXP is sum of all XP events
- Level recalculated whenever XP changes

---

### UnlockedAchievement

```
UnlockedAchievement {
  id: String (UUID)
  achievementId: AchievementId (see below)
  unlockedAt: Date
}
```

**Available Achievements:**

```
AchievementId:
  - 'first-session': Complete your first focus session (🎯)
  - 'streak-5': Study for 5 consecutive days (🔥)
  - 'streak-10': Study for 10 consecutive days (💪)
  - 'streak-30': Study for 30 consecutive days (⭐)
  - 'weekly-10h': Study for 10 hours in a single week (📚)
  - 'weekly-20h': Study for 20 hours in a single week (🚀)
  - 'total-50h': Accumulate 50 hours of total study time (🏆)
  - 'total-100h': Accumulate 100 hours of total study time (👑)
  - 'early-bird': Complete a study session before 8am (🌅)
  - 'night-owl': Complete a study session after 10pm (🦉)
  - 'task-master': Complete 50 tasks (✅)
  - 'flashcard-pro': Review 500 flashcards (🎴)
```

**Business Rules:**
- Achievements checked after every task completion, session end, or flashcard review
- Once unlocked, achievement persists forever
- Toast notification shown when achievement unlocked
- Achievements categorized: session, streak, time, task, flashcard

---

### DailyGoal

```
DailyGoal {
  id: String (UUID)
  date: Date (normalized to start of day)
  studyMinutesGoal: Number (default: 120)
  studyMinutesActual: Number (default: 0)
  tasksCompletedGoal: Number (default: 3)
  tasksCompletedActual: Number (default: 0)
  flashcardsReviewedGoal: Number (default: 20)
  flashcardsReviewedActual: Number (default: 0)
  completed: Boolean (true when all goals met)
  createdAt: Date
}
```

**Business Rules:**
- One goal per day, identified by normalized date
- Auto-created on first access each day with default goals
- Updated automatically when tasks completed, sessions finished, flashcards reviewed
- Goal marked as completed when all three metrics meet or exceed goals
- Default goals: 120 min study, 3 tasks, 20 flashcards

---

## Feature Inventory by Module

### 1. Authentication & Onboarding

#### Landing Page
- **Marketing content display**
  - Hero section with app tagline
  - Feature cards showcasing 5 main modules (Overview, Planner, Subjects, Focus, Review)
  - 4-step workflow explanation
  - AI features highlight section
  - Pricing tiers (Free vs Pro)
  - Final CTA section
  - Footer with branding
- **Navigation**
  - Sign In button
  - Sign Up button

#### Sign Up
- **Form fields:**
  - Full Name (text input, required)
  - Email (email input, required)
  - Education Stage (dropdown: GCSE, A-Levels, University, Other, required)
  - Password (password input, required, min 8 chars)
  - Terms & Privacy checkbox (required)
- **Social sign-up buttons:**
  - Google OAuth
  - Apple OAuth
- **Validation:**
  - Client-side validation for all fields
  - Password strength requirement (8+ characters, letters + numbers)
- **Navigation:**
  - Link to Sign In if user has account
  - Back to Landing button

#### Sign In
- **Form fields:**
  - Email (email input, required)
  - Password (password input, required)
- **Social sign-in buttons:**
  - Google OAuth
  - Apple OAuth
- **Features:**
  - Remember me option
  - Forgot password link
- **Navigation:**
  - Link to Sign Up if no account
  - Back to Landing button

**Note:** Current prototype uses mock authentication (navigates directly to Overview)

---

### 2. Overview (Dashboard)

**Purpose:** Central command center showing today's schedule, stats, and quick access to all features

#### Header
- **Personalized greeting** based on time of day:
  - 0-5am: "Hello night owl 🦉"
  - 5am-12pm: "Good morning, [Name] ☀️"
  - 12pm-5pm: "Good afternoon, [Name] 👋"
  - 5pm-9pm: "Good evening, [Name] 🌆"
  - 9pm+: "Burning the midnight oil? 🌙"
- **Current date** in long format (e.g., "Wednesday, October 12, 2025")

#### Stats Row (3 Cards)
1. **Current Streak**
   - Display: days count
   - Icon: 🔥
   - Updates: after each completed focus session

2. **This Week**
   - Display: formatted duration (e.g., "12h 30m")
   - Icon: ⏱️
   - Week defined: Monday-Sunday

3. **Tasks Today**
   - Display: count of pending tasks due today
   - Icon: 📝
   - Updates: real-time as tasks completed

#### Main Content Grid

**Today's Schedule (Left, 2/3 width)**
- **Timeline view** (6 AM - 11 PM)
  - Time markers on left (hourly)
  - Vertical line indicating current hour (highlighted)
  - Study blocks shown in corresponding time slots
  - Auto-scroll to current time on load
- **Each study block shows:**
  - Title
  - Subject name (if associated)
  - Time range (start - end)
  - Completion checkmark if done
  - Subject-colored accent bar
- **Empty state:**
  - Message: "No study blocks scheduled for today"
  - CTA button: "Plan Your Day" (links to Planner)
- **Header:**
  - "Today's Schedule" heading
  - "View Planner" link

**Due Soon (Right, 1/3 width)**
- **List of tasks due in next 7 days** (excluding today)
  - Maximum 5 tasks shown
  - Sorted by due date (earliest first)
- **Each task shows:**
  - Priority indicator (colored dot: red=high, yellow=medium, green=low)
  - Task title
  - Subject name (if associated)
  - Days until due (e.g., "in 3 days", "Tomorrow", "Today")
  - Urgent styling if due in ≤2 days (red background)
- **Empty state:**
  - Message: "All caught up! 🎉"
- **Footer:**
  - "+ Add New Task" button (dashed border)

#### Quick Actions (4 Cards)
1. **Plan Week** → Navigate to Planner
   - Icon: 📝
   - Description: "Organize your schedule"

2. **Manage Subjects** → Navigate to Subjects
   - Icon: 📚
   - Description: "Topics, exams, resources"

3. **Focus Session** → Navigate to Focus
   - Icon: 🎯
   - Description: "Deep work mode"

4. **Weekly Review** → Navigate to Review
   - Icon: 📈
   - Description: "Track your progress"

**Interactions:**
- All cards have hover scale effect
- Click on study block does nothing (display only)
- Quick action cards navigate on click

---

### 3. Subjects Management

**Purpose:** Organize subjects, exams, topics, and learning resources

#### Subject List View (Default)

**Header:**
- Title: "Subjects"
- Description: "Manage your subjects and study materials"
- "+ Add Subject" button

**Subject Grid:**
- **Visual card per subject** with:
  - Gradient background (based on subject.gradientHue)
  - Optional emoji icon (large, top-left)
  - Subject name (large, bold)
  - Exam board (small, gray, if present)
  - Visual decoration effect (shimmer or emoji-drift)
  - Metadata: "X exams • Y topics"
  - Edit button (appears on hover)
  - Click to view subject details
- **Empty state:**
  - Large emoji: 📚
  - Message: "No subjects yet"
  - Description: "Add your first subject to get started"
  - "+ Add Subject" button

**Add/Edit Subject Modal:**
- **Fields:**
  - Subject Name (text, required)
  - Exam Board (text, optional, e.g., "AQA", "Edexcel")
  - Emoji (emoji picker)
  - Gradient Color (8 preset color options)
- **Color presets** (hue values):
  - Teal (180°), Blue (220°), Purple (280°), Pink (320°)
  - Red (0°), Orange (30°), Yellow (50°), Green (140°)
- **Actions:**
  - "Add Subject" / "Save Changes" button
  - "Cancel" button

---

#### Subject Detail View

**Header:**
- Back arrow (return to subject list)
- Subject emoji (large)
- Subject name (heading)
- Exam board (subheading, if present)
- "Delete Subject" button (red, destructive)

**Tab Navigation:**
1. Exams
2. Topics
3. Resources

**Tab: Exams**

- **"+ Add" button** in header

**Upcoming Exams Section:**
- Grid of exam cards (3 columns)
- **Each exam card shows:**
  - Exam name
  - Date and time (if specified)
  - Live countdown timer (e.g., "5d 12h 30m" or "3h 45m 20s")
  - Delete button (🗑)
- **Empty state:** "No exams yet"

**Completed Exams Section:**
- Heading: "Completed"
- "Clear All" button
- Grid of exam cards (grayed out, 60% opacity)
- **Each exam card shows:**
  - Exam name
  - Date and time
  - Green checkmark: "✓ Completed"
  - Delete button (🗑)

**Add Exam Modal:**
- **Fields:**
  - Exam Name (text, required, e.g., "Paper 1")
  - Date (date picker, required)
  - Time (time picker, optional, HH:mm format)
- **Actions:**
  - "Add Exam" button
  - "Cancel" button

**Tab: Topics**

- **Header actions:**
  - Search bar (filters topics by name and group)
  - AI Generate button ("✨ AI Generate")
  - "+ Add" button
  - Delete [N] button (when topics selected)

**Search Functionality:**
- **Real-time filtering** as user types
- **Dropdown suggestions** (max 10) showing:
  - Confidence indicator (colored dot)
  - Topic name
  - Group (if present)
- **Click suggestion** to scroll to topic and highlight it (2-second ring effect)
- **Enter key** when 1 match: auto-scroll to that topic

**Progress Legend:**
- Confidence levels with colored indicators:
  - Not Started (gray) - count
  - Struggling (red) - count
  - Moderate (amber) - count
  - Confident (blue) - count
  - Mastered (green) - count

**Group Filter:**
- Tabs for: "All", [Custom groups from topics]
- Click to filter topics by group

**Topic List:**
- Scrollable container with topics
- **Each topic row shows:**
  - Checkbox (for multi-select)
  - Expand/collapse arrow (if has subtopics)
  - Topic name
  - Group badge (if present)
  - Confidence dropdown (changes color based on level)
  - "+ Add Subtopic" button
- **Subtopics** (nested, indented):
  - Checkbox
  - Topic name
  - Confidence dropdown
  - (No add subtopic button for 2nd level)
- **Multi-select mode:**
  - Select checkboxes for multiple topics
  - "Delete [N]" button appears
  - Bulk delete confirmation modal

**Add/Edit Topic Modal:**
- **Fields:**
  - Topic Name (text, required)
  - Group (text, optional, only for parent topics)
  - Parent indicator (shows parent topic name if adding subtopic)
- **Actions:**
  - "Add Topic" button
  - "Cancel" button

**AI Topic Generation:**
- Click "✨ AI Generate"
- Loading state: "Generating..."
- AI generates topic list based on subject name
- Topics bulk-added to subject
- (Current implementation uses mock data, not real AI)

**Delete Topics Confirmation:**
- Modal confirms deletion of N topics
- Warns: cannot be undone
- "Delete" and "Cancel" buttons

**Tab: Resources**

- **Header actions:**
  - Sort dropdown (name, type, date)
  - "📁 Folder" button (create folder)
  - "+ Add" button (add resource)

**Breadcrumb Navigation:**
- Shows current folder path
- Click any folder in path to navigate
- Root: "📚 Resources"

**Resource Grid:**
- 3-column grid of resource cards
- **Each resource shows:**
  - Icon based on type: 📁 folder, 🔗 link, 📄 file, 📝 note
  - Resource name
  - Resource type (if not folder)
  - URL link (for links, clickable)
  - Delete button (🗑)
- **Folder interaction:**
  - Click folder to navigate into it
- **Empty state:**
  - "No resources yet" or "This folder is empty"

**Add Resource Modal:**
- **Fields:**
  - Resource Name (text, required)
  - Type dropdown (link, file, note) - only if not creating folder
  - URL (text, optional)
  - Current folder indicator (if in subfolder)
- **Actions:**
  - "Add Resource" / "Create Folder" button
  - "Cancel" button

**Delete Resource Confirmation:**
- Modal confirms deletion
- "Delete" and "Cancel" buttons

**Delete Subject Confirmation:**
- Modal warns: deletes ALL exams, topics, and resources
- "Delete" and "Cancel" buttons

---

### 4. Tasks

**Purpose:** Manage all tasks and assignments

#### Layout
- **Split view:** 50% task list | 50% task details

#### Left: Task List

**Filter Tabs:**
- "To Do" (pending tasks)
- "Completed" (completed tasks)

**Subject Filter:**
- Dropdown: "All Subjects" or specific subject

**Task List:**
- **Each task card shows:**
  - Priority bar (colored vertical line: red/yellow/blue)
  - Checkbox (toggles completion)
  - Task title (strikethrough if completed)
  - Subject name (if associated)
  - Due date with calendar icon (if present)
  - Selected state (highlighted background)
- **Click task** to select and show details
- **Empty state:**
  - Large emoji: 📝
  - Message: "No tasks yet"
  - Description: "Create your first task to get started"

**Header:**
- "+ Add Task" button

#### Right: Task Details

**When task selected:**

**Fields (editable on blur):**
- **Title** (text input)
- **Description** (textarea, multiline)
- **Subject** (dropdown, nullable)
- **Due Date** (date picker, nullable)
- **Priority** (dropdown: low/medium/high)
- **Total Focus Time** (read-only, calculated)
  - Sum of all focus session durations for this task

**Actions:**
- "Delete Task" button (red, bottom)

**When completed:**
- All fields disabled (grayed out)
- Cannot edit completed tasks

**When no task selected:**
- Empty state:
  - Large emoji: 👈
  - Message: "Select a task to view details"

**Delete Task Confirmation:**
- Modal confirms deletion of "[Task Title]"
- "Delete" and "Cancel" buttons

**Add Task:**
- Creates "New Task" with default values
- Auto-selects it and shows details
- User edits in place

---

### 5. Planner

**Purpose:** Weekly calendar-based study planning

#### Header
- Title: "Weekly Planner"
- Date range: "MMM d - MMM d, yyyy"
- "✨ Suggest Plan" button

#### Today's Schedule Section
- **Header:**
  - "Today's Schedule" heading
  - "Select Multiple" button (or "Delete (N)" / "Cancel" when in multi-select mode)
- **Block list:**
  - All blocks for current day, sorted by time
  - **Each block shows:**
    - Subject-colored accent bar
    - Block title
    - Subject name (if associated)
    - Time range
    - Duration in minutes
    - "✓ Done" if completed
    - "⋯" menu button (opens block details)
  - **Multi-select mode:**
    - Checkbox for each block
    - Click to toggle selection
    - "Delete (N)" button deletes all selected
- **Empty state:**
  - Message: "No blocks scheduled for today"

#### Week Navigation
- "← Previous 7 Days" button
- "Today" button (resets to current week)
- "Next 7 Days →" button

#### Weekly Grid (7 columns)
- **Each day column shows:**
  - Day name (e.g., "Mon")
  - Day number (e.g., "12")
  - Current day highlighted (white border)
  - Scrollable block container (max 3 visible)
  - **Each block:**
    - Subject-colored background (20% opacity)
    - Subject-colored border (40% opacity)
    - Block title
    - Time range
    - Duration
    - "⋯" menu button
  - **"+N more" button** if >3 blocks
  - **"+ Add Block" button** at bottom (dashed border)

**Add Study Block Modal:**
- **Fields:**
  - Block Title (text, required)
  - Selected date (read-only, shown as "Day, Month Date")
  - Start Time (time picker, HH:mm)
  - End Time (time picker, HH:mm)
  - Subject (dropdown, nullable)
- **Actions:**
  - "Add Block" button
  - "Cancel" button

**Edit Study Block Modal (Block Details):**
- **Fields:**
  - Title (text)
  - Date (read-only display)
  - Start Time (time picker)
  - End Time (time picker)
  - Subject (dropdown)
- **Actions:**
  - "Save Changes" button (blue, shown when edited)
  - "Delete" button (red)
  - "Close" button

**View More Modal:**
- Shows all blocks for a specific day
- Day name and date as heading
- List of all blocks (same styling as weekly grid)
- Each block's "⋯" menu opens block details
- "Close" button at bottom

**AI Suggest Plan:**
- Click "✨ Suggest Plan"
- Loading state: "✨ Generating..."
- AI analyzes pending tasks and suggests study blocks across the week
- Suggestions added to calendar
- (Current implementation uses mock AI with predefined time slots)

**Multi-Delete Confirmation:**
- No modal, deletes immediately

---

### 6. Focus Mode

**Purpose:** Pomodoro-based deep work sessions with resource access and note-taking

#### Header
- Title: "Focus Mode"
- Description: "Pomodoro-style deep work sessions"

#### Layout
- **Left (2/3 width):** Timer and notes
- **Right (1/3 width):** Context selection and resources

#### Timer Section

**Timer Display:**
- **State indicator** (text above timer):
  - "Ready to Start" (idle)
  - "Focus Time" (work)
  - "Short Break" (short break)
  - "Long Break" (long break)
- **Large time display** (MM:SS format)
  - Scales slightly while running (pulse animation)
- **Animated dot loader** (Pong game visualization)
  - Active when timer running
  - Paused when timer paused/idle
- **Progress bar** (white line, fills left to right)
  - Shows time remaining
- **Pomodoro count:** "×N Pomodoros"

**Timer Controls:**
- **When idle:**
  - "Start Focus" button (or "Continue Session" if pomodoros > 0)
- **When running:**
  - "⏸ Pause" button
  - "⏭ Skip" button (completes current phase immediately)
- **When paused:**
  - "▶ Resume" button
- **When session has pomodoros:**
  - "✓ Complete Session" button (green)
  - "✕ Reset" button (red)

**Pomodoro Logic:**
- Work phase: [pomodoroDuration] minutes (default: 25)
- After work phase completes:
  - Increment pomodoro count
  - If count % pomodorosUntilLongBreak == 0: Start long break
  - Else: Start short break
- Short break: [shortBreakDuration] minutes (default: 5)
- Long break: [longBreakDuration] minutes (default: 15)
- After break completes: Return to idle, ready for next work phase
- Timer can be paused, resumed, or skipped at any time

**Complete Session:**
- Creates FocusSession record with:
  - Selected task (if any)
  - Selected subject (if any)
  - Selected topics (array)
  - Start time (session start)
  - End time (current time)
  - Duration (pomodoros × pomodoroDuration)
  - Notes
  - Pomodoro count
  - completed: true
- Awards XP (5 XP per minute)
- Updates topic lastReviewed dates (all selected topics)
- If task selected and user confirms: mark task as completed
- Updates daily goal
- Checks for streak bonus
- Checks for achievements
- Resets all session state

**Reset Session:**
- Clears all session data
- Returns to idle state
- No data saved

**Session Notes:**
- Multiline textarea
- Placeholder: "Jot down thoughts, insights, or questions..."
- Saved with session on completion

#### Sidebar (Context & Resources)

**Focus On Section:**
- **Task (Optional):**
  - Searchable dropdown of pending tasks
  - Type to filter
  - Select to associate session with task
- **Subject (Optional):**
  - Dropdown of all subjects
  - Select to associate session with subject
- **Topics Covered:**
  - Only shown if subject selected
  - Checkbox list of all topics for selected subject
  - Select multiple topics covered in this session
  - Max height, scrollable

**Resources Section:**
- Only shown if subject selected AND subject has resources
- **Header:**
  - "Resources" heading
  - "Show" / "Hide" toggle
- **When shown:**
  - List of all resources for selected subject
  - Each resource clickable (opens URL in new tab)
  - Icon based on type (🔗 link, 📄 file, 📝 note)
  - Resource name

**Session Stats:**
- **Pomodoros:** count
- **Total Time:** formatted duration
- **Topics:** count of selected topics

---

### 7. Review (Weekly)

**Purpose:** Reflect on weekly progress with AI-generated insights

**Current Status:** Feature marked as "Coming Soon"

**Planned Functionality:**
- Weekly summary of study time, sessions, task completion
- AI-generated insights and recommendations
- Reflection prompts (What went well, What needs attention, Top priority)
- Visual progress charts
- Comparison to previous weeks

---

### 8. Flashcards

**Purpose:** Spaced repetition learning with SM-2 algorithm

#### Deck List View (Default)

**Header:**
- Title: "Flashcards"
- Description: "Organize your learning with decks"
- "+ Create Deck" button

**Global Stats (4 cards):**
1. **Decks** - total count
2. **Total Cards** - sum of all cards across decks
3. **Due Today** - count of cards due for review
4. **By Subject** - count of subjects with decks

**Deck Grid:**
- 3-column grid of deck cards
- **Each deck card shows:**
  - Colored vertical accent bar (deck.color)
  - Delete button (trash icon, top-right, on hover)
  - Deck name (heading)
  - Deck description (2-line truncate, if present)
  - Subject emoji + name (if associated)
  - Stats footer (3 columns):
    - **Cards:** total count
    - **Due:** count due today
    - **New:** count with repetitions=0
- **Click deck** to open deck view
- **Empty state:**
  - Message: "No decks yet"
  - Description: "Create your first deck to start learning"
  - "+ Create Deck" button

**Create Deck Modal:**
- **Fields:**
  - Deck Name (text, required, e.g., "Biology - Cell Structure")
  - Description (textarea, optional)
  - Color (8 color swatches: blue, green, amber, red, violet, pink, cyan, orange)
  - Subject (dropdown, nullable)
- **Actions:**
  - "Create Deck" button (disabled if name empty)
  - "Cancel" button
- **Keyboard shortcut:** Enter to submit

**Delete Deck Confirmation:**
- Modal warns: "Delete [Deck Name] and all its cards? This cannot be undone."
- "Delete" and "Cancel" buttons

---

#### Deck View

**Header:**
- Back arrow (return to deck list)
- Deck name
- Study buttons:
  - "Study New" (if new cards exist)
  - "Study Due" (if due cards exist)
  - "Study All"

**Stats Row (4 cards):**
1. **Total Cards**
2. **Due Today**
3. **Average Ease** (average easeFactor across all cards)
4. **Completion %** (cards mastered / total)

**Tab Navigation:**
1. Study
2. Browse
3. Settings

**Tab: Study**

**Study Session (when active):**
- **Card display:**
  - Large card with front text (centered)
  - "Show Answer" button
- **After showing answer:**
  - Card flips to show back text
  - 4 difficulty buttons:
    - "Again" (red, quality=0)
    - "Hard" (orange, quality=3)
    - "Good" (green, quality=4)
    - "Easy" (blue, quality=5)
  - Each button shows next review time
- **Progress indicator:**
  - "Card X of Y"
  - Progress bar
- **After all cards reviewed:**
  - Summary: "Session Complete! Reviewed N cards in M minutes"
  - Stats: again/hard/good/easy counts
  - "Finish" button (returns to study tab)

**Study Options (when not in session):**
- **Study New** (learn new cards)
  - Filters: repetitions=0
  - Order: creation date
- **Study Due** (review due cards)
  - Filters: nextReviewDate ≤ today, not suspended
  - Order: nextReviewDate (oldest first)
- **Study All** (all cards)
  - No filter
  - Order: due first, then new, then future

**Empty states:**
- "No new cards to study"
- "No cards due for review"
- "No cards in this deck. Add cards in Browse tab."

**Tab: Browse**

**Header:**
- "+ Add Card" button
- Search bar (filters front/back text)
- Sort dropdown (newest, oldest, due date, ease factor)

**Card List:**
- **Each card row shows:**
  - Front text (truncated)
  - Back text (truncated, lighter)
  - Next review date (if scheduled)
  - Ease factor
  - Interval (days)
  - Suspend toggle
  - Edit button
  - Delete button
- **Click row** to expand/collapse full card
- **Empty state:** "No cards yet. Add your first card!"

**Add/Edit Card Modal:**
- **Fields:**
  - Front (textarea, required, e.g., "What is the powerhouse of the cell?")
  - Back (textarea, required, e.g., "Mitochondria")
- **Actions:**
  - "Save Card" button
  - "Cancel" button

**Bulk Add Cards:**
- "Bulk Add" button (opens different modal)
- Textarea: one card per line, front/back separated by "|" or tab
- Example: "Question|Answer"
- "Import X Cards" button

**Tab: Settings**

**Deck Settings:**
- Rename deck
- Change color
- Change subject
- Edit description

**Study Settings:**
- New cards per day limit
- Review cards per day limit
- Learning steps (intervals for new cards)

**Danger Zone:**
- "Reset Deck Progress" (resets all cards to new)
  - Confirmation modal
- "Delete Deck" (cascading delete)
  - Confirmation modal

---

### 9. Stats & Profile

**Purpose:** Track personal progress and compete with friends

#### Header
- Title: "Profile & Stats"
- Description: "Track your progress and compete with friends"
- "Add Friend" button

#### Profile Card

**User Avatar:**
- Gradient circle with user initials (first 2 letters of name)
- Purple/pink gradient border

**User Info:**
- Name (heading)
- Level (subheading, e.g., "Level 5")

**Current Rank:**
- Trophy icon
- "#N" rank among friends

**Quick Stats Grid (4 cards):**
1. **Weekly Study**
   - Icon: Clock
   - Value: formatted duration
2. **Current Streak**
   - Icon: Zap (lightning)
   - Value: "N days"
3. **Tasks Done**
   - Icon: Target
   - Value: "completed / total"
4. **Total Sessions**
   - Icon: TrendingUp
   - Value: count

#### Friends Leaderboard

**Tab Selection:**
- "Weekly Time" (sort by weeklyMinutes)
- "Streak" (sort by currentStreak)
- "Level" (sort by level)

**Leaderboard List:**
- Ranked list of user + friends
- **Each row shows:**
  - Rank indicator:
    - Top 3: 🥇 🥈 🥉 (large emoji)
    - Others: #N (text)
  - Avatar (gradient circle with initials)
  - Name
  - "You" badge if current user
  - Level
  - Stat based on selected tab:
    - Weekly Time: hours (e.g., "12h 30m")
    - Streak: days with lightning icon
    - Level: "Level N"
- **Current user row:**
  - Purple/pink gradient background
  - Purple border
- **Other rows:**
  - Light background, hover effect

**Footer:**
- "+ Invite More Friends" button (dashed border)

**Add Friend Modal:**
- Text input: "Username or email"
- Description: "Enter your friend's username or email to send them an invite."
- "Send Invite" button
- "Cancel" button
- (Current implementation is mock functionality)

**Mock Friends Data:**
- Placeholder for social features
- 5 mock friends with names, stats, levels
- Will be replaced with real API integration

---

## User Workflows

### Workflow 1: New User Onboarding

1. User visits landing page
2. User clicks "Get Started" or "Sign Up"
3. User fills sign-up form (name, email, education stage, password)
4. User accepts terms & privacy
5. User submits form
6. **System:** Creates user account, navigates to Overview
7. User sees empty Overview (no subjects, tasks, or sessions)
8. User clicks "Manage Subjects" quick action
9. User clicks "+ Add Subject" and creates first subject
10. User adds topics (manually or with AI generation)
11. User adds exam dates
12. User adds resources (links, files, notes)
13. User navigates to Tasks and creates tasks
14. User navigates to Planner and creates study blocks (or uses AI suggestion)
15. User is now set up and ready to study

### Workflow 2: Daily Study Routine

**Morning:**
1. User opens app, sees Overview with today's schedule
2. User reviews today's tasks in "Tasks Today" card
3. User reviews today's study blocks in timeline
4. User checks "Due Soon" for upcoming deadlines

**Study Time:**
5. User navigates to Focus mode
6. User selects task to work on (optional)
7. User selects subject (optional)
8. User selects topics to cover (if subject selected)
9. User clicks "Start Focus"
10. **System:** Starts Pomodoro timer (25 min work)
11. User works on task/subject
12. **System:** Timer completes, auto-starts break (5 min)
13. User takes break
14. **System:** Break completes, returns to idle
15. User clicks "Continue Session" to start next Pomodoro
16. Repeat steps 11-15 until done (typically 4 Pomodoros)
17. User adds session notes (optional)
18. User clicks "✓ Complete Session"
19. **System:**
    - Awards XP
    - Updates topic lastReviewed
    - Updates daily goal
    - Checks for achievements
    - Optionally marks task as completed

**Evening:**
20. User checks daily goal progress
21. User reviews flashcards due today
22. User opens Flashcards, selects deck
23. User clicks "Study Due"
24. User reviews each card, rates difficulty
25. **System:** Updates SM-2 parameters, schedules next reviews, awards XP
26. User completes flashcard session

### Workflow 3: Weekly Planning

**Sunday Evening:**
1. User navigates to Planner
2. User clicks "✨ Suggest Plan"
3. **System:** AI analyzes pending tasks and suggests study blocks for upcoming week
4. User reviews suggestions, edits as needed (drag, resize, delete, add)
5. User manually adds additional blocks for specific topics
6. User saves plan

**Throughout Week:**
7. User checks Overview daily for today's schedule
8. User completes study blocks as scheduled
9. User marks blocks as completed
10. User adjusts plan as needed (reschedule, add, remove blocks)

**End of Week:**
11. User navigates to Review
12. User reflects on week (what went well, needs attention, priorities)
13. **System:** Generates AI summary with insights
14. User saves weekly review
15. User starts planning next week

### Workflow 4: Exam Preparation

**6 Weeks Before Exam:**
1. User creates Subject (e.g., "Biology")
2. User adds Exam with date and time
3. User generates topic list with AI (or adds manually)
4. User adds resources (textbook PDFs, notes, websites)

**Study Phase:**
5. User creates flashcard deck for subject
6. User adds flashcards for each topic (or bulk imports)
7. User creates tasks for each chapter/topic to review
8. User uses Planner to schedule study blocks across weeks
9. User does focus sessions, selecting relevant topics each time
10. User reviews flashcards daily (due cards)

**2 Weeks Before Exam:**
11. User increases study block frequency in Planner
12. User reviews topic confidence levels, identifies weak areas
13. User creates focused tasks for weak topics
14. User does intensive focus sessions on struggling topics

**1 Week Before Exam:**
15. User does practice problems (tasks)
16. User reviews all flashcards (Study All mode)
17. User checks topic confidence, ensures all at "Confident" or "Mastered"
18. User does final review focus sessions

**Day of Exam:**
19. User sees exam countdown timer on Overview
20. User sees exam marked as "Completed" after exam time passes

### Workflow 5: Flashcard Learning (Spaced Repetition)

**Initial Learning:**
1. User creates deck (e.g., "Spanish Vocabulary")
2. User adds 20 new flashcards (front: English, back: Spanish)
3. User clicks "Study New"
4. User sees first card front: "Hello"
5. User clicks "Show Answer"
6. User sees back: "Hola"
7. User rates difficulty:
   - "Again" if didn't know
   - "Hard" if struggled
   - "Good" if recalled correctly
   - "Easy" if instant recall
8. **System:** Applies SM-2 algorithm:
   - "Again" → repetitions=0, interval=0, next review today
   - "Hard" → repetitions=1, interval=1 day
   - "Good" → repetitions=1, interval=1 day (easier than Hard)
   - "Easy" → repetitions=1, interval=6 days
9. User repeats for all 20 cards
10. **System:** Awards XP, updates daily goal

**Day 2:**
11. User opens deck, sees "Due: 15" (cards rated Again/Hard/Good yesterday)
12. User clicks "Study Due"
13. User reviews due cards, rates each
14. **System:** Updates SM-2 parameters:
    - If "Good" on repetition=1 card → interval=6 days
    - If "Again" → resets to repetitions=0
    - If "Easy" → longer interval based on ease factor
15. User completes review

**Ongoing:**
16. User reviews due cards daily
17. Cards gradually spaced further apart (1 day → 6 days → 2 weeks → 1 month → 3 months, etc.)
18. User's long-term retention improves through spaced repetition

---

## Business Logic & Rules

### Streak Calculation

**Definition:** A "streak" is consecutive days with at least one completed focus session

**Algorithm:**
1. Get all focus sessions, sorted by start time (newest first)
2. Initialize streak counter = 0
3. Initialize current date = today (00:00:00)
4. For each session (from newest to oldest):
   - Normalize session date to 00:00:00
   - Calculate days difference between current date and session date
   - If difference equals streak (0 for first session):
     - Increment streak
     - Update current date to session date
   - Else:
     - Break loop (streak broken)
5. Return streak count

**Edge Cases:**
- No sessions → streak = 0
- Sessions today only → streak = 1
- Sessions yesterday and today → streak = 2
- Gap in sessions → streak resets

**Streak Bonus:**
- Awarded when completing a focus session AND current streak > 0
- Amount: 25 XP
- Description: "Day N streak bonus"

### XP and Leveling

**XP Sources:**
- Task completion: 10/25/50 XP (low/medium/high priority)
- Focus session: 5 XP per minute
- Flashcard review: 5 XP per card
- Streak bonus: 25 XP (daily, if streak > 0)

**Level Calculation:**
```
level = floor(sqrt(totalXP / 100))
```

**XP for Next Level:**
```
xpForLevel(n) = n² × 100
```

**Examples:**
- Level 0: 0 XP
- Level 1: 100 XP (need 100 XP to reach)
- Level 2: 400 XP (need 300 more XP after level 1)
- Level 3: 900 XP (need 500 more XP after level 2)
- Level 5: 2,500 XP
- Level 10: 10,000 XP

**Progress to Next Level:**
```
currentLevelXP = level² × 100
nextLevelXP = (level + 1)² × 100
progress = (totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)
```

### Achievement Checking

**Trigger Points:**
- After completing a task
- After completing a focus session
- After reviewing a flashcard

**Check Logic:**
1. Build achievement context:
   - totalSessions: count of all focus sessions
   - currentStreak: calculated streak value
   - weeklyMinutes: sum of session durations this week (Monday-Sunday)
   - totalMinutes: sum of all session durations
   - totalTasksCompleted: count of tasks with status=completed
   - totalFlashcardsReviewed: count of flashcard reviews
   - hasEarlyBirdSession: any session started before 8 AM
   - hasNightOwlSession: any session started after 10 PM

2. For each achievement:
   - If already unlocked: skip
   - Check unlock condition (see Gamification System section)
   - If condition met:
     - Create UnlockedAchievement record
     - Show toast notification with achievement details

**Achievement Conditions:**
- first-session: totalSessions >= 1
- streak-5: currentStreak >= 5
- streak-10: currentStreak >= 10
- streak-30: currentStreak >= 30
- weekly-10h: weeklyMinutes >= 600
- weekly-20h: weeklyMinutes >= 1200
- total-50h: totalMinutes >= 3000
- total-100h: totalMinutes >= 6000
- early-bird: hasEarlyBirdSession
- night-owl: hasNightOwlSession
- task-master: totalTasksCompleted >= 50
- flashcard-pro: totalFlashcardsReviewed >= 500

### Daily Goal Management

**Auto-Creation:**
- When accessing daily goal for a date:
  - If no goal exists for that date, create one with defaults:
    - studyMinutesGoal: 120
    - tasksCompletedGoal: 3
    - flashcardsReviewedGoal: 20
    - All "actual" values: 0
    - completed: false

**Auto-Update:**
- When completing a focus session:
  - Add session.durationMinutes to studyMinutesActual
- When completing a task:
  - Add 1 to tasksCompletedActual
- When reviewing a flashcard:
  - Add 1 to flashcardsReviewedActual

**Completion Check:**
- After each update, check:
  - studyMinutesActual >= studyMinutesGoal AND
  - tasksCompletedActual >= tasksCompletedGoal AND
  - flashcardsReviewedActual >= flashcardsReviewedGoal
- If all true: set completed = true

---

## Spaced Repetition System (SM-2)

### Algorithm Overview

The SM-2 (SuperMemo 2) algorithm schedules flashcard reviews based on user's self-assessed difficulty, optimizing long-term retention.

### Parameters

**Per-Card State:**
- `easeFactor` (EF): Multiplier affecting interval growth (range: 1.3 - ∞, default: 2.5)
- `interval`: Days until next review (default: 0)
- `repetitions`: Count of successful reviews (default: 0)
- `nextReviewDate`: Calculated date for next review

**User Input:**
- `difficulty`: 'again' | 'hard' | 'good' | 'easy'

**Quality Mapping:**
- again → 0 (complete failure)
- hard → 3 (difficult recall)
- good → 4 (correct response with some hesitation)
- easy → 5 (perfect recall)

### Calculation Steps

**1. Update Ease Factor:**
```
EF' = EF + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))
```
- Minimum EF: 1.3 (never goes below)

**2. Update Interval and Repetitions:**

If quality < 3 (i.e., "again"):
- Reset: `repetitions = 0`, `interval = 0`
- Card returns to learning queue

Else (quality >= 3):
- Increment: `repetitions += 1`
- Calculate new interval:
  - If `repetitions == 1`: `interval = 1 day`
  - If `repetitions == 2`: `interval = 6 days`
  - If `repetitions >= 3`: `interval = previous_interval × EF`

**3. Calculate Next Review Date:**
```
nextReviewDate = today + interval days
```
- Normalized to 00:00:00

### Examples

**Example 1: New Card, Good Response**
- Initial: EF=2.5, interval=0, repetitions=0
- User rates: "good" (quality=4)
- New: EF=2.5, interval=1, repetitions=1
- Next review: tomorrow

**Example 2: Second Review, Easy Response**
- Initial: EF=2.5, interval=1, repetitions=1
- User rates: "easy" (quality=5)
- New: EF=2.6, interval=6, repetitions=2
- Next review: 6 days from now

**Example 3: Third Review, Good Response**
- Initial: EF=2.6, interval=6, repetitions=2
- User rates: "good" (quality=4)
- New: EF=2.6, interval=16 (6 × 2.6), repetitions=3
- Next review: 16 days from now

**Example 4: Forgot Card, Again Response**
- Initial: EF=2.6, interval=16, repetitions=3
- User rates: "again" (quality=0)
- New: EF=2.18, interval=0, repetitions=0
- Next review: today (back to learning queue)

### Due Card Logic

**A card is "due" when:**
```
nextReviewDate (normalized to 00:00) <= today (normalized to 00:00)
```

**New cards:**
- `repetitions == 0`
- Always due (until first successful review)

**Suspended cards:**
- `suspended == true`
- Never due (excluded from study sessions)

### Study Session Types

**Study New:**
- Filter: `repetitions == 0` AND `suspended == false`
- Order: `createdAt` (oldest first)
- Purpose: Learn cards for the first time

**Study Due:**
- Filter: `nextReviewDate <= today` AND `suspended == false`
- Order: `nextReviewDate` (oldest due first)
- Purpose: Review cards scheduled for today or earlier

**Study All:**
- Filter: `suspended == false`
- Order: Due first, then new, then future
- Purpose: Cram or intensive review

### Progress Tracking

**FlashcardReview Record:**
- Created for every card review
- Stores before/after SM-2 parameters
- Used for analytics and review history

**Deck Statistics:**
- Total cards: count of all cards in deck
- New cards: count where `repetitions == 0`
- Learning cards: count where `repetitions > 0` AND `interval < 21`
- Mature cards: count where `interval >= 21`
- Due today: count where `nextReviewDate <= today` AND `suspended == false`
- Average ease factor: mean of all `easeFactor` values

---

## AI Integration Points

**Current Implementation:** Mock AI (simulated responses with delays)

**Future Real AI Integration Points:**

### 1. Topic Generation

**Input:**
- Subject name (string)

**Output:**
- Array of topic names (string[])

**Purpose:**
- Generate comprehensive topic list for a subject based on curriculum

**Example:**
- Input: "Biology"
- Output: ["Cell Biology", "Genetics", "Evolution", "Ecology", "Human Anatomy", "Plant Biology", "Microbiology", "Biochemistry"]

**Current Mock Behavior:**
- Predefined topic sets for common subjects (maths, biology, chemistry, physics, english, history)
- Generic topics for unknown subjects

### 2. Weekly Plan Suggestion

**Input:**
- Array of pending tasks with due dates, priorities, subjects, estimated durations

**Output:**
- Array of StudyBlock objects with:
  - Title (derived from task)
  - Date (optimal day within week)
  - Start/end time (optimal time slots)
  - Subject (from task)
  - Task IDs (linked tasks)

**Purpose:**
- Intelligently schedule tasks across the week based on:
  - Due dates (urgent tasks earlier)
  - Priorities (high priority tasks get more time/better slots)
  - Subject distribution (balance across subjects)
  - User's past study patterns (optimal times)

**Current Mock Behavior:**
- Filters tasks due this week
- Sorts by priority then due date
- Distributes across predefined time slots (mornings/afternoons)
- Creates 2-hour blocks

### 3. Weekly Review Summary

**Input:**
- Array of focus sessions (with durations, topics, completion)
- Array of tasks (with completion status)
- Array of topics (with lastReviewed dates)

**Output:**
- AI-generated summary text (string)

**Purpose:**
- Provide personalized insights:
  - Congratulate achievements
  - Identify patterns (best study times, most productive days)
  - Highlight stale topics (not reviewed in 7+ days)
  - Suggest priorities for next week

**Example Output:**
"Great work this week! You completed 8 out of 10 tasks and spent 14h 30m in focused study. Your consistency is impressive—12 focus sessions shows real dedication. Consider reviewing Quadratic Equations, Trigonometry, Cell Structure soon to keep them fresh. For next week, focus on maintaining your rhythm and tackling high-priority tasks early."

**Current Mock Behavior:**
- Calculates total time, task completion
- Identifies stale topics (>7 days since review)
- Generates templated summary with personalization

**Future Real AI:**
- Use LLM (GPT-4, Claude, etc.) to generate truly personalized insights
- Analyze study patterns for deeper recommendations
- Provide motivational messaging tailored to user's progress

---

## Data Persistence Requirements

### Storage Technology

**Current (Web):** Dexie.js (IndexedDB wrapper)
**For Native Swift:** Core Data, SwiftData, or Realm

### Database Schema

**Tables/Entities:**
1. users
2. subjects
3. exams
4. topics
5. resources
6. tasks
7. studyBlocks
8. focusSessions
9. weeklyReviews
10. settings
11. decks
12. flashcards
13. flashcardReviews
14. xpEvents
15. unlockedAchievements
16. dailyGoals

### Indexes

**Required for Performance:**
- `exams`: subjectId, date
- `topics`: subjectId
- `resources`: subjectId
- `tasks`: dueDate, status
- `studyBlocks`: date
- `focusSessions`: startTime, subjectId
- `weeklyReviews`: weekStart
- `decks`: parentDeckId, subjectId, topicId
- `flashcards`: deckId, nextReviewDate, suspended
- `flashcardReviews`: flashcardId, deckId, reviewedAt
- `xpEvents`: createdAt, type
- `unlockedAchievements`: achievementId, unlockedAt
- `dailyGoals`: date

### Migration Considerations

**Version 1 to Version 2:**
- Add gamification tables (xpEvents, unlockedAchievements, dailyGoals)
- Add totalXP and level fields to users (default: 0)

**Data Relationships:**
- Subject → Exams (1:many, cascade delete)
- Subject → Topics (1:many, cascade delete)
- Subject → Resources (1:many, cascade delete)
- Subject → Decks (1:many, nullable FK)
- Topic → Topics (1:many self-reference, for subtopics)
- Topic → Decks (1:many, nullable FK)
- Resource → Resources (1:many self-reference, for folder hierarchy)
- Deck → Decks (1:many self-reference, for subdecks)
- Deck → Flashcards (1:many, cascade delete)
- Flashcard → FlashcardReviews (1:many, cascade delete)

**Cascade Deletes:**
- Deleting Subject → deletes all Exams, Topics, Resources for that subject
- Deleting Deck → deletes all Flashcards (and their Reviews) in that deck
- Deleting Topic (parent) → orphans or deletes subtopics (implementation choice)

### Offline-First Design

**All data stored locally:**
- No server dependency for core functionality
- User data never leaves device (privacy-first)
- Instant access, no network latency

**Future Cloud Sync (Optional):**
- Encrypt data before upload
- Conflict resolution strategy (last-write-wins or manual)
- Sync settings, subjects, tasks, sessions, flashcards
- Do NOT sync: temporary UI state, ephemeral data

### Data Export/Import

**Export Requirements:**
- Export all user data to JSON file
- Include all tables/entities
- Preserve relationships (IDs)

**Import Requirements:**
- Import from JSON file
- Validate schema version
- Handle ID conflicts (regenerate UUIDs)
- Option to merge or replace existing data

---

## Edge Cases & Special Behaviors

### 1. Time and Date Handling

**Timezone Awareness:**
- All dates stored in user's local timezone
- Date comparisons normalize to 00:00:00 to avoid timezone bugs
- Week starts on Monday (configurable if needed)

**Date Normalization:**
```javascript
const today = new Date()
today.setHours(0, 0, 0, 0) // Normalize to midnight
```

**Edge Cases:**
- Task due at 23:59 vs. 00:00 next day (both "due today")
- Study block crossing midnight (00:00 end time)
- Exam at 23:59 (still "today")
- Focus session started before midnight, ended after midnight (counts for start day)

### 2. Empty States

**Every list/grid must have an empty state:**
- Message explaining why empty
- CTA button to create first item
- Visual icon/emoji

**Examples:**
- No subjects: "No subjects yet. Add your first subject to get started" + button
- No tasks: "No tasks yet. Create your first task to get started" + button
- No flashcards: "No cards in this deck. Add cards in Browse tab."

### 3. Deletion Cascades

**Subject Deletion:**
- Warn user: "This will also delete all exams, topics, and resources for this subject."
- Confirmation modal required
- Cascade delete all related data
- If subject has flashcard decks: orphan them (set subjectId to null) or delete (implementation choice)

**Deck Deletion:**
- Warn user: "Delete [Deck Name] and all its cards? This cannot be undone."
- Confirmation modal required
- Cascade delete all flashcards
- Cascade delete all flashcard reviews for those cards

**Task Deletion:**
- Confirmation modal
- Do NOT cascade delete focus sessions (they may cover multiple topics/tasks)
- Focus sessions with deleted taskId: set taskId to null (orphan)

### 4. Concurrent Edits

**Study Block Overlaps:**
- Allow overlapping blocks (no validation)
- User can schedule multiple blocks at same time (intentional flexibility)

**Multiple Timers:**
- Only one focus session can be active at a time
- Starting new session while one active: prompt to complete or abandon current

### 5. Data Limits

**No Hard Limits (but consider UX):**
- Subjects: unlimited (UX degrades after ~20-30)
- Topics per subject: unlimited (UX degrades after ~100-200)
- Tasks: unlimited (filter/search essential after ~50)
- Study blocks per week: unlimited (UI shows first 3, "view more" modal)
- Flashcards per deck: unlimited (paginate or virtualize after ~1000)

**Recommended Soft Limits (warn user):**
- Topics per subject: 50 (suggest subtopics or groups)
- Flashcards per deck: 500 (suggest creating subdecks)

### 6. Focus Session Edge Cases

**Session Interruption:**
- User closes app mid-session: prompt on reopen to resume or abandon
- Implement session recovery: save state to persistence on every timer tick

**Task Completion During Session:**
- If user marks task as completed elsewhere while it's selected in focus session
- Focus session continues normally
- On completion: do not re-complete task

**Subject/Topic Deletion During Session:**
- If subject/topics deleted while selected in focus session
- Session continues, but orphaned references on save
- Handle gracefully: ignore deleted IDs on save

### 7. Flashcard Edge Cases

**Deleting Card Mid-Review:**
- If card deleted while in study session (unlikely, but possible in multi-device scenario)
- Skip card, show next

**Suspended Card Becomes Due:**
- Due count excludes suspended cards
- If user unsuspends: card becomes due immediately if nextReviewDate <= today

**Deck with 0 Cards:**
- "Study" buttons disabled
- Message: "No cards in this deck"

**Review History for Deleted Card:**
- Keep FlashcardReview records for analytics
- Orphaned reviews (flashcardId no longer exists) shown in history with "[Deleted Card]"

### 8. Achievements Edge Cases

**Achievement Unlocked Twice:**
- Should never happen (check prevents it)
- If database corruption: ignore duplicate unlock

**Streak Breaks:**
- Streak resets to 0 if no session for 2+ consecutive days
- Achievements already unlocked (streak-5, etc.) remain unlocked

**Level Down:**
- Never decrease level (even if XP somehow decreased)
- Level = floor(sqrt(totalXP / 100)) always increases monotonically

### 9. Daily Goal Edge Cases

**Goal Not Met:**
- Goal stays incomplete (completed=false)
- No penalty or negative consequence
- Historical record preserved

**Goal Exceeded:**
- Actual values can exceed goals
- Still marked as completed
- Overachievement not specially tracked (could be future feature)

**Changing Goal Mid-Day:**
- User can manually edit goals at any time
- Completion status recalculated immediately

### 10. AI Edge Cases

**AI Service Unavailable:**
- Graceful fallback: show error message
- Do not block user from proceeding
- Offer manual alternative (e.g., manually add topics instead of AI generate)

**AI Returns Empty/Invalid Data:**
- Validate AI response before applying
- Show error: "AI generation failed. Please try again or add manually."

### 11. Onboarding Edge Cases

**User Skips Setup:**
- User can proceed with empty app
- Encourage setup with empty states and CTAs
- No blocking or forced onboarding flows

**User Imports Data:**
- Future feature: import from JSON or other apps
- Validate schema, regenerate IDs if conflicts
- Show preview before import

### 12. Search and Filtering

**No Results:**
- Show empty state: "No results found for '[query]'"
- Clear search button
- Suggestion to try different keywords

**Special Characters in Search:**
- Handle quotes, slashes, unicode gracefully
- Case-insensitive search
- Partial matching (substring search)

---

## Summary

This specification captures the complete functionality of the TaskLoom web prototype, ready for migration to native macOS/iOS applications. It excludes implementation details (technologies, UI frameworks, etc.) and focuses on **what** the app does, not **how** it does it.

**Key Features to Prioritize:**
1. **Core Study Management:** Subjects, Topics, Tasks, Planner
2. **Focus Sessions:** Pomodoro timer with session tracking
3. **Flashcards:** Spaced repetition with SM-2 algorithm
4. **Gamification:** XP, levels, achievements, daily goals
5. **Analytics:** Stats, streaks, leaderboards

**Future Enhancements (Not in Current Prototype):**
- Real AI integration (replace mock implementations)
- Cloud sync and backup
- Social features (real friend invites, sharing)
- Advanced analytics and insights
- Weekly review automation
- White noise integration for focus sessions
- Multi-device support

**Design Aesthetic (for new app):**
- Notion-style modern productivity app
- Clean, minimal, focused on content
- Dark mode as primary (current prototype is dark)
- Smooth animations and transitions
- Delightful micro-interactions

---

**End of Specification**

For questions or clarifications, refer to the source code at specific file paths mentioned throughout this document (e.g., src/types/index.ts:1-238 for data model definitions).
