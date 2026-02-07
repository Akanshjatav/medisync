// File: src/main/java/com/tcs/ilp/pharmacy/medisync/repository/VendorDocumentsRepository.java
package com.tcs.ilp.pharmacy.medisync.repository;

import com.tcs.ilp.pharmacy.medisync.entity.VendorDocuments;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorDocumentsRepository extends JpaRepository<VendorDocuments, Integer> {
    List<VendorDocuments> findByVendor_VendorId(Integer vendorId);
}