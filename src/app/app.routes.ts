import { Routes } from '@angular/router';
import { ExpensesListComponent } from './components/expenses-list/expenses-list-component';
import { LoginComponent } from './components/login/login-component';
import { AuthGuard } from './guards/auth.guards';
import { RegisterComponent } from './components/register/register-component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'expenses', component: ExpensesListComponent,
     canActivate: [AuthGuard] 
  },
  { path: '**', redirectTo: 'login' },
];
