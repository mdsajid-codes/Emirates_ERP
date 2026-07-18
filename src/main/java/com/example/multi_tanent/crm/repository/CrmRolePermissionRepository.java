package com.example.multi_tanent.crm.repository;




import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.crm.entity.CrmRole;
import com.example.multi_tanent.crm.entity.CrmRolePermission;

import java.util.List;

public interface CrmRolePermissionRepository extends JpaRepository<CrmRolePermission, Long> {
    List<CrmRolePermission> findByRole(CrmRole role);
    void deleteByRole(CrmRole role);

    boolean existsByPermissionId(Long permissionId);
}
