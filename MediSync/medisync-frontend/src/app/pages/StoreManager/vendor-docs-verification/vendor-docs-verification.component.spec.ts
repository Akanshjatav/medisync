import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDocsVerificationComponent } from './vendor-docs-verification.component';

describe('VendorDocsVerificationComponent', () => {
  let component: VendorDocsVerificationComponent;
  let fixture: ComponentFixture<VendorDocsVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorDocsVerificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VendorDocsVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
