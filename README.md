# ForgeFlow

ForgeFlow is an Internal Developer Platform for provisioning and operating microservices through a React portal and Spring Boot API.

## Phase 1 status

Phase 1 establishes the runnable repository, frontend shell, backend health contract, and local development documentation. It does not claim authentication, persistence, provisioning, or external platform connectivity yet.

The portal deliberately shows truthful empty and unavailable states until the backend has real data or a configured integration.

## Structure

```text
.
├── backend/       Spring Boot REST API
├── frontend/      React + TypeScript + Vite portal
├── docs/          Architecture, API, deployment, and security notes
├── .env.example   Configuration variable names only
└── README.md
```

## Technology

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios, TanStack Query, Recharts, Lucide React
- Backend: Java 21 baseline, Spring Boot, Spring MVC, Bean Validation, Actuator
- Build: npm and Maven

## Local development

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The portal is available at `http://localhost:5173`.

### Backend

Install Maven and Java 21 or newer, then run:

```powershell
cd backend
mvn spring-boot:run
```

The API listens on `http://localhost:8090` by default. Verify it with:

```powershell
curl http://localhost:8090/api/health
```

Expected response:

```json
{"status":"UP","message":"ForgeFlow API is running"}
```

## Validation

```powershell
cd frontend
npm run lint
npm run build
```

Backend tests can be run from `backend/` with `mvn test`.

## Configuration and security

Copy `.env.example` for local reference. Never commit real credentials. Authentication, database configuration, integrations, generated artifacts, CI/CD, Kubernetes, GitOps, and observability are intentionally scheduled for later phases.

See [docs/architecture.md](docs/architecture.md), [docs/api.md](docs/api.md), [docs/deployment.md](docs/deployment.md), and [docs/security.md](docs/security.md) for the current implementation boundary.

## Roadmap

1. Repository and application foundation
2. Authentication and roles
3. Dashboard data and service management
4. GitHub integration
5. Template generation
6. Docker, Kubernetes, and Helm generation
7. CI/CD
8. SonarQube and Trivy
9. ArgoCD GitOps
10. Prometheus and Grafana
11. Fluent Bit and Loki
12. Audit logging and production hardening
