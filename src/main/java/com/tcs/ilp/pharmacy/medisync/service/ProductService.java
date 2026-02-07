package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.entity.Batch;
import com.tcs.ilp.pharmacy.medisync.entity.Product;
import com.tcs.ilp.pharmacy.medisync.exception.InvalidBatchReferenceException;
import com.tcs.ilp.pharmacy.medisync.exception.NotFoundException;
import com.tcs.ilp.pharmacy.medisync.repository.BatchRepository;
import com.tcs.ilp.pharmacy.medisync.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final BatchRepository batchRepository;

    public ProductService(ProductRepository productRepository,
                          BatchRepository batchRepository) {
        this.productRepository = productRepository;
        this.batchRepository = batchRepository;
    }

    public Product create(Product product) {
        Integer batchId = product.getBatch().getBatchId();

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() ->
                        new InvalidBatchReferenceException("Invalid batchId: " + batchId));

        product.setBatch(batch);
        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public Product getProduct(int productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productId));
    }

    public Product update(int productId, Product updated) {
        Product existing = getProduct(productId);
        updated.setProductId(existing.getProductId());
        return productRepository.save(updated);
    }

    public void dispenseProduct(Integer productId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found: " + productId));

        if (product.getQuantityTotal() < quantity) {
            throw new IllegalStateException("Insufficient stock");
        }

        product.setQuantityTotal(product.getQuantityTotal() - quantity);
        productRepository.save(product);
    }


    public void delete(int productId) {
        productRepository.delete(getProduct(productId));
    }
}
