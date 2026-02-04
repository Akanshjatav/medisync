package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.dto.VendorDocumentResponse;
import com.tcs.ilp.pharmacy.medisync.dto.VendorDocumentUploadRequest;
import com.tcs.ilp.pharmacy.medisync.dto.VendorRegisterRequest;
import com.tcs.ilp.pharmacy.medisync.dto.VendorResponse;
import com.tcs.ilp.pharmacy.medisync.entity.Users;
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

        Vendor vendor = new Vendor();
        vendor.setEmail(request.getEmail());
        vendor.setPassword(request.getPassword()); // hash later
        vendor.setGstNumber(request.getGstNumber());
        vendor.setLicenseNumber(request.getLicenseNumber());
        vendor.setAddress(request.getAddress());
        vendor.setStatus("PENDING");

        Vendor saved = vendorRepository.save(vendor);
        return toVendorResponse(saved);
    }


    private VendorResponse toVendorResponse(Vendor vendor) {
        VendorResponse res = new VendorResponse();
        res.setVendorId(vendor.getVendorId());
        res.setUserId(vendor.getUser().getUserId());
        res.setBusinessName(vendor.getUser().getName());
        res.setEmail(vendor.getUser().getEmail());
        res.setPhoneNumber(vendor.getUser().getPhoneNumber());
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

        // 1) Validate inputs
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

        // 2) Fetch vendor
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found: " + vendorId));

        // 3) Create document entity
        VendorDocuments doc = new VendorDocuments();
        doc.setVendor(vendor); // IMPORTANT: owning side should be VendorDocuments.vendor

        doc.setDocType(request.getDocType().trim());
        doc.setFileUrl(request.getFileUrl().trim());

        // On upload it is usually unverified
        doc.setVerifiedBy(null);
        doc.setVerifiedAt(null);

        // 4) Attach to vendor (cascade persists)
        vendor.getDocuments().add(doc);

        // 5) Save vendor → document saved via cascade
        vendorRepository.save(vendor);

        // If you need docId immediately (depends on flush strategy), uncomment:
        // vendorRepository.flush();

        // 6) Build response from saved doc
        return toVendorDocumentResponse(doc);
    }

    private VendorDocumentResponse toVendorDocumentResponse(VendorDocuments doc) {
        VendorDocumentResponse res = new VendorDocumentResponse();
        res.setDocId(doc.getDocId());
        res.setVendorId(doc.getVendor().getVendorId());
        res.setDocType(doc.getDocType());
        res.setFileUrl(doc.getFileUrl());
        res.setVerifiedBy(doc.getVerifiedBy().getUserId());
        res.setVerifiedAt(doc.getVerifiedAt());
        return res;
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    public VendorResponse getVendor(Integer vendorId) {

        Vendor vendor = vendorRepository.getById(vendorId);
        if(vendor==null) throw new NotFoundException("Vendor with Vendor Id "+ vendorId+ " not found");
        return  toVendorResponse(vendor);
    }
}
