package com.tcs.ilp.pharmacy.medisync.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VendorRegisterRequest {

    @NotBlank @Size(max = 50)
    private String businessName;

    @NotBlank @Email @Size(max = 50)
    private String email;

    @Size(max = 15)
    private String phoneNumber;

    @NotBlank
    private String password;

    @NotBlank @Size(max = 20)
    private String gstNumber;

    @NotBlank @Size(max = 50)
    private String licenseNumber;

    @NotBlank @Size(max = 500)
    private String address;

    public VendorRegisterRequest() {}

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
