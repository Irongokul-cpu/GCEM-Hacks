/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// LAYER 3: BACKEND ENTRY POINT — EXPRESS SERVER & VITE INTEGRATION
// ============================================================================

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { backendRouter } from './src/backend/router';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Request parsing middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.text({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Layer 3: REST API routes
  app.use('/api', backendRouter);

  // Layer 1: Frontend serving
  if (!isProd) {
    // In development: mount Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log(`[Layer 3 Backend] Vite development middleware attached.`);
  } else {
    // In production: serve pre-built static assets from dist/
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[Layer 3 Backend] Serving production static bundle from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[3-Layer EV BMS Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`  - Layer 1 (Frontend): React 19 UI & Interactive Oscilloscope`);
    console.log(`  - Layer 2 (Middle Layer): Data Quality, Parsing & Numerical Engine`);
    console.log(`  - Layer 3 (Backend): Express REST API & ZIP Package Service`);
  });
}

startServer().catch((err) => {
  console.error('[Layer 3 Backend] Fatal error during startup:', err);
  process.exit(1);
});
