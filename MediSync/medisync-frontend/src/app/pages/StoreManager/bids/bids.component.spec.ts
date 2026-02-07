// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { BidsComponent } from './bids.component';

// describe('BidsComponent', () => {
//   let component: BidsComponent;
//   let fixture: ComponentFixture<BidsComponent>;
//   let httpMock: HttpTestingController;

//   const mockBids = [
//     {
//       bidId: 1,
//       rfqId: 1,
//       vendorId: 1,
//       vendorName: 'Vendor One',
//       status: 'SUBMITTED',
//       items: [
//         { medicineName: 'Paracetamol', itemQuantity: 1000, itemPrice: 2.10 },
//         { medicineName: 'Ibuprofen', itemQuantity: 500, itemPrice: 3.00 }
//       ]
//     },
//     {
//       bidId: 2,
//       rfqId: 1,
//       vendorId: 2,
//       vendorName: 'Vendor Two',
//       status: 'SUBMITTED',
//       items: [
//         { medicineName: 'Paracetamol', itemQuantity: 1000, itemPrice: 2.00 },
//         { medicineName: 'Ibuprofen', itemQuantity: 500, itemPrice: 2.90 }
//       ]
//     }
//   ];

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       // ✅ Standalone component -> add to imports, NOT declarations
//       imports: [BidsComponent, HttpClientTestingModule]
//     }).compileComponents();

//     fixture = TestBed.createComponent(BidsComponent);
//     component = fixture.componentInstance;
//     httpMock = TestBed.inject(HttpTestingController);

//     // ✅ triggers ngOnInit() -> loadBids() -> makes GET request
//     fixture.detectChanges();

//     // ✅ flush the initial API call
//     const req = httpMock.expectOne((r) => r.method === 'GET' && r.url.includes('/api/bids'));
//     req.flush(mockBids);

//     fixture.detectChanges();
//   });

//   afterEach(() => {
//     httpMock.verify();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should render the Bids title from the HTML', () => {
//     const el: HTMLElement = fixture.nativeElement;

//     // Your updated HTML title is in H3: "Bids (From Backend)"
//     expect(el.querySelector('h3')?.textContent).toContain('Bids');
//   });

//   it('should load bids on init and populate filteredBids', () => {
//     expect(component.filteredBids.length).toBe(2);
//     expect(component.filteredBids[0].vendorName).toBe('Vendor One');
//   });

//   it('getTotalQty should calculate total quantity correctly', () => {
//     const bid1 = component.filteredBids[0];
//     expect(component.getTotalQty(bid1)).toBe(1500); // 1000 + 500
//   });

//   it('getTotalValue should calculate total value correctly', () => {
//     const bid1 = component.filteredBids[0];
//     // 1000*2.10 + 500*3.00 = 2100 + 1500 = 3600
//     expect(component.getTotalValue(bid1)).toBeCloseTo(3600, 5);
//   });

//   it('selectBid should set selectedBid and successMessage', () => {
//     const bid2 = component.filteredBids[1];
//     component.selectBid(bid2);

//     expect(component.selectedBid?.bidId).toBe(2);
//     expect(component.successMessage).toContain('Selected Bid #2');
//   });

//   it('toggleSidebar should toggle sidebarOpen signal', () => {
//     expect(component.sidebarOpen()).toBeFalse();

//     component.toggleSidebar();
//     expect(component.sidebarOpen()).toBeTrue();

//     component.toggleSidebar();
//     expect(component.sidebarOpen()).toBeFalse();
//   });

//   it('downloadPdf should set successMessage', () => {
//     component.downloadPdf(1);
//     expect(component.successMessage).toContain('Download PDF clicked for Bid #1');
//   });
// });