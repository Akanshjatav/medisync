import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendor-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.css']
})
export class VendorRegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  currentStep = 0;
  draftKey = 'medisync_vendor_reg_draft_v1';
  
  // UI Helpers
  toastMessage: { title: string; msg: string } | null = null;
  fileNames: { [key: string]: string } = {
    docGst: 'No file selected',
    docPan: 'No file selected',
    docLicense: 'No file selected'
  };

  // Steps configuration
  steps = [
    { label: 'Business', index: 0 },
    { label: 'Contact', index: 1 },
    { label: 'Address', index: 2 },
    { label: 'Documents', index: 3 }
  ];

  // Regex Patterns
  private patterns = {
    gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
    phone: /^(\+?\d{10,15})$/,
    pin: /^[1-9][0-9]{5}$/
  };

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      // Step 1: Business
      business: this.fb.group({
        businessName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
        gstNumber: ['', [Validators.required, Validators.pattern(this.patterns.gst)]],
        businessType: ['', Validators.required],
        yearOfEstablishment: ['', [Validators.required, Validators.min(1800), Validators.max(2099)]]
      }),
      // Step 2: Contact
      contact: this.fb.group({
        primaryEmail: ['', [Validators.required, Validators.email]],
        primaryPhone: ['', [Validators.required, Validators.pattern(this.patterns.phone)]],
        alternatePhone: ['', [Validators.pattern(this.patterns.phone)]]
      }),
      // Step 3: Address
      address: this.fb.group({
        address1: ['', [Validators.required, Validators.minLength(3)]],
        address2: [''],
        city: ['', [Validators.required, Validators.minLength(2)]],
        state: ['', Validators.required],
        pin: ['', [Validators.required, Validators.pattern(this.patterns.pin)]]
      }),
      // Step 4: Documents & Confirm
      documents: this.fb.group({
        docGst: [null, Validators.required], // File inputs handled slightly differently
        docPan: [null, Validators.required],
        docLicense: [null, Validators.required],
        confirmAccurate: [false, Validators.requiredTrue]
      })
    });
  }

  ngOnInit(): void {
    // Optional: Auto-restore draft logic could go here
  }

  // Getters for template logic
  get businessGroup() { return this.registrationForm.get('business') as FormGroup; }
  get contactGroup() { return this.registrationForm.get('contact') as FormGroup; }
  get addressGroup() { return this.registrationForm.get('address') as FormGroup; }
  get documentsGroup() { return this.registrationForm.get('documents') as FormGroup; }

  get progressPercentage(): string {
    return `${((this.currentStep + 1) / 4) * 100}%`;
  }

  // Navigation
  setStep(index: number) {
    if (index > this.currentStep) {
      // Validate current step before moving forward
      if (this.validateCurrentStep()) {
        this.currentStep = index;
      } else {
        this.showToast('Fix required fields', 'Please correct the highlighted inputs before continuing.');
        this.markCurrentStepTouched();
      }
    } else {
      // Allow moving back without validation
      this.currentStep = index;
    }
  }

  next() {
    this.setStep(this.currentStep + 1);
  }

  prev() {
    this.setStep(this.currentStep - 1);
  }

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

  // File Handling
  onFileSelected(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      // Manual Validation for File Type/Size
      const validExts = ['.pdf', '.jpg', '.jpeg', '.png'];
      const isValidType = validExts.some(ext => file.name.toLowerCase().endsWith(ext));
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        this.documentsGroup.get(controlName)?.setErrors({ invalidType: true });
        this.fileNames[controlName] = 'Invalid file type';
      } else if (!isValidSize) {
        this.documentsGroup.get(controlName)?.setErrors({ invalidSize: true });
        this.fileNames[controlName] = 'File too large (>5MB)';
      } else {
        this.documentsGroup.get(controlName)?.setErrors(null);
        this.documentsGroup.get(controlName)?.setValue(file); // Store file object
        this.fileNames[controlName] = file.name;
      }
    }
  }

  // Draft Logic
  saveDraft() {
    const formVal = this.registrationForm.value;
    // Remove file objects before saving to localStorage
    const draftData = {
      business: formVal.business,
      contact: formVal.contact,
      address: formVal.address,
      // We cannot save files to local storage easily
      __savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(this.draftKey, JSON.stringify(draftData));
    this.showToast('Saved', 'Draft saved locally (files excluded).');
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
      this.showToast('Draft restored', 'Draft restored. Please re-upload documents.');
    } catch (e) {
      this.showToast('Error', 'Could not restore draft.');
    }
  }

  submit() {
    if (this.registrationForm.valid) {
      console.log('Form Submitted', this.registrationForm.value);
      // Call your Service here to send data to backend
      // For now, navigate to a success page or show a toast
      this.showToast('Success', 'Registration submitted successfully!');
      
      // Optional: Navigate to a success page after delay
      setTimeout(() => {
        // this.router.navigate(['/vendor/registration-success']);
      }, 2000);
    } else {
      this.registrationForm.markAllAsTouched();
      this.showToast('Submission blocked', 'Please fix errors before submitting.');
    }
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

  // Toast Helper
  showToast(title: string, msg: string) {
    this.toastMessage = { title, msg };
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
}
