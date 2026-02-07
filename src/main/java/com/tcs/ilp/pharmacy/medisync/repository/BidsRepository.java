package com.tcs.ilp.pharmacy.medisync.repository;


import com.tcs.ilp.pharmacy.medisync.entity.Bids;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidsRepository extends JpaRepository<Bids, Integer> {

    List<Bids> findByRfq_RfqId(Integer rfqId);

    List<Bids> findByVendor_VendorId(Integer vendorId);

    List<Bids> findByRfq_Store_StoreId(Integer storeId);

    List<Bids> findByStatus(String status);



}
