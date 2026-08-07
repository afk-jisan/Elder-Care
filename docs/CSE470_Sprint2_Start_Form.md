# CSE470 Sprint Update Form S16

**Sprint Status:** Start

**Submitted by:** baktier.galib@g.bracu.ac.bd

---

## Scrum Master

- **ID:** 23301302
- **Goals/Achievement:** Will implement **FR-16 (User and Role Management)** - admin create, edit, and deactivate accounts for all roles with historical data preserved; backend API and admin dashboard UI.
- **Branch:** `feature/FR-16-admin-users`
- **Work areas:** `server/controllers/adminUserController.js`, `server/routes/adminUserRoutes.js`, `client/src/pages/dashboards/AdminUsersPage.jsx`, shared shell `client/src/components/DashboardLayout.jsx`

## Group Member 2

- **ID:** 22201800
- **Goals/Achievement:** Will implement **FR-01 (GeoIP Check-In and Check-Out)** - caregiver check-in/out within 50 m of the elder address, timestamped checkout photo, and records visible for the care feed.
- **Branch:** `feature/FR-01-check-in`
- **Work areas:** `server/models/` (visit/check-in), `server/controllers/`, `server/routes/caregiverRoutes.js`, `client/src/pages/dashboards/CaregiverCheckInPage.jsx`

## Member 3

- **ID:** 22201682
- **Goals/Achievement:** Will implement **FR-06 (Care Plan and Caregiver Assignment)** - family creates a care plan, selects a service package, and assigns a caregiver from the vetted pool with acceptance flow. Include elder address/GPS so check-in can work.
- **Branch:** `feature/FR-06-care-plan`
- **Work areas:** `server/models/Elder.js`, `CarePlan`, family controllers/routes, `client/src/pages/dashboards/FamilyCarePlanPage.jsx`

## Member 4

- **ID:** 21301734
- **Goals/Achievement:** Will implement **FR-14 (Manage Availability Schedule)** - doctor sets availability by day and time range so session requests can be limited to those windows.
- **Branch:** `feature/FR-14-availability`
- **Work areas:** `server/models/DoctorAvailability.js`, doctor controllers/routes, `client/src/pages/dashboards/DoctorAvailabilityPage.jsx`

---

## Shared (merge to main first)

- **Branch:** `feature/shared-dashboard-shell`
- Top bar + sidebar for all roles, CSS variables, placeholder routes for Sprint 2 pages.
- Teammates should branch from `main` after this shell is merged (or rebase onto it).

## How teammates push

1. Accept the GitHub invite and clone the repo.
2. `git checkout main && git pull`
3. `git checkout feature/FR-XX-...` (or create from main if empty)
4. Commit with your own `git config user.name` / `user.email` (must match your GitHub account).
5. `git push -u origin HEAD`

Do not ask someone else to push commits using your name. GitHub links avatars by the email on the commit; using another person's identity without their account is not allowed for this course project.
