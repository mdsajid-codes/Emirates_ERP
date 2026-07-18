package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.CrmRoleModulePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CrmRoleModulePermissionRepository extends JpaRepository<CrmRoleModulePermission, Long> {
    List<CrmRoleModulePermission> findByRole_Id(Long roleId);
    Optional<CrmRoleModulePermission> findByRole_IdAndModule(Long roleId, String module);
    void deleteByRole_Id(Long roleId);
}
