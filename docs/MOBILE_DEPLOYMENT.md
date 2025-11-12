# Mobile OS Deployment - Beta

## ✅ Deployment Completado

**Fecha**: 12 de noviembre de 2025  
**Repositorio Beta**: https://github.com/sergiloud/on-tour-app-beta  
**Branch**: main  
**Commit**: e0395c9

---

## 🎯 Verificación de Vista Móvil

### Detección Automática
La aplicación detecta automáticamente dispositivos móviles mediante:

1. **User Agent Detection**
   - Regex: `/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i`
   - Detecta: iPhone 8+, Android, iPad, etc.

2. **Viewport Size Detection**
   - Breakpoint: < 768px
   - Responsive a cambios de tamaño

3. **Lógica de Renderizado** (`src/layouts/DashboardLayout.tsx:250-258`)
   ```typescript
   if (isMobile) {
     return (
       <MissionControlProvider>
         <MobileOS />
       </MissionControlProvider>
     );
   }
   ```

### Cómo Probar
1. Abre https://on-tour-app-beta.vercel.app desde tu iPhone/Android
2. La vista móvil (iOS-style) debería aparecer automáticamente
3. Si no aparece, verifica:
   - User agent del navegador
   - Tamaño de viewport
   - Consola para errores

---

## 📱 Features Implementadas

### Apps Reales
- ✅ **ShowsApp**: Lista de shows con filtros, búsqueda, detalles
- ✅ **FinanceApp**: KPIs, breakdown financiero, shows recientes
- ✅ **CalendarApp**: Vista mes/lista, selección de fechas
- ✅ **SettingsApp**: Gestión de widgets, preferencias

### Widgets
- ✅ **WhatsNext**: Próximos shows desde showStore
- ✅ **QuickStats**: Métricas en tiempo real

### UX Features
- ✅ **Drag & Drop**: Reorganizar apps en edit mode
- ✅ **Animaciones Optimizadas**: 40-60% más rápidas
- ✅ **Persistencia**: localStorage para layout y widgets
- ✅ **Sin Emojis**: Reemplazados por iconos profesionales

---

## 🔧 Comandos de Deployment

### Deployment a Beta
```bash
# Una vez
git remote add beta https://github.com/sergiloud/on-tour-app-beta.git

# Deploy
git push beta main --force
```

### Build Local
```bash
npm run build
npm run preview
```

---

## 📊 Métricas de Performance

### Animaciones
- **Duración**: 0.15-0.25s (antes: 0.3-0.5s)
- **Easing**: `[0.4, 0, 0.2, 1]` (Material Design)
- **Stagger**: 0.015-0.05s (antes: 0.05-0.1s)

### Bundle Size
- **CSS**: ~260 KB (optimized)
- **JS chunks**: Code-split para lazy loading

---

## 🐛 Known Issues
- Service Worker deshabilitado (MIME type issues en Vercel)
- Duplicate key warning en i18n (no afecta funcionalidad)

---

## 📝 Next Steps
1. Probar en diferentes dispositivos móviles
2. Verificar performance en redes lentas
3. Ajustar animaciones según feedback
4. Implementar App Switcher (multitasking)
5. Añadir Spotlight Search
