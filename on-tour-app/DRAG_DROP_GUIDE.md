# 🎯 Drag & Drop Event Creation Guide

## ¿Cómo funciona?

El nuevo sistema de arrastrar y soltar (drag & drop) te permite crear eventos rápidamente en tu calendario.

### 1️⃣ **Crear Botones de Evento**

Los botones personalizados se encuentran en la barra de herramientas del calendario.

**Pasos:**

- Haz clic en el botón **"+ Add"** en la barra de herramientas
- Se abrirá un modal elegante para crear un nuevo botón
- Completa los campos:
  - **Button Label** (requerido): Nombre del evento (ej: "Main Stage", "Travel")
  - **Event Type**: Show o Travel
  - **Color Theme**: Elige un color para diferenciar
  - **Category** (opcional): Categoría adicional

**Modal Features:**

- ✅ Preview en tiempo real del botón
- ✅ Validación automática (label es obligatorio)
- ✅ Diseño coherente con dashboard y shows

### 2️⃣ **Arrastrar Botón al Calendario**

Una vez creado el botón, puedes arrastrarlo a cualquier día del calendario.

**Pasos:**

1. Haz clic y mantén presionado en el botón
2. Arrastra hacia la celda del día donde quieres crear el evento
3. La celda se iluminará indicando que puedes soltar
4. Suelta el botón para abrir el formulario rápido

**Visual Feedback:**

- 🔆 La celda brilla cuando estás encima
- 👁️ Vista previa del botón mientras arrastra
- ✨ Animación suave en drop

### 3️⃣ **Completar Detalles del Evento**

Se abrirá un modal de 2 pasos para completar los detalles:

#### **Paso 1: Quick Create**

- **City** (requerido): Ciudad del evento
- **Country**: País (selector grid con 24 países)
- Tipo de evento mostrado automáticamente

#### **Paso 2: Event Details**

- **Category**: Categoría específica
- **Notes**: Notas adicionales
- **Resumen**: Datos completados en paso 1

**Botones:**

- "Cancel" → Cierra sin guardar
- "More Details" → Va al paso 2
- "Back" → Regresa al paso 1
- "Create Event" → Crea el evento y lo agrega al calendario

### 4️⃣ **Confirmar Creación**

Una vez creado:

- ✅ Toast de confirmación en la esquina inferior derecha
- 🎯 Evento aparece en el calendario
- ⚡ Animación de éxito en la celda

---

## 🎨 Características Principales

### Botones Persistentes

- Los botones se guardan en `localStorage`
- Se cargan automáticamente al recargar la página
- Puedes eliminar botones con el ❌ al pasar mouse

### Validación Inteligente

- Label es requerido para crear botón y evento
- City es requerido en el formulario de evento
- País por defecto es US

### Compatibilidad

- ✅ Desktop y tablet
- ✅ Teclado: Enter para crear, Escape para cerrar
- ✅ Mobile-friendly (responsive)

### Diseño Unificado

- Colores coherentes con dashboard
- Espaciado consistente (px-1.5 md:px-2)
- Tipografía profesional
- Animaciones smooth con Framer Motion

---

## 🎯 Keyboard Shortcuts

| Tecla              | Acción                    |
| ------------------ | ------------------------- |
| `+` (hover en add) | Abre modal de crear botón |
| `Enter`            | Crea evento/botón         |
| `Escape`           | Cierra modal              |
| `Tab`              | Navega entre campos       |

---

## ⚙️ Configuración de Botones

Cada botón tiene:

- **ID**: Único (timestamp)
- **Label**: Nombre visible
- **Type**: 'show' o 'travel'
- **Color**: 6 opciones (emerald, amber, sky, rose, purple, cyan)
- **Category**: Opcional, para organización

---

## 🐛 Troubleshooting

### El drag & drop no funciona

**Soluciones:**

1. Recarga la página (F5)
2. Verifica que el botón esté en la barra
3. Intenta con un navegador moderno (Chrome, Firefox, Safari)

### El evento no se guarda

**Verificar:**

1. ¿Completaste el campo de City?
2. ¿Seleccionaste un país válido?
3. ¿Hay conexión a internet?

### Modal no aparece al soltar

**Causas comunes:**

1. JavaScript deshabilitado (habilitar)
2. Extensiones bloqueando drag & drop
3. Cache del navegador (limpiar)

---

## 📝 Ejemplo Paso a Paso

1. Haz clic en "+ Add"
2. Escribe: "Main Concert"
3. Selecciona: Show (rojo)
4. Color: Rose
5. Click "Create Button"
6. Arrastra "Main Concert" a un día
7. Escribe: "Madrid"
8. Selecciona: Spain
9. Click "Create Event"
10. ✨ Evento aparece en el calendario

---

## 🎪 Casos de Uso

### Tour Planning

- Botón "Tour Stop" → Arrastra a cada ciudad
- Rápido crear eventos para toda la gira

### Festival Season

- Botón "Festival" (amarillo)
- Botón "Rehearsal" (azul)
- Organiza visualmente

### Travel Coordination

- Botón "Travel" (morado)
- Arrastra entre ciudades
- Tracking de movimiento

---

**¡Disfruta creando eventos! 🎉**
