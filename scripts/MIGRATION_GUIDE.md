# Beta Users Multi-Tenant Migration

Script de administración para migrar usuarios beta de la estructura antigua a la nueva arquitectura multi-tenant.

## 🎯 Propósito

Migrar datos existentes de beta testers desde:

```
users/{userId}/
  ├── shows/          ❌ Estructura antigua
  ├── finance/
  └── contacts/
```

Hacia:

```
users/{userId}/
  └── organizations/
      └── {orgId}/
          ├── shows/      ✅ Nueva estructura multi-tenant
          ├── finance/
          ├── contacts/
          └── contracts/

organizations/{orgId}/
  ├── metadata
  ├── members/
  └── activity/
```

## 📋 Pre-requisitos

1. **Firebase Admin SDK configurado**
   - Archivo `firebase-admin-key.json` en la raíz del proyecto
   - Permisos de administrador en Firestore

2. **Node.js 18+**
   ```bash
   node --version  # Debe ser >= 18
   ```

3. **Dependencias instaladas**
   ```bash
   npm install
   ```

## 🚀 Uso

### Modo Dry Run (Recomendado primero)

Ejecuta el script **sin hacer cambios** para ver qué se migrará:

```bash
node scripts/migrate-beta-users-to-multitenant.mjs
```

Salida esperada:
```
ℹ️  DRY RUN MODE - No changes will be made
ℹ️  Found 15 users to process

ℹ️  Migrating user: abc123
📊 Shows: 24, Finance: 12, Contacts: 8
🔍 [DRY RUN] Would create organization: "John's Tour"
...
```

### Migrar Usuario Específico

Prueba con un solo usuario primero:

```bash
node scripts/migrate-beta-users-to-multitenant.mjs --user=USER_ID_AQUI --apply
```

### Migrar Todos los Usuarios

**⚠️ CUIDADO: Esto modificará Firestore en producción**

```bash
node scripts/migrate-beta-users-to-multitenant.mjs --apply
```

## 🔍 Qué Hace el Script

Para cada usuario:

1. **Verifica** si ya tiene organizaciones (skip si ya migrado)
2. **Verifica** si tiene datos para migrar (skip si vacío)
3. **Crea** organización por defecto:
   - Nombre: "{displayName}'s Tour" o "{email}'s Tour"
   - Tipo: `tour`
   - Owner: el usuario actual
4. **Migra** todas las colecciones:
   - `shows/` → `organizations/{orgId}/shows/`
   - `finance/` → `organizations/{orgId}/finance/`
   - `contacts/` → `organizations/{orgId}/contacts/`
   - `contracts/` → `organizations/{orgId}/contracts/`
5. **Crea** membresía en `organizations/{orgId}/members/{userId}` con rol `owner`
6. **Registra** actividad en `organizations/{orgId}/activity/`
7. **Elimina** colecciones antiguas (solo después de migración exitosa)

## 📊 Reporte de Migración

Al finalizar, el script genera un reporte completo:

```
╔═══════════════════════════════════════════╗
║   MIGRATION REPORT                        ║
╚═══════════════════════════════════════════╝

Total Users Processed: 15
✅ Successfully Migrated: 13
⚠️  Skipped (already migrated/no data): 2
❌ Failed: 0

Detailed Statistics:
  • Organizations Created: 13
  • Shows Migrated: 287
  • Finance Records Migrated: 156
  • Contacts Migrated: 94
  • Contracts Migrated: 42
```

## 🛡️ Características de Seguridad

### Idempotente
✅ Seguro ejecutar múltiples veces
- Skip usuarios ya migrados automáticamente
- No duplica datos

### Dry Run por Defecto
✅ Previene errores accidentales
- Siempre requiere `--apply` para ejecutar
- Muestra preview de cambios

### Batching
✅ Maneja grandes volúmenes de datos
- Usa Firestore batch writes (500 ops/batch)
- No excede límites de rate

### Logging Completo
✅ Trazabilidad total
- Timestamps en cada operación
- IDs de usuarios y organizaciones
- Errores detallados si fallan

### Rollback Manual Posible
✅ Datos antiguos se eliminan solo después de migración exitosa
- Primero copia a nueva ubicación
- Verifica éxito
- Luego elimina antigua

## 🔧 Troubleshooting

### Error: "firebase-admin-key.json not found"

**Solución:**
1. Ve a Firebase Console → Project Settings → Service Accounts
2. Genera nueva clave privada
3. Guarda como `firebase-admin-key.json` en la raíz del proyecto
4. **NO COMMITEES ESTE ARCHIVO** (ya está en .gitignore)

### Error: "Permission denied"

**Solución:**
- Verifica que la service account tenga rol `Firebase Admin SDK Administrator Service Agent`
- O usa cuenta con permisos de `Owner` del proyecto

### Usuario Ya Migrado pero Quiero Re-Migrar

**Solución:**
1. Elimina manualmente la colección `users/{userId}/organizations/` en Firestore
2. Ejecuta el script nuevamente para ese usuario:
   ```bash
   node scripts/migrate-beta-users-to-multitenant.mjs --user=USER_ID --apply
   ```

### Script se Detiene a Mitad de Migración

**Solución:**
- El script es idempotente, simplemente vuelve a ejecutarlo
- Usuarios ya migrados serán skipped
- Solo continuará con pendientes

## 📝 Logs de Ejemplo

### Usuario con Datos

```
ℹ️  [2024-11-15T10:30:45.123Z] Migrating user: abc123
ℹ️  Email: john@example.com, Name: John Doe
ℹ️  Found data to migrate:
    - Shows: 24
    - Finance: 12
    - Contacts: 8
    - Contracts: 0
ℹ️  Creating organization: John Doe's Tour (org_1234567890_abc)
✅ Organization created successfully
ℹ️  Copying 24 shows documents...
✅ Copied 24 shows documents
ℹ️  Copying 12 finance documents...
✅ Copied 12 finance documents
ℹ️  Copying 8 contacts documents...
✅ Copied 8 contacts documents
ℹ️  Cleaning up old data structures...
✅ Deleted 24 old shows documents
✅ Deleted 12 old finance documents
✅ Deleted 8 old contacts documents
✅ User migration completed successfully!
ℹ️  Summary: 24 shows, 12 finance, 8 contacts, 0 contracts
```

### Usuario Sin Datos

```
ℹ️  [2024-11-15T10:30:50.456Z] Migrating user: xyz789
ℹ️  Email: jane@example.com, Name: Jane Smith
ℹ️  User has no data to migrate. Skipping.
```

### Usuario Ya Migrado

```
ℹ️  [2024-11-15T10:30:55.789Z] Migrating user: def456
ℹ️  Email: bob@example.com, Name: Bob Johnson
⚠️  User already has 1 organization(s). Skipping migration.
```

## 🔄 Siguiente Paso Después de Migración

Una vez migrados todos los usuarios:

1. **Verificar en Firebase Console**
   - Navega a `users/{userId}/organizations/`
   - Verifica que existan organizaciones
   - Confirma que datos se copiaron correctamente

2. **Testing**
   - Pide a beta testers que hagan login
   - Deben ver su organización automáticamente
   - Deben tener acceso a todos sus datos

3. **Notificar a Beta Testers**
   ```
   Hola [nombre],
   
   Hemos migrado tu cuenta a nuestra nueva arquitectura multi-tenant.
   Todos tus datos (shows, finanzas, contactos) ahora están en tu 
   organización personal: "[Nombre]'s Tour".
   
   No necesitas hacer nada, simplemente inicia sesión como siempre.
   
   Si tienes algún problema, contáctanos.
   ```

4. **Cleanup Opcional**
   - Después de ~1 semana sin issues
   - Considera eliminar colecciones vacías antiguas
   - Mantén backup por si acaso

## 📚 Referencias

- [Firestore Security Rules - Multi-Tenancy](../firestore.rules)
- [Multi-Tenancy Architecture](../docs/MULTI_TENANCY_ARCHITECTURE.md)
- [Organization Context](../src/context/OrganizationContext.tsx)
- [Firestore Org Service](../src/services/firestoreOrgService.ts)

## ⚠️ Advertencias

1. **Backup Primero**
   - Antes de ejecutar con `--apply`, exporta tu Firestore:
     ```bash
     gcloud firestore export gs://[BUCKET_NAME]/backups/$(date +%Y%m%d)
     ```

2. **No Interrumpir Durante Migración**
   - Si tienes muchos usuarios, puede tomar varios minutos
   - No cierres la terminal hasta que termine

3. **Rate Limits**
   - El script respeta límites de Firestore (batches de 500)
   - Para >1000 usuarios, considera migrar en tandas

4. **Costos**
   - Cada migración = lecturas + escrituras + eliminaciones
   - Estima costos en Firebase Console primero
   - Típicamente <$1 para 50 usuarios con datos moderados

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs completos del script
2. Verifica en Firebase Console el estado de los datos
3. Contacta al equipo de desarrollo con:
   - User ID afectado
   - Logs completos del error
   - Screenshot de Firestore Console

---

**Creado**: 15 de Noviembre de 2025
**Última Actualización**: 15 de Noviembre de 2025
**Versión**: 1.0.0
