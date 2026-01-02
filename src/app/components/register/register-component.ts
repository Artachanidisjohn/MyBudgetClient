import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { toastController } from '@ionic/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonNote,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,
  IonHeader,
  IonToolbar,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonNote,
  IonIcon,
],
  styleUrls: ['register.scss'],
  template: `
    <ion-header>
      <ion-toolbar>
        <h1 class="page-title ion-text-center">Budget Tracker</h1>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-text-center bg-light">
      <div class="flex-center">
        <ion-card class="register-card ion-padding">
          <ion-card-header>
            <h2 class="register-title">Create Account</h2>
          </ion-card-header>

          <ion-card-content>
            <form #registerForm="ngForm" (ngSubmit)="onRegister(registerForm)" novalidate>
              <ion-item lines="full">
                <ion-label position="floating">Name</ion-label>
                <ion-input type="text" [(ngModel)]="name" name="name" required #nameCtrl="ngModel">
                </ion-input>
              </ion-item>

              @if ((showErrors || nameCtrl.touched) && nameCtrl.errors?.['required']) {
              <ion-note color="danger">Name is required</ion-note>
              }

              <ion-item lines="full">
                <ion-label position="floating">Email</ion-label>
                <ion-input
                  type="email"
                  name="email"
                  required
                  email
                  [(ngModel)]="email"
                  #emailCtrl="ngModel"
                >
                </ion-input>
              </ion-item>

              @if ((showErrors || emailCtrl.touched) && emailCtrl.errors) { @if
              (emailCtrl.errors['required']) {
              <ion-note color="danger">Email is required</ion-note>
              } @else if (emailCtrl.errors['email']) {
              <ion-note color="danger">Please enter a valid email address</ion-note>
              } }

              <ion-item lines="full">
                <ion-label position="floating">Password</ion-label>
                <ion-input
                  [type]="hidePassword ? 'password' : 'text'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  minlength="6"
                  #passwordCtrl="ngModel"
                >
                </ion-input>

                @if (password.length > 0) {
                <ion-icon
                  style="margin-top: 30px;"
                  slot="end"
                  [name]="hidePassword ? 'eye-off-outline' : 'eye-outline'"
                  (click)="togglePasswordVisibility()"
                  class="password-eye"
                >
                </ion-icon>
                }
              </ion-item>

              @if ((showErrors || passwordCtrl.touched) && passwordCtrl.errors) { @if
              (passwordCtrl.errors['required']) {
              <ion-note color="danger">Password is required</ion-note>
              } @else if (passwordCtrl.errors['minlength']) {
              <ion-note color="danger">Password must be at least 6 characters</ion-note>
              } }

              <ion-button expand="block" color="primary" class="ion-margin-top" type="submit">
                Register
              </ion-button>

              <p class="signup-text">
                Signed up already?
                <span class="signup-link" (click)="goToLogin()">Login</span>
              </p>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  hidePassword = true;
  showErrors = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

onRegister(form: NgForm) {
  this.showErrors = true;
  if (form.invalid) return;

  this.authService.register(this.name, this.email, this.password).subscribe({
    next: async () => {
      const toast = await toastController.create({
        message: 'Account created successfully!',
        duration: 2000,
        color: 'success',
      });
      toast.present();

      this.router.navigateByUrl('/login');
    },

    error: async (err) => {
      const msg =
        err?.status === 409
          ? 'User already exists. Try logging in.'
          : (err.error?.message || 'Registration failed');

      const toast = await toastController.create({
        message: msg,
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    },
  });
}



  goToLogin() {
    this.router.navigate(['/login']);
  }
}
