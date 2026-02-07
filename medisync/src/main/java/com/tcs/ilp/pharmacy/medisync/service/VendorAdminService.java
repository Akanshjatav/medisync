// File: src/main/java/com/tcs/ilp/pharmacy/medisync/service/VendorAdminService.java
package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.dto.VendorResponse;
import com.tcs.ilp.pharmacy.medisync.entity.Users;
import com.tcs.ilp.pharmacy.medisync.entity.Vendor;
import com.tcs.ilp.pharmacy.medisync.entity.VendorDocuments;
import com.tcs.ilp.pharmacy.medisync.exception.NotFoundException;
import com.tcs.ilp.pharmacy.medisync.exception.ValidationException;
import com.tcs.ilp.pharmacy.medisync.repository.UsersRepository;
import com.tcs.ilp.pharmacy.medisync.repository.VendorDocumentsRepository;
import com.tcs.ilp.pharmacy.medisync.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class VendorAdminService {

    private final VendorRepository vendorRepository;
    private final VendorDocumentsRepository vendorDocumentsRepository;
    private final UsersRepository usersRepository;

    public VendorAdminService(VendorRepository vendorRepository,
                              VendorDocumentsRepository vendorDocumentsRepository,
                              UsersRepository usersRepository) {
        this.vendorRepository = vendorRepository;
        this.vendorDocumentsRepository = vendorDocumentsRepository;
        this.usersRepository = usersRepository;
    }

    // ===== DTOs (scoped to service/controller as requested) =====
    public record VendorAdminSummaryDto(
            Integer vendorId,
            String businessName,
            String email,
            String gstNumber,
            String licenseNumber,
            String status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    public record VendorDocumentAdminDto(
            Integer docId,
            String docType,
            String fileUrl,
            String status,
            Integer verifiedByUserId,
            String verifiedByName,
            LocalDateTime verifiedAt,
            String remarks
    ) {}

    public record VendorAdminDetailDto(
            Integer vendorId,
            String businessName,
            String email,
            String phoneNumber,
            String gstNumber,
            String licenseNumber,
            String address,
            String status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<VendorDocumentAdminDto> documents
    ) {}

    public record ApproveRejectRequest(String remarks) {}
    public record DocVerifyRejectRequest(String remarks) {}

    // ===== List vendors with status filter =====
    @Transactional(readOnly = true)
    public List<VendorAdminSummaryDto> listVendors(String status) {
        final String normalized = status == null ? "ALL" : status.trim().toUpperCase();
        List<Vendor> vendors = switch (normalized) {
            case "PENDING", "APPROVED", "REJECTED" ->
                    vendorRepository.findAll().stream()
                            .filter(v -> normalized.equalsIgnoreCase(safe(v.getStatus())))
                            .toList();
            case "ALL" -> vendorRepository.findAll();
            default -> throw new ValidationException("Unsupported status: " + status);
        };

        return vendors.stream()
                .sorted(Comparator.comparing(Vendor::getCreatedAt).reversed())
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public VendorAdminDetailDto getVendorDetail(Integer vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found: " + vendorId));

        List<VendorDocuments> docs = vendorDocumentsRepository.findByVendor_VendorId(vendorId);
        return toDetail(vendor, docs);
    }

    // ===== Document actions =====
    public VendorDocumentAdminDto verifyDocument(Integer docId, String remarks, Integer verifierUserId) {
        VendorDocuments doc = vendorDocumentsRepository.findById(docId)
                .orElseThrow(() -> new NotFoundException("Document not found: " + docId));

        Users verifier = usersRepository.findById(verifierUserId)
                .orElseThrow(() -> new NotFoundException("User not found: " + verifierUserId));

        doc.setStatus("VERIFIED");
        doc.setVerifiedBy(verifier);
        doc.setVerifiedAt(LocalDateTime.now());
        doc.setRemarks(remarks);

        VendorDocuments saved = vendorDocumentsRepository.save(doc);
        return toDoc(saved);
    }

    public VendorDocumentAdminDto rejectDocument(Integer docId, String remarks, Integer verifierUserId) {
        if (remarks == null || remarks.isBlank()) {
            throw new ValidationException("Remarks required when rejecting a document");
        }

        VendorDocuments doc = vendorDocumentsRepository.findById(docId)
                .orElseThrow(() -> new NotFoundException("Document not found: " + docId));

        Users verifier = usersRepository.findById(verifierUserId)
                .orElseThrow(() -> new NotFoundException("User not found: " + verifierUserId));

        doc.setStatus("REJECTED");
        doc.setVerifiedBy(verifier);
        doc.setVerifiedAt(LocalDateTime.now());
        doc.setRemarks(remarks);

        VendorDocuments saved = vendorDocumentsRepository.save(doc);
        return toDoc(saved);
    }

    // ===== Expose file path for controller (read-only) =====
    @Transactional(readOnly = true)
    public String getDocumentFilePath(Integer docId) {
        VendorDocuments doc = vendorDocumentsRepository.findById(docId)
                .orElseThrow(() -> new NotFoundException("Document not found: " + docId));
        return doc.getFileUrl();
    }

    // ===== Vendor approval (STRICT rule) =====
    public VendorResponse approveVendor(Integer vendorId, String remarks) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found: " + vendorId));

        List<VendorDocuments> docs = vendorDocumentsRepository.findByVendor_VendorId(vendorId);
        boolean allVerified = !docs.isEmpty() && docs.stream()
                .allMatch(d -> "VERIFIED".equalsIgnoreCase(safe(d.getStatus())));

        if (!allVerified) {
            throw new ValidationException("Cannot approve: all documents must be VERIFIED");
        }

        vendor.setStatus("APPROVED");
        Vendor saved = vendorRepository.save(vendor);
        return toVendorResponseSafe(saved);
    }

    public VendorResponse rejectVendor(Integer vendorId, String remarks) {
        if (remarks == null || remarks.isBlank()) {
            throw new ValidationException("Remarks required when rejecting a vendor");
        }

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found: " + vendorId));

        vendor.setStatus("REJECTED");
        Vendor saved = vendorRepository.save(vendor);
        return toVendorResponseSafe(saved);
    }

    // ===== Mapping helpers =====

    private VendorAdminSummaryDto toSummary(Vendor v) {
        String businessName = v.getUser() != null ? v.getUser().getName() : null;
        String email = v.getUser() != null ? v.getUser().getEmail() : v.getEmail();
        return new VendorAdminSummaryDto(
                v.getVendorId(),
                businessName,
                email,
                v.getGstNumber(),
                v.getLicenseNumber(),
                v.getStatus(),
                v.getCreatedAt(),
                v.getUpdatedAt()
        );
    }

    private VendorAdminDetailDto toDetail(Vendor v, List<VendorDocuments> docs) {
        String businessName = v.getUser() != null ? v.getUser().getName() : null;
        String email = v.getUser() != null ? v.getUser().getEmail() : v.getEmail();
        String phone = v.getUser() != null ? v.getUser().getPhoneNumber() : null;

        List<VendorDocumentAdminDto> docDtos = docs.stream()
                .sorted(Comparator.comparing(VendorDocuments::getCreatedAt))
                .map(this::toDoc)
                .toList();

        return new VendorAdminDetailDto(
                v.getVendorId(),
                businessName,
                email,
                phone,
                v.getGstNumber(),
                v.getLicenseNumber(),
                v.getAddress(),
                v.getStatus(),
                v.getCreatedAt(),
                v.getUpdatedAt(),
                docDtos
        );
    }

    private VendorDocumentAdminDto toDoc(VendorDocuments d) {
        Integer verifiedById = d.getVerifiedBy() != null ? d.getVerifiedBy().getUserId() : null;
        String verifiedByName = d.getVerifiedBy() != null ? d.getVerifiedBy().getName() : null;

        return new VendorDocumentAdminDto(
                d.getDocId(),
                d.getDocType(),
                d.getFileUrl(),
                d.getStatus(),
                verifiedById,
                verifiedByName,
                d.getVerifiedAt(),
                d.getRemarks()
        );
    }

    private VendorResponse toVendorResponseSafe(Vendor vendor) {
        VendorResponse res = new VendorResponse();
        res.setVendorId(vendor.getVendorId());
        if (vendor.getUser() != null) {
            res.setUserId(vendor.getUser().getUserId());
            res.setBusinessName(vendor.getUser().getName());
            res.setEmail(vendor.getUser().getEmail());
            res.setPhoneNumber(vendor.getUser().getPhoneNumber());
        } else {
            res.setUserId(null);
            res.setBusinessName(null);
            res.setEmail(vendor.getEmail());
            res.setPhoneNumber(null);
        }
        res.setGstNumber(vendor.getGstNumber());
        res.setLicenseNumber(vendor.getLicenseNumber());
        res.setAddress(vendor.getAddress());
        res.setStatus(vendor.getStatus());
        res.setCreatedAt(vendor.getCreatedAt());
        res.setUpdatedAt(vendor.getUpdatedAt());
        return res;
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }
}