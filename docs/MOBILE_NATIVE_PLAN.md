# Plan de Desarrollo: Aplicación Móvil Nativa On Tour App
**Versión:** 1.0  
**Fecha:** 18 de Noviembre 2025  
**Target:** iOS + Android (React Native)  
**Timeline:** 6-9 meses hasta MVP en App Store/Play Store

---

## 🎯 Objetivo Estratégico

Convertir On Tour App en una solución mobile-first para artistas, tour managers y crew que **viven en la carretera** y necesitan acceso inmediato a:
- 📅 Calendario y agenda de giras
- 💰 Finanzas y settlements en tiempo real
- 🗺️ Mapas y navegación entre venues
- 📱 Notificaciones push de cambios/actualizaciones
- ✈️ Travel docs offline (boarding passes, contracts, rider)

### Por qué mobile nativo (no solo PWA):
- ✅ **Offline-first real:** SQLite local + background sync
- ✅ **Push notifications nativas:** Cambios de horario, pagos, clima
- ✅ **Integración OS:** Calendario nativo, contactos, mapas, compartir
- ✅ **Performance:** 60fps garantizado en listas largas (tours, expenses)
- ✅ **Haptics + gestures:** UX premium (swipe to settle, pull to refresh)
- ✅ **Biometrics:** FaceID/TouchID para acceso rápido a finanzas
- ✅ **App Store presence:** Descubrimiento orgánico (SEO móvil)

---

## 📊 Análisis de Mercado Mobile (2025)

### Competidores móviles actuales:

| App | Plataformas | Rating | Precio | Puntos débiles |
|-----|------------|--------|--------|----------------|
| **Master Tour Mobile** | iOS/Android | 3.8/5 | Incluido en plan web | UI anticuada, sync lento, crashes frecuentes |
| **Your Tempo Mobile** | iOS | 4.1/5 | $9.99/mes extra | Solo iOS, no offline real, features limitadas |
| **Prism.fm Mobile** | iOS/Android | 3.5/5 | Custom | Orientado a venues, no a artistas |
| **BandPencil Mobile** | iOS | 3.9/5 | Gratis con ads | Muy básico, no finanzas avanzadas |

### Oportunidad de mercado:
- ❌ **Ninguna app tiene Timeline Maestro mobile**
- ❌ **Ninguna tiene simulador financiero WASM mobile**
- ❌ **Ninguna tiene offline-first real** (todas requieren conexión para features clave)
- ❌ **Ninguna tiene UX moderna** (todas parecen apps de 2018-2020)
- ✅ **On Tour App puede ser la primera app mobile premium** en este nicho

---

## 🛠️ Stack Tecnológico Recomendado

### Opción A: React Native (RECOMENDADO)
**Por qué:**
- ✅ Reutilizas 70% del código web (React components, contexts, stores)
- ✅ Un solo equipo (no necesitas devs iOS/Android nativos)
- ✅ Expo 50+ simplifica build/deploy/OTA updates
- ✅ React Native 0.74+ tiene New Architecture (performance nativa)
- ✅ Ecosystem maduro: React Navigation, React Query, MapLibre GL Native

**Stack específico:**
```
- React Native 0.74+ (New Architecture)
- Expo SDK 50+ (managed workflow)
- TypeScript 5.5 (compartido con web)
- React Navigation 6.x (navegación nativa)
- React Query (sync con backend, compartido con web)
- Zustand/Context API (state, compartido con web)
- WatermelonDB (SQLite offline database)
- MapLibre GL Native (mapas offline)
- Notifee (push notifications local + remote)
- Expo SecureStore (biometrics + encrypted storage)
- react-native-quick-sqlite (WASM bridge para simulador)
```

### Opción B: Flutter (ALTERNATIVA)
**Por qué:**
- ✅ Performance superior (compilado nativo)
- ✅ UI más consistente entre iOS/Android
- ❌ Reescribir todo desde cero (no reutilizas código React)
- ❌ Equipo nuevo (necesitas devs Flutter)
- ❌ Integración WASM más compleja

**Veredicto:** React Native gana por **time-to-market** y **reutilización de código**.

---

## 📱 Arquitectura Mobile-First

### Principios de diseño:
1. **Offline-first:** Todo funciona sin internet (sync en background)
2. **Touch-optimized:** Gestures naturales (swipe, long-press, pinch)
3. **One-handed use:** Acciones críticas alcanzables con pulgar
4. **Quick actions:** Widgets iOS/Android para acceso directo
5. **Minimal data usage:** Sync inteligente (solo deltas, compresión)

### Estructura de datos local:

```typescript
// WatermelonDB schema
- users (profile, prefs) → sync con Firestore
- organizations (orgs, members) → sync con Firestore
- shows (events, venues, contacts) → sync con Firestore
- expenses (transactions, receipts) → sync con Firestore
- timeline (events, tasks) → sync con Firestore
- offline_queue (pending changes) → sync cuando hay conexión
```

### Sync strategy:
```typescript
// 1. Optimistic updates (UI actualiza inmediatamente)
addExpense(expense) → 
  - Guarda en WatermelonDB local
  - Actualiza UI
  - Encola sync con backend
  - Sync en background cuando hay conexión

// 2. Conflict resolution (last-write-wins con timestamp)
if (localTimestamp > remoteTimestamp) {
  push(localChanges)
} else {
  pull(remoteChanges)
}

// 3. Background sync (iOS/Android background tasks)
- Cada 15 min si app en foreground
- Cada 1h si app en background (iOS limits)
- Inmediato cuando hay cambio local
```

---

## 🎨 UX/UI Mobile-Specific

### Pantallas principales (MVP):

#### 1. **Home/Dashboard** (Mission Control Mobile)
```
┌─────────────────────────┐
│ 🎵 On Tour • Nov 18     │
│ Sergi Recio             │ ← Profile name fix aplicado
├─────────────────────────┤
│ 📍 Next Show:           │
│ Madrid (Sala Caracol)   │
│ Tomorrow 21:00          │
│ [Get Directions] 🗺️     │
├─────────────────────────┤
│ 💰 Quick Stats:         │
│ Month P&L: +5.2K €      │
│ Pending: 3 settlements  │
│ [View Details]          │
├─────────────────────────┤
│ 📅 This Week (3 shows)  │
│ • Nov 19 - Madrid       │
│ • Nov 21 - Barcelona    │
│ • Nov 23 - Valencia     │
├─────────────────────────┤
│ [Quick Actions]         │
│ 💸 Add Expense          │
│ 📝 Add Show             │
│ 🧾 Scan Receipt         │
└─────────────────────────┘
```

#### 2. **Agenda/Calendar** (Swipeable)
```
- Vista Mes (grid compacto)
- Vista Semana (horizontal scroll)
- Vista Día (lista detallada)
- Swipe derecha: modo mapa
- Long-press: quick edit
```

#### 3. **Show Detail** (Scroll vertical)
```
┌─────────────────────────┐
│ ← Madrid                │
│ Sala Caracol            │
│ Nov 19, 2025 • 21:00    │
├─────────────────────────┤
│ 📍 Location             │
│ [Ver en Mapa] 🗺️        │
│ Calle Mayor 15, Madrid  │
│ [Get Directions]        │
├─────────────────────────┤
│ 💰 Deal                 │
│ Guarantee: 2.500 €      │
│ % Door: 70%             │
│ Merch: 100%             │
├─────────────────────────┤
│ 👥 Contacts             │
│ Promoter: Ana García    │
│ [Call] [WhatsApp]       │
├─────────────────────────┤
│ 📄 Documents            │
│ • Contract.pdf          │
│ • Rider.pdf             │
│ • Stage Plot.pdf        │
├─────────────────────────┤
│ ✅ Checklist            │
│ ☑ Soundcheck 18:00     │
│ ☐ Doors 20:30          │
│ ☐ Showtime 21:00       │
└─────────────────────────┘
```

#### 4. **Finances Mobile** (Cards deslizables)
```
┌─────────────────────────┐
│ 💰 Finance              │
│ [This Month ▼]          │
├─────────────────────────┤
│ 📊 Quick Look           │
│ Revenue: 12.5K €        │
│ Expenses: 7.3K €        │
│ Profit: +5.2K € (+71%)  │
│                         │
│ [Ver Desglose →]        │
├─────────────────────────┤
│ 💸 Recent Expenses      │
│ • Gas - 45 € (Nov 18)   │
│ • Hotel - 80 € (Nov 17) │
│ • Food - 25 € (Nov 17)  │
│                         │
│ [+ Add Expense]         │
├─────────────────────────┤
│ 🧾 Pending Settlements  │
│ • Madrid (Tomorrow)     │
│   Expected: 2.5K €      │
│   [Mark Settled]        │
└─────────────────────────┘
```

#### 5. **Timeline Maestro Mobile** (Horizontal scroll)
```
┌─────────────────────────┐
│ 📅 Timeline             │
│ [This Tour ▼]           │
├─────────────────────────┤
│ ◄──────────────────────►│
│ Nov  │ Dec  │ Jan  │ Feb│
│ ─────┼──────┼──────┼────│
│  🎵  │  ✈️  │  🎵  │ 🎵 │
│  🏨  │  🏨  │  💰  │ ✈️ │
│  💸  │  🎵  │  🎵  │ 🎵 │
│      │  🏨  │      │    │
│                         │
│ Zoom: [- Fit +]         │
│                         │
│ ▼ Today: Nov 18         │
│ • Travel to Madrid      │
│ • Soundcheck 18:00      │
│ • Show 21:00            │
└─────────────────────────┘
```

#### 6. **Add Expense (Quick)** (Bottom sheet)
```
┌─────────────────────────┐
│ 💸 Add Expense          │
├─────────────────────────┤
│ Amount: [     ] €       │
│ Category: [Meals ▼]     │
│ Date: [Today]           │
│ Note: [Optional...]     │
│                         │
│ 📸 [Scan Receipt]       │
│ OR                      │
│ 📎 [Attach Photo]       │
│                         │
│ [Cancel]  [Save]        │
└─────────────────────────┘
```

### Gestures y interacciones:

| Gesture | Acción | Contexto |
|---------|--------|----------|
| **Swipe derecha** | Ver en mapa | Agenda → Mapa |
| **Swipe izquierda** | Eliminar/Archivar | Show, Expense |
| **Long-press** | Quick edit | Show, Expense |
| **Pull-to-refresh** | Sync ahora | Cualquier lista |
| **Pinch** | Zoom timeline | Timeline view |
| **Double-tap** | Ver detalles | Show card |
| **3D Touch** | Quick actions | App icon (iOS) |

---

## 🚀 Roadmap de Desarrollo (6-9 meses)

### **Fase 1: Setup & Infraestructura** (Mes 1)
**Objetivo:** Proyecto Expo + arquitectura base + CI/CD

- [ ] Init Expo 50+ project con TypeScript
- [ ] Setup monorepo (compartir código con web via workspace)
- [ ] Configurar React Navigation 6.x
- [ ] Setup WatermelonDB + schemas
- [ ] Configurar Expo SecureStore (biometrics)
- [ ] Setup EAS Build (iOS + Android)
- [ ] CI/CD con GitHub Actions
- [ ] Setup Fastlane (deploy automático)

**Entregables:**
- App vacía que corre en iOS Simulator + Android Emulator
- Authentication flow (login/register con Firebase)
- Biometric login funcional

---

### **Fase 2: Core Features Offline-First** (Mes 2-3)
**Objetivo:** Dashboard + Agenda + Shows funcionando offline

#### Mes 2:
- [ ] Dashboard/Home con next show + quick stats
- [ ] Agenda (month/week/day views)
- [ ] Show detail screen
- [ ] WatermelonDB sync con Firestore (read-only)
- [ ] Offline mode indicator
- [ ] Pull-to-refresh en todas las listas

#### Mes 3:
- [ ] Add/Edit/Delete shows (offline-first)
- [ ] Conflict resolution (sync bidireccional)
- [ ] Background sync (iOS/Android tasks)
- [ ] Quick actions (3D Touch iOS, widgets Android)
- [ ] Share show via WhatsApp/Email

**Entregables:**
- App funcional offline con agenda completa
- Sync bidireccional con backend
- 500 shows de demo + test con 10 usuarios

---

### **Fase 3: Finanzas Mobile** (Mes 4)
**Objetivo:** Expenses + P&L + Settlements mobile

- [ ] Finance dashboard (quick look cards)
- [ ] Add expense (quick form + receipt scan)
- [ ] Expense list (swipe to delete)
- [ ] Categories + filters
- [ ] P&L básico (revenue/expenses/profit)
- [ ] Settlement flow (mark as paid)
- [ ] OCR receipt scanning (ML Kit o Tesseract)
- [ ] Currency formatting (compartido con web)

**Entregables:**
- Add expense en <10 segundos
- Receipt scan con OCR 80%+ accuracy
- P&L en tiempo real offline

---

### **Fase 4: Maps & Navigation** (Mes 5)
**Objetivo:** Mapas offline + navegación entre venues

- [ ] MapLibre GL Native integration
- [ ] Offline map tiles (OpenStreetMap)
- [ ] Show markers en mapa
- [ ] Cluster markers (muchos shows cercanos)
- [ ] Route planning (next 7 días)
- [ ] Integración con Google Maps/Apple Maps (directions)
- [ ] Distance calculator (km entre shows)
- [ ] ETA estimates (tiempo viaje)

**Entregables:**
- Mapa funcional offline con todos los shows
- "Get Directions" abre Maps nativa
- Route optimizer (siguiente show más cercano)

---

### **Fase 5: Timeline Maestro Mobile** (Mes 6)
**Objetivo:** Timeline horizontal scroll + zoom

- [ ] Timeline horizontal (día/semana/mes)
- [ ] Zoom gestures (pinch)
- [ ] Event types (shows, travel, hotels, expenses)
- [ ] Drag & drop events (reordenar)
- [ ] Timeline filters (solo shows, solo travel, etc.)
- [ ] Share timeline as image
- [ ] Print timeline (PDF export)

**Entregables:**
- Timeline Maestro mobile funcional
- Performance 60fps con 500+ eventos
- Export timeline como PDF

---

### **Fase 6: Push Notifications & Real-time** (Mes 7)
**Objetivo:** Notificaciones críticas + sync real-time

- [ ] Setup Firebase Cloud Messaging (FCM)
- [ ] Notifee integration (local + remote)
- [ ] Notification types:
  - 🎵 Show reminder (24h antes, 2h antes)
  - 💰 Payment received/pending
  - ✈️ Flight/travel reminder
  - 📝 Task/checklist reminder
  - 🔔 Team updates (show cambió, canceló)
- [ ] Notification settings (enable/disable por tipo)
- [ ] Badge count (pending actions)
- [ ] Deep links (tap notification → show detail)

**Entregables:**
- Push notifications funcionales iOS + Android
- Reminder system automático
- Deep linking completo

---

### **Fase 7: Polish & Performance** (Mes 8)
**Objetivo:** UX premium + optimizaciones + testing

- [ ] Haptics en todas las interacciones críticas
- [ ] Loading states elegantes (skeletons)
- [ ] Error handling + retry logic
- [ ] Animations (spring, fade, slide)
- [ ] Dark mode support
- [ ] Accessibility (VoiceOver, TalkBack)
- [ ] Performance profiling (Hermes optimizer)
- [ ] Bundle size optimization (<15 MB)
- [ ] E2E testing (Detox o Maestro)
- [ ] Beta testing (TestFlight + Google Play Beta)

**Entregables:**
- App con UX premium (60fps garantizado)
- Dark mode completo
- 50+ beta testers con feedback

---

### **Fase 8: App Store Launch** (Mes 9)
**Objetivo:** Submit a App Store + Play Store

- [ ] App Store assets (screenshots, videos, description)
- [ ] Play Store assets (feature graphic, promo video)
- [ ] Privacy policy mobile-specific
- [ ] Terms of service mobile
- [ ] App Review preparación (demo account)
- [ ] ASO (App Store Optimization):
  - Keywords: tour manager, gira, conciertos, finanzas
  - Localización: ES/EN/FR/DE/IT/PT
- [ ] Submit iOS (App Store Connect)
- [ ] Submit Android (Google Play Console)
- [ ] Press kit + announcement

**Entregables:**
- ✅ App live en App Store
- ✅ App live en Google Play Store
- 📣 Launch announcement (social media, email)

---

## 💰 Costos Estimados

### Desarrollo (6-9 meses):

| Concepto | Costo mensual | Total 9 meses |
|----------|--------------|---------------|
| **Developer iOS/Android** (1 FTE) | 4.000-6.000 € | 36.000-54.000 € |
| **Designer mobile** (0.5 FTE) | 2.000-3.000 € | 18.000-27.000 € |
| **QA/Testing** (0.25 FTE) | 1.000-1.500 € | 9.000-13.500 € |
| **Total equipo** | **7.000-10.500 €** | **63.000-94.500 €** |

### Infraestructura y servicios:

| Servicio | Costo mensual | Costo anual |
|----------|--------------|-------------|
| **Apple Developer Program** | — | 99 USD/año |
| **Google Play Console** | — | 25 USD (one-time) |
| **Expo EAS Build** (Pro plan) | 99 USD/mes | 1.188 USD/año |
| **Firebase (Blaze plan)** | 50-200 USD/mes | 600-2.400 USD/año |
| **MapLibre tiles hosting** | 20-50 USD/mes | 240-600 USD/año |
| **Sentry (error tracking)** | 26 USD/mes | 312 USD/año |
| **TestFlight + Play Beta** | Gratis | 0 € |
| **Total infraestructura** | **200-400 USD/mes** | **2.400-4.800 USD/año** |

### Total inversión inicial:
- **Desarrollo 9 meses:** 63.000-95.000 €
- **Infraestructura año 1:** 2.500-5.000 €
- **TOTAL:** **65.000-100.000 €**

### Alternativa low-cost (1 developer part-time):
- **Developer 50% FTE:** 2.000-3.000 €/mes × 12 meses = 24.000-36.000 €
- **Timeline:** 12-15 meses (más largo pero viable)

---

## 📈 Estrategia de Monetización Mobile

### Opción A: Incluido en planes web (RECOMENDADO)
- ✅ **Free plan:** App con límites (20 shows, 1 tour)
- ✅ **Indie/Pro/Agency:** App completa incluida
- ✅ **No cobrar extra por mobile** (aumenta valor percibido)
- ✅ **Unlock premium features** vía subscription web

**Ventaja:** Incentiva upgrades de Free → Indie/Pro

### Opción B: App premium separada
- ❌ **App gratis + IAP** (In-App Purchase)
- ❌ **4,99-9,99 €/mes solo mobile**
- ❌ Complica pricing, confunde usuarios

**Veredicto:** Opción A (incluida en web) es mejor estrategia.

---

## 🎯 KPIs Mobile (Año 1 post-launch)

| KPI | Target Mes 1 | Target Mes 6 | Target Mes 12 |
|-----|--------------|--------------|---------------|
| **Downloads** | 500 | 2.000 | 5.000 |
| **MAU (Monthly Active Users)** | 200 | 1.000 | 3.000 |
| **DAU (Daily Active Users)** | 50 | 300 | 1.000 |
| **Retention D7** | 30% | 40% | 50% |
| **Retention D30** | 15% | 25% | 35% |
| **Rating App Store** | 4.0/5 | 4.3/5 | 4.5/5 |
| **Rating Play Store** | 4.0/5 | 4.3/5 | 4.5/5 |
| **Crash-free rate** | 99% | 99.5% | 99.9% |
| **Conversión Free → Paid** | 5% | 10% | 15% |

---

## 🔥 Features Killer que nos Diferencian

### 1. **Timeline Maestro Mobile** (único en el mercado)
- Ninguna app de touring tiene timeline horizontal con zoom
- Gesture-based (pinch, swipe)
- Offline-first completo

### 2. **Simulador What-If Mobile** (WASM en mobile)
- Primer simulador financiero mobile en tiempo real
- "¿Y si negocio 80% door en vez de 70%?"
- Cálculo instantáneo offline

### 3. **Receipt OCR + Auto-categorization**
- Escanea ticket → extrae monto + categoría automáticamente
- ML on-device (no envía data a servidor)
- Add expense en <5 segundos

### 4. **Offline-first real** (no fake offline)
- WatermelonDB + background sync
- Todo funciona sin internet (shows, expenses, timeline)
- Master Tour mobile requiere conexión para features clave

### 5. **Widgets iOS/Android**
- Widget "Next Show" en home screen
- Widget "Today's Tasks"
- Widget "This Week Revenue"
- Nadie más tiene widgets en este nicho

### 6. **Quick Actions & Shortcuts**
- iOS: 3D Touch → Add Expense, Add Show, View Today
- Android: Long-press icon → Quick actions
- Siri Shortcuts (iOS): "Hey Siri, add expense 25€ food"
- Google Assistant (Android): "OK Google, next show"

---

## 🧪 Testing & Quality Assurance

### Estrategia de testing:

#### 1. **Unit tests** (Jest + React Native Testing Library)
- Components críticos (ShowCard, ExpenseForm, Timeline)
- Business logic (finance calculators, sync engine)
- Coverage target: 80%+

#### 2. **Integration tests** (Detox o Maestro)
- Flujos completos (add show → edit → delete)
- Offline → online sync
- Login → biometric → dashboard

#### 3. **E2E tests** (Maestro Cloud)
- User journeys críticos
- Regression testing automático
- Performance monitoring

#### 4. **Beta testing**
- TestFlight (iOS): 50 beta testers
- Google Play Beta (Android): 50 beta testers
- Feedback forms en app
- Crash reporting (Sentry)

---

## 🚨 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Sync conflicts complejos** | Alta | Alto | Usar last-write-wins + manual resolution UI |
| **Performance con 1000+ shows** | Media | Alto | Virtualized lists + pagination + indexes |
| **App Store rejection** | Media | Alto | Seguir guidelines + demo account + testing |
| **Battery drain (background sync)** | Media | Medio | Sync throttling + user controls |
| **Offline map tiles size** | Alta | Medio | Descarga on-demand + cache limits |
| **WASM performance mobile** | Media | Medio | Fallback JS engine + profiling |
| **Fragmentación Android** | Alta | Medio | Test en 10+ devices + Android 10+ only |

---

## 🎨 Design System Mobile

### Componentes reutilizables:

```typescript
// Shared entre web y mobile (React Native Web compatible)
- Button (primary, secondary, ghost)
- Input (text, number, date, select)
- Card (show, expense, stat)
- List (virtualized, infinite scroll)
- Modal (bottom sheet mobile)
- Toast (notificaciones in-app)
- Avatar (user, venue)
- Badge (count, status)
```

### Typography mobile:
- **Headers:** SF Pro Display (iOS), Roboto (Android)
- **Body:** SF Pro Text (iOS), Roboto (Android)
- **Monospace:** SF Mono (iOS), Roboto Mono (Android)

### Spacing mobile (8dp grid):
- xs: 4dp
- sm: 8dp
- md: 16dp
- lg: 24dp
- xl: 32dp

### Touch targets:
- Mínimo: 44×44dp (iOS), 48×48dp (Android)
- Spacing entre targets: 8dp mínimo

---

## 📱 Platform-Specific Features

### iOS exclusivo:
- ✅ 3D Touch quick actions
- ✅ Live Activities (iOS 16+) para "Show in progress"
- ✅ Dynamic Island (iOS 16+) para countdown
- ✅ Siri Shortcuts
- ✅ Handoff (continuar en iPad/Mac)
- ✅ WidgetKit (home screen + lock screen widgets)

### Android exclusivo:
- ✅ Material You (Android 12+) dynamic colors
- ✅ Widgets home screen (más flexibles que iOS)
- ✅ Share sheet customizado
- ✅ Google Assistant actions
- ✅ Adaptive icons

---

## 🌍 Internacionalización Mobile

### Idiomas MVP:
- 🇪🇸 Español (primario)
- 🇬🇧 English (secundario)

### Idiomas Fase 2:
- 🇫🇷 Français
- 🇩🇪 Deutsch
- 🇮🇹 Italiano
- 🇵🇹 Português

### Localización:
- Date/time formats (24h España, 12h USA)
- Currency symbols
- Distance units (km/miles)
- Right-to-left support (futuro: árabe)

---

## 📊 Analytics & Tracking

### Eventos críticos a trackear:

```typescript
// User journey
- app_opened
- user_logged_in (method: email|biometric)
- onboarding_completed

// Core features
- show_created (method: manual|import)
- show_viewed
- expense_added (method: manual|scan)
- expense_scanned (ocr_accuracy: number)
- timeline_viewed (zoom_level: day|week|month)
- map_opened
- settlement_marked_paid

// Engagement
- push_notification_received (type: string)
- push_notification_tapped
- widget_tapped (type: string)
- quick_action_used (action: string)

// Performance
- sync_completed (duration_ms: number, items: number)
- offline_mode_entered
- online_mode_entered
- crash_occurred

// Business
- upgrade_viewed (from_plan: string, to_plan: string)
- subscription_started (plan: string, platform: ios|android)
```

### Herramientas:
- **Firebase Analytics** (gratis, incluido)
- **Mixpanel** (alternativa, más potente)
- **Amplitude** (para product analytics avanzados)

---

## 🎯 Conclusión y Próximos Pasos

### Por qué hacerlo AHORA:
1. ✅ **Competencia débil:** Apps móviles de touring están anticuadas
2. ✅ **Demanda clara:** Tour managers viven en mobile
3. ✅ **Diferenciación:** Timeline Maestro + WASM mobile son únicos
4. ✅ **Monetización:** Aumenta valor percibido → más upgrades
5. ✅ **Defensibilidad:** App Store presence = barrera de entrada

### Timeline recomendado:
- **Inicio:** Enero 2026 (después de cerrar pricing web)
- **Beta:** Junio 2026 (6 meses dev)
- **Launch:** Septiembre 2026 (9 meses total)

### Equipo mínimo viable:
- 1 React Native developer (full-time)
- 1 Mobile designer (part-time)
- 1 QA tester (part-time)
- **Total:** ~8.000 €/mes × 9 meses = **72.000 €**

### Equipo óptimo:
- 2 React Native developers
- 1 Mobile designer
- 1 QA engineer
- **Total:** ~15.000 €/mes × 6 meses = **90.000 €**

---

## 🚀 Action Items Inmediatos

### Semana 1-2:
- [ ] Validar demanda mobile con usuarios actuales (encuesta)
- [ ] Analizar apps competidoras (downloads, reviews, features)
- [ ] Definir MVP scope final (qué features en v1.0)
- [ ] Contratar React Native developer (Upwork, Toptal, o in-house)

### Mes 1:
- [ ] Setup Expo project + monorepo
- [ ] Diseñar mockups mobile (Figma)
- [ ] Setup CI/CD (EAS Build + GitHub Actions)
- [ ] Primer build iOS + Android (vacío pero funcional)

### Mes 2-3:
- [ ] Implementar core features (agenda + shows)
- [ ] WatermelonDB + offline sync
- [ ] Beta interna (team + 10 usuarios clave)

---

**Autor:** Plan estratégico de desarrollo mobile  
**Versión:** 1.0  
**Próxima actualización:** Después de validación con usuarios y análisis competitivo profundo  
**Contacto:** Feedback bienvenido de tour managers, artistas, crew
