package com.tcs.ilp.pharmacy.medisync.repository;

import com.tcs.ilp.pharmacy.medisync.entity.Users;
import com.tcs.ilp.pharmacy.medisync.entity.Vendor;
import com.tcs.ilp.pharmacy.medisync.entity.VendorDocuments;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Integer> {

    Optional<Vendor> findByUser_UserId(Integer userId);
    boolean existsByGstNumber(String gstNumber);

    boolean existsByLicenseNumber(String licenseNumber);
    boolean existsByUser_UserId(Integer userId);

    Optional< Vendor >findByEmail(String email);
}
