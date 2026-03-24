import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemLogService, SystemLog } from '@core/services/system-log.service';
import { LucideAngularModule, Activity, Clock, Shield } from 'lucide-angular';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './system-logs.component.html',
})
export class SystemLogsComponent implements OnInit {
  private logService = inject(SystemLogService);
  logs = signal<SystemLog[]>([]);
  isLoading = signal(true);

  icons = {
    Activity,
    Clock,
    Shield
  };

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading.set(true);
    this.logService.getAll().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
