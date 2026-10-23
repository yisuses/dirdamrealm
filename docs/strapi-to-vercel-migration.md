# Migración de Strapi (Railway) a un backend propio en Vercel

Estado: **aprobado** · Rama: `feat/vercel-native-backend` · Fecha: 2026-10-22

Referencia de implementación: **`portfolio-blog`** (`~/Projects/mine/portfolio-blog`), que ya funciona en Vercel con Neon y Cloudinary. Este plan reutiliza sus enfoques y librerías, y corrige los fallos que se le han detectado (§11).

## 1. Objetivo

Eliminar Strapi y Railway. La base de datos, la API, el panel de administración, el editor, la búsqueda y los emails pasan a vivir dentro de la app Next.js de `packages/blog`, en Vercel (plan Pro). **Las imágenes siguen en Cloudinary** (plan gratuito), donde ya está toda la biblioteca de tu tío.

El panel **no es una copia del de Strapi**: es uno nuevo, con el aspecto de la web y pensado para que tu tío lo use con comodidad.

Condiciones que no se negocian:

1. **Paridad funcional** con lo que se puede hacer hoy (§3).
2. **Ninguna URL pública cambia**: ids numéricos de entradas, slugs, códigos de categoría, `es` sin prefijo y `/en/`.
3. **Migración de datos sin pérdidas**, verificable y repetible.
4. **Usuarios en nuestra base de datos**, sin formulario de registro.
5. Se mantienen las protecciones de coste (guard del proxy, `revalidate` de un día como red de seguridad, sin escrituras ISR por URLs basura).

## 2. Arquitectura (alineada con portfolio-blog)

| Pieza                       | Hoy                          | Propuesta                                                                                                                                                                                          | Referencia en portfolio-blog                                                        |
| --------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Base de datos               | Postgres en Railway          | **Neon Postgres** (Marketplace, `fra1`) + **Drizzle ORM** + `pg` con `attachDatabasePool` (recomendación oficial de Neon para Vercel Fluid Compute; portfolio-blog usa `@neondatabase/serverless`) | `apps/web/lib/db/index.ts`, `/drizzle.config.ts`                                    |
| Acceso a datos              | REST de Strapi               | **Consultas directas** con una capa de queries por entidad                                                                                                                                         | `apps/web/lib/db/queries/*.ts`                                                      |
| Usuarios y login            | Usuarios de Strapi           | **Auth.js** (`next-auth`) con Credentials + **bcrypt**, sesión JWT, usuarios en nuestra tabla `users`                                                                                              | `apps/web/lib/auth/config.ts`                                                       |
| Protección                  | —                            | En 3 capas: proxy, layout del grupo `(auth)` y comprobación en cada handler                                                                                                                        | `proxy.ts`, `requireAdminSession.ts`, `lib/api/parseRequest.ts`                     |
| Panel                       | Admin de Strapi              | **Panel nuevo en `/admin`**, con el tema de la web (Chakra)                                                                                                                                        | Estructura de `apps/web/app/admin/`                                                 |
| Escrituras del panel        | —                            | Route handlers REST validados con **zod** + **React Query** en el cliente (como portfolio-blog y como ya hace esta web)                                                                            | `app/api/**/route.ts`, `parseAuthRequest`                                           |
| Editor                      | EditorJS (plugin de Strapi)  | **EditorJS**, mismo JSON, con el selector de imágenes propio                                                                                                                                       | Ideas de UX de `PostEditor.tsx` (no su MDX)                                         |
| Imágenes                    | Cloudinary vía Strapi        | **Cloudinary** desde el panel: **subida firmada directa**, listado con la **Search API**, renombrar y borrar; URLs con transformaciones                                                            | `lib/cloudinary/images.ts`, `ImagePicker.tsx`, `libs/blur-up/src/lib/cloudinary.ts` |
| Búsqueda rápida del header  | Algolia (lo alimenta Strapi) | **Postgres** (`unaccent` + `pg_trgm`) sobre título y resumen                                                                                                                                       | `getPublishedPostsPaginated`                                                        |
| Resto de listados y filtros | Postgres vía Strapi          | **Postgres en Neon**, consultado directamente                                                                                                                                                      | `apps/web/lib/db/queries/*.ts`                                                      |
| Emails                      | SendGrid                     | **Resend** + plantillas **React Email**                                                                                                                                                            | `apps/web/lib/email/`                                                               |
| Límite de peticiones        | —                            | **Upstash Redis** (Marketplace) para login y comentarios                                                                                                                                           | `lib/ratelimit/index.ts`                                                            |
| Refresco de páginas         | Webhook de Strapi            | Un único helper **`revalidatePublicContent()`** llamado por cada escritura                                                                                                                         | `lib/cache/revalidatePublicContent.ts`                                              |

**Algolia solo se usa hoy para la búsqueda rápida del header** (`SearchPosts`); el resto de listados, archivo y filtros por categoría ya salen de Postgres a través de Strapi y pasan a Neon sin más. Llevar también esa búsqueda rápida a Postgres simplifica mucho: no hay índice que sincronizar, no hay claves de Algolia (una de ellas estaba en Railway) y siempre está al día. Con un centenar de entradas, una consulta con índice responde en milisegundos, suficiente para buscar mientras se escribe.

### Principio clave: la web pública no se entera

`src/api/**` es hoy la única frontera con Strapi. Se mantienen **las mismas funciones, firmas y tipos de dominio**, implementadas sobre la BD. Componentes y páginas no cambian, salvo la búsqueda (pasa de Algolia a un endpoint propio) y el pie (contacto y redes).

Durante la transición, `DATA_SOURCE=strapi|db` elige la implementación, para comparar ambas URL a URL antes del corte y poder volver atrás.

## 3. Funcionalidad a cubrir

### Lo que pediste explícitamente

| Área                 | Qué tiene que poder hacerse                                                                                                                                                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categorías**       | Crear, editar y mantener: código, nombre en español e inglés, descripción, si sale en el menú principal                                                                                                                                                                |
| **Entradas**         | Crear, editar, publicar, despublicar y borrar, **en español e inglés**, enlazadas entre sí, con salto directo de una versión a la otra (o creación de la que falta)                                                                                                    |
| **Imágenes**         | Panel donde **se listan todas** las de Cloudinary, con búsqueda. **Subida cómoda** (arrastrar y soltar, varias a la vez), **poner y cambiar nombre** y texto alternativo, **borrar**. En el editor de entradas, **varias formas de añadir una imagen al momento** (§5) |
| **Autores**          | Ficha del autor enlazada a su usuario; de momento solo tu tío                                                                                                                                                                                                          |
| **Usuarios**         | En la BD, sin registro: los da de alta un administrador                                                                                                                                                                                                                |
| **Comentarios**      | Como ahora: se publican al momento, sin aprobación. Se pueden **borrar** desde el panel                                                                                                                                                                                |
| **Contacto y redes** | Datos de contacto del pie y redes sociales guardados en la BD y editables. No hay formulario de contacto                                                                                                                                                               |

### Lo que Strapi hace "por debajo" y no se puede perder

- **Email al recibir un comentario**: a la dirección del administrador, asunto `Emoción Blanca: Nuevo comentario de {autor} en "{título}"`, en español, con enlace a `…/post/{id}/{slug}#comment-{id}` (con `en/` solo en inglés).
- **Variantes de imagen** que usa la web (`thumbnail` 245×156, `small` 500, `medium` 750, `large` 1000), ahora generadas con transformaciones de Cloudinary.
- **Vista previa de enlaces** (OpenGraph) para el bloque `LinkTool` del editor.
- **Refresco de la web** al publicar o editar.

### Agujeros de seguridad actuales que **no** se replican

- `POST /api/comments` de Strapi es público: hoy se puede comentar **saltándose el reCAPTCHA**.
- Las rutas de subida del plugin EditorJS no piden autenticación: **cualquiera puede subir archivos a Cloudinary**.
- El nombre del autor del comentario se inserta sin escapar en el HTML del email.

### Bugs y limitaciones actuales que se arreglan de paso

- Strapi corta los listados a **100 filas** (y a **25** sin paginar). El archivo y los sitemaps podrían estar truncados.
- En Strapi 5 el id numérico de una entrada **puede cambiar al republicar**. Con el nuevo modelo es estable.
- El bloque _About_ se pide sin idioma, así que su descripción en inglés nunca se usa.

### Resultados de la fase 0 (2026-10-22)

Copia de seguridad: `pg_dump` completo de `Postgres-prod` (Railway, PostgreSQL 16) en `~/Backups/whemotion/strapi-prod-20261022-1014.dump` (1,9 MB, 53 tablas, sha256 `d5025813…dc15b4`), y la configuración que solo vive en Strapi en `strapi-settings-20261022.json`. Ambos fuera del repo, con permisos `600`.

| Dato                | Valor                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Entradas publicadas | **118** (107 es, 11 en) de 115 documentos y 240 filas (borradores incluidos)                                     |
| Categorías          | 6 (`ENG HIS MAC NEW SPO TRA`); nombres traducidos en `translations` (la columna `locale` está vacía y se ignora) |
| Comentarios         | 328                                                                                                              |
| Archivos            | 822                                                                                                              |
| Autores (`writers`) | 2                                                                                                                |
| Usuarios admin      | 2 (José y Saúl)                                                                                                  |
| Tags y subscribers  | **0 y 0**: no hay nada que copiar                                                                                |
| Idiomas             | `en` (por defecto en Strapi) y `es`                                                                              |
| Webhook             | `revalidate en vercel` → `https://whemotion.com/api/revalidate/`                                                 |

**Confirmado: faltan 7 entradas en la web.** Strapi corta en 100 filas, y hay 107 entradas publicadas en español: el sitemap tiene 111 URLs (100 + 11) en vez de 118. Esas 7 entradas tampoco salen en el archivo ni se generan en el build. La migración lo arregla.

**Agujeros de seguridad encontrados en los permisos (hoy, en producción)**:

- El rol **público** tiene `auth.register`: cualquiera puede registrarse como usuario con `POST /api/auth/local/register`.
- El rol **autenticado** tiene `comment.update` y `comment.delete` sin comprobar quién es el autor: **cualquiera que se registre puede editar o borrar todos los comentarios**.
- El rol público tiene `comment.create`: se puede comentar sin pasar por el reCAPTCHA de la web.
- No hay señales de abuso: un solo usuario registrado, de enero de 2022.
- **Decisión**: no se corrigen en Strapi, que se va a retirar. Desaparecen con el corte.

## 4. Modelo de datos (Drizzle / Postgres)

Sigue el patrón de portfolio-blog: **una tabla con lo común y una tabla de traducciones por idioma** (`(id_padre, locale)` como clave), ids internos ULID y un número propio para las URLs.

La diferencia obligada: en whemotion **cada idioma tiene su propio id en la URL** (`/post/337/…` y `/en/post/338/…`), así que el número público vive en la **traducción**, no en la entrada, y se conservan los actuales.

```
users                 id ulid, email unique, name, password_hash (bcrypt),   -- sin roles: control total
                      active, created_at, updated_at
writers               id ulid, user_id → users (unique, nullable), name unique, twitter, personal_url

posts                 id ulid, writer_id → writers, cover jsonb {publicId, url, width, height, alt},
                      cover_image_author, cover_image_source_url, img_url,
                      created_at, updated_at, deleted_at            -- borrado lógico
post_translations     post_id → posts, locale ('es'|'en'), PK(post_id, locale)
                      number int unique  -- el id público de la URL; se conservan los de Strapi
                      title, summary, content jsonb (EditorJS)
                      status ('draft'|'published'|'archived'), published_at, scheduled_at,
                      draft jsonb        -- cambios guardados sin publicar
                      preview_token unique, updated_at
post_categories       post_id, category_id

categories            id ulid, code unique (^[A-Z]{1,16}$), main bool, created_at, updated_at
category_translations category_id, locale, PK(category_id, locale), name, description

comments              id int (se conservan), post_number → post_translations.number,
                      author, text, created_at
site_contact          id = 1, display bool, name, email
site_contact_translations  locale, description
social_links          id, network, handle, url, position, visible
```

Decisiones:

- **Borrador y publicado en la misma fila** (`draft` jsonb): publicar copia el borrador a las columnas públicas, así el número público no cambia nunca.
- **Estado por idioma**: una entrada puede estar publicada en español y en borrador en inglés, como permite hoy Strapi.
- **Portada e imágenes por `publicId` de Cloudinary**, no por URLs fijas. Las variantes `thumbnail/small/medium/large` se construyen con transformaciones (`c_limit,w_500,f_auto,q_auto`…) con un helper como `cloudinaryTransform` de portfolio-blog. El mapper rellena `Media.formats` con la forma actual, así la web no cambia. Las imágenes migradas también tienen su `public_id`, así que pasan por el mismo camino.
- **Sin tabla de medios**: como en portfolio-blog, **Cloudinary es la fuente de verdad** de la biblioteca (nombre, texto alternativo y etiquetas en el `context` de cada imagen). Así el panel ve también las imágenes que tu tío subió sin pasar por Strapi.
- **Categorías con tabla de traducciones** en vez del JSON `translations` de Strapi.
- **Sin seguimiento por defecto** de lo que portfolio-blog tiene y esta web no (comentarios en hilo, moderación, likes, newsletter).

## 5. El panel (`/admin`)

### Diseño y accesibilidad

- **Mismo aspecto que la web**: tema de Chakra del proyecto (grises `#212529`/`#343A40`/`#495057`, Roboto en títulos, Lora en textos), el logo y el modo claro/oscuro. Se reutilizan componentes de la web.
- **Pensado para tu tío**:
  - Todo en español, con textos claros ("Publicar", "Guardar sin publicar", "Ver en la web").
  - Letra y botones grandes, contraste WCAG 2.2 AA, sin acciones escondidas en iconos sin texto.
  - **Guardado automático** del borrador, con indicador "Guardado hace X segundos" (portfolio-blog no lo tiene; es nuevo).
  - **Confirmación** antes de borrar o despublicar, diciendo exactamente qué va a pasar.
  - **Vista previa** antes de publicar, con un enlace secreto por entrada (`preview_token`), como en portfolio-blog.
  - Navegable con teclado y lector de pantalla; funciona en tablet y móvil.
- **Fuera de buscadores y cachés**: dinámico, `noindex`, bloqueado en `robots.txt`.

### Secciones

| Sección              | Funcionalidad                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inicio**           | Últimas entradas y su estado, últimos comentarios, "Nueva entrada"                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Entradas**         | Listado con filtros (idioma, estado, categoría) y búsqueda. Editor con **pestañas Español / Inglés**: si falta una versión, un botón la crea; si existe, un clic salta a ella. Campos: título, resumen, contenido (EditorJS), portada, autor y fuente de la foto, categorías, autor. Acciones: guardar sin publicar, publicar, **programar para un día** (se publica esa mañana con el cron diario), despublicar, archivar y borrar, vista previa. Aviso si al cambiar el título cambia la URL |
| **Imágenes**         | Ver abajo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Categorías**       | Crear y editar: código (validado y único), nombre y descripción en español e inglés, "aparece en el menú principal". Aviso antes de borrar una categoría con entradas                                                                                                                                                                                                                                                                                                                          |
| **Comentarios**      | Listado (más recientes primero) con su entrada, enlace a la web y **botón de borrar**                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Contacto y redes** | Nombre, email y visibilidad del bloque de contacto; descripción en español e inglés; redes sociales (añadir, editar, ordenar, ocultar)                                                                                                                                                                                                                                                                                                                                                         |
| **Autores**          | Ficha del autor enlazada a su usuario                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Usuarios**         | Alta, desactivar y cambio de contraseña. **Sin roles**: todos los usuarios tienen control total. No deja desactivarte a ti mismo, para no quedarse sin acceso                                                                                                                                                                                                                                                                                                                                  |

### Imágenes

**Panel de imágenes** (adaptado del `ImagePicker` de portfolio-blog):

- **Lista todas las imágenes** de Cloudinary en una cuadrícula con miniaturas, con **búsqueda por nombre** y scroll infinito (Search API de Cloudinary, paginada por cursor).
- **Subir**: arrastrar y soltar o elegir archivos, **varias a la vez**, con barra de progreso por archivo. Se pide nombre y texto alternativo (se sugiere el nombre del archivo).
- **Editar**: cambiar el nombre y el texto alternativo; ver tamaño, dimensiones y en qué entradas se usa. El nombre se guarda en el `context` de la imagen y **no se renombra el `public_id`**: las entradas guardan la URL de cada imagen, que dejaría de funcionar. Una copia del nombre sin tildes permite buscar sin ellas.
- **Borrar**: con confirmación, y **solo si ninguna entrada la usa** (portada, texto o borrador sin publicar); si se usa, el panel lista esas entradas. Se borran también las copias que Strapi hizo de ella (`thumbnail_`, `small_`, `medium_`, `large_`), que la biblioteca no muestra.

**En el editor de entradas**, varias formas de añadir una imagen al momento:

1. **Subir una nueva** desde el propio bloque (botón o arrastrando el archivo sobre el editor).
2. **Elegir una existente** de la biblioteca (el mismo panel, en un modal con búsqueda).
3. **Pegar** una imagen del portapapeles o una URL.
4. **Cambiar o quitar** la imagen de un bloque o la portada sin perder el resto.

**Mejor que portfolio-blog**: allí la subida pasa por la función de Vercel como base64, y choca con el límite de 4,5 MB por petición. Aquí la subida es **directa del navegador a Cloudinary con firma del servidor** (`cloudinary.utils.api_sign_request` tras comprobar la sesión). El secreto nunca sale del servidor y no hay límite de tamaño de Vercel. La configuración de Cloudinary (carpeta, credenciales) está **centralizada en un solo módulo**, no repetida en cada función como en portfolio-blog.

### Editor de contenido

**EditorJS**, con el mismo JSON de hoy (la web lo pinta igual), y **solo con los bloques que la web sabe mostrar**: título, párrafo, lista con niveles, cita, imagen, enlace con vista previa, separador, vídeo incrustado, tabla y código. Así todo lo que tu tío escribe se ve en la web.

De portfolio-blog se toman ideas de UX, no el formato (allí es MDX): pestañas por idioma, pestañas de vista previa (entrada, móvil, tarjeta) y modales para insertar. Se evita su `PostEditor.tsx` de 1.560 líneas: el editor se divide en componentes pequeños.

**Cómo quedó (fase 6):**

- **Nada llega a la web hasta pulsar «Publicar».** El editor guarda solo cada pocos segundos. En una versión publicada, los cambios de texto esperan en `post_translations.draft`; mientras la entrada esté en la web, los de portada, firma y categorías (compartidos por los dos idiomas) esperan en `posts.draft`. «Publicar los cambios» los aplica; «Descartar los cambios» los borra. Si los cambios vuelven a lo publicado, no queda nada pendiente.
- **Vista previa** en `/vista-previa/<número>/<token>/` (y `/en/…`): la página real de la entrada con los cambios aplicados, sin caché, `noindex` y fuera de `robots.txt`.
- **Programar**: un día (no una hora), por fecha de Madrid; el cron de Vercel (`vercel.json`, `0 6 * * *`, con `CRON_SECRET`) publica lo que toque y, si un día falla, lo recupera al siguiente. Lo que no tiene título o resumen se queda programado.
- **Bloques de enlace**: la vista previa la pide `/api/admin/link-preview`, solo para el panel y solo a direcciones públicas (nunca a la red interna).
- **Listas**: solo con puntos o numeradas (sin listas de tareas ni numeraciones especiales, que la web no muestra).
- **Formato antiguo**: al editar una entrada vieja se pierde el formato que la web ya no mostraba (colores, tamaños y `span` pegados desde Word); negritas, cursivas y enlaces se mantienen.
- **Extra: importar un documento de Word** (`.docx`, en el navegador con `mammoth`): añade su texto al final como **párrafos** del blog, con negritas, cursivas y enlaces. Títulos, listas y tablas del documento también entran como párrafos; las imágenes no se importan.

## 6. Login y protección (de portfolio-blog)

- **Auth.js Credentials**: busca el usuario en `users` y compara con **bcrypt**, siempre en tiempo constante (aunque el email no exista). Sesión JWT de 8 horas.
- **Tres capas**:
  1. `proxy.ts` redirige `/admin/*` al login sin sesión, devuelve 401 en escrituras a la API sin sesión y **limita los intentos de login** (Upstash).
  2. El layout del grupo `(auth)` llama a `requireAdminSession()`.
  3. **Cada route handler** vuelve a comprobar con `parseAuthRequest` (sesión + validación zod en una llamada).
- **`withoutSessionRefresh()`**: copiado tal cual. Evita que la sesión se alargue sola y que un cierre de sesión se deshaga.
- **Sin roles**: solo entrarán tu tío y tú, con control total. Si algún día hace falta, se añaden después.
- **Sin registro**: los usuarios se crean desde el panel. El primero, con un **script de alta** (no con una variable de entorno de respaldo como en portfolio-blog).
- **Recuperar contraseña por email** (Resend): no existe en portfolio-blog. Es nuevo, para que tu tío no dependa de ti si la olvida.

## 7. Cambios en la web pública

1. `src/api/**` sobre la BD, con las mismas firmas, detrás de `DATA_SOURCE`.
2. **Lecturas desde el navegador** (últimas por categoría, archivo, categorías, comentarios): route handlers públicos de solo lectura con `Cache-Control: s-maxage=60, stale-while-revalidate`, como en portfolio-blog. React Query se mantiene.
3. **Búsqueda rápida del header**: `SearchPosts` llama a un endpoint propio sobre Postgres en vez de a Algolia, con el mismo debounce de 300 ms y el mismo formato de resultados. La interfaz no cambia.
4. **Comentarios**: `/api/addComment` inserta en la BD con reCAPTCHA obligatorio que **falla cerrado** (sin clave no se publica), límite por IP (Upstash), campo trampa (honeypot), validación de longitud en el servidor y texto plano (sin HTML). Después, email con Resend (React Email, con escape) y refresco de la entrada.
5. **Pie**: contacto y redes desde la BD.
6. **Revalidación**: `revalidatePublicContent()` reúne lo que hoy hace `/api/revalidate` (rutas afectadas y precalentado) y lo llama cada escritura del panel. El webhook se elimina tras el corte.
7. `next.config.js`: fuera `API_URL` y las variables de Algolia. `res.cloudinary.com` ya está permitido.
8. **Sin cambios**: `proxy.ts` y su guard, `revalidate = 86400`, `trailingSlash`, sitemaps, i18n.

## 8. Migración de datos

Script idempotente (`scripts/migrate-from-strapi.ts`) que lee **directamente la BD Postgres de Strapi** y escribe en una rama de Neon. Se repite cuantas veces haga falta.

1. **Copia de seguridad**: `pg_dump` completo de Railway, guardado fuera de Railway.
2. **Exportar como referencia** lo que solo vive en la BD de Strapi: permisos públicos, webhooks, idiomas, ajustes de subida.
3. **Usuarios**: `admin_users` de Strapi → `users`. Strapi guarda las contraseñas con **bcrypt**, el mismo algoritmo que usa portfolio-blog, así que **el hash se copia tal cual y tu tío entra con su contraseña de siempre**. Su usuario se enlaza con su ficha de autor.
4. **Entradas**: en Strapi 5 los idiomas y las versiones borrador/publicada comparten `document_id`.
   - Cada `document_id` → una fila en `posts`.
   - Cada fila **publicada** de un idioma → `post_translations` con **`number` = su id actual** (el de las URLs).
   - Si hay un borrador más reciente → `draft`.
   - Documentos solo en borrador → traducciones en estado `draft` con número nuevo.
   - `content` → `jsonb`, validando que parsea, con un **informe de los tipos de bloque usados**: si aparece alguno que la web no muestra, se añade a la web antes del corte.
5. **Imágenes**: **no se mueven**. Portadas y bloques de imagen se convierten a `publicId` a partir del `provider_metadata` de Strapi (o de la propia URL). El nombre y texto alternativo de la tabla `files` se pasan al `context` de cada imagen en Cloudinary.
6. **Categorías** (con su JSON `translations` → `category_translations`), **autores**, **comentarios** (conservando ids) y **About** (→ `site_contact` + `social_links`).
7. **Verificación automática**:
   - Recuentos por tabla e idioma, Strapi frente a Neon.
   - **Recorrer todas las URLs del sitemap con `DATA_SOURCE=strapi` y con `DATA_SOURCE=db`** y comparar el HTML y el JSON-LD.
   - Comprobar que todas las imágenes responden 200.

**Migraciones de esquema**: solo `drizzle-kit generate` + `migrate`, con el journal y los snapshots en git. En portfolio-blog el journal está desincronizado (faltan migraciones aplicadas a mano), así que no se usa `db:push` contra producción.

## 9. Fases

**Todo el trabajo va en la rama `feat/vercel-native-backend`**, con al menos un commit por fase y **una sola PR al final**. Cada fase deja los tests al 100% de cobertura (con el `makeChain` de portfolio-blog para simular la BD) y la rama desplegable en un preview. Hasta la fase 8 **producción sigue usando Strapi**.

| #   | Fase                    | Contenido                                                                                                                                                                                                                                                                                                        | Esfuerzo orientativo  |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 0   | **Preparación**         | `pg_dump` de Railway. Exportar permisos y webhooks. Rotar las credenciales pendientes del incidente                                                                                                                                                                                                              | 0,5 día               |
| 1   | **Infraestructura**     | Neon, Upstash y Resend vía Marketplace; credenciales nuevas de Cloudinary. Cliente Drizzle diferido, esquema, migraciones, ramas de Neon para preview                                                                                                                                                            | 1–2 días              |
| 2   | **Migración de datos**  | Script (usuarios incluidos), ejecución contra una rama de Neon, informe de verificación                                                                                                                                                                                                                          | 2–3 días              |
| 3   | **Lectura desde la BD** | `src/api/**` sobre Neon detrás de `DATA_SOURCE`; endpoints públicos; búsqueda en Postgres; comparación de todo el sitemap                                                                                                                                                                                        | 2–3 días              |
| 4   | **Panel: base**         | Login, sesiones y protección en 3 capas, recuperar contraseña, layout con el tema de la web, usuarios, autores, categorías, contacto y redes                                                                                                                                                                     | 3–4 días              |
| 5   | **Panel: imágenes**     | Biblioteca (listar, buscar, subir firmado, renombrar, borrar con aviso de uso)                                                                                                                                                                                                                                   | 2–3 días              |
| 6   | **Panel: entradas**     | Editor EditorJS, pestañas es/en, borrador y guardado automático, publicar, programar (cron diario), vista previa, imágenes en el editor, revalidación                                                                                                                                                            | 4–6 días              |
| 7   | **Comentarios**         | Escritura en la BD con sus protecciones, email con Resend, borrado en el panel                                                                                                                                                                                                                                   | 1–2 días              |
| 8   | **Pruebas con tu tío**  | Panel en un preview con una rama de Neon, con contenido real; ajustes de usabilidad                                                                                                                                                                                                                              | 2–5 días (calendario) |
| 9   | **Corte**               | Congelar ediciones en Strapi, migración final, `DATA_SOURCE=db` en producción, verificación                                                                                                                                                                                                                      | 0,5 día               |
| 10  | **Retirada**            | Tras 2–4 semanas estables: borrar `packages/api`, Dockerfiles, `/api/revalidate`, `DATA_SOURCE` y la integración de Algolia; dar de baja Railway, SendGrid y Algolia (Cloudinary se queda). **DNS (Squarespace)**: borrar `api` (CNAME a Railway) y los de SendGrid (`em5390`, `s1._domainkey`, `s2._domainkey`) | 0,5 día               |

Total orientativo: **3–5 semanas** a ritmo de proyecto personal.

**Plan de vuelta atrás**: hasta la fase 10, volver a `DATA_SOURCE=strapi` deja la web como estaba. Lo creado entretanto en el panel nuevo habría que pasarlo a mano, por eso el corte va con ediciones congeladas y la vuelta atrás es solo para los primeros días.

## 10. Decisiones

### Ya decididas

| Tema                    | Decisión                                                                                                                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Imágenes                | **Cloudinary**, con biblioteca y subida propias en el panel                                                                                                                                                           |
| Panel                   | **Nuevo**, con el aspecto de la web y accesible                                                                                                                                                                       |
| Usuarios                | **En la BD**, sin registro y **sin roles** (control total para tu tío y para ti), con Auth.js + bcrypt                                                                                                                |
| Strapi hasta el corte   | **No se toca.** Los agujeros de permisos de la fase 0 se quedan abiertos hasta retirarlo (riesgo aceptado)                                                                                                            |
| Autores                 | Ficha enlazada a su usuario; de momento solo tu tío                                                                                                                                                                   |
| Comentarios             | Sin aprobación; **se pueden borrar** desde el panel                                                                                                                                                                   |
| Contacto y redes        | **En la BD**, editables desde el panel; sin formulario de contacto                                                                                                                                                    |
| Entradas en dos idiomas | Traducciones enlazadas, con salto directo entre ellas                                                                                                                                                                 |
| Enfoque técnico         | El de **portfolio-blog**, con las correcciones de §11                                                                                                                                                                 |
| Tags y subscribers      | Copia en JSON; **no** se recrean                                                                                                                                                                                      |
| Traducciones            | Las hace tu tío a mano; **sin** traducción con IA                                                                                                                                                                     |
| Búsqueda                | **Se quita Algolia.** La búsqueda rápida del header pasa a Postgres (`unaccent` + `pg_trgm`), como el resto de búsquedas                                                                                              |
| Editor                  | **Solo los bloques que la web sabe mostrar**. Si el informe de la migración encuentra otros en entradas actuales, se añaden a la web antes del corte                                                                  |
| Programar publicación   | **Sí**, con un **cron diario** (Vercel Cron, `0 6 * * *` UTC: 7:00 u 8:00 en Madrid según el horario) para gastar lo mínimo. En el panel se elige **un día**, no una hora, y se explica que sale publicada esa mañana |

## 11. Lecciones de portfolio-blog

| En portfolio-blog                                            | Aquí                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| Subida de imágenes a través de la función (límite de 4,5 MB) | Subida directa y firmada a Cloudinary                        |
| Configuración de Cloudinary repetida en cada función         | Un único módulo                                              |
| Admin de respaldo en variables de entorno                    | Script de alta                                               |
| Turnstile falla abierto sin clave                            | reCAPTCHA falla cerrado                                      |
| Limpieza de HTML de comentarios con regex                    | Texto plano                                                  |
| Journal de migraciones desincronizado                        | Solo `generate` + `migrate`, todo en git                     |
| No todas las rutas protegidas están en el proxy              | Las tres capas en todas las rutas, con test que lo comprueba |
| `PostEditor.tsx` de 1.560 líneas                             | Editor dividido en componentes                               |
| Sin guardado automático ni recuperación de contraseña        | Ambos incluidos                                              |

## 12. Riesgos

| Riesgo                                 | Mitigación                                                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Cambiar ids o slugs rompe URLs y SEO   | Números públicos conservados; comparación automática de todo el sitemap antes del corte                    |
| El panel no le resulta cómodo a tu tío | Fase 8 con contenido real antes del corte                                                                  |
| Seguridad del login propio             | Auth.js (mantenido, no hecho a mano), bcrypt, límite de intentos, tres capas de comprobación, sin registro |
| Superar el plan gratuito de Cloudinary | Pocas variantes fijas cacheadas; `next/image` sigue optimizando en Vercel; vigilar el uso tras el corte    |
| Secretos expuestos                     | Cloudinary solo en el servidor; rotar ya los que estaban en Railway                                        |
| Coste: escrituras ISR o transferencia  | Panel dinámico; guard del proxy intacto; revalidación dirigida                                             |
| Que un preview edite producción        | Rama de Neon por entorno; `DATABASE_URL` distinta en Preview                                               |
| Consultas a la BD durante el build     | Cliente diferido (`getDb()`, no se crea al importar), como en portfolio-blog pero sin el `Proxy`           |
