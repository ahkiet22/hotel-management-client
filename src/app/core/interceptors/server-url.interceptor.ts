import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const serverUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // If the URL is already absolute, just continue
  if (req.url.startsWith('http')) {
    return next(req);
  }

  // During SSR/Prerendering, HttpClient requests for relative URLs (starts with /)
  // must be made absolute so the server-side fetch knows where to go.
  if (isPlatformServer(platformId) && req.url.startsWith('/')) {
    // For development, use localhost:4200 (Vite)
    // For production, this should ideally be configurable via environment
    const protocol = 'http';
    const host = 'localhost:4200'; 
    
    const absoluteUrl = `${protocol}://${host}${req.url}`;
    return next(req.clone({ url: absoluteUrl }));
  }

  return next(req);
};

