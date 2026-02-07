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
  daysBetween,
  getBranchFromStorage,
  checkIsBrowser
} from '../../../shared/utils/pharmacist-ui.util';
import {
  InventoryRow,
  Selection,
  CartItem
} from '../../../core/models/pharmacy.models';
import { PharmacistService } from '../../../core/services/pharmacist.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dispensing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispensing.component.html',
  styleUrl: './dispensing.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DispensingComponent implements OnInit, OnDestroy {
  private isBrowser = false;

  // ===== Page state =====
  branch = '...';
  canOverride = false;

  // ===== Inputs =====
  medSearch = '';
  qtyInput: number | null = null;

  // ===== Data =====
  private storeId = 1; // TODO: replace with real storeId from login/route when available
  private allRows: InventoryRow[] = [];
  medicines: string[] = [];
  batchesByMedicine = new Map<string, InventoryRow[]>();

  // ===== Selection + cart =====
  selection: Selection | null = null;
  cart: CartItem[] = [];

  // ===== Messages & UX =====
  showNoBatchError = false;
  errorText = '';
  successText = '';
  selectionText = '';
  loading = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private phService: PharmacistService
  ) {}

  ngOnInit(): void {
    this.isBrowser = checkIsBrowser(this.platformId);

    // Branch name display (fallback to API response later)
    this.branch = this.isBrowser ? getBranchFromStorage(this.isBrowser) ?? 'Pharmacy Branch' : 'Pharmacy Branch';
    this.canOverride = this.isBrowser && (localStorage.getItem('canOverrideFEFO') === 'true');

    this.loadInventory();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Search
  onSearchChange(): void {
    this.recompute(this.allRows);
  }

  // ===== Inventory load & recompute =====
  private loadInventory(): void {
    this.loading = true;
    this.clearMessages();

    this.phService.getInventory(this.storeId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rows) => {
          this.allRows = rows;
          // Take storeName from API for accurate display
          if (rows.length) this.branch = rows[0].storeName;
          this.recompute(rows);
          this.renderCart();
        },
        error: (err: HttpErrorResponse) => {
          this.showNoBatchError = true;
          this.errorText = this.humanizeHttpError(err, 'Unable to load inventory');
        }
      });
  }

  /** Builds FEFO batches per medicine and sets default selection */
  private recompute(source: InventoryRow[]): void {
    this.clearMessages();

    const term = (this.medSearch || '').trim().toLowerCase();

    // Filter by medicine if search
    const filtered = source.filter(r => !term || r.medicine.toLowerCase().includes(term));

    // Medicine list
    const medSet = new Set(filtered.map(r => r.medicine));
    this.medicines = Array.from(medSet).sort();

    this.batchesByMedicine.clear();

    if (this.medicines.length === 0) {
      this.showNoBatchError = true;
      this.errorText = 'No valid batch found for dispensing. Please check inventory.';
      this.selection = null;
      return;
    }

    // FEFO sort: earliest expiry first
    this.medicines.forEach(m => {
      const batches = filtered
        .filter(x => x.medicine === m && x.qty > 0)
        .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
      this.batchesByMedicine.set(m, batches);

      if (!this.selection || this.selection.medicine !== m) {
        const earliest = batches[0];
        if (earliest) {
          this.selection = {
            medicine: m,
            batch: earliest.batch,
            batchId: earliest.batchId,
            productId: earliest.productId,
            expiry: earliest.expiry,
            qtyAvailable: earliest.qty
          };
        }
      }
    });

    this.qtyInput = null;
    this.selectionText = this.selection ? 'Batch auto-selected using FEFO (earliest expiry).' : '';
  }

  // ===== Selection =====
  selectBatch(medicine: string, batchRow: InventoryRow, idx: number): void {
    this.clearMessages();

    if (!this.canOverride && idx !== 0) {
      alert('Manual override is not allowed for your role. Earliest expiry must be selected.');
      return;
    }

    if (this.isExpired(batchRow.expiry) && !this.canOverride) {
      alert('This batch is expired. Dispensing is blocked.');
      return;
    }

    this.selection = {
      medicine,
      batch: batchRow.batch,
      batchId: batchRow.batchId,
      productId: batchRow.productId,
      expiry: batchRow.expiry,
      qtyAvailable: batchRow.qty
    };

    this.qtyInput = null;
    this.successText = `Selected: ${this.selection.medicine} • Batch ${this.selection.batch} • Expiry ${this.selection.expiry} • Available ${this.selection.qtyAvailable}`;
  }

  // ===== Cart =====
  addToCart(): void {
    if (!this.selection) {
      alert('Select a medicine batch first.');
      return;
    }

    const qty = Number(this.qtyInput);
    if (!qty || qty <= 0) {
      alert('Enter a valid quantity.');
      return;
    }

    if (qty > this.selection.qtyAvailable) {
      alert('Requested quantity exceeds available stock.');
      return;
    }

    if (this.isExpired(this.selection.expiry) && !this.canOverride) {
      alert('This batch is expired. Dispensing is blocked.');
      return;
    }

    // Merge if same product+batch already in cart
    const idx = this.cart.findIndex(c =>
      c.productId === this.selection!.productId &&
      c.batchId === this.selection!.batchId
    );
    if (idx > -1) {
      const newQty = this.cart[idx].qty + qty;
      if (newQty > this.selection.qtyAvailable) {
        alert('Cart total exceeds available stock for this batch.');
        return;
      }
      this.cart[idx].qty = newQty;
    } else {
      this.cart.push({ ...this.selection, qty });
    }
    this.renderCart();
  }

  clearCart(): void {
    this.cart = [];
    this.renderCart();
  }

  confirmBill(): void {
    if (!this.cart.length) {
      alert('Cart is empty.');
      return;
    }

    const ok = confirm('Confirm billing and reduce inventory?');
    if (!ok) return;
    // forkJoin fails fast if any error is not caught;
    // So we wrap each call with of() on error to allow composite handling.
    forkJoin(
      this.cart.map(item =>
        this.phService
          .dispenseProduct(item.productId, item.qty)
          .pipe(
            catchError((e: HttpErrorResponse) =>
              of(`ERROR: ${this.humanizeHttpError(e, 'Dispense failed')}`)
            )
          )
      )
    ).subscribe({
      next: (results: (string)[]) => {
        const errs = results.filter(r => typeof r === 'string' && r.startsWith('ERROR:'));
        if (errs.length) {
          this.errorText = errs.join(' | ');
          this.showNoBatchError = true;
        } else {
          this.successText = 'Inventory updated successfully after dispensing.';
        }

        // Reset + refresh inventory view
        this.cart = [];
        this.renderCart();
        this.loadInventory();
      },
      error: (e: HttpErrorResponse) => {
        this.showNoBatchError = true;
        this.errorText = this.humanizeHttpError(e, 'Billing failed');
      }
    });
  }

  // ===== Template helpers =====
  getExpiryTag(expiry: string): string {
    const daysLeft = daysBetween(new Date(), new Date(expiry));
    return daysLeft <= 14 ? 'Critical' : 'Earliest Expiry';
  }

  isEarliest(idx: number): boolean {
    return idx === 0;
  }

  trackByMedicine(_: number, med: string): string {
    return med;
  }

  trackByBatch(_: number, row: InventoryRow): string {
    return `${row.storeId}-${row.medicine}-${row.batchId}-${row.productId}`;
  }

  trackByCart(_: number, item: CartItem): string {
    return `${item.productId}-${item.batchId}-${item.expiry}-${item.qty}`;
  }

  // ===== Misc =====
  private isExpired(isoDate: string): boolean {
    const d = new Date(isoDate);
    const today = new Date();
    // Compare date-only
    d.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    return d.getTime() < today.getTime();
  }

  private renderCart(): void {
    // Angular template handles DOM; reserved for future use
  }

  private clearMessages(): void {
    this.showNoBatchError = false;
    this.errorText = '';
    // successText is sometimes kept to show selection/billing
  }

  logout(): void {
    confirmLogout(this.router);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    closeAccountMenuOnOutsideClick(this.isBrowser, this.document, event);
  }

  private humanizeHttpError(err: HttpErrorResponse, fallback: string): string {
    if (!err) return fallback;
    if (err.status === 0) return `${fallback}: Cannot reach server`;
    if (err.error && typeof err.error === 'string') return `${fallback}: ${err.error}`;
    if (err.error && err.error.message) return `${fallback}: ${err.error.message}`;
    return `${fallback}: HTTP ${err.status}`;
  }
}