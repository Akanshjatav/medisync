import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BranchRegisterationComponent } from './branch-registration.component';

describe('BranchRegisterationComponent', () => {
  let component: BranchRegisterationComponent;
  let fixture: ComponentFixture<BranchRegisterationComponent>;
  let httpMock: HttpTestingController;

  const url = 'http://localhost:7000/api/v1/ho/register-branch';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchRegisterationComponent, HttpClientTestingModule] // ✅ standalone in imports
    }).compileComponents();

    fixture = TestBed.createComponent(BranchRegisterationComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation error if invalid', () => {
    component.onSubmit();
    expect(component.messageType()).toBe('err');
    expect(component.messageText()).toContain('validation');
  });

  it('should POST correct payload and show success message', () => {
    component.form.setValue({
      branchName: 'Test Branch',
      location: 'Trivandrum',
      branchAddress: 'MG Road'
    });

    component.onSubmit();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');

    // ✅ backend keys
    expect(req.request.body.branchName).toBe('Test Branch');
    expect(req.request.body.branchLocation).toBe('Trivandrum');
    expect(req.request.body.address).toBe('MG Road');

    req.flush({
      storeId: 1,
      inventoryId: 10,
      branchName: 'Test Branch',
      branchLocation: 'Trivandrum',
      address: 'MG Road'
    });

    expect(component.messageType()).toBe('ok');
    expect(component.messageText()).toContain('registered successfully');
  });
});