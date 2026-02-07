import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  });

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router,
    private storage: BrowserStorageService
  ) {}

  ngOnInit(): void {
    this.isOffline = !navigator.onLine;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  isInvalid(controlName: 'email' | 'password'): 'true' | null {
    const c = this.form.get(controlName);
    if (!c) return null;
    return c.invalid && (c.touched || c.dirty) ? 'true' : null;
  }

  showFieldError(controlName: 'email' | 'password'): boolean {
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

  getPasswordError(): string {
    const c = this.form.get('password');
    if (!c) return '';
    if (c.hasError('required')) return 'Password is required.';
    return 'Invalid password.';
  }

  onSubmit(): void {
    this.errorMessages = [];
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessages = this.collectValidationMessages();
      return;
    }

    const email = String(this.form.value.email || '').trim();
    const password = String(this.form.value.password || '');

    this.isLoading = true;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.successMessage = 'Login successful! Redirecting...';
        this.isLoading = false;
        
        // Map roleId number to role name string
        const roleName = this.getRoleName(response.roleId);
        
        // Store user data
        this.storage.setItem('USER_ROLE', roleName);
        this.storage.setItem('USER_ID', String(response.userId));
        this.storage.setItem('USER_NAME', response.name);

        // Redirect based on role
        setTimeout(() => {
          this.navigateByRole(roleName);
        }, 500);
      },
      error: (msg: string) => {
        this.errorMessages = [msg || 'Invalid email or password'];
        this.isLoading = false;
      },
    });
  }

  private getRoleName(roleId: number): string {
    // Map role IDs to role names - adjust these mappings based on your backend
    switch (roleId) {
      case 1: return 'HO';
      case 2: return 'STORE_MANAGER';
      case 3: return 'PHARMACIST';
      case 4: return 'VENDOR';
      default: return 'UNKNOWN';
    }
  }

  private navigateByRole(role: string): void {
    switch (role) {
      case 'HO':
      case 'HEAD_OFFICE':
        this.router.navigate(['/head-office/dashboard']);
        break;
      case 'PHARMACIST':
        this.router.navigate(['/pharmacist/dashboard']);
        break;
      case 'MANAGER':
        this.router.navigate(['/store-manager/dashboard']);
        break;
      case 'VENDOR':
        this.router.navigate(['/vendor/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  private collectValidationMessages(): string[] {
    const msgs: string[] = [];
    const e = this.form.get('email');
    const p = this.form.get('password');

    if (e?.invalid) msgs.push(this.getEmailError());
    if (p?.invalid) msgs.push(this.getPasswordError());

    return msgs;
  }
}
