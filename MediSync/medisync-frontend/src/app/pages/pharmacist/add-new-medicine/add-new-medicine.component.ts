import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { PharmacistApiService } from '../../../core/services/pharmacist-api.service';
import { VendorService, VendorApiResponse } from '../../../core/services/vendor.service';

/* ================= TYPES ================= */

type Vendor = {
  id: number;
  name: string;
};

/* ================= VALIDATORS ================= */

function notPastDateValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value;
  if (!val) return null;

  const input = new Date(val);
  if (isNaN(input.getTime())) return { invalidDate: true };

  input.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return input < today ? { pastDate: true } : null;
}

/* ================= COMPONENT ================= */

@Component({
  selector: 'app-add-new-medicine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-new-medicine.component.html',
  styleUrls: ['./add-new-medicine.component.css'],
})
export class AddNewMedicineComponent implements OnInit {

  /* ================= STATE ================= */

  loading = signal(false);
  submitted = signal(false);

  vendors = signal<Vendor[]>([]);
  vendorsLoading = signal(false);
  vendorsError = signal('');

  private _errorMessage = signal('');
  private _successMessage = signal('');

  showErrorBanner = computed(() => !!this._errorMessage());
  errorMessage = computed(() => this._errorMessage());

  showSuccessBanner = computed(() => !!this._successMessage());
  successMessage = computed(() => this._successMessage());

  todayStr = new Date().toISOString().split('T')[0];

  /* ================= FORM ================= */

  form = this.fb.group({
    vendorId: ['', [Validators.required]],
    products: this.fb.array([this.createProductGroup()])
  });

  constructor(
    private fb: FormBuilder,
    private pharmacistApi: PharmacistApiService,
    private vendorService: VendorService
  ) {}

  ngOnInit(): void {
    this.loadAwardedVendors();
  }

  /* ================= TEMPLATE HELPERS (REQUIRED) ================= */

  get f() {
    return this.form.controls;
  }

  get products(): FormArray {
    return this.form.get('products') as FormArray;
  }

  control(index: number, name: string): AbstractControl {
    return (this.products.at(index) as any).get(name) as AbstractControl;
  }

  trackByIndex(index: number): number {
    return index;
  }

  /* ================= VENDORS ================= */

  private loadAwardedVendors(): void {
    this.vendorsLoading.set(true);
    this.vendorsError.set('');

    this.vendorService.getAwardedVendors().subscribe({
      next: (res: VendorApiResponse[]) => {
        this.vendors.set(
          res.map(v => ({
            id: v.vendorId,
            name: v.businessName
          }))
        );
        this.vendorsLoading.set(false);
      },
      error: () => {
        this.vendorsError.set('Failed to load vendors');
        this.vendorsLoading.set(false);
      }
    });
  }

  /* ================= FORM BUILDERS ================= */

  createProductGroup() {
    return this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', [Validators.required, Validators.minLength(2)]],
      quantityTotal: [
        1,
        [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]
      ],
      price: [null, [Validators.required, Validators.min(0.01)]],
      expiryDate: ['', [Validators.required, notPastDateValidator]]
    });
  }

  addProduct() {
    this.products.push(this.createProductGroup());
  }

  removeProduct(index: number) {
    if (this.products.length === 1) return;
    this.products.removeAt(index);
  }

  /* ================= UI HELPERS ================= */

  dismissError() {
    this._errorMessage.set('');
  }

  dismissSuccess() {
    this._successMessage.set('');
  }

  onReset(): void {
    this.submitted.set(false);
    this.dismissError();
    this.dismissSuccess();

    this.form.get('vendorId')?.setValue('');

    while (this.products.length > 1) {
      this.products.removeAt(1);
    }

    this.products.at(0).reset({
      productName: '',
      category: '',
      quantityTotal: 1,
      price: null,
      expiryDate: ''
    });

    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.form.updateValueAndValidity();
  }

  /* ================= SUBMIT ================= */

  async onSubmit() {
    this.submitted.set(true);
    this.dismissError();
    this.dismissSuccess();

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this._errorMessage.set('Please fix validation errors and try again.');
      return;
    }

    const raw = this.form.value;

    const payload = {
      vendorId: Number(raw.vendorId),
      deliveryDate: this.todayStr,
      products: (raw.products ?? []).map(p => ({
        productName: String(p?.productName ?? ''),
        category: String(p?.category ?? ''),
        quantityTotal: Number(p?.quantityTotal ?? 0),
        price: Number(p?.price ?? 0),
        expiryDate: String(p?.expiryDate ?? '')
      }))
    };

    try {
      this.loading.set(true);

      const res = await firstValueFrom(
        this.pharmacistApi.createBatch(payload)
      );

      this._successMessage.set(
        `Batch #${res.batchId} saved with ${res.products?.length ?? 0} product(s).`
      );

      this.submitted.set(false);

    } catch (e: any) {
      this._errorMessage.set(
        e?.error?.message ||
        e?.message ||
        'Failed to save batch. Please try again.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
