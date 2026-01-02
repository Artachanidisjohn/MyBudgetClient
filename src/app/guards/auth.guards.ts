import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const ok = auth.isLoggedIn();
  console.log('GUARD token:', auth.getToken(), 'isLoggedIn:', ok);

  return ok ? true : router.parseUrl('/login');
};


