# On Tour App - Documentación Técnica

**Versión:** 2.1.0-beta  
**Última actualización:** 15 de noviembre de 2025  
**Estado:** Producción (Beta Activa)

---

## 📚 Índice de Documentación

### 🏗️ Arquitectura y Diseño

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura general del sistema | ✅ Actualizado |
| [MULTI_TENANCY_ARCHITECTURE.md](./MULTI_TENANCY_ARCHITECTURE.md) | Sistema multi-tenant (v2.0+) | ✅ Actualizado |
| [FIRESTORE_SCALABLE_ARCHITECTURE.md](./FIRESTORE_SCALABLE_ARCHITECTURE.md) | Estructura de datos Firestore | ✅ Actualizado |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Sistema de diseño y componentes | ✅ Actualizado |
| [SOCKET_IO_ARCHITECTURE.md](./SOCKET_IO_ARCHITECTURE.md) | Real-time con Socket.io | ⚠️ Futuro (v2.2) |

### 🚀 Implementación y Features

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [TIMELINE_IMPLEMENTATION.md](./TIMELINE_IMPLEMENTATION.md) | Timeline de organización | ✅ Completo |
| [PWA_IMPLEMENTATION.md](./PWA_IMPLEMENTATION.md) | Progressive Web App | ✅ Completo |
| [ACTIVITY_TRACKING.md](./ACTIVITY_TRACKING.md) | Sistema de tracking de actividad | ✅ Completo |
| [I18N_EXPANSION_PLAN.md](./I18N_EXPANSION_PLAN.md) | Plan de expansión i18n | ✅ Ready to Execute |

### 🔒 Seguridad

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [SECURITY.md](./SECURITY.md) | Políticas de seguridad | ✅ Actualizado |
| [SECURITY_HARDENING.md](./SECURITY_HARDENING.md) | Hardening: Helmet.js, rate limiting | ✅ v2.1 |
| [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) | Auditoría de seguridad | ✅ v2.1 |
| [I18N_AUDIT_REPORT.md](./I18N_AUDIT_REPORT.md) | Auditoría i18n | ✅ v2.1 |

### 📱 Mobile y Rendimiento

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) | Despliegue móvil (PWA) | ✅ Actualizado |
| [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) | Guía de optimización | ✅ Actualizado |
| [HAPTICS_GUIDE.md](./HAPTICS_GUIDE.md) | Feedback háptico móvil | ✅ Implementado |

### 📖 Guías de Usuario

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [QUICKSTART.md](./QUICKSTART.md) | Inicio rápido para desarrolladores | ✅ Actualizado |
| [USER_GUIDE.md](./USER_GUIDE.md) | Guía de usuario final | ✅ Actualizado |
| [CHANGELOG.md](./CHANGELOG.md) | Registro de cambios | ⚠️ Needs Update |

---

## 🎯 Estado del Proyecto (v2.1)

### ✅ Features Completadas (8/8)

1. **Multi-Tenancy** - Sistema completo de organizaciones
2. **Link Invitations** - Colaboración Agency-Artist
3. **Activity Timeline** - Feed de eventos en tiempo real
4. **CRM Advanced** - Filtros y operaciones bulk
5. **Reports Export** - Excel/PDF generation
6. **Security Hardening** - Helmet.js, rate limiting, CSRF
7. **MFA** - Multi-Factor Authentication
8. **i18n Expansion** - Estrategia FR/DE/IT/PT

### 📊 Métricas Técnicas

- **Cobertura de Tests:** 73.5% (objetivo: 85%)
- **Bundle Size:** ~845KB (gzipped)
- **Lighthouse Score:** 96+
- **Usuarios Beta:** ~25 testers
- **Líneas de Código:** ~170,000
- **Archivos TS/TSX:** 750+

### 🔄 Próximos Pasos (v2.2)

- [ ] Socket.io real-time subscriptions
- [ ] Advanced analytics dashboard
- [ ] Mobile native apps (React Native)
- [ ] API pública para integraciones
- [ ] Machine Learning predictions

---

## 🛠️ Para Desarrolladores

### Configuración Inicial

```bash
# Clonar repositorio
git clone https://github.com/sergiloud/on-tour-app-beta
cd on-tour-app-beta

# Instalar dependencias
npm install --legacy-peer-deps

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase

# Desarrollo
npm run dev

# Build producción
npm run build

# Tests
npm test
```

### Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── organization/ # Multi-tenancy components
│   ├── crm/         # CRM components
│   └── common/      # Shared components
├── pages/            # Páginas de la aplicación
│   ├── org/         # Organization pages
│   └── dashboard/   # Dashboard pages
├── context/          # React Contexts (state management)
├── services/         # Business logic & API calls
├── hooks/            # Custom React hooks
├── lib/              # Utilities & helpers
└── types/            # TypeScript definitions
```

### Convenciones de Código

- **TypeScript strict mode** - Tipado completo
- **ESLint + Prettier** - Formato automático
- **Conventional Commits** - Mensajes estandarizados
- **Feature Branches** - `feat/`, `fix/`, `docs/`
- **Tests Required** - Coverage mínimo 70%

---

## 📞 Soporte

- **Email:** soporte@ontourapp.com
- **GitHub Issues:** [github.com/sergiloud/on-tour-app-beta/issues](https://github.com/sergiloud/on-tour-app-beta/issues)
- **Slack:** Workspace interno para beta testers

---

## 📄 Licencia

Propietary - Todos los derechos reservados © 2025 On Tour App

Para obtener una licencia comercial, contactar: licencias@ontourapp.com
