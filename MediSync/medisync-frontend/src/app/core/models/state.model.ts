export interface Profile {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  vendorId: string;
  avatarDataUrl: string;
  updatedAt: number;
  prefs: { rfq: boolean; compliance: boolean; delivery: boolean; };
}

export interface Rfq {
  id: string;
  title: string;
  status: 'Active' | 'Closed' | string;
  closesOn: string; // ISO YYYY-MM-DD
  items: number;
  notes?: string;
}

export interface Bid {
  rfqId: string;
  pricePerUnit: number;
  deliveryDate: string;
  notes?: string;
  updatedAt: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  amount: number;
  validUntil: string;
  deliveryDate: string;
  status: 'Submitted' | 'Approved' | 'Rejected' | string;
  notes?: string;
}

export interface Delivery {
  id: string;
  status: 'packed' | 'in_transit' | 'delivered' | 'delayed' | string;
  expectedDate: string;
  actualDate: string;
  carrier?: string;
  tracking?: string;
  notes?: string;
}

export interface Ticket {
  id: string;
  issueType: 'rfq' | 'quotation' | 'delivery' | 'compliance' | 'other' | string;
  priority: 'low'|'medium'|'high'|'urgent'|string;
  refId?: string;
  subject: string;
  details: string;
  status: 'Open' | 'Closed' | string;
  createdAt: number;
}

export interface SearchState {
  query: string;
  results: { type: 'RFQ'|'Quotation'|'Delivery'|'Ticket'; id: string; title: string; meta: string }[];
}

export interface PortalState {
  version: number;
  profile: Profile;
  complianceDocs: any[];
  rfqs: Rfq[];
  bids: Record<string, Bid>;
  quotations: Quotation[];
  deliveries: Delivery[];
  tickets: Ticket[];
  selection: { rfqId: string; quoteId: string; deliveryId: string; ticketId: string; };
  search: SearchState;
}