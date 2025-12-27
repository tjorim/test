# Feasibility Study: HdayPlanner + NextShift (and optional ShiftScheduler reuse)

## Scope
This document captures a concrete feasibility assessment and an implementation-ready integration proposal for combining:
- **HdayPlanner** (React/Vite, `.hday` time-off editor, optional FastAPI backend)
- **NextShift** (React/Vite PWA, 5-team rotation schedule viewer)

It also notes optional logic extraction for **ShiftScheduler** (Mendix widget).

## Executive Summary
A merge **can make sense** if the target audience needs both **shift-rotation visibility** and **holiday/time-off planning** in one experience. The two apps are technically aligned (React + Vite + TypeScript) and share offline-first expectations. The most viable path is a **front-end merge** that preserves NextShift’s PWA shell while adding `.hday` import/export and event editing from HdayPlanner. This avoids backend requirements and retains simple deployment.

If the audiences diverge (e.g., some users only need shift rotation and others only need vacation tracking), a full merge risks unnecessary complexity. In that case, shared libraries (date/shift utilities + `.hday` parsing) are the safer choice.

## Benefits of Merging
- **Unified scheduling context**: see shifts and holidays together, improving coverage planning.
- **Shared tooling**: both use React/Vite/TypeScript; CI, linting, and testing can converge.
- **Offline-first consistency**: no backend required for core functionality.
- **Single deployment**: one PWA for shift + holiday planning.

## Downsides / Risks
- **Domain complexity**: `.hday` events are file-based; shifts are algorithmic. A unified model must avoid conflating these.
- **UX bloat**: NextShift is intentionally lightweight; adding a full event editor could reduce clarity.
- **Potential backend drift**: HdayPlanner’s optional backend could creep into a product that should remain static/offline.
- **Maintenance overhead**: more features and surfaces to test.

## Proposed Integration Architecture
### 1) Shared Domain Model
Introduce a single in-memory model that supports both computed shifts and imported events.

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

- **Shift events**: generated from NextShift’s rotation algorithm.
- **Holiday events**: imported from `.hday` files (HdayPlanner logic).
- **Assignment events**: optional future type aligned with ShiftScheduler categories.

### 2) Integration Option (Recommended)
**Use NextShift as the shell** and embed HdayPlanner features:
- Add a **Holiday** tab to NextShift’s view switcher.
- Provide `.hday` import/export controls.
- Overlay holiday events onto the schedule view.
- Reuse HdayPlanner’s validation and editor UX where feasible.

This keeps the fast, offline PWA experience and avoids backend dependencies.

### 3) Alternative Option
**Use HdayPlanner as the shell** and add a **Shift** tab:
- Build shift-rotation calculations into HdayPlanner.
- Add shift overlays to its month calendar and list views.

This is stronger if time-off editing is the core priority but may be heavier for quick daily use.

## Concrete Implementation Approach (No Backend)
1. **Extract `.hday` parser/serializer** from HdayPlanner into a shared `lib/hday` module.
2. **Extract shift rotation engine** from NextShift into a shared `lib/shift` module.
3. **Add a unified event store** that merges computed shifts + imported holidays.
4. **Render overlays** in schedule views (NextShift timeline + schedule view).
5. **Add event editor** for `.hday` events only (shift events remain computed).
6. **Preserve offline use**: local storage for user preferences and cached `.hday` content.

## Feasibility Assessment
- **Technical fit**: High (shared frameworks, similar stack).
- **Product fit**: Medium–High if the audience overlaps.
- **Integration complexity**: Moderate; major work is model alignment and UX design.
- **Risk**: UX bloat and domain confusion if not scoped.

## Name Suggestions (Merged Product)
- **Shift & Holiday Planner**
- **ShiftDay**
- **RosterTime**
- **TeamTime**
- **HdayShift**
- **ShiftPlanner 24/7**

## Optional: Reuse for ShiftScheduler (Mendix Widget)
Extract pure TS utilities for re-use:
- **Shift rotation engine**: input `reference date + team + target date` → output `shift code`.
- **`.hday` parser**: map holidays to a generic event model (H, T, etc.).

These can be wrapped inside the Mendix widget without UI sharing. Mendix’s data model and microflows can consume the computed outputs to render timeline overlays.

## When a Merge Does NOT Make Sense
- If the target users are distinct (vacation planners vs shift-only users).
- If organizations cannot accept any additional UI complexity.
- If the `.hday` file format is only needed internally while NextShift is public/standalone.

## Next Steps (Implementation Ready)
- Decide the host app (NextShift shell recommended).
- Align on a unified event model and extract shared libs.
- Build the holiday overlay + import/export surface.
- Iterate on UX to keep the core shift view fast and minimal.

