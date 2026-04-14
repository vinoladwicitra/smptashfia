import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getPPDBRegistrations } from '../lib/db';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const ppdb = new Hono<{ Bindings: Env; Variables: { userToken: string } }>();

// Validation schemas
const ppdbRegistrationSchema = z.object({
  email: z.string().email(),
  bukti_transfer_url: z.string().optional(),
  pemilihan_sekolah: z.enum(['Tashfia Boarding School', 'Tashfia Full Day School']),

  // Calon Siswi
  nama_lengkap: z.string().min(1),
  nama_panggilan: z.string().min(1),
  tempat_lahir: z.string().min(1),
  tanggal_lahir: z.string(), // YYYY-MM-DD format
  alamat: z.string().min(1),
  asal_sekolah: z.string().min(1),
  alamat_sekolah: z.string().min(1),
  no_telp_ortu_1: z.string().min(1),
  no_telp_ortu_2: z.string().min(1),

  // Data Bapak
  nama_bapak: z.string().min(1),
  tempat_lahir_bapak: z.string().min(1),
  tanggal_lahir_bapak: z.string(),
  pendidikan_bapak: z.string().min(1),
  pekerjaan_bapak: z.string().min(1),

  // Data Ibu
  nama_ibu: z.string().min(1),
  tempat_lahir_ibu: z.string().min(1),
  tanggal_lahir_ibu: z.string(),
  pendidikan_ibu: z.string().min(1),
  pekerjaan_ibu: z.string().optional().nullable(),

  // Info
  sumber_info: z.string().min(1),
  sumber_info_lainnya: z.string().optional().nullable(),
});

const ppdbQuerySchema = z.object({
  status: z.string().optional(),
  sekolah: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// POST /api/ppdb/register - Public registration
ppdb.post('/register', zValidator('json', ppdbRegistrationSchema), async (c) => {
  const data = c.req.valid('json');

  try {
    // Use service key for public registration to bypass RLS issues
    const response = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/ppdb_registrations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create PPDB registration: ${response.status} ${errText}`);
    }

    const result = await response.json();

    return c.json({
      success: true,
      message: 'Registration submitted successfully',
      data: result,
    }, 201);
  } catch (error) {
    console.error('PPDB registration error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
    }, 500);
  }
});

// GET /api/ppdb/list - Staff/Admin only
ppdb.get(
  '/list',
  authMiddleware,
  roleMiddleware(['staff', 'admin', 'teacher']),
  zValidator('query', ppdbQuerySchema),
  async (c) => {
    const { limit, offset, status, sekolah, search } = c.req.valid('query');

    try {
      const registrations = await getPPDBRegistrations(
        c.env.SUPABASE_URL,
        c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY,
        {
          status,
          sekolah,
          limit,
          offset,
        }
      );

      // Apply server-side search filter
      let filtered = registrations as Array<Record<string, unknown>>;
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter((r) =>
          (r.nama_lengkap as string)?.toLowerCase().includes(s) ||
          (r.email as string)?.toLowerCase().includes(s) ||
          (r.asal_sekolah as string)?.toLowerCase().includes(s)
        );
      }

      return c.json({
        success: true,
        data: filtered,
        pagination: {
          limit,
          offset,
          total: filtered.length,
        },
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to fetch registrations',
      }, 500);
    }
  }
);

// GET /api/ppdb/upload-url - Get presigned upload URL for PPDB documents
ppdb.get('/upload-url', async (c) => {
  const fileName = c.req.query('fileName');
  
  if (!fileName) {
    return c.json({
      success: false,
      error: 'fileName query parameter is required',
    }, 400);
  }

  try {
    const timestamp = Date.now();
    // Sanitize fileName: remove path separators, special chars, and encode
    const sanitizedFileName = encodeURIComponent(fileName.replace(/[/\\?%*:|"<>]/g, '-'));
    const storageKey = `${timestamp}-${sanitizedFileName}`;
    const uploadUrl = `${c.env.SUPABASE_URL}/storage/v1/object/ppdb-documents/${storageKey}`;

    return c.json({
      success: true,
      data: {
        uploadUrl,
        publicUrl: `${c.env.SUPABASE_URL}/storage/v1/object/public/ppdb-documents/${storageKey}`,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to generate upload URL',
    }, 500);
  }
});

// GET /api/ppdb/:id - Get single registration detail (Staff/Admin only)
ppdb.get(
  '/:id',
  authMiddleware,
  roleMiddleware(['staff', 'admin', 'teacher']),
  async (c) => {
    const id = c.req.param('id');

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return c.json({ success: false, error: 'Invalid ID format' }, 400);
    }

    try {
      const url = new URL(`${c.env.SUPABASE_URL}/rest/v1/ppdb_registrations`);
      url.searchParams.set('id', `eq.${id}`);
      url.searchParams.set('select', '*');

      const response = await fetch(url.toString(), {
        headers: {
          'apikey': c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY || c.env.SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch registration: ${response.statusText}`);
      }

      const data = await response.json() as Array<Record<string, unknown>>;

      if (data.length === 0) {
        return c.json({ success: false, error: 'Registration not found' }, 404);
      }

      return c.json({ success: true, data: data[0] });
    } catch (error) {
      return c.json({ success: false, error: 'Failed to fetch registration' }, 500);
    }
  }
);

// PUT /api/ppdb/:id/status - Update registration status (Staff/Admin only)
ppdb.put(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  zValidator('json', z.object({
    status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
  })),
  async (c) => {
    const id = c.req.param('id');
    const { status } = c.req.valid('json');

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return c.json({ success: false, error: 'Invalid ID format' }, 400);
    }

    try {
      const userToken = c.get('userToken');
      const url = new URL(`${c.env.SUPABASE_URL}/rest/v1/ppdb_registrations`);
      url.searchParams.set('id', `eq.${id}`);

      const response = await fetch(url.toString(), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': c.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${userToken}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }

      const result = await response.json();

      return c.json({
        success: true,
        message: 'Status updated successfully',
        data: result,
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to update status',
      }, 500);
    }
  }
);

export default ppdb;
