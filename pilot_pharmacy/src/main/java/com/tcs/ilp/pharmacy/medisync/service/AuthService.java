package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.dto.*;
import com.tcs.ilp.pharmacy.medisync.entity.Users;
import com.tcs.ilp.pharmacy.medisync.entity.Vendor;
import com.tcs.ilp.pharmacy.medisync.exception.ValidationException;
import com.tcs.ilp.pharmacy.medisync.repository.UsersRepository;
import com.tcs.ilp.pharmacy.medisync.repository.VendorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UsersRepository usersRepository;
    private final VendorRepository vendorRepository;

    public AuthService(UsersRepository usersRepository,
                       VendorRepository vendorRepository) {
        this.usersRepository = usersRepository;
        this.vendorRepository = vendorRepository;
    }

    // ==========================
    // USER LOGIN
    // ==========================
    public LoginResponse loginUser(LoginRequest request) {

        if (request == null ||
                request.getEmail() == null || request.getEmail().isBlank() ||
                request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ValidationException("email and password are required");
        }

        Users user = usersRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!user.isActive() || !user.getPassword().equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return new LoginResponse(
                user.getUserId(),
                user.getName(),
                user.getRole().getRoleName()
        );
    }

    // ==========================
    // VENDOR LOGIN
    // ==========================
    public VendorLoginResponse loginVendor(VendorLoginRequest request) {

        if (request == null ||
                request.getEmail() == null || request.getEmail().isBlank() ||
                request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ValidationException("email and password are required");
        }

        Vendor vendor = vendorRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!vendor.getPassword().equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return new VendorLoginResponse(
                vendor.getVendorId(),
                vendor.getUser() != null ? vendor.getUser().getName() : "Vendor",
                vendor.getStatus()
        );
    }
}
