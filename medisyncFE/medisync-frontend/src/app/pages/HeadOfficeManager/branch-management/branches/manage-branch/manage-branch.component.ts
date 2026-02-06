import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs';

import { StoreService } from '../../../../../core/services/store.services';
import { Store } from '../../../../../core/models/store.model';

@Component({
  selector: 'app-manage-branch',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './manage-branch.component.html',
  styleUrls: ['./manage-branch.component.css']
})
export class ManageBranchComponent {

  private route = inject(ActivatedRoute);
  private svc = inject(StoreService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  branch = signal<Store | null>(null);

  pharmacists: any[] = [];
  managers: any[] = [];

  form: FormGroup = this.fb.group({
    storename: [''],
    location: [''],
    storeaddress: [''],
    pharmacistId: [null],
    managerId: [null]
  });

  ngOnInit() {

    // Load branch details
    this.route.paramMap
      .pipe(
        switchMap(p =>
          this.svc.getStoreById(Number(p.get('storeId')))
        )
      )
      .subscribe({
        next: (s) => {
          if (!s) {
            console.error('Branch not found');
            return;
          }

          this.branch.set(s);

          this.form.patchValue({
            storename: s.storename,
            location: s.location,
            storeaddress: s.storeaddress,
            pharmacistId: s.pharmacist_id ?? null,
            managerId: s.manager_id ?? null
          });
        },
        error: err => console.error('Error loading branch:', err)
      });

    // Load pharmacists
    this.http
      .get<any[]>('http://localhost:7000/api/v1/ho/users/by-role/PHARMACIST')
      .subscribe({
        next: res => this.pharmacists = res,
        error: err => console.error('Error loading pharmacists:', err)
      });

    // Load managers
    this.http
      .get<any[]>('http://localhost:7000/api/v1/ho/users/by-role/MANAGER')
      .subscribe({
        next: res => this.managers = res,
        error: err => console.error('Error loading managers:', err)
      });
  }

  onSubmit() {

    const b = this.branch();
    if (!b) return;

    const payload = {
      branchName: this.form.value.storename?.trim(),
      branchLocation: this.form.value.location?.trim(),
      address: this.form.value.storeaddress?.trim(),

      // Only send if selected
      pharmacistUserId: this.form.value.pharmacistId || null,
      managerUserId: this.form.value.managerId || null
    };

    console.log('Sending update payload:', payload);

    this.svc.updateStore(b.store_id, payload).subscribe({
      next: () => alert('Branch updated successfully'),
      error: err => {
        console.error('Update failed:', err);
        alert('Update failed. Check console.');
      }
    });
  }
}
