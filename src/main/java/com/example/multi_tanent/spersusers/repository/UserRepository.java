package com.example.multi_tanent.spersusers.repository;

import com.example.multi_tanent.spersusers.enitity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role AND u.isActive = true")
    java.util.List<User> findActiveUsersByRole(@org.springframework.data.repository.query.Param("role") com.example.multi_tanent.master.enums.Role role);
}
