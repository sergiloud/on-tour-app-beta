#!/usr/bin/env python3
import re
import os
from pathlib import Path

# Directorio de componentes del calendario
calendar_dir = Path("/Users/sergirecio/Documents/On Tour App 2.0/on-tour-app/src/components/calendar")

# Patrones a corregir
patterns = [
    # bg-slate-200 dark:bg-slate-200 dark:bg-white/10 -> bg-slate-200 dark:bg-white/10
    (r'bg-slate-200 dark:bg-slate-200 dark:bg-white/10', 'bg-slate-200 dark:bg-white/10'),

    # bg-slate-300 dark:bg-white/15 (sin hover) -> bg-slate-300 dark:hover:bg-white/15
    (r'([^-])bg-slate-300 dark:bg-white/15', r'\1bg-slate-300 dark:hover:bg-white/15'),

    # hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 -> hover:bg-slate-200 dark:hover:bg-white/10
    (r'hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10', 'hover:bg-slate-200 dark:hover:bg-white/10'),

    # hover:bg-slate-300 dark:bg-white/15 -> hover:bg-slate-300 dark:hover:bg-white/15
    (r'hover:bg-slate-300 dark:bg-white/15', 'hover:bg-slate-300 dark:hover:bg-white/15'),

    # text-slate-700 dark:text-slate-700 dark:text-white/90 -> text-slate-700 dark:text-white/90
    (r'text-slate-700 dark:text-slate-700 dark:text-white/90', 'text-slate-700 dark:text-white/90'),
]

# Procesar todos los archivos .tsx
fixed_files = []
for tsx_file in calendar_dir.glob("*.tsx"):
    try:
        content = tsx_file.read_text()
        original = content

        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)

        if content != original:
            tsx_file.write_text(content)
            fixed_files.append(tsx_file.name)

    except Exception as e:
        print(f"Error procesando {tsx_file.name}: {e}")

print(f"Archivos corregidos ({len(fixed_files)}):")
for f in sorted(fixed_files):
    print(f"  - {f}")
