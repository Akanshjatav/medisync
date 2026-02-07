import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { VendorProfileComponent } from './vendor-profile.component';
import { VendorService } from '../../core/services/vendor.service';

describe('VendorProfileComponent', () => {
  let component: VendorProfileComponent;
  let fixture: ComponentFixture<VendorProfileComponent>;

  let vendorServiceSpy: jasmine.SpyObj<VendorService>;

  beforeEach(async () => {
    vendorServiceSpy = jasmine.createSpyObj<VendorService>('VendorService', [
      'getVendorById'
    ]);

    // Default mock response (success)
    vendorServiceSpy.getVendorById.and.returnValue(
      of({
        vendorId: 1,
        userId: 10,
        businessName: 'Test Vendor Pvt Ltd',
        gstNumber: '32ABCDE1234F1Z5',
        licenseNumber: 'LIC-123',
        address: 'Test Address, Trivandrum',
        status: 'VERIFIED'
      })
    );

    await TestBed.configureTestingModule({
      imports: [VendorProfileComponent], // standalone component
      providers: [{ provide: VendorService, useValue: vendorServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(VendorProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges(); // triggers ngOnInit -> loadProfile
    expect(component).toBeTruthy();
  });

  it('should call getVendorById on init and map API response to UI model', () => {
    fixture.detectChanges(); // triggers ngOnInit

    expect(vendorServiceSpy.getVendorById).toHaveBeenCalled();
    // We hardcoded vendor id = 1 in the component
    expect(vendorServiceSpy.getVendorById).toHaveBeenCalledWith(1);

    // Mapped fields
    expect(component.vendor.vendorId).toBe('1');
    expect(component.vendor.userId).toBe('10');
    expect(component.vendor.companyName).toBe('Test Vendor Pvt Ltd');
    expect(component.vendor.gstNumber).toBe('32ABCDE1234F1Z5');
    expect(component.vendor.licenseNumber).toBe('LIC-123');
    expect(component.vendor.address).toContain('Trivandrum');

    // Status mapping VERIFIED -> Verified
    expect(component.vendor.status).toBe('Verified');
  });

  it('should set errorMessages when API call fails', () => {
    vendorServiceSpy.getVendorById.and.returnValue(
      throwError(() => ({
        message: 'Network error'
      }))
    );

    fixture.detectChanges(); // triggers ngOnInit

    expect(component.errorMessages.length).toBeGreaterThan(0);
    expect(component.errorMessages[0]).toContain('Network error');
    expect(component.loading).toBeFalse();
  });

  it('onEdit should enable editMode and patch the form with current vendor values', () => {
    fixture.detectChanges(); // load vendor first

    component.onEdit();

    expect(component.editMode).toBeTrue();
    expect(component.form.get('companyName')?.value).toBe(component.vendor.companyName);
    expect(component.form.get('gstNumber')?.value).toBe(component.vendor.gstNumber);
  });

  it('onCancel should exit editMode and reset form back to vendor values', () => {
    fixture.detectChanges();
    component.onEdit();

    component.form.patchValue({ companyName: 'Changed Name' });
    component.onCancel();

    expect(component.editMode).toBeFalse();
    expect(component.form.get('companyName')?.value).toBe(component.vendor.companyName);
  });

  it('onSave should update vendor from form and show UI-only success message', () => {
    fixture.detectChanges();
    component.onEdit();

    component.form.patchValue({
      companyName: 'Updated Co',
      address: 'Updated Address',
      status: 'Unverified'
    });

    component.onSave();

    expect(component.editMode).toBeFalse();
    expect(component.vendor.companyName).toBe('Updated Co');
    expect(component.vendor.address).toBe('Updated Address');
    expect(component.vendor.status).toBe('Unverified');
    expect(component.successMessage).toContain('UI only');
  });

  it('statusClass should return correct class name', () => {
    expect(component.statusClass('Verified')).toBe('verified');
    expect(component.statusClass('Unverified')).toBe('unverified');
    expect(component.statusClass('anything')).toBe('unverified');
  });
});