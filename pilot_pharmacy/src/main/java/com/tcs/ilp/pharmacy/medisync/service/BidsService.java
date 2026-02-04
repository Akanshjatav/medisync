package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.context.RequestContext;
import com.tcs.ilp.pharmacy.medisync.dto.*;
import com.tcs.ilp.pharmacy.medisync.entity.*;
import com.tcs.ilp.pharmacy.medisync.exception.ResourceNotFoundException;
import com.tcs.ilp.pharmacy.medisync.repository.BidsRepository;
import com.tcs.ilp.pharmacy.medisync.repository.RfqRepository;
import com.tcs.ilp.pharmacy.medisync.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class BidsService {

    private final RequestContext ctx;
    private final BidsRepository bidsRepo;
    private final VendorRepository vendorRepo;
    private final RfqRepository rfqRepo;

    public BidsService(
            RequestContext ctx,
            BidsRepository bidsRepo,
            VendorRepository vendorRepo,
            RfqRepository rfqRepo
    ) {
        this.ctx = ctx;
        this.bidsRepo = bidsRepo;
        this.vendorRepo = vendorRepo;
        this.rfqRepo = rfqRepo;
    }

    // =====================================================
    // CREATE
    // =====================================================

    public void createBid(BidRequestDto request) {
        ctx.requireVendor();

        Vendor vendor = vendorRepo.findById(ctx.vendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));

        Rfq rfq = rfqRepo.findById(request.getRfqId())
                .orElseThrow(() -> new ResourceNotFoundException("RFQ not found"));

        Bids bid = new Bids();
        bid.setVendor(vendor);
        bid.setRfq(rfq);

        if (request.getItems() != null) {
            bid.setItems(toBidItems(request.getItems(), bid));
        }

        bidsRepo.save(bid);
    }

    // =====================================================
    // READ
    // =====================================================

    @Transactional(readOnly = true)
    public List<BidDto> getBidsForRfq(Integer rfqId) {
        return bidsRepo.findByRfq_RfqId(rfqId)
                .stream()
                .map(this::toDto)
                .toList();
    }



    // =====================================================
    // UPDATE
    // =====================================================

    public void updateBidItems(Integer bidId, BidItemsUpdateDto request) {
        ctx.requireVendor();

        Bids bid = getOwnedBid(bidId);

        bid.getItems().clear();
        bid.getItems().addAll(toBidItems(request.getItems(), bid));

        bidsRepo.save(bid);
    }

    // =====================================================
    // DELETE
    // =====================================================

    public void delete(Integer bidId) {
        ctx.requireVendor();
        bidsRepo.delete(getOwnedBid(bidId));
    }

    // =====================================================
    // INTERNAL
    // =====================================================

    private Bids getOwnedBid(Integer bidId) {
        Bids bid = bidsRepo.findById(bidId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Bid not found"));

        if (!bid.getVendor().getVendorId().equals(ctx.vendorId())) {
            throw new RuntimeException("Forbidden");
        }
        return bid;
    }

    private List<BidItems> toBidItems(List<BidItemDto> dtos, Bids bid) {

        List<BidItems> items = new ArrayList<>();

        for (BidItemDto dto : dtos) {
            BidItems item = new BidItems();
            item.setMedicineName(dto.getMedicineName());
            item.setItemQuantity(dto.getItemQuantity());
            item.setItemPrice(dto.getItemPrice());
            item.setBids(bid);
            items.add(item);
        }
        return items;
    }

    private BidDto toDto(Bids bid) {

        BidDto dto = new BidDto();
        dto.setBidId(bid.getBidId());
        dto.setRfqId(bid.getRfq().getRfqId());
        dto.setVendorId(bid.getVendor().getVendorId());
        dto.setVendorName(
                bid.getVendor().getUser() != null
                        ? bid.getVendor().getUser().getName()
                        : "Vendor"
        );
        dto.setStatus(bid.getStatus());

        dto.setItems(bid.getItems().stream().map(i -> {
            BidItemDto it = new BidItemDto();
            it.setMedicineName(i.getMedicineName());
            it.setItemQuantity(i.getItemQuantity());
            it.setItemPrice(i.getItemPrice());
            return it;
        }).toList());

        return dto;
    }
}
