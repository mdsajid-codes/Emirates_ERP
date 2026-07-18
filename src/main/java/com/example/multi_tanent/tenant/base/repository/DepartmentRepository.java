package com.example.multi_tanent.tenant.base.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.tenant.base.entity.Department;


public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    Optional<Department> findByCode(String code);

    @Override
    @EntityGraph(attributePaths = "designations")
    List<Department> findAll();

    @Override
    @EntityGraph(attributePaths = "designations")
    Optional<Department> findById(Long id);
}
