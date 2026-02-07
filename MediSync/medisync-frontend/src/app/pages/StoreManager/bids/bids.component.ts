import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, finalize, of, tap } from 'rxjs';

export interface BidItemDto {
  medicineName: string;
  itemQuantity: number;
  itemPrice: number;
}

export interface BidDto {
  bidId: number;
  rfqId: number;
  vendorId: number;
  vendorName: string;
  status: string;
  items: BidItemDto[];
}

export interface RfqRowDto {
  rfqId: number;
  // optional if backend sends it
  status?: string;
}

type SortKey = 'BID_DESC' | 'BID_ASC' | 'VALUE_DESC' | 'VALUE_ASC';

@Component({
  selector: 'app-bids',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './bids.component.html',
  styleUrls: ['./bids.component.css']
})
export class BidsComponent implements OnInit {
  private http = inject(HttpClient);

  // ✅ Match your working dashboard pattern
  private readonly baseUrl = 'http://localhost:7000/api/v1/sm';

  // RFQs state
  rfqLoading = signal(false);
  rfqError = signal('');
  rfqs = signal<RfqRowDto[]>([]);
  selectedRfqId = signal<number | null>(null);

  // Bids state
  bidsLoading = signal(false);
  bidsError = signal('');
  bids = signal<BidDto[]>([]);
  selectedBid = signal<BidDto | null>(null);

  // Filters (apply to bids of selected RFQ)
  searchText = signal('');
  statusFilter = signal<'ALL' | string>('ALL');
  sortBy = signal<SortKey>('BID_DESC');

  filteredBids = computed(() => {
    const raw = this.bids() ?? [];
    const q = (this.searchText() || '').trim().toLowerCase();
    const status = this.statusFilter();

    let out = raw;

    if (status && status !== 'ALL') {
      out = out.filter(b => (b.status || '').toUpperCase() === status.toUpperCase());
    }

    if (q) {
      out = out.filter(b => {
        const hay = [b.bidId, b.vendorId, b.vendorName, b.status].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    const sort = this.sortBy();
    out = [...out].sort((a, b) => {
      switch (sort) {
        case 'BID_ASC': return (a.bidId ?? 0) - (b.bidId ?? 0);
        case 'BID_DESC': return (b.bidId ?? 0) - (a.bidId ?? 0);
        case 'VALUE_ASC': return this.getTotalValue(a) - this.getTotalValue(b);
        case 'VALUE_DESC': return this.getTotalValue(b) - this.getTotalValue(a);
        default: return (b.bidId ?? 0) - (a.bidId ?? 0);
      }
    });

    return out;
  });

  ngOnInit(): void {
    this.loadRfqs();
  }

  // =========================
  // Load RFQs (rows/cards)
  // GET /api/v1/sm/rfqs
  // =========================
  loadRfqs(): void {
    this.rfqError.set('');
    this.rfqLoading.set(true);

    this.http.get<any[]>(`${this.baseUrl}/rfqs`, { withCredentials: true }).pipe(
      tap(rows => {
        const normalized = (rows ?? [])
          .map(r => ({
            rfqId: Number(r?.rfq?.rfqId ?? r?.rfqId ?? r?.id),
            status: String(r?.rfq?.statusAward ?? r?.status ?? '').trim() || undefined
          }))
          .filter(r => Number.isFinite(r.rfqId) && r.rfqId > 0);

        this.rfqs.set(normalized);

        // Auto select first RFQ and load bids
        if (!this.selectedRfqId() && normalized.length) {
          this.viewBidsForRfq(normalized[0].rfqId);
        } else if (!normalized.length) {
          this.clearBids();
        }
      }),
      catchError(err => {
        console.error('Failed to load RFQs:', err);
        this.rfqError.set(this.humanize(err, 'Failed to load RFQs.'));
        this.rfqs.set([]);
        this.clearBids();
        return of([] as any[]);
      }),
      finalize(() => this.rfqLoading.set(false))
    ).subscribe();
  }

  // =========================
  // View bids for RFQ
  // GET /api/v1/sm/rfqs/{rfqId}/bids
  // =========================
  viewBidsForRfq(rfqId: number): void {
    this.selectedRfqId.set(rfqId);
    this.bidsError.set('');
    this.bidsLoading.set(true);

    this.bids.set([]);
    this.selectedBid.set(null);

    this.http.get<BidDto[]>(`${this.baseUrl}/rfqs/${rfqId}/bids`, { withCredentials: true }).pipe(
      catchError(err => {
        console.error(`Failed to load bids for RFQ ${rfqId}:`, err);
        this.bidsError.set(this.humanize(err, 'Failed to load bids.'));
        return of([] as BidDto[]);
      }),
      finalize(() => this.bidsLoading.set(false))
    ).subscribe(list => {
      const safe = Array.isArray(list) ? list : [];
      this.bids.set(safe);
      this.selectedBid.set(safe.length ? safe[0] : null);
    });
  }

  refreshBids(): void {
    const id = this.selectedRfqId();
    if (id) this.viewBidsForRfq(id);
  }

  selectBid(bid: BidDto): void {
    this.selectedBid.set(bid);
  }

  onSearchInput(e: Event): void {
    this.searchText.set((e.target as HTMLInputElement).value ?? '');
  }

  onStatusChange(e: Event): void {
    this.statusFilter.set((e.target as HTMLSelectElement).value || 'ALL');
  }

  onSortChange(e: Event): void {
    this.sortBy.set(((e.target as HTMLSelectElement).value as SortKey) || 'BID_DESC');
  }

  getTotalQty(bid: BidDto | null): number {
    if (!bid?.items?.length) return 0;
    return bid.items.reduce((sum, it) => sum + (Number(it.itemQuantity) || 0), 0);
  }

  getTotalValue(bid: BidDto | null): number {
    if (!bid?.items?.length) return 0;
    return bid.items.reduce((sum, it) =>
      sum + ((Number(it.itemQuantity) || 0) * (Number(it.itemPrice) || 0)), 0);
  }

  private clearBids(): void {
    this.selectedRfqId.set(null);
    this.bids.set([]);
    this.selectedBid.set(null);
  }

  private humanize(err: any, fallback: string): string {
    const s = err?.status;
    if (s === 401) return 'Unauthorized (401). Please login as MANAGER (session expired or cookie not sent).';
    if (s === 403) return 'Forbidden (403). Your user is not MANAGER.';
    if (s === 0) return 'Cannot reach backend (CORS / backend down).';
    return fallback;
  }
}