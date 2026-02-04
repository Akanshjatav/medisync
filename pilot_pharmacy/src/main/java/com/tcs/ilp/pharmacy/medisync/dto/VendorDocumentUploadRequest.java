
package com.tcs.ilp.pharmacy.medisync.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VendorDocumentUploadRequest {

    @NotBlank @Size(max = 10)
    private String docType;

    @NotBlank @Size(max = 100)
    private String fileUrl;

    public VendorDocumentUploadRequest() {}

    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
}
