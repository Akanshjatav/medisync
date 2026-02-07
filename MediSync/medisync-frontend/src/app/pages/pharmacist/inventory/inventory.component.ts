import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  closeAccountMenuOnOutsideClick,
  confirmLogout,
  checkIsBrowser
} from '../../../shared/utils/pharmacist-ui.util';
import { PharmacistService } from '../../../core/services/pharmacist.service';
import { HttpErrorResponse } from '@angular/common/http';

type SortValue = 'expiryAsc' | 'expiryDesc' | 'qtyAsc' | 'qtyDesc';
type Status = 'ok' | 'near' | 'expired';

interface InventoryItem {
  medicine: string;
  batch: string;    // display batch identifier
  expiry: string;   // ISO YYYY-MM-DD
  qty: number;
  status: Status;
  // keep storeName optional for header
  storeName?: string;
}

interface DisplayRow extends InventoryItem {
  statusLabel: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class InventoryComponent implements OnInit, OnDestroy {
  private isBrowser = false;

  // Branch
  branchName = '—';

  // Inputs
  searchTerm = '';
  sortVal: SortValue = 'expiryAsc';

  // Status text / loading
  statusText = 'Loading inventory…';
  loading = true;

  // Data
  private storeId = 1; // TODO: replace with actual store id from login/route when available
  private items: InventoryItem[] = [];
  rows: DisplayRow[] = [];

  // thresholds
  private NEAR_DAYS = 30;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private phService: PharmacistService
  ) {}

  ngOnInit(): void {
    this.isBrowser = checkIsBrowser(this.platformId);
    this.document.title = 'Stock Inventory | MediSync';
    this.loadInventory();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // ================= Data Load =================
  private loadInventory(): void {
    this.loading = true;
    this.statusText = 'Loading inventory…';

    this.phService.getInventory(this.storeId).subscribe({
      next: (flatRows) => {
        // Map flatRows (from service) to the table row model
        // Service returns rows like: { storeName, medicine, batchId, productId, qty, expiry }
        this.items = flatRows.map(r => {
          const status = this.computeStatus(r.expiry);
          return {
            medicine: r.medicine,
            batch: String(r.batchId), // backend doesn’t expose batchCode; display batchId
            expiry: r.expiry,
            qty: r.qty ?? 0,
            status,
            storeName: r.storeName
          };
        });

        // Set branch name from API (first row)
        if (this.items.length && this.items[0].storeName) {
          this.branchName = this.items[0].storeName!;
        }

        this.applySearchAndSort();
        this.loading = false;
        this.statusText = `Showing latest stock (${this.items.length} items)`;
      },
      error: (err: HttpErrorResponse) => {
        this.items = [];
        this.rows = [];
        this.loading = false;
        this.statusText = this.humanizeHttpError(err, 'Failed to load inventory');
      }
    });
  }

  // ================= Search/Sort =================
  onSearchChange(): void {
    this.applySearchAndSort();
  }

  onSortChange(): void {
    this.applySearchAndSort();
  }

  refreshData(): void {
    this.loadInventory();
  }

  private applySearchAndSort(): void {
    const q = (this.searchTerm || '').trim().toLowerCase();

    // Search: medicine + batch
    let filtered = this.items.filter((item) => {
      const hay = `${item.medicine} ${item.batch}`.toLowerCase();
      return q === '' || hay.includes(q);
    });

    // Sort
    switch (this.sortVal) {
      case 'expiryAsc':
        filtered.sort((a, b) => toDate(a.expiry).getTime() - toDate(b.expiry).getTime());
        break;
      case 'expiryDesc':
        filtered.sort((a, b) => toDate(b.expiry).getTime() - toDate(a.expiry).getTime());
        break;
      case 'qtyAsc':
        filtered.sort((a, b) => (a.qty ?? 0) - (b.qty ?? 0));
        break;
      case 'qtyDesc':
        filtered.sort((a, b) => (b.qty ?? 0) - (a.qty ?? 0));
        break;
      default:
        filtered.sort((a, b) => toDate(a.expiry).getTime() - toDate(b.expiry).getTime());
        break;
    }

    this.rows = filtered.map((item) => ({
      ...item,
      statusLabel: item.status === 'near' ? 'Near Expiry' : item.status === 'expired' ? 'Expired' : 'In Stock',
    }));
  }

  // ================= Stats Methods =================
  getTotalItems(): number {
    return this.items.length;
  }

  getStockOkCount(): number {
    return this.items.filter(item => item.status === 'ok').length;
  }

  getNearExpiryCount(): number {
    return this.items.filter(item => item.status === 'near').length;
  }

  getExpiredCount(): number {
    return this.items.filter(item => item.status === 'expired').length;
  }

  // ================= Logout =================
  logout(): void {
    confirmLogout(this.router);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    closeAccountMenuOnOutsideClick(this.isBrowser, this.document, event);
  }

  // ================= Helpers =================
  private computeStatus(isoDate: string): Status {
    const days = daysLeftFromToday(isoDate);
    if (days < 0) return 'expired';
    if (days <= this.NEAR_DAYS) return 'near';
    return 'ok';
  }

  private humanizeHttpError(err: HttpErrorResponse, fallback: string): string {
    if (!err) return fallback;
    if (err.status === 0) return `${fallback}: Cannot reach server`;
    if (err.error && typeof err.error === 'string') return `${fallback}: ${err.error}`;
    if ((err as any).error && (err as any).error.message) return `${fallback}: ${(err as any).error.message}`;
    return `${fallback}: HTTP ${err.status}`;
  }

  trackByRow(_: number, r: DisplayRow): string {
    return `${r.medicine}-${r.batch}-${r.expiry}`;
  }
}

// ===== Local pure helpers =====
function toDate(iso: string): Date {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date(0);
  d.setHours(0,0,0,0);
  return d;
}
function daysLeftFromToday(iso: string): number {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = toDate(iso);
  const diff = d.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}