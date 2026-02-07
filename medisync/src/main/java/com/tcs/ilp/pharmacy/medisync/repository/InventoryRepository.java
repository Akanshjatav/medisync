package com.tcs.ilp.pharmacy.medisync.repository;

import com.tcs.ilp.pharmacy.medisync.entity.Inventory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Integer> {

    Optional<Inventory> findByStore_StoreId(Integer storeId);
    boolean existsByStore_StoreId(Integer storeId);


    @EntityGraph(attributePaths = {"store", "batches"})
    Optional<Inventory> findWithBatchesByStore_StoreId(Integer storeId);
}
