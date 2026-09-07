# Software Requirements Specification (Final)

## Elder Care

A digital platform to reduce elderly neglect in Bangladesh

**Course:** CSE470 Software Engineering  
**University:** BRAC University  
**Section:** 16  
**Group:** 4  


| Member Name     | Student ID |
| --------------- | ---------- |
| Baktier Galib   | 23301302   |
| Muntasir Fahim  | 22201800   |
| Pranto Mahmud   | 22201682   |
| Sadhman Hossain | 21301734   |


**Live application:** [https://eldercare-4mg.pages.dev](https://eldercare-4mg.pages.dev)  
**API:** [https://aware-reprieve-production-7023.up.railway.app/api](https://aware-reprieve-production-7023.up.railway.app/api)  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Functional Requirements](#2-functional-requirements)
3. [Non-Functional Requirements](#3-non-functional-requirements)
4. [Class Diagram](#4-class-diagram)
5. [Tools and Technologies](#5-tools-and-technologies)
6. [Compatibility with System Environment](#6-compatibility-with-system-environment)
7. [Implementation](#7-implementation)
8. [Challenges](#8-challenges)
9. [Conclusion](#9-conclusion)
10. [References](#10-references)

---



## 1. Introduction



### 1.1 Type of Project

Elder Care is a **web-based software project**. It is a full stack application with a React frontend and a Node.js backend. The system uses a REST API and a MongoDB database. It follows the **MVC pattern** (Model, View, Controller).

The project is built for **remote elderly care management**. Family members can monitor care from anywhere. Caregivers work on site. Doctors join through video calls. Admins manage trust and safety on the platform.

### 1.2 Purpose

Many families in Bangladesh cannot stay with elderly parents every day. Children may work in another city or abroad. Elders may live alone or with limited support. This can lead to neglect, missed health checks, and slow emergency response.

Elder Care solves this problem by giving families a single online place to:

- Plan and assign care
- Track daily visits and health logs
- Pay caregivers through escrow
- Pay utility bills for the elder
- Store medical documents
- Request doctor video consults
- Trigger and manage SOS alerts

The goal is **transparency** and **accountability**. Every important action is recorded. Family members can see what happened during the day without calling the caregiver again and again.

### 1.3 Target Users


| User Role         | Who They Are                                    | Main Goal                                                         |
| ----------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| **Family member** | Adult child or relative managing care from afar | Monitor elder health, pay for care, store records                 |
| **Caregiver**     | Trained person visiting the elder at home       | Check in on site, complete tasks, log vitals, request doctor help |
| **Doctor**        | Licensed medical professional on the platform   | Join video consults, review prescriptions, write session notes    |
| **Admin**         | Platform operator                               | Vet caregivers, manage users, resolve disputes, view analytics    |


Each role has a **separate dashboard** with features matched to their job.

---



## 2. Functional Requirements

The system has **20 functional requirements** across four dashboards. Each requirement has a unique ID from FR-01 to FR-20.

### 2.1 Caregiver Dashboard


| ID        | Requirement                                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **FR-01** | The caregiver can **check in** and **check out** at the elder home. GPS must be within **50 meters** of the registered address. Check-out needs a **photo proof**. |
| **FR-02** | The caregiver can **start a video consult** with a doctor who is available now. The doctor must accept within **60 seconds**. Video uses **100ms.live**.           |
| **FR-03** | The caregiver can **upload a prescription image**. The file is stored and linked to the elder profile. The doctor and family can view it later.                    |
| **FR-04** | The caregiver can **log daily vitals** (blood pressure, blood sugar, weight) and **behavioral notes**. Notes with decline keywords are **flagged** for the family. |
| **FR-05** | The caregiver can **view assigned tasks** and **mark them complete**. Completion is allowed only during an **active check-in** at that elder location.             |




### 2.2 Family Dashboard


| ID        | Requirement                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-06** | The family member can **register an elder**, create a **care plan**, pick a service package (Companion, Medical, Errand), and **assign a vetted caregiver**.                          |
| **FR-07** | The family member can manage an **escrow wallet**. They can set a monthly budget, load funds, and release payment to caregivers. Releases above **10,000 BDT** need **OTP** approval. |
| **FR-08** | The family member can **add utility bills** (DESCO, WASA, Titas Gas, Internet) and **pay from the wallet**. A receipt is saved after payment.                                         |
| **FR-09** | The family member can use a **medical document vault**. They can upload health records and create a **time-limited share link** for doctors or hospitals.                             |
| **FR-10** | The family member can open a **care status feed**. It shows today check-ins, vitals, tasks, alerts, and recent medical sessions in one screen.                                        |




### 2.3 Doctor Dashboard


| ID        | Requirement                                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-11** | The doctor can **accept or decline** a session request within 60 seconds and **join the video call** during their availability window.         |
| **FR-12** | The doctor can **view prescription images** uploaded by caregivers for their patients.                                                         |
| **FR-13** | The doctor can **write session notes** and issue a **digital prescription** after a consult ends. Notes lock **24 hours** after first save.    |
| **FR-14** | The doctor can set a **weekly availability schedule** by day and time range (Bangladesh time).                                                 |
| **FR-15** | The **family member** can **rate the doctor** (1 to 5 stars) and leave an optional review after an ended session. The doctor can view ratings. |




### 2.4 Admin Dashboard


| ID        | Requirement                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-16** | The admin can **create, update, and deactivate** user accounts for all roles. Deactivated accounts keep history in the database.        |
| **FR-17** | The admin can run the **caregiver vetting pipeline**: NID check, police clearance, reference check, probation, then activate or reject. |
| **FR-18** | The admin can **review escrow disputes** opened by family members and issue a ruling (release caregiver, refund family, or split).      |
| **FR-19** | The caregiver can **trigger SOS** from the video page. The family is notified. The admin can **escalate or resolve** the alert.         |
| **FR-20** | The admin can view an **analytics dashboard** with platform counts and payment volume. Reports can export as **CSV**.                   |


---



## 3. Non-Functional Requirements



### 3.1 Security

- Users must **log in** with email and password. Passwords are hashed with bcrypt before storage.
- API routes use **JWT tokens**. Each role can only access its own endpoints.
- Caregiver NID must be **8 digits**, start with **9**, and contain no letters.
- Phone numbers must start with **01** and follow the Bangladesh mobile format.
- Share links for medical documents **expire** after a set number of hours.
- Large wallet releases need **OTP** to reduce fraud risk.



### 3.2 Performance

- The care feed runs **five database queries in parallel** to load faster.
- Video and session pages use **polling** (every 5 to 8 seconds) to refresh status without full page reload.
- Images upload to **ImgBB** or local storage so the main server stays light.



### 3.3 Usability

- Each role has a **sidebar** with clear labels for every feature.
- Forms show **error messages** when validation fails (wrong GPS distance, low wallet balance, invalid NID).
- The family dashboard opens directly on **Care plan** so users start with the most important task.
- Maps help family members pin the elder home address for GPS check-in.



### 3.4 Reliability

- Check-in blocks duplicate active visits for one caregiver.
- Task completion requires proof of on-site presence through check-in.
- Doctor session notes cannot be edited after the 24-hour lock window.
- Dispute resolution updates payment and wallet status in one transaction flow.



### 3.5 Maintainability

- Backend code follows **MVC**. Models live in `server/models`. Controllers hold business rules. Routes map URLs to functions.
- Frontend pages are grouped by role under `client/src/pages/dashboards/`.
- Shared validation (NID, phone) lives in one utility file for reuse.



### 3.6 Scalability

- MongoDB Atlas hosts the database in the cloud.
- Frontend on **Cloudflare Pages** and backend on **Railway** can scale with traffic without local server setup.
- Stateless JWT auth allows horizontal scaling of API servers.

---



## 4. Class Diagram

The diagram below was created with **Mermaid** (rendered in GitHub, VS Code, or draw.io export). It shows main entities and relationships in the system.

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +String phone
        +String role
        +String passwordHash
        +Boolean isActive
        +login()
        +comparePassword()
    }

    class Elder {
        +String name
        +String address
        +Number latitude
        +Number longitude
        +Date dateOfBirth
    }

    class CarePlan {
        +String package
        +String status
        +Date startDate
    }

    class Visit {
        +String status
        +Date checkInAt
        +Date checkOutAt
        +Number checkInDistanceMeters
        +String checkOutPhotoUrl
    }

    class Task {
        +String type
        +String title
        +String status
        +Date scheduledTime
        +Date completedAt
    }

    class VitalsLog {
        +String bloodPressure
        +Number bloodSugar
        +Number weight
        +String behavioralNotes
        +Boolean flagged
    }

    class MedicalSession {
        +String status
        +Date respondBy
        +Date startedAt
        +Date endedAt
        +Number durationMinutes
        +String roomId
    }

    class Prescription {
        +String imageUrl
        +String medicineName
        +String dosage
    }

    class DoctorAvailability {
        +String dayOfWeek
        +String startTime
        +String endTime
    }

    class Rating {
        +Number score
        +String review
    }

    class Wallet {
        +Number monthlyBudget
        +Number remainingBudget
        +Object categoryLimits
    }

    class Payment {
        +Number amount
        +String type
        +String status
        +Boolean otpRequired
    }

    class UtilityBill {
        +String provider
        +String accountNumber
        +Number amount
        +Boolean paid
    }

    class MedicalDocument {
        +String type
        +String title
        +String url
        +String shareToken
        +Date shareExpiresAt
    }

    class CaregiverVetting {
        +Boolean nidVerified
        +Boolean policeClearance
        +Boolean referenceCheck
        +String probationStatus
        +String status
    }

    class Dispute {
        +String evidence
        +String ruling
        +String status
    }

    class SOSEvent {
        +String status
        +Number latitude
        +Number longitude
        +Array timeline
    }

    User "1" --> "many" Elder : familyMemberId
    User "1" --> "many" CarePlan : manages
    User "1" --> "1" Wallet : owns
    User "1" --> "1" CaregiverVetting : caregiverId

    Elder "1" --> "many" CarePlan
    Elder "1" --> "many" Visit
    Elder "1" --> "many" VitalsLog
    Elder "1" --> "many" UtilityBill
    Elder "1" --> "many" MedicalDocument

    CarePlan "1" --> "many" Task
    CarePlan "1" --> "many" Visit

    User --> MedicalSession : caregiver or doctor
    MedicalSession "1" --> "0..1" Rating
    MedicalSession "1" --> "0..many" Prescription

    User --> DoctorAvailability : doctor
    Wallet "1" --> "many" Payment
    Payment "1" --> "0..1" Dispute
    User --> SOSEvent : triggers or receives
```



**Diagram tool:** Mermaid (software-generated). Can also be opened in draw.io or exported from VS Code Markdown preview.

---



## 5. Tools and Technologies



### 5.1 Frontend


| Tool                | Version / Detail | Purpose                                   |
| ------------------- | ---------------- | ----------------------------------------- |
| **React**           | 19.x             | UI library for all dashboard pages        |
| **Vite**            | 8.x              | Fast dev server and production build      |
| **React Router**    | 7.x              | Page routing and protected routes by role |
| **Leaflet**         | 1.9.x            | Map picker for elder home location        |
| **100ms React SDK** | 0.13.x           | In-browser video consult UI               |
| **Hugeicons**       | 4.x              | Sidebar and dashboard icons               |
| **CSS**             | Custom           | Layout, forms, tables, modals             |


**Frontend hosting:** Cloudflare Pages (`eldercare-4mg.pages.dev`)

### 5.2 Backend


| Tool             | Version / Detail | Purpose                                        |
| ---------------- | ---------------- | ---------------------------------------------- |
| **Node.js**      | 18+              | JavaScript runtime for the API server          |
| **Express.js**   | 4.x              | HTTP server and REST routing                   |
| **Mongoose**     | 8.x              | MongoDB object modeling and queries            |
| **jsonwebtoken** | 9.x              | Login tokens (JWT)                             |
| **bcryptjs**     | 2.x              | Password hashing                               |
| **cors**         | 2.x              | Allow frontend to call API from another domain |
| **dotenv**       | 16.x             | Environment variables for secrets              |


**Backend hosting:** Railway (`aware-reprieve-production-7023.up.railway.app`)

### 5.3 Database


| Tool              | Detail                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **MongoDB Atlas** | Cloud database. Collections for users, elders, visits, tasks, payments, sessions, and more. |




### 5.4 Third-Party Services


| Service                       | Use in Elder Care                                       |
| ----------------------------- | ------------------------------------------------------- |
| **100ms.live**                | Video rooms and tokens for medical sessions             |
| **ImgBB**                     | Cloud image storage for prescriptions and vault uploads |
| **OpenStreetMap / Nominatim** | Geocoding elder address to latitude and longitude       |
| **Device GPS API**            | Browser geolocation for caregiver check-in validation   |




### 5.5 Development and Deployment Tools


| Tool                  | Purpose                                |
| --------------------- | -------------------------------------- |
| **Git / GitHub**      | Version control and team collaboration |
| **npm**               | Package manager for client and server  |
| **Wrangler CLI**      | Deploy frontend to Cloudflare Pages    |
| **Railway CLI**       | Deploy backend API                     |
| **draw.io / Mermaid** | Diagrams for SRS and reports           |




### 5.6 Architecture Summary

```
Browser (React View)
       |
       |  HTTPS + JWT
       v
Express API (Controllers + Routes)
       |
       v
MongoDB Atlas (Models / Data)
```

---



## 6. Compatibility with System Environment

Elder Care is a **web application**. Users do not install a desktop app. They open the site in a browser.

### 6.1 Operating Systems

The system works on any OS that has a modern browser:

- **Windows** 10 or 11
- **macOS** (recent versions)
- **Linux** (Ubuntu and similar)
- **Android** and **iOS** (mobile browser)

No special OS packages are required on the user device.

### 6.2 Browsers

Recommended browsers:

- Google Chrome (latest)
- Mozilla Firefox (latest)
- Microsoft Edge (latest)
- Safari (latest on Mac and iPhone)

**Notes:**

- **GPS check-in** needs location permission in the browser.
- **Video consult** needs camera and microphone permission.
- JavaScript must be enabled.



### 6.3 Screen Size

The UI is built for **desktop and tablet** first. It also works on mobile phones for basic tasks. Video consult works best on a stable Wi-Fi or 4G connection.

### 6.4 Server Environment

- Backend runs on **Railway** (Linux container, Node.js).
- Database runs on **MongoDB Atlas** (cloud).
- Frontend is static files on **Cloudflare Pages** (global CDN).



### 6.5 Network

Users need an **internet connection**. Slow networks may delay image upload or video quality. The API returns JSON over HTTPS on port 443.

---



## 7. Implementation

This section shows each major feature with a screenshot placeholder and a short description. Replace image paths with your own captures from the live site or local demo.

**Demo logins (password:** `12345678`**):**


| Role      | Email                                                               |
| --------- | ------------------------------------------------------------------- |
| Admin     | [karim.admin@eldercare.bd](mailto:karim.admin@eldercare.bd)         |
| Family    | [nusrat.family@eldercare.bd](mailto:nusrat.family@eldercare.bd)     |
| Caregiver | [rafiq.caregiver@eldercare.bd](mailto:rafiq.caregiver@eldercare.bd) |
| Doctor    | [samira.doctor@eldercare.bd](mailto:samira.doctor@eldercare.bd)     |


---



### 7.1 Caregiver Features



#### FR-01: GeoIP Check-In and Check-Out

![FR-01 Caregiver check-in](srs-screenshots/fr-01-check-in.png)

The caregiver selects an elder and uses device GPS to check in. The system checks distance from the elder home. Check-out needs a photo. Visit history appears in a table below the form.

#### FR-02: Initiate Medical Video Session

![FR-02 Video session](srs-screenshots/fr-02-video-session.png)

The caregiver picks an available doctor and requests a session. The page lists session status and offers a Join button when the doctor accepts. SOS can also be triggered from this page.

#### FR-03: Upload Prescription Image

![FR-03 Prescription upload](srs-screenshots/fr-03-prescription-upload.png)

The caregiver uploads a photo of a paper prescription. The image is stored and linked to the elder. The family vault and doctor prescriptions page can view it later.

#### FR-04: Log Vitals and Behavioral Notes

![FR-04 Vitals log](srs-screenshots/fr-04-vitals.png)

The caregiver enters blood pressure, blood sugar, weight, and optional notes. If notes contain decline keywords, the entry is flagged for the family feed.

#### FR-05: View and Complete Assigned Tasks

![FR-05 Tasks](srs-screenshots/fr-05-tasks.png)

The caregiver sees tasks assigned by the family. The Complete button works only when checked in at that elder home. Proof note or photo can be attached.

---



### 7.2 Family Features



#### FR-06: Care Plan and Caregiver Assignment

![FR-06 Care plan](srs-screenshots/fr-06-care-plan.png)

The family member registers an elder on the map, creates a care plan, and assigns a vetted caregiver. Tasks can also be created from this page.

#### FR-07: Escrow Wallet and Payment Release

![FR-07 Wallet](srs-screenshots/fr-07-wallet.png)

The family loads money into escrow and releases payments to caregivers. Large amounts trigger OTP. Payment history and dispute options appear in the same view.

#### FR-08: Direct Utility Bill Payment

![FR-08 Utilities](srs-screenshots/fr-08-utilities.png)

The family adds bills for DESCO, WASA, gas, or internet. Unpaid bills can be paid from the wallet balance with one click.

#### FR-09: Medical Document Vault

![FR-09 Vault](srs-screenshots/fr-09-vault.png)

Health documents are uploaded by type and elder. Share creates a time-limited public link. The shared page opens without login until expiry.

#### FR-10: Real-Time Care Status Feed

![FR-10 Care feed](srs-screenshots/fr-10-care-feed.png)

One page shows today alerts, check-ins, vitals, tasks, and medical sessions. The family refreshes to see the latest caregiver activity.

---



### 7.3 Doctor Features



#### FR-11: Join Video Consultation

![FR-11 Doctor video](srs-screenshots/fr-11-doctor-video.png)

The doctor sees incoming requests and accepts or declines within 60 seconds. Join opens the 100ms video panel. End session records duration.

#### FR-12: View Uploaded Prescriptions

![FR-12 Doctor prescriptions](srs-screenshots/fr-12-doctor-prescriptions.png)

The doctor browses prescription images uploaded by caregivers. Each row shows elder name, image link, and upload date.

#### FR-13: Post-Session Notes and Digital Prescription

![FR-13 Session notes](srs-screenshots/fr-13-session-notes.png)

After a consult ends, the doctor writes notes, diagnosis, and follow-up. An optional digital prescription can be added. Notes lock after 24 hours.

#### FR-14: Manage Availability Schedule

![FR-14 Availability](srs-screenshots/fr-14-availability.png)

The doctor adds weekly time slots by day. Times use Bangladesh timezone. Caregivers only see doctors who are available now.

#### FR-15: Doctor Rating and Review

![FR-15 Ratings](srs-screenshots/fr-15-ratings.png)

The family rates ended sessions from the Consults page. The doctor sees average score and individual reviews on the Ratings page.

---



### 7.4 Admin Features



#### FR-16: User and Role Management

![FR-16 Users](srs-screenshots/fr-16-users.png)

The admin lists all users, creates new accounts, edits details, and deactivates accounts without deleting history.

#### FR-17: Caregiver Vetting Pipeline

![FR-17 Vetting](srs-screenshots/fr-17-vetting.png)

The admin steps through NID, police clearance, references, and probation. Only activated caregivers appear in the family assignment list.

#### FR-18: Escrow Dispute Resolution

![FR-18 Disputes](srs-screenshots/fr-18-disputes.png)

The family opens a dispute from the wallet. The admin reviews evidence and picks a ruling. Wallet and payment status update after resolution.

#### FR-19: SOS Alert and Emergency Cascade

![FR-19 SOS](srs-screenshots/fr-19-sos.png)

SOS events from caregivers appear on the admin board with location and timeline. Admin can escalate or resolve with a note.

#### FR-20: Analytics and Report Dashboard

![FR-20 Analytics](srs-screenshots/fr-20-analytics.png)

The admin sees counts for elders, users, tasks, sessions, and escrow volume. CSV export supports course reporting and presentations.

---



## 8. Challenges



### 8.1 GPS and Location Accuracy

Caregiver check-in depends on browser GPS. Indoor signal can be weak. We set a **50 meter** radius to balance strict proof with real-world GPS error. Family must pin the elder address accurately on the map.

### 8.2 Timezone for Doctor Availability

Doctors set slots in **Bangladesh time**. The cloud server used UTC at first. Available doctors did not show up for caregivers. We fixed this with a shared `Asia/Dhaka` check in the availability utility.

### 8.3 Video Session Timing

The doctor must accept within **60 seconds**. Both sides need polling on the UI so status updates without manual refresh. Integrating 100ms tokens for caregiver and doctor roles took extra testing.

### 8.4 Caregiver Trust (Vetting)

Family users should only see safe caregivers. Vetting spans many admin steps. We linked vetting status to the family caregiver list so unvetted users never appear.

### 8.5 Team Coordination on Shared Code

Some controllers serve more than one role (`sessionController`, `walletController`, `prescriptionController`). Clear ownership per FR helped avoid breaking another member feature.

### 8.6 Deployment Across Two Platforms

Frontend and backend deploy separately (Cloudflare and Railway). Environment variables (`VITE_API_URL`, `MONGODB_URI`, JWT secret) must match. 

---



## 9. Conclusion

Elder Care is a complete web platform for remote elderly care in Bangladesh. It connects family members, caregivers, doctors, and admins in one system.

The project delivers **20 functional requirements** across four dashboards. Key outcomes include:

- **Proof of visit** through GPS check-in and check-out
- **Remote health monitoring** through vitals logs and the family care feed
- **Safe payments** through escrow, OTP, and admin dispute resolution
- **Medical access** through video consults and document vault
- **Platform trust** through caregiver vetting and SOS handling

The system is live and deployed. It uses modern tools (React, Node.js, MongoDB, Cloudflare, Railway) and follows MVC for clear structure. Future work could add SMS alerts, mobile apps, and real payment gateway integration beyond the current demo escrow model.

---



## 10. References

1. BRAC University. *CSE470 Software Engineering* course materials. 
2. MongoDB Inc. *Mongoose Documentation*. [https://mongoosejs.com/docs/](https://mongoosejs.com/docs/)
3. Meta Open Source. *React Documentation*. [https://react.dev/](https://react.dev/)
4. Express.js. *Express Web Framework*. [https://expressjs.com/](https://expressjs.com/)
5. 100ms. *100ms Video SDK Documentation*. [https://www.100ms.live/docs](https://www.100ms.live/docs)
6. OpenStreetMap Foundation. *Nominatim Usage Policy*. [https://operations.osmfoundation.org/policies/nominatim/](https://operations.osmfoundation.org/policies/nominatim/)
7. Cloudflare. *Cloudflare Pages Documentation*. [https://developers.cloudflare.com/pages/](https://developers.cloudflare.com/pages/)
8. Railway Corp. *Railway Documentation*. [https://docs.railway.app/](https://docs.railway.app/)
9. ImgBB. *Image Upload API*. [https://api.imgbb.com/](https://api.imgbb.com/)

