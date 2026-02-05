package com.tcs.ilp.pharmacy.medisync.controller;

import com.tcs.ilp.pharmacy.medisync.dto.*;
import com.tcs.ilp.pharmacy.medisync.service.AuthService;
import com.tcs.ilp.pharmacy.medisync.service.StoreService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final StoreService storeService;

    public AuthController(AuthService authService, StoreService storeService) {
        this.authService = authService;
        this.storeService = storeService;
    }

    // =====================================================
    // USER LOGIN (HO / MANAGER / PHARMACIST)
    // =====================================================
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUser(
            @RequestBody LoginRequest request,
            HttpSession session
    ) {
        LoginResponse response = authService.loginUser(request);

        session.setAttribute("USER_ID", response.getUserId());
        session.setAttribute("ROLE", response.getRole());

        // ---- resolve store ONLY for store-bound roles ----
        if ("MANAGER".equals(response.getRole())) {
            session.setAttribute(
                    "STORE_ID",
                    storeService.getStoreForManager(response.getUserId()).getStoreId()
            );
        }
        else if ("PHARMACIST".equals(response.getRole())) {
            session.setAttribute(
                    "STORE_ID",
                    storeService.getStoreForPharmacist(response.getUserId()).getStoreId()
            );
        }
        else {
            // HO or other roles
            session.setAttribute("STORE_ID", null);
        }

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // VENDOR LOGIN
    // =====================================================
    @PostMapping("/vendor/login")
    public ResponseEntity<VendorLoginResponse> loginVendor(
            @RequestBody VendorLoginRequest request,
            HttpSession session
    ) {
        VendorLoginResponse response = authService.loginVendor(request);

        session.setAttribute("VENDOR_ID", response.getVendorId());
        session.setAttribute("ROLE", "VENDOR");
        session.setAttribute("STORE_ID", null); // required for interceptor safety

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // LOGOUT
    // =====================================================
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpSession session) {
        session.invalidate();
    }
}
