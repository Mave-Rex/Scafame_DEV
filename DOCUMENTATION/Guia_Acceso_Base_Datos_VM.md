# Guia de acceso a la base de datos PostgreSQL en VM

## Objetivo
Documentar el proceso para:
1. Visualizar la base de datos desde la propia VM con DBeaver.
2. Conectarse desde Windows a la BD de la VM de forma segura (tunel SSH).
3. Evitar exposicion publica innecesaria del puerto 5432.

## Estado actual validado
- Contenedor de BD: `Scafame-db`.
- Motor: PostgreSQL.
- Base: `scafame_db`.
- Usuario: `admin`.
- Clave: `admin1234`.
- DBeaver en VM: conexion funcional.

## Requisitos
- VM Linux con Docker y Docker Compose.
- Proyecto desplegado en la VM.
- DBeaver instalado en la VM.
- (Opcional) OpenSSH Server instalado en la VM para tunel desde Windows.

## 1) Verificar contenedores y puertos en la VM
Ejecutar:

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Interpretacion:
- `Scafame-db   5432/tcp` -> puerto interno del contenedor, NO publico.
- `0.0.0.0:80->80/tcp` en nginx -> puerto web publico.

## 2) Verificar credenciales reales de PostgreSQL
Ejecutar:

```bash
docker exec Scafame-db env | grep -E "POSTGRES_DB|POSTGRES_USER|POSTGRES_PASSWORD"
```

Salida esperada (ejemplo actual):

```text
POSTGRES_DB=scafame_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin1234
```

## 3) Conectar DBeaver desde la VM
Configurar conexion PostgreSQL con:
- Host: `localhost`
- Port: `5432`
- Database: `scafame_db`
- User: `admin`
- Password: `admin1234`
- SSL: `disable` (si el driver lo solicita)

Prueba rapida de consulta:

```sql
SELECT * FROM product LIMIT 20;
```

## 4) (Opcional recomendado) Exponer 5432 solo local a la VM
Si se necesita acceso desde aplicaciones instaladas en la VM (como DBeaver), se recomienda mapear el puerto solo a loopback en el servicio `db` del compose:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

Aplicar cambios:

```bash
docker compose up -d --force-recreate db
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -i db
```

Resultado esperado:

```text
Scafame-db   127.0.0.1:5432->5432/tcp
```

## 5) Habilitar SSH en la VM (para tunel desde Windows)
Instalar y activar:

```bash
sudo apt update
sudo apt install -y openssh-server
sudo systemctl enable --now ssh.socket
sudo systemctl enable --now ssh
sudo systemctl status ssh
```

Notas:
- En Ubuntu puede aparecer `ssh.service inactive (dead)` con `ssh.socket` activo.
- Si el log indica `Server listening on ... port 22`, SSH esta operativo.

## 6) Conectar desde Windows a la BD de la VM (tunel SSH)
En PowerShell de Windows:

```powershell
ssh -N -L 5432:127.0.0.1:5432 administrador@192.168.11.5
```

- Aceptar huella de host en la primera conexion (`yes`).
- Mantener la terminal abierta mientras se use la conexion.

Si el puerto 5432 esta ocupado en Windows:

```powershell
ssh -N -L 15432:127.0.0.1:5432 administrador@192.168.11.5
```

Y conectar desde Windows a `localhost:15432`.

## 7) Conectar DBeaver en Windows usando el tunel
- Host: `localhost`
- Port: `5432` (o `15432` si se uso ese)
- Database: `scafame_db`
- User: `admin`
- Password: `admin1234`

## 8) Troubleshooting rapido
### Error: Connection refused en DBeaver de la VM
Causa comun: DB no mapeada al host de la VM.
Accion: revisar `ports` en `db` y recrear contenedor.

### Error: Connection refused en tunel SSH desde Windows
Causa comun: SSH no activo en VM.
Accion:

```bash
sudo systemctl start ssh
sudo systemctl start ssh.socket
ss -tulpen | grep :22
```

### Error: Password incorrecta SSH
- Verificar usuario real con `whoami`.
- Probar login local: `ssh administrador@localhost`.
- Si falla, resetear clave: `sudo passwd administrador`.

### DBeaver conecta en VM pero no en Windows
- Revisar que el tunel SSH siga abierto.
- Validar puerto local correcto (5432 o 15432).

## 9) Seguridad recomendada
- No publicar `5432:5432` en `0.0.0.0` salvo necesidad puntual.
- Preferir `127.0.0.1:5432:5432` + tunel SSH.
- Usar contrasenas fuertes y rotacion periodica.

## 10) Comandos a evitar para no perder datos
No ejecutar:

```bash
docker compose down -v
docker volume rm <volumen>
```

## 11) Backup previo recomendado
Antes de cambios de infraestructura:

```bash
mkdir -p ~/backups
docker exec Scafame-db pg_dump -U admin -d scafame_db > ~/backups/scafame_db_$(date +%F_%H%M).sql
ls -lh ~/backups
```

## 12) Checklist operativo corto
1. DB arriba y saludable (`docker ps`).
2. Credenciales confirmadas (`docker exec ... env`).
3. DBeaver en VM conectando a localhost:5432.
4. SSH activo en VM para tunel.
5. Tunel abierto en Windows.
6. DBeaver/Backend en Windows conectando por localhost.
