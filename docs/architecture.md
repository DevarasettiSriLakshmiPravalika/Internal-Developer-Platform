# ForgeFlow Architecture

## Phase 1

ForgeFlow is a monorepo with two independently runnable applications:

- `frontend/`: Vite, React, and TypeScript portal shell.
- `backend/`: Spring Boot REST API.

The frontend currently presents platform structure and truthful empty or unavailable states. The backend currently exposes only the application health contract at `GET /api/health`.

Future external systems will be isolated behind backend service interfaces as they are introduced. Authentication, persistence, provisioning, and integrations are intentionally deferred to later phases.
