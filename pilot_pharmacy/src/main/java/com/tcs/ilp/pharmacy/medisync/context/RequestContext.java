package com.tcs.ilp.pharmacy.medisync.context;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

@Component
@RequestScope
public class RequestContext {

    private Integer userId;
    private Integer storeId;
    private Integer vendorId;
    private String role;

    // getters
    public Integer userId() { return userId; }
    public Integer storeId() { return storeId; }
    public Integer vendorId() { return vendorId; }
    public String role() { return role; }

    // setters (package-private)
    void setUser(Integer userId, Integer storeId, String role) {
        this.userId = userId;
        this.storeId = storeId;
        this.role = role;
    }

    void setVendor(Integer vendorId) {
        this.vendorId = vendorId;
        this.role = "VENDOR";
    }

    // guards
    public void requireUser() {
        if (userId == null) {
            throw new RuntimeException("User authentication required");
        }
    }

    public void requireVendor() {
        if (vendorId == null) {
            throw new RuntimeException("Vendor authentication required");
        }
    }

    public void requireRole(String required) {
        if (!required.equals(role)) {
            throw new RuntimeException("Unauthorized");
        }
    }
}
