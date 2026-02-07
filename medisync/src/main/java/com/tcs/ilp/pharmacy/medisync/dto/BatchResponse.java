package com.tcs.ilp.pharmacy.medisync.dto;

import java.util.ArrayList;
import java.util.List;

public class BatchResponse {

    private Integer batchId;
    private List<ProductResponse> products = new ArrayList<>();

    public BatchResponse() {}

    public Integer getBatchId() { return batchId; }
    public void setBatchId(Integer batchId) { this.batchId = batchId; }

    public List<ProductResponse> getProducts() { return products; }
    public void setProducts(List<ProductResponse> products) {
        this.products = (products == null) ? new ArrayList<>() : products;
    }
}