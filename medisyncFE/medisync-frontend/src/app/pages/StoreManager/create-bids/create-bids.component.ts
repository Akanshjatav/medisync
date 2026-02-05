import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface BidLine {
  itemName: string;
  itemPrice: number | null;
  quantity: number | null;
}

@Component({
  selector: 'app-create-bids',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './create-bids.component.html',
  styleUrls: ['./create-bids.component.css']
})
export class CreateBidsComponent implements OnInit {
  form!: FormGroup;

  // Sidebar (same behavior as vendor-profile)
  sidebarOpen = false;

  isSubmitting = false;

  // Quantity dropdown options
  quantityOptions: number[] = Array.from({ length: 100 }, (_, i) => i + 1);

  // Backend endpoint base
  private readonly apiBase = '/api';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const rfqIdFromRoute = this.route.snapshot.paramMap.get('rfqId') ?? '';

    this.form = this.fb.group({
      rfqId: [rfqIdFromRoute, [Validators.required]],
      bids: this.fb.array([this.createBidGroup()])
    });
  }

  // --- Sidebar controls ---
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  // --- Form helpers ---
  get bids(): FormArray {
    return this.form.get('bids') as FormArray;
  }

  private createBidGroup(): FormGroup {
    return this.fb.group({
      itemName: ['', [Validators.required]],
      itemPrice: [null, [Validators.required]],
      quantity: ['', [Validators.required]] // keep as string from <select>, convert later if needed
    });
  }

  isInvalid(index: number, controlName: 'itemName' | 'itemPrice' | 'quantity'): boolean {
    const group = this.bids.at(index) as FormGroup;
    const ctrl = group.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  private markAllBidControlsTouched(): void {
    this.bids.controls.forEach(ctrl => ctrl.markAllAsTouched());
  }

  private allBidsValid(): boolean {
    return this.bids.controls.every(ctrl => ctrl.valid);
  }

  // --- Add/Remove ---
  addBid(): void {
    // Requirement: if vendor tries to add more bids without filling existing ones,
    // show inline errors and do not add.
    this.markAllBidControlsTouched();

    if (!this.allBidsValid()) {
      return;
    }

    this.bids.push(this.createBidGroup());
  }

  removeBid(index: number): void {
    if (this.bids.length <= 1) return;
    this.bids.removeAt(index);
  }

  // --- Submit ---
  onSubmit(): void {
    // Requirement: submit only if all values are filled; else show errors inline
    this.markAllBidControlsTouched();

    if (this.form.invalid || !this.allBidsValid()) {
      return;
    }

    this.isSubmitting = true;

    const rfqId = this.form.value.rfqId as string;

    // payload: convert quantity to number
    const payload = {
      rfqId,
      bids: (this.bids.value as any[]).map(b => ({
        itemName: String(b.itemName || '').trim(),
        itemPrice: b.itemPrice === null ? null : Number(b.itemPrice),
        quantity: b.quantity === null || b.quantity === '' ? null : Number(b.quantity)
      })),
      submittedAt: new Date().toISOString()
    };

    const url = `${this.apiBase}/rfqs/${encodeURIComponent(rfqId)}/bids`;

    this.http.post(url, payload).subscribe({
      next: () => {
        this.isSubmitting = false;

        // Requirement: alert then redirect to same page empty
        window.alert('bids posted successfully');

        // reset to empty
        this.resetFormKeepRfq(rfqId);

        // "redirect" intent: navigate to same route (even if it doesn't reload, form is empty now)
        // This keeps behavior consistent without needing global onSameUrlNavigation config.
        this.router.navigate(['/create-bids', rfqId], { replaceUrl: true });
      },
      error: (err) => {
        this.isSubmitting = false;
        // Keep it simple and fast for production
        window.alert('Failed to post bids. Please try again.');
        // eslint-disable-next-line no-console
        console.error('Post bids error:', err);
      }
    });
  }

  private resetFormKeepRfq(rfqId: string): void {
    // Clear all bid rows and start fresh with one empty row
    while (this.bids.length) this.bids.removeAt(0);
    this.bids.push(this.createBidGroup());

    this.form.get('rfqId')?.setValue(rfqId);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}