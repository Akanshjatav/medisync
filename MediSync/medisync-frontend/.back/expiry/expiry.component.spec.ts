import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpiryComponent } from './expiry.component';

describe('ExpiryComponent', () => {
  let component: ExpiryComponent;
  let fixture: ComponentFixture<ExpiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});