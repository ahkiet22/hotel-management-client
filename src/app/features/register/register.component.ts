import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (!this.registerForm.valid) {
      this.toastService.warning('Form chưa hợp lệ', 'Vui lòng kiểm tra lại thông tin đăng ký.');
      return;
    }

    const formValue = this.registerForm.value;
    const fullName = formValue.email?.split('@')[0] || 'New User';

    this.authService.register({
      fullName,
      email: formValue.email,
      password: formValue.password,
      phone: formValue.phone,
    }).subscribe({
      next: () => {
        this.toastService.success('Đăng ký thành công', 'Bạn có thể đăng nhập ngay bây giờ.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toastService.error('Đăng ký thất bại', err?.message || 'Vui lòng thử lại sau.');
      }
    });
  }
}
