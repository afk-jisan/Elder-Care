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
