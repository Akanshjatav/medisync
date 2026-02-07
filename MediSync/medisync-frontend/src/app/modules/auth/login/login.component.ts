import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BrowserStorageService } from '../../../core/services/browser-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  showPassword = false;
  errorMessages: string[] = [];
  successMessage = '';
  isOffline = false;
  isLoading = false;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],

    // ✅ NEW: vendor checkbox
    isVendor: [false],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private storage: BrowserStorageService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    // ✅ SSR safe: navigator exists only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.isOffline = !navigator.onLine;
    } else {
      this.isOffline = false;
    }
  }

  /* ---------- template helpers ---------- */

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  isInvalid(control: 'email' | 'password'): 'true' | null {
    const c = this.form.get(control);
    return c && c.invalid && (c.touched || c.dirty) ? 'true' : null;
  }

  showFieldError(control: 'email' | 'password'): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  getEmailError(): string {
    const c = this.form.get('email');
    if (!c) return '';
    if (c.hasError('required')) return 'Email is required.';
    if (c.hasError('email')) return 'Enter a valid email address.';
    return 'Invalid email.';
  }

  getPasswordError(): string {
    const c = this.form.get('password');
    if (!c) return '';
    if (c.hasError('required')) return 'Password is required.';
    return 'Invalid password.';
  }

  /* ---------------- LOGIN FLOW ---------------- */

  onSubmit(): void {
    this.errorMessages = [];
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessages = this.collectValidationMessages();
      return;
    }

    const email = this.form.value.email!.trim();
    const password = this.form.value.password!;
    const isVendor = !!this.form.value.isVendor;

    this.isLoading = true;

    // ✅ Avoid union Observable => avoids TS2349 subscribe issue
    if (isVendor) {
      this.authService.vendorLogin({ email, password }).subscribe({
        next: (res) => {
          // vendor response: vendorId, name
          this.storage.setItem('USER_ID', String(res.vendorId));
          this.storage.setItem('USER_ROLE', 'VENDOR');
          this.storage.setItem('USER_NAME', res.name);

          this.successMessage = 'Login successful. Redirecting…';
          this.isLoading = false;

          // ✅ routing stays exactly the same
          this.navigateByRole('VENDOR');
        },
        error: (msg: string) => {
          this.errorMessages = [msg || 'Invalid email or password'];
          this.isLoading = false;
        },
      });
      return;
    }

    // ✅ existing user login behavior unchanged
    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.storage.setItem('USER_ID', String(res.userId));
        this.storage.setItem('USER_ROLE', res.role);
        this.storage.setItem('USER_NAME', res.name);

        this.successMessage = 'Login successful. Redirecting…';
        this.isLoading = false;

        this.navigateByRole(res.role);
      },
      error: (msg: string) => {
        this.errorMessages = [msg || 'Invalid email or password'];
        this.isLoading = false;
      },
    });
  }

  private navigateByRole(role: string): void {
    switch (role) {
      case 'ADMIN':
        this.router.navigateByUrl('/head-office/dashboard');
        break;

      case 'PHARMACIST':
        this.router.navigateByUrl('/pharmacist/dashboard');
        break;

      case 'MANAGER':
        this.router.navigateByUrl('/store-manager/dashboard');
        break;

      case 'VENDOR':
        this.router.navigateByUrl('/vendor/profile');
        break;

      default:
        this.router.navigateByUrl('/auth/login');
    }
  }

  private collectValidationMessages(): string[] {
    const msgs: string[] = [];
    if (this.form.get('email')?.invalid) msgs.push(this.getEmailError());
    if (this.form.get('password')?.invalid) msgs.push(this.getPasswordError());
    return msgs;
  }
}