// src/app/pages/HeadOfficeManager/BranchManagement/branches/branch-detail/branch-detail.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs';

import { StoreService, InventoryRow } from '../../../../../core/services/store.services';
import { Store } from '../../../../../core/models/store.model';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './branch-detail.component.html',
  styleUrls: ['./branch-detail.component.css']
})
export class BranchDetailComponent {
  private route = inject(ActivatedRoute);
  private svc = inject(StoreService);

  branch = signal<Store | null>(null);

  inventoryLoading = signal(false);
  inventoryErrorMessage = signal('');
  inventorySuccessMessage = signal('');
  inventoryRows = signal<InventoryRow[]>([]);

  // ✅ Filter state
  medicineFilter = signal('');

  // ✅ Filtered rows (by medicine name)
  filteredInventoryRows = computed(() => {
    const term = (this.medicineFilter() ?? '').trim().toLowerCase();
    const rows = this.inventoryRows();

    if (!term) return rows;

    return rows.filter(r =>
      (r.medicineName ?? '').toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => this.svc.getStoreById(+(params.get('id') ?? 0)))
      )
      .subscribe((s: Store | undefined) => {
        const b = s ?? null;
        this.branch.set(b);

        if (b) {
          this.loadInventory(b.store_id);
        } else {
          this.inventoryRows.set([]);
          this.inventorySuccessMessage.set('');
          this.inventoryErrorMessage.set('Branch not found. Inventory cannot be loaded.');
        }
      });
  }

  /** ✅ Loads inventory from backend */
  private loadInventory(storeId: number) {
    this.inventoryLoading.set(true);
    this.inventoryErrorMessage.set('');
    this.inventorySuccessMessage.set('');
    this.inventoryRows.set([]);

    this.svc.getBranchInventory(storeId).subscribe({
      next: (res: any) => {
        const rows = this.svc.mapInventoryRows(res);
        this.inventoryRows.set(rows);
        this.inventorySuccessMessage.set('Inventory data loaded successfully.');
        this.inventoryLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.inventoryRows.set([]);
        this.inventoryLoading.set(false);
        this.inventorySuccessMessage.set('');
        this.inventoryErrorMessage.set('Inventory data not available. Please retry.');
      }
    });
  }

  retryInventory() {
    const b = this.branch();
    if (b) this.loadInventory(b.store_id);
  }

  onMedicineFilter(value: string) {
    this.medicineFilter.set(value ?? '');
  }
}
