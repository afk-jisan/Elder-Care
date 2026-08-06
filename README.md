# Elder Care

Digital care platform for families managing elderly relatives remotely (caregivers, doctors, family members, and admins). Built for **CSE470 Software Engineering**, BRAC University.

**Stack:** MongoDB Atlas, Express (MVC), React (Vite), Node.js.

---

## What is in this repository


| Path                     | Purpose                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `Elder_Care_SRS.md`      | Software requirements specification                                                         |
| `Elder_Care_Features.md` | Feature list per dashboard                                                                  |
| `server/`                | REST API: `index.js`, `config/`, `models/`, `controllers/`, `routes/`, `middleware/`        |
| `client/`                | React app: login, register, role dashboards at `/admin`, `/family`, `/caregiver`, `/doctor` |




### Server layout (Express MVC)

```
server/
  index.js           # Entry: connect DB, start Express
  config/database.js
  models/            # Mongoose schemas (Model)
  controllers/       # Request logic (Controller)
  routes/            # URLs → controllers
  middleware/        # Auth, error handling
  scripts/seed.js    # Demo users
```



### Client layout

```
client/
  src/
    pages/           # Login, register, dashboards per role
    components/      # Shared UI, route guards
    context/         # Auth state
    api/             # fetch wrapper for the API
```

---



## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (`node -v`)
- MongoDB Atlas cluster (setup in server .env)
- Git

---



## First-time setup

Run these commands from the **project root** (the folder that contains `server/` and `client/`).

**Where to open the terminal**

- **VS Code:** `Terminal` → `New Terminal`. The prompt should show your project folder, or run `cd` to it, for example:
  ```bash
  cd /path/to/ElderCare
  ```

### 1. Install packages

```bash
cd server && npm install
cd ../client && npm install
```



### 2. Environment files

```bash
cd ..   # back to project root if you are still in client/
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env`: set the real database password in `MONGODB_URI` and a strong `JWT_SECRET`.  
Details: `[docs/environment.md](docs/environment.md)`.

### 3. MongoDB Atlas network access

In the Atlas console, allow your IP (or team dev entries). IPv4 and IPv6: `[docs/atlas-network-access.md](docs/atlas-network-access.md)`.

### 4. Seed demo users (optional)

From the project root:

```bash
cd server && npm run seed
```

---



## Run the application (two terminals)

Backend and frontend must run at the same time. Use two terminal tabs. Start both from the **project root** (`ElderCare/`).

**Terminal 1 (backend)**

Open **Terminal → New Terminal** at the project root.

```bash
cd server
npm run dev
```

Wait until you see `MongoDB connected` and `Server listening on port 5000`. Leave this terminal open.

**Terminal 2 (frontend)**

Open **Terminal → New Terminal** again at the project root.

```bash
cd client
npm run dev
```

Wait until Vite prints the local URL (usually http://localhost:5173). Leave this terminal open.

**Browser**

- App: http://localhost:5173
- API health: http://localhost:5000/api/health

To stop a server, focus that terminal and press `Ctrl+C`.

---



## Demo logins

After `npm run seed` in `server/`:


| Role      | Email                                                               | Password |
| --------- | ------------------------------------------------------------------- | -------- |
| Admin     | [karim.admin@eldercare.bd](mailto:karim.admin@eldercare.bd)         | 12345678 |
| Caregiver | [rafiq.caregiver@eldercare.bd](mailto:rafiq.caregiver@eldercare.bd) | 12345678 |
| Family    | [nusrat.family@eldercare.bd](mailto:nusrat.family@eldercare.bd)     | 12345678 |
| Doctor    | [samira.doctor@eldercare.bd](mailto:samira.doctor@eldercare.bd)     | 12345678 |


Each role is redirected to its own path after login (`/admin`, `/family`, etc.).

---



## Auth API (reference)


| Method | Path                 | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/api/health`        | Health check                |
| POST   | `/api/auth/register` | Register                    |
| POST   | `/api/auth/login`    | Login                       |
| POST   | `/api/auth/logout`   | Logout (Bearer token)       |
| GET    | `/api/auth/me`       | Current user (Bearer token) |


Roles: `family`, `caregiver`, `doctor`, `admin`.

---



## Git

Do not commit `server/.env`, `client/.env`, or `node_modules/`. Only `.env.example` files belong in the repository.