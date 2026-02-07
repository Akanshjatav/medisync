import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBranchComponent } from './manage-branch.component';

describe('ManageBranchComponent', () => {
  let component: ManageBranchComponent;
  let fixture: ComponentFixture<ManageBranchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBranchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
