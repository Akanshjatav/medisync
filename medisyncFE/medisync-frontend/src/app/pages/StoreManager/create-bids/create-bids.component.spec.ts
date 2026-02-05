import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateBidsComponent } from './create-bids.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

describe('CreateBidsComponent', () => {
  let component: CreateBidsComponent;
  let fixture: ComponentFixture<CreateBidsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBidsComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'rfqId' ? '123' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateBidsComponent);
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

  it('should start with one bid row', () => {
    expect(component.bids.length).toBe(1);
  });

  it('should not add bid when existing row is invalid', () => {
    // row is empty initially -> invalid
    component.addBid();
    expect(component.bids.length).toBe(1);
  });

  it('should add bid when existing row is valid', () => {
    const first = component.bids.at(0);
    first.get('itemName')?.setValue('Item A');
    first.get('itemPrice')?.setValue(10);
    first.get('quantity')?.setValue(2);

    component.addBid();
    expect(component.bids.length).toBe(2);
  });

  it('should post bids when valid', () => {
    const first = component.bids.at(0);
    first.get('itemName')?.setValue('Item A');
    first.get('itemPrice')?.setValue(10);
    first.get('quantity')?.setValue(2);

    spyOn(window, 'alert');

    component.onSubmit();

    const req = httpMock.expectOne('/api/rfqs/123/bids');
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });

    expect(window.alert).toHaveBeenCalledWith('bids posted successfully');
    // After reset, should be 1 row again
    expect(component.bids.length).toBe(1);
  });
});
