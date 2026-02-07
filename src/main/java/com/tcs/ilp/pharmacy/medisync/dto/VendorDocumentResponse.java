
package com.tcs.ilp.pharmacy.medisync.dto;

import java.time.LocalDateTime;

public class VendorDocumentResponse {
    private Integer docId;
    private Integer vendorId;
    private String docType;
    private String fileUrl;
    private Integer verifiedBy;
    private LocalDateTime verifiedAt;

    public VendorDocumentResponse() {}

    public Integer getDocId() { return docId; }
    public void setDocId(Integer docId) { this.docId = docId; }

    public Integer getVendorId() { return vendorId; }
    public void setVendorId(Integer vendorId) { this.vendorId = vendorId; }

    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public Integer getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(Integer verifiedBy) { this.verifiedBy = verifiedBy; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
}
