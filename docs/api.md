# ForgeFlow API

## Available endpoints

### Health

`GET /api/health`

Returns the API process state:

```json
{
  "status": "UP",
  "message": "ForgeFlow API is running"
}
```

### Authentication

- `POST /api/auth/register` creates a developer account and returns a bearer token.
- `POST /api/auth/login` authenticates an account and returns a bearer token.
- `GET /api/auth/me` returns the current user and requires `Authorization: Bearer <token>`.

Registration and login accept JSON. Passwords must be at least 12 characters. New accounts receive the `DEVELOPER` role.
