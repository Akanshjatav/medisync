package com.tcs.ilp.pharmacy.medisync.controller;

import com.tcs.ilp.pharmacy.medisync.context.RequestContext;
import com.tcs.ilp.pharmacy.medisync.dto.VendorResponse;
import com.tcs.ilp.pharmacy.medisync.service.VendorAdminService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/vendors")
public class VendorsManagerController {

    private final RequestContext ctx;
    private final VendorAdminService adminService;

    public VendorsManagerController(RequestContext ctx,
                                    VendorAdminService adminService) {
        this.ctx = ctx;
        this.adminService = adminService;
    }

    // Reuse simple request DTOs
    public record ApproveRejectRequest(String remarks) {}
    public record DocVerifyRejectRequest(String remarks) {}

    // ===== LIST & DETAIL =====

    @GetMapping
    public List<VendorAdminService.VendorAdminSummaryDto> list(
            @RequestParam(defaultValue = "ALL") String status
    ) {
        ctx.requireRole("MANAGER");
        return adminService.listVendors(status);
    }

    @GetMapping("/{vendorId}")
    public VendorAdminService.VendorAdminDetailDto detail(
            @PathVariable Integer vendorId
    ) {
        ctx.requireRole("MANAGER");
        return adminService.getVendorDetail(vendorId);
    }

    // ===== DOCUMENT ACTIONS =====

    @PostMapping("/documents/{docId}/verify")
    public VendorAdminService.VendorDocumentAdminDto verifyDoc(
            @PathVariable Integer docId,
            @RequestBody(required = false) DocVerifyRejectRequest req
    ) {
        ctx.requireRole("MANAGER");
        Integer verifierUserId = ctx.userId();
        String remarks = (req != null) ? req.remarks() : null;
        return adminService.verifyDocument(docId, remarks, verifierUserId);
    }

    @PostMapping("/documents/{docId}/reject")
    public VendorAdminService.VendorDocumentAdminDto rejectDoc(
            @PathVariable Integer docId,
            @RequestBody DocVerifyRejectRequest req
    ) {
        ctx.requireRole("MANAGER");
        Integer verifierUserId = ctx.userId();
        String remarks = (req != null) ? req.remarks() : null;
        return adminService.rejectDocument(docId, remarks, verifierUserId);
    }

    // ===== VENDOR APPROVAL =====

    @PostMapping("/{vendorId}/approve")
    public VendorResponse approveVendor(
            @PathVariable Integer vendorId,
            @RequestBody(required = false) ApproveRejectRequest req
    ) {
        ctx.requireRole("MANAGER");
        String remarks = (req != null) ? req.remarks() : null;
        return adminService.approveVendor(vendorId, remarks);
    }

    @PostMapping("/{vendorId}/reject")
    public VendorResponse rejectVendor(
            @PathVariable Integer vendorId,
            @RequestBody ApproveRejectRequest req
    ) {
        ctx.requireRole("MANAGER");
        String remarks = (req != null) ? req.remarks() : null;
        return adminService.rejectVendor(vendorId, remarks);
    }

    // ===== LOCAL FILE SERVING =====
    // IMPORTANT: No direct repository access here. Only use the service.
    @GetMapping("/documents/{docId}/file")
    public ResponseEntity<Resource> getDocumentFile(@PathVariable Integer docId) {
        ctx.requireRole("MANAGER");

        // ✅ Use the service accessor; do NOT access private fields
        String filePath = adminService.getDocumentFilePath(docId);

        File file = new File(filePath);
        if (!file.exists() || !file.isFile()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        FileSystemResource resource = new FileSystemResource(file);
        String filename = file.getName();
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.inline().filename(encoded).build());
        headers.setCacheControl(CacheControl.noCache());

        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }
}