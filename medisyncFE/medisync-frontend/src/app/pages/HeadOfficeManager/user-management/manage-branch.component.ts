import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { UserManagementService, UserRole, UserStatus } from '../../../core/services/managebranch.service';



@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-branch.component.html',
  styleUrls: ['./manage-branch.component.css']
})
export class AddUserComponent implements OnInit {
  form!: FormGroup;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  readonly redirectDelayMs = 1500;

  readonly statuses: UserStatus[] = ['Active', 'Inactive'];

  // ✅ Show label, send VALUE in uppercase (backend expects this)
  readonly roleOptions: { label: string; value: UserRole }[] = [
    { label: 'Pharmacist', value: 'PHARMACIST' },
    { label: 'Store Manager', value: 'MANAGER' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserManagementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?\d{10,15}$/)]], // optional
      status: ['Active', [Validators.required]],

      // ✅ IMPORTANT: bind control name to roleName (not role)
      roleName: ['PHARMACIST' as UserRole, [Validators.required]]
    });
  }

  get name(): AbstractControl | null { return this.form.get('name'); }
  get email(): AbstractControl | null { return this.form.get('email'); }
  get phone(): AbstractControl | null { return this.form.get('phone'); }
  get status(): AbstractControl | null { return this.form.get('status'); }
  get roleName(): AbstractControl | null { return this.form.get('roleName'); }

  onSubmit(event?: Event): void {
    event?.preventDefault();
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fix validation errors.';
      return;
    }

    // ✅ Normalize roleName for backend (prevents "Pharmacist" vs "PHARMACIST")
    const normalizedRole = String(this.form.value.roleName || '')
      .trim()
      .toUpperCase() as UserRole;

    // ✅ Send BACKEND DTO keys: roleName, isActive, phoneNumber
    const payload = {
      roleName: normalizedRole,
      isActive: this.form.value.status === 'Active',
      name: this.form.value.name,
      email: this.form.value.email,
      phoneNumber: this.form.value.phone || null
    };

    this.isSubmitting = true;

    this.userService.createUser(payload).pipe(
      finalize(() => (this.isSubmitting = false))
    ).subscribe({
      next: (createdUser) => {
        this.successMessage = `User "${createdUser.name}" added successfully. Redirecting...`;
        setTimeout(() => this.router.navigate(['/users']), this.redirectDelayMs);
      },
      error: (err) => {
        this.errorMessage = err?.message || 'Failed to add user. Please try again.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  hasError(controlName: string, errorName: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!(ctrl && ctrl.touched && ctrl.hasError(errorName));
  }
}