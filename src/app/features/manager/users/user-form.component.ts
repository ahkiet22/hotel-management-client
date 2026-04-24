import {
  Component, EventEmitter, Input, Output, signal,
  OnChanges, SimpleChanges, inject, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { CreateUserDto, User } from '@core/interfaces/user.dto';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HlmButton, HlmInput, HlmLabel, UiModalComponent],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnChanges {
  @Input() user: User | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateUserDto>();

  private fb = inject(FormBuilder);

  isEdit = signal(false);
  form: FormGroup;

  roleOptions = [
    { label: 'Admin', value: '1' },
    { label: 'Staff', value: '2' },
    { label: 'Customer', value: '3' },
  ];

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Locked', value: 'Locked' },
  ];

  constructor() {
    this.form = this.fb.group({
      roleId: ['', [Validators.required]],
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.maxLength(255)]],
      phone: ['', [Validators.maxLength(20)]],
      address: [''],
      status: ['Active', [Validators.required]],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      this.isEdit.set(true);
      // Password not required on edit
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.form.patchValue({
        roleId: this.user.role_id ?? '',
        fullName: this.user.fullName ?? '',
        email: this.user.email ?? '',
        password: '',
        phone: this.user.phone ?? '',
        address: this.user.address ?? '',
        status: this.user.status ?? 'Active',
      });
    } else if (changes['user'] && !this.user) {
      this.isEdit.set(false);
      this.form.get('password')?.setValidators([Validators.required, Validators.maxLength(255)]);
      this.form.get('password')?.updateValueAndValidity();
      this.form.reset({ roleId: '', fullName: '', email: '', password: '', phone: '', address: '', status: 'Active' });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const value = this.form.value;
      if (this.isEdit() && !value.password) {
        delete value.password;
      }
      this.save.emit(value as CreateUserDto);
    } else {
      Object.values(this.form.controls).forEach(c => c.markAsTouched());
    }
  }
}
