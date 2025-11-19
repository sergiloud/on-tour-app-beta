# Plan de Desarrollo: Aplicación Móvil Nativa On Tour App
**Versión:** 2.0 - AI-Powered Development  
**Fecha:** 18 de Noviembre 2025  
**Target:** iOS + Android (React Native)  
**Timeline:** 3-6 meses (desarrollo con GitHub Copilot + Claude)  
**Equipo:** Tú + GitHub Copilot + Claude (AI pair programming)

---

## 🤖 AI-Powered Development Strategy

### Por qué esto cambia todo:

**Antes (sin AI):**
- Contratar 1-2 devs React Native → 4.000-6.000 €/mes
- 6-9 meses de desarrollo
- Total: 65.000-100.000 €

**Ahora (con GitHub Copilot + Claude):**
- **Tú + GitHub Copilot** → Ya tienes licencia VS Code
- **Claude como arquitecto/reviewer** → Pair programming 24/7
- **3-6 meses** (más rápido porque reutilizas 70% del código web)
- **Costo total: ~500-1.000 €** (solo infraestructura + App Store/Play Store)

### Ventajas del desarrollo AI-assisted:

1. **GitHub Copilot conoce tu codebase:**
   - Ya conoce tu arquitectura React + TypeScript
   - Sugiere código consistente con tu style
   - Autocompleta componentes basándose en tus patterns

2. **Claude (yo) como arquitecto senior:**
   - Diseño de arquitectura
   - Code reviews
   - Debugging complejo
   - Optimizaciones de performance
   - Setup de infraestructura

3. **Reutilización masiva de código:**
   - 70% del código React se reutiliza (components, contexts, utils)
   - Ya tienes i18n completo
   - Ya tienes finance engine
   - Ya tienes showStore
   - Solo adaptar UI a mobile + añadir offline

4. **Iteración ultra-rápida:**
   - Copilot escribe boilerplate → tú revisas
   - Claude resuelve problemas complejos
   - Testing automático con Copilot
   - Deployment automático (EAS)

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
- Expo SQLite + @opengineering/op-sqlite (offline-first simple)
- Firestore Replicator (sync incremental DIY)
- MapLibre GL Native (mapas offline)
- Notifee (push notifications local + remote)
- Expo SecureStore (biometrics + encrypted storage)
- Simulador financiero JS (fallback default) + WASM opcional en devices potentes
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

### MVP Scope Ajustado (feedback Nov 2025):
- ✅ **SQLite simple vs WatermelonDB:** Expo SQLite + op-sqlite + replicator Firestore DIY (sin migrations locas)
- ✅ **Timeline v1 vertical:** Lista bonita con filtros fecha/mes. Timeline horizontal + pinch → **v2 post-launch**
- ✅ **Expenses sin OCR:** Foto + input manual. OCR/Gemini Nano cuando el mercado lo pida
- ✅ **Sin widgets/Live Activities** en v1: priorizar core offline + push + dashboard
- ✅ **Simulador JS fallback:** JS puro por defecto, WASM solo si el device es potente (feature flag v1.5)

#### MVP v1.0 (lo único que entra antes de junio 2026)

| Feature                  | Incluido v1? | Versión futura |
|--------------------------|--------------|----------------|
| Login + Biometrics       | ✅           | -              |
| Dashboard + Next Show    | ✅           | -              |
| Agenda (mes/semana/día)  | ✅           | -              |
| Show Detail + Mapa       | ✅           | -              |
| Expenses + foto          | ✅           | -              |
| Timeline vertical simple | ✅           | -              |
| Finanzas básicas P&L     | ✅           | -              |
| Offline + sync           | ✅           | -              |
| Push notifications       | ✅           | -              |
| Timeline horizontal pinch| ❌           | v2             |
| Simulador WASM           | ❌ (solo JS) | v1.5           |
| OCR receipts             | ❌           | v2             |
| Widgets / Live Activities| ❌          | v2+            |
| Multi-org RBAC           | ❌           | v2             |

### Estructura de datos local:

```typescript
// Expo SQLite + op-sqlite schema (simple)
- users (profile, prefs)
- organizations (orgs, members)
- shows (events, venues, contacts)
- expenses (transactions, receipts)
- timeline_entries (events, tasks)
- sync_queue (pending operations)
```

### Sync strategy:
```typescript
// 1. Optimistic updates (UI actualiza inmediatamente)
addExpense(expense) → 
  - Guarda en SQLite local
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
│ 📎 Attach Receipt Photo │
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

#### 5. **Timeline Maestro Mobile** (Lista vertical)
```
┌─────────────────────────┐
│ 📅 Timeline             │
│ [All shows ▼] [Filters] │
├─────────────────────────┤
│ Nov 18 • Madrid         │
│ • 08:00 Travel to MAD   │
│ • 18:00 Soundcheck      │
│ • 21:00 Show            │
├─────────────────────────┤
│ Nov 19 • Valencia       │
│ • 09:00 Travel          │
│ • 12:00 Meet promoter   │
│ • 19:30 Doors open      │
├─────────────────────────┤
│ Nov 20 • Day Off        │
│ • Rest + review finances│
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
│ 📸 [Take Photo]         │
│ OR                      │
│ 📎 [Attach from Library]│
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
| **Double-tap** | Ver detalles | Show card |
| **3D Touch** | Quick actions | App icon (iOS) |

---

## 🚀 Roadmap de Desarrollo AI-Assisted (12 semanas)

| Semana | Objetivo | Resultado |
|--------|-----------|-----------|
| 1 | Setup Expo + monorepo + shared code + login + dashboard vacío | App corriendo en iPhone real |
| 2-3 | Agenda + shows list/detail + Quick Add Show (NLP) | Core touring funciona |
| 4-5 | Expenses + SQLite offline + sync simple con Firestore | Offline-first real |
| 6-7 | Timeline simple (lista vertical) + Finanzas básicas | Valor percibido brutal |
| 8 | Push notifications + biometrics + bottom navigation | Experiencia nativa |
| 9-10 | Polish UI (haptics, animations, dark mode) + i18n ES/EN | Lista para beta |
| 11-12 | Beta interna (10-20 testers) + bugfixing | TestFlight beta |

### Semana 1 — Setup & Monorepo
- Expo SDK 50 + TypeScript + React Navigation
- Carpeta `shared/` para lib/context/api/types
- Login + dashboard vacío (textos reales vía i18n)
- Primer build en iPhone real via `eas build --profile development`

### Semanas 2-3 — Agenda & Shows
- Lista vertical (FlatList) + detalle show reutilizando hooks web
- Quick Add Show con NLP (igual que web)
- Calendar mini (react-native-calendars)
- Todo online-first, sin offline aún

### Semanas 4-5 — Offline SQLite + Sync simple
- Expo SQLite + `@opengineering/op-sqlite`
- Tabla shows/expenses/timeline_entries
- Sync incremental Firestore ↔ SQLite (last-write-wins)
- Modo offline indicator + pull-to-refresh

### Semanas 6-7 — Timeline simple + Finanzas
- Timeline vertical (sección por día/semana) con filtros
- Finanzas básicas: Quick Look, lista de expenses, P&L mensual
- Simulador what-if en **JS puro** (WASM opcional v1.5)

### Semana 8 — Nativo de verdad
- Push notifications (expo-notifications + FCM)
- Biometrics (Expo Local Authentication)
- Bottom navigation + floating quick actions

### Semanas 9-10 — Polish + i18n
- Haptics, animations, dark mode, skeletons
- i18n ES/EN completo (reutilizar `shared/lib/i18n`)
- QA manual + checklist accesibilidad

### Semanas 11-12 — Beta TestFlight/Play Beta
- Maestro/Detox smoke tests
- Beta interna 10-20 testers (managers reales)
- Feedback loops diarios + bugfixes
- Submit TestFlight + Play Beta

#### Tareas:
- [ ] **Firebase Cloud Messaging**
  ```bash
  npx expo install expo-notifications
  ```

- [ ] **Local notifications**
  - Show reminder (24h antes)
  - Payment reminder
  - Task reminder

- [ ] **Haptics**
  ```bash
  npx expo install expo-haptics
  ```

- [ ] **Biometrics**
  ```bash
  npx expo install expo-local-authentication
  ```

- [ ] **Dark mode**
  ```typescript
  import { useColorScheme } from 'react-native'
  const scheme = useColorScheme()  // 'light' | 'dark'
  ```

**Entregable:**
- ✅ Push notifications funcionando
- ✅ Haptics en todas las interacciones
- ✅ Biometric login (FaceID/TouchID)
- ✅ Dark mode completo

---

### **Fase 7: Testing & App Store Prep** (Mes 6)
**Duración:** 15-20 horas  
**Con quién:** Tú + Claude (testing strategy)

#### Tareas:
- [ ] **E2E tests** (Maestro)
  ```bash
  npm install -g @maestro/cli
  ```

- [ ] **Beta testing** (TestFlight + Play Beta)
  ```bash
  eas build --platform ios --profile preview
  eas submit -p ios --latest
  ```

- [ ] **App Store assets**
  - Screenshots (generadas con Fastlane Snapshot)
  - App icon (1024×1024)
  - Description (EN/ES)

- [ ] **Submit to App Store**
  ```bash
  eas submit -p ios
  eas submit -p android
  ```

**Entregable:**
- ✅ App en TestFlight (iOS)
- ✅ App en Play Beta (Android)
- ✅ App Store assets completos
- ✅ Submitted a review

---

## 💰 Costos Reales (AI-Powered Development)

### Inversión total: ~500-1.000 € (vs 65.000-100.000 € con devs)

| Concepto | Costo | Notas |
|----------|-------|-------|
| **GitHub Copilot** | Gratis | Ya lo tienes con VS Code |
| **Claude API** | 0 € | Conversación gratuita |
| **Apple Developer** | 99 USD/año | Obligatorio para App Store |
| **Google Play Console** | 25 USD | One-time fee |
| **Expo EAS Build** | 0-99 USD/mes | Free tier ok para empezar, Pro si builds frecuentes |
| **Firebase Blaze** | 0-50 USD/mes | Solo pagas lo que usas |
| **Domain + hosting** | 0 € | Ya lo tienes |
| **TOTAL AÑO 1** | **500-1.000 €** | **99% más barato que contratar devs** |

### Tu tiempo (estimado):
- **3 meses full-time:** 480 horas (40h/semana × 12 semanas)
- **6 meses part-time:** 480 horas (20h/semana × 24 semanas)

**Valor generado:**
- App mobile valorada en 100.000 € (costo de contratar devs)
- ROI: Infinito (solo pagas 500-1.000 € infraestructura)

---

## 🤖 Workflow Diario con AI

### Sesión típica de desarrollo (2-4 horas):

1. **Planning con Claude** (15 min)
  ```
  Tú: "Hoy quiero implementar add expense con foto + input manual"
  Claude: "Perfecto, usa expo-camera para capturar la foto,
        guarda en SQLite y deja el OCR para v1.5"
  ```

2. **Coding con GitHub Copilot** (2-3 horas)
   ```typescript
   // Tú escribes:
   // function to capture a receipt photo and link it to the expense record
   
   // Copilot sugiere:
   async function captureReceiptPhoto() {
     const { status } = await ImagePicker.requestCameraPermissionsAsync()
     if (status !== 'granted') {
       throw new Error('camera permission denied')
     }

     const result = await ImagePicker.launchCameraAsync({
       quality: 0.7,
       allowsEditing: true,
       mediaTypes: ImagePicker.MediaTypeOptions.Images
     })

     if (result.canceled) {
       return null
     }

     return result.assets[0].uri
   }
   ```

3. **Review con Claude** (15-30 min)
  ```
  Tú: "Implementé add expense con foto, revisa el código"
  Claude: "Bien! Añade estados de loading y sincronización.
        Y marca el registro como pending sync hasta que suba a Firestore"
  ```

4. **Testing** (30 min)
   ```bash
   # Copilot genera tests automáticamente
   npm test
   ```

5. **Deploy preview** (5 min)
   ```bash
   eas build --platform ios --profile development
   # Test en iPhone real
   ```

---

## 🎯 Ventajas Específicas de Tu Caso

### 1. Ya tienes el 70% del código:
- ✅ **i18n completo** (6 idiomas) → reutilizar tal cual
- ✅ **Finance engine** (WASM) → adaptar a mobile
- ✅ **showStore** (state management) → funciona en React Native
- ✅ **AuthContext, OrgContext** → compatible mobile
- ✅ **Types completos** (TypeScript) → menos bugs

### 2. GitHub Copilot conoce tu codebase:
- Lee todos tus archivos
- Sugiere código consistente con tu style
- Autocompleta basándose en patterns existentes
- Genera tests similares a los que ya tienes

### 3. Iteración ultra-rápida:
- **Sin esperar devs:** Código inmediato con Copilot
- **Sin meetings:** Claude responde 24/7
- **Sin code reviews lentos:** Feedback instantáneo
- **Sin onboarding:** Copilot ya conoce el proyecto

### 4. Control total:
- Decides qué features priorizar
- Cambias roadmap cuando quieras
- No dependes de availability de terceros
- Aprendes React Native en el proceso

---

##  Backlog Post-MVP (Q3/Q4 2026)

| Feature | Cuándo | Notas |
|---------|--------|-------|
| Timeline horizontal + pinch-zoom | v2 (post-revenue) | Cuando haya tiempo para Reanimated gestures |
| Receipt OCR / AI Categorization | v2 | Integrar Gemini Nano / Apple Intelligence |
| Widgets, Live Activities, Dynamic Island | v1.5-v2 | Solo tras consolidar core | 
| WASM financial engine | v1.5 | Habilitar en devices potentes vía feature flag |
| Route optimizer + ETA avanzado | v2 | Necesita más datos + server support |

Estas iniciativas se quedan fuera del MVP pero ya están documentadas para ejecutarlas una vez la app esté en producción y generando MRR.

---

## 💰 Costos Estimados (AI-Powered)

### Costos reales 2025 (solo tú + AI):

| Concepto | Costo | Notas |
|----------|-------|-------|
| Apple Developer Program | 99 €/año | Necesario para App Store |
| Google Play Console | 25 € one-time | Pago único |
| Expo EAS Build | 0-99 €/mes | Free tier suficiente hasta tener builds diarios |
| Firebase Blaze | 0-30 €/mes | Depende de uso (pay as you go) |
| Sentry / LogRocket | 0-20 €/mes | Opcional |
| Cafés/energía | 50 €/mes | 😊 |

**Total anual estimado:** **500-1.000 €**

### Tiempo (tu inversión):
- 12 semanas (20-30 h/semana) → 240-360 horas
- ROI: App valor mercado 60-100K € + nuevo canal de revenue

### Comparativa:
- **Plan viejo:** 65-100K € + 9 meses + 3 personas
- **Plan AI:** 500 € + 3 meses + tú solo

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

### MVP (v1.0 Jun 2026)
1. **Timeline Maestro Mobile (lista vertical)**
  - Agrupa por día/semana, filtros por status
  - Scroll infinito + sticky headers
  - Preparado para upgrade horizontal en v2

2. **Simulador What-If Mobile (JS fallback)**
  - Usa el motor JS que ya existe en web
  - Corre offline sin WASM (más compatible)
  - Flag para activar WASM en iPad Pro / Pixel Fold

3. **Offline-first real con SQLite**
  - Expo SQLite + op-sqlite + sync incremental
  - Todo funciona sin conexión (shows, expenses, timeline)
  - Sync visual (estado por registro) para confianza

4. **Push + biometrics + quick actions**
  - Push reminders (shows, settlements, tasks)
  - FaceID/TouchID para abrir app en 1s
  - Floating quick action: Add Expense / Add Show

### Post-MVP (v1.5+)
5. **Timeline horizontal con pinch/zoom** (Reanimated v3)
6. **Receipt OCR + AI categorization** (Gemini Nano / Apple Intelligence)
7. **Widgets / Live Activities / Dynamic Island**
8. **Simulador WASM + GPU** para managers enterprise

---

## 🧪 Testing Strategy (AI-Assisted)

### GitHub Copilot genera tests automáticamente:

```typescript
// Tú escribes el componente:
export function ShowCard({ show }: { show: Show }) {
  return (
    <View>
      <Text>{show.title}</Text>
    </View>
  )
}

// Copilot sugiere el test (solo agregas comentario):
// test ShowCard component

describe('ShowCard', () => {
  it('renders show title', () => {
    const show = { id: '1', title: 'Madrid Show' }
    const { getByText } = render(<ShowCard show={show} />)
    expect(getByText('Madrid Show')).toBeTruthy()
  })
})
```

### Testing con AI:
1. **Unit tests:** Copilot genera basándose en componente
2. **E2E tests:** Maestro CLI (visual testing)
3. **Beta testing:** TestFlight + Play Beta (50 usuarios)

> **Micro-ajuste clave:** reutiliza el setup de Vitest que ya tienes en web (87 % coverage) dentro del monorepo. Configura `pnpm` workspaces (o Turbo/Nx) para que `packages/shared` exporte hooks/contexts y un único `vitest.config.shared.ts`. Luego referencia ese config desde `apps/web` y `apps/mobile` para ejecutar la misma batería de tests en ambos targets (`pnpm test --filter shared`, `pnpm test --filter mobile`). Así evitas duplicar specs y garantizas que cualquier fix en lógica compartida se valida automáticamente en los dos entornos.

---

## 🚨 Riesgos y Mitigaciones (AI-Powered)

| Riesgo | Probabilidad | Mitigación con AI |
|--------|--------------|-------------------|
| **Sync conflicts complejos** | Media | Claude diseña estrategia, Copilot implementa |
| **Performance con 1000+ shows** | Baja | Copilot sugiere virtualization patterns |
| **App Store rejection** | Baja | Seguir guidelines (Claude te avisa) |
| **Curva aprendizaje React Native** | Media | Copilot enseña mientras codeas |
| **Bugs complejos** | Media | Claude debuggea, Copilot sugiere fixes |

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

- show_created (method: manual|import)
- show_viewed
- expense_added (method: manual|photo)
- timeline_viewed (view: vertical)
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

## 🎯 Por Qué Hacerlo AHORA con AI

### Razones estratégicas:
1. ✅ **Competencia débil:** Apps móviles de touring están anticuadas
2. ✅ **Demanda clara:** Tour managers viven en mobile
3. ✅ **Diferenciación:** Timeline Maestro + WASM mobile son únicos
4. ✅ **AI development ready:** GitHub Copilot + Claude en su mejor momento (2025)
5. ✅ **70% código reutilizable:** Ya tienes la base web completa

### Timeline AI-powered:
- **Inicio:** Diciembre 2025 (¡AHORA!)
- **Beta:** Marzo 2026 (3 meses dev part-time)
- **Launch:** Junio 2026 (6 meses total con pulido)

### Equipo AI-powered:
- **Solo tú** + GitHub Copilot + Claude
- **Inversión:** 500-1.000 € (infraestructura)
- **Timeline:** 3-6 meses (flexible, a tu ritmo)
- **Aprendizaje:** React Native skill valioso

---

## 🚀 Action Items Inmediatos (AI-Powered Development)

### **Esta semana (Setup inicial):**

#### Día 1-2: Proyecto Expo + Monorepo
```bash
# 1. Crear proyecto Expo
cd /Users/sergirecio/Documents/On\ Tour\ App\ 2.0
npx create-expo-app@latest on-tour-mobile --template tabs

# 2. Instalar deps TypeScript + Navigation
cd on-tour-mobile
npm install typescript @types/react @types/react-native
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# 3. Setup EAS Build
npm install -g eas-cli
eas login
eas build:configure

# 4. Crear carpeta shared (código compartido)
mkdir -p ../shared/{lib,contexts,types,api,hooks}
```

#### Día 3-4: Migrar código compartido
```bash
# Mover i18n (ya tienes 6 idiomas completos)
cp ../on-tour-app/src/lib/i18n.ts ../shared/lib/

# Mover contexts
cp ../on-tour-app/src/context/AuthContext.tsx ../shared/contexts/
cp ../on-tour-app/src/context/OrgContext.tsx ../shared/contexts/
cp ../on-tour-app/src/context/SettingsContext.tsx ../shared/contexts/

# Mover showStore
cp ../on-tour-app/src/shared/showStore.ts ../shared/stores/

# Mover types
cp ../on-tour-app/src/types/*.ts ../shared/types/

# GitHub Copilot te ayuda con tsconfig paths:
# "@shared/*": ["../shared/*"]
```

#### Día 5-7: Primera pantalla funcional
```typescript
// on-tour-mobile/src/screens/Dashboard.tsx
import { View, Text, StyleSheet } from 'react-native'
import { useAuth } from '@shared/contexts/AuthContext'
import { t } from '@shared/lib/i18n'

export default function Dashboard() {
  const { profile } = useAuth()
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('dashboard.welcome')}, {profile?.name}! 🎵
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  }
})

// ↑ GitHub Copilot autocompleta todo esto basándose en tu web
```

**Test en simulador:**
```bash
npm start
# Presiona 'i' para iOS Simulator
# Presiona 'a' para Android Emulator
```

---

### **Próximas 2 semanas (Core features):**

#### Semana 2: Dashboard + Agenda básica
```bash
# Install calendar library
npx expo install react-native-calendars

# GitHub Copilot sugiere componentes basándose en:
# - Tu TourAgenda.tsx existente
# - Tu CalendarView.tsx existente
# Solo adapta de <div> a <View>
```

#### Semana 3: SQLite + Offline
```bash
npx expo install expo-sqlite
npm install @opengineering/op-sqlite
```

**Claude te ayuda con:**
- Schema design (shows, expenses, orgs)
- Sync strategy (Firestore ↔ SQLite)
- Conflict resolution

---

### **Mes 2-3: Features avanzadas**

Con GitHub Copilot escribes código **5-10x más rápido**:

```typescript
// Tú escribes comentario:
// function to add expense with photo + manual fields

// Copilot autocompleta:
async function addExpense() {
  const { status } = await Camera.requestCameraPermissionsAsync()
  if (status !== 'granted') return

  const photo = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    allowsEditing: true
  })

  if (photo.canceled) return

  await saveExpenseToSQLite({
    amount,
    category,
    ```
    ┌─────────────────────────┐
    │ 💸 Add Expense          │
    ├─────────────────────────┤
    │ Amount: [     ] €       │
    │ Category: [Meals ▼]     │
    │ Date: [Today]           │
    │ Note: [Optional...]     │
    │                         │
    │ 📸 [Take Photo]         │
    │ OR                      │
    │ � [Attach from Library]│
    │                         │
    │ [Cancel]  [Save]        │
    └─────────────────────────┘
    ```
```bash
# Inicia Xcode Simulator
open -a Simulator

# Corre la app
cd on-tour-mobile
npm start
# Presiona 'i'
```

### Android Emulator:
```bash
# Inicia Android Studio
# Tools → Device Manager → Play ▶️

# Corre la app
npm start
# Presiona 'a'
```

### Build nativo (iPhone real):
```bash
# Development build (instala en tu iPhone via cable)
eas build --platform ios --profile development --local

# O cloud build (más lento pero no necesitas Xcode)
eas build --platform ios --profile development
```

---

## 💪 Ventajas de Hacerlo Tú + AI

### 1. **Aprendes React Native** (skill valioso)
- Marketable skill (devs RN cobran 60-100K €/año)
- Control total sobre tu producto
- Puedes iterar infinitamente

### 2. **Código de calidad** (con AI review)
- GitHub Copilot sugiere best practices
- Claude revisa arquitectura
- TypeScript previene bugs

### 3. **Sin dependencias externas**
- No esperar a devs
- No meetings
- No comunicación async
- Iteras 10x más rápido

### 4. **Ownership completo**
- Conoces cada línea de código
- Debug más fácil
- Mantenimiento más simple

---

## 🎯 Conclusión: Plan AI-Powered vs Traditional

| Aspecto | Traditional (Contratar devs) | AI-Powered (Tú + Copilot + Claude) |
|---------|------------------------------|-------------------------------------|
| **Timeline** | 6-9 meses | 3-6 meses |
| **Costo** | 65.000-100.000 € | 500-1.000 € |
| **Equipo** | 2-3 personas externas | Solo tú |
| **Ownership** | Código de terceros | 100% tuyo |
| **Iteración** | Lenta (comunicación) | Ultra-rápida |
| **Aprendizaje** | Ninguno | React Native skill |
| **Mantenimiento** | Dependes de devs | Autónomo |

### Recomendación final:

✅ **HAZLO CON AI** — Es 2025, GitHub Copilot + Claude pueden construir apps completas.

**Siguiente paso:** 
```bash
npx create-expo-app@latest on-tour-mobile --template tabs
```

¿Empezamos? 🚀

---

**Autor:** Plan estratégico AI-powered development  
**Versión:** 2.0 (AI-assisted development)  
**Timeline:** 3-6 meses (tú + GitHub Copilot + Claude)  
**Inversión:** 500-1.000 € (vs 65-100K € con devs tradicionales)  
**ROI:** Infinito + aprendes React Native 🎯
