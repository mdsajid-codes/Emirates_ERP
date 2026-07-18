package com.example.multi_tanent.tenant.base.repository;

import com.example.multi_tanent.tenant.base.entity.TimeType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TimeTypeRepository extends JpaRepository<TimeType, Long> {
    Optional<TimeType> findByCode(String code);
    Optional<TimeType> findByName(String name);
}