
package com.tcs.ilp.pharmacy.medisync.repository;

import com.tcs.ilp.pharmacy.medisync.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {


    List<Product> findByBatch_BatchId(Integer batchId);

//    List<Product> findByVendor_VendorId(Integer vendorId);
}
