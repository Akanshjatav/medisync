import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { branchregistration_service } from '../../../core/services/branch-registration.service';

type MsgType = 'ok' | 'err' | '';

@Component({
  selector: 'app-branch-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './branch-registration.component.html',
  styleUrls: ['./branch-registration.component.css']
})
export class BranchRegisterationComponent {
  private fb = inject(FormBuilder);
  private branchService = inject(branchregistration_service);

  // Messages (signals)
  messageType = signal<MsgType>('');
  messageText = signal<string>('');

  // Submitting state (signal)
  isSubmitting = signal(false);

  // Form (validators aligned with your HTML messages)
  form = this.fb.group({
    branchName: ['', [Validators.required, Validators.minLength(4)]],
    branchAddress: ['', [Validators.required, Validators.minLength(4)]],
    location: ['', [Validators.required, Validators.minLength(2)]]
  });

  onSubmit(): void {
    this.clearMessage();

    // prevent double-click submit
    if (this.isSubmitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageType.set('err');
      this.messageText.set('Please fix validation errors.');
      return;
    }

    const v = this.form.value;

    // ✅ Backend expects: branchName, branchLocation, address
    const payload = {
      branchName: String(v.branchName ?? '').trim(),
      branchLocation: String(v.location ?? '').trim(),
      address: String(v.branchAddress ?? '').trim()
    };

    // Debug (optional — remove later)
    console.log('🚀 Sending payload:', payload);

    this.isSubmitting.set(true);

    this.branchService.createBranch(payload as any)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res: any) => {
          console.log('✅ Success response:', res);

          this.messageType.set('ok');
          this.messageText.set(
            `Branch "${res?.branchName ?? payload.branchName}" registered successfully.`
          );

          // reset form but keep message visible
          this.form.reset();
          this.form.markAsPristine();
          this.form.markAsUntouched();
        },
        error: (err: any) => {
          console.error('❌ Error response:', err);

          this.messageType.set('err');
          this.messageText.set(
            err?.error?.message || err?.message || 'Failed to register branch.'
          );
        }
      });
  }

  // If you call submit() from template, keep this (optional)
  submit(): void {
    this.onSubmit();
  }

  clearMessage(): void {
    this.messageType.set('');
    this.messageText.set('');
  }

  showError(controlName: 'branchName' | 'branchAddress' | 'location'): boolean {
    const ctrl = this.form.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.clearMessage();
  }
}