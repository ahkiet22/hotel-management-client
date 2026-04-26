import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'account/history-booking/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'manager/bookings/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'rooms/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
