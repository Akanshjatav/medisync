import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, ParamMap } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';

import { StoreService } from '../../../../../core/services/store.services';
import { Store } from '../../../../../core/models/store.model';

type UserLite = { userId: number; name?: string; roleName?: string };

@Component({
  selector: 'app-manage-branch',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './manage-branch.component.html',
  styleUrls: ['./manage-branch.component.css']
})
export class ManageBranchComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(StoreService);
  private fb = inject(FormBuilder);

  branch = signal<Store | null>(null);

  loading = signal(false);
  saving = signal(false);
  usersLoading = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  // For dropdowns used in the template
  pharmacists: UserLite[] = [];
  managers: UserLite[] = [];

  // Editable fields must match the template formControlName values
  form = this.fb.group({
    storename: ['', [Validators.required, Validators.minLength(2)]],
    location: ['', [Validators.required, Validators.minLength(2)]],
    storeaddress: ['', [Validators.required, Validators.minLength(5)]],
    pharmacistId: [null as number | null],
    managerId: [null as number | null]
  });

  // Newly allocated branch = pharmacist OR manager missing
  needsAllocation = computed(() => {
    const b = this.branch();
    if (!b) return false;
    return b.pharmacist_id == null || b.manager_id == null;
  });

  ngOnInit() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const id = +(params.get('id') ?? 0);
          return this.svc.getStoreById(id); // assumes your service handles fetching by id
        })
      )
      .subscribe({
        next: (s: Store | undefined) => {
          const b = s ?? null;
          this.branch.set(b);

          if (!b) {
            this.errorMessage.set('Branch not found.');
            this.loading.set(false);
            return;
          }

          // Patch current values into form (tolerate both snake_case/camelCase if your model varies)
          this.form.patchValue({
            storename: (b as any).storeName ?? b.storename ?? '',
            location: b.location ?? (b as any).branchLocation ?? '',
            storeaddress: (b as any).address ?? b.storeaddress ?? '',
            pharmacistId: b.pharmacist_id ?? null,
            managerId: b.manager_id ?? null
          });

          // Load dropdown lists ONLY if allocation needed
          if (this.needsAllocation()) {
            this.loadUsers();
          }

          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('Unable to load branch.');
          this.loading.set(false);
        }
      });
  }

  private loadUsers() {
    this.usersLoading.set(true);

    this.svc.getAllUsers().subscribe({
      next: (users: any[]) => {
        // Expecting backend UserResponse: { userId, roleName, name, ... }
        const slim: UserLite[] = (users ?? []).map(u => ({
          userId: u.userId,
          name: u.name,
          roleName: u.roleName
        }));

        this.pharmacists = slim.filter(u => u.roleName === 'PHARMACIST');
        this.managers = slim.filter(u => u.roleName === 'MANAGER');

        this.usersLoading.set(false);
      },
      error: () => {
        this.usersLoading.set(false);
        this.errorMessage.set('Unable to load user list for allocation.');
      }
    });
  }

  onSubmit() {
    const b = this.branch();
    if (!b) return;

    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Please fix errors before saving.');
      return;
    }

    const v = this.form.getRawValue();

    // If allocation needed, enforce selection
    if (this.needsAllocation()) {
      if (!v.pharmacistId || !v.managerId) {
        this.errorMessage.set('Please select Pharmacist ID and Manager ID to allocate.');
        return;
      }
    }

    // Payload expected by backend StoreUpdateRequest
    const payload: any = {
      branchName: (v.storename ?? '').trim(),
      branchLocation: (v.location ?? '').trim(),
      address: (v.storeaddress ?? '').trim()
    };

    // Include staff assignment only when needed
    if (this.needsAllocation()) {
      payload.pharmacistUserId = v.pharmacistId;
      payload.managerUserId = v.managerId;
    }

    this.saving.set(true);

    // Use your service method that calls PUT /api/v1/ho/store/{id}
    this.svc.updateBranch(b.store_id, payload).subscribe({
      next: () => {
        // Locally reflect the updates (StoreResponse from backend may not include staff IDs)
        this.branch.set({
          ...b,
          storename: payload.branchName,
          storeaddress: payload.address,
          location: payload.branchLocation,
          pharmacist_id: payload.pharmacistUserId ?? b.pharmacist_id,
          manager_id: payload.managerUserId ?? b.manager_id,
          updated_at: new Date().toISOString()
        });

        this.successMessage.set('Branch updated successfully.');
        this.saving.set(false);

        setTimeout(() => {
          this.router.navigate(['/head-office/branches', b.store_id]);
        }, 800);
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('Update failed. Please try again.');
      }
    });
  }

  cancel() {
    const b = this.branch();
    if (!b) this.router.navigate(['/head-office/branches']);
    else this.router.navigate(['/head-office/branches', b.store_id]);
  }

  hasError(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }
}