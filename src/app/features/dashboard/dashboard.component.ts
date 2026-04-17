import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '@core/services/room.service';
import { UserService } from '@core/services/user.service';
import { 
  LucideAngularModule, 
  Users, 
  BedDouble, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CalendarCheck
} from 'lucide-angular';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private roomService = inject(RoomService);
  private userService = inject(UserService);
  now = new Date();

  stats = signal({
    totalRooms: 0,
    occupiedRooms: 0,
    totalUsers: 0,
    availableRooms: 0,
    occupancyRate: 0,
    maintenanceRooms: 0
  });

  recentActivities = [
    { type: 'booking', message: 'New booking for Room 101', time: '10 mins ago', icon: 'CalendarCheck', color: 'text-blue-500 bg-blue-50' },
    { type: 'user', message: 'New staff account created: Alice', time: '1 hour ago', icon: 'Users', color: 'text-green-500 bg-green-50' },
    { type: 'room', message: 'Room 202 status changed to Maintenance', time: '3 hours ago', icon: 'AlertCircle', color: 'text-amber-500 bg-amber-50' },
    { type: 'payment', message: 'Payment of $150 received for Booking #312', time: '5 hours ago', icon: 'CheckCircle2', color: 'text-emerald-500 bg-emerald-50' },
  ];

  icons = {
    Users,
    BedDouble,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    CalendarCheck
  };

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    forkJoin({
      rooms: this.roomService.getAll(),
      users: this.userService.getAll()
    }).subscribe(({ rooms, users }) => {
      // rooms is currently Room[] because it's still mocked
      // users is ListResponse<User> because it's real
      
      const roomList = Array.isArray(rooms) ? rooms : (rooms as any).result || [];
      const userCount = (users as any).meta?.totalItems ?? (users as any).length ?? 0;

      const total = roomList.length;
      const occupied = roomList.filter((r: any) => r.status === 'Occupied').length;
      const maintenance = roomList.filter((r: any) => r.status === 'Out of Order').length;
      const vacant = roomList.filter((r: any) => r.status === 'Vacant').length;
      
      this.stats.set({
        totalRooms: total,
        occupiedRooms: occupied,
        totalUsers: userCount,
        availableRooms: vacant,
        maintenanceRooms: maintenance,
        occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
      });
    });
  }
}

