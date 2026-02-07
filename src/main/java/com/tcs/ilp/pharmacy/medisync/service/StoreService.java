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

    public Stores createStore(Stores store) {
        return storeRepository.save(store);
    }


    @Transactional(readOnly = true)
    public Stores getStoreById(int id) {
        return storeRepository.findById(id)
                .orElseThrow(() ->
                        new StoreNotFoundException("Store not found: " + id));
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





    // ✅ BRANCH UPDATE + STAFF ASSIGNMENT
    public Stores updateBranch(int storeId, StoreUpdateRequest r) {

        Stores store = getStoreById(storeId);

        if (r.hasBranchUpdates()) {
            r.validateForBranchUpdate();

            if (r.getBranchName() != null)
                store.setStoreName(r.getBranchName().trim());

            if (r.getBranchLocation() != null)
                store.setLocation(r.getBranchLocation().trim());

            if (r.getAddress() != null)
                store.setAddress(r.getAddress().trim());
        }

        if (r.hasStaffUpdates()) {

            if (r.getManagerUserId() != null) {
                Users manager = usersRepository.findById(r.getManagerUserId())
                        .orElseThrow(() ->
                                new ValidationException("Manager not found: "
                                        + r.getManagerUserId()));
                store.setManager(manager);
            }

            if (r.getPharmacistUserId() != null) {
                Users pharmacist = usersRepository.findById(r.getPharmacistUserId())
                        .orElseThrow(() ->
                                new ValidationException("Pharmacist not found: "
                                        + r.getPharmacistUserId()));
                store.setPharmacist(pharmacist);
            }
        }

        return storeRepository.save(store);
    }

    public void deleteStore(int id) {
        storeRepository.delete(getStoreById(id));
    }
}
