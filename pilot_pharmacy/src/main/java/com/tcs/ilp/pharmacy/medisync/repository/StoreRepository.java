
package com.tcs.ilp.pharmacy.medisync.repository;

import com.tcs.ilp.pharmacy.medisync.entity.Stores;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Stores, Integer> {

    Stores findByStoreName(String storeName);
    List<Stores> findByLocationContainingIgnoreCase(String query);

    List<Stores> findByLocation(String location);

    Optional<Stores> findByManager_UserId(Integer userId);

    Optional<Stores> findByPharmacist_UserId(Integer userId);
}
