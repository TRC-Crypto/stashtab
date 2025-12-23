import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { accountRoutes } from './routes/account';
import { authRoutes } from './routes/auth';
import { yieldRoutes } from './routes/yield';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://stashtab.dev'],
    credentials: true,
  })
);

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Stashtab API',
    version: '0.1.0',
    status: 'ok',
  });
});

// Routes
app.route('/auth', authRoutes);
app.route('/account', accountRoutes);
app.route('/yield', yieldRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json(
    {
      error: 'Internal server error',
      message: err.message,
    },
    500
  );
});

export default app;
