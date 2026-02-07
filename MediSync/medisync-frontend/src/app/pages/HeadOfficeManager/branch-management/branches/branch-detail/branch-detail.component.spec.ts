import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchDetailComponent } from './branch-detail.component';

describe('BranchDetailComponent', () => {
  let component: BranchDetailComponent;
  let fixture: ComponentFixture<BranchDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
