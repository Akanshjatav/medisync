package com.tcs.ilp.pharmacy.medisync.repository;

import com.tcs.ilp.pharmacy.medisync.entity.Users;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {

    Optional<Users> findByUsername(String username);
    Optional<Users> findByEmail(String email);

    // 1) Users NOT assigned as a Manager to any store
    @Query("""
    select u
    from Users u
    where u.role.roleName = 'MANAGER'
      and not exists (
          select 1 from Stores s
          where s.manager = u
      )
""")
    List<Users> findUnallocatedManagers();

    @Query("""
    select u
    from Users u
    where u.role.roleName = 'PHARMACIST'
      and not exists (
          select 1 from Stores s
          where s.pharmacist = u
      )
""")
    List<Users> findUnallocatedPharmacists();

    boolean existsByUsername(String username);
}
