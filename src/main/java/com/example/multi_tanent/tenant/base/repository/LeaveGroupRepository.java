package com.example.multi_tanent.tenant.base.repository;

import com.example.multi_tanent.tenant.base.entity.LeaveGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LeaveGroupRepository extends JpaRepository<LeaveGroup, Long> {
    Optional<LeaveGroup> findByCode(String code);
    Optional<LeaveGroup> findByName(String name);
}