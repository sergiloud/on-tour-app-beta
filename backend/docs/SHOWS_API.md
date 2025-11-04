# Shows API Documentation

Complete API reference for the On Tour Shows management endpoints.

## Overview

The Shows API allows you to manage concert/event shows with full CRUD operations. All endpoints require authentication via JWT Bearer token.

**Base URL:** `http://localhost:3000/api/shows`

## Authentication

All Show endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Get a token by logging in first:

- POST `/api/auth/login` - Get JWT token

## Endpoints

### 1. List All Shows

**GET** `/api/shows`

List all shows for the authenticated user's organization.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "count": 5,
  "shows": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "organization_id": "org-123",
      "name": "Summer Festival 2025",
      "venue": "Madison Square Garden",
      "city": "New York",
      "country": "USA",
      "show_date": "2025-06-15",
      "door_time": "18:00",
      "show_time": "19:00",
      "end_time": "22:00",
      "notes": "First show of the tour",
      "ticket_url": "https://tickets.example.com/show1",
      "status": "scheduled",
      "created_at": "2025-01-10T10:00:00Z",
      "updated_at": "2025-01-10T10:00:00Z"
    }
  ]
}
```

---

### 2. Create a New Show

**POST** `/api/shows`

Create a new show for the authenticated user's organization.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Summer Festival 2025",
  "venue": "Madison Square Garden",
  "city": "New York",
  "country": "USA",
  "show_date": "2025-06-15",
  "door_time": "18:00",
  "show_time": "19:00",
  "end_time": "22:00",
  "notes": "First show of the tour",
  "ticket_url": "https://tickets.example.com/show1"
}
```

**Required Fields:**

- `name` (string) - Show name/title
- `show_date` (string) - Date in YYYY-MM-DD format

**Optional Fields:**

- `venue` (string) - Venue name
- `city` (string) - City name
- `country` (string) - Country name
- `door_time` (string) - Door open time (HH:mm format)
- `show_time` (string) - Show start time (HH:mm format)
- `end_time` (string) - Show end time (HH:mm format)
- `notes` (string) - Additional notes
- `ticket_url` (string) - URL to ticket purchase page

**Response (201 Created):**

```json
{
  "success": true,
  "show": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "organization_id": "org-123",
    "created_by": "user-123",
    "name": "Summer Festival 2025",
    "venue": "Madison Square Garden",
    "city": "New York",
    "country": "USA",
    "show_date": "2025-06-15",
    "door_time": "18:00",
    "show_time": "19:00",
    "end_time": "22:00",
    "notes": "First show of the tour",
    "ticket_url": "https://tickets.example.com/show1",
    "status": "scheduled",
    "created_at": "2025-01-10T10:30:00Z",
    "updated_at": "2025-01-10T10:30:00Z"
  }
}
```

**Error Responses:**

- 400 Bad Request - Missing required fields

```json
{
  "error": "Name and show_date are required"
}
```

---

### 3. Get a Single Show

**GET** `/api/shows/:id`

Retrieve details for a specific show.

**Path Parameters:**

- `id` (string) - Show UUID

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "show": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "organization_id": "org-123",
    "name": "Summer Festival 2025",
    "venue": "Madison Square Garden",
    "city": "New York",
    "country": "USA",
    "show_date": "2025-06-15",
    "door_time": "18:00",
    "show_time": "19:00",
    "end_time": "22:00",
    "notes": "First show of the tour",
    "ticket_url": "https://tickets.example.com/show1",
    "status": "scheduled",
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-10T10:00:00Z"
  }
}
```

**Error Responses:**

- 404 Not Found

```json
{
  "error": "Show not found"
}
```

---

### 4. Update a Show

**PUT** `/api/shows/:id`

Update an existing show. You can update any field(s).

**Path Parameters:**

- `id` (string) - Show UUID

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body (partial update - send only fields to change):**

```json
{
  "show_time": "20:00",
  "end_time": "23:00",
  "notes": "Updated note"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "show": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "organization_id": "org-123",
    "name": "Summer Festival 2025",
    "venue": "Madison Square Garden",
    "city": "New York",
    "country": "USA",
    "show_date": "2025-06-15",
    "door_time": "18:00",
    "show_time": "20:00",
    "end_time": "23:00",
    "notes": "Updated note",
    "ticket_url": "https://tickets.example.com/show1",
    "status": "scheduled",
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-10T11:00:00Z"
  }
}
```

---

### 5. Delete a Show

**DELETE** `/api/shows/:id`

Delete a show permanently.

**Path Parameters:**

- `id` (string) - Show UUID

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Show 550e8400-e29b-41d4-a716-446655440000 deleted successfully"
}
```

---

## Data Models

### Show Object

```typescript
interface Show {
  id: string; // UUID
  organization_id: string; // Organization UUID
  created_by: string; // User UUID who created
  name: string; // Show title
  venue?: string; // Venue name
  city?: string; // City name
  country?: string; // Country name
  show_date: string; // Date (YYYY-MM-DD)
  door_time?: string; // Door time (HH:mm)
  show_time?: string; // Start time (HH:mm)
  end_time?: string; // End time (HH:mm)
  notes?: string; // Additional notes
  ticket_url?: string; // Ticket purchase URL
  status: "scheduled" | "cancelled" | "completed"; // Show status
  metadata?: Record<string, any>; // Custom data
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

### Request/Response Types

```typescript
interface CreateShowRequest {
  name: string;
  venue?: string;
  city?: string;
  country?: string;
  show_date: string;
  door_time?: string;
  show_time?: string;
  end_time?: string;
  notes?: string;
  ticket_url?: string;
}

interface UpdateShowRequest {
  name?: string;
  venue?: string;
  city?: string;
  country?: string;
  show_date?: string;
  door_time?: string;
  show_time?: string;
  end_time?: string;
  notes?: string;
  ticket_url?: string;
  status?: "scheduled" | "cancelled" | "completed";
}

interface ShowResponse {
  success: boolean;
  show?: Show;
  shows?: Show[];
  count?: number;
  error?: string;
  message?: string;
}
```

---

## HTTP Status Codes

| Code | Meaning      | Example                                    |
| ---- | ------------ | ------------------------------------------ |
| 200  | OK           | GET show successful, PUT update successful |
| 201  | Created      | POST show created                          |
| 400  | Bad Request  | Missing required fields                    |
| 401  | Unauthorized | Invalid or missing JWT token               |
| 404  | Not Found    | Show ID doesn't exist                      |
| 500  | Server Error | Internal server error                      |

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common errors:

- `"Organization ID required"` - User not properly authenticated
- `"Name and show_date are required"` - Missing required fields
- `"Show not found"` - Show ID doesn't exist

---

## Examples

### cURL Examples

**Create a show:**

```bash
curl -X POST http://localhost:3000/api/shows \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New York Show",
    "venue": "MSG",
    "city": "New York",
    "country": "USA",
    "show_date": "2025-06-15",
    "show_time": "19:00",
    "ticket_url": "https://tickets.example.com"
  }'
```

**Get all shows:**

```bash
curl -X GET http://localhost:3000/api/shows \
  -H "Authorization: Bearer eyJhbGc..."
```

**Update a show:**

```bash
curl -X PUT http://localhost:3000/api/shows/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "show_time": "20:00",
    "end_time": "23:00"
  }'
```

**Delete a show:**

```bash
curl -X DELETE http://localhost:3000/api/shows/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGc..."
```

### JavaScript/Fetch Examples

**Create show:**

```javascript
const response = await fetch("http://localhost:3000/api/shows", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Summer Tour 2025",
    venue: "Amphitheater",
    city: "Los Angeles",
    country: "USA",
    show_date: "2025-07-20",
    show_time: "19:00",
  }),
});
const show = await response.json();
```

---

## Rate Limiting

Currently, no rate limiting is enforced. This will be added in a future release.

---

## Versioning

Current API Version: **1.0.0**

---

## Support

For issues or questions, please refer to the main backend README or create an issue in the repository.
