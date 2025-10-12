# Instrucciones para Verificar las Agencias de Danny Avila

## Pasos para Verificar

### 1. Abrir la Aplicación
- La aplicación está corriendo en: **http://localhost:3003**
- Abre esta URL en tu navegador

### 2. Abrir la Consola del Navegador
- Chrome/Edge: F12 o Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
- Firefox: F12 o Cmd+Option+K (Mac) / Ctrl+Shift+K (Windows)
- Safari: Cmd+Option+C

### 3. Hacer Login como Danny Avila
Hay dos formas:

**Opción A: Botón directo "Danny Avila"**
- En la página de login, haz clic en el botón "Danny Avila"
- Observa la consola, deberías ver:
  ```
  [Login] Loading demo data for Danny Avila...
  [Login] Loading demo expenses...
  [Login] Loading demo agencies...
  [demoAgencies] Loading demo agencies...
  [demoAgencies] Generated demo agencies: {...}
  [demoAgencies] Agencies saved to localStorage
  [Login] Demo agencies loaded: { loaded: true, booking: 2, management: 1 }
  ```

**Opción B: Login con credenciales**
- Usuario: `artist` o `artist@demo.com`
- Contraseña: cualquier cosa
- Observa los mismos logs en la consola

### 4. Verificar en localStorage
Ejecuta esto en la consola del navegador:

```javascript
// Ver todos los settings
const settings = JSON.parse(localStorage.getItem('settings-v1'));
console.log('Settings completos:', settings);

// Ver solo las agencias
console.log('Booking agencies:', settings.bookingAgencies);
console.log('Management agencies:', settings.managementAgencies);

// Detalles de cada agencia
console.log('\n=== UTA ===');
console.log(settings.bookingAgencies?.find(a => a.id === 'booking-uta-americas'));

console.log('\n=== Shushi 3000 ===');
console.log(settings.bookingAgencies?.find(a => a.id === 'booking-shushi3000'));

console.log('\n=== Creative Primates ===');
console.log(settings.managementAgencies?.find(a => a.id === 'management-creative-primates'));
```

### 5. Verificar en la UI
1. Una vez logueado, ve a **Settings** (icono de engranaje en la barra lateral)
2. Busca la sección **"Agency Settings"** o **"Agencies"**
3. Deberías ver listadas 3 agencias:
   - **UTA** (Booking) - 10% - Americas (NA, SA)
   - **Shushi 3000** (Booking) - 15% - Worldwide
   - **Creative Primates** (Management) - 15% - Worldwide

### 6. Verificar Cálculos en Finance
1. Ve a **Finance** en el dashboard
2. Busca shows que estén entre enero y julio de 2025
3. Verifica que las comisiones se calculen correctamente:
   - Shows en USA/México/Brasil: UTA (10%) + Shushi 3000 (10% after UTA) + Creative Primates (15% after UTA)
   - Shows en Europa/Asia: Shushi 3000 (15%) + Creative Primates (15%)

## Troubleshooting

### Si no ves las agencias en Settings:
1. Abre la consola y ejecuta:
   ```javascript
   // Forzar recarga de agencias
   import { forceReplaceDemoAgencies } from './src/lib/demoAgencies';
   const result = forceReplaceDemoAgencies();
   console.log('Force reload result:', result);
   
   // Luego refresca la página
   location.reload();
   ```

### Si los logs no aparecen:
1. Asegúrate de que la consola esté abierta ANTES de hacer login
2. Borra el localStorage y vuelve a intentar:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

### Script de Test Manual (si nada funciona):
Copia y pega esto en la consola después de hacer login:

```javascript
// Crear agencias manualmente
const bookingAgencies = [
  {
    id: 'booking-uta-americas',
    name: 'UTA',
    type: 'booking',
    commissionPct: 10,
    territoryMode: 'continents',
    continents: ['NA', 'SA'],
    notes: '10% of gross fee on Americas shows'
  },
  {
    id: 'booking-shushi3000',
    name: 'Shushi 3000',
    type: 'booking',
    commissionPct: 15,
    territoryMode: 'worldwide',
    notes: '10% after UTA on Americas, 15% elsewhere'
  }
];

const managementAgencies = [
  {
    id: 'management-creative-primates',
    name: 'Creative Primates',
    type: 'management',
    commissionPct: 15,
    territoryMode: 'worldwide',
    notes: '15% worldwide, after UTA on Americas'
  }
];

// Guardar en localStorage
const settings = JSON.parse(localStorage.getItem('settings-v1') || '{}');
settings.bookingAgencies = bookingAgencies;
settings.managementAgencies = managementAgencies;
localStorage.setItem('settings-v1', JSON.stringify(settings));

console.log('✅ Agencias guardadas manualmente');
console.log('Refresca la página para que se carguen');
```

Luego refresca la página (F5 o Cmd+R).

## Resultado Esperado

Deberías ver:
- ✅ 2 booking agencies (UTA, Shushi 3000)
- ✅ 1 management agency (Creative Primates)
- ✅ Todas con sus configuraciones correctas
- ✅ Logs en consola confirmando la carga
- ✅ Visible en Settings → Agency Settings
- ✅ Aplicándose a shows en Finance entre Jan-Jul 2025
