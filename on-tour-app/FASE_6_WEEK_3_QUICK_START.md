# 🚀 FASE 6 WEEK 3 - QUICK START & ACTION PLAN

**Start Date**: November 5, 2025  
**Target Duration**: 16-22 hours  
**Expected Completion**: November 8-9, 2025  
**Status**: 🟢 READY TO START

---

## 📋 PHASE OVERVIEW

FASE 6 Week 3 focuses on implementing **Advanced Business Logic** and **Third-party Integrations**, transforming the backend from a CRUD API into a real-world business application.

### Phase Objectives

| Objective                       | Priority | Hours | Status   |
| ------------------------------- | -------- | ----- | -------- |
| Real Finance Calculation Engine | P1       | 8-10  | ⏳ Ready |
| Amadeus Flight API Integration  | P2       | 6-8   | ⏳ Ready |
| Payment Processing (Stripe)     | P2       | 4-6   | ⏳ Ready |
| Email Notification System       | P3       | 2-4   | ⏳ Ready |
| Database Seeding Enhancement    | P3       | 2-3   | ⏳ Ready |

**Total**: 22-31 hours (flexible priority-based delivery)

---

## ✅ PRE-REQUISITES

### ✅ Already Complete

- [x] Backend API structure (14 endpoints)
- [x] PostgreSQL database with 4 entities
- [x] 50+ test cases (unit + integration)
- [x] Swagger/OpenAPI documentation
- [x] Development environment setup
- [x] Git repository clean and organized
- [x] All dependencies installed
- [x] All tests passing (100%)

### 🎯 Before Starting Week 3

```bash
# 1. Verify everything is still working
cd backend
npm test                    # Should see 50+ tests passing
npm run build              # Should complete without errors

# 2. Start the development server
npm run dev                # Should see "listening on port 3000"

# 3. Verify Swagger documentation
# Visit: http://localhost:3000/api-docs

# 4. Check database seeding
npm run seed              # Should populate with sample data
```

---

## 🎯 IMPLEMENTATION ROADMAP

### Priority 1: Real Finance Calculation Engine (8-10 hours)

**Why This First**: Foundation for all other finance-related features; needed for payment processing and settlements.

#### 1.1 Create Finance Service Layer

**File**: `backend/src/services/FinanceService.ts`

```typescript
// Key calculations to implement:
export class FinanceService {
  // Calculate net profit for a show
  calculateShowProfit(show: Show): {
    grossRevenue: number;
    expenses: number;
    netProfit: number;
    margin: number;
  };

  // Calculate fees (artist fee, agency fee, taxes)
  calculateFees(
    amount: number,
    feeStructure: FeeConfig
  ): {
    artistFee: number;
    agencyFee: number;
    taxes: number;
    total: number;
  };

  // Convert currency with real-time rates
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number>;

  // Calculate settlement amounts (split payments)
  calculateSettlement(showId: string, splitConfig: SplitConfig): Promise<SettlementBreakdown>;

  // Generate financial report
  generateFinancialReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FinancialReport>;
}
```

**Testing**: Create `backend/tests/unit/FinanceService.test.ts`

- Test profit calculations with various scenarios
- Test fee calculations
- Test currency conversion
- Test settlement calculations

**Database Additions**:

- Create `FeeConfiguration` entity
- Create `ExchangeRate` cache table
- Add indices for performance

#### 1.2 Create Finance Controller Endpoints

**File**: `backend/src/controllers/FinanceController.ts`

**New Endpoints**:

```
POST /api/finance/show/:id/calculate-profit
  → Returns: { grossRevenue, expenses, netProfit, margin }

POST /api/finance/calculate-fees
  Body: { amount: number, feeStructure: FeeConfig }
  → Returns: { artistFee, agencyFee, taxes, total }

POST /api/finance/convert-currency
  Body: { amount: number, from: string, to: string }
  → Returns: { original, converted, rate, timestamp }

POST /api/finance/settlement/calculate
  Body: { showId: string, splitConfig: SplitConfig }
  → Returns: SettlementBreakdown (individual payouts)

GET /api/finance/report
  Query: { organizationId, startDate, endDate }
  → Returns: FinancialReport (PDF/JSON)
```

**Integration Tests**: `backend/tests/integration/finance.routes.test.ts`

- Test all new endpoints
- Test error scenarios (invalid amounts, unsupported currencies)
- Test report generation

#### 1.3 Add Validation & Error Handling

**Zod Schemas**: `backend/src/schemas/finance.schemas.ts`

```typescript
// Define schemas for all finance inputs
export const FeeConfigSchema = z.object({
  artistPercentage: z.number().min(0).max(100),
  agencyPercentage: z.number().min(0).max(100),
  taxPercentage: z.number().min(0).max(50),
});

export const CurrencyConversionSchema = z.object({
  amount: z.number().positive(),
  from: z.enum(['USD', 'EUR', 'GBP', 'MXN', 'ARS']),
  to: z.enum(['USD', 'EUR', 'GBP', 'MXN', 'ARS']),
});

export const SettlementSchema = z.object({
  showId: z.string().uuid(),
  participants: z.array(
    z.object({
      participantId: z.string(),
      percentage: z.number().min(0).max(100),
    })
  ),
});
```

**Deliverables**:

- [ ] FinanceService with all calculations
- [ ] FinanceController with 4 new endpoints
- [ ] 30+ unit tests for FinanceService
- [ ] 20+ integration tests for endpoints
- [ ] Complete Swagger documentation
- [ ] Error handling & validation

**Estimated Time**: 8-10 hours

---

### Priority 2: Third-party API Integrations (12-16 hours)

#### 2.1 Amadeus Flight Search API (6-8 hours)

**Why**: Enable users to search for flights directly within the app.

**File**: `backend/src/services/AmadeusService.ts`

```typescript
// Amadeus API integration
export class AmadeusService {
  // Search available flights
  searchFlights(
    from: string, // IATA code (MAD, NYC, etc)
    to: string,
    date: Date,
    passengers: number
  ): Promise<Flight[]>;

  // Get flight prices
  getFlightPrices(searchId: string): Promise<PriceQuote>;

  // Book a flight (creates integration record)
  bookFlight(flightId: string, passengerDetails: PassengerInfo[]): Promise<Booking>;

  // Get booking status
  getBookingStatus(bookingId: string): Promise<BookingStatus>;

  // Cancel booking
  cancelBooking(bookingId: string): Promise<CancellationConfirmation>;
}
```

**New Endpoints**:

```
GET /api/travel/flights/search
  Query: { from, to, date, passengers }
  → Returns: Flight[]

GET /api/travel/flights/:flightId/price
  → Returns: PriceQuote

POST /api/travel/flights/book
  Body: { flightId, passengerDetails }
  → Returns: Booking confirmation

GET /api/travel/bookings/:bookingId/status
  → Returns: BookingStatus

DELETE /api/travel/bookings/:bookingId
  → Returns: CancellationConfirmation
```

**Setup Required**:

1. Sign up for Amadeus API at https://developers.amadeus.com
2. Get Client ID and Client Secret
3. Add to `.env`: `AMADEUS_API_KEY` and `AMADEUS_API_SECRET`
4. Create `AmadeusConfig` in database

**Testing**:

- Mock Amadeus API responses
- Test flight search with various parameters
- Test error handling (no flights found, API errors)
- Test booking flow

**Deliverables**:

- [ ] AmadeusService with flight search/booking
- [ ] 5 new API endpoints for flights
- [ ] 15+ integration tests
- [ ] Swagger documentation
- [ ] Error handling & retry logic
- [ ] Rate limiting for API calls

**Estimated Time**: 6-8 hours

#### 2.2 Payment Processing (Stripe) (4-6 hours)

**Why**: Enable real payment processing and settlements.

**File**: `backend/src/services/StripeService.ts`

```typescript
export class StripeService {
  // Create payment intent
  createPaymentIntent(amount: number, currency: string, metadata: object): Promise<PaymentIntent>;

  // Process payment
  processPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentResult>;

  // Create transfer (for settlement)
  createTransfer(amount: number, recipientStripeId: string, description: string): Promise<Transfer>;

  // Refund payment
  refundPayment(paymentIntentId: string, amount?: number): Promise<Refund>;

  // Get transaction history
  getTransactionHistory(filters: TransactionFilter): Promise<Transaction[]>;
}
```

**New Endpoints**:

```
POST /api/finance/payments/create-intent
  Body: { amount, currency, metadata }
  → Returns: ClientSecret for frontend

POST /api/finance/payments/process
  Body: { paymentIntentId, paymentMethodId }
  → Returns: PaymentResult

POST /api/finance/settlements/process
  Body: { showId, recipients }
  → Returns: Settlement confirmation

POST /api/finance/payments/refund
  Body: { paymentIntentId, amount? }
  → Returns: Refund confirmation

GET /api/finance/transactions
  Query: { startDate, endDate, status }
  → Returns: Transaction[]
```

**Setup Required**:

1. Create Stripe account at https://stripe.com
2. Get Publishable Key and Secret Key
3. Add to `.env`: `STRIPE_PUBLIC_KEY` and `STRIPE_SECRET_KEY`
4. Create `StripeConfiguration` in database

**Testing**:

- Mock Stripe API responses
- Test payment intent creation
- Test payment processing
- Test settlement distribution
- Test error scenarios (declined cards, etc)

**Deliverables**:

- [ ] StripeService with payment handling
- [ ] 4 new API endpoints for payments
- [ ] 15+ integration tests
- [ ] Swagger documentation
- [ ] Webhook handling for payment updates
- [ ] Error recovery & retry logic

**Estimated Time**: 4-6 hours

#### 2.3 Email Notification System (2-4 hours)

**Why**: Send transactional emails (confirmations, reminders, reports).

**File**: `backend/src/services/EmailService.ts`

```typescript
export class EmailService {
  // Send show confirmation
  sendShowConfirmation(show: Show, recipient: string): Promise<void>;

  // Send settlement notification
  sendSettlementNotification(settlement: Settlement, recipients: string[]): Promise<void>;

  // Send financial report
  sendFinancialReport(report: FinancialReport, recipient: string): Promise<void>;

  // Send booking reminder
  sendBookingReminder(show: Show, recipient: string): Promise<void>;

  // Send alert (issues detected)
  sendAlert(alert: Alert, recipients: string[]): Promise<void>;
}
```

**Email Templates** (`backend/src/email-templates/`):

- `show-confirmation.hbs`
- `settlement-notification.hbs`
- `financial-report.hbs`
- `booking-reminder.hbs`
- `alert-notification.hbs`

**Setup Options**:

- Option A: SendGrid (recommended for scale)
- Option B: Mailgun (simple, reliable)
- Option C: AWS SES (if already using AWS)

**Deliverables**:

- [ ] EmailService with template rendering
- [ ] 5 email templates
- [ ] Email queue system (Bull/Redis)
- [ ] Webhook handling for bounces/opens
- [ ] 10+ tests

**Estimated Time**: 2-4 hours

---

### Priority 3: Database & Testing Enhancements (2-3 hours)

#### 3.1 Enhanced Database Seeding

**File**: `backend/src/scripts/seed-enhanced.ts`

```typescript
// Create more realistic test scenarios:
- 5 tour companies with different structures
- 20 shows (past, current, future)
- 50+ finance records (various scenarios)
- 15 itineraries with flights
- 10 settlements (various statuses)
- Real-world currency mixes
- Edge cases (canceled shows, refunds, etc)
```

#### 3.2 Test Utilities & Factories

**Files**:

- `backend/tests/factories/ShowFactory.ts`
- `backend/tests/factories/FinanceFactory.ts`
- `backend/tests/utils/test-helpers.ts`

**Deliverables**:

- [ ] Enhanced seeding script
- [ ] Factory pattern for test data
- [ ] Test utilities for common scenarios
- [ ] Database cleanup helpers

**Estimated Time**: 2-3 hours

---

## 📦 DEPENDENCIES TO ADD

```bash
npm install --save \
  axios \                    # HTTP client for APIs
  stripe \                   # Stripe payment processing
  handlebars \               # Email template rendering
  nodemailer \               # Email sending
  bull \                     # Job queue for emails
  redis \                    # Cache & queue backend
  dotenv-expand \            # Environment variable expansion
  axios-retry \              # Automatic retry logic

npm install --save-dev \
  @types/nodemailer \
  @types/bull
```

---

## 🗂️ FILE STRUCTURE AFTER WEEK 3

```
backend/
├── src/
│   ├── services/
│   │   ├── FinanceService.ts (NEW)
│   │   ├── AmadeusService.ts (NEW)
│   │   ├── StripeService.ts (NEW)
│   │   ├── EmailService.ts (NEW)
│   │   └── ShowsService.ts (existing)
│   ├── controllers/
│   │   ├── FinanceController.ts (NEW - expanded)
│   │   ├── TravelController.ts (NEW - expanded)
│   │   └── ShowsController.ts (existing)
│   ├── schemas/
│   │   ├── finance.schemas.ts (NEW)
│   │   └── travel.schemas.ts (NEW)
│   ├── email-templates/
│   │   ├── show-confirmation.hbs (NEW)
│   │   ├── settlement-notification.hbs (NEW)
│   │   ├── financial-report.hbs (NEW)
│   │   ├── booking-reminder.hbs (NEW)
│   │   └── alert-notification.hbs (NEW)
│   ├── config/
│   │   ├── amadeus.config.ts (NEW)
│   │   ├── stripe.config.ts (NEW)
│   │   ├── email.config.ts (NEW)
│   │   └── swagger.ts (existing)
│   ├── scripts/
│   │   ├── seed-enhanced.ts (NEW)
│   │   └── seed.ts (existing)
│   └── index.ts (updated)
├── tests/
│   ├── unit/
│   │   ├── FinanceService.test.ts (NEW - 30+ tests)
│   │   ├── AmadeusService.test.ts (NEW - 20+ tests)
│   │   ├── StripeService.test.ts (NEW - 20+ tests)
│   │   └── ShowsService.test.ts (existing)
│   └── integration/
│       ├── finance.routes.test.ts (NEW - 20+ tests)
│       ├── travel.routes.test.ts (NEW - 25+ tests)
│       ├── payments.routes.test.ts (NEW - 20+ tests)
│       └── shows.routes.test.ts (existing)
├── package.json (updated)
├── .env.example (updated)
└── README.md (updated)
```

---

## 🧪 TESTING STRATEGY

### Unit Tests (Priority 1)

```
FinanceService: 30+ tests
  ├─ Profit calculations (5 scenarios)
  ├─ Fee calculations (4 fee structures)
  ├─ Currency conversion (10 currency pairs)
  ├─ Settlement distribution (5 split configs)
  └─ Report generation (5 date ranges)

AmadeusService: 20+ tests (mocked API)
  ├─ Flight search (10 scenarios)
  ├─ Price fetching (5 scenarios)
  └─ Error handling (5 error cases)

StripeService: 20+ tests (mocked API)
  ├─ Payment intent creation (5 scenarios)
  ├─ Payment processing (5 scenarios)
  ├─ Transfers (5 scenarios)
  └─ Error handling (5 error cases)

EmailService: 10+ tests
  ├─ Template rendering (5 templates)
  └─ Error handling (5 cases)
```

### Integration Tests (Priority 2)

```
Finance Routes: 20+ tests
  ├─ All endpoints with real data
  ├─ Database transactions
  └─ Error scenarios

Travel Routes: 25+ tests
  ├─ Flight search workflow
  ├─ Booking workflow
  └─ Error handling

Payment Routes: 20+ tests
  ├─ Payment intent workflow
  ├─ Settlement workflow
  └─ Error recovery
```

**Total New Tests**: 155+
**Total Tests After Week 3**: 205+
**Expected Pass Rate**: 100%

---

## 📊 SUCCESS CRITERIA

### Code Quality

- [ ] 0 TypeScript errors (strict mode)
- [ ] 0 ESLint issues
- [ ] All new tests passing (155+)
- [ ] Code coverage >40% for all new code
- [ ] No performance regressions

### Functionality

- [ ] Real finance calculations working
- [ ] Amadeus flight search functional
- [ ] Stripe payment processing working
- [ ] Email notifications sending
- [ ] All endpoints documented in Swagger

### Documentation

- [ ] All new code documented
- [ ] Swagger specs complete
- [ ] Setup guides for each integration
- [ ] Email templates documented
- [ ] API examples provided

### Git & Release

- [ ] Clean commit history
- [ ] Meaningful commit messages
- [ ] Release notes prepared
- [ ] No breaking changes

---

## 🚀 GETTING STARTED (RIGHT NOW)

### Step 1: Verify Setup

```bash
cd /Users/sergirecio/Documents/On\ Tour\ App\ 2.0/on-tour-app
cd backend

# Check tests pass
npm test

# Check build works
npm run build

# Check server starts
npm run dev
```

### Step 2: Start Implementation

**Recommendation**: Start with Finance Service (Foundation)

```bash
# 1. Create FinanceService
touch src/services/FinanceService.ts

# 2. Create Finance schemas
touch src/schemas/finance.schemas.ts

# 3. Create Finance tests
touch tests/unit/FinanceService.test.ts

# 4. Implement incrementally (TDD):
#    - Write test
#    - Implement feature
#    - Verify test passes
#    - Commit
```

### Step 3: Each Feature - Use This Template

1. **Create tests** (define expected behavior)
2. **Implement service** (business logic)
3. **Create controller/routes** (HTTP endpoints)
4. **Update Swagger** (documentation)
5. **Test with Postman/curl** (manual verification)
6. **Commit to git** (version control)

### Step 4: Manage Priorities

If running short on time:

- **Must Have**: Finance Service + Finance Routes
- **Should Have**: Amadeus Flight Search + Stripe
- **Nice to Have**: Email System + Enhanced Seeding

---

## 📈 EXPECTED OUTCOMES

### Code Delivery

- **New Files**: 15-20
- **Modified Files**: 5-10
- **Lines Added**: 2,500-3,500
- **Lines in Tests**: 1,500-2,000
- **Documentation**: 800-1,200 lines

### Quality Metrics

```
TypeScript Build: 0 errors
ESLint: 0 issues
Tests: 205+ cases
Pass Rate: 100%
Code Coverage: 40%+
Build Time: <30s
```

### Git Commits

- **Expected Commits**: 8-12
- **Pattern**: Feature-based (Finance, Amadeus, Stripe, Email)
- **Message Format**: "feat(service): Add [description]"

### Project Progress

```
Before Week 3:  55% complete (FASE 5 + Week 1-2)
After Week 3:   65% complete (FASE 5 + Week 1-3)
Remaining:      FASE 6 Week 4 + FASE 7-8 (35%)
```

---

## 📞 TROUBLESHOOTING

### Common Issues

**Issue**: Tests failing after adding dependencies
**Solution**:

```bash
npm install
npm run build
npm test
```

**Issue**: API not responding
**Solution**:

```bash
# Check server is running
npm run dev

# Check port 3000 is free
lsof -i :3000
```

**Issue**: Database connection error
**Solution**:

```bash
# Reset database
npm run db:reset
npm run seed
```

**Issue**: Swagger not showing new endpoints
**Solution**:

```bash
# Clear browser cache
# Restart server
npm run dev
# Visit http://localhost:3000/api-docs
```

---

## 🎯 NEXT ACTIONS

### Immediate (Now)

1. ✅ Read this document completely
2. ✅ Verify backend environment working
3. ✅ Review existing code structure
4. ✅ Plan first feature (FinanceService)

### Today (Session Start)

1. Create FinanceService.ts
2. Create finance.schemas.ts
3. Write initial tests
4. Implement first calculation method
5. Make first commit

### This Week

1. Complete Finance Service (8-10h)
2. Complete Amadeus Integration (6-8h)
3. Complete Stripe Integration (4-6h)
4. Complete Email System (2-4h)
5. Testing & documentation (4-6h)

---

## 📚 REFERENCE DOCUMENTS

- **Backend Setup**: `backend/README.md`
- **Testing Guide**: `backend/TESTING_GUIDE.md` (will create)
- **API Specifications**: `http://localhost:3000/api-docs`
- **Previous Work**: `FASE_6_WEEK_2_COMPLETE.md`
- **Project Status**: `PROYECTO_ESTADO_ACTUAL.md`

---

## ✨ YOU ARE HERE

```
FASE 5 (Frontend):        ✅ COMPLETE
FASE 6 Week 1 (API):      ✅ COMPLETE
FASE 6 Week 2 (DB+Tests): ✅ COMPLETE
FASE 6 Week 3 (Advanced): 🟢 READY → START HERE
FASE 6 Week 4 (Real-time):⏳ NEXT
FASE 7 (Enterprise):      ⏳ LATER
```

**Status**: 🟢 **ALL SYSTEMS READY**

---

**Document Created**: November 4, 2025  
**Status**: APPROVED & READY TO START  
**Estimated Start**: November 5, 2025  
**Estimated Completion**: November 8-9, 2025

**Let's go! 🚀**
