import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  closeAccountMenuOnOutsideClick,
  confirmLogout,
  daysBetween,
  getBranchFromStorage,
  checkIsBrowser
} from '../../../shared/utils/pharmacist-ui.util';
import { PharmacistService } from '../../../core/services/pharmacist.service';
import { ExpiryItem, ExpirySeverity } from '../../../core/models/pharmacy.models';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { take } from 'rxjs/operators';

type SortValue = 'expiryAsc' | 'expiryDesc' | 'qtyAsc' | 'qtyDesc' | 'nameAsc' | 'nameDesc';

interface DisplayRow {
  sNo: number;
  medicine: string;
  stock: number;
  unit: string;
  expiryDate: string; // yyyy-mm-dd
  daysLeftText: string;
  daysLeft: number;
  severity: ExpirySeverity;
}

@Component({
  selector: 'app-expiry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expiry.component.html',
  styleUrl: './expiry.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ExpiryComponent implements OnInit, OnDestroy {
  private isBrowser = false;

  // UI state
  loading = false;

  // Inputs
  searchTerm = '';
  sortVal: SortValue = 'expiryAsc';

  // Branch
  branch = '...';
  canOverride = false;

  // Data
  private storeId = 1; // TODO: replace with real store id from login/route if available
  private allItems: ExpiryItem[] = [];

  // Output table
  rows: DisplayRow[] = [];
  statusText = 'Loading inventory…';

  private cutoffDays = 90; // within 3 months

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private phService: PharmacistService
  ) {}

ngOnInit(): void {
  this.isBrowser = checkIsBrowser(this.platformId);
  this.branch = this.isBrowser ? getBranchFromStorage(this.isBrowser) ?? 'Pharmacy Branch' : 'Pharmacy Branch';
  this.canOverride = this.isBrowser && (localStorage.getItem('canOverrideFEFO') === 'true');

  // ✅ NEW: use same truth as Dispensing (Inventory API) to set branch name
  this.phService.getInventory(this.storeId)
    .pipe(take(1))
    .subscribe({
      next: (rows) => {
        if (rows?.length) this.branch = rows[0].storeName;
      }
    });

  this.fetchExpiring();
}

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Events
  onSearchChange(): void {
    this.computeRows();
  }
  onSortChange(): void {
    this.computeRows();
  }

  // Logout
  logout(): void {
    confirmLogout(this.router);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    closeAccountMenuOnOutsideClick(this.isBrowser, this.document, event);
  }

  // Core
  private fetchExpiring(): void {
    this.loading = true;
    this.statusText = 'Loading inventory…';
    this.phService
      .getExpiring(this.storeId, this.cutoffDays)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (items) => {
          this.allItems = items;
          this.statusText = items.length
            ? `Showing ${items.length} entr${items.length === 1 ? 'y' : 'ies'} (≤ 3 months)`
            : 'No drugs expiring within 3 months.';
          this.computeRows();
          if (items.length && items[0].storeName) this.branch = items[0].storeName;
        },
        error: (e: HttpErrorResponse) => {
          this.allItems = [];
          this.statusText = this.humanizeHttpError(e, 'Failed to load expiry data');
          this.rows = [];
        }
      });
  }

  private computeRows(): void {
    // Filter by search
    const term = (this.searchTerm || '').trim().toLowerCase();
    let filtered = this.allItems.filter(x => !term || x.medicine.toLowerCase().includes(term));

    // Sort
    switch (this.sortVal) {
      case 'expiryAsc':
        filtered.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        break;
      case 'expiryDesc':
        filtered.sort((a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime());
        break;
      case 'qtyAsc':
        filtered.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
        break;
      case 'qtyDesc':
        filtered.sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));
        break;
      case 'nameAsc':
        filtered.sort((a, b) => a.medicine.localeCompare(b.medicine, undefined, { sensitivity: 'base' }));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.medicine.localeCompare(a.medicine, undefined, { sensitivity: 'base' }));
        break;
      default:
        filtered.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }

    // Build display rows
    this.rows = filtered.map((x, i) => ({
      sNo: i + 1,
      medicine: x.medicine,
      stock: x.stock,
      unit: x.unit,
      expiryDate: formatISO(x.expiryDate),
      daysLeftText: formatDaysLeft(x.daysLeft),
      daysLeft: x.daysLeft,
      severity: x.severity
    }));
  }

  // TrackBy for performance (used in template)
  trackBySNo(_: number, row: DisplayRow): number {
    return row.sNo;
  }

  private humanizeHttpError(err: HttpErrorResponse, fallback: string): string {
    if (!err) return fallback;
    if (err.status === 0) return `${fallback}: Cannot reach server`;
    if (err.error && typeof err.error === 'string') return `${fallback}: ${err.error}`;
    if ((err as any).error && (err as any).error.message) return `${fallback}: ${(err as any).error.message}`;
    return `${fallback}: HTTP ${err.status}`;
  }
}

/** Local format helpers */
function formatISO(iso: string): string {
  // Keep yyyy-MM-dd as is if already in correct form
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function formatDaysLeft(daysLeft: number): string {
  if (daysLeft < 0) {
    const n = Math.abs(daysLeft);
    return `Expired ${n} ${n === 1 ? 'day' : 'days'} ago`;
  }
  if (daysLeft === 0) return 'Expires today';
  return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;
}