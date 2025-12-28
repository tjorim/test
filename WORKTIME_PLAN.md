# Worktime Integration Plan

This document captures the shared product workflows, domain model, base project selection, shared extraction targets, and migration plan for the Worktime merge of NextShift and HdayPlanner.

## 1. Primary user workflows

- **Check schedule & coverage**
  - Open the rotation schedule view and see shift assignments alongside time-off overlays.
  - Use today/schedule/transfer views for fast navigation and coverage checks.
- **Add/edit time off**
  - Import a `.hday` file, edit or add events, then export back to `.hday`.
  - Validate events in a calendar/editor interface with inline feedback.
- **Export/share**
  - Export updated `.hday` files or derived formats (CSV/iCal) for sharing and review.

## 2. Shared domain model

### Events

A unified event model combines computed shifts and imported holidays/time off:

```ts
export type EventType = "shift" | "holiday" | "assignment";

export interface CalendarEvent {
  id: string;
  type: EventType;
  start: string; // ISO date
  end: string;   // ISO date
  label?: string;
  meta?: Record<string, unknown>;
}
```

- **Shift events** are computed from deterministic rules (NextShift logic).
- **Holiday/time-off events** are parsed from `.hday` files (HdayPlanner logic).
- **Assignment events** reserve room for future team/task allocations.

### Shift rules

- 10-day rotating cycle (M/E/N + off days), with team offsets.
- Anchor calculations to a configured reference date/team.

### Time-off formats

- `.hday` is the canonical format (line-based events + flags for types and recurrences).
- Preserve `.hday` parity for import/export.

## 3. Base project selection

**Choice: NextShift as the shell**

Reasons:

- Already a lightweight PWA with offline-first behavior.
- Rotation schedule views are the core navigation experience for shift teams.
- HdayPlanner’s `.hday` editing can be integrated without introducing backend needs.
- Keeps a fast, schedule-first UI while embedding time-off workflows behind a dedicated tab.

## 4. Extraction candidates (shared utilities)

- **`.hday` parser/serializer**
  - Extract from HdayPlanner’s frontend (`frontend/src/lib/hday.ts` and related helpers).
- **Shift rotation engine**
  - Extract from NextShift’s calculation logic into a pure TypeScript module.
- **Date utilities + formatting**
  - Consolidate date parsing/formatting helpers used by both apps.
- **Config loader**
  - Normalize environment/runtime config handling for reference date/team and user prefs.

## 5. Migration phases & compatibility requirements

### Phase 1: Library extraction

- Isolate `.hday` parsing/validation into `lib/hday`.
- Isolate shift rotation logic into `lib/shift`.
- Add shared date/config utilities.

### Phase 2: Unified event store

- Build an in-memory event store combining computed shifts + `.hday` events.
- Define event merge rules and overlay semantics.

### Phase 3: UI integration (NextShift shell)

- Add a **Holiday/Time Off** tab to NextShift.
- Integrate `.hday` import/export and editor UI.
- Overlay holiday events on schedule and transfer views.

### Phase 4: Refinement & export

- Add/export CSV or iCal adapters (optional).
- Iterate on UX to keep shift views fast and uncluttered.

### Compatibility requirements

- Offline-first operation (no backend dependency for core flows).
- Deterministic schedule calculation using the existing reference date/team model.
- Full `.hday` format compatibility for import/export.
- Maintain local storage compatibility for preferences and cached files.
