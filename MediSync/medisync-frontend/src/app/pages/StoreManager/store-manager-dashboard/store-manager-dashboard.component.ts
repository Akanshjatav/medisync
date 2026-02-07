import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

// ✅ Use your existing RFQ model
import { RfqPayloadDto } from '../../../core/models/rfq.model';

// ===== Bids DTOs =====
export interface BidDto {
  bidId: number;
  rfqId: number;
  vendorId: number;
  vendorName: string;
  status: string;
  items: BidItemDto[];
}

export interface BidItemDto {
  [key: string]: any;
}

interface SmMetrics {
  totalRfqs: number;
  openRfqs: number;
  awardedRfqs: number;
  totalRfqItems: number;
  bidsForSelected: number;
}

@Component({
  selector: 'app-store-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './store-manager-dashboard.component.html',
  styleUrl: './store-manager-dashboard.component.css'
})
export class StoreManagerDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly baseUrl = 'http://localhost:7000/api/v1/sm';

  loading = true;
  error: string | null = null;
  actionBusy = false;

  rfqs: RfqPayloadDto[] = [];

  selectedRfqId: number | null = null;
  selectedRfqPayload: RfqPayloadDto | null = null;

  bids: BidDto[] = [];
  bidsLoading = false;
  bidsError: string | null = null;

  metrics: SmMetrics = {
    totalRfqs: 0,
    openRfqs: 0,
    awardedRfqs: 0,
    totalRfqItems: 0,
    bidsForSelected: 0
  };

  // ✅ Success popup state
  updateSuccessOpen = false;
  successTitle = 'Success';
  successMessage = 'RFQ updated successfully.';
  private reloadAfterSuccess = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
    } else {
      this.loading = false;
    }
  }

  retry(): void {
    this.loadDashboardData();
  }

  // =========================
  // Load RFQs
  // =========================
  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.http
      .get<RfqPayloadDto[]>(`${this.baseUrl}/rfqs`, { withCredentials: true })
      .pipe(
        tap((rows) => {
          this.rfqs = Array.isArray(rows) ? rows : [];

          // Default selection
          const first = this.rfqs[0] || null;
          this.selectedRfqId = first ? this.rfqId(first) : null;
          this.selectedRfqPayload = first;

          this.recomputeRfqMetrics();

          // Load bids for selected (if any)
          if (this.selectedRfqId) this.loadBidsForSelected();
          else {
            this.bids = [];
            this.metrics.bidsForSelected = 0;
          }
        }),
        catchError((err) => {
          console.error('RFQs error:', err);

          if (err?.status === 0) {
            this.error = 'Cannot reach backend (CORS / backend down).';
          } else if (err?.status === 401) {
            this.error = 'Unauthorized (401). Please login as MANAGER and try again.';
          } else if (err?.status === 403) {
            this.error = 'Forbidden (403). Your user is not MANAGER.';
          } else {
            this.error = `Failed to load dashboard data (${err?.status || 'unknown'}).`;
          }

          this.resetState();
          return of([] as RfqPayloadDto[]);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe();
  }

  private resetState(): void {
    this.rfqs = [];
    this.selectedRfqId = null;
    this.selectedRfqPayload = null;

    this.bids = [];
    this.bidsError = null;

    this.metrics = {
      totalRfqs: 0,
      openRfqs: 0,
      awardedRfqs: 0,
      totalRfqItems: 0,
      bidsForSelected: 0
    };
  }

  // =========================
  // RFQ Selection
  // =========================
  onSelectRfq(id: any): void {
    const n = Number(id);
    this.selectedRfqId = Number.isFinite(n) ? n : null;

    this.selectedRfqPayload =
      this.rfqs.find((p) => this.rfqId(p) === this.selectedRfqId) || null;

    this.bids = [];
    this.bidsError = null;
    this.metrics.bidsForSelected = 0;

    if (this.selectedRfqId) this.loadBidsForSelected();
  }

  // =========================
  // Bids
  // =========================
  loadBidsForSelected(): void {
    if (!this.selectedRfqId) return;

    this.bidsLoading = true;
    this.bidsError = null;

    this.http
      .get<BidDto[]>(`${this.baseUrl}/rfqs/${this.selectedRfqId}/bids`, { withCredentials: true })
      .pipe(
        tap((rows) => {
          this.bids = Array.isArray(rows) ? rows : [];
          this.metrics.bidsForSelected = this.bids.length;
        }),
        catchError((err) => {
          console.error('Bids error:', err);
          this.bidsError =
            err?.status === 401
              ? 'Unauthorized (401). Please login again.'
              : 'Failed to load bids. Please try again.';
          this.bids = [];
          this.metrics.bidsForSelected = 0;
          return of([] as BidDto[]);
        }),
        finalize(() => (this.bidsLoading = false))
      )
      .subscribe();
  }

  // =========================
  // ✅ Award RFQ (shows success popup on success)
  // =========================
  awardSelectedRfq(): void {
    if (!this.selectedRfqId) return;

    const status = (prompt('Enter award status (e.g., AWARDED):', 'AWARDED') || '').trim();
    if (!status) return;

    this.actionBusy = true;
    const params = new HttpParams().set('status', status);

    this.http
      .post<void>(`${this.baseUrl}/rfqs/${this.selectedRfqId}/award`, null, {
        params,
        withCredentials: true
      })
      .pipe(finalize(() => (this.actionBusy = false)))
      .subscribe({
        next: () => {
          // ✅ show success popup
          this.successTitle = 'Success';
          this.successMessage = 'RFQ awarded successfully.';
          this.reloadAfterSuccess = true;
          this.openUpdateSuccess();
        },
        error: (err) => {
          console.error('Award RFQ error:', err);
          alert(err?.status === 401 ? 'Unauthorized. Please login again.' : 'Failed to award RFQ.');
        }
      });
  }

  // =========================
  // ✅ Success Popup helpers
  // =========================
  showUpdateSuccess(): boolean {
    return this.updateSuccessOpen;
  }

  openUpdateSuccess(): void {
    this.updateSuccessOpen = true;
    // optional: lock background scroll
    document.body.style.overflow = 'hidden';
  }

  closeUpdateSuccess(): void {
    this.updateSuccessOpen = false;
    document.body.style.overflow = '';

    // ✅ refresh only after the user closes popup
    if (this.reloadAfterSuccess) {
      this.reloadAfterSuccess = false;
      this.loadDashboardData();
    }
  }

  // =========================
  // RFQ helpers (aligned with your model)
  // =========================
  rfqId(p: RfqPayloadDto): number | null {
    const v = p?.rfq?.rfqId;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  rfqStatus(p: RfqPayloadDto): string {
    return String(p?.rfq?.statusAward ?? '').trim();
  }

  rfqCreatedBy(p: RfqPayloadDto): string {
    const v = p?.rfq?.createdBy;
    return v === null || v === undefined ? '—' : String(v);
  }

  rfqDateForDisplay(p: RfqPayloadDto): string | null {
    return (p?.rfq?.submissionDeadline ?? p?.rfq?.expectedDeliveryDate ?? null) as any;
  }

  private recomputeRfqMetrics(): void {
    const total = this.rfqs.length;
    const open = this.rfqs.filter((p) => this.isOpenStatus(this.rfqStatus(p))).length;
    const awarded = this.rfqs.filter((p) => this.isAwardedStatus(this.rfqStatus(p))).length;
    const totalItems = this.rfqs.reduce((sum, p) => sum + (p.items?.length || 0), 0);

    this.metrics.totalRfqs = total;
    this.metrics.openRfqs = open;
    this.metrics.awardedRfqs = awarded;
    this.metrics.totalRfqItems = totalItems;
  }

  private isOpenStatus(status: string): boolean {
    const s = (status || '').toLowerCase();
    return s.includes('open') || s.includes('active') || s.includes('pending') || s.includes('draft');
  }

  private isAwardedStatus(status: string): boolean {
    const s = (status || '').toLowerCase();
    return s.includes('award') || s.includes('awarded') || s.includes('closed') || s.includes('complete');
  }

  statusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('reject') || s.includes('cancel') || s.includes('fail')) return 'expired';
    if (s.includes('pending') || s.includes('review') || s.includes('qc') || s.includes('delay')) return 'near';
    if (s.includes('approve') || s.includes('award') || s.includes('complete') || s.includes('success')) return 'safe';
    return 'safe';
  }

  formatDate(dateVal: any): string {
    if (!dateVal) return '—';
    const d = new Date(String(dateVal));
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}