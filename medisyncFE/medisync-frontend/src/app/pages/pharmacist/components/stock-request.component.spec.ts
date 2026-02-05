import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StockRequestComponent, Branch, Product, StockRequestPayload } from '../stock-request/stock-request.component';

describe('StockRequestComponent', () => {
  let component: StockRequestComponent;
  let fixture: ComponentFixture<StockRequestComponent>;

  const mockBranches: Branch[] = [
    { id: 'b1', name: 'Trivandrum Branch', location: 'TVM' },
    { id: 'b2', name: 'Kochi Branch', location: 'EKM' }
  ];

  const mockProducts: Product[] = [
    { id: 'p1', name: 'Product A', price: 150 },
    { id: 'p2', name: 'Product B', price: 220 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockRequestComponent] // ✅ standalone component import
    }).compileComponents();

    fixture = TestBed.createComponent(StockRequestComponent);
    component = fixture.componentInstance;

    // Provide required @Input() data
    component.branches = mockBranches;
    component.products = mockProducts;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with one line item by default', () => {
    expect(component.lines.length).toBe(1);
  });

  it('should add a new line when addLine() is called', () => {
    component.addLine();
    fixture.detectChanges();
    expect(component.lines.length).toBe(2);
  });

  it('should not remove the last remaining line', () => {
    expect(component.lines.length).toBe(1);

    component.removeLine(0);
    fixture.detectChanges();

    expect(component.lines.length).toBe(1); // still 1
  });

  it('should remove a line if there is more than one', () => {
    component.addLine();
    fixture.detectChanges();
    expect(component.lines.length).toBe(2);

    component.removeLine(0);
    fixture.detectChanges();
    expect(component.lines.length).toBe(1);
  });

  it('should auto-fill price when a product is selected', () => {
    const line0 = component.lines.at(0);

    line0.get('productId')!.setValue('p1'); // triggers valueChanges
    fixture.detectChanges();

    // price control is disabled, but value is still readable
    expect(line0.get('price')!.value).toBe(150);
  });

  it('should show validation errors after submit when required fields are empty', () => {
    // initial state: branchId empty, productId empty (quantity defaults to 1)
    component.submit();
    fixture.detectChanges();

    // look for the red validation divs
    const errors = fixture.debugElement.queryAll(By.css('.field-error'));
    expect(errors.length).toBeGreaterThan(0);

    const pageText = fixture.nativeElement.textContent as string;
    expect(pageText).toContain('Branch is required.');
    expect(pageText).toContain('Product is required.');
  });

  it('should emit submitRequest with correct payload when form is valid', () => {
    const emitSpy = spyOn(component.submitRequest, 'emit');

    // Fill branch
    component.form.controls.branchId.setValue('b1');

    // Fill line 0
    const line0 = component.lines.at(0);
    line0.get('productId')!.setValue('p2'); // sets price to 220
    line0.get('quantity')!.setValue(3);

    fixture.detectChanges();

    component.submit();
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledTimes(1);

    const payload = emitSpy.calls.mostRecent().args[0]!;

    expect(payload.branchId).toBe('b1');
    expect(payload.branchName).toBe('Trivandrum Branch');

    expect(payload.lines.length).toBe(1);
    expect(payload.lines[0].productId).toBe('p2');
    expect(payload.lines[0].productName).toBe('Product B');
    expect(payload.lines[0].price).toBe(220);
    expect(payload.lines[0].quantity).toBe(3);

    // totals
    expect(payload.totalQuantity).toBe(3);
    expect(payload.totalAmount).toBe(660);

    // success message displayed
    const msg = fixture.debugElement.query(By.css('.message.success'));
    expect(msg).toBeTruthy();
  });

  it('should calculate totals correctly for multiple lines', () => {
    component.form.controls.branchId.setValue('b2');

    // line 0
    const line0 = component.lines.at(0);
    line0.get('productId')!.setValue('p1'); // 150
    line0.get('quantity')!.setValue(2);     // 300

    // add another line
    component.addLine();
    const line1 = component.lines.at(1);
    line1.get('productId')!.setValue('p2'); // 220
    line1.get('quantity')!.setValue(1);     // 220

    fixture.detectChanges();

    expect(component.totalQuantity).toBe(3);
    expect(component.totalAmount).toBe(520);
  });
});