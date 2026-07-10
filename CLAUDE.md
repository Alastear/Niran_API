# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start with nodemon (auto-reload on changes)
npm start            # Start production server
npm run db:push      # Push Drizzle schema to Neon (create/sync tables)
npm run db:generate  # Generate SQL migration files from the schema
npm run db:studio    # Open Drizzle Studio
npm run seed         # Create the first ADMIN user (SEED_ADMIN_USER / SEED_ADMIN_PASS)
```

No test, lint, or build scripts are configured.

## Architecture

Express.js REST API following MVC pattern, backed by Neon (serverless Postgres) via Drizzle ORM.

```
Client → Routes → Middleware (JWT auth) → Controllers → Drizzle ORM → Neon Postgres
                                        → Vercel Blob (images via Multer + Sharp)
```

**Three route groups mounted in [index.js](index.js):**
- `/api/store` — public read-only car/brand/model browsing ([Routes/Car_Store.route.js](Routes/Car_Store.route.js))
- `/api/user` — login and token refresh ([Routes/User.route.js](Routes/User.route.js))
- `/api/admin` — protected CRUD for all entities ([Routes/Admin.route.js](Routes/Admin.route.js))

## Authentication

Two-token JWT system:
- **Access token** (7 days) — sent as `x-access-token` header or `Authorization`; verified in [middleware/auth.js](middleware/auth.js)
- **Refresh token** (30 days) — exchanged at `POST /api/user/refresh/token` via [middleware/auth_refreshToken.js](middleware/auth_refreshToken.js)
- Admin-only routes additionally check `user_position === "ADMIN"` in [middleware/authAdmin.js](middleware/authAdmin.js)

The first admin must be created with `npm run seed` (the `/api/admin/register` route is itself admin-protected).

## Database (Neon + Drizzle)

- Schema is defined in [database/schema.js](database/schema.js) and the Drizzle client in [database/db.js](database/db.js) using the `@neondatabase/serverless` HTTP driver (`drizzle-orm/neon-http`). The driver is stateless HTTP — no connection pooling/caching middleware is needed.
- Drizzle Kit config lives in [drizzle.config.js](drizzle.config.js). Run `npm run db:push` to create tables in Neon.
- **Primary keys:** every table uses a Postgres `serial` column named `id` in the DB, but it is exposed in JS/JSON as `_id` (see the `_id: serial('id')` mapping in the schema) so API responses keep the same shape as the old Mongo `_id`. Route params are integer ids (`Number(req.params.id)`), not ObjectId strings.
- **Flexible fields** are stored as `jsonb`: `car_store.cars_detail`, `car_store.cars_image`, `car_store.cars_subdetail`, `master_model.model_submodel`, `master_model.model_image`. Controllers `JSON.parse` these from multipart form fields before inserting.

## Data Models

| Table | Schema | Notes |
|-------|--------|-------|
| `users` | [database/schema.js](database/schema.js) | `position`: `"ADMIN"` or `""` |
| `car_store` | [database/schema.js](database/schema.js) | `brand_name`/`model_name` denormalized strings; `cars_image[]` (jsonb) holds Blob URLs |
| `master_brand` | [database/schema.js](database/schema.js) | Brand name + logo image |
| `master_model` | [database/schema.js](database/schema.js) | `model_submodel[]` (jsonb) |
| `car_data_detail` | [database/schema.js](database/schema.js) | Spec sheet |

## Image Upload Flow

Admin routes that handle images use this pipeline:
1. **Multer** (`storage: memoryStorage()`) buffers the file in memory
2. **Sharp** resizes to 1980×1080 JPEG
3. **Vercel Blob** (`put()`) uploads with `access: 'public'`
4. The returned `blob.url` (full URL) is stored directly in Postgres

Path format inside Blob store: `Category/Default/{random}.{ext}` for default image, `Category/{carId}/{random}.{ext}` for gallery, `Category/Brand/{random}` for brand logo.

**Important:** `cars_image_default`, `cars_image[]`, and `brand_image` fields store **full Vercel Blob URLs** — frontend uses these values directly as image `src` without constructing URLs.

The upload logic lives in [Controllers/CarStore.Controller.js](Controllers/CarStore.Controller.js) and [Controllers/MasterData.Controller.js](Controllers/MasterData.Controller.js).

## Video Upload Flow (different from images)

Vercel Functions cap request bodies at ~4.5MB, so videos cannot go through the multer→`put()` path used for images. Videos use Vercel Blob **client upload**:

1. Browser calls `upload()` from `@vercel/blob/client` (Dashboard `FormEditVideo.js`)
2. It POSTs to `/api/upload/car-video/token`, which mints a short-lived client token ([Controllers/CarVideo.Controller.js](Controllers/CarVideo.Controller.js))
3. The file streams **browser → Blob directly**, never passing through this API
4. The browser then POSTs the resulting URL to `/api/admin/update/cars/video/:id`, persisting it in `car_store.cars_video` — a jsonb array of `{url, name, size, uploadedAt}`

`/api/upload` is mounted **outside** the `auth` middleware in [index.js](index.js) because the Blob client SDK cannot send custom headers. The access token travels inside `clientPayload`; the route verifies it via `resolveUserFromToken()` ([middleware/auth.js](middleware/auth.js)) and requires `cars.edit`.

Blob's `onUploadCompleted` callback is deliberately unused — it only fires against a public URL, so it never runs on localhost. The explicit attach call in step 4 replaces it.

Limits (200MB/file; `video/mp4`, `video/quicktime`, `video/webm`) are enforced server-side in `onBeforeGenerateToken` and mirrored in the Dashboard only for a friendlier error.

Blob path format: `Category/{carId}/video/{name}-{random}.{ext}`. `attach_car_video` rejects any URL not under that car's own video path.

## Vercel Deployment

Configured for Vercel serverless via [vercel.json](vercel.json). Key patterns:
- The Neon HTTP driver is stateless, so there is no connection to cache across warm instances — queries just work per-invocation.
- `app.listen` only runs locally (`require.main === module`); Vercel uses the exported `app`
- Swagger UI available at `/api-docs`
- After provisioning Neon (Vercel Marketplace), `DATABASE_URL` is auto-injected. Run `npm run db:push` once (locally, pointed at the same `DATABASE_URL`) to create the tables.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (local only) |
| `DATABASE_URL` | Neon Postgres connection string (pooled) |
| `TOKEN_KEY` | JWT signing secret |
| `REFRESH_TOKEN_KEY` | Refresh token signing secret |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (auto-injected by Vercel after creating Blob store) |
| `SEED_ADMIN_USER` / `SEED_ADMIN_PASS` | Optional — credentials for `npm run seed` |
