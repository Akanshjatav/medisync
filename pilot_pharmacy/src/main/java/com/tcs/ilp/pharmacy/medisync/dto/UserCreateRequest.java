package com.tcs.ilp.pharmacy.medisync.dto;

public class UserCreateRequest {
    private String roleName;
    private Boolean isActive;      // optional; defaults true if null
    private String name;
    private String email;
    private String phoneNumber;    // optional
//    private String password;

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

//    public String getPassword() { return password; }
//    public void setPassword(String password) { this.password = password; }
}