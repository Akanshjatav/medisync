import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VendorService, VendorApiResponse } from '../../../core/services/vendor.service';

export type UiVendorStatus = 'Verified' | 'Unverified';

export interface VendorProfileUi {
  vendorId: string;
  userId: string;
  companyName: string;
  gstNumber: string;
  licenseNumber: string;
  address: string;
  status: UiVendorStatus;
}

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vendor-profile.component.html',
  styleUrls: ['./vendor-profile.component.css']
})
export class VendorProfileComponent implements OnInit {
  private readonly VENDOR_ID = 1;

  loading = false;
  editMode = false;

  successMessage = '';
  errorMessages: string[] = [];

  vendor: VendorProfileUi = {
    vendorId: '—',
    userId: '—',
    companyName: '—',
    gstNumber: '—',
    licenseNumber: '—',
    address: '—',
    status: 'Unverified'
  };

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService,
    private router: Router
  ) {
    this.form = this.fb.group({
      vendorId: [{ value: '', disabled: true }],
      userId: [{ value: '', disabled: true }],
      companyName: [''],
      gstNumber: [''],
      licenseNumber: [''],
      address: [''],
      status: ['Unverified']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  /** Search handler (navigates to Active RFQs with query) */
  onRfqSearch(raw: string): void {
    const q = (raw || '').trim();
    if (!q) return;
    this.router.navigate(['/vendor/active-rfqs'], { queryParams: { q } });
  }

  loadProfile(): void {
    this.loading = true;
    this.successMessage = '';
    this.errorMessages = [];

    this.vendorService.getVendorById(this.VENDOR_ID).subscribe({
      next: (api) => {
        this.vendor = this.toUi(api);
        if (this.editMode) this.form.patchValue({ ...this.vendor });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessages = [
          err?.error?.message || err?.message || 'Failed to load vendor profile.'
        ];
      }
    });
  }

  onEdit(): void {
    this.successMessage = '';
    this.errorMessages = [];
    this.editMode = true;
    this.form.patchValue({ ...this.vendor });
  }

  onCancel(): void {
    this.successMessage = '';
    this.errorMessages = [];
    this.editMode = false;
    this.form.reset({ ...this.vendor });
  }

  onSave(): void {
    this.successMessage = '';
    this.errorMessages = [];

    // UI-only save (backend update endpoint not confirmed yet)
    const updated = this.form.getRawValue() as VendorProfileUi;
    this.vendor = { ...this.vendor, ...updated };
    this.editMode = false;

    this.successMessage = 'Profile updated (UI only). Add backend update API to persist.';
  }

  statusClass(status: UiVendorStatus | string): string {
    return (status || '').toLowerCase() === 'verified' ? 'verified' : 'unverified';
  }

  private toUi(api: VendorApiResponse): VendorProfileUi {
    return {
      vendorId: String(api.vendorId ?? ''),
      userId: String(api.userId ?? ''),
      companyName: api.businessName ?? '',
      gstNumber: api.gstNumber ?? '',
      licenseNumber: api.licenseNumber ?? '',
      address: api.address ?? '',
      status: this.mapBackendStatus(api.status)
    };
  }

  private mapBackendStatus(status: string | null | undefined): UiVendorStatus {
    const s = (status || '').trim().toUpperCase();
    if (s === 'APPROVED' || s === 'VERIFIED') return 'Verified';
    return 'Unverified';
  }
}
