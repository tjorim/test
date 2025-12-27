# Worktime

Worktime unifies holiday planning and rotation-based scheduling into a single offline-first web app so teams can align time-off requests with shift coverage without needing a server. It combines lightweight `.hday` files for time-off data with deterministic schedule rules that run entirely in the browser.

**Product positioning**
- **All-in-one planner**: plan time off and validate coverage against shift rotations in one view.
- **Offline-first**: local files + in-browser logic, no backend required.
- **Portable data**: simple, human-readable formats that travel with the team.
- **Merge-ready**: intentionally bridges HdayPlanner’s holiday focus and NextShift’s schedule logic.

## Overview

Worktime is an offline-first planning tool that lets people request, review, and coordinate time off while keeping shift rotations intact. It loads time-off data from local `.hday` files and applies schedule rules in the browser to visualize coverage and conflicts, all without requiring a backend.

## Key Features

- Time-off planning with `.hday` files
- Rotation-based schedule visualization
- Conflict detection between time off and shifts
- Local-first data handling for privacy and portability
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

Worktime treats time-off data and schedule logic as complementary inputs to a single in-browser calculation. The `.hday` files represent requests and approved time off, while deterministic rotation rules generate expected staffing. The UI overlays these two datasets to highlight coverage gaps and conflicts. Because both data sources live locally and the logic is deterministic, the app can operate fully offline without any server.

## Comparison to Current Tools

**HdayPlanner vs NextShift**

- **HdayPlanner**: excels at time-off capture and simple holiday planning, but lacks schedule context.
- **NextShift**: excels at rotation logic and coverage visualization, but lacks integrated time-off data.
- **Worktime**: intentionally merges both workflows into a single, offline-first experience.

## Quick Start

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd worktime
   # install dependencies
   ```
2. **Run locally**
   ```bash
   # start the dev server
   ```
3. **Example workflow**
   - Load a `.hday` file with upcoming requests.
   - Configure rotation rules for your team’s shifts.
   - Review coverage conflicts and adjust time off or rotations.

## Roadmap

- Time-off approval flows
- Shared team views with optional backend storage
- Calendar integrations and export automation
- Policy rules (blackout dates, minimum coverage)

## Contributing

Contributions are welcome. Please open an issue to discuss changes, then submit a PR with clear context and screenshots for any UI updates.

## Status

Project setup in progress.
