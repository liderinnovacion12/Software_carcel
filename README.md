# BIALCO

Bienestar Integral, Acompanamiento, Logistica y Coordinacion.

Plataforma institucional de demostracion para la gestion de la situacion
juridico-administrativa de personas privadas de la libertad. Este repositorio
contiene la **Fase 1 (fundacion)** y **Fase 2 (recorrido dorado)** del
desarrollo: un demo funcional de extremo a extremo con datos sinteticos.

> Todos los datos de personas, procesos y establecimientos son ficticios.
> Ver "Datos sinteticos para demostracion" en la interfaz.

## Arquitectura

- `backend/` — API en FastAPI + SQLAlchemy + Alembic + PostgreSQL (`/api/v1/...`).
- `frontend/` — React + TypeScript + Vite, con navegacion radial semicircular
  en el borde derecho (en vez del sidebar convencional).
- `docker/` — Docker Compose, Dockerfiles y configuracion de Nginx.

Servicios: PostgreSQL, Redis (reservado para uso futuro), MinIO (reservado
para documentos en una fase posterior), backend, frontend y Nginx como proxy
inverso unico (puerto 80).

## Puesta en marcha

1. Copie el archivo de entorno de ejemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Levante el stack completo:

   ```powershell
   docker compose -f docker/docker-compose.yml up -d --build
   ```

3. Verifique que los servicios esten saludables:

   ```powershell
   docker compose -f docker/docker-compose.yml ps
   ```

4. Aplique las migraciones de base de datos:

   ```powershell
   docker compose -f docker/docker-compose.yml exec backend alembic upgrade head
   ```

5. Siembre los datos sinteticos (~800 personas + caso destacado):

   ```powershell
   docker compose -f docker/docker-compose.yml exec backend python -m scripts.seed --reset
   ```

6. Abra `http://localhost/` e inicie sesion:

   - Usuario: `admin`
   - Contrasena: `Bialco2026*`

La API queda documentada en `http://localhost/docs`.

## Recorrido de demostracion (golden path)

1. Inicie sesion como Administrador BIALCO.
2. Observe los indicadores del tablero (Inicio) — provienen de la base de datos.
3. Presione `Ctrl+K` y busque "Andres".
4. Abra su perfil operativo-juridico.
5. Revise su ubicacion actual, procesos legales y linea de tiempo.
6. Revise el calculo de tiempo/condena con su detalle de trazabilidad.
7. Confirme que los modulos aun no construidos (Casos, Alertas, Documentos,
   etc.) muestran un estado honesto de "no disponible en esta fase" en vez de
   controles simulados.

## Pruebas

Backend:

```powershell
docker compose -f docker/docker-compose.yml exec backend pytest
```

Frontend:

```powershell
docker compose -f docker/docker-compose.yml exec frontend npm run test
docker compose -f docker/docker-compose.yml exec frontend npm run build
```

## Alcance de esta fase

Construido: autenticacion y RBAC (con un unico rol "Administrador General"),
poblacion sintetica (~800 personas), busqueda global, perfil operativo-juridico,
procesos legales, linea de tiempo, motor de calculo de tiempo/condena con
trazabilidad completa, y un tablero con indicadores reales.

Fuera de alcance en esta fase (rutas reservadas, sin controles simulados):
motor de alertas, flujo de trabajo de casos, gestion documental, motor de
reglas configurable, simulador de impacto, modo presentacion, gestion de
establecimientos, panel de administracion completo, vision por computador.
