import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StateService } from '../../../core/services/state.service';
import { ToastService } from '../../../core/services/toast.service';
import { rfqIdValidator, notPastDateValidator } from '../../../core/utils/validators';

@Component({
  selector: 'app-quotation-dialog',
  templateUrl: './quotation-dialog.component.html',
  styleUrls: ['./quotation-dialog.component.scss']
})
export class QuotationDialogComponent {
  @ViewChild('dlg', { static: true }) dlg!: ElementRef<HTMLDialogElement>;

  editId: string | null = null;
  readOnlyRfq = false;
  title = 'Submit Quotation';
  sub = 'RFQ + amount + validity + delivery.';
  submitText = 'Submit';

  form = this.fb.group({
    rfqId: ['', [Validators.required, rfqIdValidator]],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    validUntil: ['', [Validators.required, notPastDateValidator]],
    deliveryDate: ['', [Validators.required, notPastDateValidator]],
    notes: ['']
  });

  constructor(private fb: FormBuilder, private state: StateService, private toast: ToastService) {}

  get rfqError(): string {
    const c = this.form.controls.rfqId;
    if (c.hasError('required')) return 'RFQ ID is required.';
    if (c.hasError('rfqId')) return 'RFQ ID must look like RFQ-1842.';
    return 'Invalid RFQ ID.';
  }

  open(opts?: { rfqId?: string; mode?: 'edit'; quoteId?: string }) {
    this.editId = null;
    this.readOnlyRfq = false;
    this.title = 'Submit Quotation';
    this.sub = 'RFQ + amount + validity + delivery.';
    this.submitText = 'Submit';
    this.form.reset();

    // edit mode
    if (opts?.mode === 'edit' && opts.quoteId) {
      const q = this.state.snapshot.quotations.find(x => x.id === opts.quoteId);
      if (q) {
        this.editId = q.id;
        this.title = `Edit Quotation ${q.id}`;
        this.sub = 'Update amount, validity and delivery dates.';
        this.submitText = 'Save Changes';
        this.form.patchValue({
          rfqId: q.rfqId, amount: q.amount,
          validUntil: q.validUntil, deliveryDate: q.deliveryDate, notes: q.notes || ''
        });
        this.readOnlyRfq = true;
      }
    } else if (opts?.rfqId) {
      this.title = `Submit Quotation for ${opts.rfqId}`;
      this.sub = 'RFQ is pre-filled from the selected RFQ.';
      this.form.patchValue({ rfqId: opts.rfqId });
      this.readOnlyRfq = true;
    }

    const d = this.dlg.nativeElement;
    (d as any).showModal ? d.showModal() : d.setAttribute('open','');
    setTimeout(() => d.querySelector('input,select,textarea,button')?.focus(), 0);
  }

  close() {
    const d = this.dlg.nativeElement;
    d.close ? d.close('cancel') : d.removeAttribute('open');
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;

    if (this.editId) {
      this.state.updateQuotation(this.editId, {
        amount: Number(v.amount),
        validUntil: String(v.validUntil),
        deliveryDate: String(v.deliveryDate),
        notes: (v.notes || '').trim(),
        status: 'Submitted'
      });
      this.toast.show('Quotation updated', `${this.editId} updated successfully.`);
    } else {
      const id = this.state.submitQuotation({
        rfqId: String(v.rfqId).trim().toUpperCase(),
        amount: Number(v.amount),
        validUntil: String(v.validUntil),
        deliveryDate: String(v.deliveryDate),
        notes: (v.notes || '').trim()
      });
      this.toast.show('Quotation submitted', `${id} created for ${String(v.rfqId).toUpperCase()}.`);
    }
    this.close();
  }
}
``