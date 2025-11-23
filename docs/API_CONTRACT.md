# API Contract - KAIRO STUDIO

Complete RESTful API specification for the backend Express server.

**Base URL**: `https://api.kairostudio.com` (production)
**Version**: v1
**Format**: JSON
**Auth**: JWT Bearer tokens

---

## Authentication

### POST `/api/auth/signup`

Create new user account.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "CLIENT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  }
}
```

**Errors**:
- 400: Invalid email or weak password
- 409: Email already exists

---

### POST `/api/auth/login`

Authenticate user.

**Request**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "CLIENT"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

**Errors**:
- 401: Invalid credentials
- 429: Too many login attempts

---

### POST `/api/auth/refresh`

Refresh access token.

**Request**:
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

### POST `/api/auth/logout`

Invalidate session.

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Users

### GET `/api/users/me`

Get current user profile.

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CLIENT",
    "company": {
      "id": "uuid",
      "name": "Acme Corp"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### PATCH `/api/users/me`

Update current user profile.

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "name": "John Updated",
  "avatarUrl": "https://cdn.example.com/avatar.jpg"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Updated",
    "avatarUrl": "https://cdn.example.com/avatar.jpg"
  }
}
```

---

## Services

### GET `/api/services`

Get all published services.

**Query Params**:
- `featured` (boolean): Filter featured services only

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "automation",
      "title": "Automation Solutions",
      "tagline": "Automate repetitive work, ship faster",
      "description": "Build reliable workflows...",
      "iconUrl": "/icons/automation.svg",
      "planetModelUrl": "/models/automation-planet.glb"
    }
  ]
}
```

---

### GET `/api/services/:slug`

Get service detail.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "automation",
    "title": "Automation Solutions",
    "description": "Detailed description...",
    "content": {
      "sections": [
        {
          "type": "hero",
          "heading": "Automation that scales",
          "body": "..."
        }
      ]
    },
    "planetModelUrl": "/models/automation-planet.glb"
  }
}
```

---

## Projects (Case Studies)

### GET `/api/projects`

Get all published case studies.

**Query Params**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 50)
- `featured` (boolean): Filter featured only
- `tags` (string): Comma-separated tags

**Response** (200):
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "slug": "acme-automation",
        "title": "Acme Corp Automation",
        "summary": "Cut lead cost by 42%",
        "heroAsset": "/models/case-study-room.glb",
        "tags": ["automation", "marketing"],
        "metrics": {
          "leadCostReduction": "42%",
          "timesSaved": "120hrs/month"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

### GET `/api/projects/:slug`

Get project detail.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "acme-automation",
    "title": "Acme Corp Automation",
    "summary": "How we cut lead cost by 42%",
    "heroAsset": "/models/case-study-room.glb",
    "content": {
      "challenge": "...",
      "approach": "...",
      "results": "..."
    },
    "metrics": {
      "leadCostReduction": "42%",
      "timesSaved": "120hrs/month"
    },
    "company": {
      "name": "Acme Corp",
      "website": "https://acme.com"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Leads

### POST `/api/leads`

Submit contact form / lead capture.

**Request**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Interested in automation solutions",
  "company": "Example Inc",
  "phone": "+1234567890",
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "automation"
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Thanks. We'll reply within 2 business days.",
  "data": {
    "id": "uuid",
    "status": "NEW"
  }
}
```

**Errors**:
- 400: Invalid email or missing required fields
- 429: Rate limit exceeded (max 3 submissions per hour per IP)

---

## Automations

### GET `/api/automations`

Get user's automations.

**Headers**: `Authorization: Bearer {token}`

**Query Params**:
- `status` (string): Filter by status (DRAFT, ACTIVE, PAUSED)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Lead Enrichment Flow",
      "description": "Enriches leads from form submissions",
      "status": "ACTIVE",
      "executionCount": 142,
      "lastExecutedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET `/api/automations/:id`

Get automation detail.

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Lead Enrichment Flow",
    "description": "...",
    "status": "ACTIVE",
    "flow": {
      "nodes": [
        {
          "id": "node1",
          "type": "trigger",
          "config": { "event": "form_submit" }
        },
        {
          "id": "node2",
          "type": "http",
          "config": { "url": "https://api.example.com/enrich" }
        }
      ],
      "edges": [
        { "from": "node1", "to": "node2" }
      ]
    },
    "executionCount": 142,
    "lastExecutedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### POST `/api/automations`

Create new automation.

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "title": "New Automation",
  "description": "Description here",
  "flow": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "New Automation",
    "status": "DRAFT",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

---

### PATCH `/api/automations/:id`

Update automation.

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "title": "Updated Title",
  "status": "ACTIVE",
  "flow": { ... }
}
```

**Response** (200):
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE `/api/automations/:id`

Delete automation.

**Headers**: `Authorization: Bearer {token}`

**Response** (204): No content

---

### POST `/api/automations/:id/execute`

Manually trigger automation.

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "input": { "key": "value" }
}
```

**Response** (202):
```json
{
  "success": true,
  "data": {
    "runId": "uuid",
    "status": "RUNNING"
  }
}
```

---

### GET `/api/automations/:id/runs`

Get execution history.

**Headers**: `Authorization: Bearer {token}`

**Query Params**:
- `page`, `limit`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "runs": [
      {
        "id": "uuid",
        "status": "SUCCESS",
        "startedAt": "2024-01-15T10:30:00Z",
        "completedAt": "2024-01-15T10:30:05Z",
        "durationMs": 5000
      }
    ],
    "pagination": { ... }
  }
}
```

---

## Assets

### POST `/api/assets/upload-url`

Get presigned URL for asset upload.

**Headers**: `Authorization: Bearer {token}` (Admin only)

**Request**:
```json
{
  "filename": "model.glb",
  "type": "MODEL",
  "mimeType": "model/gltf-binary"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://r2.example.com/presigned-url",
    "assetId": "uuid",
    "expiresIn": 3600
  }
}
```

---

### POST `/api/assets`

Confirm asset upload (after uploading to presigned URL).

**Headers**: `Authorization: Bearer {token}` (Admin only)

**Request**:
```json
{
  "id": "uuid",
  "filename": "model.glb",
  "sizeBytes": 102400,
  "metadata": {
    "vertices": 5000,
    "lodLevel": "high"
  }
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://cdn.example.com/assets/model.glb",
    "type": "MODEL"
  }
}
```

---

### GET `/api/assets`

List assets (Admin only).

**Headers**: `Authorization: Bearer {token}`

**Query Params**:
- `type` (AssetType): Filter by type
- `page`, `limit`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "uuid",
        "filename": "planet.glb",
        "url": "https://cdn.example.com/assets/planet.glb",
        "type": "MODEL",
        "sizeBytes": 102400,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## Admin Routes

All admin routes require `Authorization: Bearer {token}` with `ADMIN` role.

### POST `/api/admin/projects`

Create new case study.

**Request**:
```json
{
  "slug": "new-case-study",
  "title": "New Case Study",
  "summary": "...",
  "content": { ... },
  "heroAsset": "/models/case.glb",
  "tags": ["automation"],
  "published": false
}
```

**Response** (201): Project object

---

### PATCH `/api/admin/projects/:id`

Update case study.

**Request**: Partial project object

**Response** (200): Updated project

---

### DELETE `/api/admin/projects/:id`

Delete case study.

**Response** (204): No content

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email"
      }
    ]
  }
}
```

### Error Codes

- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

---

## Rate Limits

- Auth endpoints: 5 requests/minute per IP
- Lead submission: 3 requests/hour per IP
- Public API: 100 requests/minute per IP
- Authenticated: 1000 requests/minute per user

---

## Pagination

All list endpoints support pagination:

**Query Params**:
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 125,
    "pages": 13,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Webhooks (Future)

### POST `/api/webhooks/stripe`

Handle Stripe payment webhooks.

### POST `/api/webhooks/automation`

Trigger automation from external service.

---

## Testing

Use these test credentials in development:

```
Email: test@kairostudio.com
Password: TestPass123!
```

---

## Changelog

- **v1.0.0** (2024-01): Initial API release
