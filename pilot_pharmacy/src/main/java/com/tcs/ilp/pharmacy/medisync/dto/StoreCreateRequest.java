package com.tcs.ilp.pharmacy.medisync.dto;
import jakarta.validation.constraints.NotNull;


public class StoreCreateRequest {

    @NotNull(message = "Branch name is required")
    private String branchName;

    @NotNull(message = "Branch name is required")
    private String branchLocation;



    @NotNull(message = "Branch name is required")
    private String address;

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

    public StoreCreateRequest(String branchName, String branchLocation, String address) {
        this.branchName = branchName;
        this.branchLocation = branchLocation;
        this.address = address;
    }
}
