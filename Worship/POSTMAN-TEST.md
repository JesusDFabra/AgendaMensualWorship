# Probar el backend Worship con Postman

## 1. Arrancar el backend

En una terminal, desde la carpeta `Worship`:

```bash
cd "c:\Users\Administrador\OneDrive\elCamino\Agenda Worship\Worship"
mvnw.cmd spring-boot:run
```

(O con Maven instalado: `mvn spring-boot:run`)

Espera a ver en consola algo como: **"Started WorshipApplication"**. El servidor queda en **http://localhost:8081**.

---

## 2. Peticiones en Postman

Base URL: **http://localhost:8081**

### Miembros (`/api/miembros`)

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | http://localhost:8081/api/miembros | Listar todos los miembros |
| POST | http://localhost:8081/api/miembros | Crear un miembro |

**POST – Body (raw, JSON):**

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "alias": "Juancho",
  "identificacion": "123456789",
  "fecNacimiento": "1990-05-15",
  "sexo": { "id": 1 },
  "correo": "juan@ejemplo.com",
  "celular": "3001234567",
  "rol": { "id": 1 },
  "activo": true,
  "observaciones": "Guitarra"
}
```

> **Importante:** En la base de datos (Supabase) deben existir ya registros en las tablas `sexo` y `rol` con esos `id`. Si no, crea primero al menos un sexo (id 1) y un rol (id 1).

---

### Servicios (`/api/servicio`)

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | http://localhost:8081/api/servicio | Listar todos los servicios |
| POST | http://localhost:8081/api/servicio | Crear uno o varios servicios |

**POST – Body (raw, JSON)** – array de servicios:

```json
[
  {
    "fecha": "2025-02-15",
    "nombre": "Culto dominical 10:00"
  }
]
```

---

### Novedades / Disponibilidad (`/api/novedades`)

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | http://localhost:8081/api/novedades | Listar todas las novedades |
| POST | http://localhost:8081/api/novedades | Crear novedades (miembro + servicio) |

**POST – Body (raw, JSON):**

```json
[
  {
    "miembro": { "id": 1 },
    "servicio": { "id": 1 },
    "observacion": "Disponible"
  }
]
```

Solo tiene sentido después de tener al menos un miembro (id 1) y un servicio (id 1).

---

## 3. Orden recomendado para probar

1. **GET** `http://localhost:8081/api/miembros` → Ver si responde 200 y lista (puede ser `[]`).
2. **POST** `http://localhost:8081/api/miembros` con el JSON de ejemplo (ajusta `sexo.id` y `rol.id` si en tu BD son otros).
3. **GET** `http://localhost:8081/api/miembros` de nuevo → Deberías ver el miembro creado.
4. **GET** y **POST** de `/api/servicio` y luego `/api/novedades` si quieres probar todo el flujo.

---

## 4. Si algo falla

- **Error de conexión:** Comprueba que el backend esté en marcha y que Postman use `http://localhost:8081`.
- **404:** Revisa la URL (incluye `/api/` y el path exacto).
- **500 / error de BD:** Revisa que PostgreSQL (Supabase) esté accesible y que las tablas `miembro`, `sexo`, `rol`, `servicio`, `novedades` existan (`ddl-auto=none` no crea tablas).
- **CORS:** El backend tiene `@CrossOrigin(origins = "*")`, así que Postman no debería dar problemas de CORS.
