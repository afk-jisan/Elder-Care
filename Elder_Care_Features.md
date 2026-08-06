# Feature List

## Elder Care
*A digital platform to prevent elderly neglect in Bangladesh*

| | |
|---|---|
| **Document Type** | Feature List |
| **Version** | v1.0 |
| **Date** | June 2026 |
| **Team Size** | 4 Members |
| **Features per Member** | 5 |

---

## 1. Project Overview

Elder Care is a proxy-child and elderly care platform built for families who cannot be physically present with their elderly relatives. It connects four types of users: family members managing care remotely, caregivers visiting the elderly on the ground, doctors providing remote medical consultations, and platform admins ensuring trust and operations.

The platform solves a documented problem in Bangladesh. Adult children migrate abroad or to other cities for work, leaving elderly parents without consistent care or oversight. Even when a relative lives with the elder, neglect and isolation remain common. Elder Care provides transparency, accountability, emergency response, and remote medical access without requiring any family member to be physically present.

### Feature Summary

| # | Feature | Dashboard | ID |
|---|---|---|---|
| 1 | GeoIP Check-In and Check-Out | Caregiver Dashboard | C-01 |
| 2 | Initiate Medical Video Session | Caregiver Dashboard | C-02 |
| 3 | Upload Prescription Image | Caregiver Dashboard | C-03 |
| 4 | Log Vitals and Behavioral Notes | Caregiver Dashboard | C-04 |
| 5 | View and Complete Assigned Tasks | Caregiver Dashboard | C-05 |
| 6 | Care Plan and Caregiver Assignment | Family Dashboard | F-01 |
| 7 | Escrow Wallet and Payment Release | Family Dashboard | F-02 |
| 8 | Direct Utility Bill Payment | Family Dashboard | F-03 |
| 9 | Medical Document Vault | Family Dashboard | F-04 |
| 10 | Real-Time Care Status Feed | Family Dashboard | F-05 |
| 11 | Join Video Consultation | Doctor Dashboard | D-01 |
| 12 | View Uploaded Prescriptions | Doctor Dashboard | D-02 |
| 13 | Write Post-Session Notes and Prescription | Doctor Dashboard | D-03 |
| 14 | Manage Availability Schedule | Doctor Dashboard | D-04 |
| 15 | Doctor Rating and Review | Doctor Dashboard | D-05 |
| 16 | User and Role Management | Admin Dashboard | A-01 |
| 17 | Caregiver Vetting Pipeline | Admin Dashboard | A-02 |
| 18 | Escrow Dispute Resolution | Admin Dashboard | A-03 |
| 19 | SOS Alert and Emergency Cascade | Admin Dashboard | A-04 |
| 20 | Analytics and Report Dashboard | Admin Dashboard | A-05 |

---

## 2. Caregiver Dashboard
*Local vetted professional visiting the elder | 5 Features*

### C-01 - GeoIP Check-In and Check-Out
The caregiver checks in when they arrive at the elder's location and checks out when they leave. Both actions are validated against the elder's registered GPS coordinates. A task cannot be started without a successful check-in.

- Check-in is only accepted if the caregiver's device location is within 50 meters of the elder's registered address
- Check-out requires a timestamped photo of the elder
- Check-in and check-out times are recorded and visible to the family on the status feed
- A GeoIP mismatch triggers an automatic flag sent to the admin

### C-02 - Initiate Medical Video Session
The caregiver requests a 1-on-1 video consultation with a doctor on behalf of the elder using the 100ms.live integration. The session connects the caregiver, with the elder present, and the doctor.

- Caregiver selects an available doctor from the platform's verified doctor list
- Session request is sent to the doctor and confirmed only during the doctor's set availability window
- Video session runs on our own platform with 100ms.live integration
- Session duration and doctor ID are logged automatically after the call ends
- The family receives a push notification when a session is initiated on behalf of their elder

### C-03 - Upload Prescription Image
During or after a medical session, the caregiver can upload prescriptions. The image is stored via imgbb and linked to the elder's profile in the platform.

- Caregiver uses the in-app camera or gallery to select the prescription image
- Image is uploaded to imgbb and the returned URL is saved against the elder's record
- Uploaded prescriptions are visible to the doctor in current and future sessions
- The family can also view all uploaded prescriptions from the Medical Document Vault

### C-04 - Log Vitals and Behavioral Notes
After each visit, the caregiver records the elder's daily vitals and optional behavioral observations. This is the primary health data input for the platform.

- Required vitals: blood pressure, blood sugar level, body weight
- Optional: temperature when flagged as elevated
- Behavioral Notes is a free-text field for cognitive or emotional observations
- Entries with keywords indicating decline are flagged automatically for family review
- All vitals are timestamped and attributed to the caregiver who submitted them

### C-05 - View and Complete Assigned Tasks
The caregiver sees all tasks assigned to them for the current day and upcoming schedule. They mark tasks completed after verification. This is the caregiver's primary workflow.

- Task list shows elder name, address, task type, required time, and completion method
- Tasks are ordered by scheduled time and filterable by status
- Marking a task complete requires the GeoIP check-in to already be active
- Completed tasks are locked from editing and become part of the audit log

---

## 3. Family Dashboard
*Overseas or remote family member managing care | 5 Features*

### F-01 - Care Plan and Caregiver Assignment
The family member creates or updates the elder's care plan, choosing a service package and assigning a caregiver from the platform's vetted pool. This is the starting point for all caregiving on the platform.

- Three packages available: Companion (3x visit per week), Medical (daily visit), Errand (on-demand visit)
- Family member browses caregiver profiles with ratings, verification status, and availability
- Assignment is confirmed only if the caregiver accepts the plan
- Care plan changes take effect from the next scheduled visit

### F-02 - Escrow Wallet and Payment Release
The family member loads a monthly budget into a ring-fenced escrow wallet. Funds are released to caregivers automatically when tasks are verified, or manually for one-time approvals.

- Family member can set category-level spending limits per item type such as groceries, medicine, and transport
- Automatic release triggers when a caregiver completes a GPS-verified task with photo proof
- One-time releases above 10,000 BDT require OTP confirmation from the family member before the funds are released
- Ledger shows every payment and remaining budget

### F-03 - Direct Utility Bill Payment
The family member pays the elder's utility bills directly through the platform, removing the need for the elder to handle collectors or cash.

- Family member adds the elder's utility account numbers once (DESCO, WASA, Titas Gas, internet)
- Bill amount entered manually, or captured from a photo of the bill
- Reminder sent before the typical due date
- Payment fires through the platform's payment gateway
- Receipt and payment history saved to the elder's profile

### F-04 - Medical Document Vault
A secure, encrypted store for all of the elder's health records. Documents can be shared instantly with emergency responders or viewed by the assigned doctor during a consultation.

- Stored documents include NID, blood type, allergy list, ECGs, and active prescriptions
- Caregiver-uploaded prescription images are also linked here automatically
- Family members can upload new documents directly from their own dashboard
- Vault contents can be shared via a time-limited link with a doctor or hospital
- All data is encrypted at rest

### F-05 - Real-Time Care Status Feed
The family member sees a live summary of the elder's daily care without needing to ask anyone. The feed aggregates caregiver check-ins, vitals, task completions, and session logs into one view.

- Shows caregiver check-in and check-out times for the current day
- Displays today's vitals once the caregiver submits them
- Shows task completion status for all assigned tasks
- Any behavioral flags or SOS events appear at the top of the feed with a timestamp
- Video session records including doctor name, duration, and date are listed under medical activity

---

## 4. Doctor Dashboard
*Verified medical professional on the platform | 5 Features*

### D-01 - Join Video Consultation
When a caregiver initiates a session request, the doctor receives a notification and joins the video call. This is the core interaction feature for the doctor.

- Doctor receives a push notification with elder name and caregiver name when a request comes in
- Doctor can accept or decline within 60 seconds before the request times out
- On accepting, the 100ms.live session opens directly in the dashboard
- Session is only available within the doctor's marked availability window
- Session end is logged with duration and linked to the elder's profile automatically

### D-02 - View Uploaded Prescriptions
Before and during a session, the doctor can view all prescription images uploaded by the caregiver for the elder. This gives the doctor context on current medications and past diagnoses.

- Prescriptions are listed by upload date with the caregiver's name attached
- Images load from imgbb URLs stored in the backend
- Doctor can view prescriptions from past sessions as well as the current one

### D-03 - Write Post-Session Notes and Prescription
After a consultation ends, the doctor writes structured session notes and issues a digital prescription. Both are stored in the elder's profile and visible to the family and caregiver.

- Session notes include diagnosis, observations, and recommended follow-up
- Digital prescription lists medicine name, dosage, frequency, and duration
- Notes and prescription are locked for editing 24 hours after submission
- Family receives a push notification when notes are submitted
- Caregiver can view the prescription to initiate a medicine refill

### D-04 - Manage Availability Schedule
The doctor sets the days and time windows when they are available for session requests. Caregivers can only send session requests during these windows.

- Doctor sets availability by day of week and time range
- Changes to availability take effect immediately
- If the doctor is unavailable, the session request shows a no doctors available state to the caregiver

### D-05 - Doctor Rating and Review
After a session ends, the family member rates the doctor and leaves an optional written review. This feeds into the doctor's quality score on the platform.

- Rating is on a scale of 1 to 5 and is submitted by the family member after each session
- Written review is optional and limited to 300 characters
- Ratings are visible to admin and used in doctor quality monitoring
- Doctors can see their own average rating but cannot see individual reviewer identities

---

## 5. Admin Dashboard
*Platform operations and trust and safety team | 5 Features*

### A-01 - User and Role Management
Admin registers, edits, and deactivates all user accounts on the platform. This covers caregivers, doctors, family members, and other admins. All role assignments are controlled here.

- Create accounts for any role: family member, caregiver, doctor, admin
- Assign or change a user's role with an audit log entry
- Deactivate an account without deleting it, preserving all historical data
- Reset passwords

### A-02 - Caregiver Vetting Pipeline
Admin manages the multi-step background check process for every caregiver before they are allowed to take assignments. Each step requires admin sign-off.

- Step 1: NID verification
- Step 2: Police clearance certificate upload and manual admin review
- Step 3: Two reference checks, at least one from a ward councilor or institution
- Step 4: Probation period with admin-reviewed task logs and ratings before full activation

### A-03 - Escrow Dispute Resolution
When a payment is contested between a family member and a caregiver, admin reviews the evidence and issues a ruling. The escrow funds are held until the ruling is made.

- Admin accesses the GPS check-in log, task photos, and caregiver submission for the disputed task
- Admin can view the full transaction ledger for the relevant escrow wallet
- Ruling options are: release funds to caregiver, refund to family member, or split
- All rulings are logged with admin ID, timestamp, and written reason
- Both parties are notified of the ruling via push notification

### A-04 - SOS Alert and Emergency Cascade
When an SOS is triggered by the caregiver, the platform automatically notifies the family member and pre-set local contacts in sequence. Admin can monitor and intervene in active SOS events.

- SOS can be triggered by the caregiver through their dashboard.
- System immediately calls the assigned caregiver, then sends an SMS with GPS location to the family member
- If no response is confirmed within 15 minutes, admin receives an escalation alert
- Admin can view all active and resolved SOS events with full timeline logs
- Each SOS event is stored with trigger source, timestamp, GPS location, and resolution note

### A-05 - Analytics and Report Dashboard
Admin views aggregate platform metrics across all roles. This supports operational decisions and provides data for reporting to stakeholders.

- Total active elders, caregivers, doctors, and family members on the platform
- Number of tasks completed, disputed, and cancelled in a selected time range
- Total escrow volume processed and average transaction size
- Video session count, average duration, and doctor utilization rate
- Exportable as a CSV or PDF report for the selected date range
