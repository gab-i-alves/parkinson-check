import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export function authInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const token = localStorage.getItem('access_token');

  if (token && request.url.startsWith('/api')) {
    const cloned = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(cloned);
  }

  return next(request);
}
