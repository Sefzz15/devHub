// src/app/app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
   { path: '', renderMode: RenderMode.Prerender },
   { path: 'login', renderMode: RenderMode.Prerender },

  // ✅ Fix: do NOT prerender param routes
  { path: 'entity-form/:type', renderMode: RenderMode.Server },
  { path: 'entity-form/:type/:id', renderMode: RenderMode.Server },

  // Everything else: SSR at request time (no prerender)
  { path: '**', renderMode: RenderMode.Server },
];
