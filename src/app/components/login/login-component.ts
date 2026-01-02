import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

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

import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
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
  styleUrls: ['login.scss'],
  template: `
    <ion-header>
      <ion-toolbar>
        <h1 class="page-title ion-text-center">Budget Tracker</h1>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-text-center bg-light">
      <div class="flex-center">
        <ion-card class="login-card ion-padding">
          <ion-card-header>
            <h2 class="login-title">Hello</h2>
            <p class="login-subtitle">Please enter your credentials</p>
          </ion-card-header>

          <ion-card-content>
            <form #loginForm="ngForm" (ngSubmit)="onLogin(loginForm)">
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

              <ion-item lines="full" style="padding-top: 6px;">
                <ion-label position="floating">Password</ion-label>
                <ion-input
                  [type]="hidePassword ? 'password' : 'text'"
                  name="password"
                  required
                  [(ngModel)]="password"
                  #passwordCtrl="ngModel"
                >
                </ion-input>

                @if (password.length > 0) {
                <ion-icon
                  slot="end"
                  style="margin-top: 30px;"
                  [name]="hidePassword ? 'eye-off-outline' : 'eye-outline'"
                  (click)="togglePasswordVisibility()"
                >
                </ion-icon>
                }
              </ion-item>

              @if ((showErrors || passwordCtrl.touched) && passwordCtrl.errors?.['required']) {
              <ion-note color="danger">Password is required</ion-note>
              }
              <ion-button expand="block" color="primary" class="ion-margin-top" type="submit">
                Login
              </ion-button>
              <p class="signup-text">
                You don't have an account?
                <span class="signup-link" (click)="goToRegister()">Sign up</span>
              </p>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = true;
  showErrors = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  async onLogin(form: NgForm) {
    this.showErrors = true;
    if (form.invalid) return;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.toastCtrl
          .create({
            message: 'Login successful!',
            duration: 2000,
            color: 'success',
          })
          .then((t) => t.present());

        console.log('token after login:', localStorage.getItem('token'));
        this.router.navigateByUrl('/expenses', { replaceUrl: true });
      },
      error: () => {
        this.toastCtrl
          .create({
            message: 'Invalid credentials',
            duration: 2000,
            color: 'danger',
          })
          .then((t) => t.present());
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
