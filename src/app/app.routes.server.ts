import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },

  { path: 'entity-form/:type', renderMode: RenderMode.Server },
  { path: 'entity-form/:type/:id', renderMode: RenderMode.Server },

  { path: '**', renderMode: RenderMode.Server },
];
