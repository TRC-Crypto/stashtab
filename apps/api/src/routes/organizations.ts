/**
 * Organization Management Routes
 *
 * CRUD operations for organizations (white-label tenants)
 */

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { AuthenticationError, ErrorCode, ValidationError } from '../errors';
import { getOrganization } from '../middleware/apiKeyAuth';
import type { Env } from '../types';

const organizationRoutes = new Hono<{ Bindings: Env }>();

// ============================================================================
// Schemas
// ============================================================================

const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
});

const UpdateOrganizationSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    branding: z
      .object({
        logo_url: z.string().url().optional(),
        primary_color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .optional(),
        secondary_color: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/)
          .optional(),
        domain: z.string().optional(),
      })
      .optional(),
  })
  .partial();

const UpdateSettingsSchema = z
  .object({
    chain_id: z.number().int().positive().optional(),
    rpc_url: z.string().url().optional(),
    enabled_features: z
      .object({
        yield: z.boolean().optional(),
        payments: z.boolean().optional(),
        fiat: z.boolean().optional(),
      })
      .optional(),
    webhook_url: z.string().url().optional(),
  })
  .partial();

// ============================================================================
// Helper: Generate API Key
// ============================================================================

function generateApiKey(): string {
  // Generate a secure random API key
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 64; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /organizations
 * Create a new organization
 *
 * Note: In production, this would require admin authentication
 * For now, we'll allow anyone to create organizations (for testing)
 */
organizationRoutes.post(
  '/',
  zValidator('json', CreateOrganizationSchema, (result, _c) => {
    if (!result.success) {
      throw new ValidationError('Invalid request body', {
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
  }),
  async (c) => {
    const body = c.req.valid('json');
    const now = Date.now();

    // Check if slug already exists
    const existing = await c.env.DB.prepare('SELECT id FROM organizations WHERE slug = ?')
      .bind(body.slug)
      .first();

    if (existing) {
      throw new ValidationError('Organization slug already exists', {
        issues: [{ path: 'slug', message: 'Slug must be unique' }],
      });
    }

    // Generate API key
    const apiKey = generateApiKey();
    const orgId = crypto.randomUUID();

    // Create organization
    await c.env.DB.prepare(
      `INSERT INTO organizations (id, name, slug, api_key, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(orgId, body.name, body.slug, apiKey, now, now)
      .run();

    // Create default settings
    await c.env.DB.prepare(
      `INSERT INTO organization_settings (organization_id, chain_id, enabled_features, created_at)
       VALUES (?, ?, ?, ?)`
    )
      .bind(orgId, 8453, JSON.stringify({ yield: true, payments: true, fiat: false }), now)
      .run();

    return c.json(
      {
        id: orgId,
        name: body.name,
        slug: body.slug,
        api_key: apiKey, // Only returned on creation
        created_at: now,
      },
      201
    );
  }
);

/**
 * GET /organizations/me
 * Get current organization (from API key context)
 */
organizationRoutes.get('/me', async (c) => {
  // Note: In production, apply apiKeyAuth middleware at route level
  // For now, we'll check manually
  const org = c.get('organization');
  if (!org) {
    throw new AuthenticationError('API key required', ErrorCode.AUTH_MISSING_TOKEN);
  }

  // Get settings
  const settingsResult = await c.env.DB.prepare(
    'SELECT * FROM organization_settings WHERE organization_id = ?'
  )
    .bind(org.id)
    .first();

  const settings = settingsResult as any;

  return c.json({
    ...org,
    settings: settings
      ? {
          chain_id: settings.chain_id,
          rpc_url: settings.rpc_url,
          enabled_features:
            typeof settings.enabled_features === 'string'
              ? JSON.parse(settings.enabled_features)
              : settings.enabled_features,
          webhook_url: settings.webhook_url,
        }
      : null,
  });
});

/**
 * PATCH /organizations/me
 * Update current organization
 */
organizationRoutes.patch(
  '/me',
  zValidator('json', UpdateOrganizationSchema, (result, _c) => {
    if (!result.success) {
      throw new ValidationError('Invalid request body', {
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
  }),
  async (c) => {
    const org = getOrganization(c);
    const body = c.req.valid('json');
    const now = Date.now();

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];

    if (body.name) {
      updates.push('name = ?');
      values.push(body.name);
    }

    if (body.branding) {
      updates.push('branding = ?');
      values.push(JSON.stringify(body.branding));
    }

    if (updates.length === 0) {
      return c.json(org);
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(org.id);

    await c.env.DB.prepare(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    // Fetch updated organization
    const updated = await c.env.DB.prepare('SELECT * FROM organizations WHERE id = ?')
      .bind(org.id)
      .first();

    return c.json(updated);
  }
);

/**
 * PATCH /organizations/me/settings
 * Update organization settings
 */
organizationRoutes.patch(
  '/me/settings',
  zValidator('json', UpdateSettingsSchema, (result, _c) => {
    if (!result.success) {
      throw new ValidationError('Invalid request body', {
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
  }),
  async (c) => {
    const org = getOrganization(c);
    const body = c.req.valid('json');

    // Check if settings exist
    const existing = await c.env.DB.prepare(
      'SELECT * FROM organization_settings WHERE organization_id = ?'
    )
      .bind(org.id)
      .first();

    if (!existing) {
      // Create settings
      await c.env.DB.prepare(
        `INSERT INTO organization_settings (organization_id, chain_id, rpc_url, enabled_features, webhook_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(
          org.id,
          body.chain_id || 8453,
          body.rpc_url || null,
          body.enabled_features ? JSON.stringify(body.enabled_features) : null,
          body.webhook_url || null,
          Date.now()
        )
        .run();
    } else {
      // Update settings
      const updates: string[] = [];
      const values: any[] = [];

      if (body.chain_id !== undefined) {
        updates.push('chain_id = ?');
        values.push(body.chain_id);
      }

      if (body.rpc_url !== undefined) {
        updates.push('rpc_url = ?');
        values.push(body.rpc_url);
      }

      if (body.enabled_features !== undefined) {
        updates.push('enabled_features = ?');
        values.push(JSON.stringify(body.enabled_features));
      }

      if (body.webhook_url !== undefined) {
        updates.push('webhook_url = ?');
        values.push(body.webhook_url);
      }

      if (updates.length > 0) {
        values.push(org.id);
        await c.env.DB.prepare(
          `UPDATE organization_settings SET ${updates.join(', ')} WHERE organization_id = ?`
        )
          .bind(...values)
          .run();
      }
    }

    // Fetch updated settings
    const updated = await c.env.DB.prepare(
      'SELECT * FROM organization_settings WHERE organization_id = ?'
    )
      .bind(org.id)
      .first();

    if (!updated) {
      throw new Error('Failed to fetch updated settings');
    }

    return c.json({
      organization_id: org.id,
      chain_id: updated.chain_id as number,
      rpc_url: updated.rpc_url as string | undefined,
      enabled_features:
        typeof updated.enabled_features === 'string'
          ? JSON.parse(updated.enabled_features)
          : updated.enabled_features,
      webhook_url: updated.webhook_url as string | undefined,
    });
  }
);

export { organizationRoutes };
