package com.example.multi_tanent.tenant.base.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.tenant.base.entity.Designation;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
    List<Designation> findByDepartmentId(Long departmentId);
    Optional<Designation> findByJobBandId(Long jobBandId);
    Optional<Designation> findByDepartmentIdAndTitle(Long departmentId, String title);
}
