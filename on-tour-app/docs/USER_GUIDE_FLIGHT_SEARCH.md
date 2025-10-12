# ✈️ Buscador de Vuelos - Guía de Usuario

## 🎯 ¿Qué puedes hacer?

La nueva funcionalidad de búsqueda de vuelos te permite:

1. **Buscar vuelos reales** con precios actualizados en tiempo real
2. **Ver todas las opciones** de vuelos para tus fechas
3. **Reservar directamente** con las aerolíneas con un solo clic
4. **Comparar precios** entre diferentes vuelos y aerolíneas
5. **Añadir vuelos comprados** a tu calendario de tour

---

## 🚀 Cómo usar el buscador

### Paso 1: Acceder al buscador

1. Ve a la sección **Travel** en el menú principal
2. Verás dos botones:
   - 🔵 **Buscar Vuelos** (azul) - Para buscar nuevos vuelos
   - 🟢 **Añadir Vuelo** (verde) - Para añadir vuelos ya comprados

### Paso 2: Buscar vuelos

1. Click en **"Buscar Vuelos"** (botón azul)
2. Se abrirá el modal de búsqueda con todas las opciones

### Paso 3: Configurar tu búsqueda

#### Tipo de viaje
- **Ida y Vuelta**: Para viajes redondos
- **Solo Ida**: Para viajes de una dirección

#### Origen y Destino
- Escribe el nombre de la ciudad o aeropuerto
- Aparecerán sugerencias automáticas
- Puedes buscar por:
  - Nombre de ciudad: "Barcelona", "Madrid"
  - Código IATA: "BCN", "MAD"
  - Nombre de aeropuerto: "Barajas", "El Prat"

#### Fechas
- **Fecha de Salida**: Obligatoria
- **Fecha de Regreso**: Solo para ida y vuelta

#### Pasajeros
- **Adultos**: Mayores de 12 años (mínimo 1)
- **Niños**: Entre 2-11 años
- **Bebés**: Menores de 2 años (máximo = número de adultos)

#### Clase de Cabina
- **Económica**: Asientos estándar
- **Premium Economy**: Más espacio y comodidad
- **Business**: Servicio premium
- **Primera Clase**: Máximo lujo

#### Filtros adicionales
- ☑️ **Solo vuelos directos**: Sin escalas

### Paso 4: Ver resultados

Después de hacer clic en **"Buscar Vuelos"**, verás:

**Información de cada vuelo:**
- ✈️ Aerolínea y número de vuelo
- 🕐 Hora de salida y llegada
- ⏱️ Duración total del vuelo
- 🛑 Número de escalas (o "Vuelo directo")
- 💰 Precio por persona
- 🔗 Botón "Reservar" con link directo a la aerolínea

**Ejemplo de resultado:**
```
✈️ Iberia IB123
Vuelo directo

08:00 ————— ⏱️ 1h 15m ————— 09:15
BCN                           MAD

89€ por persona

[Reservar en Iberia →]
```

### Paso 5: Reservar

1. Click en el botón **"Reservar en [Aerolínea]"**
2. Se abrirá una nueva pestaña con la web de la aerolínea
3. La búsqueda estará pre-rellenada con tus datos
4. Completa la reserva directamente con la aerolínea

---

## ✅ Añadir vuelos comprados

Si ya compraste un vuelo y quieres añadirlo a tu calendario:

1. Click en **"Añadir Vuelo"** (botón verde)
2. Introduce:
   - **Referencia de reserva** o **Número de vuelo**
   - **Fecha** (opcional)
3. El vuelo se añadirá automáticamente a tu lista

---

## 💡 Consejos y trucos

### Encuentra mejores precios

1. **Flexibilidad en fechas**: 
   - Prueba diferentes días de la semana
   - Martes y miércoles suelen ser más baratos

2. **Vuelos directos vs. con escala**:
   - Desactiva "Solo vuelos directos" para ver más opciones
   - Los vuelos con escala suelen ser más económicos

3. **Clase de cabina**:
   - Premium Economy puede ser similar a Economy en precio
   - Business a veces tiene ofertas

### Buscar vuelos para tu tour

**Recomendación**: Busca vuelos entre tus shows

1. Mira tu calendario de shows
2. Identifica ciudades consecutivas
3. Busca vuelos entre ellas
4. Añade los que compres a tu calendario

---

## 🌍 Aeropuertos soportados

Puedes buscar desde/hacia **cualquier aeropuerto del mundo**.

**Algunos ejemplos populares en España:**
- 🇪🇸 Barcelona (BCN) - El Prat
- 🇪🇸 Madrid (MAD) - Barajas
- 🇪🇸 Málaga (AGP) - Costa del Sol
- 🇪🇸 Valencia (VLC) - Manises
- 🇪🇸 Sevilla (SVQ) - San Pablo
- 🇪🇸 Bilbao (BIO) - Bilbao Airport
- 🇪🇸 Alicante (ALC) - Alicante-Elche

**Europeos frecuentes:**
- 🇬🇧 Londres (LHR, LGW, STN)
- 🇫🇷 París (CDG, ORY)
- 🇩🇪 Frankfurt (FRA)
- 🇮🇹 Roma (FCO)
- 🇳🇱 Ámsterdam (AMS)

---

## ❓ Preguntas Frecuentes

### ¿Los precios son reales?

**Sí**, si tienes las API keys configuradas (ver [docs/FLIGHT_API_SETUP.md](FLIGHT_API_SETUP.md)).

Los precios mostrados son:
- ✅ En tiempo real de las aerolíneas
- ✅ Precio final con tasas incluidas
- ✅ Actualizados cada vez que buscas

Si NO tienes API keys configuradas, verás datos de ejemplo realistas pero no actualizados.

### ¿Puedo reservar desde la app?

**No directamente**. Por seguridad y para asegurar el mejor servicio:
- La app te redirige a la web oficial de la aerolínea
- Los datos del vuelo están pre-rellenados
- Completas la reserva en la web de la aerolínea

**Ventajas:**
- ✅ Máxima seguridad (directo con la aerolínea)
- ✅ Atención al cliente directa
- ✅ Programas de fidelización
- ✅ Sin intermediarios

### ¿Por qué no aparecen resultados?

**Posibles razones:**

1. **No hay vuelos disponibles**
   - Prueba otras fechas
   - Cambia origen o destino
   - Quita el filtro "Solo vuelos directos"

2. **Aeropuertos no conectados**
   - Algunos aeropuertos pequeños tienen pocas rutas
   - Prueba aeropuertos cercanos más grandes

3. **Fechas en el pasado**
   - Solo puedes buscar vuelos futuros

4. **API no configurada**
   - Verás datos mock en lugar de vuelos reales
   - Ver [docs/FLIGHT_API_SETUP.md](FLIGHT_API_SETUP.md) para configurar

### ¿Cómo sé si estoy usando datos reales o mock?

Abre la **consola del navegador** (F12) y busca:

**Datos REALES:**
```
🔍 Searching flights: BCN → MAD
✅ Found 47 real flights
```

**Datos MOCK:**
```
❌ Error searching flights
⚠️ Using fallback mock data
```

### ¿Puedo buscar vuelos para mi equipo?

**Sí**, usa los contadores de pasajeros:
- 4 músicos → 4 adultos
- 2 músicos + 1 manager → 3 adultos
- Familia con niños → X adultos + Y niños

**Nota**: El precio mostrado es **por persona**.

### ¿Y si necesito varios vuelos?

**Opción 1: Búsquedas separadas**
- Busca y reserva cada vuelo individualmente
- Añade cada uno a tu calendario con "Añadir Vuelo"

**Opción 2: Multi-ciudad** (próximamente)
- Actualmente solo soportamos ida o ida/vuelta
- Multi-ciudad llegará en futuras versiones

### ¿Puedo ver el historial de precios?

**No actualmente**, pero está en el roadmap:
- Tracking de precios
- Alertas cuando bajan los precios
- Historial de búsquedas
- "Mejor momento para comprar"

---

## 🆘 Solución de problemas

### El modal no se abre

1. Refresca la página (F5)
2. Verifica que estás en la sección "Travel"
3. Cierra otros modales abiertos

### El autocomplete no funciona

1. Escribe al menos 2 letras
2. Espera 300ms (el autocomplete tiene debounce)
3. Verifica tu conexión a internet

### Los precios parecen incorrectos

1. Verifica que los precios son por persona (no total)
2. Revisa si has seleccionado la clase correcta
3. Los precios pueden cambiar rápidamente
4. Haz una nueva búsqueda para actualizar

### El link de reserva no funciona

1. Verifica que el popup blocker está desactivado
2. Algunos navegadores bloquean popups automáticos
3. Click derecho → "Abrir en nueva pestaña"

---

## 🎓 Casos de uso

### Caso 1: Tour europeo

**Situación**: Tienes 5 shows en 5 ciudades europeas

**Pasos:**
1. Lista tus shows en orden cronológico
2. Para cada par de ciudades consecutivas:
   - Busca vuelo de ciudad A → ciudad B
   - Fecha = día después del show en ciudad A
   - Reserva y añade a calendario
3. Busca vuelo de regreso desde última ciudad

### Caso 2: Festival internacional

**Situación**: Vas a un festival en otro país

**Pasos:**
1. Busca vuelo de ida:
   - Origen: Tu ciudad
   - Destino: Ciudad del festival
   - Fecha: 1-2 días antes del festival
2. Busca vuelo de vuelta:
   - Usa "Ida y Vuelta"
   - Fecha regreso: día después del festival
3. Compara precios de diferentes aerolíneas

### Caso 3: Shows de último momento

**Situación**: Te confirman un show con poco tiempo

**Pasos:**
1. Busca "Solo vuelos directos" activado
2. Compara precios de:
   - Diferentes horas del día
   - Día antes y día del show
3. Reserva el más conveniente
4. Añade inmediatamente a tu calendario

---

## 📱 Atajos de teclado

Cuando el modal está abierto:

- `Esc` - Cerrar modal
- `Tab` - Navegar entre campos
- `Enter` en fecha - Abrir selector de fecha
- Click fuera del modal - Cerrar

---

## 🔮 Próximas funcionalidades

Estamos trabajando en:

- ✨ **Sugerencias inteligentes**: Basadas en tus shows
- 📊 **Comparación de vuelos**: Lado a lado
- 📈 **Tracking de precios**: Alertas de bajadas
- 🗓️ **Integración con calendario**: Ver vuelos y shows juntos
- 🌍 **Multi-ciudad**: Rutas complejas
- 💾 **Guardar búsquedas**: Acceso rápido
- 🔔 **Notificaciones**: Cambios de precio
- 📱 **Vista móvil mejorada**: Optimizada para teléfono

---

## 🤝 Feedback

¿Tienes sugerencias o encontraste un problema?

- Reporta bugs en GitHub Issues
- Sugerencias de mejora son bienvenidas
- Comparte casos de uso interesantes

---

**Última actualización**: 9 Octubre 2025  
**Versión de la funcionalidad**: 1.0.0
