# Deployment

Phase 1 supports local development only.

- Frontend: `npm install` and `npm run dev` from `frontend/`.
- Backend: `mvn spring-boot:run` from `backend/` once Maven is available. It defaults to port `8090`; override with `SERVER_PORT` when needed.

Container, Kubernetes, Helm, GitOps, and observability deployment assets are intentionally deferred until their implementation phases.
