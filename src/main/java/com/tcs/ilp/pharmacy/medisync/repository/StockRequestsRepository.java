package com.tcs.ilp.pharmacy.medisync.repository;

import com.tcs.ilp.pharmacy.medisync.entity.StockRequests;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StockRequestsRepository extends JpaRepository<StockRequests, Integer> {

    List<StockRequests> findByStore_StoreId(Integer storeId);

    List<StockRequests> findByStatus(String status);

    @Query("""
        select sr from StockRequests sr
        left join fetch sr.items
        where sr.stockRequestId = :id
    """)
    Optional<StockRequests> findWithItemsById(Integer id);

    List<StockRequests> findByStatusAndStore_StoreId(String status, Integer storeId);

   Optional<StockRequests> findByStockRequestIdAndStore_StoreId(Integer requestId,
                                                                Integer storeId);
}
