# Elder Care — FR dependency graph (Mermaid)

**Role codes:** **A** = Admin · **D** = Doctor · **C** = Caregiver · **F** = Family  
(Node **A16** = Admin, **FR-16**, and so on.)

**Legend:** Solid arrows = build the source before (or same sprint as) the target. Dashed = soft / mocks OK until the other lands.

---

## Main graph (role subgraphs A → D → C → F, cross-role dependencies)

```mermaid
flowchart TB
  subgraph A["Admin (A)"]
    A16["A16 · FR-16 User & role management"]
    A17["A17 · FR-17 Caregiver vetting"]
    A19["A19 · FR-19 SOS & escalation"]
    A18["A18 · FR-18 Escrow dispute resolution"]
    A20["A20 · FR-20 Analytics & export"]
  end

  subgraph D["Doctor (D)"]
    D14["D14 · FR-14 Availability schedule"]
    D12["D12 · FR-12 View prescriptions"]
    D11["D11 · FR-11 Join video consult"]
    D13["D13 · FR-13 Session notes & digital Rx"]
    D15["D15 · FR-15 Rating & review"]
  end

  subgraph C["Caregiver (C)"]
    C01["C01 · FR-01 Check-in / check-out"]
    C03["C03 · FR-03 Upload prescription image"]
    C05["C05 · FR-05 View & complete tasks"]
    C04["C04 · FR-04 Vitals & behavioral notes"]
    C02["C02 · FR-02 Initiate video consult"]
  end

  subgraph F["Family (F)"]
    F06["F06 · FR-06 Care plan, elder, assign caregiver"]
    F09["F09 · FR-09 Medical document vault"]
    F10["F10 · FR-10 Care status feed"]
    F07["F07 · FR-07 Escrow wallet & payments"]
    F08["F08 · FR-08 Utility bill payment"]
  end

  A16 --> A17
  A17 -->|vetted pool| F06
  F06 -->|elder address / GPS| C01
  F06 -->|scheduled tasks| C05
  F06 --> F08
  F06 --> F09
  C01 -->|active check-in| C05
  C01 -.->|visit context| C04
  C01 --> F10
  C01 --> A19

  C03 --> D12
  C03 -.->|link uploads| F09

  C04 --> F10
  C05 --> F10
  C05 -->|GPS-verified task| F07

  D14 --> C02
  D14 --> D11
  C02 <-->|same sprint| D11
  C02 --> F10
  D11 --> D13
  D13 --> D15

  F07 --> A18
  F10 -.-> A20
  F07 -.-> A20
  C05 -.-> A20
```

---

## Minimal (role-prefixed IDs only)

```mermaid
flowchart LR
  A16 --> A17 --> F06
  F06 --> C01
  F06 --> C05
  F06 --> F08
  F06 --> F09
  C01 --> C05
  C01 --> F10
  C01 --> A19
  C03 --> D12
  C04 --> F10
  C05 --> F10
  C05 --> F07
  F07 --> A18
  D14 --> C02
  D14 --> D11
  C02 --> D11
  C02 --> F10
  D11 --> D13
  D13 --> D15
```

---

## Cross-role only (hides same-role chains)

Useful when explaining **who waits on whom** between dashboards.

```mermaid
flowchart TB
  subgraph A["Admin (A)"]
    A16
    A17
    A19
    A18
    A20
  end
  subgraph D["Doctor (D)"]
    D14
    D12
    D11
    D13
    D15
  end
  subgraph C["Caregiver (C)"]
    C01
    C03
    C05
    C04
    C02
  end
  subgraph F["Family (F)"]
    F06
    F09
    F10
    F07
    F08
  end

  A17 --> F06
  F06 --> C01
  F06 --> C05
  C01 --> F10
  C01 --> A19
  C03 --> D12
  C03 -.-> F09
  C04 --> F10
  C05 --> F10
  C05 --> F07
  F07 --> A18
  D14 --> C02
  D14 --> D11
  C02 --> D11
  C02 --> F10
  D11 --> D13
  D13 --> D15
  F10 -.-> A20
  F07 -.-> A20
  C05 -.-> A20
```

---

## Role → FR quick map

| Code | FRs |
|------|-----|
| **A** | 16, 17, 18, 19, 20 |
| **D** | 11, 12, 13, 14, 15 |
| **C** | 01, 02, 03, 04, 05 |
| **F** | 06, 07, 08, 09, 10 |

*Note: **D15** (FR-15) is implemented with family-facing UI; dependency still flows from **D13** after a session.*
