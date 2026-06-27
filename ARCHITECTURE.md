# Arquitectura: CelebraBot (Birthday Worker)

## Stack Tecnológico
- **Frontend**: React + Vite (Typescript)
- **Backend / API**: Cloudflare Workers
- **Base de Datos**: Cloudflare D1 (SQLite)
- **Automatización**: Cloudflare Cron Triggers (`0 * * * *` - cada hora)
- **Integraciones**: Webhooks de Discord (Notificaciones)

## Estructura del Proyecto
El repositorio es un monorepo administrado manualmente:
- `/frontend/`: Aplicación React desplegada en **Cloudflare Pages**.
- `/worker/`: Código backend desplegado en **Cloudflare Workers**.

## Convenciones de Desarrollo
1. **Frontend (React)**:
   - UI basada en "Glassmorphism" con colores morados (`--primary: #8b5cf6`) y fucsias (`--secondary: #ec4899`).
   - Uso intensivo de Flexbox y CSS Grid.
   - Componentes principales: `App.tsx` (orquestador de estados), `ListView.tsx`, `CalendarView.tsx`, `EventsView.tsx`.
   - Se prioriza el rendimiento simulando Paginación/Infinite Scroll en el frontend dado el tamaño reducido del payload de JSON (aprox 15KB para cientos de registros).

2. **Backend (Workers)**:
   - El Worker actúa como una API RESTful y también como un ejecutor programado (Cron).
   - Base de ruta de API para eventos renombrada a `/api/schedule` (para evitar bloqueadores de anuncios que censuran el término `events`).
   - Seguridad simple basada en password hardcodeada (`AUTH_PASSWORD` = `brucce_pass_2026`).

3. **Base de Datos (D1)**:
   - Las operaciones destructivas o de alteración de esquema deben ejecutarse localmente y luego con `wrangler d1 execute celebrabot-db --remote`.
   - **Tablas:**
     - `birthdays`: `id`, `name`, `nickname`, `birth_date` (MM-DD), `image_url`, `custom_message`, `created_at`.
     - `events`: `id`, `title`, `description`, `event_date` (YYYY-MM-DD o MM-DD), `type` ('holiday', 'private_event'), `created_at`.

## Sistema de Notificaciones (Discord)
- Se evalúa diariamente a las `08:00 AM (UTC-5)` para enviar alertas del día actual (cumpleaños o feriados).
- Se evalúa **1 hora antes** de eventos con horario exacto para notificar al grupo sobre "Salidas Privadas".

## Flujo de Despliegue (CI/CD)
- **Frontend**: GitHub Actions despliega automáticamente hacia Cloudflare Pages al hacer push a la rama `main` (Ver `.github/workflows/deploy.yml`).
- **Backend**: Despliegue manual usando `npx wrangler deploy` en el directorio `/worker/`.
