package com.tcs.ilp.pharmacy.medisync.repository;

import com.tcs.ilp.pharmacy.medisync.entity.StockTransfers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StockTransfersRepository extends JpaRepository<StockTransfers, Integer> {

    List<StockTransfers> findByFromStore_StoreId(Integer storeId);

    List<StockTransfers> findByToStore_StoreId(Integer storeId);

    List<StockTransfers> findByStatus(String status);

    @Query("""
        select st from StockTransfers st
        left join fetch st.items
        where st.stockTransferId = :id
    """)
    Optional<StockTransfers> findWithItemsById(Integer id);
}
