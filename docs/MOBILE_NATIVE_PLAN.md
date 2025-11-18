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

## 🚀 Roadmap de Desarrollo AI-Assisted (3-6 meses)

### **Fase 1: Setup & Monorepo** (Semana 1-2)
**Duración:** 10-15 horas de trabajo  
**Con quién:** Tú + Claude (setup infraestructura)

#### Tareas:
- [ ] **Init Expo 50+ con TypeScript**
  ```bash
  npx create-expo-app@latest on-tour-mobile --template tabs
  cd on-tour-mobile
  npm install typescript @types/react @types/react-native
  ```

- [ ] **Setup monorepo** (compartir código con web)
  ```
  /Users/sergirecio/Documents/On Tour App 2.0/
  ├── on-tour-app/          # Web actual
  ├── on-tour-mobile/       # Nueva app React Native
  └── shared/               # Código compartido
      ├── lib/              # i18n, utils, finance
      ├── contexts/         # Auth, Org, Settings
      ├── types/            # TypeScript types
      └── api/              # Firebase calls
  ```

- [ ] **Configurar React Navigation**
  ```bash
  npx expo install @react-navigation/native @react-navigation/bottom-tabs
  ```

- [ ] **Setup EAS Build** (builds nativas iOS/Android)
  ```bash
  npm install -g eas-cli
  eas login
  eas build:configure
  ```

- [ ] **Primer build de prueba**
  ```bash
  eas build --platform ios --profile development
  eas build --platform android --profile development
  ```

**Entregable:**
- ✅ App vacía corriendo en iPhone Simulator
- ✅ App vacía corriendo en Android Emulator
- ✅ Monorepo funcionando (código compartido web ↔ mobile)

**GitHub Copilot ayuda con:**
- Setup de tsconfig.json
- Configuración de navigation
- Boilerplate de screens

---

### **Fase 2: Shared Code Migration** (Semana 3-4)
**Duración:** 20-25 horas  
**Con quién:** Tú + Copilot (migración de código)

#### Tareas:
- [ ] **Mover código compartido a `/shared`**
  - `src/lib/i18n.ts` → `shared/lib/i18n.ts`
  - `src/context/AuthContext.tsx` → `shared/contexts/AuthContext.tsx`
  - `src/context/OrgContext.tsx` → `shared/contexts/OrgContext.tsx`
  - `src/shared/showStore.ts` → `shared/stores/showStore.ts`
  - `src/lib/finance/` → `shared/lib/finance/`

- [ ] **Adaptar componentes para React Native**
  - Replace `div` → `View`
  - Replace `span` → `Text`
  - Replace `button` → `Pressable` o `TouchableOpacity`
  - Replace Tailwind → StyleSheet.create()

- [ ] **Setup de theme compartido**
  ```typescript
  // shared/theme/tokens.ts
  export const colors = {
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937',
    // ... (reutilizar de styles/tokens.css)
  }
  ```

- [ ] **Firebase config compartido**
  ```typescript
  // shared/config/firebase.ts (mismo que web)
  import { initializeApp } from 'firebase/app'
  import { getFirestore } from 'firebase/firestore'
  ```

**Entregable:**
- ✅ 70% del código web reutilizable en mobile
- ✅ i18n funcionando en mobile
- ✅ AuthContext + OrgContext funcionando en mobile

**GitHub Copilot ayuda con:**
- Conversión automática HTML → React Native
- Sugerencias de StyleSheet basadas en Tailwind classes
- Type inference automático

---

### **Fase 3: Core Screens Offline-First** (Mes 2)
**Duración:** 40-50 horas  
**Con quién:** Tú + Copilot (componentes) + Claude (arquitectura offline)

#### Tareas:
- [ ] **Setup WatermelonDB** (SQLite offline)
  ```bash
  npx expo install @nozbe/watermelondb @nozbe/sqlite
  ```

- [ ] **Definir schema**
  ```typescript
  // shared/database/schema.ts
  export const schema = {
    shows: {
      name: 'shows',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'venue', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'synced', type: 'boolean' }
      ]
    }
  }
  ```

- [ ] **Dashboard/Home screen**
  ```typescript
  // on-tour-mobile/src/screens/Dashboard.tsx
  import { useAuth } from '@shared/contexts/AuthContext'
  import { useShows } from '@shared/hooks/useShows'
  
  export default function Dashboard() {
    const { profile } = useAuth()
    const { nextShow } = useShows()
    
    return (
      <View>
        <Text>Hola {profile?.name}</Text>
        <NextShowCard show={nextShow} />
      </View>
    )
  }
  ```

- [ ] **Agenda screen** (CalendarList)
  ```bash
  npx expo install react-native-calendars
  ```

- [ ] **Show detail screen**
  - Map preview (MapLibre GL)
  - Deal info
  - Contacts
  - Documents

- [ ] **Offline sync engine**
  ```typescript
  // shared/services/sync.ts
  export class SyncEngine {
    async syncShows() {
      const localShows = await db.shows.query().fetch()
      const remoteShows = await firestore.collection('shows').get()
      
      // Merge strategy: last-write-wins
      // ...
    }
  }
  ```

**Entregable:**
- ✅ Dashboard funcional con next show
- ✅ Agenda (mes/semana/día)
- ✅ Show detail completo
- ✅ Todo funciona offline (SQLite local)
- ✅ Sync bidireccional con Firestore

**GitHub Copilot ayuda con:**
- Generar screens completas basándose en web version
- Autocompletar queries WatermelonDB
- Sugerir sync logic patterns

---

### **Fase 4: Finanzas Mobile** (Mes 3)
**Duración:** 30-40 horas  
**Con quién:** Tú + Copilot (UI) + Claude (finance engine optimization)

#### Tareas:
- [ ] **Finance dashboard mobile**
  - Quick Look cards (swipeable)
  - P&L básico
  - Recent expenses

- [ ] **Add expense screen** (Bottom Sheet)
  ```bash
  npx expo install @gorhom/bottom-sheet
  ```

- [ ] **Receipt scan** (ML Kit OCR)
  ```bash
  npx expo install expo-camera expo-image-picker
  npm install tesseract.js  # OCR on-device
  ```

- [ ] **Expense list** (swipe to delete)
  ```bash
  npx expo install react-native-gesture-handler
  ```

- [ ] **Reutilizar finance engine WASM**
  ```typescript
  // Ya tienes wasm-financial-engine/
  // Solo adaptar para mobile:
  import { calculateWhatIf } from '@shared/lib/finance/wasm'
  ```

**Entregable:**
- ✅ Add expense en <10 segundos
- ✅ Receipt OCR (80%+ accuracy)
- ✅ Finance dashboard completo
- ✅ Simulador what-if mobile (WASM)

**GitHub Copilot ayuda con:**
- Bottom sheet components
- Camera + OCR integration
- Gesture handlers

---

### **Fase 5: Maps & Timeline** (Mes 4)
**Duración:** 25-35 horas  
**Con quién:** Tú + Copilot (maps) + Claude (timeline optimization)

#### Tareas:
- [ ] **MapLibre GL Native**
  ```bash
  npx expo install @maplibre/maplibre-react-native
  ```

- [ ] **Show markers en mapa**
  ```typescript
  <MapView>
    {shows.map(show => (
      <Marker
        key={show.id}
        coordinate={show.coordinates}
        title={show.title}
      />
    ))}
  </MapView>
  ```

- [ ] **Timeline horizontal scroll**
  ```bash
  npx expo install react-native-reanimated
  ```

- [ ] **Timeline con gestures** (pinch to zoom)
  ```typescript
  import { GestureDetector, Gesture } from 'react-native-gesture-handler'
  
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = e.scale
    })
  ```

**Entregable:**
- ✅ Mapa funcional offline
- ✅ Timeline Maestro mobile (horizontal scroll + zoom)
- ✅ Performance 60fps con 500+ eventos

**GitHub Copilot ayuda con:**
- MapLibre configuration
- Gesture handlers
- Reanimated animations

---

### **Fase 6: Push Notifications & Polish** (Mes 5)
**Duración:** 20-30 horas  
**Con quién:** Tú + Copilot (notifications) + Claude (debugging)

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
   Tú: "Hoy quiero implementar el receipt scanner con OCR"
   Claude: "Ok, te recomiendo usar expo-camera + tesseract.js.
            Primero setup permissions, luego camera UI, luego OCR..."
   ```

2. **Coding con GitHub Copilot** (2-3 horas)
   ```typescript
   // Tú escribes:
   // function to scan receipt and extract amount
   
   // Copilot sugiere:
   async function scanReceipt(imageUri: string) {
     const { data: { text } } = await Tesseract.recognize(imageUri)
     const amount = extractAmount(text)
     const category = inferCategory(text)
     return { amount, category }
   }
   ```

3. **Review con Claude** (15-30 min)
   ```
   Tú: "Implementé el scanner, revisa el código"
   Claude: "Bien! Pero añade error handling y loading state.
            También comprime la imagen antes del OCR (performance)"
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

#### Semana 3: WatermelonDB + Offline
```bash
npx expo install @nozbe/watermelondb @nozbe/sqlite
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
// function to add expense with receipt scan

// Copilot autocompleta:
async function addExpenseWithScan() {
  const { status } = await Camera.requestCameraPermissionsAsync()
  if (status !== 'granted') return
  
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8
  })
  
  if (!result.canceled) {
    const text = await scanReceipt(result.assets[0].uri)
    const expense = parseExpense(text)
    await saveExpense(expense)
  }
}

// ↑ Todo generado por Copilot en segundos
```

---

## 📱 Primer Build (Semana 1)

### iOS Simulator:
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
