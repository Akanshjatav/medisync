package com.tcs.ilp.pharmacy.medisync.dto;

import jakarta.validation.constraints.Size;

/**
 * DTO for updating a Store (Branch).
 *
 * All fields are optional by design so you can:
 *  - Update branch details (name/location/address)
 *  - Assign manager/pharmacist later
 *
 * Controller/Service should decide which validation to enforce per endpoint.
 */
public class StoreUpdateRequest {

    // Branch fields (optional)
    @Size(min = 2, max = 50, message = "Branch name must be between 2 and 50 characters")
    private String branchName;

    @Size(min = 2, max = 255, message = "Branch location must be between 2 and 255 characters")
    private String branchLocation;

    @Size(min = 5, max = 500, message = "Address must be between 5 and 500 characters")
    private String address;

    // Staff assignment fields (optional)
    private Integer managerUserId;
    private Integer pharmacistUserId;

    public StoreUpdateRequest() {}

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getBranchLocation() {
        return branchLocation;
    }

    public void setBranchLocation(String branchLocation) {
        this.branchLocation = branchLocation;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getManagerUserId() {
        return managerUserId;
    }

    public void setManagerUserId(Integer managerUserId) {
        this.managerUserId = managerUserId;
    }

    public Integer getPharmacistUserId() {
        return pharmacistUserId;
    }

    public void setPharmacistUserId(Integer pharmacistUserId) {
        this.pharmacistUserId = pharmacistUserId;
    }

    // -------------------------
    // Helper methods (optional)
    // -------------------------

    /** True if any branch metadata is being updated */
    public boolean hasBranchUpdates() {
        return notBlank(branchName) || notBlank(branchLocation) || notBlank(address);
    }

    /** True if staff assignment fields are being updated */
    public boolean hasStaffUpdates() {
        return managerUserId != null || pharmacistUserId != null;
    }

    /**
     * Use this when the endpoint is specifically "assign staff".
     * Enforces both ids to be present.
     */
    public void validateForStaffAssignment() {
        if (managerUserId == null) {
            throw new IllegalArgumentException("managerUserId is required");
        }
        if (pharmacistUserId == null) {
            throw new IllegalArgumentException("pharmacistUserId is required");
        }
    }

    /**
     * Use this when updating branch metadata.
     * Enforces no blank strings if provided.
     */
    public void validateForBranchUpdate() {
        if (branchName != null && branchName.isBlank()) {
            throw new IllegalArgumentException("branchName cannot be blank");
        }
        if (branchLocation != null && branchLocation.isBlank()) {
            throw new IllegalArgumentException("branchLocation cannot be blank");
        }
        if (address != null && address.isBlank()) {
            throw new IllegalArgumentException("address cannot be blank");
        }
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
