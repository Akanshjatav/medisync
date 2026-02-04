package com.tcs.ilp.pharmacy.medisync.controller;

import com.tcs.ilp.pharmacy.medisync.context.RequestContext;
import com.tcs.ilp.pharmacy.medisync.dto.*;
import com.tcs.ilp.pharmacy.medisync.entity.Inventory;
import com.tcs.ilp.pharmacy.medisync.entity.Stores;
import com.tcs.ilp.pharmacy.medisync.entity.Users;
import com.tcs.ilp.pharmacy.medisync.exception.ConflictException;
import com.tcs.ilp.pharmacy.medisync.exception.ValidationException;
import com.tcs.ilp.pharmacy.medisync.service.InventoryService;
import com.tcs.ilp.pharmacy.medisync.service.StoreService;
import com.tcs.ilp.pharmacy.medisync.service.UsersService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/ADMIN")
public class HeadOfficeController {

    private final RequestContext ctx;
    private final StoreService storeService;
    private final InventoryService inventoryService;
    private final UsersService usersService;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    public HeadOfficeController(
            RequestContext ctx,
            StoreService storeService,
            InventoryService inventoryService,
            UsersService usersService
    ) {
        this.ctx = ctx;
        this.storeService = storeService;
        this.inventoryService = inventoryService;
        this.usersService = usersService;
    }

    // =====================================================
    // BRANCHES
    // =====================================================

    @PostMapping("/register-branch")
    @Transactional
    public ResponseEntity<StoreCreateResponse> registerBranch(
            @Valid @RequestBody StoreCreateRequest request
    ) {
        ctx.requireRole("ADMIN");

        Stores exists = storeService.getStoreByStoreName(request.getBranchName());
        if (exists != null) {
            throw new ConflictException("Branch already exists");
        }

        Stores store = new Stores();
        store.setStoreName(request.getBranchName().trim());
        store.setLocation(request.getBranchLocation().trim());
        store.setAddress(request.getAddress().trim());

        Stores created = storeService.createStore(store);
        Inventory inventory = inventoryService.createInventory(created.getStoreId());

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getStoreId())
                .toUri();

        return ResponseEntity.created(location)
                .body(new StoreCreateResponse(
                        created.getStoreId(),
                        inventory.getInventoryId(),
                        created.getStoreName(),
                        created.getLocation(),
                        created.getAddress()
                ));
    }

    @GetMapping("/branches")
    public List<StoreResponse> getAllBranches() {
        ctx.requireRole("ADMIN");

        return storeService.getAllStores()
                .stream()
                .map(s -> new StoreResponse(
                        s.getStoreId(),
                        s.getStoreName(),
                        s.getLocation(),
                        s.getAddress(),
                        s.getCreatedAt(),
                        s.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/branches/{storeId}/inventory")
    public BranchInventoryResponse getBranchInventory(@PathVariable int storeId) {
        ctx.requireRole("ADMIN");
        return inventoryService.getBranchInventoryDetails(storeId);
    }

    // =====================================================
    // USERS
    // =====================================================

    @PostMapping("/users")
    public UserResponse createUser(@RequestBody UserCreateRequest request) {
        ctx.requireRole("ADMIN");
        return toUserResponse(usersService.createUser(request));
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        ctx.requireRole("ADMIN");
        return usersService.getAllUsers()
                .stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @PutMapping("/users/{id}")
    public UserResponse updateUser(
            @PathVariable int id,
            @RequestBody UserUpdateRequest request
    ) {
        ctx.requireRole("ADMIN");
        return toUserResponse(usersService.updateUser(id, request));
    }

    @PatchMapping("/users/{id}/deactivate")
    public void deactivateUser(@PathVariable int id) {
        ctx.requireRole("ADMIN");
        usersService.deactivateUser(id);
    }

    private UserResponse toUserResponse(Users u) {
        return new UserResponse(
                u.getUserId(),
                u.getRole().getRoleName(),
                u.isActive(),
                u.getName(),
                u.getEmail(),
                u.getPhoneNumber(),
                u.getCreatedAt(),
                u.getUpdatedAt()
        );
    }
}
