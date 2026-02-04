package com.tcs.ilp.pharmacy.medisync.controller;

import com.tcs.ilp.pharmacy.medisync.context.RequestContext;
import com.tcs.ilp.pharmacy.medisync.dto.*;
import com.tcs.ilp.pharmacy.medisync.service.BidsService;
import com.tcs.ilp.pharmacy.medisync.service.RfqService;
import com.tcs.ilp.pharmacy.medisync.service.StockRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sm")
public class StoreManagerController {

    private final RequestContext ctx;
    private final RfqService rfqService;
    private final StockRequestService stockRequestService;
    private final BidsService bidsService;

    public StoreManagerController(
            RequestContext ctx,
            RfqService rfqService,
            StockRequestService stockRequestService,
            BidsService bidsService
    ) {
        this.ctx = ctx;
        this.rfqService = rfqService;
        this.stockRequestService = stockRequestService;
        this.bidsService = bidsService;
    }

    // =====================================================
    // RFQ
    // =====================================================

    @PostMapping("/rfqs")
    @ResponseStatus(HttpStatus.CREATED)
    public RfqPayloadDto createRfq(@RequestBody RfqPayloadDto payload) {
        ctx.requireRole("MANAGER");
        return rfqService.createRfq(payload);
    }

    @GetMapping("/rfqs")
    public List<RfqPayloadDto> getAllRfqs() {
        ctx.requireRole("MANAGER");
        return rfqService.listAll();
    }

    @PostMapping("/rfqs/{rfqId}/award")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void awardRfq(
            @PathVariable Integer rfqId,
            @RequestParam String status
    ) {
        ctx.requireRole("MANAGER");
        rfqService.award(rfqId, status);
    }

    // =====================================================
    // BIDS
    // =====================================================

    @GetMapping("/rfqs/{rfqId}/bids")
    public List<BidDto> viewBids(@PathVariable Integer rfqId) {
        ctx.requireRole("MANAGER");
        return bidsService.getBidsForRfq(rfqId);
    }





    // =====================================================
    // STOCK REQUESTS
    // =====================================================

    @GetMapping("/stock-requests")
    public List<StockRequestDto> getStockRequests(
            @RequestParam String status
    ) {
        ctx.requireRole("MANAGER");
        return stockRequestService.findByStatus(status);
    }

    @PostMapping("/stock-requests/{id}/approve")
    public StockRequestDto approve(@PathVariable Integer id) {
        ctx.requireRole("MANAGER");
        return stockRequestService.approve(id);
    }

    @PostMapping("/stock-requests/{id}/reject")
    public StockRequestDto reject(
            @PathVariable Integer id,
            @RequestParam(required = false) String remarks
    ) {
        ctx.requireRole("MANAGER");
        return stockRequestService.reject(id, remarks);
    }
}
