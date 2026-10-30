# Security

Phase 2 adds stateless JWT authentication, BCrypt password hashing, and role-aware request authorization. New registrations receive the `DEVELOPER` role; `ADMIN` and `VIEWER` roles are defined for later user-management and authorization workflows.

Phase 1 provisions MySQL and Flyway for persistent platform data. Authentication persistence remains part of Phase 2. Production deployments must set `JWT_SECRET` to a random value of at least 32 characters; when it is omitted, local development uses an ephemeral generated key and all tokens become invalid after restart.

Secrets are excluded from source control through `.gitignore`; `.env.example` documents variable names only. Passwords and tokens are never logged or returned by the API.
