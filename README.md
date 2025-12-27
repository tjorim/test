# Worktime

Worktime is the proposed merge of HdayPlanner and NextShift: an offline-first, browser-only planner that overlays `.hday` time-off files on top of deterministic shift rotations so teams can balance coverage and leave without needing a backend.

**Product positioning**
- **Unified planning context**: view holidays/time off and shift rotations together.
- **Frontend-first**: runs entirely in the browser (local files + deterministic rules).
- **Portable data**: `.hday` files and simple configs stay with the team.
- **Merge intent**: combines HdayPlanner’s time-off editor with NextShift’s schedule engine.

## Overview

Worktime brings together holiday planning and rotation-based scheduling in one offline-first web application. The recommended integration path is to keep NextShift as the shell (PWA + rotation views) and embed HdayPlanner’s `.hday` import/edit/export workflow, so a single UI can show coverage alongside time off.

## Key Features

- Import, edit, and export `.hday` time-off files
- Rotation-based schedule generation in the browser
- Overlay holidays on shift views to detect conflicts
- Offline-first operation with local storage
- Exportable views for sharing and review

## Who It’s For

- Team leads coordinating shift coverage
- Small operations groups without dedicated HR systems
- Distributed teams needing offline-first planning

## Data Sources/Formats

- **`.hday` time-off files**: human-readable holiday/time-off entries stored locally
- **Schedule rules**: deterministic rotation logic defined in configuration files
- **Exports**: optional CSV or calendar-friendly outputs for sharing

## Architecture (frontend-only + optional backend)

- **Frontend-only**: the browser loads `.hday` files and schedule configs, then computes coverage and conflicts locally.
- **Optional backend**: a future enhancement could centralize storage, approvals, and notifications, but the core product works fully without it.

## Time-Off + Schedule Logic (No Backend)

Worktime merges two inputs into a single in-memory event model: imported `.hday` holidays and computed shift events. The schedule engine deterministically generates shifts in the browser, and the UI overlays time-off entries to highlight gaps or conflicts. Because both sources are local and the rules are deterministic, the app can run entirely offline with no server.

## Comparison to Current Tools

**HdayPlanner vs NextShift**

- **HdayPlanner**: excels at time-off capture and `.hday` editing, but lacks schedule context.
- **NextShift**: excels at rotation logic and coverage visualization, but lacks integrated time-off data.
- **Worktime**: intentionally merges both workflows into a single, offline-first experience.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run locally**
   ```bash
   npm run dev
   ```
3. **Example workflow**
   - Import a `.hday` file with upcoming requests.
   - Configure rotation rules for your team’s shifts.
   - Review coverage conflicts and adjust time off or rotations.

## Roadmap

- Holiday overlay on shift views (merge-ready UI)
- Unified event model for shifts + time off
- Optional shared team storage and approval flows
- Calendar integrations and export automation

## Contributing

Contributions are welcome. Please open an issue to discuss changes, then submit a PR with clear context and screenshots for any UI updates.

## Status

Project setup in progress.
