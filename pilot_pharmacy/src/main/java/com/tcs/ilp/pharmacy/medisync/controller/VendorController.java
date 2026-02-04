package com.tcs.ilp.pharmacy.medisync.controller;

import com.tcs.ilp.pharmacy.medisync.context.RequestContext;
import com.tcs.ilp.pharmacy.medisync.dto.*;
import com.tcs.ilp.pharmacy.medisync.service.BidsService;
import com.tcs.ilp.pharmacy.medisync.service.RfqService;
import com.tcs.ilp.pharmacy.medisync.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/v1/vendors")
public class VendorController {

    private final RequestContext ctx;
    private final VendorService vendorService;
    private final RfqService rfqService;
    private final BidsService bidsService;

    public VendorController(
            RequestContext ctx,
            VendorService vendorService,
            RfqService rfqService,
            BidsService bidsService
    ) {
        this.ctx = ctx;
        this.vendorService = vendorService;
        this.rfqService = rfqService;
        this.bidsService = bidsService;
    }

    // =====================================================
    // VENDOR PROFILE
    // =====================================================

    @GetMapping("/me")
    public VendorResponse getMyProfile() {
        ctx.requireVendor();
        return vendorService.getVendor(ctx.vendorId());
    }

    @PostMapping("/documents")
    public VendorDocumentResponse uploadDocument(
            @RequestBody VendorDocumentUploadRequest request) {

        ctx.requireVendor();
        return vendorService.uploadDocument(ctx.vendorId(), request);
    }

    // =====================================================
    // RFQ BROWSING (READ ONLY)
    // =====================================================

    @GetMapping("/rfqs")
    public List<RfqPayloadDto> getAllRfqs() {
        ctx.requireVendor();
        return rfqService.listAll();
    }

    @GetMapping("/rfqs/{rfqId}")
    public RfqPayloadDto getRfq(@PathVariable Integer rfqId) {
        ctx.requireVendor();
        return rfqService.getRfq(rfqId);
    }

    // =====================================================
    // BIDS
    // =====================================================

    @PostMapping("/bids")
    @ResponseStatus(HttpStatus.CREATED)
    public void createBid(@RequestBody BidRequestDto request) {
        ctx.requireVendor();
        bidsService.createBid(request); // service must use ctx.vendorId()
    }

    @PutMapping("/bids/{bidId}/items")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateBidItems(
            @PathVariable Integer bidId,
            @RequestBody BidItemsUpdateDto request) {

        ctx.requireVendor();
        bidsService.updateBidItems(bidId, request);
    }

    @DeleteMapping("/bids/{bidId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBid(@PathVariable Integer bidId) {
        ctx.requireVendor();
        bidsService.delete(bidId);
    }
}
