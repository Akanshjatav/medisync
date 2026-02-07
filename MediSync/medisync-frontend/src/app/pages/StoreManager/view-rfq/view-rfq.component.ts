import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, debounceTime, map, takeUntil } from 'rxjs/operators';
import { RfqApiService } from '../../../core/services/rfq-api-services';
import { RfqDto, RfqItemDto } from '../../../core/models/rfq.model';

/* ---------------- types ---------------- */

type RfqListItem = {
  rfq: RfqDto;
  items: RfqItemDto[];
  itemCount: number;
  totalQty: number;
};

type RfqDetailPayload = {
  rfq: {
    rfqId: number;
    createdBy: number;
    statusAward: string;
    submissionDeadline: string;
    expectedDeliveryDate: string;
  };
  items: Array<{
    rfqItemId: number;
    quantityNeeded: number;
    rfqItemName?: string;
  }>;
};

/* ---------------- component ---------------- */

@Component({
  selector: 'app-view-rfq',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './view-rfq.component.html',
  styleUrls: ['./view-rfq.component.css'],
})
export class ViewRfqComponent implements OnInit, OnDestroy {
  private rfqApi = inject(RfqApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  /* ---------- list state ---------- */
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  allRfqs = signal<RfqListItem[]>([]);
  filteredRfqs = signal<RfqListItem[]>([]);

  /* ---------- modal ---------- */
  detailOpen = signal(false);
  detailLoading = signal(false);
  detailError = signal<string | null>(null);
  selectedId = signal<number | null>(null);
  detail = signal<RfqDetailPayload | null>(null);

  /* ---------- edit ---------- */
  editMode = signal(false);
  editForm!: FormGroup;

  /* ---------- delete ---------- */
  deleteConfirmOpen = signal(false);
  deleteTargetId = signal<number | null>(null);
  deleteLoading = signal(false);
  showDeleteSuccess = signal(false);

  /* ---------- update success ---------- */
  showUpdateSuccess = signal(false);

  statusOptions = ['OPEN', 'AWARDED', 'CLOSED'];

  filtersForm = this.fb.group({
    q: [''],
    status: [''],
    fromDate: [''],
    toDate: [''],
    medicine: [''],
  });

  readonly todayStr = this.toDateOnly(new Date());

  /* ================= lifecycle ================= */

  ngOnInit(): void {
    this.loadRfqs();

    this.filtersForm.valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ================= load ================= */

  private loadRfqs(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.rfqApi.list().pipe(takeUntil(this.destroy$)).subscribe({
      next: (dtos) => {
        const list: RfqListItem[] = (dtos || []).map((d) => ({
          rfq: d,
          items: [],
          itemCount: 0,
          totalQty: 0,
        }));

        this.allRfqs.set(list);
        this.applyFilters();
        this.loading.set(false);

        const calls = list
          .filter((x) => x.rfq?.rfqId != null)
          .slice(0, 20)
          .map((x) =>
            this.rfqApi.getById(x.rfq.rfqId!).pipe(
              catchError(() => of(null)),
              map((payload) => ({ id: x.rfq.rfqId!, payload }))
            )
          );

        if (calls.length) {
          forkJoin(calls)
            .pipe(takeUntil(this.destroy$))
            .subscribe((results) => {
              const current = [...this.allRfqs()];
              results.forEach((res) => {
                if (!res?.payload) return;
                const idx = current.findIndex((r) => r.rfq.rfqId === res.id);
                if (idx >= 0) {
                  const items = res.payload.items || [];
                  current[idx] = {
                    ...current[idx],
                    items,
                    itemCount: items.length,
                    totalQty: items.reduce(
                      (s: number, it: any) =>
                        s + (Number(it?.quantityNeeded) || 0),
                      0
                    ),
                  };
                }
              });
              this.allRfqs.set(current);
              this.applyFilters();
            });
        }
      },
      error: () => {
        this.errorMsg.set('Failed to load RFQs.');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    const { q, status, medicine } = this.filtersForm.value;
    const qNorm = (q || '').toLowerCase();
    const medNorm = (medicine || '').toLowerCase();

    this.filteredRfqs.set(
      this.allRfqs().filter((row) => {
        const r = row.rfq;
        if (status && r.statusAward !== status) return false;
        if (
          qNorm &&
          !`${r.rfqId} ${r.statusAward}`.toLowerCase().includes(qNorm)
        )
          return false;
        if (
          medNorm &&
          !row.items.some((i) =>
            (i.rfqItemName || '').toLowerCase().includes(medNorm)
          )
        )
          return false;
        return true;
      })
    );
  }

  /* ================= navigation ================= */

  onCreateRfq(): void {
    this.router.navigate(['store-manager/rfq/create']);
  }

  /* ================= details ================= */

  openDetails(rfqId?: number): void {
    if (rfqId == null) return;

    this.selectedId.set(rfqId);
    this.detailOpen.set(true);
    this.detailLoading.set(true);
    this.detailError.set(null);
    this.editMode.set(false);

    this.rfqApi.getById(rfqId).subscribe({
      next: (payload) => {
        this.detail.set(payload as RfqDetailPayload);
        this.buildEditForm(payload as RfqDetailPayload);
        this.detailLoading.set(false);
      },
      error: () => {
        this.detailError.set('Failed to load RFQ details.');
        this.detailLoading.set(false);
      },
    });
  }

  onRowKeydown(e: KeyboardEvent, rfqId?: number): void {
    if ((e.key === 'Enter' || e.key === ' ') && rfqId != null) {
      e.preventDefault();
      this.openDetails(rfqId);
    }
  }

  closeDetails(): void {
    this.detailOpen.set(false);
    this.selectedId.set(null);
    this.detail.set(null);
    this.editMode.set(false);
  }

  /* ================= edit ================= */

  private buildEditForm(d: RfqDetailPayload): void {
    this.editForm = this.fb.group({
      rfq: this.fb.group({
        rfqId: new FormControl({ value: d.rfq.rfqId, disabled: true }),
        createdBy: new FormControl({ value: d.rfq.createdBy, disabled: true }),
        statusAward: new FormControl(d.rfq.statusAward, Validators.required),
        submissionDeadline: new FormControl(
          this.toDateOnlyFromLocal(d.rfq.submissionDeadline),
          Validators.required
        ),
        expectedDeliveryDate: new FormControl(
          this.toDateOnlyFromLocal(d.rfq.expectedDeliveryDate),
          Validators.required
        ),
      }),
      items: this.fb.array<FormGroup>(
        (d.items || []).map((it) =>
          this.fb.group({
            rfqItemName: [
              it.rfqItemName || '',
              [Validators.required, Validators.minLength(2)],
            ],
            quantityNeeded: [
              it.quantityNeeded,
              [Validators.required, Validators.min(1)],
            ],
          })
        )
      ),
    });
  }

  get rfqEditGroup(): FormGroup {
    return this.editForm.get('rfq') as FormGroup;
  }

  get editItems(): FormArray<FormGroup> {
    return this.editForm.get('items') as FormArray<FormGroup>;
  }

  addItemEdit(): void {
    this.editItems.push(
      this.fb.group({
        rfqItemName: ['', [Validators.required, Validators.minLength(2)]],
        quantityNeeded: [1, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removeItemEdit(i: number): void {
    this.editItems.removeAt(i);
  }

  startEdit(): void {
    this.editMode.set(true);
  }

  cancelEdit(): void {
    const d = this.detail();
    if (d) this.buildEditForm(d);
    this.editMode.set(false);
  }

  saveEdit(): void {
    if (!this.editForm.valid || this.selectedId() == null) return;

    const raw = this.editForm.getRawValue();
    const id = this.selectedId()!;

    const payload = {
      rfq: {
        rfqId: id,
        createdBy: raw.rfq.createdBy,
        statusAward: raw.rfq.statusAward,
        submissionDeadline: `${raw.rfq.submissionDeadline}T00:00:00`,
        expectedDeliveryDate: `${raw.rfq.expectedDeliveryDate}T00:00:00`,
      },
      items: raw.items,
    };

    this.detailLoading.set(true);
    this.rfqApi.update(id, payload).subscribe({
      next: (updated) => {
        this.detail.set(updated as any);
        this.detailLoading.set(false);
        this.editMode.set(false);
        this.showUpdateSuccess.set(true);
      },
      error: () => {
        this.detailLoading.set(false);
        this.detailError.set('Update failed.');
      },
    });
  }

  /* ================= delete ================= */

  openDeleteConfirm(id: number): void {
    this.deleteTargetId.set(id);
    this.deleteConfirmOpen.set(true);
  }

  closeDeleteConfirm(): void {
    this.deleteConfirmOpen.set(false);
    this.deleteTargetId.set(null);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (id == null) return;

    this.deleteLoading.set(true);
    this.rfqApi.delete(id).subscribe({
      next: () => {
        this.allRfqs.set(this.allRfqs().filter((r) => r.rfq.rfqId !== id));
        this.applyFilters();
        this.deleteLoading.set(false);
        this.deleteConfirmOpen.set(false);
        this.showDeleteSuccess.set(true);
      },
      error: () => {
        this.deleteLoading.set(false);
        alert('Delete failed');
      },
    });
  }

  closeDeleteSuccess(): void {
    this.showDeleteSuccess.set(false);
  }

  closeUpdateSuccess(): void {
    this.showUpdateSuccess.set(false);
  }

  /* ================= helpers ================= */

  trackById = (_: number, row: RfqListItem) => row.rfq.rfqId;
  trackByIndex(index: number): number {
    return index;
  }

  private toDateOnly(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private toDateOnlyFromLocal(s: string): string {
    return s ? s.slice(0, 10) : '';
  }
}
