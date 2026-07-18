package com.example.multi_tanent.purchases.repository;

import com.example.multi_tanent.purchases.entity.PurCustomDeclaration;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurCustomDeclarationRepository extends JpaRepository<PurCustomDeclaration, Long> {
    List<PurCustomDeclaration> findAllByTenant(Tenant tenant);
}
