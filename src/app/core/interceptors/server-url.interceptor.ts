import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const serverUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // During SSR/Prerendering, HttpClient requests for relative URLs (starts with /)
  // must be made absolute so the server-side fetch knows where to go.
  if (isPlatformServer(platformId) && req.url.startsWith('/')) {
    // For prerendering, the server often runs at localhost:4000 (default)
    // Or we can try to get it from a configuration if we have one.
    const protocol = 'http';
    const host = 'localhost:4000'; 
    return next(req.clone({ url: `${protocol}://${host}${req.url}` }));
  }

  return next(req);
};
