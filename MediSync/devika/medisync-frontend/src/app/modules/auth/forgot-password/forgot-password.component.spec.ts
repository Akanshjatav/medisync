import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show validation error when email is empty', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessages.length).toBeGreaterThan(0);
  });

  it('should show success message when email is valid (simulated)', (done) => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const component = fixture.componentInstance;

    component.form.patchValue({ email: 'test@mail.com' });
    component.onSubmit();

    setTimeout(() => {
      expect(component.successMessage.length).toBeGreaterThan(0);
      done();
    }, 700);
  });
});
