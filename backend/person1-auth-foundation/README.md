# SkillBridge — Person 1 Backend Foundation

Express + MongoDB/Mongoose authentication foundation for the SkillBridge project.

## Requirements
- Node.js 20 or newer
- MongoDB local instance or MongoDB Atlas database

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI`, a random `JWT_SECRET` (at least 32 characters), and `CLIENT_ORIGIN`.
4. Start development server:
   ```bash
   npm run dev
   ```

Health check: `GET http://localhost:5000/api/v1/health`

## API routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/health` | Public | Check server status |
| POST | `/api/v1/auth/register` | Public | Register Student account |
| POST | `/api/v1/auth/login` | Public | Login and receive JWT |
| GET | `/api/v1/auth/me` | Authenticated | Get current user's profile |
| GET | `/api/v1/admin/users` | Admin | List up to 100 users |

### Register
Request:
```json
{
  "name": "Example Student",
  "email": "student@example.com",
  "password": "a-strong-password"
}
```
Public signup always creates a `Student`. The API deliberately ignores any client-supplied role.

### Login
Request:
```json
{
  "email": "student@example.com",
  "password": "a-strong-password"
}
```

Login/register response includes `data.token`. Send it on protected requests:
`Authorization: Bearer <token>`

## Create the first Admin account
Set these temporary variables in your local `.env`:
```env
ADMIN_NAME=SkillBridge Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-unique-password-of-at-least-12-characters
```
Then run:
```bash
npm run admin:create
```
Remove the ADMIN_* values from `.env` after creating the account. Do not commit `.env`.

## Roles
- `Student`
- `Faculty/T&P`
- `Recruiter/Company`
- `Admin`

The role middleware is reusable. Public registration cannot assign privileged roles. Admin account creation is a controlled local seed script.

## Response convention
Success:
```json
{ "success": true, "message": "Optional message", "data": {} }
```
Error:
```json
{ "success": false, "message": "Description", "errors": [] }
```

## Important integration notes
- This is the backend foundation for Person 1, not the complete SkillBridge product.
- Agree API contracts, role names, CORS origins, and response conventions with Person 5 before merging.
- Person 2/4 modules will need additional profile, skills, evidence, jobs, analytics, and shortlist endpoints/models.
- Person 3 owns FastAPI. Express should remain the main application API and enforce authorization before calling FastAPI.
- Access token is returned in JSON for initial integration. The frontend team must store/use it carefully; for production, discuss secure HttpOnly cookie or refresh-token strategy.
- Add automated tests and integration tests before production deployment.
- File uploads, email verification, password reset, refresh tokens, audit logs and account administration workflows are not implemented in this starter.
