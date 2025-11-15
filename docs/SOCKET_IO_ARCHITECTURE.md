# Socket.io Real-Time Architecture Plan

## 🎯 Objetivo

Implementar **WebSocket bidireccional** con Socket.io para sincronización en tiempo real entre múltiples usuarios de la misma organización, eliminando la necesidad de refrescar la página para ver cambios de otros usuarios.

---

## 📊 Arquitectura Propuesta

### Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │ ShowsPage      │  │ ContactsPage   │  │ CalendarPage │   │
│  └────────────────┘  └────────────────┘  └──────────────┘   │
│           │                  │                   │           │
│           └──────────────────┴───────────────────┘           │
│                              │                               │
│                    ┌─────────▼─────────┐                     │
│                    │ SocketContext     │                     │
│                    │ (Socket.io Client)│                     │
│                    └─────────┬─────────┘                     │
└──────────────────────────────┼───────────────────────────────┘
                               │ WSS (WebSocket Secure)
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                      Backend (Node.js)                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Socket.io Server + Express                   │  │
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐│  │
│  │  │ Auth         │  │ Room Manager  │  │ Event Broker ││  │
│  │  │ Middleware   │  │ (orgId-based) │  │              ││  │
│  │  └──────────────┘  └───────────────┘  └──────────────┘│  │
│  └────────────────────────────────────────────────────────┘  │
│                              │                               │
│                    ┌─────────▼─────────┐                     │
│                    │ Firestore         │                     │
│                    │ (Source of Truth) │                     │
│                    └───────────────────┘                     │
└───────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementación por Fases

### **Fase 1: Backend Socket.io Server (Vercel Serverless Function)**

**Archivo:** `api/socket.ts` (Vercel Serverless)

```typescript
import { Server } from 'socket.io';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel doesn't support persistent WebSocket connections
// We need to use Socket.io with polling transport or deploy to a separate server
// For now, document the architecture for a dedicated Node.js server

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(501).json({
    error: 'WebSocket not supported on Vercel serverless',
    recommendation: 'Deploy Socket.io server to Railway, Render, or Fly.io'
  });
}
```

**⚠️ Limitación de Vercel:**  
Vercel Serverless Functions **no soportan WebSocket persistentes**. Socket.io necesita un servidor Node.js dedicado.

**Opciones de Deployment:**
1. **Railway.app** (Recomendado) - Free tier, fácil deploy desde GitHub
2. **Render.com** - Free tier con auto-sleep después de inactividad
3. **Fly.io** - Free tier limitado, buen performance
4. **Heroku** - No tiene free tier desde 2022

---

### **Fase 2: Servidor Socket.io Standalone (Opción Recomendada)**

**Estructura:**
```
backend-socket/
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts          # Express + Socket.io
│   ├── middleware/
│   │   └── auth.ts        # Verificar Firebase token
│   ├── handlers/
│   │   ├── shows.ts       # Eventos de shows
│   │   ├── contacts.ts    # Eventos de contacts
│   │   ├── calendar.ts    # Eventos de calendar
│   │   └── timeline.ts    # Eventos de timeline
│   └── types/
│       └── events.ts      # TypeScript interfaces
└── .env
```

**server.ts:**
```typescript
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import admin from 'firebase-admin';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://on-tour-app-beta.vercel.app',
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!))
});

// Auth Middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication token required'));
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.data.userId = decodedToken.uid;
    socket.data.email = decodedToken.email;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    next(new Error('Invalid token'));
  }
});

// Connection Handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.data.email}`);
  
  // Join organization room
  socket.on('join:organization', (orgId: string) => {
    socket.join(`org:${orgId}`);
    console.log(`User ${socket.data.email} joined org:${orgId}`);
    
    // Notify other users
    socket.to(`org:${orgId}`).emit('user:joined', {
      userId: socket.data.userId,
      email: socket.data.email,
      timestamp: Date.now()
    });
  });

  // Leave organization room
  socket.on('leave:organization', (orgId: string) => {
    socket.leave(`org:${orgId}`);
    socket.to(`org:${orgId}`).emit('user:left', {
      userId: socket.data.userId,
      timestamp: Date.now()
    });
  });

  // Show events
  socket.on('show:created', (data) => {
    const { orgId, show } = data;
    socket.to(`org:${orgId}`).emit('show:created', {
      show,
      userId: socket.data.userId,
      timestamp: Date.now()
    });
  });

  socket.on('show:updated', (data) => {
    const { orgId, showId, changes } = data;
    socket.to(`org:${orgId}`).emit('show:updated', {
      showId,
      changes,
      userId: socket.data.userId,
      timestamp: Date.now()
    });
  });

  socket.on('show:deleted', (data) => {
    const { orgId, showId } = data;
    socket.to(`org:${orgId}`).emit('show:deleted', {
      showId,
      userId: socket.data.userId,
      timestamp: Date.now()
    });
  });

  // Contact events (similar pattern)
  // Contract events
  // Venue events
  // Calendar events

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.data.email}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
});
```

---

### **Fase 3: Frontend Socket Context**

**Archivo:** `src/context/SocketContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { auth } from '../lib/firebase';
import { getCurrentOrgId } from '../lib/tenants';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  emit: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;

    const initSocket = async () => {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socketInstance.on('connect', () => {
        console.log('[Socket] Connected');
        setConnected(true);
        
        // Join organization room
        const orgId = getCurrentOrgId();
        if (orgId) {
          socketInstance.emit('join:organization', orgId);
        }
      });

      socketInstance.on('disconnect', () => {
        console.log('[Socket] Disconnected');
        setConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
      });

      setSocket(socketInstance);
    };

    initSocket();

    return () => {
      if (socket) {
        const orgId = getCurrentOrgId();
        if (orgId) {
          socket.emit('leave:organization', orgId);
        }
        socket.disconnect();
      }
    };
  }, [userId]);

  const emit = (event: string, data: any) => {
    if (socket && connected) {
      socket.emit(event, data);
    } else {
      console.warn('[Socket] Cannot emit - socket not connected');
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, emit }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
```

---

### **Fase 4: Integración en Shows.tsx**

```typescript
import { useSocket } from '../../context/SocketContext';

const Shows: React.FC = () => {
  const { shows, add, update, remove } = useShows();
  const { socket, emit } = useSocket();
  const orgId = getCurrentOrgId();

  // Listen to real-time events
  useEffect(() => {
    if (!socket) return;

    socket.on('show:created', (data) => {
      if (data.userId !== userId) {
        // Another user created a show
        add(data.show);
        toast.show(`${data.userEmail} created a show`, { variant: 'info' });
      }
    });

    socket.on('show:updated', (data) => {
      if (data.userId !== userId) {
        update(data.showId, data.changes);
        toast.show(`Show updated by ${data.userEmail}`, { variant: 'info' });
      }
    });

    socket.on('show:deleted', (data) => {
      if (data.userId !== userId) {
        remove(data.showId);
        toast.show(`Show deleted by ${data.userEmail}`, { variant: 'warning' });
      }
    });

    return () => {
      socket.off('show:created');
      socket.off('show:updated');
      socket.off('show:deleted');
    };
  }, [socket, userId]);

  // Emit events when local changes happen
  const saveDraft = async (d: DraftShow) => {
    // ... existing code ...
    
    if (mode === 'add') {
      const newShow = { ...d, id, costs: d.costs || [] };
      add(newShow);
      
      // Emit to other users
      emit('show:created', { orgId, show: newShow });
      
      // Track activity
      if (currentUser && orgId) {
        await activityTracker.trackShow('create', newShow, currentUser, orgId);
      }
    }
  };
};
```

---

## 🔒 Seguridad

### 1. **Autenticación con Firebase Token**
- Cada socket valida el `idToken` de Firebase
- Socket.data guarda `userId` y `email`

### 2. **Multi-Tenancy con Rooms**
- Cada organización tiene un room: `org:${orgId}`
- Los usuarios solo reciben eventos de su organización
- No se pueden unir a rooms de otras organizaciones (validar en backend)

### 3. **Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests'
});

app.use('/socket.io/', limiter);
```

---

## ⚡ Performance

### 1. **Transports**
- Preferir WebSocket para menor latencia
- Fallback a polling si WebSocket no está disponible

### 2. **Reconnection**
```typescript
reconnection: true,
reconnectionDelay: 1000,
reconnectionAttempts: 5
```

### 3. **Event Throttling**
- Limitar frecuencia de eventos (e.g., drag & drop)
```typescript
import { throttle } from 'lodash';

const emitUpdate = throttle((data) => {
  emit('show:updated', data);
}, 500); // Max 1 evento cada 500ms
```

---

## 📱 Offline Support

**Fallback cuando Socket desconectado:**
```typescript
const saveDraft = async (d: DraftShow) => {
  // ... save locally ...
  
  if (socket && connected) {
    emit('show:created', { orgId, show: newShow });
  } else {
    // Queue for later sync
    offlineQueue.add('show:created', { orgId, show: newShow });
  }
};
```

---

## 🚀 Deployment Checklist

- [ ] Crear `backend-socket/` con Express + Socket.io
- [ ] Configurar Firebase Admin SDK
- [ ] Implementar autenticación con JWT
- [ ] Deploy a Railway/Render/Fly.io
- [ ] Configurar CORS con dominio de producción
- [ ] Añadir variable `VITE_SOCKET_URL` en Vercel
- [ ] Crear `SocketContext` en frontend
- [ ] Integrar en `Shows.tsx`, `Contacts.tsx`, etc.
- [ ] Testing con múltiples usuarios
- [ ] Monitoring con Socket.io Admin UI

---

## 📚 Referencias

- [Socket.io Docs](https://socket.io/docs/v4/)
- [Firebase Admin Auth](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Railway Deployment](https://railway.app/docs)
- [Socket.io with TypeScript](https://socket.io/docs/v4/typescript/)

---

## 🎯 Alternativas Simples (Sin Socket.io)

Si no quieres mantener un servidor Socket.io separado, considera:

### **Opción 1: Firestore Real-Time Listeners** (Ya implementado)
```typescript
onSnapshot(collection(db, 'shows'), (snapshot) => {
  // Updates en tiempo real sin Socket.io
});
```

✅ **Ventajas:**
- Ya funciona con Firestore
- Sin servidor adicional
- Escalable automáticamente

❌ **Desventajas:**
- Latencia ~200-500ms (vs ~50ms con Socket.io)
- Costo por read (cada update = 1 read para todos los usuarios)

### **Opción 2: Polling con React Query**
```typescript
const { data } = useQuery({
  queryKey: ['shows'],
  queryFn: fetchShows,
  refetchInterval: 5000 // Poll cada 5 segundos
});
```

---

## 🎨 UI Indicators

Mostrar estado de conexión:
```tsx
{connected ? (
  <div className="flex items-center gap-2 text-green-500">
    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
    Live
  </div>
) : (
  <div className="flex items-center gap-2 text-slate-400">
    <div className="w-2 h-2 rounded-full bg-slate-400" />
    Offline
  </div>
)}
```

---

**Conclusión:** Socket.io es ideal para colaboración en tiempo real, pero requiere infraestructura adicional. Para MVP, Firestore real-time listeners son suficientes.
