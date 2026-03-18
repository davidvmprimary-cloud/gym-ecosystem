# Directrices para Agentes Automáticos (AGENTS.md)

Este documento contiene reglas estrictas y recordatorios para cualquier agente de IA que trabaje en este proyecto.

---

### 1. Manejo de Consola en Windows
- **Comandos Múltiples:** Al ejecutar comandos encadenados en la terminal, **NUNCA** utilices el operador doble ampersand (`&&`). En su lugar, utiliza SIEMPRE el punto y coma (`;`).
  - ❌ Incorrecto: `git add . && git commit -m "msg"`
  - ✅ Correcto: `git add . ; git commit -m "msg"`

---

### 2. Flujo de Trabajo y Control de Versiones (Git)
- **Commits Regulares:** Debes realizar commits regulares al finalizar cada fase, sub-fase o hito lógico importante.
- **Prohibición:** Está completamente prohibido implementar bloques grandes de código o múltiples características sin antes encapsular los cambios previos en un commit con un mensaje descriptivo.

---

### 3. Precauciones con la Base de Datos (Reseteos)
Al resetear la base de datos (por ejemplo mediante `prisma migrate reset` o `prisma db push --force-reset`), ten en cuenta la desincronización con el proveedor de autenticación (Supabase Auth).

**Problema común:** 
Si un usuario se autentica por primera vez, se crea el registro en Supabase Auth y el trigger (o el código manual) crea su fila en la tabla `User` de Prisma. Si la base de datos de Prisma es reseteada posteriormente:
1. El usuario seguirá teniendo una sesión válida en Supabase Auth en su navegador.
2. La fila correspondiente en la tabla `User` de Prisma ya NO existirá.
3. Las queries a la base de datos fallarán indicando que el perfil del usuario no existe, haciendo la app inutilizable para ese usuario.

**Manejo manual / Remediación:**
Si limpias o reseteas la base de datos de datos, debes:
- Limpiar también los usuarios desde el panel de Supabase Auth (borrarlos) para forzarlos a registrarse de nuevo, O
- Asegurarte de que el inicio de sesión del usuario en tu código valide y recree la fila de `User` en caso de que su UID de Supabase no exista en Prisma.

---

### 4. Arquitectura y Escalabilidad (State of the Art)
- **Mentalidad de Raíces:** No busques solo "parchear" el problema inmediato. Cada solución debe ser analizada desde una perspectiva de arquitectura escalable. Si un problema se repite o parece un síntoma de algo más profundo, busca establecer "buenas raíces" en la estructura del código.
- **Robustez:** Implementa patrones que eviten la regresión de errores. Utiliza tipos fuertes, inyección de dependencias (donde sea apropiado) y capas de abstracción claras (como Repositories) para separar la lógica de negocio del acceso a datos.
- **Evolución:** Las soluciones deben estar preparadas para el crecimiento de la app. Evita acoplamientos innecesarios y prefiere soluciones que sean estándares de la industria o "state of the art" en el ecosistema (ej. Next.js App Router, Prisma, TypeScript estricto).
