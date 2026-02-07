package com.tcs.ilp.pharmacy.medisync.dto;

import java.time.LocalDate;
import java.util.List;

public class BatchCreateRequest {

    private Integer vendorId;
    private LocalDate deliveryDate;
    private List<ProductCreateRequest> products;


    public Integer getVendorId() { return vendorId; }
    public void setVendorId(Integer vendorId) { this.vendorId = vendorId; }

    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }

    public List<ProductCreateRequest> getProducts() { return products; }
    public void setProducts(List<ProductCreateRequest> products) { this.products = products; }
}
