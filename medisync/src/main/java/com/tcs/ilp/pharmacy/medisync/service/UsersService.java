package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.dto.UserCreateRequest;
import com.tcs.ilp.pharmacy.medisync.dto.UserUpdateRequest;
import com.tcs.ilp.pharmacy.medisync.entity.Role;
import com.tcs.ilp.pharmacy.medisync.entity.Users;
import com.tcs.ilp.pharmacy.medisync.exception.ResourceNotFoundException;
import com.tcs.ilp.pharmacy.medisync.exception.ValidationException;
import com.tcs.ilp.pharmacy.medisync.repository.RoleRepository;
import com.tcs.ilp.pharmacy.medisync.repository.UsersRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UsersService {

    private final UsersRepository usersRepository;
    private final RoleRepository roleRepository;

    public UsersService(UsersRepository usersRepository, RoleRepository roleRepository) {
        this.usersRepository = usersRepository;
        this.roleRepository = roleRepository;
    }

    public Users createUser(UserCreateRequest request) {
        Role role = roleRepository.findByRoleName(request.getRoleName().trim())
                .orElseThrow(() -> new ValidationException("Invalid roleName: " + request.getRoleName()));

        Users user = new Users();
        user.setRole(role);
        user.setActive(request.getIsActive() == null ? true : request.getIsActive());
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim());
        user.setPhoneNumber(cleanOptional(request.getPhoneNumber()));

        // username rule you currently use
        user.setUsername(request.getName().substring(0, 3) + request.getRoleName());

        // NOTE: You should hash password later using PasswordEncoder
        user.setPassword(request.getRoleName() + "@123");

        return usersRepository.save(user);
    }

    public Users updateUser(int userId, UserUpdateRequest request) {
        Users existing = getUser(userId);

        Role role = roleRepository.findByRoleName(request.getRoleName().trim())
                .orElseThrow(() -> new ValidationException("Invalid roleName: " + request.getRoleName()));

        existing.setRole(role);

        if (request.getIsActive() != null) {
            existing.setActive(request.getIsActive());
        }

        existing.setName(request.getName().trim());
        existing.setEmail(request.getEmail().trim());
        existing.setPhoneNumber(cleanOptional(request.getPhoneNumber()));

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            // NOTE: hash later using PasswordEncoder
            existing.setPassword(request.getPassword());
        }

        return usersRepository.save(existing);
    }

    @Transactional(readOnly = true)
    public Users getUser(int userId) {
        return usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    @Transactional(readOnly = true)
    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }

    public void removeUser(int userId) {
        Users user = getUser(userId);
        usersRepository.delete(user);
    }

    public void deactivateUser(int userId) {
        Users user = getUser(userId);
        user.setActive(false);
        usersRepository.save(user);
    }

    // =====================================================
    // ✅ NEW METHODS: Unallocated MANAGERS / PHARMACISTS
    // =====================================================

    /**
     * Returns users with role MANAGER who are not assigned as manager of any store.
     * Requires repository method: findUnallocatedManagers()
     */
    @Transactional(readOnly = true)
    public List<Users> getUnallocatedManagers() {
        return usersRepository.findUnallocatedManagers();
    }

    /**
     * Returns users with role PHARMACIST who are not assigned as pharmacist of any store.
     * Requires repository method: findUnallocatedPharmacists()
     */
    @Transactional(readOnly = true)
    public List<Users> getUnallocatedPharmacists() {
        return usersRepository.findUnallocatedPharmacists();
    }

    private String cleanOptional(String value) {
        if (value == null) return null;
        String v = value.trim();
        return v.isEmpty() ? null : v;
    }
}