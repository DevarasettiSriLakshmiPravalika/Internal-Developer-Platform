# Deployment

Phase 1 supports local development through Docker Compose.

1. Copy `.env.example` to `.env` and replace local-only values as needed.
2. Start the full local stack with `docker compose up --build`.
3. Verify `http://localhost:8090/api/health` and `http://localhost:5173`.

For split local development, start MySQL with `docker compose up mysql`, then run `mvn spring-boot:run` from `backend/` and `npm run dev` from `frontend/`. The backend defaults to port `8090`; override with `SERVER_PORT` when needed.

MySQL data is stored in the named `forgeflow-mysql-data` volume and is not removed by a normal container restart.

Container, Kubernetes, Helm, GitOps, and observability deployment assets are intentionally deferred until their implementation phases.
