import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRfqComponent } from './view-rfq.component';

describe('ViewRfqComponent', () => {
  let component: ViewRfqComponent;
  let fixture: ComponentFixture<ViewRfqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRfqComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRfqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
