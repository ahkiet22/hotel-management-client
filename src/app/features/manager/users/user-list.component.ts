import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '@core/services/user.service';
import { LucideAngularModule, Search, Filter, MoreHorizontal, UserPlus } from 'lucide-angular';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  users = signal<User[]>([]);
  isLoading = signal(true);

  icons = {
    Search,
    Filter,
    MoreHorizontal,
    UserPlus
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getStatusClass(status?: string) {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Locked': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }
}
