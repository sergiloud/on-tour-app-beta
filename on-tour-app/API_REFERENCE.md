# API Documentation - Complete Endpoint Reference

**Backend API Version**: 2.0.0  
**Total Endpoints**: 41  
**Base URL**: `http://localhost:3000` (dev) or `https://api.ontourapp.com` (prod)

---

## Authentication

All endpoints (except `/health`) require JWT Bearer token authentication:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints by Category

### 1. Health Check (1 endpoint)

No authentication required.

```
GET /health
```

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2025-11-04T10:30:00Z",
  "database": "connected"
}
```

---

### 2. Shows Management (14 endpoints)

Base path: `/api/shows`

#### List Shows
```
GET /api/shows
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `status` (optional): Filter by status (draft, scheduled, active, completed, cancelled)
- `search` (optional): Search by title

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Summer Music Festival 2025",
      "status": "active",
      "startDate": "2025-06-15T00:00:00Z",
      "endDate": "2025-06-17T00:00:00Z",
      "type": "festival",
      "location": "Central Park, New York",
      "capacity": 10000,
      "budget": 250000,
      "currency": "USD",
      "organizationId": "org-uuid",
      "createdBy": "user-uuid",
      "createdAt": "2025-05-01T10:00:00Z",
      "updatedAt": "2025-05-15T14:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "hasMore": false
}
```

#### Get Show Details
```
GET /api/shows/:id
```

#### Create Show
```
POST /api/shows
Content-Type: application/json

{
  "title": "New Concert",
  "description": "Amazing concert experience",
  "status": "scheduled",
  "startDate": "2025-07-01T19:00:00Z",
  "endDate": "2025-07-01T23:00:00Z",
  "type": "concert",
  "location": "Madison Square Garden, NYC",
  "capacity": 20000,
  "budget": 500000,
  "currency": "USD"
}
```

**Response** (201):
```json
{
  "id": "new-uuid",
  "title": "New Concert",
  ...
}
```

#### Update Show
```
PATCH /api/shows/:id
Content-Type: application/json

{
  "title": "Updated Concert Title",
  "status": "active",
  "budget": 550000
}
```

#### Delete Show
```
DELETE /api/shows/:id
```

**Response** (204): No content

#### Search Shows
```
GET /api/shows/search?query=festival&type=festival
```

#### Get Show Statistics
```
GET /api/shows/:id/stats
```

**Response** (200):
```json
{
  "showId": "uuid",
  "title": "Summer Music Festival 2025",
  "totalBudget": 250000,
  "totalIncome": 300000,
  "totalExpenses": 200000,
  "netProfit": 100000,
  "attendeeCount": 8500,
  "profitMargin": 40,
  "financialRecords": 25,
  "itineraryCount": 3,
  "avgTicketPrice": 35.29
}
```

#### More Shows endpoints...
(Total: 14 endpoints)

---

### 3. Finance Management (5 endpoints)

Base path: `/api/finance`

#### Get Finance Records for Show
```
GET /api/finance/:showId
```

**Query Parameters**:
- `type` (optional): Filter by type (income, expense)
- `status` (optional): Filter by status (pending, approved, rejected)
- `startDate` (optional): Date range start
- `endDate` (optional): Date range end

**Response** (200):
```json
[
  {
    "id": "uuid",
    "showId": "show-uuid",
    "category": "Artist Fees",
    "amount": 100000,
    "currency": "USD",
    "type": "expense",
    "description": "International artist performances",
    "status": "approved",
    "transactionDate": "2025-05-01",
    "approvedBy": "user-uuid",
    "createdAt": "2025-04-30T10:00:00Z"
  }
]
```

#### Create Finance Record
```
POST /api/finance
Content-Type: application/json

{
  "showId": "show-uuid",
  "category": "Venue Rental",
  "amount": 75000,
  "currency": "USD",
  "type": "expense",
  "description": "Convention center rental for 3 days",
  "status": "pending",
  "transactionDate": "2025-06-01"
}
```

#### Approve Finance Record
```
PATCH /api/finance/:recordId/approve
```

#### Get Finance Report
```
GET /api/finance/:showId/report
```

**Response** (200):
```json
{
  "showId": "uuid",
  "totalIncome": 150000,
  "totalExpenses": 100000,
  "netProfit": 50000,
  "feesCharged": 5000,
  "profitAfterFees": 45000,
  "recordCount": 12,
  "approvedCount": 10,
  "pendingCount": 2,
  "currency": "USD"
}
```

#### Create Settlement
```
POST /api/finance/settlements
Content-Type: application/json

{
  "name": "Q2 2025 Settlement",
  "settlementDate": "2025-07-01",
  "totalAmount": 250000,
  "currency": "USD",
  "notes": "Q2 earnings settlement",
  "bankAccountNumber": "****1234",
  "bankRoutingNumber": "021000021"
}
```

(Total: 5 endpoints)

---

### 4. Travel Planning (3+ endpoints)

Base path: `/api/travel`

#### Get Itineraries
```
GET /api/travel/itineraries?showId=show-uuid
```

#### Create Itinerary
```
POST /api/travel/itineraries
Content-Type: application/json

{
  "showId": "show-uuid",
  "title": "Artist Arrival & Setup",
  "description": "Artist arrival and venue setup",
  "startDate": "2025-06-14",
  "endDate": "2025-06-15",
  "destination": "New York",
  "activities": ["Travel", "Hotel Check-in", "Sound Check"],
  "status": "confirmed",
  "numberOfDays": 2,
  "estimatedCost": 10000,
  "currency": "USD"
}
```

#### Update Itinerary
```
PATCH /api/travel/itineraries/:id
```

---

### 5. Flight Booking (Amadeus Integration) - 8 endpoints

Base path: `/api/amadeus`

#### Search Flights
```
POST /api/amadeus/search
Content-Type: application/json

{
  "departureCity": "NYC",
  "arrivalCity": "LAX",
  "departureDate": "2025-07-01",
  "returnDate": "2025-07-05",
  "passengers": {
    "adults": 1,
    "children": 0,
    "infants": 0
  },
  "travelClass": "ECONOMY",
  "currency": "USD"
}
```

**Response** (200):
```json
{
  "flightOffers": [
    {
      "id": "1",
      "source": "NYC",
      "destination": "LAX",
      "departureTime": "2025-07-01T08:00:00Z",
      "arrivalTime": "2025-07-01T11:30:00Z",
      "duration": "PT5H30M",
      "price": {
        "total": "250.00",
        "base": "200.00",
        "fees": [],
        "grandTotal": "250.00"
      },
      "aircraft": "787",
      "airline": "DL",
      "flightNumber": "123",
      "numberOfStops": 0
    }
  ],
  "currency": "USD"
}
```

#### Confirm Flight Offer
```
POST /api/amadeus/confirm
Content-Type: application/json

{
  "flightOfferId": "1"
}
```

#### Create Booking
```
POST /api/amadeus/book
Content-Type: application/json

{
  "flightOfferId": "1",
  "travelers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-15",
      "gender": "M"
    }
  ]
}
```

#### Get Flight Status
```
GET /api/amadeus/status/:carrierCode/:flightNumber/:date
```

Example: `/api/amadeus/status/DL/123/2025-07-01`

#### Get Airport Info
```
GET /api/amadeus/airport/:iataCode
```

Example: `/api/amadeus/airport/JFK`

#### Get Airline Info
```
GET /api/amadeus/airline/:carrierCode
```

Example: `/api/amadeus/airline/DL`

#### Get Seat Availability
```
POST /api/amadeus/seat-availability/:flightOfferId
```

#### Check Flight Availability (Batch)
```
POST /api/amadeus/availability
Content-Type: application/json

{
  "flights": [
    { "carrierCode": "DL", "flightNumber": "123", "date": "2025-07-01" },
    { "carrierCode": "AA", "flightNumber": "456", "date": "2025-07-01" }
  ]
}
```

(Total: 8 endpoints)

---

### 6. Payment Processing (Stripe Integration) - 9 endpoints

Base path: `/api/stripe`

#### Create Payment Intent
```
POST /api/stripe/payment-intent
Content-Type: application/json

{
  "amount": 25000,
  "currency": "USD",
  "description": "Flight tickets for Summer Festival",
  "customerId": "customer-uuid",
  "paymentMethodId": "pm-uuid"
}
```

**Response** (201):
```json
{
  "id": "pi_xxx",
  "amount": 25000,
  "currency": "USD",
  "status": "requires_confirmation",
  "clientSecret": "pi_xxx_secret_xxx",
  "description": "Flight tickets for Summer Festival",
  "customer": "customer-uuid",
  "metadata": {}
}
```

#### Confirm Payment
```
POST /api/stripe/confirm-payment
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": "pm_xxx"
}
```

#### Get Payment Intent
```
GET /api/stripe/payment-intent/:paymentIntentId
```

#### Create Customer
```
POST /api/stripe/customer
Content-Type: application/json

{
  "email": "artist@example.com",
  "name": "Artist Name",
  "metadata": { "organizationId": "org-uuid" }
}
```

#### Get Customer
```
GET /api/stripe/customer/:customerId
```

#### Create Transfer
```
POST /api/stripe/transfer
Content-Type: application/json

{
  "destinationAccountId": "acct_xxxx",
  "amount": 50000,
  "currency": "USD",
  "description": "Settlement for July events"
}
```

#### Create Refund
```
POST /api/stripe/refund
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx",
  "reason": "requested_by_customer",
  "amount": 5000
}
```

#### Handle Settlement
```
POST /api/stripe/settlement
Content-Type: application/json

{
  "settlementId": "settlement-uuid",
  "amount": 250000,
  "currency": "USD"
}
```

#### Get Account Balance
```
GET /api/stripe/balance
```

**Response** (200):
```json
{
  "available": [
    { "amount": 500000, "currency": "USD" }
  ],
  "pending": [
    { "amount": 100000, "currency": "USD" }
  ]
}
```

(Total: 9 endpoints)

---

### 7. Email Notifications (6 endpoints)

Base path: `/api/email`

#### Send Generic Email
```
POST /api/email/send
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Event Update",
  "html": "<h1>Event Details</h1><p>Your show details...</p>",
  "text": "Event Details\nYour show details...",
  "cc": ["cc@example.com"],
  "replyTo": "noreply@ontourapp.com"
}
```

#### Send Booking Confirmation
```
POST /api/email/booking
Content-Type: application/json

{
  "to": "artist@example.com",
  "bookingDetails": {
    "showTitle": "Summer Festival 2025",
    "date": "2025-06-15",
    "venue": "Central Park",
    "artistFee": 100000,
    "confirmationNumber": "CONF-123456"
  }
}
```

#### Send Event Reminder
```
POST /api/email/event-reminder
Content-Type: application/json

{
  "to": "attendee@example.com",
  "eventDetails": {
    "title": "Summer Festival 2025",
    "date": "2025-06-15",
    "time": "19:00",
    "location": "Central Park"
  }
}
```

#### Send Invoice
```
POST /api/email/invoice
Content-Type: application/json

{
  "to": "client@example.com",
  "invoiceDetails": {
    "invoiceNumber": "INV-2025-001",
    "amount": 50000,
    "items": ["Artist Fees", "Venue Rental"],
    "dueDate": "2025-07-15"
  }
}
```

#### Send Settlement Report
```
POST /api/email/settlement-report
Content-Type: application/json

{
  "to": "organization@example.com",
  "settlementDetails": {
    "settlementName": "Q2 2025 Settlement",
    "totalAmount": 250000,
    "settlementDate": "2025-07-01",
    "breakdown": [
      { "category": "Shows", "amount": 200000 },
      { "category": "Fees", "amount": -50000 }
    ]
  }
}
```

#### Send Alert
```
POST /api/email/alert
Content-Type: application/json

{
  "to": "admin@example.com",
  "urgency": "high",
  "message": "Payment processing failed for show #123",
  "details": "Please investigate the failed payment intent."
}
```

(Total: 6 endpoints)

---

## Error Responses

All errors follow this format:

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authentication token",
  "statusCode": 401
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Show not found",
  "statusCode": 404
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "statusCode": 500,
  "timestamp": "2025-11-04T10:30:00Z"
}
```

---

## Rate Limiting

- Rate limit: 100 requests per minute
- Header: `X-RateLimit-Limit: 100`
- Remaining: `X-RateLimit-Remaining: 95`
- Reset: `X-RateLimit-Reset: 1699094400`

---

## Webhook Events

### Payment Events
- `payment_intent.created`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Settlement Events
- `settlement.started`
- `settlement.completed`
- `settlement.failed`

### Flight Events
- `flight_booked`
- `flight_status_changed`

---

## API Client Examples

### JavaScript/TypeScript
```typescript
const response = await fetch('http://localhost:3000/api/shows', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### cURL
```bash
curl -X GET http://localhost:3000/api/shows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}
response = requests.get('http://localhost:3000/api/shows', headers=headers)
data = response.json()
```

---

## Documentation Links

- **Interactive Docs**: http://localhost:3000/api-docs
- **OpenAPI Spec**: http://localhost:3000/api-docs.json
- **GitHub**: https://github.com/ontourapp/on-tour-app-2
- **Issues**: https://github.com/ontourapp/on-tour-app-2/issues

---

*Last Updated: November 4, 2025*  
*API Version: 2.0.0*  
*Total Endpoints: 41*
