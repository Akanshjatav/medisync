import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBaseUrl = environment.apiBaseUrl; // e.g. "http://localhost:7000/api"

  // Match both:
  // 1) Absolute calls: "http://localhost:7000/api/..."
  // 2) Proxy/relative calls: "/api/..."
  const isApiCall =
    req.url.startsWith(apiBaseUrl) ||
    req.url.startsWith('/api/') ||
    req.url.includes('/api/'); // fallback

  if (isApiCall && !req.withCredentials) {
    req = req.clone({ withCredentials: true });
  }

  return next(req);
};