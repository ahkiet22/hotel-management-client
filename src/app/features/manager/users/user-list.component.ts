import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@core/services/user.service';
import { LucideAngularModule, Search, Filter, UserPlus, Pencil, Trash2 } from 'lucide-angular';
import { CreateUserDto, User } from '@core/interfaces/user.dto';
import { UserFormComponent } from './user-form.component';
import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { Meta } from '@core/interfaces';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UserFormComponent, UiConfirmComponent, PaginationComponent],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  users = signal<User[]>([]);
  pagination = signal<Meta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  isLoading = signal(true);

  // Form state
  isFormOpen = signal(false);
  selectedUser = signal<User | null>(null);

  // Delete confirm state
  isConfirmOpen = signal(false);
  userToDelete = signal<User | null>(null);

  icons = { Search, Filter, UserPlus, Pencil, Trash2 };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.userService.getAll({ page: this.pagination().page, limit: this.pagination().limit }).subscribe({
      next: (res: any) => {
        const result: User[] = Array.isArray(res?.result) ? res.result : Array.isArray(res) ? res : [];
        const current = this.pagination();
        const totalItems = res?.meta?.totalItems ?? result.length;
        const limit = res?.meta?.limit ?? current.limit;
        const page = res?.meta?.page ?? current.page;
        const totalPages = res?.meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(limit, 1)));

        this.users.set(result);
        this.pagination.set({ page, limit, totalPages, totalItems });
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(page: number) {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadUsers();
  }

  openCreateForm() {
    this.selectedUser.set(null);
    this.isFormOpen.set(true);
  }

  openEditForm(user: User) {
    this.selectedUser.set(user);
    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.selectedUser.set(null);
  }

  onSave(data: CreateUserDto) {
    const isEditing = !!this.selectedUser();
    const obs = isEditing
      ? this.userService.update(this.selectedUser()!.id, data)
      : this.userService.create(data);

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadUsers();
        this.toastService.success(isEditing ? 'User updated successfully' : 'User created successfully');
      },
      error: (err) => this.toastService.error('Failed to save user', err?.message)
    });
  }

  openDeleteConfirm(user: User) {
    this.userToDelete.set(user);
    this.isConfirmOpen.set(true);
  }

  onDeleteConfirmed() {
    const user = this.userToDelete();
    if (!user) return;
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.isConfirmOpen.set(false);
        this.userToDelete.set(null);
        this.loadUsers();
        this.toastService.success('User deleted successfully');
      },
      error: (err) => this.toastService.error('Failed to delete user', err?.message)
    });
  }

  onDeleteCancelled() {
    this.isConfirmOpen.set(false);
    this.userToDelete.set(null);
  }

  getStatusClass(status?: string) {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Locked': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }
}
