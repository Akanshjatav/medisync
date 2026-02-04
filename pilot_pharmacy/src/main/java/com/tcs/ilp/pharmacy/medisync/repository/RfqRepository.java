
package com.tcs.ilp.pharmacy.medisync.repository;

import com.tcs.ilp.pharmacy.medisync.entity.Rfq;
import com.tcs.ilp.pharmacy.medisync.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RfqRepository extends JpaRepository<Rfq, Integer> {

    List<Rfq> findByStore_StoreId(Integer storeId);

    List<Rfq> findByStatus(String status);
    List<Rfq> findByCreatedBy_UserId(Integer userId);
    @Query("""
    select distinct r.awardedVendor
    from Rfq r
    where r.store.storeId = :storeId
      and r.awardedVendor is not null
""")
    List<Vendor> findAwardedVendorsByStore(Integer storeId);
    List<Rfq> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}
