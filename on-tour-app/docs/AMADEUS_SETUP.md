# Configuración de Amadeus API - Precios Reales de Vuelos

## ¿Por qué Amadeus?

Amadeus Self-Service API proporciona **precios EXACTOS y REALES** directamente de las aerolíneas, no estimaciones.

### Ventajas:
- ✅ **Precios 100% reales** de aerolíneas
- ✅ **Gratis**: 2000 llamadas/mes sin costo
- ✅ **Oficial**: API legítima, sin web scraping
- ✅ **Profesional**: Usada por sitios de reservas profesionales

## Registro y Configuración

### Paso 1: Registrarse en Amadeus

1. Visita [https://developers.amadeus.com/register](https://developers.amadeus.com/register)
2. Completa el formulario de registro:
   - Nombre y email
   - Tipo de cuenta: **Individual** o **Company**
   - Selecciona "Self-Service" (no "Enterprise")
3. Verifica tu email

### Paso 2: Crear una Aplicación

1. Inicia sesión en [https://developers.amadeus.com/my-apps](https://developers.amadeus.com/my-apps)
2. Click en **"Create New App"**
3. Configura tu app:
   - **App Name**: `On Tour Flight Search` (o el nombre que prefieras)
   - **API**: Selecciona **"Flight Offers Search"**
   - **Environment**: Inicia con **"Test"** (para desarrollo)
4. Click **"Create"**

### Paso 3: Obtener Credenciales

1. En tu app, ve a la pestaña **"API Keys"**
2. Copia los siguientes valores:
   - **API Key** (también llamado "Client ID")
   - **API Secret** (también llamado "Client Secret")

### Paso 4: Configurar Variables de Entorno

1. En la raíz del proyecto, copia el archivo `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Abre `.env` y añade tus credenciales:
   ```bash
   VITE_AMADEUS_API_KEY=tu_api_key_aqui
   VITE_AMADEUS_API_SECRET=tu_api_secret_aqui
   ```

3. **IMPORTANTE**: Nunca subas el archivo `.env` a Git (ya está en `.gitignore`)

### Paso 5: Reiniciar Servidor

```bash
npm run dev
```

## Verificación

1. Abre la app y ve a la sección **Travel**
2. Click en **"Buscar Vuelos"**
3. Busca un vuelo cualquiera
4. Los precios que aparezcan serán **REALES** de Amadeus
5. Verifica en la consola del navegador que no hay errores de API

## Límites y Consideraciones

### Test Environment (Desarrollo):
- **2000 llamadas/mes gratis**
- Precios reales pero pueden no estar 100% actualizados
- Perfecto para desarrollo y testing

### Production Environment (Producción):
- Cuando estés listo para producción, cambia el endpoint en el código:
- `amadeusFlightSearch.ts` línea 15:
  ```typescript
  const AMADEUS_BASE_URL = 'https://api.amadeus.com'; // Quitar 'test.'
  ```
- Límites más altos disponibles con planes de pago

## Solución de Problemas

### Error: "401 Unauthorized"
- **Causa**: API Key o Secret incorrectos
- **Solución**: Verifica que copiaste las credenciales correctas en `.env`

### Error: "Quota exceeded"
- **Causa**: Superaste las 2000 llamadas/mes
- **Solución**: Espera al siguiente mes o considera un plan de pago

### No aparecen precios
- **Causa**: Variables de entorno no configuradas
- **Solución**: Verifica que `.env` existe y tiene las variables correctas
- **Solución 2**: Reinicia el servidor de desarrollo

### Precios muy altos o incorrectos
- **Causa**: Usando Test environment con datos de prueba
- **Solución**: Cambia a Production environment una vez en producción

## Alternativa: Sin Amadeus

Si no configuras Amadeus, la app **funcionará de todas formas** pero:
- Mostrará precios **estimados** (no reales)
- Los enlaces a Google Flights y Skyscanner seguirán funcionando
- Aparecerá un mensaje indicando que son precios estimados

## Recursos Adicionales

- [Documentación Oficial de Amadeus](https://developers.amadeus.com/self-service)
- [API Reference: Flight Offers Search](https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search)
- [Preguntas Frecuentes](https://developers.amadeus.com/support/faq)
- [Ejemplos de Código](https://github.com/amadeus4dev/amadeus-code-examples)

## Contacto y Soporte

Si tienes problemas con la configuración de Amadeus:
1. Revisa la [documentación oficial](https://developers.amadeus.com/self-service)
2. Contacta al soporte de Amadeus
3. Verifica los logs en la consola del navegador
