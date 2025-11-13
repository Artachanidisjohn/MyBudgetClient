import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './components/interceptors/auth.interceptor';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideIonicAngular(),
    importProvidersFrom(
      MatDatepickerModule,
      MatNativeDateModule,
      MatFormFieldModule,
      MatInputModule
    )
  ]
};
