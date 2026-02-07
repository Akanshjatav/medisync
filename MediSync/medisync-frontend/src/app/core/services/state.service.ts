// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { PortalState, Quotation, Rfq, Delivery, Ticket } from '../models/state.model';
// import { StorageService } from './storage.service';
// // import { addDaysISO, todayISO } from '../'

// const KEY = 'vendorPortal.v3.angular';
// const VERSION = 3;

// const defaultState: PortalState = {
//   version: VERSION,
//   profile: {
//     fullName: 'Akansh Jatav',
//     role: 'Vendor Admin',
//     email: 'akansh@example.com',
//     phone: '',
//     company: 'Acme Pharma Supplies',
//     location: 'Trivandrum',
//     vendorId: 'VND-10291',
//     avatarDataUrl: '',
//     updatedAt: Date.now(),
//     prefs: { rfq: true, compliance: true, delivery: false }
//   },
//   complianceDocs: [],
//   rfqs: [
//     { id:'RFQ-1842', title:'Paracetamol 500mg (bulk)', status:'Active', closesOn:addDaysISO(1), items:3, notes:'Deliver to DC-01. Include batch test report.' },
//     { id:'RFQ-1843', title:'Amoxicillin 250mg (caps)', status:'Active', closesOn:addDaysISO(5), items:5, notes:'Cold-chain not required.' },
//     { id:'RFQ-1844', title:'Syringes 5ml (sterile)', status:'Active', closesOn:addDaysISO(2), items:2, notes:'Supply in sealed packs. Specify brand.' }
//   ],
//   bids: {},
//   quotations: [
//     { id:'Q-1001', rfqId:'RFQ-1842', amount:185000.50, validUntil:addDaysISO(10), deliveryDate:addDaysISO(20), status:'Submitted', notes:'Initial quote.' }
//   ],
//   deliveries: [
//     { id:'SHIP-5521', status:'in_transit', expectedDate:addDaysISO(3), actualDate:'', carrier:'BlueDart', tracking:'BD123456789', notes:'Left origin hub.' }
//   ],
//   tickets: [
//     { id:'TCK-901', issueType:'compliance', priority:'high', refId:'', subject:'Need clarification on ISO certificate format', details:'Please confirm if ISO 9001:2015 PDF is accepted.', status:'Open', createdAt:Date.now() }
//   ],
//   selection: { rfqId:'RFQ-1842', quoteId:'Q-1001', deliveryId:'SHIP-5521', ticketId:'TCK-901' },
//   search: { query:'', results:[] }
// };

// @Injectable({ providedIn: 'root' })
// export class StateService {
//   private state$ = new BehaviorSubject<PortalState>(this.migrate(this.storage.get(KEY, defaultState)));
//   sidebarOpen = false;

//   constructor(private storage: StorageService) {}

//   get snapshot(): PortalState { return this.state$.value; }
//   select$ = this.state$.asObservable();

//   private persist(s: PortalState) { this.storage.set(KEY, s); }
//   private update(mutator: (s: PortalState) => void) {
//     const next = structuredClone(this.snapshot);
//     mutator(next);
//     this.state$.next(next);
//     this.persist(next);
//   }

//   private migrate(raw: PortalState): PortalState {
//     if (!raw || raw.version !== VERSION) {
//       const s = structuredClone(defaultState);
//       try {
//         if (raw?.profile) s.profile = { ...s.profile, ...raw.profile };
//         if (raw?.rfqs) s.rfqs = raw.rfqs;
//         if (raw?.quotations) s.quotations = raw.quotations;
//         if (raw?.deliveries) s.deliveries = raw.deliveries;
//         if (raw?.tickets) s.tickets = raw.tickets;
//         if (raw?.bids) s.bids = raw.bids;
//         if (raw?.complianceDocs) s.complianceDocs = raw.complianceDocs;
//         if (raw?.selection) s.selection = { ...s.selection, ...raw.selection };
//         if (raw?.search) s.search = { ...s.search, ...raw.search };
//       } catch {}
//       s.version = VERSION;
//       return s;
//     }
//     return raw;
//   }

//   // -------- Derived counts / KPIs ----------
//   get counts() {
//     const s = this.snapshot;
//     const rfqCount = s.rfqs.length;
//     const quoteCount = s.quotations.length;
//     const delCount = s.deliveries.length;
//     const ticketCount = s.tickets.length;

//     const closingSoon = s.rfqs.filter(r => this.daysBetweenISO(todayISO(), r.closesOn) <= 2).length;
//     const approved = s.quotations.filter(q => (q.status || '').toLowerCase() === 'approved').length;
//     const inTransit = s.deliveries.filter(d => d.status === 'in_transit').length;
//     const awaiting = s.tickets.filter(t => t.status === 'Open').length;
//     const compliant = s.complianceDocs.length >= 1;

//     return { rfqCount, quoteCount, delCount, ticketCount, closingSoon, approved, inTransit, awaiting, compliant };
//   }

//   private daysBetweenISO(a: string, b: string) {
//     const da = new Date(a + 'T00:00:00');
//     const db = new Date(b + 'T00:00:00');
//     return Math.round((+db - +da) / (1000*60*60*24));
//   }

//   // ---------- Actions ----------
//   setSelection(sel: Partial<PortalState['selection']>) {
//     this.update(s => s.selection = { ...s.selection, ...sel });
//   }

//   submitQuotation(payload: Omit<Quotation, 'id'|'status'> & { notes?: string }) {
//     const id = 'Q-' + Math.floor(Math.random() * 9000 + 1000);
//     this.update(s => {
//       s.quotations.unshift({ id, status:'Submitted', ...payload });
//       s.selection.quoteId = id;
//     });
//     return id;
//   }

//   updateQuotation(id: string, changes: Partial<Quotation>) {
//     this.update(s => {
//       const q = s.quotations.find(x => x.id === id);
//       if (q) Object.assign(q, changes);
//     });
//   }

//   deleteQuotation(id: string) {
//     this.update(s => {
//       s.quotations = s.quotations.filter(q => q.id !== id);
//       if (s.selection.quoteId === id) s.selection.quoteId = s.quotations[0]?.id || '';
//     });
//   }

//   setProfile(changes: Partial<PortalState['profile']>) {
//     this.update(s => {
//       s.profile = { ...s.profile, ...changes, updatedAt: Date.now() };
//     });
//   }

//   // Search (same logic as original)
//   runSearch(q: string) {
//     const Q = (q || '').toLowerCase().trim();
//     const results: PortalState['search']['results'] = [];
//     const s = this.snapshot;

//     const contains = (txt?: string|number) => (String(txt||'').toLowerCase().includes(Q));

//     s.rfqs.forEach(r => {
//       if (contains(r.id) || contains(r.title) || contains(r.notes)) {
//         results.push({ type:'RFQ', id:r.id, title:r.title, meta:`Closes ${new Date(r.closesOn+'T00:00:00').toLocaleDateString()}` });
//       }
//     });
//     s.quotations.forEach(x => {
//       if (contains(x.id) || contains(x.rfqId) || contains(x.amount) || contains(x.notes)) {
//         results.push({ type:'Quotation', id:x.id, title:`${x.rfqId} • ₹${Number(x.amount).toFixed(2)}`, meta:`Valid ${x.validUntil}` });
//       }
//     });
//     s.deliveries.forEach(d => {
//       if (contains(d.id) || contains(d.carrier) || contains(d.tracking) || contains(d.notes)) {
//         results.push({ type:'Delivery', id:d.id, title:(d.status||'').replace('_',' '), meta:`Expected ${d.expectedDate}` });
//       }
//     });
//     s.tickets.forEach(t => {
//       if (contains(t.id) || contains(t.subject) || contains(t.details) || contains(t.refId)) {
//         results.push({ type:'Ticket', id:t.id, title:t.subject, meta:`Priority ${t.priority}` });
//       }
//     });

//     this.update(s => s.search = { query: q, results });
//   }

//   resetDemo() {
//     this.state$.next(structuredClone(defaultState));
//     this.persist(this.snapshot);
//   }
// }
