import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '@core/services/user.service';
import { LucideAngularModule, Search, Filter, UserPlus, Pencil, Trash2 } from 'lucide-angular';
import { Meta } from '@core/interfaces/api';
import { CreateUserDto } from '@core/interfaces/user.dto';
import { UserFormComponent } from './user-form.component';
import { UiConfirmComponent } from '@shared/components/ui-confirm/ui-confirm.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UserFormComponent, UiConfirmComponent],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);

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
    this.userService.getAll().subscribe({
      next: (res) => {
        this.users.set(res.result);
        this.pagination.set(res.meta);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
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
    const obs = this.selectedUser()
      ? this.userService.update(this.selectedUser()!.id, data as any)
      : this.userService.create(data as any);

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadUsers();
      },
      error: (err) => console.error('Error saving user:', err)
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
      },
      error: (err) => console.error('Error deleting user:', err)
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
