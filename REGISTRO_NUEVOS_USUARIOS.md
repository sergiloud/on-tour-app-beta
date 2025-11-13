# ✅ Guía de Registro para Nuevos Usuarios

## Estado del Sistema

### Firebase Configurado ✅
- API Key: `AIzaSyDCKhH8TMdoK5ioFS_ABmPsVzacKk7WDmo`
- Project ID: `on-tour-app-712e2`
- Auth Domain: `on-tour-app-712e2.firebaseapp.com`
- **Estado**: Completamente configurado y funcionando

### Firestore Rules ✅
- Reglas de seguridad implementadas
- Usuarios solo pueden acceder a sus propios datos
- Path: `users/{userId}/*`
- Aislamiento completo por usuario

---

## Flujo de Registro Completo

### 1. **Página de Registro** (`/register`)
   - URL: `https://tu-dominio.com/register`
   - Campos requeridos:
     * Nombre completo
     * Email válido
     * Contraseña segura (8+ caracteres, mayúsculas, minúsculas, números, símbolos)
     * Aceptar términos y condiciones

### 2. **Validación en Tiempo Real**
   ```
   ✓ Email válido (formato xxx@xxx.xxx)
   ✓ Contraseña fuerte:
     - Mínimo 8 caracteres
     - Al menos 1 mayúscula
     - Al menos 1 minúscula
     - Al menos 1 número
     - Al menos 1 símbolo especial
   ```

### 3. **Creación de Cuenta**
   
   **Firebase Authentication:**
   - Se crea usuario en Firebase Auth
   - UID único generado automáticamente
   - Display Name actualizado con nombre completo

   **Firestore Database:**
   - Se crea documento en `users/{uid}/profile/main`
   - Se guardan preferencias por defecto:
     * Theme: `dark`
     * Language: `es`
     * Currency: `EUR`
     * Timezone: `Europe/Madrid`
     * Notifications: `true`

   **Servicios Inicializados:**
   - ✅ HybridShowService (sincronización de shows)
   - ✅ HybridContactService (sincronización de contactos)
   - ✅ FirestoreFinanceService (transacciones financieras)

### 4. **Redirección Automática**
   - Después del registro exitoso → `/onboarding`
   - Delay: 2 segundos (con animación de éxito)

---

## Métodos de Inicio de Sesión

### Email/Password ✅
- Autenticación nativa de Firebase
- Persistencia local (sesión permanente)
- Remember me por defecto

### Google Sign-In ✅
- OAuth 2.0 con Firebase
- Un clic para registrarse
- Datos de perfil pre-llenados

### Apple Sign-In ✅
- OAuth con Firebase
- Privacidad mejorada
- Compatible con iOS/macOS

---

## Datos que se Crean Automáticamente

Cuando un usuario se registra, se inicializan las siguientes colecciones en Firestore:

```
users/
  {userId}/
    profile/
      main/
        ├── id
        ├── name
        ├── email
        ├── createdAt
        └── updatedAt
    
    preferences/
      main/
        ├── theme
        ├── language
        ├── currency
        ├── timezone
        ├── notifications
        └── updatedAt
    
    shows/          (vacío inicialmente)
    contacts/       (vacío inicialmente)
    transactions/   (vacío inicialmente)
    venues/         (vacío inicialmente)
    itineraries/    (vacío inicialmente)
```

---

## Testing del Registro

### URLs para probar:
1. **Desarrollo local**: `http://localhost:5173/register`
2. **Producción**: `https://on-tour-app-beta.vercel.app/register`

### Cuentas de prueba (Demo):
```
Email: demo@demo.com
Password: Demo1234!

Email: agency@demo.com
Password: Demo1234!

Email: artist@demo.com
Password: Demo1234!
```

---

## Errores Comunes y Soluciones

### "Email already in use"
**Causa**: El email ya está registrado
**Solución**: Ir a `/login` e iniciar sesión con ese email

### "Weak password"
**Causa**: La contraseña no cumple los requisitos
**Solución**: Usar contraseña con 8+ caracteres, mayúsculas, números y símbolos

### "Network error"
**Causa**: Sin conexión a internet o Firebase caído
**Solución**: Verificar conexión y reintentar

### "Firebase not initialized"
**Causa**: Variables de entorno no configuradas
**Solución**: Verificar archivo `.env` con las credenciales de Firebase

---

## Onboarding Post-Registro

Después del registro, el usuario verá:

1. **Bienvenida** 
   - Introducción a On Tour App
   - Tour guiado de características principales

2. **Configuración Inicial**
   - Selección de timezone (pre-configurado: Europe/Madrid)
   - Preferencias de moneda (pre-configurado: EUR)
   - Preferencias de idioma (pre-configurado: ES)

3. **Dashboard**
   - Primera vista del panel de control
   - Sin datos iniciales (colecciones vacías)
   - Botones de "Añadir primer show", "Añadir primer contacto", etc.

---

## Seguridad Implementada

### Autenticación ✅
- Firebase Auth con email/password
- OAuth 2.0 (Google, Apple)
- Tokens JWT seguros

### Autorización ✅
- Firestore Rules estrictas
- Solo el usuario puede ver/editar sus datos
- Path aislado: `users/{userId}/*`

### Encriptación ✅
- Datos sensibles en `secureStorage`
- Contraseñas hasheadas por Firebase
- Comunicación HTTPS

### Validación ✅
- Validación client-side y server-side
- Sanitización de inputs
- Protección CSRF

---

## Checklist para Nuevos Usuarios

Antes de compartir con tus amigos, verifica:

- ✅ Firebase configurado (variables de entorno)
- ✅ Firestore rules desplegadas
- ✅ Build de producción funciona sin errores
- ✅ Registro con email/password funciona
- ✅ Google Sign-In funciona
- ✅ Apple Sign-In funciona
- ✅ Datos se guardan en Firestore correctamente
- ✅ Redirección a onboarding funciona
- ✅ Sin errores en consola del navegador

---

## Comandos Útiles

### Verificar Firebase
```bash
npm run build
# Debería completar sin errores
```

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Ver logs de Firebase
```bash
firebase functions:log
```

---

## Soporte

Si tus amigos tienen problemas:

1. **Verificar consola del navegador** (F12) → buscar errores
2. **Intentar con cuenta demo** primero
3. **Verificar email de verificación** (si está habilitado)
4. **Limpiar caché del navegador** y reintentar
5. **Usar navegador en modo incógnito** para probar

---

## Próximos Pasos

Después del registro exitoso, los usuarios pueden:

1. **Crear su primer show** en `/dashboard/shows`
2. **Añadir contactos** en `/dashboard/contacts`
3. **Configurar agencias** en `/settings/profile`
4. **Crear transacciones** en `/dashboard/finance`
5. **Planificar viajes** en `/dashboard/travel`

---

## Notas Importantes

⚠️ **Límites de Firebase (Plan Gratuito)**
- Autenticaciones: 10,000/mes
- Lecturas Firestore: 50,000/día
- Escrituras Firestore: 20,000/día

📊 **Monitoreo**
- Firebase Console: https://console.firebase.google.com
- Analytics integrado
- Tracking de errores

🔒 **Privacidad**
- Datos encriptados en tránsito
- Aislamiento por usuario
- GDPR compliant

---

**Última actualización**: 13 de noviembre de 2025
**Versión**: 2.0 Beta
**Estado**: ✅ Listo para producción
