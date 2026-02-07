import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BrowserStorageService } from '../../../core/services/browser-storage.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  // UI State (mirrors login)
  errorMessages: string[] = [];
  successMessage = '';
  isOffline = false;
  isSubmitting = false;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private storage: BrowserStorageService
  ) {}

  ngOnInit(): void {
    this.isOffline = !navigator.onLine;

    // Prefill from sessionStorage (optional UX)
    const saved = this.storage.getItem('medisync_fp_email');
    if (saved) this.form.patchValue({ email: saved });
  }

  isInvalid(controlName: 'email'): 'true' | null {
    const c = this.form.get(controlName);
    if (!c) return null;
    return c.invalid && (c.touched || c.dirty) ? 'true' : null;
  }

  showFieldError(controlName: 'email'): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  getEmailError(): string {
    const c = this.form.get('email');
    if (!c) return '';
    if (c.hasError('required')) return 'Email is required.';
    if (c.hasError('email')) return 'Enter a valid email address.';
    return 'Invalid email.';
  }

  onSubmit(): void {
    this.errorMessages = [];
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessages = [this.getEmailError()];
      return;
    }

    const email = String(this.form.value.email || '').trim();
    this.storage.setItem('medisync_fp_email', email);

    // For now: no backend call (we’ll wire it when your API is ready)
    this.isSubmitting = true;

    // Simulate async request so UI behaves like real flow
    setTimeout(() => {
      this.isSubmitting = false;

      // Use a “safe” message (don’t reveal whether email exists)
      this.successMessage =
        'If an account exists for this email, an OTP/reset link will be sent shortly.';

      // Optional: if you plan an OTP page later, you can navigate:
      // this.router.navigateByUrl('/otp');
    }, 650);
  }

  onCancel(): void {
    // go back to login (change if your login route differs)
    this.router.navigateByUrl('/login');
  }
}