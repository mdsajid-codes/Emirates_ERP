package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.ItemGLAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemGLAccountRepository extends JpaRepository<ItemGLAccount, Long> {

    @Query("SELECT i FROM ItemGLAccount i WHERE i.itemId = :itemId AND i.tenant.id = :tenantId")
    Optional<ItemGLAccount> findByItemIdAndTenant(
            @Param("itemId") Long itemId,
            @Param("tenantId") Long tenantId
    );

    @Query("SELECT i FROM ItemGLAccount i WHERE i.tenant.id = :tenantId")
    List<ItemGLAccount> findAllByTenant(@Param("tenantId") Long tenantId);
}
