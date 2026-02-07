import { TestBed } from '@angular/core/testing';
import { HoDashboardComponent } from './ho-dashboard.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../../../environments/environment';

describe('DashboardComponent (inline models + http)', () => {
  let fixture: any;
  let component: HoDashboardComponent;
  let httpMock: HttpTestingController;

  const baseUrl = environment.apiBaseUrl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HoDashboardComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HoDashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load summary and branch performance on init', () => {
    fixture.detectChanges(); // triggers ngOnInit -> loadDashboard()

    const reqSummary = httpMock.expectOne(`${baseUrl}/api/dashboard/summary`);
    expect(reqSummary.request.method).toBe('GET');
    reqSummary.flush({
      totalUsers: 254,
      activeBranches: 12,
      vendorsRegistered: 8,
    });

    const reqPerf = httpMock.expectOne(`${baseUrl}/api/dashboard/branch-performance`);
    expect(reqPerf.request.method).toBe('GET');
    reqPerf.flush([
      { branch: 'Branch A', value: 60 },
      { branch: 'Branch B', value: 75 },
      { branch: 'Branch C', value: 85 },
      { branch: 'Branch D', value: 70 }
    ]);

    expect(component.loading()).toBeFalse();
    expect(component.error()).toBeNull();
    expect(component.summary()?.totalUsers).toBe(254);
    
  
  });

  it('should set error if summary API fails', () => {
    fixture.detectChanges();

    const reqSummary = httpMock.expectOne(`${baseUrl}/api/dashboard/summary`);
    reqSummary.flush('Server error', { status: 500, statusText: 'Server Error' });

    // forkJoin errors out; component should set error and stop loading
    expect(component.loading()).toBeFalse();
    expect(component.error()).toBe('Failed to load dashboard data.');
  });
});