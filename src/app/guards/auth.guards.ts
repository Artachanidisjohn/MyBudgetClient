import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('GUARD token:', localStorage.getItem('token'), 'isLoggedIn:', auth.isLoggedIn());

  return auth.isLoggedIn() ? true : router.parseUrl('/login');
};

