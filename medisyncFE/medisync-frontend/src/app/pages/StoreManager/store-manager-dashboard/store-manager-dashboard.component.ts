import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

type PageKey = 'dashboard' | 'stockEntry' | 'dispatch' | 'products' | 'search';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  notes?: string;
}

interface Batch {
  id: string;
  productId: string;
  batchNo: string;
  mfgDate: string;
  expDate: string;
  qty: number;
  location: string;
  supplier: string;
  unitCost?: number;
  notes?: string;
  createdAt: number;
}

interface Shipment {
  id: string;
  supplier: string;
  etaText: string;
  status: string;
  unitsPlanned: number;
  received: boolean;
}

interface Receive {
  id: string;
  shipmentId: string;
  receivedDate: string;
  receivedUnits: number;
  qcRequired: 'yes' | 'no';
  invoiceNo: string;
  invoiceFileName?: string;
  notes?: string;
  createdAt: number;
}

interface Dispatch {
  id: string;
  status: string;
  carrier?: string;
  tracking?: string;
  expectedDate?: string;
  actualDate?: string;
  notes?: string;
  updatedAt: number;
}

interface Activity {
  id: string;
  text: string;
  ts: number;
}

interface SearchResult {
  type: 'Product' | 'Batch' | 'Shipment' | 'Dispatch' | 'Activity';
  id: string;
  title: string;
  open: { page: PageKey; payload?: any };
}

@Component({
  selector: 'app-store-manager-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './store-manager-dashboard.component.html',
  styleUrl: './store-manager-dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})
export class StoreManagerDashboardComponent implements OnInit {
  private isBrowser = false;

  /** ✅ NEW: sidebar state (Store Manager specific) */
  sidebarOpen = false;

  activePage: PageKey = 'dashboard';

  todayLabel = '';
  yearLabel = new Date().getFullYear();

  incomingSortCol: 'shipmentId' | 'supplier' | 'eta' | 'status' = 'shipmentId';
  incomingSortDir: 'asc' | 'desc' = 'asc';

  // In-memory state (no localStorage/sessionStorage)
  products: Product[] = [];
  batches: Batch[] = [];
  shipments: Shipment[] = [];
  receives: Receive[] = [];
  dispatches: Dispatch[] = [];
  activity: Activity[] = [];

  // Lookup map (prevents template .find())
  productNameById: Record<string, string> = {};

  // Search
  searchQuery = '';
  searchResults: SearchResult[] = [];

  // Toast
  toastOn = false;
  toastTitle = 'Saved';
  toastMsg = '';
  private toastTimer: any = null;

  // Forms
  receiveForm = this.fb.group({
    shipmentId: ['', [Validators.required, Validators.pattern(/^SHP-\d{3,6}$/i)]],
    receivedDate: ['', [Validators.required]],
    receivedUnits: [null as any, [Validators.required, Validators.min(1)]],
    qcRequired: ['', [Validators.required]],
    invoiceNo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    invoiceFile: [null as File | null],
    notes: ['']
  });

  stockEntryForm = this.fb.group({
    productId: ['', [Validators.required]],
    batchNo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9][A-Z0-9\-]{2,19}$/i)]],
    mfgDate: ['', [Validators.required]],
    expDate: ['', [Validators.required]],
    qty: [null as any, [Validators.required, Validators.min(1)]],
    location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    supplier: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    unitCost: [0, [Validators.min(0)]],
    batchDocs: [null as File | null],
    notes: ['']
  });

  dispatchForm = this.fb.group({
    dispatchId: ['', [Validators.required, Validators.pattern(/^DSP-\d{3,6}$/i)]],
    status: ['', [Validators.required]],
    carrier: [''],
    tracking: [''],
    expectedDate: [''],
    actualDate: [''],
    notes: ['']
  });

  productForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    sku: ['', [Validators.required, Validators.pattern(/^[A-Z0-9][A-Z0-9\-]{2,19}$/i)]],
    category: ['', [Validators.required]],
    unit: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
    notes: ['']
  });

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.seedData();
    this.rebuildProductNameById();
    this.renderHeaderLabels();
  }

  /** ✅ NEW: Sidebar controls */
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  /** Optional UX: ESC closes sidebar */
  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (!this.isBrowser) return;
    this.closeSidebar();
  }

  // ✅ FIX: accept HTMLDialogElement directly (template ref is a dialog element)
  closeDialog(dialog: HTMLDialogElement | null | undefined): void {
    if (!this.isBrowser || !dialog) return;
    dialog.close();
  }

  openDialog(dialog: HTMLDialogElement | null | undefined): void {
    if (!this.isBrowser || !dialog) return;
    dialog.showModal();
  }

  // ---------- UI ----------
  setPage(page: PageKey): void {
    this.activePage = page;
    // ✅ Close sidebar after selection (great for mobile overlay)
    this.closeSidebar();
  }

  renderHeaderLabels(): void {
    const now = new Date();
    this.todayLabel = now.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
    this.yearLabel = now.getFullYear();
  }

  // ---------- Sorting ----------
  sortIncoming(col: 'shipmentId' | 'supplier' | 'eta' | 'status'): void {
    if (this.incomingSortCol === col) {
      this.incomingSortDir = this.incomingSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.incomingSortCol = col;
      this.incomingSortDir = 'asc';
    }
  }

  get sortedShipments(): Shipment[] {
    const rows = [...this.shipments];
    const dir = this.incomingSortDir === 'asc' ? 1 : -1;

    const idNum = (val: string) => {
      const n = parseInt(String(val).replace(/\D+/g, ''), 10);
      return Number.isFinite(n) ? n : 1e9;
    };

    const etaRank = (val: string) => {
      const s = String(val).toLowerCase();
      if (s.startsWith('today')) return 0;
      if (s.startsWith('tomorrow')) return 1;
      return 10;
    };

    return rows.sort((a, b) => {
      if (this.incomingSortCol === 'shipmentId') return (idNum(a.id) - idNum(b.id)) * dir;
      if (this.incomingSortCol === 'eta') return (etaRank(a.etaText) - etaRank(b.etaText)) * dir;

      const A =
        this.incomingSortCol === 'supplier' ? a.supplier.toLowerCase() : a.status.toLowerCase();
      const B =
        this.incomingSortCol === 'supplier' ? b.supplier.toLowerCase() : b.status.toLowerCase();

      return A.localeCompare(B) * dir;
    });
  }

  // ---------- KPIs ----------
  get kpiStock(): number {
    return this.batches.reduce((sum, b) => sum + (b.qty || 0), 0);
  }

  get kpiExpiring(): number {
    const today = this.dateISO();
    const t = new Date(today + 'T00:00:00');
    const in30 = new Date(t);
    in30.setDate(in30.getDate() + 30);

    return this.batches.filter(b => {
      const d = new Date((b.expDate || '1970-01-01') + 'T00:00:00');
      return d >= t && d <= in30;
    }).length;
  }

  get kpiQC(): number {
    return this.shipments.filter(s => String(s.status).toLowerCase().includes('qc')).length;
  }

  get kpiDispatchToday(): number {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return (
      this.dispatches.filter(d => (d.updatedAt || 0) >= start.getTime()).length ||
      this.dispatches.length
    );
  }

  // ---------- Search ----------
  onSearchSubmit(): void {
    const q = (this.searchQuery || '').trim();
    if (q.length < 2) {
      this.toast('Search', 'Type at least 2 characters to search.');
      return;
    }
    this.searchResults = this.computeSearchResults(q);
    this.setPage('search');
    this.toast('Search', `${this.searchResults.length} match(es) for “${q}”.`);
  }

  private computeSearchResults(query: string): SearchResult[] {
    const q = query.trim().toLowerCase();
    const includes = (s: any) => String(s || '').toLowerCase().includes(q);

    const results: SearchResult[] = [];

    this.products.forEach(p => {
      if (includes(p.id) || includes(p.name) || includes(p.sku) || includes(p.category)) {
        results.push({
          type: 'Product',
          id: p.id,
          title: `${p.name} (${p.sku})`,
          open: { page: 'products' }
        });
      }
    });

    this.batches.forEach(b => {
      const name = this.productNameById[b.productId] || 'Product';
      if (
        includes(b.id) ||
        includes(b.batchNo) ||
        includes(name) ||
        includes(b.location) ||
        includes(b.supplier)
      ) {
        results.push({
          type: 'Batch',
          id: b.id,
          title: `${name} • Batch ${b.batchNo} • Qty ${b.qty}`,
          open: { page: 'stockEntry' }
        });
      }
    });

    this.shipments.forEach(s => {
      if (includes(s.id) || includes(s.supplier) || includes(s.status) || includes(s.etaText)) {
        results.push({
          type: 'Shipment',
          id: s.id,
          title: `${s.supplier} • ${s.status} • ETA ${s.etaText}`,
          open: { page: 'dashboard' }
        });
      }
    });

    this.dispatches.forEach(d => {
      if (includes(d.id) || includes(d.status) || includes(d.carrier) || includes(d.tracking)) {
        results.push({
          type: 'Dispatch',
          id: d.id,
          title: `${d.status.replaceAll('_', ' ')} • ${d.carrier || '—'} • ${d.tracking || '—'}`,
          open: { page: 'dispatch', payload: { dispatchId: d.id } }
        });
      }
    });

    this.activity.forEach(a => {
      if (includes(a.text)) {
        results.push({ type: 'Activity', id: a.id, title: a.text, open: { page: 'dashboard' } });
      }
    });

    return results.slice(0, 60);
  }

  openSearchResult(
    r: SearchResult,
    receiveModal?: HTMLDialogElement | null,
    dispatchModal?: HTMLDialogElement | null
  ): void {
    this.setPage(r.open.page);

    // Contextual open
    if (r.open.payload?.dispatchId && dispatchModal) {
      this.openDispatchDialog(r.open.payload.dispatchId, dispatchModal);
    }
  }

  // ---------- Dialog openers with prefill ----------
  openReceiveDialog(shipmentId: string | undefined, receiveModal: HTMLDialogElement | null): void {
    if (!this.isBrowser || !receiveModal) return;

    this.receiveForm.reset();
    this.receiveForm.patchValue({
      shipmentId: shipmentId || '',
      receivedDate: this.dateISO()
    });

    receiveModal.showModal();
  }

  openStockEntryDialog(stockEntryModal: HTMLDialogElement | null): void {
    if (!this.isBrowser || !stockEntryModal) return;
    this.stockEntryForm.reset();
    stockEntryModal.showModal();
  }

  openDispatchDialog(dispatchId: string | undefined, dispatchModal: HTMLDialogElement | null): void {
    if (!this.isBrowser || !dispatchModal) return;

    this.dispatchForm.reset();
    if (dispatchId) {
      const d = this.dispatches.find(x => x.id.toUpperCase() === dispatchId.toUpperCase());
      if (d) {
        this.dispatchForm.patchValue({
          dispatchId: d.id,
          status: d.status,
          carrier: d.carrier || '',
          tracking: d.tracking || '',
          expectedDate: d.expectedDate || '',
          actualDate: d.actualDate || '',
          notes: d.notes || ''
        });
      } else {
        this.dispatchForm.patchValue({ dispatchId: dispatchId.toUpperCase() });
      }
    }
    dispatchModal.showModal();
  }

  openProductDialog(productModal: HTMLDialogElement | null): void {
    if (!this.isBrowser || !productModal) return;
    this.productForm.reset();
    productModal.showModal();
  }

  // ---------- File inputs ----------
  onFileChange(controlName: 'invoiceFile' | 'batchDocs', evt: Event, form: 'receive' | 'stock'): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    if (form === 'receive') this.receiveForm.patchValue({ invoiceFile: file });
    if (form === 'stock') this.stockEntryForm.patchValue({ batchDocs: file });
  }

  // ---------- Saves ----------
  submitReceive(receiveModal: HTMLDialogElement | null): void {
    this.receiveForm.markAllAsTouched();
    if (this.receiveForm.invalid) return;

    const v = this.receiveForm.value;
    const shipmentId = String(v.shipmentId || '').trim().toUpperCase();

    const rec: Receive = {
      id: 'RCV-' + Math.floor(Math.random() * 9000 + 1000),
      shipmentId,
      receivedDate: String(v.receivedDate || ''),
      receivedUnits: Number(v.receivedUnits || 0),
      qcRequired: v.qcRequired as any,
      invoiceNo: String(v.invoiceNo || '').trim(),
      invoiceFileName: v.invoiceFile?.name,
      notes: String(v.notes || '').trim(),
      createdAt: Date.now()
    };

    this.receives.unshift(rec);

    const ship = this.shipments.find(s => s.id.toUpperCase() === shipmentId);
    if (ship) {
      ship.received = true;
      ship.status = rec.qcRequired === 'yes' ? 'QC Pending' : 'Received';
    } else {
      this.shipments.unshift({
        id: shipmentId,
        supplier: '—',
        etaText: '—',
        status: rec.qcRequired === 'yes' ? 'QC Pending' : 'Received',
        unitsPlanned: rec.receivedUnits,
        received: true
      });
    }

    this.activity.unshift({
      id: 'ACT-' + Math.random().toString(16).slice(2, 7),
      text: `Receiving: ${shipmentId} received (${rec.receivedUnits} units) — ${this.fmtDate(rec.receivedDate)}`,
      ts: Date.now()
    });

    this.toast('Shipment received', `${shipmentId} recorded successfully.`);
    this.closeDialog(receiveModal);
  }

  submitStockEntry(stockEntryModal: HTMLDialogElement | null): void {
    this.stockEntryForm.markAllAsTouched();
    if (this.stockEntryForm.invalid) return;

    const v = this.stockEntryForm.value;
    const productId = String(v.productId || '');
    const batchNo = String(v.batchNo || '').trim().toUpperCase();

    if (this.batches.some(b => b.productId === productId && b.batchNo.toUpperCase() === batchNo)) {
      this.toast('Validation', 'This batch already exists for the selected product.');
      return;
    }

    const mfg = String(v.mfgDate || '');
    const exp = String(v.expDate || '');
    if (mfg && exp && exp <= mfg) {
      this.toast('Validation', 'Expiry must be after Mfg date.');
      return;
    }

    const batch: Batch = {
      id: 'BAT-' + Math.floor(Math.random() * 90000 + 10000),
      productId,
      batchNo,
      mfgDate: mfg,
      expDate: exp,
      qty: Number(v.qty || 0),
      location: String(v.location || '').trim().toUpperCase(),
      supplier: String(v.supplier || '').trim(),
      unitCost: Number(v.unitCost || 0),
      notes: String(v.notes || '').trim(),
      createdAt: Date.now()
    };

    this.batches.unshift(batch);

    this.activity.unshift({
      id: 'ACT-' + Math.random().toString(16).slice(2, 7),
      text: `Stock Entry: ${batch.qty} units of ${this.productNameById[productId] || 'Product'} (Batch ${batch.batchNo}) — ${this.fmtDate(this.dateISO())}`,
      ts: Date.now()
    });

    this.toast('Stock entry saved', `${batch.batchNo} added to inventory.`);
    this.closeDialog(stockEntryModal);
  }

  submitDispatch(dispatchModal: HTMLDialogElement | null): void {
    this.dispatchForm.markAllAsTouched();
    if (this.dispatchForm.invalid) return;

    const v = this.dispatchForm.value;
    const id = String(v.dispatchId || '').trim().toUpperCase();

    if (v.status === 'delivered' && !v.actualDate) {
      this.toast('Validation', 'Actual delivery date is required when Delivered.');
      return;
    }
    if (v.status === 'delayed' && !v.expectedDate) {
      this.toast('Validation', 'Expected date is required when Delayed.');
      return;
    }

    const payload: Dispatch = {
      id,
      status: String(v.status || ''),
      carrier: String(v.carrier || '').trim(),
      tracking: String(v.tracking || '').trim(),
      expectedDate: String(v.expectedDate || ''),
      actualDate: String(v.actualDate || ''),
      notes: String(v.notes || '').trim(),
      updatedAt: Date.now()
    };

    const idx = this.dispatches.findIndex(d => d.id.toUpperCase() === id);
    if (idx >= 0) this.dispatches[idx] = { ...this.dispatches[idx], ...payload };
    else this.dispatches.unshift(payload);

    this.activity.unshift({
      id: 'ACT-' + Math.random().toString(16).slice(2, 7),
      text: `Dispatch: ${id} updated to ${payload.status.replaceAll('_', ' ')} — ${new Date().toLocaleString()}`,
      ts: Date.now()
    });

    this.toast('Dispatch updated', `${id} updated successfully.`);
    this.closeDialog(dispatchModal);
  }

  submitProduct(productModal: HTMLDialogElement | null): void {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) return;

    const v = this.productForm.value;
    const sku = String(v.sku || '').trim().toUpperCase();

    if (this.products.some(p => p.sku.toUpperCase() === sku)) {
      this.toast('Validation', 'SKU already exists. Use a unique SKU.');
      return;
    }

    const product: Product = {
      id: 'PRD-' + Math.floor(Math.random() * 900 + 100).toString().padStart(3, '0'),
      name: String(v.name || '').trim(),
      sku,
      category: String(v.category || ''),
      unit: String(v.unit || '').trim(),
      notes: String(v.notes || '').trim()
    };

    this.products.unshift(product);
    this.rebuildProductNameById();

    this.toast('Product added', `${product.name} (${product.sku}) created.`);
    this.closeDialog(productModal);
  }

  // ---------- Toast ----------
  toast(title: string, msg: string, ms = 2400): void {
    this.toastTitle = title || 'Saved';
    this.toastMsg = msg || '';
    this.toastOn = true;

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toastOn = false), ms);
  }

  // ---------- Utils ----------
  private rebuildProductNameById(): void {
    this.productNameById = this.products.reduce((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {} as Record<string, string>);
  }

  private dateISO(): string {
    const d = new Date();
    const pad2 = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  fmtDate(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  }

  batchCount(productId: string): number {
    return this.batches.filter(b => b.productId === productId).length;
  }

  stockForProduct(productId: string): number {
    return this.batches
      .filter(b => b.productId === productId)
      .reduce((sum, b) => sum + (b.qty || 0), 0);
  }

  statusTagClass(status: string): string {
    const s = String(status || '').toLowerCase();
    if (s.includes('delayed')) return 'tag--warn';
    if (s.includes('qc')) return 'tag--info';
    return 'tag--ok';
  }

  // ---------- Seed ----------
  private seedData(): void {
    this.products = [
      { id: 'PRD-001', name: 'Paracetamol 500mg', sku: 'PCM-500', category: 'tablet', unit: 'strip', notes: '' },
      { id: 'PRD-002', name: 'Amoxicillin 250mg', sku: 'AMX-250', category: 'capsule', unit: 'strip', notes: '' },
      { id: 'PRD-003', name: 'Syringe 5ml', sku: 'SYR-5ML', category: 'device', unit: 'pcs', notes: '' }
    ];

    this.batches = [
      {
        id: 'BAT-1001',
        productId: 'PRD-001',
        batchNo: 'P-554',
        mfgDate: '2025-06-01',
        expDate: '2026-05-31',
        qty: 2500,
        location: 'RACK-A3',
        supplier: 'Medico Pharma',
        unitCost: 0.72,
        notes: '',
        createdAt: Date.now() - 86400000
      },
      {
        id: 'BAT-1002',
        productId: 'PRD-002',
        batchNo: 'C-211',
        mfgDate: '2025-05-10',
        expDate: '2026-04-20',
        qty: 1200,
        location: 'RACK-B1',
        supplier: 'HealthPlus Labs',
        unitCost: 1.85,
        notes: 'QC passed',
        createdAt: Date.now() - 2 * 86400000
      }
    ];

    this.shipments = [
      { id: 'SHP-845', supplier: 'Medico Pharma', etaText: 'Today 16:00', status: 'On Route', unitsPlanned: 500, received: false },
      { id: 'SHP-846', supplier: 'HealthPlus Labs', etaText: 'Tomorrow', status: 'Scheduled', unitsPlanned: 300, received: false },
      { id: 'SHP-847', supplier: 'PrimeCare', etaText: 'Thu', status: 'Delayed', unitsPlanned: 200, received: false }
    ];

    this.dispatches = [
      { id: 'DSP-772', status: 'packed', carrier: 'BlueDart', tracking: 'BD998877', expectedDate: '', actualDate: '', notes: '', updatedAt: Date.now() }
    ];

    this.activity = [
      { id: 'ACT-01', text: 'Stock Entry: Received 50 units of Paracetamol (Batch P-554) — Today', ts: Date.now() - 2 * 3600000 },
      { id: 'ACT-02', text: 'Quality Check: Batch C-211 approved — Yesterday', ts: Date.now() - 28 * 3600000 },
      { id: 'ACT-03', text: 'Dispatch: Order DSP-772 confirmed and packed — Yesterday', ts: Date.now() - 30 * 3600000 }
    ];
  }
}
