package com.tcs.ilp.pharmacy.medisync.context;

import com.tcs.ilp.pharmacy.medisync.exception.ResourceNotFoundException;
import com.tcs.ilp.pharmacy.medisync.exception.UnauthorizedException;
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

    // setters (package-private; interceptor is in same package -> OK)
    void setUser(Integer userId, Integer storeId, String role) {
        this.userId = userId;
        this.storeId = storeId;
        this.vendorId = null;
        this.role = role;
    }

    void setVendor(Integer vendorId) {
        this.vendorId = vendorId;
        this.userId = null;
        this.storeId = null;
        this.role = "VENDOR";
    }

    // guards (use meaningful exception instead of RuntimeException)
    public void requireUser() {
        if (userId == null) {
            throw new UnauthorizedException("User authentication required");
        }
    }

    public void requireVendor() {
        if (vendorId == null) {
            throw new UnauthorizedException("Vendor authentication required");
        }
    }

    public void requireRole(String required) {
        if (role == null || !required.equals(role)) {
            throw new UnauthorizedException("Unauthorized");
        }
    }

    public  void requireStore(Integer storeId){
        if(storeId==null||!storeId.equals(storeId)) throw new ResourceNotFoundException("Inventory not initiated for this store");

    }
    public void requireRole(String role1, String role2){

        if (role == null || (!role1.equals(role) && !role2.equals(role))) {
            throw new UnauthorizedException("Unauthorized");
        }

    }
}
