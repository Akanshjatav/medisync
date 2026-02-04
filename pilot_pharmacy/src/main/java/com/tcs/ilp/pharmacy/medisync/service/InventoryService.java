package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.dto.BatchResponse;
import com.tcs.ilp.pharmacy.medisync.dto.BranchInventoryResponse;
import com.tcs.ilp.pharmacy.medisync.dto.ProductResponse;
import com.tcs.ilp.pharmacy.medisync.entity.Batch;
import com.tcs.ilp.pharmacy.medisync.entity.Inventory;
import com.tcs.ilp.pharmacy.medisync.entity.Product;
import com.tcs.ilp.pharmacy.medisync.entity.Stores;
import com.tcs.ilp.pharmacy.medisync.exception.ConflictException;
import com.tcs.ilp.pharmacy.medisync.exception.NotFoundException;
import com.tcs.ilp.pharmacy.medisync.repository.BatchRepository;
import com.tcs.ilp.pharmacy.medisync.repository.InventoryRepository;
import com.tcs.ilp.pharmacy.medisync.repository.StoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final BatchRepository batchRepository;
    private final StoreRepository storeRepository;

    public InventoryService(InventoryRepository inventoryRepository,
                            BatchRepository batchRepository,
                            StoreRepository storeRepository) {
        this.inventoryRepository = inventoryRepository;
        this.batchRepository = batchRepository;
        this.storeRepository = storeRepository;
    }

    // =====================================================
    // READ INVENTORY (SAFE: NO MULTIPLE BAG FETCH)
    // =====================================================
    @Transactional(readOnly = true)
    public BranchInventoryResponse getBranchInventoryDetails(int storeId) {

        // Query 1: inventory + store + batches
        Inventory inventory = inventoryRepository
                .findWithBatchesByStore_StoreId(storeId)
                .orElseThrow(() ->
                        new NotFoundException("Inventory not found for storeId: " + storeId));

        Stores store = inventory.getStore();

        // Query 2: batches + products
        List<Batch> batches =
                batchRepository.findByInventory_InventoryId(inventory.getInventoryId());

        BranchInventoryResponse resp = new BranchInventoryResponse();
        resp.setStoreId(store.getStoreId());
        resp.setStoreName(store.getStoreName());
        resp.setInventoryId(inventory.getInventoryId());

        List<BatchResponse> batchResponses = new ArrayList<>();

        for (Batch batch : batches) {
            BatchResponse br = new BatchResponse();
            br.setBatchId(batch.getBatchId());

            List<ProductResponse> productResponses = new ArrayList<>();
            for (Product p : batch.getProducts()) {
                productResponses.add(new ProductResponse(
                        p.getProductId(),
                        p.getProductName(),
                        p.getCategory(),
                        p.getQuantityTotal(),
                        p.getPrice(),
                        p.getExpiryDate(),
                        batch.getBatchId()
                ));
            }

            br.setProducts(productResponses);
            batchResponses.add(br);
        }

        resp.setBatches(batchResponses);
        return resp;
    }

    // =====================================================
    // CREATE INVENTORY
    // =====================================================
    public Inventory createInventory(Integer storeId) {

        Stores store = storeRepository.findById(storeId)
                .orElseThrow(() ->
                        new NotFoundException("Store not found: " + storeId));

        if (inventoryRepository.existsByStore_StoreId(storeId)) {
            throw new ConflictException("Inventory already exists for store");
        }

        Inventory inventory = new Inventory();
        inventory.setStore(store);
        return inventoryRepository.save(inventory);
    }

    // =====================================================
    // BASIC CRUD
    // =====================================================
    @Transactional(readOnly = true)
    public Inventory getInventory(int inventoryId) {
        return inventoryRepository.findById(inventoryId)
                .orElseThrow(() ->
                        new NotFoundException("Inventory not found: " + inventoryId));
    }

    public void deleteInventory(int inventoryId) {
        inventoryRepository.delete(getInventory(inventoryId));
    }
}
