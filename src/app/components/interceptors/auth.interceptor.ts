import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth-service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((res) => {
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.token}` },
            });
            return next(newReq); 
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
