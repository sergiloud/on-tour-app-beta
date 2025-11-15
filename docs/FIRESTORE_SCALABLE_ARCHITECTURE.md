# Firestore Scalable Architecture - Reference Document

**Date:** November 14, 2025  
**Version:** 2.0.0  
**Status:** � Reference Architecture (Not Yet Implemented)

**Note:** This document describes a future scalable architecture for when the app reaches scale limits. Current implementation uses simple collections which work fine for current user base.

---

## Problem Statement

**Current Issue:**
```
users/{userId}/organizations/{orgId}/transactions (document)
  └── transactions: [ {...}, {...}, {...} ] // ARRAY ❌
```

**Problems:**
1. **1MB Document Limit** - Arrays hit Firestore's 1MB limit quickly
2. **No Pagination** - Must load ALL transactions at once
3. **No Efficient Queries** - Can't filter by date range server-side
4. **Poor Performance** - Large arrays slow down reads/writes
5. **No Scalability** - 1000+ transactions = performance issues

---

## New Architecture

### ✅ Scalable Structure

```
firestore/
├── users/
│   └── {userId}/
│       ├── profile/ (document)
│       ├── settings/ (document)
│       │
│       └── organizations/
│           └── {orgId}/
│               ├── profile/ (document)
│               │
│               ├── finance_snapshots/ (collection)
│               │   └── {snapshotId}/ (document)
│               │       ├── metadata (fields):
│               │       │   ├── asOf: Timestamp
│               │       │   ├── month: { start, end, income, expenses, net }
│               │       │   ├── year: { income, expenses, net }
│               │       │   ├── pending: number
│               │       │   ├── categories: [...]
│               │       │   ├── budgets: {...}
│               │       │   └── createdAt: Timestamp
│               │       │
│               │       └── transactions/ (sub-collection) ⭐
│               │           └── {transactionId}/ (document)
│               │               ├── amount: number
│               │               ├── type: 'income' | 'expense'
│               │               ├── category: string
│               │               ├── description: string
│               │               ├── date: Timestamp
│               │               ├── currency: 'EUR' | 'USD' | 'GBP'
│               │               ├── showId: string (optional)
│               │               ├── metadata: {...}
│               │               ├── createdAt: Timestamp
│               │               └── updatedAt: Timestamp
│               │
│               ├── shows/ (collection)
│               │   └── {showId}/ (document)
│               │       ├── name: string
│               │       ├── venue: string
│               │       ├── city: string
│               │       ├── country: string
│               │       ├── date: Timestamp
│               │       ├── fee: number
│               │       ├── currency: string
│               │       ├── status: 'confirmed' | 'tentative' | 'cancelled'
│               │       ├── lat: number
│               │       ├── lng: number
│               │       ├── route: string (optional)
│               │       ├── promoter: string (optional)
│               │       ├── createdAt: Timestamp
│               │       └── updatedAt: Timestamp
│               │
│               ├── contacts/ (collection)
│               │   └── {contactId}/ (document)
│               │       ├── name: string
│               │       ├── email: string
│               │       ├── phone: string
│               │       ├── role: string
│               │       ├── company: string
│               │       ├── createdAt: Timestamp
│               │       └── updatedAt: Timestamp
│               │
│               └── calendar_events/ (collection)
│                   └── {eventId}/ (document)
│                       ├── title: string
│                       ├── start: Timestamp
│                       ├── end: Timestamp
│                       ├── type: 'show' | 'travel' | 'meeting' | 'other'
│                       ├── showId: string (optional)
│                       ├── metadata: {...}
│                       ├── createdAt: Timestamp
│                       └── updatedAt: Timestamp
```

---

## Benefits

### 1. **Unlimited Scalability**
- No 1MB limit - each transaction is its own document
- Can store millions of transactions
- No performance degradation with data growth

### 2. **Efficient Queries**
```typescript
// Query transactions by date range
const q = query(
  collection(db, `users/${uid}/organizations/${orgId}/finance_snapshots/${snapshotId}/transactions`),
  where('date', '>=', startDate),
  where('date', '<=', endDate),
  orderBy('date', 'desc'),
  limit(50)
);

// Query by category
const q = query(
  collection(db, `...transactions`),
  where('category', '==', 'transport'),
  where('date', '>=', monthStart)
);

// Pagination
const q = query(
  collection(db, `...transactions`),
  orderBy('date', 'desc'),
  startAfter(lastDoc),
  limit(50)
);
```

### 3. **Better Performance**
- Only load transactions you need (pagination)
- Server-side filtering reduces data transfer
- Indexes optimize query performance

### 4. **Realtime Updates**
```typescript
// Listen to new transactions only
const unsubscribe = onSnapshot(
  query(
    collection(db, `...transactions`),
    where('date', '>=', today)
  ),
  (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        // New transaction added
      }
    });
  }
);
```

---

## Migration Strategy

### Phase 1: Create New Structure (✅ This PR)

1. **Update Firestore Rules** - Add paths for sub-collections
2. **Create New Hooks** - `useTransactions`, `useShows`, `useCalendarEvents`
3. **Create Migration Script** - Convert arrays to sub-collections

### Phase 2: Update UI Components

1. **Finance Components** - Use new hooks with pagination
2. **Shows Components** - Query from sub-collection
3. **Calendar Components** - Query from sub-collection

### Phase 3: Data Migration

1. **Run migration script** - Move existing data
2. **Verify data integrity** - Check all data transferred
3. **Monitor performance** - Track query times

### Phase 4: Cleanup

1. **Remove old code** - Delete array-based logic
2. **Update tests** - Test new query patterns
3. **Deploy to production**

---

## TypeScript Types

```typescript
// New types for sub-collection documents
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Timestamp;
  currency: 'EUR' | 'USD' | 'GBP' | 'AUD';
  showId?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FinanceSnapshotMetadata {
  id: string;
  asOf: Timestamp;
  month: {
    start: Timestamp;
    end: Timestamp;
    income: number;
    expenses: number;
    net: number;
  };
  year: {
    income: number;
    expenses: number;
    net: number;
  };
  pending: number;
  categories: string[];
  budgets: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Show {
  id: string;
  name: string;
  venue: string;
  city: string;
  country: string;
  date: Timestamp;
  fee: number;
  currency: string;
  status: 'confirmed' | 'tentative' | 'cancelled' | 'postponed';
  lat: number;
  lng: number;
  route?: string;
  promoter?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Timestamp;
  end: Timestamp;
  type: 'show' | 'travel' | 'meeting' | 'other';
  showId?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  company?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Query Examples

### Paginated Transactions

```typescript
export function useTransactionsPaginated(
  snapshotId: string,
  pageSize = 50
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    const { currentUser } = auth;
    const orgId = getCurrentOrgId();
    
    let q = query(
      collection(
        db,
        `users/${currentUser.uid}/organizations/${orgId}/finance_snapshots/${snapshotId}/transactions`
      ),
      orderBy('date', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      setHasMore(false);
      return;
    }

    const newTransactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];

    setTransactions(prev => [...prev, ...newTransactions]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === pageSize);
  };

  return { transactions, loadMore, hasMore };
}
```

### Date Range Query

```typescript
export function useTransactionsByDateRange(
  snapshotId: string,
  startDate: Date,
  endDate: Date
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { currentUser } = auth;
    const orgId = getCurrentOrgId();

    const q = query(
      collection(
        db,
        `users/${currentUser.uid}/organizations/${orgId}/finance_snapshots/${snapshotId}/transactions`
      ),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      setTransactions(txs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [snapshotId, startDate, endDate]);

  return { transactions, isLoading };
}
```

### Aggregate Queries

```typescript
export async function getMonthlyTotals(
  snapshotId: string,
  month: Date
) {
  const { currentUser } = auth;
  const orgId = getCurrentOrgId();
  
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  const q = query(
    collection(
      db,
      `users/${currentUser.uid}/organizations/${orgId}/finance_snapshots/${snapshotId}/transactions`
    ),
    where('date', '>=', Timestamp.fromDate(monthStart)),
    where('date', '<=', Timestamp.fromDate(monthEnd))
  );

  const snapshot = await getDocs(q);
  
  const totals = snapshot.docs.reduce(
    (acc, doc) => {
      const tx = doc.data() as Transaction;
      if (tx.type === 'income') {
        acc.income += tx.amount;
      } else {
        acc.expenses += tx.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  return {
    ...totals,
    net: totals.income - totals.expenses
  };
}
```

---

## Performance Considerations

### Indexes Required

Create composite indexes in Firestore console:

```
Collection: transactions
Indexes:
1. date (desc) + type (asc)
2. category (asc) + date (desc)
3. showId (asc) + date (desc)
4. createdAt (desc)
```

### Best Practices

1. **Always use `limit()`** - Never query without pagination
2. **Use `startAfter()` for pagination** - More efficient than offset
3. **Index frequently queried fields** - date, category, type
4. **Cache results locally** - Use TanStack Query for caching
5. **Batch writes** - Use `writeBatch()` for multiple operations

---

## Security Impact

Updated `firestore.rules`:

```
match /users/{userId}/organizations/{orgId}/finance_snapshots/{snapshotId}/transactions/{txId} {
  allow read, write: if request.auth.uid == userId;
}

match /users/{userId}/organizations/{orgId}/shows/{showId} {
  allow read, write: if request.auth.uid == userId;
}

match /users/{userId}/organizations/{orgId}/calendar_events/{eventId} {
  allow read, write: if request.auth.uid == userId;
}

match /users/{userId}/organizations/{orgId}/contacts/{contactId} {
  allow read, write: if request.auth.uid == userId;
}
```

**Key Points:**
- ✅ Users can only access their own data (`request.auth.uid == userId`)
- ✅ No cross-user data leaks
- ✅ Organization-scoped data enforced
- ✅ Sub-collections inherit parent permissions

---

## Next Steps

1. ✅ Document new architecture
2. 🚧 Update Firestore rules
3. 🚧 Create new hooks
4. 🚧 Build migration script
5. ⏳ Update UI components
6. ⏳ Run migration
7. ⏳ Deploy to production

---

## Resources

- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Pagination Best Practices](https://firebase.google.com/docs/firestore/query-data/query-cursors)
