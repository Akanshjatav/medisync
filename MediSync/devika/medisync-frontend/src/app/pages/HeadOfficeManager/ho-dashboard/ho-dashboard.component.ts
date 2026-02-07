import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { DashboardService } from '../../../core/services/ho-dashboard.service';
import { DashboardSummary } from '../../../core/models/headOfficedashboard.models';

@Component({
  selector: 'app-ho-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class HoDashboardComponent implements OnInit {
  // DI
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  summary = signal<DashboardSummary | null>(null);

  todayLabel = computed(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load dashboard data.');
        this.loading.set(false);
      }
    });
  }
}