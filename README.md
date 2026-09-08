# BIALCO

Bienestar Integral, Acompanamiento, Logistica y Coordinacion.

Plataforma institucional de demostracion para la gestion de la situacion
juridico-administrativa de personas privadas de la libertad.

> Todos los datos de personas, procesos y establecimientos son ficticios.
> Ver "Datos sinteticos para demostracion" en la interfaz.

## Dos formas de correr este repositorio

Este repositorio contiene **dos rutas independientes** hacia la misma demo:

1. **Demo publica estatica (`frontend/`, por defecto)** — el frontend genera su
   propio dataset sintetico en el navegador (~800 personas, casos, alertas,
   calculos, etc.) y no depende de ningun backend. Pensada para publicarse en
   Vercel u otro hosting estatico, sin servidores que mantener vivos.
2. **Backend real on-premise (`backend/` + `docker/`)** — API en FastAPI +
   PostgreSQL con RBAC, migraciones y auditoria real, pensada para un
   despliegue institucional futuro. Sigue intacta en el repositorio pero la
   demo publica **no la usa**.

## Demo estatica (frontend)

```powershell
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173/` e inicie sesion:

- Usuario: `admin`
- Contrasena: `Bialco2026*`

Esta es una demostracion publica sin datos reales: el inicio de sesion es una
verificacion local en el navegador, no un mecanismo de seguridad.

### Publicar en Vercel

1. Cree un proyecto nuevo en Vercel a partir de este repositorio.
2. En la configuracion del proyecto, defina el **Root Directory** como
   `frontend`.
3. Vercel detecta Vite automaticamente (`frontend/vercel.json` ya define
   `buildCommand`, `outputDirectory` y el rewrite de SPA). No se requieren
   variables de entorno.
4. Despliegue. El sitio queda 100% estatico — sin base de datos, sin backend,
   sin costos de servidor.

### Recorrido de demostracion (golden path)

1. Inicie sesion como Administrador BIALCO.
2. Observe los indicadores del tablero (Inicio) — calculados en tiempo real
   sobre los datos sinteticos generados en el navegador.
3. Presione `Ctrl+K` y busque "Andres".
4. Abra su perfil operativo-juridico: ubicacion, procesos legales, linea de
   tiempo y calculo de tiempo/condena con detalle de trazabilidad.
5. Explore Casos, Alertas, Documentos, Establecimientos, Analitica, Deteccion
   y Administracion desde la navegacion radial (borde derecho) — todos con
   datos generados, no "proximamente".
6. Pruebe el "Modo presentacion" desde el tablero para la vista de pantalla
   completa con KPIs animados.

### Pruebas

```powershell
cd frontend
npm run test
npm run build
```

## Backend real on-premise (opcional, para desarrollo futuro)

El backend FastAPI + PostgreSQL sigue disponible para quien quiera continuar
la version institucional real (autenticacion JWT, RBAC server-side, auditoria,
migraciones Alembic). No es necesario para la demo publica.

```powershell
Copy-Item .env.example .env
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.yml exec backend alembic upgrade head
docker compose -f docker/docker-compose.yml exec backend python -m scripts.seed --reset
```

Abra `http://localhost/` (usuario `admin`, contrasena `Bialco2026*`); la API
queda documentada en `http://localhost/docs`.

```powershell
docker compose -f docker/docker-compose.yml exec backend pytest
```

## Alcance

Construido: poblacion sintetica (~800 personas), busqueda global, perfil
operativo-juridico, procesos legales, linea de tiempo, motor de calculo de
tiempo/condena con trazabilidad completa, motor de alertas, casos,
documentos, establecimientos, analitica con graficas, modo presentacion,
modulo de deteccion (vision por computador simulada) y panel de
administracion de solo lectura.

Fuera de alcance: motor de reglas configurable con aprobacion/versionado,
gestion documental con carga de archivos real, integraciones externas,
multi-institucion, PWA/offline.
