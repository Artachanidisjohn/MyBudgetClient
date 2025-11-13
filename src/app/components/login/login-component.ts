import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  styleUrls: ['login.scss'],
  template: `
    <ion-header>
      <ion-toolbar>
        <h1 class="ion-text-center" style="color: #ff6f00;font-size: 1.4rem;">Budget Tracker</h1>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-text-center bg-light">
      <div class="flex-center">
        <ion-card class="login-card ion-padding">
          <ion-card-header>
            <ion-card-title class="text-2xl font-semibold">Hello</ion-card-title>
            <ion-card-subtitle>Please enter your Credentials</ion-card-subtitle>
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

              <ion-button fill="clear" color="medium" expand="block" (click)="goToRegister()">
                Don't have an account? Sign up
              </ion-button>
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
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Login successful!',
          duration: 2000,
          color: 'success',
        });
        await toast.present();
        this.router.navigate(['/expenses']);
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Invalid credentials',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
