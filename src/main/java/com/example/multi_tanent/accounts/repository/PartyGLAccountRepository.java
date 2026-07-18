package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.PartyGLAccount;
import com.example.multi_tanent.accounts.entity.enums.PartyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartyGLAccountRepository extends JpaRepository<PartyGLAccount, Long> {

    @Query("SELECT p FROM PartyGLAccount p WHERE p.partyType = :partyType AND p.partyId = :partyId AND p.tenant.id = :tenantId")
    Optional<PartyGLAccount> findByPartyTypeAndPartyIdAndTenant(
            @Param("partyType") PartyType partyType,
            @Param("partyId") Long partyId,
            @Param("tenantId") Long tenantId
    );

    @Query("SELECT p FROM PartyGLAccount p WHERE p.tenant.id = :tenantId")
    List<PartyGLAccount> findAllByTenant(@Param("tenantId") Long tenantId);
}
