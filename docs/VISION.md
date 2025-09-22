# Project Vision — Number Systems Tutor (Binary ⇄ Decimal ⇄ Hex)

## Project name
Number Systems Tutor

## One-line elevator pitch
A lightweight interactive web app that teaches beginner CS students how to convert between binary, decimal and hexadecimal with step-by-step explanations, visual bit visualizers, and a comparison table.

## Problem statement
Many beginner computer science students find it hard to understand how binary and hexadecimal relate to decimal, and they lack a simple visual/interactive tool that shows *how* the conversion works step by step.

## Target users
- Undergraduate and high-school students learning computer organization or introductory CS.
- Instructors who want a demonstrative tool for lectures.
- Self-learners practicing conversions.

## Key features (MVP)
1. Convert numbers between Binary, Decimal, Hexadecimal.
2. Step-by-step breakdown of how each conversion was computed.
3. Visualizer: bits shown as ON/OFF boxes or circles (grouped by nibbles for hex).
4. Comparison table showing numbers 1–20 in all three bases.
5. Theme toggle: Light/Dark mode (persisted).
6. Optional: Save conversion logs to DB for review.

## Success criteria (MVP)
- A user can enter a number in any of the three bases and get correct conversions + readable step explanation on the same screen.
- Visualizer updates correctly for the resulting binary representation.
- Comparison table (1–20) is accurate.
- Theme persists between sessions.

## Out of scope (initially)
- Authentication / multi-user profiles.
- Conversions beyond reasonable input length limits (e.g., arbitrary huge integers) — we accept defined limits for MVP.
- Complex analytics dashboards.

## Non-functional targets (high level)
- API response < 1 second for typical inputs.
- Mobile responsive UI.
- Accessibility: keyboard navigable visualizer, ARIA labels.

## Stakeholders
- You (product owner / developer)
- Students / Teachers (users)
- Optional: Instructor / reviewer (for UAT)

## Where to start
1. Create repo and branch `feature/convert-system-ui-api`.
2. Draft documents in `docs/` (this file included).
3. Implement backend API and simple frontend skeleton.
