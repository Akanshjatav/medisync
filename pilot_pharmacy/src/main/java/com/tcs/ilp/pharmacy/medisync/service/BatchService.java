package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.dto.BatchCreateRequest;
import com.tcs.ilp.pharmacy.medisync.dto.ProductCreateRequest;
import com.tcs.ilp.pharmacy.medisync.entity.Batch;
import com.tcs.ilp.pharmacy.medisync.entity.Product;
import com.tcs.ilp.pharmacy.medisync.entity.Vendor;
import com.tcs.ilp.pharmacy.medisync.exception.NotFoundException;
import com.tcs.ilp.pharmacy.medisync.repository.BatchRepository;
import com.tcs.ilp.pharmacy.medisync.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class BatchService {

    private final BatchRepository batchRepository;
    private final VendorRepository vendorRepository;

    public BatchService(BatchRepository batchRepository,
                        VendorRepository vendorRepository) {
        this.batchRepository = batchRepository;
        this.vendorRepository = vendorRepository;
    }

    public Batch addBatch(Batch batch) {
        if (batch == null || batch.getVendor() == null) {
            throw new IllegalArgumentException("Batch and vendor are required");
        }

        Integer vendorId = batch.getVendor().getVendorId();

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found: " + vendorId));

        batch.setVendor(vendor);
        return batchRepository.save(batch);
    }

    public Batch createBatchWithProducts(BatchCreateRequest request) {
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new NotFoundException("Vendor not found"));

        Batch batch = new Batch();
        batch.setVendor(vendor);
        batch.setDeliveryDate(request.getDeliveryDate());

        for (ProductCreateRequest pReq : request.getProducts()) {
            Product p = new Product();
            p.setProductName(pReq.getProductName());
            p.setCategory(pReq.getCategory());
            p.setQuantityTotal(pReq.getQuantityTotal());
            p.setPrice(pReq.getPrice());
            p.setExpiryDate(pReq.getExpiryDate());
            p.setBatch(batch);
            batch.getProducts().add(p);
        }

        return batchRepository.save(batch);
    }


    @Transactional(readOnly = true)
    public Batch getBatch(int batchId) {
        return batchRepository.findById(batchId)
                .orElseThrow(() -> new NotFoundException("Batch not found: " + batchId));
    }

    @Transactional(readOnly = true)
    public List<Batch> getByVendor(int vendorId) {
        return batchRepository.findByVendor_VendorId(vendorId);
    }

    public void deleteBatch(int batchId) {
        if (!batchRepository.existsById(batchId)) {
            throw new NotFoundException("Batch not found: " + batchId);
        }
        batchRepository.deleteById(batchId);
    }
}
