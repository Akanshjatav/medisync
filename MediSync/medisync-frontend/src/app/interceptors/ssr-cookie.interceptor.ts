import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SSR_COOKIE_HEADER } from './ssr.tokens';

export const ssrCookieInterceptor: HttpInterceptorFn = (req, next) => {
  // Will be available only when SSR server.ts provided it
  const cookieHeader = inject(SSR_COOKIE_HEADER, { optional: true }) ?? '';

  if (cookieHeader) {
    return next(
      req.clone({
        withCredentials: true,
        setHeaders: {
          cookie: cookieHeader,
        },
      })
    );
  }

  return next(req);
};