package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.context.RequestContext;
import com.tcs.ilp.pharmacy.medisync.dto.StockRequestDto;
import com.tcs.ilp.pharmacy.medisync.dto.StockRequestItemDto;
import com.tcs.ilp.pharmacy.medisync.entity.StockRequests;
import com.tcs.ilp.pharmacy.medisync.entity.Users;
import com.tcs.ilp.pharmacy.medisync.exception.NotFoundException;
import com.tcs.ilp.pharmacy.medisync.repository.StockRequestsRepository;
import com.tcs.ilp.pharmacy.medisync.repository.UsersRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StockRequestService {

    private final RequestContext ctx;
    private final StockRequestsRepository stockRequestsRepository;
    private final UsersRepository usersRepository;

    public StockRequestService(
            RequestContext ctx,
            StockRequestsRepository stockRequestsRepository,
            UsersRepository usersRepository
    ) {
        this.ctx = ctx;
        this.stockRequestsRepository = stockRequestsRepository;
        this.usersRepository = usersRepository;
    }

    // =====================================================
    // READ
    // =====================================================

    @Transactional(readOnly = true)
    public List<StockRequestDto> findByStatus(String status) {
        ctx.requireRole("STORE_MANAGER");

        return stockRequestsRepository
                .findByStatusAndStore_StoreId(status, ctx.storeId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    // =====================================================
    // STATE CHANGES
    // =====================================================

    public StockRequestDto approve(Integer requestId) {
        ctx.requireRole("STORE_MANAGER");

        StockRequests request = findOwnedRequest(requestId);

        Users approver = usersRepository.findById(ctx.userId())
                .orElseThrow(() -> new NotFoundException("Approver not found"));

        request.setApprovedBy(approver);
        request.setStatus("APPROVED");

        return toDto(stockRequestsRepository.save(request));
    }

    public StockRequestDto reject(Integer requestId, String remarks) {
        ctx.requireRole("STORE_MANAGER");

        StockRequests request = findOwnedRequest(requestId);

        Users approver = usersRepository.findById(ctx.userId())
                .orElseThrow(() -> new NotFoundException("Approver not found"));

        request.setApprovedBy(approver);
        request.setStatus("REJECTED");
        request.setRemarks(remarks);

        return toDto(stockRequestsRepository.save(request));
    }

    public StockRequestDto fulfill(Integer requestId) {
        ctx.requireRole("STORE_MANAGER");

        StockRequests request = findOwnedRequest(requestId);
        request.setStatus("FULFILLED");

        return toDto(stockRequestsRepository.save(request));
    }

    // =====================================================
    // INTERNAL HELPERS
    // =====================================================

    private StockRequests findOwnedRequest(Integer requestId) {
        return stockRequestsRepository
                .findByStockRequestIdAndStore_StoreId(requestId, ctx.storeId())
                .orElseThrow(() ->
                        new NotFoundException("Stock request not found: " + requestId));
    }

    private StockRequestDto toDto(StockRequests request) {

        StockRequestDto dto = new StockRequestDto();
        dto.setStockRequestId(request.getStockRequestId());
        dto.setStoreId(request.getStore().getStoreId());
        dto.setRequestedByUserId(request.getRequestedBy().getUserId());
        dto.setApprovedByUserId(
                request.getApprovedBy() != null
                        ? request.getApprovedBy().getUserId()
                        : null
        );
        dto.setStatus(request.getStatus());
        dto.setRemarks(request.getRemarks());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());

        List<StockRequestItemDto> items = request.getItems().stream().map(i -> {
            StockRequestItemDto it = new StockRequestItemDto();
            it.setItemId(i.getStockRequestItemId());
            it.setMedicineName(i.getMedicineName());
            it.setRequiredQuantity(i.getRequiredQuantity());
            return it;
        }).toList();

        dto.setItems(items);
        return dto;
    }
}
