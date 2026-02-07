import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewMedicineComponent } from './add-new-medicine.component';

describe('AddNewMedicineComponent', () => {
  let component: AddNewMedicineComponent;
  let fixture: ComponentFixture<AddNewMedicineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewMedicineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
