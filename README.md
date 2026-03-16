# Tantauco AI Bootcamp — Guía de despliegue en Vercel

## Stack
- **Next.js 14** (App Router)
- **Vercel KV** (Redis) — persistencia de datos
- **Nodemailer + iCal** — invitaciones de calendario por email

---

## Paso 1 — Subir a GitHub

```bash
cd tantauco-bootcamp
git init
git add .
git commit -m "Initial commit"
# Crea un repo en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/tantauco-bootcamp.git
git push -u origin main
```

---

## Paso 2 — Crear proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa el repositorio de GitHub
3. Vercel detectará Next.js automáticamente → clic en **Deploy**

---

## Paso 3 — Crear base de datos KV

1. En el dashboard de Vercel → **Storage** → **Create Database** → **KV**
2. Nómbrala `bootcamp-kv`
3. Clic en **Connect to Project** y selecciona tu proyecto
4. Vercel agrega automáticamente las variables `KV_*` a tu proyecto

---

## Paso 4 — Configurar variables de entorno

En Vercel → tu proyecto → **Settings** → **Environment Variables**, agrega:

| Variable | Valor |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `tu_email@gmail.com` |
| `SMTP_PASS` | Tu App Password de Gmail* |
| `ADMIN_SECRET` | Una contraseña segura |
| `NEXT_PUBLIC_ADMIN_SECRET` | La misma contraseña |

> **Gmail App Password:** Ve a [myaccount.google.com](https://myaccount.google.com) → Seguridad → Verificación en dos pasos → Contraseñas de aplicaciones → Genera una para "Correo".

---

## Paso 5 — Redesplegar

Después de agregar las variables, ve a **Deployments** → clic en los tres puntos del último deploy → **Redeploy**.

---

## Uso del panel admin

1. En la web, clic en **Panel Admin** (esquina superior derecha)
2. Ingresa la contraseña que definiste en `ADMIN_SECRET`
3. Desde ahí puedes:
   - Ver inscritos por sesión
   - Editar nombre, fecha y horario de cada sesión
   - Eliminar asistentes
   - Agregar nuevas sesiones

---

## Desarrollo local

```bash
npm install
# Copia y completa el archivo de variables
cp .env.example .env.local
# Inicia el servidor
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

> Para KV local, puedes usar `@vercel/kv` con un Redis local o simplemente comentar las llamadas a KV y usar un array en memoria durante desarrollo.
