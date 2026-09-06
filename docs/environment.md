# Environment variables

Copy the example files and fill in real values locally. Do not commit `.env` files.

## Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port. Default `5000` if omitted. |
| `CLIENT_URL` | No | React dev URL for CORS. Default `http://localhost:5173`. |
| `MONGODB_URI` | Yes | Atlas connection string. Database name in the path should be `eldercare`. |
| `JWT_SECRET` | Yes | Secret used to sign login tokens. Use a long random string. |
| `JWT_EXPIRES_IN` | No | Token lifetime (e.g. `7d`). |
| `IMGBB_API_KEY` | Preferred for FR-03 | ImgBB API v1 key. If ImgBB rejects the key, uploads fall back to `server/uploads/` served at `/uploads/...`. |
| `PUBLIC_API_URL` | No | Public base URL used when building local upload links (default `http://localhost:PORT`). |
| `HMS_ACCESS_KEY` | Yes for live video | 100ms App Access Key from Developer settings. |
| `HMS_APP_SECRET` | Yes for live video | 100ms App Secret (server only; never expose to client). |
| `HMS_TEMPLATE_ID` | No | Optional template id; default workspace template is used if omitted. |
| `HMS_ROLE_DOCTOR` | No | Role name for doctors joining rooms (default `host`). Must match your 100ms template. |
| `HMS_ROLE_CAREGIVER` | No | Role name for caregivers (default `guest`). Must match your 100ms template. |
| `HMS_WEBHOOK_URL` | No | Optional webhook URL configured in the 100ms dashboard. |

Example:

```bash
cp server/.env.example server/.env
```

Get the database password from Atlas: **Database Access** > your user > edit password.

## Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Base URL for API calls. Local default: `http://localhost:5000/api`. |

Example:

```bash
cp client/.env.example client/.env
```

Restart the Vite dev server after changing client env values.

## Sharing with the team

- Commit only `server/.env.example` and `client/.env.example`.
- Share the real `MONGODB_URI` password and `JWT_SECRET` through a private channel (e.g. course group chat), not GitHub.
- Everyone uses the same Atlas cluster URI; each developer still needs their IP allowed in Atlas (see [atlas-network-access.md](./atlas-network-access.md)).
