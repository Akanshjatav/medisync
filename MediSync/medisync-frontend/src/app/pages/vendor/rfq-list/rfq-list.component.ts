import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, takeUntil, catchError, finalize, tap } from 'rxjs/operators';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// ✅ Use your existing RFQ models
import { RfqPayloadDto } from '../../../core/models/rfq.model';

/**
 * UI model used by this list
 * (we map backend RFQ payload into this shape)
 */
interface RfqItem {
  id: number;
  title: string;
  storeName: string;
  status: string;      // backend uses rfq.statusAward (string)
  deadline: Date | null;
  deliveryDate: Date | null;
}

@Component({
  selector: 'app-rfq-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './rfq-list.component.html',
  styleUrls: ['./rfq-list.component.css']
})
export class RfqListComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();

  // ✅ CHANGE THIS to your vendor RFQ endpoint
  // If your backend uses a different path, update here.
  private readonly baseUrl = 'http://localhost:7000/api/v1/vendors';

  // Page state using signals
  loading = signal<boolean>(false);
  allRfqs = signal<RfqItem[]>([]);
  filteredRfqs = signal<RfqItem[]>([]);
  errorMsg = signal<string | null>(null);

  // Options for filter dropdown
  // (You can also build this dynamically from response if you want)
  statusOptions = ['Under Review', 'Submitted', 'AWARDED', 'OPEN', 'CANCELLED'];

  filtersForm = this.fb.group({
    q: [''],
    status: [''],
    fromDate: [''],
    toDate: ['']
  });

  ngOnInit(): void {
    this.loadRfqs();

    // Apply filters on form changes
    this.filtersForm.valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ✅ Fetch RFQs from backend (instead of mock)
   * Expected API shape: RfqPayloadDto[]
   */
  private loadRfqs(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.http
      .get<RfqPayloadDto[]>(`${this.baseUrl}/rfqs`, { withCredentials: true })
      .pipe(
        tap((rows) => {
          const payloads = Array.isArray(rows) ? rows : [];
          const mapped = payloads.map((p) => this.mapPayloadToListItem(p));

          this.allRfqs.set(mapped);
          this.filteredRfqs.set(mapped);

          // Optional: if you want statusOptions to match backend dynamically:
          // const uniqueStatuses = Array.from(new Set(mapped.map(x => x.status).filter(Boolean)));
          // this.statusOptions = uniqueStatuses.length ? uniqueStatuses : this.statusOptions;
        }),
        catchError((err) => {
          console.error('RFQ list error:', err);

          if (err?.status === 0) {
            this.errorMsg.set('Cannot reach backend (CORS / backend down).');
          } else if (err?.status === 401) {
            this.errorMsg.set('Unauthorized (401). Please login as VENDOR and try again.');
          } else if (err?.status === 403) {
            this.errorMsg.set('Forbidden (403). Your user is not VENDOR.');
          } else {
            this.errorMsg.set(`Failed to load RFQs (${err?.status || 'unknown'}).`);
          }

          this.allRfqs.set([]);
          this.filteredRfqs.set([]);
          return of([] as RfqPayloadDto[]);
        }),
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  /**
   * Map backend DTO -> UI list item
   * Uses your rfq.model.ts fields:
   * - rfqId
   * - statusAward
   * - submissionDeadline
   * - expectedDeliveryDate
   * and items (rfqItemName, quantityNeeded)
   */
  private mapPayloadToListItem(p: RfqPayloadDto): RfqItem {
    const id = Number(p?.rfq?.rfqId ?? 0);

    // backend field: statusAward
    const status = String((p as any)?.rfq?.statusAward ?? (p as any)?.rfq?.status ?? '').trim();

    // deadlines from backend model (strings)
    const deadline = this.safeDate((p as any)?.rfq?.submissionDeadline);
    const deliveryDate = this.safeDate((p as any)?.rfq?.expectedDeliveryDate);

    // Build a friendly title:
    // use first item name + count, else fallback to RFQ #id
    const items = Array.isArray(p?.items) ? p.items : [];
    const firstName =
      (items[0] as any)?.rfqItemName ||
      (items[0] as any)?.productName ||
      (items[0] as any)?.name ||
      null;

    const title =
      firstName
        ? `${firstName}${items.length > 1 ? ` +${items.length - 1} more` : ''}`
        : `RFQ #${id || '—'}`;

    // storeName is not in your rfq.model.ts
    // fallback to something meaningful, or "—"
    // If backend later sends storeName, this will pick it automatically.
    const storeName =
      String((p as any)?.rfq?.storeName ?? (p as any)?.rfq?.store?.name ?? '—');

    return {
      id,
      title,
      storeName,
      status: status || '—',
      deadline,
      deliveryDate
    };
  }

  private safeDate(val: any): Date | null {
    if (!val) return null;
    const d = new Date(String(val));
    return isNaN(d.getTime()) ? null : d;
  }

  private applyFilters(): void {
    const filters = this.filtersForm.value;
    let result = [...this.allRfqs()];

    // Search query filter
    if (filters.q) {
      const query = filters.q.toLowerCase().trim();
      result = result.filter((rfq) =>
        (rfq.title || '').toLowerCase().includes(query) ||
        (rfq.storeName || '').toLowerCase().includes(query) ||
        rfq.id.toString().includes(query)
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter((rfq) => rfq.status === filters.status);
    }

    // Date filters (based on deadline)
    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      result = result.filter((rfq) => rfq.deadline ? rfq.deadline >= from : false);
    }

    if (filters.toDate) {
      const to = new Date(filters.toDate);
      result = result.filter((rfq) => rfq.deadline ? rfq.deadline <= to : false);
    }

    this.filteredRfqs.set(result);
  }

 goToCreateBid(rfqId: number): void {
  this.router.navigate(['/vendor/create-bids', rfqId]);
}

  trackById(index: number, item: RfqItem): number {
    return item.id;
  }

  // Optional: expose reload button usage
  reload(): void {
    this.loadRfqs();
  }
}