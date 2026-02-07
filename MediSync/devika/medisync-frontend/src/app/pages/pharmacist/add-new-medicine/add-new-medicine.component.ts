// import { Component, computed, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   AbstractControl,
//   FormArray,
//   FormBuilder,
//   ReactiveFormsModule,
//   ValidationErrors,
//   Validators
// } from '@angular/forms';
// import { RouterModule } from '@angular/router';

// type Vendor = { id: number; name: string };

// /** Custom validator: expiryDate must not be in the past */
// function notPastDateValidator(control: AbstractControl): ValidationErrors | null {
//   const val = control.value;
//   if (!val) return null;

//   const input = new Date(val);
//   if (isNaN(input.getTime())) return { invalidDate: true };

//   input.setHours(0, 0, 0, 0);

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   return input < today ? { pastDate: true } : null;
// }

// @Component({
//   selector: 'app-add-new-medicine',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterModule],
//   templateUrl: './add-new-medicine.component.html',
//   styleUrls: ['./add-new-medicine.component.css'],
// })
// export class AddNewMedicineComponent {
//   loading = signal(false);
//   submitted = signal(false);

//   private _errorMessage = signal('');
//   private _successMessage = signal('');

//   showErrorBanner = computed(() => !!this._errorMessage());
//   errorMessage = computed(() => this._errorMessage());

//   showSuccessBanner = computed(() => !!this._successMessage());
//   successMessage = computed(() => this._successMessage());

//   /** Used to set min date on the date input */
//   todayStr = new Date().toISOString().split('T')[0];

//   /** ✅ Vendor list (replace with API call later) */
//   vendors = signal<Vendor[]>([
//     { id: 1, name: 'ABC Pharma Supplies' },
//     { id: 2, name: 'Medico Wholesale' },
//     { id: 3, name: 'Kerala Drug Distributors' }
//   ]);

//   /** ✅ Batch form: vendorId is common; products is FormArray */
//   form = this.fb.group({
//     vendorId: ['', [Validators.required]],
//     products: this.fb.array([this.createProductGroup()])
//   });

//   constructor(private fb: FormBuilder) {}

//   /** convenience getter for template */
//   get f() {
//     return this.form.controls;
//   }

//   get products(): FormArray {
//     return this.form.get('products') as FormArray;
//   }

//   createProductGroup() {
//     return this.fb.group({
//       productName: ['', [Validators.required, Validators.minLength(2)]],
//       category: ['', [Validators.required, Validators.minLength(2)]],

//       /** ✅ Quantity must be > 0 */
//       quantityTotal: [
//         1,
//         [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]
//       ],

//       price: [null, [Validators.required, Validators.min(0.01)]],
//       expiryDate: ['', [Validators.required, notPastDateValidator]]
//     });
//   }

//   addProduct() {
//     this.products.push(this.createProductGroup());
//   }

//   removeProduct(index: number) {
//     // ✅ Prevent removing last row
//     if (this.products.length === 1) return;
//     this.products.removeAt(index);
//   }

//   control(i: number, name: string): AbstractControl {
//     return (this.products.at(i) as any).get(name) as AbstractControl;
//   }

//   trackByIndex(index: number) {
//     return index;
//   }

//   dismissError() { this._errorMessage.set(''); }
//   dismissSuccess() { this._successMessage.set(''); }

//   /** ✅ Clear the form ONLY when bottom Reset Form is clicked */
//   onReset() {
//     this.submitted.set(false);
//     this.dismissError();
//     this.dismissSuccess();

//     // Reset vendor
//     this.form.get('vendorId')?.setValue('');

//     // Reset products to ONE row
//     while (this.products.length > 1) this.products.removeAt(1);

//     // Reset first row values
//     this.products.at(0).reset({
//       productName: '',
//       category: '',
//       quantityTotal: 1,
//       price: null,
//       expiryDate: ''
//     });

//     // Clear touched/dirty state so red borders go away
//     this.form.markAsPristine();
//     this.form.markAsUntouched();
//     this.form.updateValueAndValidity();
//   }

//   async onSubmit() {
//     this.submitted.set(true);
//     this.dismissError();
//     this.dismissSuccess();

//     // ✅ show validation messages
//     this.form.markAllAsTouched();
//     this.form.updateValueAndValidity();

//     // ✅ block submit if invalid
//     if (this.form.invalid) {
//       this._errorMessage.set('Please fix validation errors and try again.');
//       return;
//     }

//     // ✅ Payload includes vendorId once + products array
//     const payload = this.form.value;

//     try {
//       this.loading.set(true);

//       // TODO: Replace with API call
//       // await firstValueFrom(this.inventoryService.createBatch(payload));

//       const count = payload.products?.length ?? 0;
//       this._successMessage.set(
//         `Saved batch from vendor ${payload.vendorId} with ${count} product(s).`
//       );

//       this.submitted.set(false);

//     } catch (e: any) {
//       this._errorMessage.set(e?.message || 'Failed to save batch. Please try again.');
//     } finally {
//       this.loading.set(false);
//     }
//   }
// }
import { Component, computed, signal } from '@angular/core';
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

type Vendor = { id: number; name: string };

/** Custom validator: date must not be in the past */
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

@Component({
  selector: 'app-add-new-medicine',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-new-medicine.component.html',
  styleUrls: ['./add-new-medicine.component.css'],
})
export class AddNewMedicineComponent {
  loading = signal(false);
  submitted = signal(false);

  private _errorMessage = signal('');
  private _successMessage = signal('');

  showErrorBanner = computed(() => !!this._errorMessage());
  errorMessage = computed(() => this._errorMessage());

  showSuccessBanner = computed(() => !!this._successMessage());
  successMessage = computed(() => this._successMessage());

  /** Used for min date and for auto deliveryDate */
  todayStr = new Date().toISOString().split('T')[0];

  /** Vendor list (replace with API later if needed) */
  vendors = signal<Vendor[]>([
    { id: 1, name: 'ABC Pharma Supplies' },
    { id: 2, name: 'Medico Wholesale' },
    { id: 3, name: 'Kerala Drug Distributors' }
  ]);

  /**
   * ✅ UI form (no deliveryDate field shown)
   * We'll send deliveryDate automatically in payload.
   */
  form = this.fb.group({
    vendorId: ['', [Validators.required]],
    products: this.fb.array([this.createProductGroup()])
  });

  constructor(
    private fb: FormBuilder,
    private pharmacistApi: PharmacistApiService
  ) {}

  get f() {
    return this.form.controls;
  }

  get products(): FormArray {
    return this.form.get('products') as FormArray;
  }

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

  control(i: number, name: string): AbstractControl {
    return (this.products.at(i) as any).get(name) as AbstractControl;
  }

  trackByIndex(index: number) {
    return index;
  }

  dismissError() { this._errorMessage.set(''); }
  dismissSuccess() { this._successMessage.set(''); }

  onReset() {
    this.submitted.set(false);
    this.dismissError();
    this.dismissSuccess();

    this.form.get('vendorId')?.setValue('');

    while (this.products.length > 1) this.products.removeAt(1);

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

  async onSubmit() {
    this.submitted.set(true);
    this.dismissError();
    this.dismissSuccess();

    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this._errorMessage.set('Please fix validation errors and try again.');
      return;
    }

    const raw = this.form.value;

    /**
     * ✅ Payload must match backend BatchCreateRequest:
     * {
     *   vendorId: Integer,
     *   deliveryDate: LocalDate,
     *   products: [...]
     * }
     *
     * We set deliveryDate automatically to todayStr so user doesn't type it.
     */
    const payload = {
      vendorId: Number(raw.vendorId),
      deliveryDate: this.todayStr, // ✅ AUTO
      products: (raw.products ?? []).map(p => ({
        productName: String(p?.productName ?? ''),
        category: String(p?.category ?? ''),
        quantityTotal: Number(p?.quantityTotal ?? 0),
        price: Number(p?.price ?? 0),
        expiryDate: String(p?.expiryDate ?? '') // yyyy-MM-dd from date input
      }))
    };

    try {
      this.loading.set(true);

      const res = await firstValueFrom(this.pharmacistApi.createBatch(payload));

      this._successMessage.set(
        `Batch #${res.batchId} saved with ${res.products?.length ?? 0} product(s).`
      );

      this.submitted.set(false);

      // Optional: clear form after success
      // this.onReset();

    } catch (e: any) {
      const msg =
        e?.error?.message ||
        (typeof e?.error === 'string' ? e.error : null) ||
        e?.message ||
        'Failed to save batch. Please try again.';
      this._errorMessage.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
