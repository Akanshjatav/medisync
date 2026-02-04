package com.tcs.ilp.pharmacy.medisync.dto;

import java.time.LocalDate;

public class ProductResponse {
    private Integer productId;
    private String productName;
    private String category;
    private Integer quantityTotal;
    private Double price;
    private LocalDate expiryDate;
    private Integer batchId;

    public ProductResponse() {}

    public ProductResponse(Integer productId, String productName, String category,
                           Integer quantityTotal, Double price, LocalDate expiryDate, Integer batchId) {
        this.productId = productId;
        this.productName = productName;
        this.category = category;
        this.quantityTotal = quantityTotal;
        this.price = price;
        this.expiryDate = expiryDate;
        this.batchId = batchId;
    }

    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getQuantityTotal() { return quantityTotal; }
    public void setQuantityTotal(Integer quantityTotal) { this.quantityTotal = quantityTotal; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public Integer getBatchId() { return batchId; }
    public void setBatchId(Integer batchId) { this.batchId = batchId; }
}
