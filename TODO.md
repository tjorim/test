# NextShift Development Roadmap

**Current Version**: 3.3.0  
**Branch**: `main`  
**Status**: Active Development

## Overview

This document serves as a general to-do list and development roadmap for NextShift improvements, covering UI enhancements, features, and user experience improvements.

## Development To-dos

### 🚀 High-Priority Items

Critical features and improvements that significantly impact user experience.

#### 1. Export Schedule Feature

- **Component**: Calendar export functionality
- **Use Cases**:
  - Download shift schedule as .ics calendar file
  - Integration with external calendar apps
  - Team schedule sharing
- **Implementation**: Add calendar generation utility and activate export buttons
- **Files to Modify**:
  - `src/components/SettingsPanel.tsx` - Remove "Coming Soon" badge and enable button
  - `src/components/TeamDetailModal.tsx` - Enable export button
  - `src/utils/exportCalendar.ts` – Add calendar export utility
- **Estimated Effort**: 3–4 hours
- **Status**: 🔲 Planned

#### 2. Keyboard Shortcuts Implementation

- **Component**: Enhanced navigation with keyboard shortcuts
- **Use Cases**:
  - Quick tab switching (T for Today, S for Schedule, R for Transfers)
  - Date navigation (← → arrow keys)
  - Settings panel toggle (Ctrl+,)
- **Implementation**: Integrate existing useKeyboardShortcuts hook into components
- **Files to Modify**:
  - `src/components/MainTabs.tsx` - Add shortcut handlers
  - `src/components/ScheduleView.tsx` - Add date navigation shortcuts
  - `src/components/Header.tsx` - Add settings shortcut
- **Estimated Effort**: 2–3 hours
- **Status**: 🔲 Planned

#### 3. Version Sync Fix

- **Component**: Changelog version alignment
- **Use Cases**:
  - Accurate "Coming Soon" version display
  - Proper future planning version numbers
- **Implementation**: Update futurePlans in changelog.ts
- **Files to Modify**:
  - `src/data/changelog.ts` - Update version numbers in futurePlans
- **Estimated Effort**: 30 minutes
- **Status**: 🔲 Planned

### 🎯 Medium-Priority Items

Features that enhance functionality with moderate development effort.

#### 4. Reusable TeamSelector Component

- **Component**: Extract common team selection logic
- **Use Cases**:
  - Reduce code duplication across TransferView, TeamDetailModal, etc.
  - Consistent team selection UI/UX
  - Easier maintenance and updates
- **Implementation**: Create `components/common/TeamSelector.tsx` with standardized props
- **Files to Modify**:
  - `src/components/TransferView.tsx` - Replace dropdown with TeamSelector
  - `src/components/TeamDetailModal.tsx` - Use common component
  - Create `src/components/common/TeamSelector.tsx`
- **Estimated Effort**: 2–3 hours
- **Status**: 🔲 Planned

#### 5. Enhanced List Groups

- **Component**: `react-bootstrap/ListGroup`
- **Use Cases**:
  - Upcoming shifts list
  - Recent transfers list
  - Clean, organized data display
- **Implementation**: New components for data lists
- **Estimated Effort**: 2–3 hours
- **Status**: 🔲 Future

#### 6. TeamDetailModal Enhancement

- **Component**: Improve existing team detail modal
- **Use Cases**:
  - Enable export functionality in modal
  - Enhanced 7-day schedule view
  - Better team information display
- **Implementation**: Activate disabled features and improve UX
- **Estimated Effort**: 1–2 hours
- **Status**: 🔲 Future

#### 7. Enhanced Error Boundaries

- **Component**: More granular error handling
- **Use Cases**:
  - Component-specific error recovery
  - Better error messages for users
  - Graceful degradation
- **Implementation**: Add specific error boundaries for complex components
- **Estimated Effort**: 2–3 hours
- **Status**: 🔲 Future

#### 8. CurrentStatus Component Refactoring ⭐️

- **Component**: Simplify complex conditional rendering in CurrentStatus
- **Priority**: Elevated due to code review feedback
- **Code Review Feedback**: "This component has grown quite complex with the introduction of the generic view for when no team is selected. The conditional rendering logic, especially within the Your Team Status and Your Next Shift cards, makes it a bit hard to follow." - _Gemini Code Assistant_
- **Use Cases**:
  - Improved code readability and maintainability
  - Easier testing of individual status display logic
  - Better separation of concerns
  - Cleaner component architecture with single responsibility
- **Recommended Implementation**:
  - Extract into `PersonalizedStatus` and `GenericStatus` components
  - Make CurrentStatus a simple router component that decides which view to render
  - Example structure:
    ```tsx
    export function CurrentStatus({ myTeam, currentDate, todayShifts, onTodayClick }) {
      return myTeam ? (
        <PersonalizedStatus myTeam={myTeam} currentDate={currentDate} todayShifts={todayShifts} />
      ) : (
        <GenericStatus currentDate={currentDate} todayShifts={todayShifts} onTodayClick={onTodayClick} />
      );
    }
    ```
- **Files to Modify**:
  - `src/components/CurrentStatus.tsx` - Simplify to router component
  - Create `src/components/status/PersonalizedStatus.tsx` - Handles user's team view
  - Create `src/components/status/GenericStatus.tsx` - Handles no-team-selected view
  - Update tests to cover new component structure
- **Estimated Effort**: 2–3 hours
- **Status**: 🔲 Planned (High Priority)

#### 9. PWA Installation Prompts

- **Component**: Intelligent installation timing
- **Use Cases**:
  - Better onboarding integration
  - Smart prompt timing based on user engagement
  - Installation success tracking
- **Implementation**: Enhance existing usePWAInstall hook
- **Estimated Effort**: 1–2 hours
- **Status**: 🔲 Future

### 🎨 Future Enhancements

Advanced features for future development phases.

#### 9. Carousel for Mobile Team View

- **Component**: `react-bootstrap/Carousel`
- **Use Cases**:
  - Swipe through teams on mobile
  - Better mobile navigation
- **Implementation**: Responsive team display
- **Estimated Effort**: 5–6 hours
- **Status**: 🔲 Future

#### 10. Accordion for Transfer History

- **Component**: `react-bootstrap/Accordion`
- **Use Cases**:
  - Collapsible transfer sections by date range
  - Organized historical data
- **Implementation**: Update TransferView component
- **Estimated Effort**: 3–4 hours
- **Status**: 🔲 Future

#### 11. Notification System Implementation

- **Component**: Actual notification functionality
- **Use Cases**:
  - Shift reminders and countdown alerts
  - Push notifications for PWA
  - Customizable notification preferences
- **Implementation**: Build on existing notification settings in SettingsContext
- **Estimated Effort**: 4–5 hours
- **Status**: 🔲 Future

#### 12. Advanced Accessibility Features

- **Component**: Enhanced accessibility support
- **Use Cases**:
  - Screen reader improvements
  - High contrast mode
  - Font size preferences
  - Motion reduction settings
- **Implementation**: Accessibility context and enhanced ARIA support
- **Estimated Effort**: 3–4 hours
- **Status**: 🔲 Future

#### 13. Multi-Roster Pattern Support

- **Component**: Configurable shift patterns beyond 5-team 2-2-2-4 cycle
- **Use Cases**:
  - Support 3-team, 4-team, 6-team rosters
  - Different shift patterns (3-3-3-3, 4-4-4-4, custom patterns)
  - Multiple roster types in same organization
  - Dynamic team count and shift cycle configuration
- **Implementation**: Extract hardcoded pattern logic into configurable system
- **Files to Modify**:
  - `src/utils/shiftCalculations.ts` - Make SHIFTS and cycle logic configurable
  - `src/utils/config.ts` - Add roster pattern configuration
  - `src/components/WelcomeWizard.tsx` - Dynamic team count references
  - `src/components/AboutModal.tsx` - Dynamic roster description
  - `CLAUDE.md` - Update documentation for multiple patterns
- **Technical Requirements**:
  - Roster pattern schema (teams, shifts per team, cycle length)
  - Migration system for existing localStorage data
  - UI for roster selection/configuration
  - Backward compatibility with current 5-team setup
- **Estimated Effort**: 8–12 hours (Major feature)
- **Status**: 🔲 Future

#### 14. Floating Action Button

- **Component**: Custom positioned `react-bootstrap/Button`
- **Use Cases**:
  - Quick team switch
  - Add to calendar
  - Quick actions overlay
- **Implementation**: Fixed positioned button system
- **Estimated Effort**: 2–3 hours

## Current To-do Status

### 🔲 Next Up

1. **CurrentStatus Component Refactoring** ⭐️ - Elevated priority due to code review feedback
2. **Export Schedule Feature** - Calendar export functionality (user-facing)
3. **Keyboard Shortcuts** - Enhanced navigation and UX
4. **Version Sync Fix** - Quick changelog alignment (30 min)

### 📋 Backlog (Code Quality)

5. **Reusable TeamSelector Component** - Reduce code duplication

### 📋 Backlog (Features)

6. **Enhanced List Groups** - Better data organization
7. **TeamDetailModal Enhancement** - Activate disabled features
8. **Enhanced Error Boundaries** - Better error handling
9. **PWA Installation Prompts** – Intelligent installation timing
10. **Mobile Carousel** - Improved mobile navigation
11. **Transfer History Accordion** - Organized historical data
12. **Notification System** - Actual notification functionality
13. **Multi-Roster Pattern Support** - Support 3/4/6-team rosters and custom patterns
14. **Advanced Accessibility** - Enhanced screen reader support
15. **Floating Action Button** - Quick actions overlay

## Technical Requirements

### Dependencies

- All components use existing `react-bootstrap` - no new dependencies
- Maintain existing responsive design
- Preserve accessibility standards
- Keep PWA functionality intact

### Testing Strategy

- Unit tests for all new components
- Integration tests for complex interactions
- Visual regression testing for UI changes
- Accessibility testing with screen readers

### Performance Considerations

- Lazy load modals and heavy components
- Optimize carousel for smooth animations
- Minimize re-renders with proper memoization
- Keep bundle size impact minimal

## Success Metrics

### User Experience

- Reduced cognitive load with visual progress indicators
- Improved discoverability with tooltips
- Enhanced mobile usability with touch-friendly components
- Better feedback with toast notifications

### Technical Quality

- Maintain 100% test coverage
- Zero accessibility regressions
- No performance degradation
- Clean, maintainable code architecture

## Changelog Integration

### In-App Changelog Viewer

- Accessible via settings panel
- Formatted changelog display
- Version history with dates
- Feature highlights with screenshots

### Version Tracking

- Semantic versioning (3.x.x)
- Git tags for releases
- Automated changelog generation
- Release notes in GitHub

## Risk Assessment

### Low-Risk

- Toast notifications (isolated feature)
- Progress bars (simple UI update)
- Tooltips (non-intrusive enhancement)

### Medium Risk

- Offcanvas settings (new navigation pattern)
- Modal components (focus management)

### High-Risk

- Carousel implementation (complex touch handling)
- Major layout changes (potential responsive issues)

## Future Considerations

### Potential Extensions

- Customizable themes
- Advanced notification preferences
- Keyboard shortcuts panel
- Export/import settings
- Integration with calendar apps

### User Account System (Future Phase)

- **Current**: localStorage-based preferences (device-bound, privacy-first)
- **Migration Path**: Hybrid localStorage + cloud sync approach
- **Benefits**: Multi-device sync, backup/restore, team sharing
- **Implementation Strategy**:
  - Phase 1: Keep current localStorage foundation ✅
  - Phase 2: Add optional account sync (hybrid approach)
  - Phase 3: Full multi-device real-time sync
- **Considerations**:
  - Maintain offline-first PWA capabilities
  - Preserve zero-infrastructure-cost option
  - Smooth migration without breaking changes

### Accessibility Enhancements

- High contrast mode
- Font size preferences
- Motion reduction settings
- Keyboard navigation improvements

---

**Last Updated**: 2025-07-25  
**Next Review**: After Phase 1 completion
