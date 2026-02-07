import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RfqListComponent } from './rfq-list.component';

describe('RfqListComponent', () => {
  let component: RfqListComponent;
  let fixture: ComponentFixture<RfqListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RfqListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RfqListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
