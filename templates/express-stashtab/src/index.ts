/**
 * Express Server with Stashtab Integration
 *
 * Example Express.js server using Stashtab SDK
 */

import express from 'express';
import dotenv from 'dotenv';
import stashtabRoutes from './routes/stashtab';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'Express Stashtab Template',
    version: '0.1.0',
    endpoints: {
      balance: '/stashtab/balance/:address',
      yieldRate: '/stashtab/yield-rate',
      send: '/stashtab/send',
    },
  });
});

app.use('/stashtab', stashtabRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Stashtab integration ready`);
});
