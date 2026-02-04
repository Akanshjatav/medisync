package com.tcs.ilp.pharmacy.medisync.controller;

import com.tcs.ilp.pharmacy.medisync.context.RequestContext;
import com.tcs.ilp.pharmacy.medisync.dto.*;
import com.tcs.ilp.pharmacy.medisync.entity.Batch;
import com.tcs.ilp.pharmacy.medisync.entity.Product;
import com.tcs.ilp.pharmacy.medisync.service.BatchService;
import com.tcs.ilp.pharmacy.medisync.service.InventoryService;
import com.tcs.ilp.pharmacy.medisync.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ph")
public class PharmacistController {

    private final RequestContext ctx;
    private final InventoryService inventoryService;
    private final BatchService batchService;
    private final ProductService productService;

    public PharmacistController(
            RequestContext ctx,
            InventoryService inventoryService,
            BatchService batchService,
            ProductService productService
    ) {
        this.ctx = ctx;
        this.inventoryService = inventoryService;
        this.batchService = batchService;
        this.productService = productService;
    }

    // =====================================================
    // INVENTORY
    // =====================================================

    @GetMapping("/inventory")
    public BranchInventoryResponse viewInventory() {
        ctx.requireRole("PHARMACIST");
        return inventoryService.getBranchInventoryDetails(ctx.storeId());
    }

    // =====================================================
    // BATCH
    // =====================================================

    @PostMapping("/batches")
    @ResponseStatus(HttpStatus.CREATED)
    public BatchResponse createBatch(
            @RequestBody BatchCreateRequest request
    ) {
        ctx.requireRole("PHARMACIST");

        Batch batch = batchService.createBatchWithProducts(request);

        BatchResponse response = new BatchResponse();
        response.setBatchId(batch.getBatchId());

        for (Product p : batch.getProducts()) {
            response.getProducts().add(
                    new ProductResponse(
                            p.getProductId(),
                            p.getProductName(),
                            p.getCategory(),
                            p.getQuantityTotal(),
                            p.getPrice(),
                            p.getExpiryDate(),
                            batch.getBatchId()
                    )
            );
        }

        return response;
    }

    // =====================================================
    // DISPENSE
    // =====================================================

    @PostMapping("/products/{productId}/dispense")
    public ResponseEntity<String> dispense(
            @PathVariable Integer productId,
            @RequestParam Integer quantity
    ) {
        ctx.requireRole("PHARMACIST");
        productService.dispenseProduct(productId, quantity);
        return ResponseEntity.ok("Dispensed successfully");
    }
}
