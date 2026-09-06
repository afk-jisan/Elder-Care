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
| FR-02 | Initiate medical video session | Muntasir | Done | `2f0fb08` | `npm run test:fr02` |
| FR-03 | Upload prescription image | Muntasir | Done | `5810034` | `npm run test:fr03` |
| FR-04 | Log vitals and behavioral notes | Muntasir | Done | `765e7a9` | `npm run test:fr04` |
| FR-05 | View and complete assigned tasks | Muntasir | Done | `2fd1985` | `npm run test:fr05` |
| FR-06 | Care plan and caregiver assignment | Baktier | Done | Sprint 2 stack | `npm run test:fr06` |
| FR-07 | Escrow wallet and payment release | Baktier | Done | `1252961` | `npm run test:fr07` |
| FR-08 | Direct utility bill payment | Baktier | Done | `1252961` | `npm run test:fr08` |
| FR-09 | Medical document vault | Baktier | Done | `5810034` | `npm run test:fr09` |
| FR-10 | Real-time care status feed | Baktier | Done | `0ae7cf3` | `npm run test:fr10` |
| FR-11 | Join video consultation | Sadhman | Done | `2f0fb08` | `npm run test:fr11` |
| FR-12 | View uploaded prescriptions | Sadhman | Done | `2f0fb08` | `npm run test:fr12` |
| FR-13 | Post-session notes and digital Rx | Sadhman | Done | `2f0fb08` | `npm run test:fr13` |
| FR-14 | Manage availability schedule | Sadhman | Done | Sprint 2 stack | `npm run test:fr14` |
| FR-15 | Doctor rating and review | Sadhman | Done | `2f0fb08` | `npm run test:fr15` |
| FR-16 | User and role management | Pranto | Done | Sprint 2 stack | Manual + prior smoke |
| FR-17 | Caregiver vetting pipeline | Pranto | Done | `19de0f5` | `npm run test:fr17` |
| FR-18 | Escrow dispute resolution | Pranto | Done | `2f0fb08` | `npm run test:fr18` |
| FR-19 | SOS alert and emergency cascade | Pranto | Done | `2f0fb08` | `npm run test:fr19` |
| FR-20 | Analytics and report dashboard | Pranto | Done | `2f0fb08` | `npm run test:fr20` |

**Done:** 20 / 20  
**Next up:** None. All FRs implemented on `integration`. Ready for PAT handoff / remote feature branches when approved.

## File map (implemented)

### FR-01 Check-in
- `server/models/Visit.js`
- `server/controllers/caregiverCheckInController.js`
- `server/routes/caregiverRoutes.js` (visits/check-in/out)
- `server/utils/geo.js`
- `client/src/pages/dashboards/CaregiverCheckInPage.jsx`
- `server/scripts/test-fr01.js`

### FR-02 Initiate video + FR-11 Join video
- `server/models/MedicalSession.js`
- `server/controllers/sessionController.js` (available doctors, initiate, respond, end)
- `server/routes/caregiverRoutes.js` (`/doctors/available`, `/sessions`)
- `server/routes/doctorRoutes.js` (`/sessions`, `/sessions/:id/respond|end`)
- `client/src/pages/dashboards/CaregiverVideoPage.jsx`
- `client/src/pages/dashboards/DoctorSessionsPage.jsx`
- `server/scripts/test-fr02.js` (covers FR-02 and FR-11)
- Mock 100ms room id; 60s accept window

### FR-03 Prescription upload
- `server/models/Prescription.js`
- `server/controllers/prescriptionController.js`
- `server/routes/caregiverRoutes.js`
- `client/src/pages/dashboards/CaregiverPrescriptionsPage.jsx`
- `server/scripts/test-fr03.js`

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

### FR-07 Escrow wallet
- `server/models/Wallet.js`, `server/models/Payment.js`
- `server/controllers/walletController.js`
- `client/src/pages/dashboards/FamilyWalletPage.jsx`
- `server/scripts/test-fr07.js`

### FR-08 Utility bills
- `server/models/UtilityBill.js`
- `server/controllers/utilityBillController.js`
- `client/src/pages/dashboards/FamilyUtilitiesPage.jsx`
- `server/scripts/test-fr08.js`

### FR-09 Medical vault
- `server/models/MedicalDocument.js`
- `server/controllers/vaultController.js`
- `server/routes/vaultPublicRoutes.js`
- `client/src/pages/dashboards/FamilyVaultPage.jsx`
- `server/scripts/test-fr09.js`

### FR-10 Care feed
- `server/controllers/careFeedController.js`
- `server/routes/familyRoutes.js` (`GET /feed`)
- `client/src/pages/dashboards/FamilyCareFeedPage.jsx`
- `server/scripts/test-fr10.js`

### FR-12 Doctor view prescriptions
- `server/controllers/prescriptionController.js` (`listDoctorPrescriptions`)
- `server/routes/doctorRoutes.js` (`GET /prescriptions`)
- `client/src/pages/dashboards/DoctorSessionsPage.jsx` (prescriptions table)
- `server/scripts/test-fr12.js`

### FR-13 Session notes + digital Rx
- `server/controllers/sessionController.js` (`writeSessionNotes`)
- `server/routes/doctorRoutes.js` (`POST /sessions/:id/notes`)
- `client/src/pages/dashboards/DoctorSessionsPage.jsx` (notes modal)
- `server/scripts/test-fr12.js` (also `test:fr13`)

### FR-14 Availability
- `server/models/DoctorAvailability.js`
- `server/controllers/doctorAvailabilityController.js`
- `server/routes/doctorAvailabilityRoutes.js`
- `client/src/pages/dashboards/DoctorAvailabilityPage.jsx`
- `server/scripts/test-fr14.js`

### FR-15 Doctor rating
- `server/models/Rating.js`
- `server/controllers/sessionController.js` (`rateDoctor`, `doctorAverageRating`)
- `server/routes/familyRoutes.js` (`GET /sessions`, `POST /sessions/:id/rate`)
- `client/src/pages/dashboards/FamilySessionsPage.jsx`
- `server/scripts/test-fr12.js` (also `test:fr15`)

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

### FR-18 Escrow disputes
- `server/models/Dispute.js`
- `server/controllers/adminOpsController.js` (`createDispute`, `listDisputes`, `resolveDispute`)
- `server/routes/familyRoutes.js` (`POST /disputes`)
- `server/routes/adminOpsRoutes.js`
- `client/src/pages/dashboards/FamilyWalletPage.jsx` (Dispute action)
- `client/src/pages/dashboards/AdminDisputesPage.jsx`
- `server/scripts/test-fr18.js`

### FR-19 SOS cascade
- `server/models/SOSEvent.js`
- `server/controllers/adminOpsController.js` (`triggerSos`, `listSos`, `escalateSos`, `resolveSos`)
- `server/routes/caregiverRoutes.js` (`POST /sos`)
- `client/src/pages/dashboards/CaregiverVideoPage.jsx` (Trigger SOS)
- `client/src/pages/dashboards/AdminSosPage.jsx`
- `server/scripts/test-fr18.js` (also `test:fr19`)

### FR-20 Analytics
- `server/controllers/adminOpsController.js` (`getAnalytics` JSON + CSV)
- `server/routes/adminOpsRoutes.js` (`GET /analytics`)
- `client/src/pages/dashboards/AdminAnalyticsPage.jsx`
- `server/scripts/test-fr18.js` (also `test:fr20`)

## Shared wiring for this batch

- `server/index.js` mounts `/api/doctor` and `/api/admin` ops routes
- `client/src/App.jsx` routes for video, sessions, disputes, SOS, analytics
- `client/src/lib/navConfig.js` nav links per role

## Loop log

| Date | Action |
|------|--------|
| 2026-08-09 | FR-17 implemented, tested, committed `19de0f5` |
| 2026-08-09 | FR-05 implemented, tested, committed `2fd1985` |
| 2026-08-09 | Created this tracker; continuing with FR-04 |
| 2026-08-09 | FR-04 implemented, tested, committed `765e7a9` |
| 2026-08-09 | FR-10 implemented, tested, committed `0ae7cf3` |
| 2026-08-09 | FR-03 and FR-09 implemented, tested, committed `5810034` |
| 2026-08-09 | FR-07 and FR-08 implemented, tested, committed `1252961` |
| 2026-08-09 | FR-02/11 video sessions smoke tests green |
| 2026-08-09 | FR-12/13/15 doctor Rx, notes, rating smoke tests green |
| 2026-08-09 | FR-18/19/20 disputes, SOS, analytics smoke tests green |
| 2026-08-09 | **20/20 FRs complete** on local `integration` (`2f0fb08`) |

## Notes

- External services: **100ms is live** (`HMS_ACCESS_KEY` / `HMS_APP_SECRET` in `server/.env`). Sessions create real rooms and return client auth tokens via `GET .../sessions/:id/token`.
- **ImgBB** is wired (`IMGBB_API_KEY`). The key currently returns ImgBB error 103 (forbidden); uploads automatically fall back to `server/uploads/` served at `/uploads/...`. Replace the key in `.env` when you have a working ImgBB account.
- Commits on `integration` use local git identity for now; remote feature branches get owner authors at PAT handoff.
- Sprint 2 forms under `docs/CSE470_Sprint2_*` may sit uncommitted separately from FR work.
- Video availability: doctor must have a slot covering the current weekday/time (tests create `00:00-23:59` for today).
- Default 100ms roles are `host` (doctor) and `guest` (caregiver); override with `HMS_ROLE_DOCTOR` / `HMS_ROLE_CAREGIVER` if your template uses different names.
