import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil } from 'rxjs/operators';
import { RfqApiService } from '../../../core/services/rfq-api-services';
import { RfqDto, RfqItemDto } from '../../../core/models/rfq.model';

type RfqListItem = {
  rfq: RfqDto;
  items: RfqItemDto[];
  itemCount: number;
  totalQty: number;
};

type RfqDetailPayload = {
  rfq: {
    createdBy: number;
    expectedDeliveryDate: string;
    rfqId: number;
    statusAward: string;
    submissionDeadline: string;
  };
  items: Array<{
    rfqItemId: number;
    quantityNeeded: number;
    rfqItemName?: string;
  }>;
};

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

  // page state
  loading = signal<boolean>(false);
  allRfqs = signal<RfqListItem[]>([]);
  filteredRfqs = signal<RfqListItem[]>([]);
  errorMsg = signal<string | null>(null);

  // modal state (details + edit)
  detailOpen = signal<boolean>(false);
  detailLoading = signal<boolean>(false);
  detailError = signal<string | null>(null);
  selectedId = signal<number | null>(null);
  detail = signal<RfqDetailPayload | null>(null);

  // edit state inside modal
  editMode = signal<boolean>(false);
  editForm!: FormGroup;

  // success popup (update)
  showUpdateSuccess = signal<boolean>(false);

  // delete confirmation + success
  deleteConfirmOpen = signal<boolean>(false);
  deleteTargetId = signal<number | null>(null);
  deleteLoading = signal<boolean>(false);
  showDeleteSuccess = signal<boolean>(false);

  statusOptions = ['OPEN', 'AWARDED', 'CANCELLED', 'CLOSED', 'DRAFT', 'PENDING'];
  filtersForm = this.fb.group({
    q: [''],
    status: [''],
    fromDate: [''],
    toDate: [''],
    medicine: [''],
  });

  readonly todayStr = this.toDateOnly(new Date());

  // --------------- lifecycle ---------------
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

  // --------------- list load & filter ---------------
  private loadRfqs(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.rfqApi
      .list()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

          // Optional hydration for counts
          const top = list.slice(0, 20);
          const calls = top
            .filter((x) => !!x.rfq?.rfqId)
            .map((x) =>
              this.rfqApi.getById(x.rfq.rfqId!).pipe(
                catchError(() => of(null)),
                map((payload) => ({ id: x.rfq.rfqId, payload }))
              )
            );

          if (calls.length > 0) {
            forkJoin(calls)
              .pipe(takeUntil(this.destroy$))
              .subscribe((results) => {
                const current = [...this.allRfqs()];
                results.forEach((res) => {
                  if (!res?.payload) return;
                  const idx = current.findIndex((r) => r.rfq.rfqId === res.id);
                  if (idx >= 0) {
                    const items = (res.payload.items || []).filter(Boolean) as RfqItemDto[];
                    const itemCount = items.length;
                    const totalQty = items.reduce(
                      (s, it: any) => s + (Number(it?.quantityNeeded) || 0),
                      0
                    );
                    current[idx] = { ...current[idx], items, itemCount, totalQty };
                  }
                });
                this.allRfqs.set(current);
                this.applyFilters();
              });
          }
        },
        error: (err) => {
          console.error(err);
          this.errorMsg.set('Failed to load RFQs. Please check API and try again.');
          this.allRfqs.set([]);
          this.filteredRfqs.set([]);
          this.loading.set(false);
        },
      });
  }

  applyFilters(): void {
    const { q, status, fromDate, toDate, medicine } = this.filtersForm.value;
    const fFrom = fromDate ? new Date(fromDate as string) : null;
    const fTo = toDate ? new Date(toDate as string) : null;
    const qNorm = (q || '').toString().trim().toLowerCase();
    const medNorm = (medicine || '').toString().trim().toLowerCase();

    const out = this.allRfqs().filter((row) => {
      const r = row.rfq;

      if (status && status !== '' && r.statusAward !== status) return false;

      if (fFrom || fTo) {
        const dStr = r.submissionDeadline || r.expectedDeliveryDate || null;
        const d = dStr ? new Date(dStr as any) : null;
        if (d) {
          if (fFrom && d < fFrom) return false;
          if (fTo) {
            const toPlus = new Date(fTo);
            toPlus.setHours(23, 59, 59, 999);
            if (d > toPlus) return false;
          }
        } else {
          return false;
        }
      }

      if (medNorm) {
        const hasMed = (row.items || []).some((it: any) =>
          (it?.rfqItemName || '').toString().toLowerCase().includes(medNorm)
        );
        if (!hasMed) return false;
      }

      if (qNorm) {
        const hay = [
          r?.rfqId?.toString() || '',
          r?.statusAward || '',
          r?.createdBy?.toString() || '',
          r?.submissionDeadline || '',
          r?.expectedDeliveryDate || '',
          (row.items || []).map((it: any) => (it?.rfqItemName || '')).join(' '),
        ]
          .join(' ')
          .toLowerCase();

        if (!hay.includes(qNorm)) return false;
      }

      return true;
    });

    this.filteredRfqs.set(out);
  }

  // --------------- list actions ---------------
  onCreateRfq(): void {
    this.router.navigate(['storemanager/rfq/create']);
  }

  openDeleteConfirm(rfqId?: number): void {
    if (!rfqId) return;
    this.deleteTargetId.set(rfqId);
    this.deleteConfirmOpen.set(true);
    this.deleteLoading.set(false);
  }

  closeDeleteConfirm(): void {
    this.deleteConfirmOpen.set(false);
    this.deleteTargetId.set(null);
    this.deleteLoading.set(false);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (!id) return;
    this.deleteLoading.set(true);
    this.rfqApi.delete(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.allRfqs.set(this.allRfqs().filter((r) => r.rfq.rfqId !== id));
        this.applyFilters();

        this.deleteLoading.set(false);
        this.deleteConfirmOpen.set(false);
        this.showDeleteSuccess.set(true);

        this.router.navigate(['/rfq']);
      },
      error: (err) => {
        console.error(err);
        this.deleteLoading.set(false);
        alert('Delete failed. Please try again.');
      },
    });
  }

  // --------------- modal open/close ---------------
  openDetails(rfqId?: number): void {
    if (!rfqId) return;
    this.selectedId.set(rfqId);
    this.detailOpen.set(true);
    this.detailLoading.set(true);
    this.detailError.set(null);
    this.detail.set(null);
    this.editMode.set(false);

    this.rfqApi.getById(rfqId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (payload) => {
        this.detail.set(payload as RfqDetailPayload);
        this.buildEditForm(payload as RfqDetailPayload);
        this.detailLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.detailError.set('Failed to load RFQ details. Please try again.');
        this.detailLoading.set(false);
      },
    });
  }

  closeDetails(): void {
    this.detailOpen.set(false);
    this.selectedId.set(null);
    this.detail.set(null);
    this.editMode.set(false);
    this.detailError.set(null);
    this.detailLoading.set(false);
  }

  onRowKeydown(e: KeyboardEvent, rfqId?: number) {
    if ((e.key === 'Enter' || e.key === ' ') && rfqId) {
      e.preventDefault();
      this.openDetails(rfqId);
    }
  }

  // --------------- edit form in modal ---------------
  private buildEditForm(d: RfqDetailPayload) {
    this.editForm = this.fb.group({
      rfq: this.fb.group({
        rfqId: new FormControl({ value: d.rfq.rfqId, disabled: true }),
        createdBy: new FormControl({ value: d.rfq.createdBy, disabled: true }),
        statusAward: new FormControl(d.rfq.statusAward, [Validators.required]),
        submissionDeadline: new FormControl(
          this.toDateOnlyFromLocalDateTime(d.rfq.submissionDeadline),
          [Validators.required]
        ),
        expectedDeliveryDate: new FormControl(
          this.toDateOnlyFromLocalDateTime(d.rfq.expectedDeliveryDate),
          [Validators.required]
        ),
      }),
      items: this.fb.array((d.items || []).map((it) => this.createItemGroup(it)), []),
    });
  }

  private createItemGroup(it?: any): FormGroup {
    return this.fb.group({
      rfqItemName: new FormControl(it?.rfqItemName ?? '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(255),
      ]),
      quantityNeeded: new FormControl(it?.quantityNeeded ?? null, [
        Validators.required,
        Validators.min(1),
      ]),
    });
  }

  get rfqEditGroup(): FormGroup {
    return this.editForm.get('rfq') as FormGroup;
  }

  get editItems(): FormArray<FormGroup> {
    return this.editForm.get('items') as FormArray<FormGroup>;
  }

  addItemEdit() {
    this.editItems.push(this.createItemGroup());
  }

  removeItemEdit(i: number) {
    this.editItems.removeAt(i);
  }

  startEdit() {
    this.editMode.set(true);
  }

  cancelEdit() {
    const d = this.detail();
    if (!d) return;
    this.buildEditForm(d);
    this.editMode.set(false);
  }

  saveEdit() {
    if (!this.editForm || this.editForm.invalid || !this.selectedId()) {
      this.editForm?.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }

    const id = this.selectedId()!;
    const raw = this.editForm.getRawValue();

    const current = this.detail();
    const createdBy = current?.rfq?.createdBy ?? raw.rfq.createdBy;

    const payload = {
      rfq: {
        rfqId: id,
        createdBy,
        statusAward: String(raw.rfq.statusAward).trim(),
        submissionDeadline: this.toLocalDateTimeString(raw.rfq.submissionDeadline),
        expectedDeliveryDate: this.toLocalDateTimeString(raw.rfq.expectedDeliveryDate),
      },
      items: (raw.items || []).map((it: any) => ({
        rfqItemName: String(it.rfqItemName || '').trim(),
        quantityNeeded: Number(it.quantityNeeded),
      })),
    };

    this.detailLoading.set(true);
    this.rfqApi.update(id, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        this.detail.set(updated as any);

        const list = [...this.allRfqs()];
        const idx = list.findIndex((x) => x.rfq.rfqId === id);
        if (idx >= 0) {
          list[idx].rfq = {
            ...list[idx].rfq,
            statusAward: (updated as any)?.rfq?.statusAward,
            submissionDeadline: (updated as any)?.rfq?.submissionDeadline,
            expectedDeliveryDate: (updated as any)?.rfq?.expectedDeliveryDate,
          };
          const items = ((updated as any)?.items || []) as any[];
          list[idx].items = items as any;
          list[idx].itemCount = items.length;
          list[idx].totalQty = items.reduce(
            (s, it: any) => s + (Number(it?.quantityNeeded) || 0),
            0
          );
          this.allRfqs.set(list);
          this.applyFilters();
        }

        this.detailLoading.set(false);
        this.editMode.set(false);
        this.showUpdateSuccess.set(true);
      },
      error: (err) => {
        console.error(err);
        this.detailLoading.set(false);
        this.detailError.set('Update failed. Please review inputs and try again.');
      },
    });
  }

  // --------------- helpers ---------------
  private toDateOnly(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private toDateOnlyFromLocalDateTime(s: string | null | undefined): string {
    if (!s) return '';
    return s.slice(0, 10);
  }

  private toLocalDateTimeString(dateStr: string): string {
    const [y, m, d] = (dateStr || '').split('-').map((n) => Number(n));
    const yyyy = String(y).padStart(4, '0');
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T00:00:00`;
  }

  private focusFirstInvalid() {
    const el = document.querySelector(
      'input.ng-invalid, select.ng-invalid, textarea.ng-invalid'
    ) as HTMLElement | null;
    el?.focus();
  }

  // popups closing
  closeUpdateSuccess() {
    this.showUpdateSuccess.set(false);
  }

  closeDeleteSuccess() {
    this.showDeleteSuccess.set(false);
  }

  // trackBys
  trackById = (index: number, row: RfqListItem) => row?.rfq?.rfqId ?? index;

  trackByIndex(index: number): number {
    return index;
  }
}