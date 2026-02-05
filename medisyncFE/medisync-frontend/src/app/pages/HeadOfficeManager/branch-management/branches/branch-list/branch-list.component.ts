// src/app/pages/HeadOfficeManager/BranchManagement/branches/branch-list/branch-list.component.ts
import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { StoreService } from '../../../../../core/services/store.services';
import { Store } from '../../../../../core/models/store.model';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.css']
})
export class BranchListComponent {
  private svc = inject(StoreService);

  loading = signal(true);
  branches = signal<Store[]>([]);
  error = signal<string | null>(null);

  groupedByCity = computed(() => {
    const map = new Map<string, Store[]>();
    this.branches().forEach(b => {
      const key = b.location || 'Others';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  });

  ngOnInit() {
    this.svc.getStores().subscribe({
      next: (data: Store[]) => {
        this.branches.set(data);
        this.loading.set(false);
      },
      error: (e: unknown) => {
        this.error.set('Failed to load stores');
        this.loading.set(false);
        console.error(e);
      }
    });
  }
}