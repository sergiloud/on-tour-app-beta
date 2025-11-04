# Backend Testing Guide - FASE 6

Complete guide to testing the On Tour App backend API.

## Quick Start

### Installation

```bash
# Install test dependencies (included in npm install)
npm install

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

## Testing Strategies

### 1. Manual Testing with curl

Test endpoints directly:

```bash
# Get health check
curl http://localhost:3000/health

# Create a show (requires token)
curl -X POST http://localhost:3000/api/shows \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Show",
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-06-30T23:59:59Z",
    "location": "Test City",
    "budget": 10000
  }'
```

### 2. Bash Script Testing

Create `test-shows.sh`:

```bash
#!/bin/bash

API="http://localhost:3000"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

echo "=== Testing Shows API ==="

# List shows
echo "1. GET /api/shows"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/api/shows" | jq .

# Create show
echo -e "\n2. POST /api/shows"
RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Show",
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-06-30T23:59:59Z",
    "location": "Test City",
    "budget": 10000
  }' \
  "$API/api/shows")

echo $RESPONSE | jq .
SHOW_ID=$(echo $RESPONSE | jq -r '.data.id')

# Get show
echo -e "\n3. GET /api/shows/$SHOW_ID"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/api/shows/$SHOW_ID" | jq .

# Update show
echo -e "\n4. PUT /api/shows/$SHOW_ID"
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "scheduled",
    "budget": 15000
  }' \
  "$API/api/shows/$SHOW_ID" | jq .

# Delete show
echo -e "\n5. DELETE /api/shows/$SHOW_ID"
curl -s -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "$API/api/shows/$SHOW_ID"

echo -e "\n✅ Tests completed"
```

Run it:
```bash
chmod +x test-shows.sh
./test-shows.sh
```

### 3. Postman Collection

Create `postman-collection.json`:

```json
{
  "info": {
    "name": "On Tour App Backend",
    "version": "1.0.0"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Shows",
      "item": [
        {
          "name": "List Shows",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/shows"
          }
        },
        {
          "name": "Create Show",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/shows",
            "body": {
              "mode": "raw",
              "raw": "{\"title\": \"Test Show\", ...}"
            }
          }
        }
      ]
    }
  ]
}
```

### 4. Unit Tests with Vitest

File structure:
```
tests/
├── unit/
│   ├── shows.service.test.ts
│   ├── finance.service.test.ts
│   └── travel.service.test.ts
└── integration/
    ├── shows.routes.test.ts
    ├── finance.routes.test.ts
    └── travel.routes.test.ts
```

Example test (`tests/unit/shows.service.test.ts`):

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ShowsService } from '../../src/services/showsService';

describe('ShowsService', () => {
  const organizationId = 'org-123';
  const userId = 'user-456';

  beforeEach(() => {
    // Clear mock database before each test
  });

  describe('createShow', () => {
    it('should create a new show', async () => {
      const input = {
        title: 'Summer Tour',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-08-31T23:59:59Z',
        location: 'North America',
        budget: 500000,
      };

      const show = await ShowsService.createShow(organizationId, userId, input);

      expect(show).toBeDefined();
      expect(show.id).toBeDefined();
      expect(show.title).toBe('Summer Tour');
      expect(show.status).toBe('draft');
      expect(show.organizationId).toBe(organizationId);
    });

    it('should fail with invalid input', async () => {
      const invalidInput = {
        title: '', // Empty title
        startDate: 'invalid-date',
        endDate: '2025-08-31T23:59:59Z',
        location: 'North America',
      };

      await expect(
        ShowsService.createShow(organizationId, userId, invalidInput)
      ).rejects.toThrow();
    });
  });

  describe('listShows', () => {
    it('should list shows', async () => {
      // Create test shows
      await ShowsService.createShow(organizationId, userId, {
        title: 'Show 1',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-06-30T23:59:59Z',
        location: 'City 1',
      });

      const { shows, total } = await ShowsService.listShows(organizationId);

      expect(shows).toHaveLength(1);
      expect(total).toBe(1);
    });
  });
});
```

Run tests:
```bash
npm run test                    # Watch mode
npm run test:run                # Single run
npm run test -- shows.service   # Specific file
npm run test:coverage           # With coverage
```

## Testing Endpoints

### Shows Endpoints

**1. List Shows**

```bash
# Request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/shows

# Expected Response
{
  "data": [
    {
      "id": "uuid",
      "title": "Summer Tour",
      "status": "draft",
      "startDate": "2025-06-01T00:00:00Z",
      "endDate": "2025-08-31T23:59:59Z",
      ...
    }
  ],
  "pagination": { "total": 1, "limit": 50, "offset": 0 }
}
```

**2. Create Show**

```bash
# Request
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Tour",
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-08-31T23:59:59Z",
    "location": "North America",
    "budget": 500000
  }' \
  http://localhost:3000/api/shows

# Expected Response (201)
{
  "data": {
    "id": "uuid",
    "title": "Summer Tour",
    "status": "draft",
    ...
  }
}
```

**3. Get Show**

```bash
# Request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/shows/show-uuid

# Expected Response (200)
{ "data": { ... } }

# Not Found Response (404)
{ "error": "Show not found" }
```

**4. Update Show**

```bash
# Request
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "scheduled",
    "budget": 550000
  }' \
  http://localhost:3000/api/shows/show-uuid

# Expected Response (200)
{ "data": { ... } }
```

**5. Delete Show**

```bash
# Request
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/shows/show-uuid

# Expected Response (204 No Content)
```

### Finance Endpoints

**1. Financial Summary**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/finance/summary

# Response
{
  "data": {
    "totalRevenue": 0,
    "totalExpenses": 0,
    "netIncome": 0,
    "currency": "USD"
  }
}
```

**2. Calculate Fees**

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "showIds": ["show-1", "show-2"],
    "commissionRate": 0.15,
    "taxRate": 0.08
  }' \
  http://localhost:3000/api/finance/calculate-fees

# Response
{
  "data": {
    "totalGross": 10000,
    "commission": 1500,
    "taxes": 800,
    "totalNet": 7700
  }
}
```

### Travel Endpoints

**1. Search Flights**

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "departure": "LAX",
    "arrival": "NYC",
    "departureDate": "2025-06-01T10:00:00Z",
    "passengers": 5
  }' \
  http://localhost:3000/api/travel/search-flights

# Response
{
  "data": [
    {
      "id": "flight_1",
      "airline": "United",
      "departure": "LAX",
      "arrival": "NYC",
      "price": 450
    }
  ]
}
```

## Common Issues & Solutions

### 1. "Missing authorization token"

**Problem**: Endpoint returns 401 error  
**Solution**: Add Authorization header with valid JWT token

```bash
curl -H "Authorization: Bearer <valid-token>" ...
```

### 2. "Validation error"

**Problem**: Endpoint returns 400 with validation details  
**Solution**: Check request body against schema

```bash
# Wrong
{ "title": "" }  # Title is required and not empty

# Correct
{ "title": "Show Name", "startDate": "2025-06-01T00:00:00Z" }
```

### 3. Tests failing

**Problem**: Tests have errors  
**Solution**: 

```bash
# Check errors
npm run test:run

# Check specific file
npm run test -- shows.service

# Check types
npm run type-check

# Check lint
npm run lint
```

### 4. Port already in use

**Problem**: Error "EADDRINUSE"  
**Solution**: 

```bash
# Kill process on port 3000
lsof -ti :3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## Coverage Goals

### Week 1 Target
- Unit tests: 40% coverage
- Integration tests: Basic endpoints tested
- Manual testing: All happy paths verified

### Week 2 Target
- Unit tests: 60% coverage
- Integration tests: Error cases included
- E2E tests: User workflows tested

### Production Target
- Unit tests: 80% coverage
- Integration tests: All scenarios
- E2E tests: Complete workflows

## Test Template

```typescript
// tests/unit/your-test.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature', () => {
  let testData: any;

  beforeEach(() => {
    // Setup before each test
    testData = {};
  });

  describe('Action', () => {
    it('should do something', async () => {
      // Arrange
      const input = { ... };

      // Act
      const result = await service.method(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('should handle errors', async () => {
      // Arrange
      const invalidInput = { ... };

      // Act & Assert
      await expect(
        service.method(invalidInput)
      ).rejects.toThrow('Expected error');
    });
  });
});
```

## Next Steps

1. **Start dev server**: `npm run dev`
2. **Test endpoints**: Use curl examples above
3. **Write unit tests**: For ShowsService
4. **Improve coverage**: Target 40% for Week 1
5. **Document results**: Track test results

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0  
**Status**: Ready for testing

Happy testing! 🚀
