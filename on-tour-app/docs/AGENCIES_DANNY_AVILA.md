# Implementación de Agencias para Danny Avila

## Resumen

Se han añadido 3 agencias al usuario Danny Avila con reglas de comisión específicas y período de validez del **1 de enero al 31 de julio de 2025**.

## Agencias Implementadas

### 1. UTA (Booking Agency)
- **Territorio**: Americas (Norte y Sudamérica)
- **Comisión**: 10% del gross fee
- **Código de continentes**: NA (North America), SA (South America)
- **ID**: `booking-uta-americas`

### 2. Shushi 3000 (Booking Agency)
- **Territorio**: Worldwide
- **Comisión**:
  - **Americas**: 10% después de UTA (sobre el monto que queda después de la comisión de UTA)
  - **Resto del mundo**: 15% del gross fee
- **ID**: `booking-shushi3000`
- **Lógica especial**: 
  - En Americas: Calcula sobre `(gross fee - comisión UTA)`
  - Fuera de Americas: Calcula sobre `gross fee` completo

### 3. Creative Primates (Management Agency)
- **Territorio**: Worldwide
- **Comisión**: 15% 
  - **Americas**: 15% después de UTA (sobre el monto que queda después de la comisión de UTA)
  - **Resto del mundo**: 15% del gross fee
- **ID**: `management-creative-primates`
- **Lógica especial**:
  - En Americas: Calcula sobre `(gross fee - comisión UTA)`
  - Fuera de Americas: Calcula sobre `gross fee` completo

## Período de Validez

Las 3 agencias están activas únicamente para shows con fecha entre:
- **Inicio**: 1 de enero de 2025
- **Fin**: 31 de julio de 2025

Shows fuera de este período no aplicarán estas agencias.

## Ejemplo de Cálculo

### Show en USA (Americas) - $10,000 gross fee
1. **UTA**: 10% de $10,000 = $1,000
2. **Monto después de UTA**: $10,000 - $1,000 = $9,000
3. **Shushi 3000**: 10% de $9,000 = $900
4. **Creative Primates**: 15% de $9,000 = $1,350
5. **Total comisiones**: $1,000 + $900 + $1,350 = **$3,250**

### Show en España (Europe) - $10,000 gross fee
1. **UTA**: No aplica (solo Americas)
2. **Shushi 3000**: 15% de $10,000 = $1,500
3. **Creative Primates**: 15% de $10,000 = $1,500
4. **Total comisiones**: $1,500 + $1,500 = **$3,000**

## Implementación Técnica

### Archivos Creados/Modificados

1. **`src/lib/demoAgencies.ts`** (NUEVO)
   - Genera las 3 agencias con configuración completa
   - Funciones de carga/guardado en localStorage
   - Validación de período de fechas

2. **`src/lib/agencies.ts`**
   - Actualizada función `computeCommission()` con lógica especial para:
     - UTA (prioridad en Americas)
     - Shushi 3000 (diferentes % según región)
     - Creative Primates (después de UTA en Americas)
   - Actualizada función `agenciesForShow()` para filtrar por período de fechas
   - Nueva función interna `isWithinAgencyPeriod()`

3. **`src/pages/Login.tsx`**
   - Import de `loadDemoAgencies`
   - Llamada a `loadDemoAgencies()` en ambos flujos de login de Danny Avila:
     - Botón directo "Danny Avila"
     - Login con credenciales (usuario: `artist` o `artist@demo.com`)

### Mapeo de Países a Continentes

```typescript
const COUNTRY_TO_CONTINENT: Record<string, ContinentCode> = {
  // Americas
  US:'NA', CA:'NA', MX:'NA',
  BR:'SA', AR:'SA', CL:'SA', UY:'SA', PE:'SA', CO:'SA',
  
  // Europe
  ES:'EU', FR:'EU', DE:'EU', IT:'EU', PT:'EU', NL:'EU', BE:'EU', 
  SK:'EU', BG:'EU', GR:'EU', UK:'EU', IE:'EU', SE:'EU', NO:'EU', 
  FI:'EU', CZ:'EU', AT:'EU', PL:'EU',
  
  // Asia
  QA:'AS', SA:'AS', AE:'AS', TH:'AS', MY:'AS', JP:'AS', 
  TW:'AS', CN:'AS', KR:'AS',
  
  // Africa
  ZA:'AF', NG:'AF', MA:'AF', EG:'AF',
  
  // Oceania
  AU:'OC', NZ:'OC'
};
```

## Carga Automática

Las agencias se cargan automáticamente al:
1. Hacer login como Danny Avila (botón directo o con credenciales)
2. Se guardan en localStorage bajo la clave `settings-v1`
3. Se mezclan con agencias existentes (si las hay) evitando duplicados por ID

## Funciones Disponibles

```typescript
// Cargar agencias de demo (merge con existentes)
loadDemoAgencies();

// Limpiar todas las agencias
clearAgencies();

// Forzar reemplazo total con agencias de demo
forceReplaceDemoAgencies();

// Verificar si una fecha está en el período activo
isWithinAgencyPeriod(showDate: string): boolean;
```

## Testing

Para probar las agencias:

1. **Login**: Entrar como Danny Avila
2. **Settings**: Ir a Settings → Agency Settings
3. **Verificar**: Deberías ver las 3 agencias listadas
4. **Finance**: Ir a Finance page y verificar que las comisiones se calculan correctamente
5. **Shows por región**:
   - USA/Mexico/Canada/Brasil/Argentina → UTA + Shushi 3000 (10%) + Creative Primates (15% after UTA)
   - España/Francia/Alemania/etc → Shushi 3000 (15%) + Creative Primates (15%)

## Estado del Build

✅ **Build exitoso**: Sin errores de TypeScript
✅ **Bundles generados**: Todas las optimizaciones aplicadas
✅ **Finance bundle**: 94.67kb (17.47kb brotli) - Sin cambio significativo

## Próximos Pasos (Opcional)

1. **UI para gestión de períodos**: Añadir interfaz para editar fechas de validez
2. **Reglas complejas**: Sistema de reglas configurable para comisiones en cascada
3. **Reportes**: Vista detallada de comisiones por agencia en Finance
4. **Export**: Incluir desglose de agencias en exports de Finance
