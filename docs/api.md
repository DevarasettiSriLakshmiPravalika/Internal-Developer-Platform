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


Registration and login accept JSON. Passwords must be at least 12 characters. New accounts receive the `DEVELOPER` role.

### Templates

- `GET /api/services/{id}/template` generates deterministic starter files for the owned service.

Supported languages are `spring-boot`, `node`, and `python`. Generation returns file paths and contents; it does not write to disk or claim that a repository was created.

### Health

`GET /api/health`


