# Cómo ejecutar el backend (Spring Boot)

Este proyecto es **Java con Maven**, no usa Node.js. No uses `npm`.

## Ejecutar el servidor

Desde la carpeta **Worship** (donde está este README y el archivo `pom.xml`):

### En Windows (PowerShell o CMD)
```bash
.\mvnw.cmd spring-boot:run
```

### Si tienes Maven instalado
```bash
mvn spring-boot:run
```

El servidor quedará en **http://localhost:8081**.

---

## Error: `UnknownHostException: db.udoykhmbwelnpdmgaxgg.supabase.co`

Ese error significa que **tu equipo no puede resolver el nombre del servidor de Supabase** (falla DNS o red), no que la contraseña sea incorrecta.

### Qué hacer

1. **Comprobar internet**  
   Asegúrate de que tienes conexión (otras páginas, etc.).

2. **Probar si el host se resuelve**  
   En PowerShell:
   ```powershell
   ping db.udoykhmbwelnpdmgaxgg.supabase.co
   ```
   Si sale "No se puede encontrar el host" o similar, el problema es DNS o red (firewall, proxy, VPN).

3. **Revisar el proyecto en Supabase**  
   - Entra en [Supabase](https://supabase.com/dashboard) y abre tu proyecto.
   - Comprueba que el proyecto **no esté pausado** (en plan gratuito se pausa por inactividad).
   - En **Project Settings → Database** copia de nuevo la **Connection string** (modo "URI" o "Session mode"). El host debe ser algo como `db.xxxxx.supabase.co`. Si el proyecto se recreó, el host puede haber cambiado.

4. **Usar otra red o DNS**  
   Si estás en una red corporativa o con VPN, prueba con datos del móvil u otra red para descartar bloqueos.

5. **Configurar la URL por variable de entorno (opcional)**  
   Puedes no guardar la URL en el código y pasarla al arrancar:
   ```powershell
   $env:SPRING_DATASOURCE_URL="jdbc:postgresql://TU_HOST:5432/postgres"
   $env:SPRING_DATASOURCE_USERNAME="postgres"
   $env:SPRING_DATASOURCE_PASSWORD="tu_password"
   .\mvnw.cmd spring-boot:run
   ```
   Spring Boot lee esas variables y sobreescribe `application.properties`.

---

## Si sale error 500 por otra causa

1. **Revisa la consola donde corre el backend**  
   El stack trace (líneas rojas) indica el error real (tabla que no existe, etc.).

2. **Conexión y tablas en Supabase**  
   Con `spring.jpa.hibernate.ddl-auto=none`, Hibernate **no** crea tablas; deben existir en Supabase: `miembro`, `rol`, `sexo`, `servicio`, etc.

3. **Probar el backend**  
   Con el backend en marcha: http://localhost:8081/api/miembros (debe responder JSON, aunque sea `[]`).
