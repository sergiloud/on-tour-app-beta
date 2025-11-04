# 🧪 Shows CRUD API - Testing Guide

Complete guide for testing all 5 Shows endpoints.

## Prerequisites

1. Backend running (see below)
2. `jq` installed (for JSON formatting) - optional but helpful
3. `curl` available (comes with macOS)

## Starting the Backend

```bash
cd backend

# Build first
npm run build

# Option 1: Run compiled version
node dist/server.js

# Option 2: If dev script is configured
npm run dev

# Server will start on http://localhost:3000
```

You should see output like:
```
✅ Server starting...
🚀 Server running on http://localhost:3000
📝 Environment: development
🔌 API routes loaded: auth, shows, finance, users
```

---

## Step 1: Get JWT Token

First, authenticate to get a JWT token.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@example.com",
    "name": "Test Artist",
    "oauth_id": "oauth-123",
    "avatar_url": "https://api.example.com/avatar.jpg"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "artist@example.com",
    "name": "Test Artist",
    "avatar_url": "https://api.example.com/avatar.jpg"
  }
}
```

**Save the token:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Step 2: Create a Show

Create your first show.

```bash
curl -X POST http://localhost:3000/api/shows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Festival 2025",
    "venue": "Madison Square Garden",
    "city": "New York",
    "country": "USA",
    "show_date": "2025-06-15",
    "door_time": "18:00",
    "show_time": "19:00",
    "end_time": "22:00",
    "notes": "First show of the summer tour",
    "ticket_url": "https://tickets.example.com/summer-festival"
  }'
```

**Response:**
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
    "notes": "First show of the summer tour",
    "ticket_url": "https://tickets.example.com/summer-festival",
    "status": "scheduled",
    "created_at": "2025-01-10T12:00:00Z",
    "updated_at": "2025-01-10T12:00:00Z"
  }
}
```

**Save the show ID:**
```bash
SHOW_ID="550e8400-e29b-41d4-a716-446655440001"
```

---

## Step 3: Create More Shows (For Testing List)

Create a few more shows to test the list endpoint.

```bash
# Show 2
curl -X POST http://localhost:3000/api/shows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LA Live 2025",
    "venue": "The Forum",
    "city": "Los Angeles",
    "country": "USA",
    "show_date": "2025-07-10",
    "show_time": "20:00",
    "end_time": "23:00"
  }'

# Show 3
curl -X POST http://localhost:3000/api/shows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chicago Theater Night",
    "venue": "Chicago Theater",
    "city": "Chicago",
    "country": "USA",
    "show_date": "2025-08-05",
    "show_time": "19:30"
  }'
```

---

## Step 4: List All Shows

Get all shows for your organization.

```bash
curl -X GET http://localhost:3000/api/shows \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "shows": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "organization_id": "org-123",
      "name": "Summer Festival 2025",
      ...
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "organization_id": "org-123",
      "name": "LA Live 2025",
      ...
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "organization_id": "org-123",
      "name": "Chicago Theater Night",
      ...
    }
  ]
}
```

---

## Step 5: Get a Single Show

Retrieve details for a specific show.

```bash
curl -X GET http://localhost:3000/api/shows/$SHOW_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
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
    "notes": "First show of the summer tour",
    "ticket_url": "https://tickets.example.com/summer-festival",
    "status": "scheduled",
    "created_at": "2025-01-10T12:00:00Z",
    "updated_at": "2025-01-10T12:00:00Z"
  }
}
```

---

## Step 6: Update a Show

Update specific fields of a show.

```bash
curl -X PUT http://localhost:3000/api/shows/$SHOW_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "show_time": "20:00",
    "end_time": "23:30",
    "notes": "Updated: Doors open at 6pm, show starts at 8pm"
  }'
```

**Response:**
```json
{
  "success": true,
  "show": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "organization_id": "org-123",
    "name": "Summer Festival 2025",
    "venue": "Madison Square Garden",
    "city": "New York",
    "country": "USA",
    "show_date": "2025-06-15",
    "door_time": "18:00",
    "show_time": "20:00",
    "end_time": "23:30",
    "notes": "Updated: Doors open at 6pm, show starts at 8pm",
    "status": "scheduled",
    "created_at": "2025-01-10T12:00:00Z",
    "updated_at": "2025-01-10T12:30:00Z"
  }
}
```

---

## Step 7: Delete a Show

Delete a show permanently.

```bash
curl -X DELETE http://localhost:3000/api/shows/$SHOW_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Show 550e8400-e29b-41d4-a716-446655440001 deleted successfully"
}
```

**Verify it's deleted:**
```bash
curl -X GET http://localhost:3000/api/shows/$SHOW_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Show not found"
}
```

---

## Error Testing

### Test 1: Missing JWT Token

```bash
curl -X GET http://localhost:3000/api/shows
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid or expired token"
}
```

### Test 2: Invalid JWT Token

```bash
curl -X GET http://localhost:3000/api/shows \
  -H "Authorization: Bearer invalid_token"
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid or expired token"
}
```

### Test 3: Missing Required Field

```bash
curl -X POST http://localhost:3000/api/shows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Concert"
    # Missing show_date
  }'
```

**Response (400 Bad Request):**
```json
{
  "error": "Name and show_date are required"
}
```

### Test 4: Non-existent Show

```bash
curl -X GET http://localhost:3000/api/shows/nonexistent-id \
  -H "Authorization: Bearer $TOKEN"
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Show not found"
}
```

---

## Automation Script

Create a bash script to run all tests automatically.

**File: `test-shows.sh`**

```bash
#!/bin/bash

set -e

BASE_URL="http://localhost:3000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🧪 Shows API Test Suite${NC}\n"

# Step 1: Login
echo -e "${YELLOW}1. Getting JWT token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "oauth_id": "test-123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo -e "${GREEN}✓ Token obtained: ${TOKEN:0:20}...${NC}\n"

# Step 2: Create show
echo -e "${YELLOW}2. Creating show...${NC}"
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/api/shows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Concert",
    "venue": "Test Venue",
    "city": "New York",
    "country": "USA",
    "show_date": "2025-06-15",
    "show_time": "19:00"
  }')

SHOW_ID=$(echo $CREATE_RESPONSE | jq -r '.show.id')
echo -e "${GREEN}✓ Show created: $SHOW_ID${NC}\n"

# Step 3: List shows
echo -e "${YELLOW}3. Listing shows...${NC}"
LIST_RESPONSE=$(curl -s -X GET $BASE_URL/api/shows \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo $LIST_RESPONSE | jq -r '.count')
echo -e "${GREEN}✓ Found $COUNT shows${NC}\n"

# Step 4: Get show
echo -e "${YELLOW}4. Getting single show...${NC}"
GET_RESPONSE=$(curl -s -X GET $BASE_URL/api/shows/$SHOW_ID \
  -H "Authorization: Bearer $TOKEN")

NAME=$(echo $GET_RESPONSE | jq -r '.show.name')
echo -e "${GREEN}✓ Retrieved show: $NAME${NC}\n"

# Step 5: Update show
echo -e "${YELLOW}5. Updating show...${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT $BASE_URL/api/shows/$SHOW_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"show_time": "20:00"}')

NEW_TIME=$(echo $UPDATE_RESPONSE | jq -r '.show.show_time')
echo -e "${GREEN}✓ Updated show time to: $NEW_TIME${NC}\n"

# Step 6: Delete show
echo -e "${YELLOW}6. Deleting show...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE $BASE_URL/api/shows/$SHOW_ID \
  -H "Authorization: Bearer $TOKEN")

SUCCESS=$(echo $DELETE_RESPONSE | jq -r '.success')
echo -e "${GREEN}✓ Show deleted: $SUCCESS${NC}\n"

echo -e "${GREEN}✅ All tests passed!${NC}"
```

**Run the script:**
```bash
chmod +x test-shows.sh
./test-shows.sh
```

---

## Postman Collection

Import this into Postman for easy testing.

```json
{
  "info": {
    "name": "Shows API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/auth/login",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\",\"name\":\"Test\",\"oauth_id\":\"123\"}"
        }
      }
    },
    {
      "name": "List Shows",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/shows",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}]
      }
    },
    {
      "name": "Create Show",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/shows",
        "header": [
          {"key": "Authorization", "value": "Bearer {{token}}"},
          {"key": "Content-Type", "value": "application/json"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"Concert\",\"show_date\":\"2025-06-15\",\"venue\":\"Venue\"}"
        }
      }
    }
  ]
}
```

---

## Monitoring Logs

In another terminal, watch the server logs:

```bash
# If running with npm run dev (with logging)
npm run dev 2>&1 | grep -E "GET|POST|PUT|DELETE|Error|Created|Updated|Deleted"
```

You should see output like:
```
🔍 GET /api/shows - Retrieved 3 shows for org org-123
✨ POST /api/shows - Created show 550e8400...
🔄 PUT /api/shows/550e8400... - Updated show
🗑️  DELETE /api/shows/550e8400... - Deleted show
```

---

## Checklist

- [ ] Backend server started successfully
- [ ] JWT token obtained (valid format)
- [ ] Show created successfully
- [ ] All 3 shows listed correctly
- [ ] Single show retrieved correctly
- [ ] Show updated with new time
- [ ] Show deleted successfully
- [ ] Error cases handled properly
- [ ] All endpoints return proper JSON
- [ ] HTTP status codes correct (201 for create, etc.)

---

## Troubleshooting

### "Connection refused"
- Backend not running. Start with `npm run build && node dist/server.js`

### "Invalid or expired token"
- JWT token invalid or expired. Get a new token with login endpoint.

### "Show not found"
- Show ID doesn't exist. Check ID in previous response.

### JSON parsing errors
- Response not valid JSON. Install `jq` for better formatting.

### CORS errors
- Frontend testing. CORS needs to be configured in app.ts.

---

For more details, see:
- `docs/SHOWS_API.md` - API reference
- `docs/SHOWS_ARCHITECTURE.md` - System design
- `backend/README.md` - Backend setup
