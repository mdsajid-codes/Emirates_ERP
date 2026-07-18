package com.example.multi_tanent.crm.repository;




import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.crm.entity.CrmPermission;

import java.util.List;

public interface CrmPermissionRepository extends JpaRepository<CrmPermission, Long> {
    List<CrmPermission> findAllByOrderByCodeAsc();

    boolean existsByCodeIgnoreCase(String code);
}
