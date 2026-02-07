package com.tcs.ilp.pharmacy.medisync.dto;

public class LoginRequest {
    private String email;
    private String password;

    public LoginRequest() {}

    public String getEmail() { return email; }
    public String getPassword() { return password; }

    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
}
