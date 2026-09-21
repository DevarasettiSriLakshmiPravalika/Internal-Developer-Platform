# Security

Phase 2 adds stateless JWT authentication, BCrypt password hashing, and role-aware request authorization. New registrations receive the `DEVELOPER` role; `ADMIN` and `VIEWER` roles are defined for later user-management and authorization workflows.

Users are currently stored in process memory because database persistence is outside this phase. Restarting the backend clears accounts. Production deployments must set `JWT_SECRET` to a random value of at least 32 characters; when it is omitted, local development uses an ephemeral generated key and all tokens become invalid after restart.

Secrets are excluded from source control through `.gitignore`; `.env.example` documents variable names only. Passwords and tokens are never logged or returned by the API.
