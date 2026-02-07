import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { debounceTime } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { VendorsAdminApiService, VendorDetailDto, VendorDocumentAdminDto } from '../../../core/services/vendors-admin-api-service';

export interface VendorDocument {
  documentId: number;
  vendorId: number;
  vendorName: string;
  documentType: string;
  fileName: string;
  fileUrl: string;       // backend-served preview/download URL
  fileType: 'pdf' | 'image' | 'document';
  fileSize: number;      // 0 if unknown
  uploadedAt: string | null; // null if backend doesn’t provide
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
}

@Component({
  selector: 'app-vendor-docs-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vendor-docs-verification.component.html',
  styleUrls: ['./vendor-docs-verification.component.css']
})
export class VendorDocsVerificationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private api = inject(VendorsAdminApiService);

  loading = signal<boolean>(false);
  errorMsg = signal<string>('');

  documents = signal<VendorDocument[]>([]);
  selectedDoc = signal<VendorDocument | null>(null);

  previewOpen = signal<boolean>(false);
  approveConfirmOpen = signal<boolean>(false);
  rejectConfirmOpen = signal<boolean>(false);
  showApproveSuccess = signal<boolean>(false);
  showRejectSuccess = signal<boolean>(false);

  actionLoading = signal<boolean>(false);
  showRejectReason = signal<boolean>(false);
  rejectionReasonError = signal<boolean>(false);

  filtersForm!: FormGroup;
  rejectionReason = '';

  filteredDocs = computed(() => {
    const docs = this.documents();
    const filters = this.filtersForm?.value;
    if (!filters) return docs;

    return docs.filter(doc => {
      const q = (filters.q ?? '').toString().trim().toLowerCase();
      const matchesSearch = !q || doc.vendorName.toLowerCase().includes(q) || doc.fileName.toLowerCase().includes(q);
      const matchesStatus = !filters.status || doc.status === filters.status;
      const matchesDocType = !filters.docType || doc.documentType === filters.docType;
      const matchesDate = !filters.uploadedAfter ||
        (doc.uploadedAt ? new Date(doc.uploadedAt) >= new Date(filters.uploadedAfter) : true);
      return matchesSearch && matchesStatus && matchesDocType && matchesDate;
    });
  });

  ngOnInit(): void {
    this.initForm();
    this.loadDocuments(); // real HTTP now
  }

  initForm(): void {
    this.filtersForm = this.fb.group({
      q: [''],
      status: [''],
      docType: [''],
      uploadedAfter: ['']
    });
    this.filtersForm.valueChanges.pipe(debounceTime(300)).subscribe();
  }

  // ===== REAL DATA LOADING =====
  async loadDocuments(): Promise<void> {
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      const rows = await firstValueFrom(this.api.listAllDocumentsAggregated());
      const mapped: VendorDocument[] = rows.map(({ doc, vendor }) => this.mapDoc(doc, vendor));
      this.documents.set(mapped);
    } catch (error) {
      console.error('Error loading documents:', error);
      this.errorMsg.set('Failed to load vendor documents. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private mapDoc(doc: VendorDocumentAdminDto, vendor: VendorDetailDto): VendorDocument {
    const fileName = this.deriveFileName(doc.fileUrl);
    const fileType = this.deriveFileType(fileName);
    const uiStatus = this.mapDocStatusToUi(doc.status);
    const previewUrl = this.api.docFileUrl(doc.docId); // use backend file endpoint for preview/download

    return {
      documentId: doc.docId,
      vendorId: vendor.vendorId,
      vendorName: vendor.businessName ?? vendor.email ?? `Vendor #${vendor.vendorId}`,
      documentType: doc.docType,
      fileName,
      fileUrl: previewUrl,
      fileType,
      fileSize: 0,
      uploadedAt: null, // backend doesn’t provide; your template will show '—' for size if 0
      status: uiStatus,
      rejectionReason: doc.remarks ?? null,
      verifiedBy: doc.verifiedByName ?? null,
      verifiedAt: doc.verifiedAt ?? null
    };
  }

  // ===== PREVIEW =====
  openDocumentPreview(doc: VendorDocument): void {
    this.selectedDoc.set(doc);
    this.previewOpen.set(true);
    this.showRejectReason.set(false);
    this.rejectionReason = '';
    this.rejectionReasonError.set(false);
  }
  closePreview(): void {
    this.previewOpen.set(false);
    this.selectedDoc.set(null);
    this.showRejectReason.set(false);
    this.rejectionReason = '';
    this.rejectionReasonError.set(false);
  }

  // ===== APPROVE =====
  openApproveConfirm(): void { this.approveConfirmOpen.set(true); }
  closeApproveConfirm(): void { this.approveConfirmOpen.set(false); }

  async confirmApprove(): Promise<void> {
    const doc = this.selectedDoc();
    if (!doc) return;

    this.actionLoading.set(true);
    try {
      await firstValueFrom(this.api.verifyDocument(doc.documentId));

      // Update local state
      this.documents.update(docs =>
        docs.map(d => d.documentId === doc.documentId
          ? { ...d, status: 'APPROVED' as const, verifiedAt: new Date().toISOString(), rejectionReason: null }
          : d));

      this.selectedDoc.update(d => d
        ? { ...d, status: 'APPROVED' as const, verifiedAt: new Date().toISOString(), rejectionReason: null }
        : null);

      this.closeApproveConfirm();
      this.closePreview();
      this.showApproveSuccess.set(true);
    } catch (error) {
      console.error('Error approving document:', error);
      this.errorMsg.set('Failed to approve document. Please try again.');
    } finally {
      this.actionLoading.set(false);
    }
  }

  // ===== REJECT =====
  initiateReject(): void {
    this.showRejectReason.set(true);
    this.rejectionReasonError.set(false);
  }
  cancelReject(): void {
    this.showRejectReason.set(false);
    this.rejectionReason = '';
    this.rejectionReasonError.set(false);
  }
  openRejectConfirm(): void {
    if (!this.rejectionReason || this.rejectionReason.trim().length === 0) {
      this.rejectionReasonError.set(true);
      return;
    }
    this.rejectionReasonError.set(false);
    this.rejectConfirmOpen.set(true);
  }
  closeRejectConfirm(): void { this.rejectConfirmOpen.set(false); }

closeRejectSuccess(): void {
  this.showRejectSuccess.set(false);
}


closeApproveSuccess(): void {
    this.showApproveSuccess.set(false);
  }




  async confirmReject(): Promise<void> {
    const doc = this.selectedDoc();
    if (!doc || !this.rejectionReason) return;

    this.actionLoading.set(true);
    try {
      await firstValueFrom(this.api.rejectDocument(doc.documentId, this.rejectionReason));

      // Update local state
      this.documents.update(docs =>
        docs.map(d => d.documentId === doc.documentId
          ? {
              ...d,
              status: 'REJECTED' as const,
              rejectionReason: this.rejectionReason,
              verifiedAt: new Date().toISOString()
            }
          : d));

      this.selectedDoc.update(d => d
        ? {
            ...d,
            status: 'REJECTED' as const,
            rejectionReason: this.rejectionReason,
            verifiedAt: new Date().toISOString()
          }
        : null);

      this.closeRejectConfirm();
      this.closePreview();
      this.showRejectSuccess.set(true);
    } catch (error) {
      console.error('Error rejecting document:', error);
      this.errorMsg.set('Failed to reject document. Please try again.');
    } finally {
      this.actionLoading.set(false);
    }
  }

  // ===== UTIL =====
  formatDocType(type: string | undefined): string {
    if (!type) return '—';
    const map: Record<string, string> = {
      BUSINESS_LICENSE: 'Business License',
      TAX_CERTIFICATE: 'Tax Certificate',
      DRUG_LICENSE: 'Drug License',
      GST_CERTIFICATE: 'GST Certificate',
      BANK_DETAILS: 'Bank Details',
      INCORPORATION: 'Certificate of Incorporation'
    };
    return map[type] || type;
  }
  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '—';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  trackById(index: number, item: VendorDocument): number { return item.documentId; }

  private deriveFileName(fileUrl: string): string {
    try {
      const u = new URL(fileUrl, window.location.origin);
      return decodeURIComponent(u.pathname.split('/').pop() || 'document');
    } catch {
      return fileUrl?.split('/').pop() || 'document';
    }
  }
  private deriveFileType(fileName: string): 'pdf' | 'image' | 'document' {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return 'pdf';
    if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(lower)) return 'image';
    return 'document';
  }
  private mapDocStatusToUi(s: 'PENDING' | 'VERIFIED' | 'REJECTED'): 'PENDING' | 'APPROVED' | 'REJECTED' {
    return s === 'VERIFIED' ? 'APPROVED' : (s as any);
  }
}