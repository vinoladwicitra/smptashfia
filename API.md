# SMP Tashfia API Documentation

Backend API built with **Hono** running on Cloudflare Workers, connecting to Supabase.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.dev.vars` and update with your Supabase credentials:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key  # Optional, for admin operations
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Deploy to Cloudflare:**
   ```bash
   npm run deploy
   ```

## 📁 Project Structure

```
worker/
├── index.ts              # Main Hono app entry point
├── types.ts              # TypeScript type definitions
├── middleware/
│   ├── cors.ts           # CORS handling middleware
│   └── auth.ts           # Authentication & authorization middleware
├── routes/
│   ├── articles.ts       # Article/blog endpoints
│   ├── ppdb.ts           # PPDB registration endpoints
│   ├── auth.ts           # Authentication endpoints
│   ├── banners.ts        # Banner management endpoints
│   ├── siteSettings.ts   # Site settings endpoints
│   ├── users.ts          # User management endpoints
│   └── googleSheets.ts   # Google Sheets integration endpoints
└── lib/
    └── db.ts             # Database helper functions
```

## 🔌 API Endpoints

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-14T12:00:00.000Z",
  "service": "smptashfia-api"
}
```

---

### Articles

#### List Articles
```
GET /api/articles
```

**Query Parameters:**
- `limit` (number, default: 10, max: 100)
- `offset` (number, default: 0)
- `status` (string: "published", "draft", "archived")
- `category` (string: category slug)
- `tag` (string: tag slug)
- `author` (string: author UUID)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "limit": 10,
    "offset": 0
  }
}
```

#### Get Article by Slug
```
GET /api/articles/:slug
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "...",
    "slug": "...",
    "content": "...",
    "author": {...},
    ...
  }
}
```

#### List Categories
```
GET /api/articles/categories/list
```

#### List Tags
```
GET /api/articles/tags
```

---

### PPDB (Student Registration)

#### Submit Registration (Public)
```
POST /api/ppdb/register
```

**Body:**
```json
{
  "email": "parent@example.com",
  "pemilihan_sekolah": "Tashfia Boarding School",
  "nama_lengkap": "...",
  "nama_panggilan": "...",
  "tempat_lahir": "...",
  "tanggal_lahir": "2010-01-01",
  "alamat": "...",
  "asal_sekolah": "...",
  "alamat_sekolah": "...",
  "no_telp_ortu_1": "...",
  "no_telp_ortu_2": "...",
  "nama_bapak": "...",
  "tempat_lahir_bapak": "...",
  "tanggal_lahir_bapak": "...",
  "pendidikan_bapak": "...",
  "pekerjaan_bapak": "...",
  "nama_ibu": "...",
  "tempat_lahir_ibu": "...",
  "tanggal_lahir_ibu": "...",
  "pendidikan_ibu": "...",
  "pekerjaan_ibu": "...",
  "sumber_info": "...",
  "sumber_info_lainnya": "..."
}
```

#### List Registrations (Staff/Admin/Teacher only)
```
GET /api/ppdb/list
```

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (string: "pending", "reviewed", "accepted", "rejected")
- `sekolah` (string: school name)
- `search` (string: optional, search across name, email, and school)
- `limit` (number, default: 20, max: 100)
- `offset` (number, default: 0)

#### Get Upload URL
```
GET /api/ppdb/upload-url?fileName=document.pdf
```

#### Update Registration Status (Staff/Admin only)
```
PUT /api/ppdb/:id/status
```

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "status": "accepted"
}
```

---

### Authentication

#### Validate Token
```
POST /api/auth/validate
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "...",
    "roles": ["student", "admin"],
    ...
  }
}
```

#### Get User Profile
```
GET /api/auth/profile
```

**Headers:**
- `Authorization: Bearer <token>`

#### Update User Profile
```
PATCH /api/auth/profile
```

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "display_name": "...",
  "avatar_url": "...",
  "phone": "...",
  "bio": "..."
}
```

---

## 🔐 Authentication

The API uses Supabase authentication. Include the user's JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Control

Some endpoints require specific roles:
- **Staff/Admin**: Can view all PPDB registrations, update statuses
- **Teacher**: Can view PPDB registrations
- **Authenticated users**: Can create articles, update own profile
- **Public**: Can view published articles, submit PPDB registrations

---

## 🛠️ Adding New Endpoints

1. **Create route file** in `worker/routes/`:
   ```typescript
   import { Hono } from 'hono';
   import type { Env } from '../types';

   const myRoute = new Hono<{ Bindings: Env }>();

   myRoute.get('/', async (c) => {
     return c.json({ success: true, data: [] });
   });

   export default myRoute;
   ```

2. **Register route** in `worker/index.ts`:
   ```typescript
   import myRoute from './routes/myRoute';
   
   app.route('/api/myroute', myRoute);
   ```

3. **Add middleware** if needed:
   ```typescript
   import { authMiddleware, roleMiddleware } from './middleware/auth';

   myRoute.get('/protected', authMiddleware, roleMiddleware(['admin']), async (c) => {
     // Protected endpoint
   });
   ```

---

## 📝 Environment Variables

Set these in Cloudflare dashboard using `wrangler secrets put` or in `.dev.vars` for local development:

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (for admin operations) | No |

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5173/api/health
```

### List Articles
```bash
curl http://localhost:5173/api/articles?limit=5
```

### Submit PPDB Registration
```bash
curl -X POST http://localhost:5173/api/ppdb/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "pemilihan_sekolah": "Tashfia Boarding School",
    ...
  }'
```

---

## 📚 Technologies

- **Hono** - Lightweight web framework
- **Zod** - TypeScript-first schema validation
- **@hono/zod-validator** - Request validation
- **Cloudflare Workers** - Edge runtime
- **Supabase** - Backend database (PostgreSQL)

---

## 🚦 CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:5173` (development)
- `https://smptashfia.pages.dev` (staging)
- `https://smptashfia.sch.id` (production)
- Any subdomain under `*.smptashfia.sch.id` (e.g., `https://app.smptashfia.sch.id`) — validated by parsing the origin hostname to prevent spoofing.

Update allowed origins in `worker/middleware/cors.ts` if needed.
