import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { SidebarComponent } from '../../../core/layout/sidebar/sidebar.component';
import { FooterComponent } from '../../../core/layout/footer/footer.component';

import { VendorService, VendorApiResponse, VendorRegisterRequest } from '../../../core/services/vendor.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.css']
})
export class VendorDashboardComponent implements OnInit, OnDestroy {
  // Layout
  sidebarOpen = false;

  // Profile
  loadingProfile = true;
  profileError = '';
  profile?: VendorApiResponse;

  // Toast
  toast = { on: false, title: '', msg: '' };
  private toastTimer?: ReturnType<typeof setTimeout>;

  // Dialog
  @ViewChild('vendorDlg') vendorDlg?: ElementRef<HTMLDialogElement>;

  // Form (registration/update)
  saving = false;

  readonly vendorRegForm = this.fb.group({
    businessName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    phoneNumber: ['', [Validators.maxLength(18)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
    gstNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
    licenseNumber: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
    address: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(240)]]
  });

  private sub = new Subscription();

  constructor(
    private vendorService: VendorService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  // -----------------------------
  // Data
  // -----------------------------
  loadProfile(): void {
    this.loadingProfile = true;
    this.profileError = '';

    const s = this.vendorService.getVendorProfile().subscribe({
      next: (p) => {
        this.profile = p;
        this.loadingProfile = false;
      },
      error: (err: any) => {
        this.loadingProfile = false;
        this.profileError = typeof err === 'string' ? err : 'Failed to load vendor profile.';
      }
    });

    this.sub.add(s);
  }

  // -----------------------------
  // Derived UI helpers
  // -----------------------------
  get todayLabel(): string {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  get statusPillClass(): string {
    const st = (this.profile?.status || '').toUpperCase();
    if (st.includes('APPROVED') || st.includes('VERIFIED')) return 'green';
    if (st.includes('REJECT')) return 'red';
    if (st.includes('PENDING')) return 'amber';
    return '';
  }

  // -----------------------------
  // Dialog controls
  // -----------------------------
  openVendorDialog(): void {
    // Prefill from profile if available (password remains blank)
    if (this.profile) {
      this.vendorRegForm.patchValue({
        businessName: this.profile.businessName ?? '',
        email: this.profile.email ?? '',
        phoneNumber: this.profile.phoneNumber ?? '',
        gstNumber: this.profile.gstNumber ?? '',
        licenseNumber: this.profile.licenseNumber ?? '',
        address: this.profile.address ?? '',
        password: '' // always blank
      });
    }

    this.vendorRegForm.markAsPristine();
    this.vendorRegForm.markAsUntouched();
    this.vendorDlg?.nativeElement.showModal();
  }

  closeVendorDialog(): void {
    this.vendorDlg?.nativeElement.close();
  }

  onDialogBackdropClick(evt: MouseEvent): void {
    // Close when clicking on the actual <dialog> backdrop area
    if (evt.target === this.vendorDlg?.nativeElement) {
      this.closeVendorDialog();
    }
  }

  // -----------------------------
  // Submit registration/update
  // -----------------------------
  submitVendorRegistration(): void {
    this.profileError = '';

    if (this.vendorRegForm.invalid) {
      this.vendorRegForm.markAllAsTouched();
      this.showToast('Fix errors', 'Please correct the highlighted fields.', 2600);
      return;
    }

    const payload: VendorRegisterRequest = {
      businessName: this.vendorRegForm.value.businessName!.trim(),
      email: (this.vendorRegForm.value.email || '').trim() || undefined,
      phoneNumber: (this.vendorRegForm.value.phoneNumber || '').trim() || undefined,
      password: this.vendorRegForm.value.password || undefined,
      gstNumber: this.vendorRegForm.value.gstNumber!.trim().toUpperCase(),
      licenseNumber: this.vendorRegForm.value.licenseNumber!.trim(),
      address: this.vendorRegForm.value.address!.trim()
    };

    this.saving = true;
    const s = this.vendorService.registerVendor(payload).subscribe({
      next: (resp) => {
        this.saving = false;
        this.showToast('Submitted', 'Vendor registration submitted successfully.', 2200);
        this.closeVendorDialog();

        // After register, refresh profile
        this.profile = resp;
        this.loadProfile();
      },
      error: (err: any) => {
        this.saving = false;
        const msg = typeof err === 'string' ? err : 'Registration failed.';
        this.showToast('Error', msg, 3500);
      }
    });

    this.sub.add(s);
  }

  // -----------------------------
  // Toast
  // -----------------------------
  private showToast(title: string, msg: string, ms = 2200): void {
    this.toast = { on: true, title, msg };
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast.on = false), ms);
  }
}
