# Express MVC guide (Elder Care API)

This matches our `server/` layout and typical MERN course material.

## What MVC means here

| Layer | Folder | Job |
|-------|--------|-----|
| **Model** | `models/` | Data shape and database rules (Mongoose schema). |
| **View** | React in `client/` | What the user sees. REST APIs return JSON, not HTML. |
| **Controller** | `controllers/` | Business logic: read `req`, call the model, send `res`. |

**Routes** (`routes/`) map URLs and HTTP methods to controller functions. They stay thin: no heavy logic.

Flow for `POST /api/auth/login`:

1. `index.js` mounts `app.use('/api/auth', authRoutes)`.
2. `authRoutes.js` maps `POST /login` to `login` in the controller.
3. `authController.js` finds the user, checks password, returns JSON + token.
4. `User` model talks to MongoDB.

## Express basics

**Express** is a small framework on top of Node's `http` module.

- `app.get(path, handler)` – read data.
- `app.post(path, handler)` – create / submit.
- `app.put` / `app.patch` – update.
- `app.delete` – delete.

Handlers receive `(req, res, next)`:

- `req.body` – JSON body (needs `app.use(express.json())`).
- `req.params` – e.g. `/users/:id` → `req.params.id`.
- `req.query` – e.g. `/users?role=admin` → `req.query.role`.
- `res.status(400).json({ message: '...' })` – send JSON and status code.

**Middleware** runs before the route handler:

```text
Request → cors → express.json() → authenticate → controller → response
```

Our `middleware/auth.js` checks the JWT and sets `req.auth`. `errorHandler` catches errors at the end.

## Our `index.js` (entry file)

1. Load `.env` (`dotenv`).
2. Create `app`.
3. Global middleware: CORS, JSON parser.
4. Routes: `/`, `/api/health`, `/api/auth`.
5. `connectDB()` then `app.listen(port)`.

Same idea as a single-file tutorial; we split controllers and routes into folders as the app grows.

## Models (Mongoose)

A **schema** defines fields and rules. A **model** is the class you query:

```javascript
const user = await User.findOne({ email });
await User.create({ name, email, password, role });
```

`pre('save')` on the User schema hashes the password before insert/update.

Collection name in Atlas: `users` (lowercase plural of `User`).

## Controllers

Keep HTTP details here:

- Validate input.
- Call `User.findOne`, `User.create`, etc.
- Return `res.status(...).json(...)`.
- On failure: `next(err)` so `errorHandler` runs.

Do not put long route strings inside controllers; routes file owns the path.

## Routes

```javascript
router.post('/login', login);
router.get('/me', authenticate, loadUser, me);
```

Order matters: middleware left to right, then controller.

## Auth in this project

1. **Register/login** – controller returns a **JWT** string.
2. Client stores token in `localStorage` and sends `Authorization: Bearer <token>`.
3. **authenticate** middleware verifies JWT and sets `req.auth`.
4. **loadUser** loads the full user document into `req.user`.

Logout is mostly client-side (delete token). Server `/logout` is a placeholder for future token blocklists.

## Adding a new feature (example FR)

1. `models/Elder.js` – schema.
2. `controllers/elderController.js` – `createElder`, `listElders`.
3. `routes/elderRoutes.js` – `router.post('/', authenticate, authorize('family'), createElder)`.
4. `index.js` – `app.use('/api/elders', elderRoutes)`.
5. React page calls `apiRequest('/elders', { method: 'POST', body: ... })`.

## Common mistakes

- Forgetting `express.json()` → `req.body` is undefined.
- Putting DB queries in routes instead of controllers.
- Not using `next(err)` in `async` controllers (errors become unhandled).
- Wrong database in Atlas (`admin` vs `eldercare`).
- Atlas IP not allowlisted → connection timeout.

## Tools

- **Postman / Thunder Client** – test API without React.
- **MongoDB Compass / Atlas Data Explorer** – inspect `eldercare.users`.
- Browser Network tab – see login request and response.

## Read next in this repo

- `server/index.js` – wiring
- `server/routes/authRoutes.js` – URL map
- `server/controllers/authController.js` – login/register logic
- `server/models/User.js` – schema
- `docs/environment.md` – env vars
