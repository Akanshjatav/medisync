import { Component, inject, OnInit, OnDestroy, PLATFORM_ID, Renderer2 } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RfqApiService } from '../../../core/services/rfq-api-services';
import { RfqItemDto, RfqPayloadDto } from '../../../core/models/rfq.model';

@Component({
  selector: 'app-rfq-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './rfq-create.component.html',
  styleUrls: ['./rfq-create.component.css']
})
export class RfqCreateComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private api = inject(RfqApiService);
  private router = inject(Router);

  private platformId = inject(PLATFORM_ID);
  private renderer = inject(Renderer2);
  private removeKeyListener?: () => void;

  // ✅ Default user id (no session management now)
  private readonly DEFAULT_CREATED_BY = 4;

  showErrorBox = false;
  errorBoxMessage = '';
  year = new Date().getFullYear();
  readonly todayStr = this.toDateOnly(new Date());
  showSuccess = false;

  form = this.fb.group({
    rfq: this.fb.group({
      createdBy: [this.DEFAULT_CREATED_BY], // ✅ always 4
      statusAward: ['OPEN'],               // hidden; default OPEN
      submissionDeadline: ['', [Validators.required, this.nonPastDate()]],
      expectedDeliveryDate: ['', [Validators.required, this.nonPastDate()]],
    }),
    items: this.fb.array([this.createItemGroup()])
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.removeKeyListener = this.renderer.listen('window', 'keydown', this.handleKey);
    }

    // ✅ Always set hidden defaults on init
    this.rfqGroup.patchValue({
      createdBy: this.DEFAULT_CREATED_BY,
      statusAward: 'OPEN'
    });
  }

  ngOnDestroy(): void {
    if (this.removeKeyListener) this.removeKeyListener();
  }

  handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.showSuccess) this.closeSuccess();
  };

  get rfqGroup(): FormGroup { return this.form.get('rfq') as FormGroup; }
  get items(): FormArray<FormGroup> { return this.form.get('items') as FormArray<FormGroup>; }

  private createItemGroup(): FormGroup {
    return this.fb.group({
      rfqItemName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      quantityNeeded: [null, [Validators.required, Validators.min(1)]],
    });
  }

  private nonPastDate(): ValidatorFn {
    return (control: AbstractControl) => {
      const v = control.value; if (!v) return null;
      const picked = new Date(v); if (isNaN(picked.getTime())) return { invalidDate: true };
      const today = new Date(); today.setHours(0, 0, 0, 0); picked.setHours(0, 0, 0, 0);
      return picked >= today ? null : { pastDate: true };
    };
  }

  private toDateOnly(d: Date): string {
    const yyyy = d.getFullYear(),
      mm = String(d.getMonth() + 1).padStart(2, '0'),
      dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  addItem() { this.items.push(this.createItemGroup()); }
  removeItem(i: number) { if (this.items.length > 1) this.items.removeAt(i); }

  private toLocalDateTimeString(dateStr: string): string {
    const [y, m, d] = (dateStr || '').split('-').map(Number);
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

  onSubmit() {
    this.showErrorBox = false;
    this.errorBoxMessage = '';

    // ✅ Enforce hidden values before validation + submit
    this.rfqGroup.patchValue({
      createdBy: this.DEFAULT_CREATED_BY,
      statusAward: 'OPEN'
    });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showErrorBox = true;
      this.errorBoxMessage = 'Please fix the highlighted issues before submitting.';
      this.focusFirstInvalid();
      return;
    }

    const raw = this.form.getRawValue();

    const payload: RfqPayloadDto = {
      rfq: {
        createdBy: this.DEFAULT_CREATED_BY, // ✅ always 4
        statusAward: 'OPEN',
        submissionDeadline: this.toLocalDateTimeString(raw.rfq!.submissionDeadline!),
        expectedDeliveryDate: this.toLocalDateTimeString(raw.rfq!.expectedDeliveryDate!)
      },
      items: (raw.items || []).map((it): RfqItemDto => ({
        rfqItemId: undefined,
        rfqItemName: String((it as any)['rfqItemName'] || '').trim(),
        quantityNeeded: Number((it as any)['quantityNeeded'] ?? 0)
      }))
    };

    this.api.create(payload).subscribe({
      next: () => {
        this.showSuccess = true;

        // Reset form to initial defaults
        this.form.reset({
          rfq: {
            createdBy: this.DEFAULT_CREATED_BY,
            statusAward: 'OPEN',
            submissionDeadline: '',
            expectedDeliveryDate: ''
          },
          items: []
        });

        // Rebuild items with one empty row
        while (this.items.length) this.items.removeAt(0);
        this.items.push(this.createItemGroup());

        // Ensure defaults after reset (extra-safe)
        this.rfqGroup.patchValue({
          createdBy: this.DEFAULT_CREATED_BY,
          statusAward: 'OPEN'
        });
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          err?.message ||
          'Something went wrong. Please try again.';
        this.showErrorBox = true;
        this.errorBoxMessage = msg;
      }
    });
  }

  closeSuccess() {
    this.showSuccess = false;
    this.router.navigate(['storemanager/rfq']); // redirect after success
  }

  trackByIndex = (i: number) => i;
}