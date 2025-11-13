# 🔒 Mejoras de Seguridad - Backend API

## Resumen de Implementaciones

Este documento detalla las mejoras de seguridad implementadas en el backend de On Tour App, siguiendo las mejores prácticas de la industria para protección contra ataques comunes.

## 🚀 Mejoras Implementadas

### 1. **Rate Limiting Avanzado** ⏱️
**Archivo**: `src/middleware/rateLimiting.ts`

- **authRateLimit**: 5 intentos por IP cada 15 minutos (endpoints de login)
- **registrationRateLimit**: 5 registros por IP cada hora
- **passwordResetRateLimit**: 3 solicitudes por IP cada hora
- **generalRateLimit**: 100 requests por IP por minuto

**Protege contra**:
- Ataques de fuerza bruta en login
- Spam de registros
- Ataques de denegación de servicio (DoS)
- Abuso de endpoints de recuperación de contraseña

### 2. **Validación Robusta de Entrada** ✅
**Archivo**: `src/middleware/validation.ts`

**Validaciones implementadas**:
- **Login**: Email válido + contraseña con requisitos mínimos
- **Registro**: Email, contraseña fuerte, nombre sanitizado
- **Recuperación de contraseña**: Email válido
- **Datos financieros**: Montos positivos, códigos de moneda válidos
- **IDs**: Validación UUID para parámetros de ruta
- **Paginación**: Límites y páginas válidos
- **Fechas**: Formato ISO 8601 y validación de rangos

**Protege contra**:
- Inyección SQL/NoSQL
- Ataques XSS (Cross-Site Scripting)
- Datos malformados
- Desbordamientos de buffer

### 3. **Manejo Centralizado de Errores** 🎯
**Archivo**: `src/middleware/errorHandler.ts`

**Características**:
- Clase `AppError` personalizada con códigos de error
- Errores predefinidos comunes (`CommonErrors`)
- Sanitización automática de mensajes en producción
- Logging completo con contexto de usuario
- Respuestas estandarizadas
- Helper `asyncErrorHandler` para rutas async

**Protege contra**:
- Exposición de información sensible
- Stack traces en producción
- Respuestas inconsistentes
- Pérdida de contexto en logs

### 4. **Generador de JWT_SECRET Seguro** 🔐
**Archivo**: `scripts/generate-jwt-secret.js`

- Genera secretos criptográficamente seguros (512 bits de entropía)
- Usa `crypto.randomBytes()` de Node.js
- Fácil integración con `.env`

## 📋 Guía de Implementación

### Paso 1: Instalación de Dependencias
```bash
npm install express-rate-limit express-validator
npm install --save-dev @types/express-rate-limit
```

### Paso 2: Generar JWT_SECRET Seguro
```bash
node scripts/generate-jwt-secret.js
# Copiar el resultado a tu archivo .env
```

### Paso 3: Integración en Rutas

```typescript
import { authRateLimit } from '../middleware/rateLimiting.js';
import { validateLogin, handleValidationErrors } from '../middleware/validation.js';
import { errorHandler } from '../middleware/errorHandler.js';

// Endpoint de login con máxima seguridad
router.post('/auth/login',
  authRateLimit,              // 1. Rate limiting
  ...validateLogin,           // 2. Validación
  handleValidationErrors,     // 3. Manejo de errores de validación
  async (req, res, next) => { // 4. Lógica de negocio
    try {
      // Tu código aquí
    } catch (error) {
      next(error); // El errorHandler se encarga del resto
    }
  }
);
```

### Paso 4: Configuración Global
```typescript
// En tu app principal (index.ts)
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Rate limiting global
app.use(generalRateLimit);

// Tus rutas aquí
app.use('/api', routes);

// Manejo de rutas no encontradas
app.use(notFoundHandler);

// Manejo de errores global (DEBE SER EL ÚLTIMO)
app.use(errorHandler);
```

## 🛡️ Capas de Protección

### Nivel 1: Entrada (Request)
1. **Rate Limiting por IP**: Primera línea de defensa
2. **Validación de entrada**: Sanitización y validación de datos
3. **Rate Limiting organizacional**: Límites por organización (existente)

### Nivel 2: Procesamiento
1. **Autenticación JWT**: Verificación de tokens
2. **Autorización por roles**: Permisos basados en contexto
3. **Validación de negocio**: Reglas específicas de la aplicación

### Nivel 3: Respuesta (Response)
1. **Sanitización de errores**: No exponer información sensible
2. **Headers de seguridad**: Helmet.js (ya implementado)
3. **Logging completo**: Auditoria de todas las acciones

## 📊 Configuraciones por Endpoint

| Endpoint | Rate Limit | Validaciones | Logging |
|----------|------------|-------------|---------|
| `POST /auth/login` | 5/15min | Email + Password fuerte | Completo |
| `POST /auth/register` | 5/1hour | Email + Password + Name | Completo |
| `POST /auth/forgot-password` | 3/1hour | Email válido | Completo |
| `GET /api/*` | 100/1min | Parámetros/Query | Básico |
| `POST /api/*` | 100/1min | Body + Headers | Completo |

## 🔧 Variables de Entorno Requeridas

```bash
# JWT Secret (usar el generado por el script)
JWT_SECRET=tu_secret_criptograficamente_seguro_aqui

# Rate Limiting (opcional)
RATE_LIMIT_WHITELIST=127.0.0.1,::1

# Entorno
NODE_ENV=production  # Para sanitización de errores
```

## 🚨 Alertas y Monitoreo

### Logs de Seguridad
- **Rate limit excedido**: IP, User-Agent, Endpoint
- **Validación fallida**: Campos, valores, IP
- **Errores de autenticación**: Token inválido/expirado
- **Accesos no autorizados**: Intentos de bypass

### Métricas Recomendadas
- Requests por segundo por IP
- Intentos de login fallidos por IP
- Endpoints más atacados
- Tipos de errores más comunes

## 🧪 Testing

### Rate Limiting
```bash
# Probar límite de login
for i in {1..10}; do curl -X POST localhost:3000/auth/login; done
```

### Validación
```bash
# Probar validación de email
curl -X POST localhost:3000/auth/login -d '{"email":"invalid","password":"test"}'
```

### Manejo de Errores
```bash
# Probar ruta no encontrada
curl localhost:3000/api/nonexistent
```

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Rate Limiting Strategies](https://blog.logrocket.com/rate-limiting-node-js/)

---

## 🎯 Próximos Pasos Recomendados

1. **Implementar CSRF Protection** para formularios web
2. **Añadir 2FA (Two-Factor Authentication)** para usuarios admin
3. **Configurar WAF (Web Application Firewall)** en producción
4. **Implementar Session Management** más robusto
5. **Añadir IP Whitelisting** para endpoints administrativos

---

**Implementado por**: GitHub Copilot  
**Fecha**: Noviembre 2025  
**Versión**: 1.0