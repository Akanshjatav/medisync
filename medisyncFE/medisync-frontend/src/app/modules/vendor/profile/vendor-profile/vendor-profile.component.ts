import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { VendorService, VendorApiResponse } from '../../../../core/services/vendor.service';

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
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './vendor-profile.component.html',
  styleUrls: ['./vendor-profile.component.css']
})
export class VendorProfileComponent implements OnInit {
  private readonly VENDOR_ID = 1;

  private isBrowser = false;

  /** Vendor sidebar state */
  sidebarOpen = false;

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
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
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
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadProfile();
  }

  /** Sidebar controls */
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  /** ESC closes sidebar */
  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (!this.isBrowser) return;
    this.closeSidebar();
  }

  /** ✅ NEW: Search handler (navigates to Active RFQs with query) */
  onRfqSearch(raw: string): void {
    const q = (raw || '').trim();
    if (!q) return;

    this.closeSidebar();

    // Update this route if your RFQ page uses a different path
    this.router.navigate(['/active-rfqs'], { queryParams: { q } });
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
