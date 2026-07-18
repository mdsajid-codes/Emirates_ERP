package com.example.multi_tanent.tenant.base.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.tenant.base.entity.JobBand;

public interface JobBandRepository extends JpaRepository<JobBand, Long> {
    Optional<JobBand> findByDesignationId(Long designationId);
    Optional<JobBand> findByName(String name);
}
