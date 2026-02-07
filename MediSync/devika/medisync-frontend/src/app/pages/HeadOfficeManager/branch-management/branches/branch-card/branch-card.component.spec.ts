import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchCardComponent } from './branch-card.component';

describe('BranchCardComponent', () => {
  let component: BranchCardComponent;
  let fixture: ComponentFixture<BranchCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BranchCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
