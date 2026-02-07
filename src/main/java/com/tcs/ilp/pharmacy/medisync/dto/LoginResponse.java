package com.tcs.ilp.pharmacy.medisync.dto;

public class LoginResponse {
    private int userId;
    private String name;
    private String role;

    public LoginResponse() {}

    public LoginResponse(int userId, String name, String role) {
        this.userId = userId;
        this.name = name;
        this.role = role;
    }

    public int getUserId() { return userId; }
    public String getName() { return name; }
    public String getRole() { return role; }

    public void setUserId(int userId) { this.userId = userId; }
    public void setName(String name) { this.name = name; }
    public void setRole(String role) { this.role = role; }
}
