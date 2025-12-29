# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Worktime** - Created by **[Jorim Tielemans](https://github.com/tjorim)**

Worktime is a Team Shift Tracker and Time-Off Manager for continuous (24/7) 5-team shift schedules. This lightweight web application combines shift tracking with integrated time-off management (.hday format), allowing users to quickly check which teams are working on any given day, see when their team's next shift is, manage vacation/time-off events, and identify transfer/handover points between teams.

**Note**: Previously known as NextShift. Rebranded to Worktime with v4.0.0 after merging HdayPlanner's time-off management capabilities.

## File Structure

```text
Worktime/
├── index.html              # Main HTML entry point
├── src/
│   ├── App.tsx            # Main React application component
│   ├── main.tsx           # React app entry point and initialization
│   ├── vite-env.d.ts      # TypeScript environment declarations
│   ├── components/        # React components
│   │   ├── ChangelogModal.tsx   # Interactive changelog viewer with accordion layout
│   │   ├── CurrentStatus.tsx    # Current team shift and status display with timeline
│   │   ├── ErrorBoundary.tsx    # Error boundary wrapper for graceful error handling
│   │   ├── Header.tsx           # App header with title and controls
│   │   ├── MainTabs.tsx         # Main tabbed interface container
│   │   ├── ScheduleView.tsx     # Weekly schedule overview
│   │   ├── ShiftTimeline.tsx    # Today's shift timeline component (extracted from CurrentStatus)
│   │   ├── TeamSelector.tsx     # Team selection modal
│   │   ├── TodayView.tsx        # Today's schedule for all teams
│   │   ├── TransferView.tsx     # Team handover/transfer analysis
│   │   └── terminal/            # Terminal web interface components
│   │       ├── TerminalView.tsx        # Main terminal container
│   │       ├── TerminalHeader.tsx      # Terminal header with live time
│   │       ├── TerminalTeamList.tsx    # Team shift display
│   │       ├── TerminalNextShift.tsx   # Next shift information
│   │       └── TerminalTransfers.tsx   # Transfer analysis
│   ├── contexts/          # React contexts for global state
│   │   └── ToastContext.tsx        # Global toast notification system with React Context
│   ├── data/              # Static data and configurations
│   │   └── changelog.ts            # Changelog data structure for in-app viewer
│   ├── hooks/             # Custom React hooks
│   │   ├── useCountdown.ts         # Countdown timer hook for next shift timing
│   │   ├── useKeyboardShortcuts.ts # Keyboard shortcuts functionality
│   │   ├── useLiveTime.ts          # Live updating time with configurable frequency
│   │   ├── useLocalStorage.ts      # LocalStorage persistence hook
│   │   ├── useShiftCalculation.ts  # Shift calculation logic hook
│   │   └── useTransferCalculations.ts # Team transfer analysis hook
│   ├── utils/             # TypeScript utilities and business logic
│   │   ├── config.ts           # App configuration and constants
│   │   ├── shiftCalculations.ts # Core shift calculation functions
│   │   └── shiftStyles.ts      # Shift styling utilities
│   └── styles/
│       ├── main.scss      # Custom styles and shift color coding (Sass)
│       └── terminal.css   # Terminal web interface styles
├── tests/                 # Test files
│   ├── components/        # Component tests
│   ├── hooks/            # Hook tests
│   ├── setup.ts          # Test environment setup
│   └── shiftCalculations.test.ts # Business logic tests
├── public/
│   └── assets/icons/      # Favicon icons
├── scripts/               # Build and utility scripts
│   ├── generate-changelog.ts   # Automatic changelog generation from data
│   └── generate-icons.js       # Icon generator script
├── vite.config.ts         # Vite build configuration with React
├── vitest.config.ts       # Vitest testing configuration
├── tsconfig.json          # TypeScript project references
├── tsconfig.app.json      # TypeScript app configuration
├── tsconfig.node.json     # TypeScript Node.js configuration
├── tsconfig.test.json     # TypeScript test configuration
└── dist/                  # Production build output
    └── assets/           # Built and optimized assets
```

## Core Logic & Architecture

### Shift Pattern

Each team works a repeating cycle:

- 2 mornings (7h-15h) - Code: M
- 2 evenings (15h-23h) - Code: E
- 2 nights (23h-7h) - Code: N
- 4 days off
  Total cycle: 10 days per team

### Team Numbers

Teams are numbered 1-5, with each team offset in the schedule cycle.

### Date Format

Uses weeknumber.weekday format (YYWW.D):

- Format: **YYWW.D** where YY=year, WW=week number, D=weekday (1=Monday, 7=Sunday)
- Today (Tuesday 13 May 2025) = **2520.2** (year 2025, week 20, Tuesday)
- Night shifts use previous day (2520.1N for night starting Monday 23h)
- Full shift codes: **2520.2M**, **2520.2E**, **2520.1N**

### Reference Variables (Configurable)

The app supports configurable reference values for shift calculations:

**Environment Variables (Build-time):**

```bash
# Set in .env file or build environment
VITE_REFERENCE_DATE=2025-01-06
VITE_REFERENCE_TEAM=1
```

**Runtime Configuration:**

```javascript
// Add to index.html before main script
window.WORKTIME_CONFIG = {
    REFERENCE_DATE: '2025-01-06',
    REFERENCE_TEAM: 1
};
```

**Deployment Examples:**

```bash
# Development
echo "VITE_REFERENCE_DATE=2025-01-06" > .env
echo "VITE_REFERENCE_TEAM=1" >> .env

# Production build
VITE_REFERENCE_DATE=2025-01-13 VITE_REFERENCE_TEAM=3 npm run build

# Docker
ENV VITE_REFERENCE_DATE=2025-01-06
ENV VITE_REFERENCE_TEAM=1
```

These variables anchor all shift calculations. If not configured, defaults to `2025-01-06` and team `1`.

## Key Features

- **Team Shift View**: Show all 5 teams and their shifts for any selected date
- **My Team Selection**: User selects their team on first visit (stored in localStorage)
- **Next Shift Lookup**: See when any team's next shift is scheduled
- **My Team Next Shift**: Quickly see when user's team works next
- **Transfer/Handover View**: See when user's team transfers with any other team (works before/after)
- **Time Off Management**: Import/export .hday files for vacation and time-off tracking with event overlays on schedule
- **Date Navigation**: Today button, date picker, previous/next day
- **Date Format**: Display in YYWW.D format (e.g., 2520.2M = year 2025, week 20, Tuesday Morning)
- **Terminal Web Interface**: Browser-based terminal-style UI with keyboard navigation (accessible via `?view=terminal`)

## Recent Improvements (v3.1+)

### Component Architecture Enhancements

- **ShiftTimeline Component**: Extracted timeline logic from CurrentStatus into dedicated component for better separation of concerns
- **Enhanced CurrentStatus**: Optimized layout with datetime moved to header area and improved timeline display
- **Cross-day Timeline**: Fixed timeline to show next shift from tomorrow when current shift is last of day (e.g., T1 M after T4 N)

### Performance Optimizations

- **useLiveTime Hook**: Configurable update frequency with minute-level default (60x fewer re-renders)
- **Precision Control**: Second-level updates available when needed for precise timing
- **Memoized Calculations**: Better performance for shift day computations

### Date Code Accuracy

- **Night Shift Fix**: Date codes now correctly use shift day instead of calendar day (2530.5N instead of 2530.6N)
- **Enhanced Display**: Current status shows combined format "2530.5N • Saturday, Jul 26 • 02:24"
- **Tooltip Context**: Shows both calendar day and shift day for user clarity

### User Experience

- **Interactive Changelog**: In-app changelog viewer with accordion interface
- **Toast Notifications**: Global notification system with React Context
- **Error Boundaries**: Graceful error handling and recovery
- **Enhanced Testing**: Comprehensive test coverage with data-driven patterns

## Time Off Management (.hday Integration)

Worktime supports importing and managing time-off events via the `.hday` format (merged from HdayPlanner), enabling vacation planning and event tracking alongside shift schedules.

### .hday Format

The .hday format is a simple, human-readable text format for time-off events:

**Range Events** (specific dates):

```
2025/01/15 # Vacation day
2025/12/23-2025/12/27 # Christmas vacation
2025/03/10-2025/03/14b # Business trip
```

**Weekly Events** (recurring patterns):

```
d1 # Every Monday
d5 # Every Friday
d1i # Every Monday in office
```

**Event Flags**:

- **Type flags**: `b` (business trip), `s` (training/course), `i` (in office), `w` (weekend), `a` (birthday), `l` (sick leave), `o` (other)
- **Time/location flags**: `a` (AM/half day), `p` (PM/half day), `+` (onsite), `-` (no fly), `=` (can fly)

### Key Features

- **Dedicated Time Off Tab**: Manage all time-off events in one place
- **Import/Export**: Load existing .hday files or export for backup
- **CRUD Operations**: Add, edit, and delete events with live preview
- **Event Overlays**: See time-off indicators on the schedule view
- **Today Banner**: View today's events prominently in the Today view
- **Offline Capable**: All events stored in localStorage, fully functional offline
- **Round-trip Fidelity**: Export maintains exact .hday format from import

### Implementation

**Key Files**:

- Parser: `src/lib/hday/parser.ts` (482 lines, 139 test cases)
- Event store: `src/contexts/EventStoreContext.tsx`
- Event converters: `src/lib/events/converters.ts`
- UI components: `src/components/TimeOffView.tsx`, `src/components/EventModal.tsx`
- Tests: `tests/lib/hday.test.ts`, `tests/contexts/EventStoreContext.test.tsx`, `tests/components/TimeOffView.test.tsx`

**Storage**:

- Raw .hday text stored in localStorage (`worktime_hday_raw`)
- Parsed on load into HdayEvent objects
- No consent checks - direct localStorage access (internal users only)

**Accessibility**:

- Semantic table structure for screen readers
- ARIA labels on icon-only buttons
- Keyboard navigation throughout
- Form validation with aria-required and aria-describedby
- Modal focus traps and Escape key support
- Color contrast: #000 text on all colored event badges

## Technology Stack

- **Frontend**: React 19 with TypeScript and modern JSX transform
- **Build Tool**: Vite 8 beta for modern development and optimization
- **UI Framework**: React Bootstrap (Bootstrap 5 components) for responsive design
- **Date Handling**: Day.js for date calculations and week number formatting
- **Storage**: Custom React hooks for localStorage persistence and state management
- **Code Quality**: oxlint and oxfmt (OXC tools) for ultra-fast linting and formatting
- **Testing**: Vitest with React Testing Library for component and unit testing

## Development Commands

This application uses Vite for modern development and build processes:

1. **Development Server**: Fast development with hot module replacement

   ```bash
   npm run dev          # Start Vite dev server at http://localhost:8000
   ```

2. **Production Build**: Optimized build

   ```bash
   npm run build        # Build for production in dist/ directory
   npm run preview      # Preview production build locally
   ```

   **⚠️ IMPORTANT**: ALWAYS run `npm run build` BEFORE `npm run preview`. The preview command serves the built files from the dist/ directory, so any code changes won't be visible until you build first.

3. **Code Quality**: Ultra-fast linting with OXC tools

   ```bash
   npm run lint         # Lint with oxlint (ultra-fast Rust-based linter)
   npm run format       # Format code with oxfmt
   npm run test         # Run Vitest test suite
   ```

4. **Utility Scripts**: Development and build utilities

   ```bash
   npm run generate-changelog  # Generate CHANGELOG.md from data
   npm run generate-icons      # Generate favicon icons
   ```

## Terminal Web Interface

Worktime includes a terminal-styled web interface that provides all shift tracking functionality in a retro terminal aesthetic.

### Features

- **Browser-Based**: Runs in any web browser, no terminal needed
- **Terminal Aesthetic**: Monospace fonts, terminal colors, retro styling
- **Keyboard Navigation**: Full keyboard control for efficient operation
- **Integrated**: No additional dependencies beyond the main app; uses custom CSS for styling
- **Mobile Accessible**: Works on all devices (keyboard shortcuts optional)
- **URL Parameter**: Access via `?view=terminal`

### Access

**Via UI Button:**

- Click "Terminal" button in header to enter terminal view
- Click "[Exit Terminal]" button or press Escape/q to exit

**Via URL:**

```bash
# Production
https://yourapp.com/?view=terminal

# Development
http://localhost:8000/?view=terminal
```

### Keyboard Shortcuts

- **1-5**: Select team (Team 1 through Team 5)
- **↑/↓**: Switch between teams (up/down through vertical list)
- **Tab**: Cycle through views (Today → Next Shift → Transfers)
- **j/k** or **←/→**: Navigate dates (left=past, right=future)
- **t**: Jump to today's date
- **q** or **Esc**: Exit terminal view (return to normal UI)

### Implementation

- **Location**: `src/components/terminal/`
- **Styling**: `src/styles/terminal.css`
- **Components**:
  - `TerminalView.tsx` - Main container with keyboard navigation
  - `TerminalHeader.tsx` - Header with live time
  - `TerminalTeamList.tsx` - Team shift display
  - `TerminalNextShift.tsx` - Next shift information
  - `TerminalTransfers.tsx` - Transfer analysis
- **Integration**: URL parameter `?view=terminal` in App.tsx

## Future Extensions

- Multi-day calendar overview
- Export schedule as .ics calendar
- Shift notifications
- Internationalization (EN/NL)
