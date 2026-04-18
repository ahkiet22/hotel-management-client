import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LucideAngularModule, User, Mail, Phone, MapPin, Camera, Save } from 'lucide-angular';
import { UserService, User as UserType } from '@core/services/user.service';
import { AuthStore } from '@core/stores/auth.store';
import { inject } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div
      class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <!-- Profile Header -->
      <div class="relative h-32 bg-linear-to-r from-blue-600 to-indigo-700">
        <div class="absolute -bottom-16 left-8">
          <div class="relative group">
            <div
              class="w-32 h-32 rounded-3xl bg-white p-1 shadow-lg ring-4 ring-white/50 overflow-hidden"
            >
              <img
                src="https://ui-avatars.com/api/?name={{
                  userForm.value.fullName
                }}&background=0D8ABC&color=fff&size=128"
                class="w-full h-full object-cover rounded-4xl"
                alt="Profile photo"
              />
            </div>
            <button
              class="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg border-2 border-white hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <lucide-icon [img]="CameraIcon" class="w-4 h-4"></lucide-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Body -->
      <div class="pt-20 px-8 pb-10">
        <div class="flex justify-between items-start mb-10">
          <div>
            <h2 class="text-2xl font-bold text-slate-900">{{ user?.fullName }}</h2>
            <p class="text-slate-500">Manage your profile and account settings.</p>
          </div>
          <span
            class="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase rounded-full tracking-wider border border-emerald-100"
          >
            {{ user?.status || 'Active' }}
          </span>
        </div>

        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <!-- Full Name -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <lucide-icon [img]="UserIcon" class="w-4 h-4 text-slate-400"></lucide-icon>
                Full Name
              </label>
              <input
                type="text"
                formControlName="fullName"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/30 font-medium"
                placeholder="Ex: John Doe"
              />
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <lucide-icon [img]="MailIcon" class="w-4 h-4 text-slate-400"></lucide-icon>
                Email Address
              </label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/30 font-medium cursor-not-allowed"
                readonly
              />
            </div>

            <!-- Phone -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <lucide-icon [img]="PhoneIcon" class="w-4 h-4 text-slate-400"></lucide-icon>
                Phone Number
              </label>
              <input
                type="tel"
                formControlName="phone"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/30 font-medium"
                placeholder="Ex: 091-234-5678"
              />
            </div>

            <!-- Address -->
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <lucide-icon [img]="MapPinIcon" class="w-4 h-4 text-slate-400"></lucide-icon>
                Living Address
              </label>
              <input
                type="text"
                formControlName="address"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/30 font-medium"
                placeholder="Ex: Hanoï, Vietnam"
              />
            </div>
          </div>

          <div class="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="reset"
              (click)="resetForm()"
              class="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Discard
            </button>
            <button
              type="submit"
              [disabled]="userForm.invalid || isSubmitting"
              class="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <lucide-icon [img]="SaveIcon" class="w-4 h-4" *ngIf="!isSubmitting"></lucide-icon>
              <span *ngIf="!isSubmitting">Save Changes</span>
              <span *ngIf="isSubmitting">Saving...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  // Lucide Icons
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly MapPinIcon = MapPin;
  readonly CameraIcon = Camera;
  readonly SaveIcon = Save;

  user: UserType | null = null;
  userForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
  ) {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
    });
  }

  authStore = inject(AuthStore);

  ngOnInit(): void {
    const currentUser = this.authStore.user();
    if (currentUser) {
      this.user = currentUser as UserType;
      this.patchFormData();
    }
  }

  patchFormData() {
    if (this.user) {
      this.userForm.patchValue({
        fullName: this.user.fullName,
        email: this.user.email,
        phone: this.user.phone,
        address: this.user.address,
      });
    }
  }

  resetForm() {
    this.patchFormData();
  }

  onSubmit() {
    if (this.userForm.valid && this.user) {
      this.isSubmitting = true;
      const updatedUser = { ...this.user, ...this.userForm.value };

      this.userService.update(this.user.id, updatedUser).subscribe({
        next: (res) => {
          this.user = res;
          this.isSubmitting = false;
          // In a real app, you'd show a success toast here
          console.log('Profile updated successfully', res);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error updating profile', err);
        },
      });
    }
  }
}
