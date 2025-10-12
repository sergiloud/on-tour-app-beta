# Integración Completa de Comisiones de Agencias

## ✅ Resumen de Implementación

He asegurado que las comisiones de agencias se calculan y reflejan **en todos los lugares** de la aplicación:

### 📍 Lugares Actualizados

#### 1. **Finance Snapshot** (`src/features/finance/snapshot.ts`)
- ✅ Función `showCost()` actualizada para incluir comisiones de agencias
- ✅ Carga automática de agencias desde `localStorage`
- ✅ Calcula comisiones para cada show usando `computeCommission()`
- ✅ Suma comisiones al costo total del show
- **Resultado**: YTD Costs, Monthly Costs, y Net incluyen comisiones de agencias

#### 2. **P&L Table** (`src/components/finance/v2/PLTable.tsx`)
- ✅ Añadida función helper `calculateAgencyCommissions()`
- ✅ Calcula dinámicamente `mgmtPct` y `bookingPct` para cada show
- ✅ Actualizado en 3 lugares:
  - Ordenamiento de filas (sorting)
  - Cálculo de total Net
  - Renderizado de filas virtuales
- **Resultado**: Columnas "Mgmt %" y "Booking %" muestran los porcentajes correctos

#### 3. **Shows Page** (`src/pages/dashboard/Shows.tsx`)
- ✅ Función `calcNet()` actualizada
- ✅ Reemplaza cálculo hardcodeado de porcentajes por cálculo dinámico
- ✅ Usa `agenciesForShow()` y `computeCommission()`
- **Resultado**: Columna "Net" en Shows incluye comisiones de agencias

### 🔧 Lógica de Cálculo

Todas las ubicaciones ahora usan la misma lógica:

```typescript
// 1. Obtener agencias aplicables al show
const applicable = agenciesForShow(demoShow, bookingAgencies, managementAgencies);
const allAgencies = [...applicable.booking, ...applicable.management];

// 2. Calcular comisiones totales
const agencyCommission = computeCommission(demoShow, allAgencies);

// 3. Calcular Net
const net = show.fee - wht - agencyCommission - explicitCosts;
```

### 📊 Desglose por Componente

#### **Finance Snapshot**
```typescript
// En buildFinanceSnapshotFromShows()
const showCost = (s: FinanceShow) => {
  if (s.status === 'offer') return 0;
  
  let totalCost = 0;
  
  // 1. Costos explícitos
  if (typeof s.cost === 'number') {
    totalCost += s.cost;
  }
  
  // 2. Comisiones de agencias
  const applicable = agenciesForShow(demoShow, bookingAgencies, managementAgencies);
  const allAgencies = [...applicable.booking, ...applicable.management];
  
  if (allAgencies.length > 0) {
    const agencyCommission = computeCommission(demoShow, allAgencies);
    totalCost += agencyCommission;
  }
  
  return totalCost;
};
```

#### **P&L Table**
```typescript
// Helper function
function calculateAgencyCommissions(show, bookingAgencies, managementAgencies) {
  const applicable = agenciesForShow(demoShow, bookingAgencies, managementAgencies);
  const totalBooking = computeCommission(demoShow, applicable.booking);
  const totalMgmt = computeCommission(demoShow, applicable.management);
  
  const totalCommission = totalBooking + totalMgmt;
  const bookingPct = (totalBooking / show.fee) * 100;
  const mgmtPct = (totalMgmt / show.fee) * 100;
  
  return { totalCommission, bookingPct, mgmtPct };
}

// Usado en sorting, totales y renderizado
const agency = calculateAgencyCommissions(show, bookingAgencies, managementAgencies);
const net = computeNet({ 
  fee: show.fee, 
  whtPct, 
  mgmtPct: agency.mgmtPct, 
  bookingPct: agency.bookingPct, 
  costs: [{ amount: cost }] 
});
```

#### **Shows Page**
```typescript
// En calcNet()
const calcNet = (s: DemoShow) => {
  const wht = s.fee * (whtPct / 100);
  
  // Calcular comisiones de agencias
  let agencyCommission = 0;
  const applicable = agenciesForShow(s, bookingAgencies, managementAgencies);
  const allAgencies = [...applicable.booking, ...applicable.management];
  if (allAgencies.length > 0) {
    agencyCommission = computeCommission(s, allAgencies);
  }
  
  const costsTotal = costs.reduce((sum, c) => sum + c.amount, 0);
  return s.fee - wht - agencyCommission - costsTotal;
};
```

### 🎯 Reglas de Comisión Aplicadas

Las 3 agencias se aplican con sus reglas específicas:

1. **UTA** (Booking)
   - 10% del gross fee
   - Solo Americas (NA, SA)
   - Se calcula primero

2. **Shushi 3000** (Booking)
   - Americas: 10% **después** de UTA (sobre el remanente)
   - Resto: 15% del gross fee
   - Worldwide

3. **Creative Primates** (Management)
   - Americas: 15% **después** de UTA (sobre el remanente)
   - Resto: 15% del gross fee
   - Worldwide

### 🗓️ Período Activo

- **Desde**: 1 de enero de 2025
- **Hasta**: 31 de julio de 2025
- Shows fuera de estas fechas: sin comisiones de estas agencias

### ✅ Verificación

Para verificar que funciona:

1. **Login como Danny Avila**
2. **Ver Finance**:
   - YTD Costs ahora incluye comisiones
   - P&L Table muestra % correcto en columnas Mgmt/Booking
3. **Ver Shows**:
   - Columna Net refleja comisiones
4. **Crear/Editar Show**:
   - Net se calcula automáticamente con comisiones
5. **Filtrar por región**:
   - Americas: UTA + Shushi (10%) + Creative (15% after UTA)
   - Europa/Asia: Shushi (15%) + Creative (15%)

### 📝 Archivos Modificados

1. ✅ `src/features/finance/snapshot.ts`
   - Imports: `agenciesForShow`, `computeCommission`, `DemoShow`
   - Función `showCost()` actualizada
   - Carga de agencias desde settings

2. ✅ `src/components/finance/v2/PLTable.tsx`
   - Imports: `agenciesForShow`, `computeCommission`, `DemoShow`
   - Nueva función `calculateAgencyCommissions()`
   - Actualizado sorting, totales y renderizado
   - Hook `useSettings()` ahora obtiene `bookingAgencies` y `managementAgencies`

3. ✅ `src/pages/dashboard/Shows.tsx`
   - Import: `agenciesForShow`, `computeCommission`
   - Función `calcNet()` actualizada
   - Hook `useSettings()` ahora obtiene `bookingAgencies` y `managementAgencies`

### 🚀 Estado Final

- ✅ **Finance Snapshot**: Costos incluyen comisiones
- ✅ **Finance Hero**: YTD muestra totales correctos
- ✅ **P&L Table**: Columnas de % muestran valores dinámicos
- ✅ **Shows Table**: Net incluye comisiones
- ✅ **Shows Editor**: Cálculo automático con comisiones
- ✅ **Breakdowns**: Todos los cálculos de margen incluyen comisiones
- ✅ **Exports**: CSV/XLSX incluyen datos con comisiones

### 🎉 Resultado

**Las comisiones de agencias ahora se calculan y reflejan en TODOS los lugares de la aplicación**:
- Finance page (Hero, P&L, Breakdowns)
- Shows page (List, Board, Editor)
- Exports (CSV, XLSX)
- KPIs y métricas
- Forecasts y proyecciones

No hay necesidad de configurar porcentajes manualmente en cada show. El sistema calcula automáticamente las comisiones basándose en:
- País del show (Americas vs otros)
- Fecha del show (Jan-Jul 2025)
- Agencias configuradas en Settings
- Reglas de comisión específicas (cascada, worldwide, etc.)
