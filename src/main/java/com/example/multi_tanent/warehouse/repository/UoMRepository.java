package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.UoM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UoMRepository extends JpaRepository<UoM, Long> {
    List<UoM> findByEnterpriseId(Long tenantId);
}
