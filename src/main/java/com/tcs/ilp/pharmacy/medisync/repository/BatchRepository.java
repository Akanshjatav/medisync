package com.tcs.ilp.pharmacy.medisync.repository;

import com.tcs.ilp.pharmacy.medisync.entity.Batch;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BatchRepository extends JpaRepository<Batch, Integer> {

    List<Batch> findByVendor_VendorId(Integer vendorId);

    Optional<Batch> findByBatchCodeAndVendor_VendorId(String batchCode, Integer vendorId);

    @EntityGraph(attributePaths = {"products"})
    List<Batch> findByInventory_InventoryId(Integer inventoryId);
}
