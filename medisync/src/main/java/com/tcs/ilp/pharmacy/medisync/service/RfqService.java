package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.context.RequestContext;
import com.tcs.ilp.pharmacy.medisync.dto.*;
import com.tcs.ilp.pharmacy.medisync.entity.*;
import com.tcs.ilp.pharmacy.medisync.exception.NotFoundException;
import com.tcs.ilp.pharmacy.medisync.repository.RfqRepository;
import com.tcs.ilp.pharmacy.medisync.repository.StoreRepository;
import com.tcs.ilp.pharmacy.medisync.repository.UsersRepository;
import com.tcs.ilp.pharmacy.medisync.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RfqService {

    private final RequestContext ctx;
    private final RfqRepository rfqRepo;
    private final UsersRepository usersRepo;
    private final StoreRepository storeRepo;

    private final VendorRepository vendorRepository;

    public RfqService(
            RequestContext ctx,
            RfqRepository rfqRepo,
            UsersRepository usersRepo,
            StoreRepository storeRepo,
            VendorRepository vendorRepository
    ) {
        this.ctx = ctx;
        this.rfqRepo = rfqRepo;
        this.usersRepo = usersRepo;
        this.storeRepo = storeRepo;
        this.vendorRepository = vendorRepository;
    }

    // ---------- READ ----------

    @Transactional(readOnly = true)
    public List<RfqPayloadDto> listAll() {
        return rfqRepo.findAll()
                .stream()
                .map(this::buildPayload)
                .toList();
    }


    public List<VendorResponse> getAwardedVendors(Integer storeId)
    {

        return rfqRepo.findAwardedVendorsByStore(storeId)
                .stream()
                .map(this::toVendorResponse)
                .toList();
    }


    @Transactional(readOnly = true)
    public RfqPayloadDto getRfq(Integer rfqId) {
        return buildPayload(findRfq(rfqId));
    }

    // ---------- WRITE ----------
    public RfqPayloadDto updateRfq(RfqPayloadDto payload) {
        ctx.requireRole("MANAGER");

        if (payload == null || payload.getRfq() == null) {
            throw new IllegalArgumentException("Invalid RFQ payload");
        }

        Integer rfqId = payload.getRfq().getRfqId();
        if (rfqId == null) {
            throw new IllegalArgumentException("RFQ ID is required for update");
        }

        // Fetch RFQ
        Rfq rfq = findRfq(rfqId);

        // 🔒 Ensure RFQ belongs to manager's store
        if (!rfq.getStore().getStoreId().equals(ctx.storeId())) {
            throw new NotFoundException("RFQ not found for this store");
        }

        RfqDto in = payload.getRfq();

        // ---------- Update RFQ header ----------
        rfq.setStatus(in.getStatusAward());
        rfq.setSubmissionDeadline(in.getSubmissionDeadline());
        rfq.setExpectedDeliveryDate(in.getExpectedDeliveryDate());

        // ---------- Update RFQ items ----------
        // Simple + safe strategy: replace items
        rfq.getItems().clear();

        for (RfqItemDto itemDto : payload.getItems()) {
            RfqItems item = new RfqItems();
            item.setMedicineName(itemDto.getRfqItemName());
            item.setQuantityNeeded(itemDto.getQuantityNeeded());
            rfq.getItems().add(item);
        }

        // Save & return updated payload
        return buildPayload(rfqRepo.save(rfq));
    }


    public RfqPayloadDto createRfq(RfqPayloadDto payload) {
        ctx.requireRole("MANAGER");

        Users creator = usersRepo.findById(ctx.userId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        Stores store = storeRepo.findById(ctx.storeId())
                .orElseThrow(() -> new NotFoundException("Store not found"));

        Rfq rfq = new Rfq();
        RfqDto in = payload.getRfq();

        rfq.setCreatedBy(creator);
        rfq.setStore(store);
        rfq.setStatus(in.getStatusAward());
        rfq.setSubmissionDeadline(in.getSubmissionDeadline());
        rfq.setExpectedDeliveryDate(in.getExpectedDeliveryDate());

        for (RfqItemDto itemDto : payload.getItems()) {
            RfqItems item = new RfqItems();
            item.setMedicineName(itemDto.getRfqItemName());
            item.setQuantityNeeded(itemDto.getQuantityNeeded());
            rfq.getItems().add(item);
        }

        return buildPayload(rfqRepo.save(rfq));
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
    public void award(BidDto bidDto, String status) {
        ctx.requireRole("MANAGER");
        Vendor v = vendorRepository.findByVendorId(bidDto.getVendorId())
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        findRfq(bidDto.getRfqId()).setStatus(status);
        findRfq(bidDto.getRfqId()).setAwardedVendor(v);
    }

    public void delete(Integer rfqId) {
        ctx.requireRole("MANAGER");

        Rfq rfq = findRfq(rfqId);

        // 🔒 Ensure RFQ belongs to manager's store
        if (!rfq.getStore().getStoreId().equals(ctx.storeId())) {
            throw new NotFoundException("RFQ not found for this store");
        }

        rfqRepo.delete(rfq);
    }


    // ---------- helpers ----------

    private Rfq findRfq(Integer rfqId) {
        return rfqRepo.findById(rfqId)
                .orElseThrow(() -> new NotFoundException("RFQ not found: " + rfqId));
    }

    private RfqPayloadDto buildPayload(Rfq rfq) {

        RfqDto rfqDto = new RfqDto();
        rfqDto.setRfqId(rfq.getRfqId());
        rfqDto.setCreatedBy(rfq.getCreatedBy().getUserId());
        rfqDto.setStatusAward(rfq.getStatus());
        rfqDto.setSubmissionDeadline(rfq.getSubmissionDeadline());
        rfqDto.setExpectedDeliveryDate(rfq.getExpectedDeliveryDate());

        List<RfqItemDto> items = rfq.getItems().stream().map(i -> {
            RfqItemDto dto = new RfqItemDto();
            dto.setRfqItemId(i.getRfqItemId());
            dto.setQuantityNeeded(i.getQuantityNeeded());
            dto.setRfqItemName(i.getMedicineName());
            return dto;
        }).toList();

        return new RfqPayloadDto(rfqDto, items);
    }
}
