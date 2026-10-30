# ForgeFlow Architecture

## Phase 1

ForgeFlow is a monorepo with two independently runnable applications:

- `frontend/`: Vite, React, and TypeScript portal shell.
- `backend/`: Spring Boot REST API with Spring Data JPA, Hibernate, Flyway, and MySQL.

The frontend currently presents platform structure and truthful empty or unavailable states. The backend exposes the application health contract at `GET /api/health`, including a live database probe. Flyway owns the versioned schema; Hibernate validates the schema at startup.

Future external systems will be isolated behind backend service interfaces as they are introduced. Authentication, persistence, provisioning, and integrations are intentionally deferred to later phases.
