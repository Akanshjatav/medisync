import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { DashboardService } from '../../../core/services/dashboard.service';

import {
  DashboardMetrics,
  ExpiryAlert,
  LowStockItem,
  StockRequestDto
} from '../../../core/models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly platformId = inject(PLATFORM_ID);

  loading = true;
  error: string | null = null;

  metrics: DashboardMetrics | null = null;
  expiryAlerts: ExpiryAlert[] = [];
  lowStockItems: LowStockItem[] = [];
  pendingRfs: StockRequestDto[] = [];

  ngOnInit(): void {
    // ✅ SSR SAFE: don't call session-based APIs during server-side render
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
    } else {
      // SSR render: show skeleton state; browser will load data after hydration
      this.loading = false;
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService
      .getDashboardData()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.metrics = data.metrics;
          this.expiryAlerts = data.expiryAlerts;
          this.lowStockItems = data.lowStockItems;
          this.pendingRfs = data.pendingRfs;
        },
        error: (err) => {
          console.error('Dashboard error:', err);

          // If backend correctly returns 401, you can detect it:
          // if (err?.status === 401) this.error = 'Session expired. Please login again.';
          // else ...

          this.error = 'Failed to load dashboard data. Please try again.';
        }
      });
  }

  getExpiryStatusClass(daysUntilExpiry: number): string {
    if (daysUntilExpiry <= 7) return 'expired';
    if (daysUntilExpiry <= 14) return 'near';
    return 'ok';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  retry(): void {
    this.loadDashboardData();
  }
}