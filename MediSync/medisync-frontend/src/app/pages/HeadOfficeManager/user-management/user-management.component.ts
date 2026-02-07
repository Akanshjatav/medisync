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
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  form!: FormGroup;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  showSuccess = false;

  // ✅ CHANGE THIS to your actual head office dashboard route
  private readonly headOfficeDashboardUrl = '/headoffice/dashboard';

  readonly statuses: UserStatus[] = ['Active', 'Inactive'];

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
      phone: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      status: ['Active', [Validators.required]],
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
    this.showSuccess = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fix validation errors.';
      return;
    }

    const normalizedRole = String(this.form.value.roleName || '')
      .trim()
      .toUpperCase() as UserRole;

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
      next: (createdUser: any) => {
        this.successMessage = `User "${createdUser?.name || payload.name}" added successfully.`;
        this.showSuccess = true;
      },
      error: (err: any) => {
        this.errorMessage = err?.message || 'Failed to add user. Please try again.';
      }
    });
  }

  // ✅ Redirect to Head Office Dashboard (instead of /users)
  
closeSuccess(): void {
  this.showSuccess = false;
  this.router.navigate(['/', 'head-office', 'dashboard'], { replaceUrl: true });
}

onCancel(): void {
 
 
    this.showSuccess = false;
    this.successMessage = '';
    this.errorMessage = '';

    // Reset to defaults
    this.form.reset({
      name: '',
      email: '',
      phone: '',
      status: 'Active',
      roleName: 'PHARMACIST' as UserRole
    });

}


  hasError(controlName: string, errorName: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!(ctrl && ctrl.touched && ctrl.hasError(errorName));
  }
}