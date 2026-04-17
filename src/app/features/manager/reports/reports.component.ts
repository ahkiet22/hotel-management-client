import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '@core/services/report.service';
import { 
  ReportType, 
  ReportSummary, 
  RoomStats, 
  RevenueStats, 
  CustomerStats 
} from '@core/interfaces/report.interface';
import { 
  LucideAngularModule, 
  BarChart3, 
  TrendingUp, 
  Users, 
  BedDouble,
  Download,
  Calendar,
  Filter
} from 'lucide-angular';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);

  loading = signal(false);
  exporting = signal(false);
  
  query = signal({
    startDate: this.getDefaultStartDate(),
    endDate: new Date().toISOString().split('T')[0],
    type: ReportType.DAY
  });

  summary = signal<ReportSummary | null>(null);
  roomStats = signal<RoomStats | null>(null);
  revenueStats = signal<RevenueStats | null>(null);
  customerStats = signal<CustomerStats | null>(null);

  icons = {
    BarChart3,
    TrendingUp,
    Users,
    BedDouble,
    Download,
    Calendar,
    Filter
  };

  reportTypes = Object.values(ReportType);

  ngOnInit() {
    this.fetchData();
  }

  getDefaultStartDate() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  }

  fetchData() {
    this.loading.set(true);
    const q = this.query();
    
    this.reportService.getSummary(q).subscribe(res => this.summary.set(res));
    this.reportService.getRoomStats(q).subscribe(res => this.roomStats.set(res));
    this.reportService.getRevenueStats(q).subscribe(res => this.revenueStats.set(res));
    this.reportService.getCustomerStats(q).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe(res => this.customerStats.set(res));
  }

  onFilter() {
    this.fetchData();
  }

  exportReport() {
    this.exporting.set(true);
    this.reportService.exportCsv(this.query()).pipe(
      finalize(() => this.exporting.set(false))
    ).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().getTime()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  formatCurrency(value: string | number | undefined) {
    if (value === undefined || value === null) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  }

  getPercentage(current: number | string | undefined, total: number | string | undefined): number {
    const c = typeof current === 'string' ? parseFloat(current) : (current || 0);
    const t = typeof total === 'string' ? parseFloat(total) : (total || 1);
    return (c / t) * 100;
  }
}
