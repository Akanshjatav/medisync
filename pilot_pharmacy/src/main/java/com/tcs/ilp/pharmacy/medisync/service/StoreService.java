package com.tcs.ilp.pharmacy.medisync.service;

import com.tcs.ilp.pharmacy.medisync.dto.StoreUpdateRequest;
import com.tcs.ilp.pharmacy.medisync.entity.Stores;
import com.tcs.ilp.pharmacy.medisync.entity.Users;
import com.tcs.ilp.pharmacy.medisync.exception.NotFoundException;
import com.tcs.ilp.pharmacy.medisync.exception.StoreNotFoundException;
import com.tcs.ilp.pharmacy.medisync.exception.ValidationException;
import com.tcs.ilp.pharmacy.medisync.repository.StoreRepository;
import com.tcs.ilp.pharmacy.medisync.repository.UsersRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class StoreService {

    private final StoreRepository storeRepository;
    private final UsersRepository usersRepository;

    public StoreService(StoreRepository storeRepository,
            UsersRepository usersRepository) {
        this.storeRepository = storeRepository;
        this.usersRepository = usersRepository;
    }

    // =====================================================
    // CREATE STORE
    // =====================================================
    public Stores createStore(Stores store) {
        return storeRepository.save(store);
    }

    // =====================================================
    // GET STORE METHODS
    // =====================================================
    @Transactional(readOnly = true)
    public Stores getStoreById(int id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new StoreNotFoundException("Store not found: " + id));
    }

    @Transactional(readOnly = true)
    public Stores getStoreByStoreName(String name) {
        return storeRepository.findByStoreName(name);
    }

    @Transactional(readOnly = true)
    public List<Stores> getAllStores() {
        return storeRepository.findAll();
    }

    public Stores getStoreForManager(Integer userId) {
        return storeRepository
                .findByManager_UserId(userId)
                .orElseThrow(() -> new NotFoundException("Store not assigned"));
    }

    public Stores getStoreForPharmacist(Integer userId) {
        return storeRepository
                .findByPharmacist_UserId(userId)
                .orElseThrow(() -> new NotFoundException("Store not assigned"));
    }

    // =====================================================
    // UPDATE BRANCH + STAFF ASSIGNMENT
    // =====================================================
    public Stores updateBranch(int storeId, StoreUpdateRequest r) {

        Stores store = getStoreById(storeId);

        // ===== BRANCH BASIC DETAILS UPDATE =====
        if (r.hasBranchUpdates()) {
            r.validateForBranchUpdate();

            if (r.getBranchName() != null)
                store.setStoreName(r.getBranchName().trim());

            if (r.getBranchLocation() != null)
                store.setLocation(r.getBranchLocation().trim());

            if (r.getAddress() != null)
                store.setAddress(r.getAddress().trim());
        }

        // ===== STAFF ASSIGNMENT =====
        if (r.hasStaffUpdates()) {

            // Prevent same user assigned as both manager & pharmacist
            if (r.getManagerUserId() != null &&
                    r.getManagerUserId().equals(r.getPharmacistUserId())) {

                throw new ValidationException(
                        "Same user cannot be both Manager and Pharmacist.");
            }

            // ===== MANAGER ASSIGNMENT =====
            if (r.getManagerUserId() != null) {

                if (store.getManager() != null) {
                    throw new ValidationException(
                            "Manager already assigned to this branch. Reassignment not allowed.");
                }

                Users manager = usersRepository.findById(r.getManagerUserId())
                        .orElseThrow(() -> new ValidationException("Manager not found: "
                                + r.getManagerUserId()));

                store.setManager(manager);
            }

            // ===== PHARMACIST ASSIGNMENT =====
            if (r.getPharmacistUserId() != null) {

                if (store.getPharmacist() != null) {
                    throw new ValidationException(
                            "Pharmacist already assigned to this branch. Reassignment not allowed.");
                }

                Users pharmacist = usersRepository.findById(r.getPharmacistUserId())
                        .orElseThrow(() -> new ValidationException("Pharmacist not found: "
                                + r.getPharmacistUserId()));

                store.setPharmacist(pharmacist);
            }
        }

        return storeRepository.save(store);
    }

    // =====================================================
    // DELETE STORE
    // =====================================================
    public void deleteStore(int id) {
        storeRepository.delete(getStoreById(id));
    }
}
