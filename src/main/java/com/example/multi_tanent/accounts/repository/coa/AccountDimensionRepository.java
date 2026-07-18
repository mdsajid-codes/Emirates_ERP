package com.example.multi_tanent.accounts.repository.coa;

import com.example.multi_tanent.accounts.entity.coa.AccountDimension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountDimensionRepository extends JpaRepository<AccountDimension, Long> {

    @Query("SELECT d FROM AccountDimension d WHERE d.account.accountId = :accountId")
    List<AccountDimension> findByAccountId(@Param("accountId") Long accountId);

    @Modifying
    @Query("DELETE FROM AccountDimension d WHERE d.account.accountId = :accountId")
    void deleteByAccountId(@Param("accountId") Long accountId);
}
