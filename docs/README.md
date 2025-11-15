# 📚 Documentación On Tour App - Índice

**Última actualización**: Diciembre 2024  
**Estado del Proyecto**: En desarrollo activo

---

## 📁 Documentos Disponibles

### Documentación Técnica

1. **ARCHITECTURE.md** - Arquitectura general del sistema
2. **DESIGN_SYSTEM.md** - Guía de diseño y componentes UI
3. **PERFORMANCE_GUIDE.md** - Optimizaciones y mejores prácticas
4. **HAPTICS_GUIDE.md** - Implementación de feedback háptico
5. **PWA_IMPLEMENTATION.md** - Progressive Web App y offline support
6. **USER_GUIDE.md** - Guía de usuario de la aplicación

### Documentación de Seguridad

7. **SECURITY.md** - Políticas de seguridad
8. **SECURITY_AUDIT.md** ⚠️ - Auditoría de seguridad (acción requerida: migrar Firebase Admin Key a env vars)

### Planes de Arquitectura (Referencia)

9. **FIRESTORE_SCALABLE_ARCHITECTURE.md** 📚 - Arquitectura escalable con finance_snapshots (no implementado, referencia para el futuro)
10. **MULTI_TENANCY_ARCHITECTURE.md** 📚 - Arquitectura multi-organización completa (parcialmente implementado)
11. **MOBILE_DEPLOYMENT.md** - Guía de deployment móvil

### Historial y Cambios

12. **CHANGELOG.md** - Registro de cambios del proyecto


---

## 🎯 Features Implementadas

### Core Modules ✅
- ✅ Dashboard con ActionHub y Health Score
- ✅ Shows Management con Quick Entry NLP
- ✅ Finance V3 (con soporte de VAT, Invoice Total, WHT)
- ✅ Travel con gestión de itinerarios
- ✅ Calendar con vistas mensual/semanal/diaria/agenda
- ✅ Contacts (CRM)
- ✅ Activity Feed (timeline profesional con avatares)
- ✅ Contracts (gestión de contratos con upload de PDFs)
- ✅ MobileOS (app launcher estilo iOS)
- ✅ Command Palette (CMD+K)
- ✅ PWA con offline support
- ✅ Dark Mode adaptativo

### Advanced Features ✅
- ✅ Export CSV/XLSX con ExcelJS (incluye columnas VAT)
- ✅ Multi-currency support
- ✅ WHT (Withholding Tax) por país
- ✅ VAT (IVA) con Invoice Total
- ✅ Agency commissions
- ✅ Virtual scrolling (performance)
- ✅ Keyboard shortcuts
- ✅ i18n (EN/ES)
- ✅ Estructura multi-tenant básica (users/{userId}/organizations/{orgId})

---

## 📝 Cómo Usar Esta Documentación

### Para Desarrolladores:
1. **Arquitectura del sistema** → `ARCHITECTURE.md`
2. **Sistema de diseño** → `DESIGN_SYSTEM.md`
3. **Optimizaciones** → `PERFORMANCE_GUIDE.md`
4. **PWA y offline** → `PWA_IMPLEMENTATION.md`

### Para Usuarios:
1. **Cómo usar la app** → `USER_GUIDE.md`

---

## 🔄 Mantenimiento de Docs

### Regla de Oro:
**"Documentar lo implementado, eliminar planes completados"**

### Cuando implementes una feature:
1. ✅ Implementa el código
2. ✅ Actualiza tests
3. ✅ Actualiza esta documentación
4. ✅ Elimina el doc de planificación (si existe)

---

**Última limpieza**: Diciembre 2024  
**Documentos eliminados**: MOBILE_OPTIMIZATION_PLAN, FINANCE_REFACTORING, CRM_MODULE, I18N_STATUS, DESIGN_AUDIT

