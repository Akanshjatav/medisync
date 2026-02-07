import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

function integerMin(min: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v === null || v === undefined || v === '') return null;
    const num = Number(v);
    if (!Number.isFinite(num) || !Number.isInteger(num) || num < min) {
      return { integerMin: { min } };
    }
    return null;
  };
}

type RecentRequest = {
  medicineName: string;
  requiredQty: number;
  date: string;
  status: 'Pending Approval';
};

@Component({
  selector: 'app-request-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './request-stock.component.html',
  styleUrls: ['./request-stock.component.css'],
})
export class RequestStockComponent {
  submitted = signal(false);
  showErrorBanner = signal(false);
  showSuccessBanner = signal(false);

  medicineOptions = [
    'Paracetamol 500mg',
    'Amoxicillin 250mg',
    'Cetirizine 10mg',
    'Ibuprofen 200mg',
    'Azithromycin 500mg',
  ];

  recentRequests: RecentRequest[] = [
    { medicineName: 'Paracetamol 500mg', requiredQty: 25, date: '2025-12-26', status: 'Pending Approval' },
  ];

  form = this.fb.group({
    medicineName: ['', [Validators.required, Validators.minLength(2)]],
    requiredQty: [null as number | null, [Validators.required, integerMin(1)]],
    notes: [''],
  });

  f = this.form.controls;

  constructor(private fb: FormBuilder) {}

  dismissError() { this.showErrorBanner.set(false); }
  dismissSuccess() { this.showSuccessBanner.set(false); }

  onSubmit() {
    this.submitted.set(true);
    this.showSuccessBanner.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showErrorBanner.set(true);
      return;
    }

    this.showErrorBanner.set(false);

    const payload = this.form.getRawValue();
    this.recentRequests = [
      {
        medicineName: payload.medicineName!,
        requiredQty: payload.requiredQty!,
        date: new Date().toISOString().slice(0, 10),
        status: 'Pending Approval',
      },
      ...this.recentRequests,
    ];

    this.showSuccessBanner.set(true);
    this.form.reset();
    this.submitted.set(false);
  }

  onReset() {
    this.form.reset();
    this.submitted.set(false);
    this.showErrorBanner.set(false);
    this.showSuccessBanner.set(false);
  }
}
