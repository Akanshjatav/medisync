import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VendorService, VendorRegisterRequest } from '../../../core/services/vendor.service' // ✅ adjust path if needed

@Component({
  selector: 'app-vendor-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // ✅ RouterModule needed for routerLink
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.css']
})
export class VendorRegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  currentStep = 0;
  draftKey = 'medisync_vendor_reg_draft_v1';

  submitting = false;

  toastMessage: { title: string; msg: string } | null = null;

  fileNames: Record<string, string> = {
    docGst: 'No file selected',
    docPan: 'No file selected',
    docLicense: 'No file selected'
  };

  steps = [
    { label: 'Business', index: 0 },
    { label: 'Contact', index: 1 },
    { label: 'Address', index: 2 },
    { label: 'Documents + Password', index: 3 } // ✅ password at last step
  ];

  private patterns = {
    gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
    phone: /^(\+?\d{10,15})$/,
    pin: /^[1-9][0-9]{5}$/,
    // ✅ min 8, uppercase, lowercase, number, special
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private vendorService: VendorService
  ) {
    this.registrationForm = this.fb.group({
      business: this.fb.group({
        businessName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
        gstNumber: ['', [Validators.required, Validators.pattern(this.patterns.gst)]],
        businessType: ['', Validators.required],
        yearOfEstablishment: ['', [Validators.required, Validators.min(1800), Validators.max(2099)]],

        // ✅ backend requires this as licenseNumber
        licenseNumber: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
      }),

      contact: this.fb.group({
        primaryEmail: ['', [Validators.required, Validators.email]],
        primaryPhone: ['', [Validators.required, Validators.pattern(this.patterns.phone)]],
        alternatePhone: ['', [Validators.pattern(this.patterns.phone)]]
      }),

      address: this.fb.group({
        address1: ['', [Validators.required, Validators.minLength(3)]],
        address2: [''],
        city: ['', [Validators.required, Validators.minLength(2)]],
        state: ['', Validators.required],
        pin: ['', [Validators.required, Validators.pattern(this.patterns.pin)]]
      }),

      // ✅ Step 4
      documents: this.fb.group(
        {
          docGst: [null, Validators.required],
          docPan: [null, Validators.required],
          docLicense: [null, Validators.required],

          // ✅ password added at end (backend requires @NotBlank)
          password: ['', [Validators.required, Validators.pattern(this.patterns.strongPassword)]],
          confirmPassword: ['', Validators.required],

          confirmAccurate: [false, Validators.requiredTrue]
        },
        { validators: [this.passwordsMatchValidator] }
      )
    });
  }

  ngOnInit(): void {}

  // Getters
  get businessGroup() { return this.registrationForm.get('business') as FormGroup; }
  get contactGroup() { return this.registrationForm.get('contact') as FormGroup; }
  get addressGroup() { return this.registrationForm.get('address') as FormGroup; }
  get documentsGroup() { return this.registrationForm.get('documents') as FormGroup; }

  get progressPercentage(): string {
    return `${((this.currentStep + 1) / this.steps.length) * 100}%`;
  }

  // ✅ group validator
  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const p = group.get('password')?.value;
    const c = group.get('confirmPassword')?.value;
    if (!p || !c) return null;
    return p === c ? null : { passwordMismatch: true };
  }

  // Navigation
  setStep(index: number) {
    if (index > this.currentStep) {
      if (this.validateCurrentStep()) {
        this.currentStep = index;
      } else {
        this.showToast('Fix required fields', 'Please correct the highlighted inputs before continuing.');
        this.markCurrentStepTouched();
      }
    } else {
      this.currentStep = index;
    }
  }

  next() { this.setStep(this.currentStep + 1); }
  prev() { this.setStep(this.currentStep - 1); }

  validateCurrentStep(): boolean {
    let currentGroup: FormGroup;
    switch (this.currentStep) {
      case 0: currentGroup = this.businessGroup; break;
      case 1: currentGroup = this.contactGroup; break;
      case 2: currentGroup = this.addressGroup; break;
      case 3: currentGroup = this.documentsGroup; break;
      default: return false;
    }
    return currentGroup.valid;
  }

  markCurrentStepTouched() {
    let currentGroup: FormGroup;
    switch (this.currentStep) {
      case 0: currentGroup = this.businessGroup; break;
      case 1: currentGroup = this.contactGroup; break;
      case 2: currentGroup = this.addressGroup; break;
      case 3: currentGroup = this.documentsGroup; break;
      default: return;
    }
    currentGroup.markAllAsTouched();
  }

  // ✅ File handling: PDF only, max 5MB
  onFileSelected(event: any, controlName: string) {
    const file: File | undefined = event?.target?.files?.[0];
    const control = this.documentsGroup.get(controlName);
    if (!file || !control) return;

    const isPdfByMime = file.type === 'application/pdf';
    const isPdfByExt = file.name.toLowerCase().endsWith('.pdf');
    const isPdf = isPdfByMime || isPdfByExt;
    const isValidSize = file.size <= 5 * 1024 * 1024;

    control.setErrors(null);

    if (!isPdf) {
      control.setValue(null);
      control.setErrors({ invalidType: true });
      control.markAsTouched();
      this.fileNames[controlName] = 'Only PDF files are allowed';
      if (event?.target) event.target.value = '';
      return;
    }

    if (!isValidSize) {
      control.setValue(null);
      control.setErrors({ invalidSize: true });
      control.markAsTouched();
      this.fileNames[controlName] = 'File too large (>5MB)';
      if (event?.target) event.target.value = '';
      return;
    }

    control.setValue(file);
    this.fileNames[controlName] = file.name;
  }

  // Draft logic (files + password excluded)
  saveDraft() {
    const formVal = this.registrationForm.value;
    const draftData = {
      business: formVal.business,
      contact: formVal.contact,
      address: formVal.address,
      __savedAt: new Date().toISOString()
    };

    localStorage.setItem(this.draftKey, JSON.stringify(draftData));
    this.showToast('Saved', 'Draft saved locally (files & password excluded).');
  }

  restoreDraft() {
    const raw = localStorage.getItem(this.draftKey);
    if (!raw) {
      this.showToast('No draft found', 'There is no saved draft on this browser.');
      return;
    }
    try {
      const data = JSON.parse(raw);
      this.registrationForm.patchValue({
        business: data.business,
        contact: data.contact,
        address: data.address
      });
      this.showToast('Draft restored', 'Draft restored. Please re-upload documents and set password.');
    } catch {
      this.showToast('Error', 'Could not restore draft.');
    }
  }

  // ✅ Backend connect + redirect to login on success
  submit() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      this.showToast('Submission blocked', 'Please fix errors before submitting.');
      return;
    }

    const business = this.businessGroup.value;
    const contact = this.contactGroup.value;
    const address = this.addressGroup.value;
    const docs = this.documentsGroup.value;

    const fullAddress = [address.address1, address.address2, address.city, address.state, address.pin]
      .filter(Boolean)
      .join(', ');

    // ✅ Align exactly with backend DTO VendorRegisterRequest
    const payload: VendorRegisterRequest = {
      businessName: business.businessName,
      email: contact.primaryEmail,
      phoneNumber: contact.primaryPhone,
      password: docs.password,              // ✅ backend requires it
      gstNumber: business.gstNumber,
      licenseNumber: business.licenseNumber,
      address: fullAddress
    };

    this.submitting = true;

    this.vendorService.registerVendor(payload).subscribe({
      next: () => {
        this.showToast('Success', 'Registration successful! Redirecting to login...');
        localStorage.removeItem(this.draftKey);

        setTimeout(() => {
          this.router.navigate(['/auth/login']); // ✅ redirect to login
        }, 900);
      },
      error: (msg: string) => {
        this.submitting = false;
        this.showToast('Registration failed', msg || 'Request failed.');
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }

  resetForm() {
    this.registrationForm.reset();
    this.currentStep = 0;
    this.fileNames = {
      docGst: 'No file selected',
      docPan: 'No file selected',
      docLicense: 'No file selected'
    };
    this.showToast('Reset', 'Form cleared.');
  }

  showToast(title: string, msg: string) {
    this.toastMessage = { title, msg };
    setTimeout(() => (this.toastMessage = null), 3000);
  }
}

