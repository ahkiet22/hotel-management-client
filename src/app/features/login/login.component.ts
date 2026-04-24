import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Subject, takeUntil, switchMap, tap } from 'rxjs';
import { LoadingService } from '@core/services/loading.service';
import { HlmSpinner } from "src/app/libs/ui/spinner/src";
import { AuthStore, User } from '@core/stores/auth.store';
import { StorageService } from '@core/services/storage.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HlmSpinner],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public loadingService: LoadingService,
    private authStore: AuthStore,
    private storageService: StorageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService
        .login(this.loginForm.value)
        .pipe(
          takeUntil(this.destroy$),
          tap(res => {
            // Save token so interceptor can attach it for getMe()
            this.storageService.set('accessToken', res.accessToken);
            if (res.refreshToken) {
              this.storageService.set('refreshToken', res.refreshToken);
            }
          }),
          switchMap(() => this.authService.getMe())
        )
        .subscribe({
          next: (userMe) => {
            console.log("USER", userMe)
            const token = this.storageService.get<string>('accessToken') || '';
            const user: User = {
              id: userMe.id,
              email: userMe.email,
              fullName: userMe.fullName,
              roleName: userMe.role.name,
              role_id: userMe.role.id
            };
            console.log("US", user)
            this.authStore.setAuth(user, token);
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.authStore.clearAuth();
            console.error('Error during login process:', err);
          },
        });
    }
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
