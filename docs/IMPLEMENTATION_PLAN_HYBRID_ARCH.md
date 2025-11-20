# 🚀 Plan de Implementación: Arquitectura Híbrida & Simulación Financiera

**Fecha:** 20 de Noviembre de 2025  
**Estado:** Aprobado para Ejecución Inmediata  
**Objetivo:** Transformar la complejidad técnica (Rust/WASM) en una ventaja estratégica tangible mediante una arquitectura adaptativa y una demostración de fuerza computacional.

---

## 🎯 Visión Estratégica: "Doble o Nada"

En lugar de eliminar el motor financiero en Rust (WASM) por su complejidad, lo convertiremos en un activo premium justificado.

1.  **DX Guardrail (Arquitectura Transparente):** El entorno de desarrollo usará JavaScript por defecto para eliminar barreras de entrada. WASM será una optimización progresiva ("opt-in") o exclusiva de producción.
2.  **The Simulation Room (Demostración de Valor):** Implementaremos una funcionalidad de "Stress Test" (Monte Carlo) que demuestre empíricamente por qué Rust es necesario para cargas de trabajo masivas (10,000+ iteraciones), mientras JS maneja estimaciones rápidas.

---

## 🛠️ Fase 1: Refactor de DX (Developer Experience)

**Objetivo:** Permitir que cualquier desarrollador (`npm run dev`) trabaje sin configurar Rust, reservando WASM para entornos de alto rendimiento.

### 1.1. Refactor de `src/lib/wasmFinancialEngine.ts`
Transformar la clase actual en una **Factory** inteligente que decida qué motor instanciar.

- **Contrato Estricto:** Definir una interfaz `SimulationResult` compartida e inmutable para evitar bugs condicionales entre motores.
  ```typescript
  interface SimulationResult {
    probability: number; // 0-1
    variance: number;
    iterations: number;
    executionTimeMs: number;
  }
  ```

- **Lógica de Decisión:**
  - Si `import.meta.env.DEV` Y `!VITE_ENABLE_WASM` → **JavaScript Engine** (Rápido, sin setup).
  - Si `import.meta.env.PROD` O `VITE_ENABLE_WASM=true` → **WASM Engine** (Alto rendimiento).
  - **Fallback:** Si WASM falla al cargar, degradar silenciosamente a JS.

- **Indicadores de UI:**
  - Exponer una propiedad `engineType: 'JS' | 'WASM'` para que la interfaz sepa qué capacidades tiene disponibles.

### 1.2. Configuración de Entorno
- Actualizar `.env.example` con la nueva flag opcional:
  ```bash
  # Optional: Force WASM engine in development (requires Rust toolchain)
  VITE_ENABLE_WASM=false
  ```

---

## 🧪 Fase 2: The "Simulation Room" (MVP)

**Objetivo:** Crear un componente visual que justifique la existencia del motor híbrido mediante una comparación directa de capacidades.

### 2.1. Nuevo Componente: `StressTestWidget`
Ubicación: `src/components/mission/StressTestWidget.tsx`

**Funcionalidad:**
- **Input:** Parámetros de volatilidad (ej. "¿Qué pasa si la venta de tickets varía +/- 15%?").
- **Proceso:** Ejecutar simulaciones de Monte Carlo para proyectar probabilidad de éxito financiero.
- **Adaptabilidad:**
  - **Modo JS:** Ejecuta 100 iteraciones (Estimación Rápida). Muestra advertencia: *"Switching to simplified mode. Enable WASM for full risk analysis."*
  - **Modo WASM:** Ejecuta 10,000 iteraciones (Análisis Profundo). Muestra métricas de rendimiento: *"Processed 10k scenarios in 800ms"*.

### 2.2. Integración en Dashboard
- Añadir el widget al **Timeline Mission Control** o al **Financial Dashboard**.
- Debe ser visible y accesible para demostrar la potencia del motor.

---

## 🏗️ Fase 3: Migración a Supabase (Largo Plazo)

**Objetivo:** Resolver la dualidad "Frankenstein" (Firestore + Postgres) unificando la arquitectura de datos en SQL relacional.

### 3.1. Estrategia "Strangler Fig" (Migración Gradual)
No reescribir todo de golpe. Migrar módulo por módulo.

1.  **Módulo Financiero (Prioridad 1):**
    - Migrar tablas de `expenses`, `invoices`, `budgets` a Supabase.
    - Aprovechar SQL para agregaciones (`SUM`, `AVG`) y eliminar lógica de reducción en cliente.
    - **⚠️ CRÍTICO:** Implementar **PowerSync** o **RxDB** desde el día 1 para replicar la experiencia offline de Firestore. Sin esto, la UX móvil se degradará.

2.  **Módulo Roadmap (Prioridad 2):**
    - Migrar `tasks` y `dependencies`.
    - Usar consultas recursivas de Postgres para resolver dependencias de tareas eficientemente.

3.  **Usuarios & Auth (Fase Final):**
    - Migrar de Firebase Auth a Supabase Auth.
    - Apagar Firestore definitivamente.

---

## 📅 Cronograma Estimado

| Fase | Tarea | Esfuerzo | Impacto |
|------|-------|----------|---------|
| **1** | Refactor DX (Factory Pattern) | 1 día | ⭐⭐⭐ (Desbloquea contribuciones) |
| **2** | Simulation Room MVP | 2-3 días | ⭐⭐⭐⭐⭐ (Venta técnica/Inversores) |
| **3** | Planificación Supabase | 1 semana | ⭐⭐⭐⭐ (Estabilidad a largo plazo) |

---

## ✅ Criterios de Éxito

1.  Un desarrollador nuevo puede clonar el repo y ejecutar `npm run dev` sin errores de Rust.
2.  El widget de "Stress Test" funciona en ambos modos (JS y WASM) y muestra claramente la diferencia de escala.
3.  La documentación refleja esta arquitectura híbrida como una decisión de diseño intencional ("Arquitectura Adaptativa").
