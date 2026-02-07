import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';

export interface Branch {
  id: string;
  name: string;
  location?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface StockRequestLine {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface StockRequestPayload {
  branchId: string;
  branchName: string;
  notes?: string;
  lines: StockRequestLine[];
  totalAmount: number;
  totalQuantity: number;
}

@Component({
  selector: 'app-stock-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock-request.component.html',
  styleUrls: ['./stock-request.component.scss']
})
export class StockRequestComponent {
  @Input({ required: true }) branches: Branch[] = [];
  @Input({ required: true }) products: Product[] = [];

  @Input() currencySymbol = '₹';
  @Input() title = 'Stock Request';
  @Input() hint = 'Select a branch, add items, and submit your request.';

  @Output() submitRequest = new EventEmitter<StockRequestPayload>();

  message: { type: 'success' | 'error' | 'info'; text: string } | null = null;
  submitting = false;

  /** ✅ controls when to show red validation messages */
  submittedAttempt = false;

  form = this.fb.group({
    branchId: ['', Validators.required],
    notes: [''],
    lines: this.fb.array([])
  });

  constructor(private fb: FormBuilder) {
    this.addLine();
  }

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  /** ✅ helper: show error if user touched OR pressed submit once */
  showError(control: AbstractControl | null): boolean {
    if (!control) return false;
    return control.invalid && (control.touched || this.submittedAttempt);
  }

  addLine(): void {
    const group = this.fb.group({
      productId: ['', Validators.required],
      price: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });

    group.get('productId')!.valueChanges.subscribe((productId) => {
      const p = this.products.find(x => x.id === productId);
      group.get('price')!.setValue(p?.price ?? 0, { emitEvent: false });
      this.clearMessage();
    });

    this.lines.push(group);
    this.clearMessage();
  }

  removeLine(index: number): void {
    if (this.lines.length === 1) return;
    this.lines.removeAt(index);
    this.clearMessage();
  }

  trackByIndex = (i: number) => i;

  getLineTotal(i: number): number {
    const g = this.lines.at(i);
    const price = Number(g.get('price')!.value ?? 0);
    const qty = Number(g.get('quantity')!.value ?? 0);
    return price * qty;
  }

  get totalQuantity(): number {
    return this.lines.controls.reduce((sum, g) => sum + Number(g.get('quantity')!.value ?? 0), 0);
  }

  get totalAmount(): number {
    return this.lines.controls.reduce((sum, _, i) => sum + this.getLineTotal(i), 0);
  }

  private clearMessage() {
    if (this.message?.type !== 'info') this.message = null;
  }

  submit(): void {
    this.message = null;

    /** ✅ turn on validation messages */
    this.submittedAttempt = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message = { type: 'error', text: 'Please fix the highlighted errors before submitting.' };
      return;
    }

    const validLines = this.lines.controls
      .map(g => {
        const productId = String(g.get('productId')!.value);
        const product = this.products.find(p => p.id === productId);
        return {
          productId,
          productName: product?.name ?? '',
          price: Number(g.get('price')!.value ?? 0),
          quantity: Number(g.get('quantity')!.value ?? 0),
        };
      })
      .filter(x => x.productId && x.quantity > 0);

    const branchId = String(this.form.get('branchId')!.value);
    const branch = this.branches.find(b => b.id === branchId);

    const payload: StockRequestPayload = {
      branchId,
      branchName: branch?.name ?? '',
      notes: this.form.get('notes')!.value ?? '',
      lines: validLines,
      totalAmount: this.totalAmount,
      totalQuantity: this.totalQuantity
    };

    this.submitting = true;
    this.submitRequest.emit(payload);
    this.submitting = false;

    this.message = { type: 'success', text: 'Stock request submitted successfully!' };
  }
}