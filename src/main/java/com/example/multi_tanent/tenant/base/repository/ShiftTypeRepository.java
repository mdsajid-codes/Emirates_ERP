package com.example.multi_tanent.tenant.base.repository;

import com.example.multi_tanent.tenant.base.entity.ShiftType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShiftTypeRepository extends JpaRepository<ShiftType, Long> {
    Optional<ShiftType> findByCode(String code);
    Optional<ShiftType> findByName(String name);
}