# 🚀 Quick Start Guide - SMP Tashfia API

## Setup in 5 Minutes

### 1. Install Dependencies (if not already done)

```bash
npm install
```

### 2. Configure Environment Variables

**For Local Development:**
Create `.env` file:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**For Frontend:**
The same `.env` file is used for both frontend and backend (configured via `wrangler.jsonc`).

Then update with your actual Supabase credentials.

### 3. Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### 4. Test the API

**Health Check:**

```bash
curl http://localhost:5173/api/health
```

**List Articles:**

```bash
curl http://localhost:5173/api/articles
```

### 5. Deploy to Production

**Set secrets in Cloudflare:**

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
```

**Deploy:**

```bash
npm run deploy
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Deploy to Cloudflare |
| `npm run lint` | Run ESLint |

---

## API Endpoints Overview

### Public Endpoints (No Auth Required)

- `GET /api/health` - Health check
- `GET /api/articles` - List published articles
- `GET /api/articles/:slug` - Get article by slug
- `GET /api/articles/categories/list` - List categories
- `GET /api/articles/tags` - List tags
- `POST /api/ppdb/register` - Submit PPDB registration

### Protected Endpoints (Auth Required)

- `POST /api/auth/validate` - Validate token
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update profile
- `GET /api/ppdb/list` - List registrations (staff/admin/teacher)
- `PUT /api/ppdb/:id/status` - Update registration status (staff/admin)

---

## Project Structure

```text
smptashfia/
├── worker/                 # Backend API (Hono)
│   ├── index.ts           # Main entry point
│   ├── types.ts           # TypeScript types
│   ├── middleware/        # Hono middleware
│   │   ├── cors.ts       # CORS handling
│   │   └── auth.ts       # Auth validation
│   ├── routes/           # API routes
│   │   ├── articles.ts   # Article endpoints
│   │   ├── ppdb.ts       # PPDB endpoints
│   │   └── auth.ts       # Auth endpoints
│   ├── lib/              # Utilities
│   │   └── db.ts         # Database helpers
│   └── examples/         # Usage examples
│       └── apiUsage.ts.example   # Frontend integration examples
├── src/                  # Frontend (React)
│   ├── components/       # React components
│   └── lib/              # Frontend utilities
├── .env                  # Environment vars (frontend + backend via wrangler.jsonc)
└── wrangler.jsonc        # Cloudflare config (env_file: ".env")
```

---

## Adding New Endpoints

### Step 1: Create Route File

Create `worker/routes/myEndpoint.ts`:

```typescript
import { Hono } from 'hono';
import type { Env } from '../types';

const myEndpoint = new Hono<{ Bindings: Env }>();

myEndpoint.get('/', async (c) => {
  return c.json({
    success: true,
    data: 'Hello World!'
  });
});

export default myEndpoint;
```

### Step 2: Register Route

Add to `worker/index.ts`:

```typescript
import myEndpoint from './routes/myEndpoint';

app.route('/api/myendpoint', myEndpoint);
```

### Step 3: Test

```bash
curl http://localhost:5173/api/myendpoint
```

---

## Need Help?

- **Full API Documentation:** See `API.md`
- **Usage Examples:** See `worker/examples/apiUsage.ts.example`
- **Cloudflare Docs:** https://developers.cloudflare.com/workers/
- **Hono Docs:** https://hono.dev/docs/

---

## Common Issues

### "Missing Supabase environment variables"

Make sure `.env` exists with valid Supabase credentials.

### CORS errors in browser

Check that your origin is allowed in `worker/middleware/cors.ts`.

### 401 Unauthorized

Make sure you're sending a valid Bearer token in the `Authorization` header.

### Build fails

Run `npm install` to ensure all dependencies are installed.
