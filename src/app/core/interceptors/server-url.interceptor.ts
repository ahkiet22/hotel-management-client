import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const serverUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (req.url.startsWith('http')) {
    return next(req);
  }

  if (isPlatformServer(platformId) && req.url.startsWith('/')) {
    const protocol = 'http';
    const host = 'localhost:4200'; 
    
    const absoluteUrl = `${protocol}://${host}${req.url}`;
    return next(req.clone({ url: absoluteUrl }));
  }

  return next(req);
};

