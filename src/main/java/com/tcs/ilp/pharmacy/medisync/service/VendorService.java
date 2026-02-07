package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.dto.VendorDocumentResponse;
import com.tcs.ilp.pharmacy.medisync.dto.VendorDocumentUploadRequest;
import com.tcs.ilp.pharmacy.medisync.dto.VendorRegisterRequest;
import com.tcs.ilp.pharmacy.medisync.dto.VendorResponse;
import com.tcs.ilp.pharmacy.medisync.entity.Vendor;
import com.tcs.ilp.pharmacy.medisync.entity.VendorDocuments;
import com.tcs.ilp.pharmacy.medisync.exception.NotFoundException;
import com.tcs.ilp.pharmacy.medisync.exception.ValidationException;
import com.tcs.ilp.pharmacy.medisync.repository.UsersRepository;
import com.tcs.ilp.pharmacy.medisync.repository.VendorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class VendorService {

    private final VendorRepository vendorRepository;
    private final UsersRepository usersRepository;

    public VendorService(VendorRepository vendorRepository,
                         UsersRepository usersRepository) {
        this.vendorRepository = vendorRepository;
        this.usersRepository = usersRepository;
    }

    public VendorResponse registerVendor(VendorRegisterRequest request) {

    if (vendorRepository.existsByGstNumber(request.getGstNumber())) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "GST already exists");
    }
    if (vendorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "License already exists");
    }
    if (vendorRepository.findByEmail(request.getEmail()).isPresent()) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
    }

    // ✅ validate businessName (matches your DTO)
    if (isBlank(request.getBusinessName())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "businessName is required");
    }

    Vendor vendor = new Vendor();
    vendor.setEmail(request.getEmail());
    vendor.setPassword(request.getPassword()); // TODO: hash later
    vendor.setGstNumber(request.getGstNumber());
    vendor.setLicenseNumber(request.getLicenseNumber());
    vendor.setAddress(request.getAddress());
    vendor.setStatus("PENDING");

    // ✅ map DTO.businessName -> entity.vendorName (column vendor_name NOT NULL)
    vendor.setVendorName(request.getBusinessName().trim());

    Vendor saved = vendorRepository.save(vendor);
    return toVendorResponse(saved);
}

    /**
     * Null-safe mapper. Falls back to Vendor.email if Vendor.user is null.
     */
    private VendorResponse toVendorResponse(Vendor vendor) {
        VendorResponse res = new VendorResponse();
        res.setVendorId(vendor.getVendorId());

        if (vendor.getUser() != null) {
            res.setUserId(vendor.getUser().getUserId());
            res.setBusinessName(vendor.getUser().getName());
            res.setEmail(vendor.getUser().getEmail());
            res.setPhoneNumber(vendor.getUser().getPhoneNumber());
        } else {
            // Fallbacks when vendor.user is not set
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

    @Transactional(readOnly = true)
    public List<VendorResponse> getAllVendors() {
        return vendorRepository.findAll()
                .stream()
                .map(this::toVendorResponse)
                .toList();
    }

    public VendorDocumentResponse uploadDocument(Integer vendorId, VendorDocumentUploadRequest request) {

        if (vendorId == null || vendorId <= 0) {
            throw new ValidationException("vendorId must be a positive number");
        }
        if (request == null) {
            throw new ValidationException("Request body is required");
        }
        if (isBlank(request.getDocType())) {
            throw new ValidationException("docType is required");
        }
        if (isBlank(request.getFileUrl())) {
            throw new ValidationException("fileUrl is required");
        }

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found: " + vendorId));

        VendorDocuments doc = new VendorDocuments();
        doc.setVendor(vendor); // IMPORTANT: owning side is VendorDocuments.vendor
        doc.setDocType(request.getDocType().trim());
        doc.setFileUrl(request.getFileUrl().trim());

        // Defaults on upload
        doc.setStatus("PENDING");   // ✅ set default status
        doc.setVerifiedBy(null);
        doc.setVerifiedAt(null);
        doc.setRemarks(null);

        vendor.getDocuments().add(doc);
        vendorRepository.save(vendor);

        // 6) Build response from saved doc (null-safe)
        return toVendorDocumentResponse(doc);
    }

    /**
     * Null-safe mapper for document response.
     */
    private VendorDocumentResponse toVendorDocumentResponse(VendorDocuments doc) {
        VendorDocumentResponse res = new VendorDocumentResponse();
        res.setDocId(doc.getDocId());
        res.setVendorId(doc.getVendor().getVendorId());
        res.setDocType(doc.getDocType());
        res.setFileUrl(doc.getFileUrl());
        res.setVerifiedBy(doc.getVerifiedBy() != null ? doc.getVerifiedBy().getUserId() : null);
        res.setVerifiedAt(doc.getVerifiedAt());
        // If your VendorDocumentResponse has status/remarks fields, set them here.
        // res.setStatus(doc.getStatus());
        // res.setRemarks(doc.getRemarks());
        return res;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    @Transactional(readOnly = true)
    public VendorResponse getVendor(Integer vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor with Vendor Id " + vendorId + " not found"));
        return toVendorResponse(vendor);
    }
}