# FR Implementation Progress

**Branch:** `integration` (local only; do not push until PAT handoff)  
**Last updated:** 2026-08-09  
**Rules:** one FR at a time, smoke test green, then commit, then update this file.

## Ownership by dashboard

| Owner | GitHub / email | Role | FRs |
|-------|----------------|------|-----|
| Pranto Mahmud | `prm-creator` / `pranto.mahmud@g.bracu.ac.bd` | Admin | FR-16, FR-17, FR-18, FR-19, FR-20 |
| Baktier Galib | `baktier.galib@g.bracu.ac.bd` | Family | FR-06, FR-07, FR-08, FR-09, FR-10 |
| Muntasir Fahim | `muntasir.fahim@g.bracu.ac.bd` | Caregiver | FR-01, FR-02, FR-03, FR-04, FR-05 |
| Sadhman Hossain | `sadhman.hossain@g.bracu.ac.bd` | Doctor | FR-11, FR-12, FR-13, FR-14, FR-15 |

## Status board

| FR | Title | Owner | Status | Commit | Test |
|----|-------|-------|--------|--------|------|
| FR-01 | GeoIP check-in / check-out | Muntasir | Done | Sprint 2 stack / remote rebuilt | `npm run test:fr01` |
| FR-02 | Initiate medical video session | Muntasir | Pending | | |
| FR-03 | Upload prescription image | Muntasir | Pending | | |
| FR-04 | Log vitals and behavioral notes | Muntasir | Done | `765e7a9` | `npm run test:fr04` |
| FR-05 | View and complete assigned tasks | Muntasir | Done | `2fd1985` | `npm run test:fr05` |
| FR-06 | Care plan and caregiver assignment | Baktier | Done | Sprint 2 stack | `npm run test:fr06` |
| FR-07 | Escrow wallet and payment release | Baktier | Pending | | |
| FR-08 | Direct utility bill payment | Baktier | Pending | | |
| FR-09 | Medical document vault | Baktier | Pending | | |
| FR-10 | Real-time care status feed | Baktier | Done | `0ae7cf3` | `npm run test:fr10` |
| FR-11 | Join video consultation | Sadhman | Pending | | |
| FR-12 | View uploaded prescriptions | Sadhman | Pending | | |
| FR-13 | Post-session notes and digital Rx | Sadhman | Pending | | |
| FR-14 | Manage availability schedule | Sadhman | Done | Sprint 2 stack | `npm run test:fr14` |
| FR-15 | Doctor rating and review | Sadhman | Pending | | |
| FR-16 | User and role management | Pranto | Done | Sprint 2 stack | Manual + prior smoke |
| FR-17 | Caregiver vetting pipeline | Pranto | Done | `19de0f5` | `npm run test:fr17` |
| FR-18 | Escrow dispute resolution | Pranto | Pending | | |
| FR-19 | SOS alert and emergency cascade | Pranto | Pending | | |
| FR-20 | Analytics and report dashboard | Pranto | Pending | | |

**Done:** 8 / 20  
**Next up:** FR-03 (prescription upload) and FR-09 (document vault).

## File map (implemented)

### FR-01 Check-in
- `server/models/Visit.js`
- `server/controllers/caregiverCheckInController.js`
- `server/routes/caregiverRoutes.js` (visits/check-in/out)
- `server/utils/geo.js`
- `client/src/pages/dashboards/CaregiverCheckInPage.jsx`
- `server/scripts/test-fr01.js`

### FR-10 Care feed
- `server/controllers/careFeedController.js`
- `server/routes/familyRoutes.js` (`GET /feed`)
- `client/src/pages/dashboards/FamilyCareFeedPage.jsx`
- `server/scripts/test-fr10.js`

### FR-04 Vitals
- `server/models/VitalsLog.js`
- `server/controllers/vitalsController.js`
- `server/routes/caregiverRoutes.js`, `server/routes/familyRoutes.js`
- `client/src/pages/dashboards/CaregiverVitalsPage.jsx`
- `server/scripts/test-fr04.js`

### FR-05 Tasks
- `server/models/Task.js`
- `server/controllers/caregiverTaskController.js`
- `server/routes/caregiverRoutes.js`, `server/routes/familyRoutes.js`
- `client/src/pages/dashboards/CaregiverTasksPage.jsx`
- `client/src/pages/dashboards/FamilyCarePlanPage.jsx` (assign task)
- `server/scripts/test-fr05.js`

### FR-06 Care plan
- `server/models/Elder.js`, `server/models/CarePlan.js`
- `server/controllers/familyCarePlanController.js`
- `server/routes/familyRoutes.js`, `server/routes/geoRoutes.js`, `server/utils/geocode.js`
- `client/src/pages/dashboards/FamilyCarePlanPage.jsx`
- `server/scripts/test-fr06.js`

### FR-14 Availability
- `server/models/DoctorAvailability.js`
- `server/controllers/doctorAvailabilityController.js`
- `server/routes/doctorAvailabilityRoutes.js`
- `client/src/pages/dashboards/DoctorAvailabilityPage.jsx`
- `server/scripts/test-fr14.js`

### FR-16 Admin users
- `server/controllers/adminUserController.js`
- `server/routes/adminUserRoutes.js`
- `client/src/pages/dashboards/AdminUsersPage.jsx`

### FR-17 Vetting
- `server/models/CaregiverVetting.js`
- `server/controllers/adminVettingController.js`
- `server/routes/adminVettingRoutes.js`
- `server/models/User.js` (`verificationStatus`)
- `server/controllers/familyCarePlanController.js` (vetted pool gate)
- `client/src/pages/dashboards/AdminVettingPage.jsx`
- `server/scripts/seed.js`, `server/scripts/test-fr17.js`

## Loop log

| Date | Action |
|------|--------|
| 2026-08-09 | FR-17 implemented, tested, committed `19de0f5` |
| 2026-08-09 | FR-05 implemented, tested, committed `2fd1985` |
| 2026-08-09 | Created this tracker; continuing with FR-04 |
| 2026-08-09 | FR-04 implemented, tested, committed `765e7a9` |

## Notes

- External services (100ms, payment gateway, SMS, imgbb) are **mocked** for local runs.
- Commits on `integration` use local git identity for now; remote feature branches get owner authors at PAT handoff.
- Sprint 2 forms under `docs/CSE470_Sprint2_*` may sit uncommitted separately from FR work.

| 2026-08-09 | FR-10 implemented, tested, committed `0ae7cf3` |
