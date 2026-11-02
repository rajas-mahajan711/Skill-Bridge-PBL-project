# SkillBridge API Contracts — Person 1 starter

Base URL: `/api/v1`

All JSON responses use `success`, optional `message`, and `data` or `errors`.

## Authentication
- `POST /auth/register` — public; creates Student only.
- `POST /auth/login` — public; returns access JWT and safe user object.
- `GET /auth/me` — Bearer token required; returns current user.

## Admin foundation
- `GET /admin/users` — Admin role required; returns up to 100 users without password hashes.

## Authentication header
`Authorization: Bearer <JWT>`

## Roles
Exact role values: `Student`, `Faculty/T&P`, `Recruiter/Company`, `Admin`.

Confirm these contracts with the integration lead before other modules depend on them.
