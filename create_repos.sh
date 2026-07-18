mkdir -p src/main/java/com/example/multi_tanent/accounts/repository

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/repository/AccBankRepository.java
package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccBankRepository extends JpaRepository<AccBank, Long> {
    List<AccBank> findByTenantId(String tenantId);
    Optional<AccBank> findByIdAndTenantId(Long id, String tenantId);
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/repository/AccBankAccountRepository.java
package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccBankAccountRepository extends JpaRepository<AccBankAccount, Long> {
    List<AccBankAccount> findByTenantIdAndIsActiveTrue(String tenantId);
    Optional<AccBankAccount> findByIdAndTenantId(Long id, String tenantId);
    Optional<AccBankAccount> findByGlAccountId(Long glAccountId);
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/repository/AccPaymentRepository.java
package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccPayment;
import com.example.multi_tanent.accounts.entity.enums.PaymentStatus;
import com.example.multi_tanent.accounts.entity.enums.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccPaymentRepository extends JpaRepository<AccPayment, Long> {
    List<AccPayment> findByTenantIdAndStatus(String tenantId, PaymentStatus status);
    List<AccPayment> findByTenantIdAndPartnerIdAndPaymentType(String tenantId, Long partnerId, PaymentType paymentType);
    List<AccPayment> findByTenantIdAndPaymentDateBetween(String tenantId, LocalDate from, LocalDate to);
    Optional<AccPayment> findByIdAndTenantId(Long id, String tenantId);
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/repository/AccPaymentInvoiceAllocationRepository.java
package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccPaymentInvoiceAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccPaymentInvoiceAllocationRepository extends JpaRepository<AccPaymentInvoiceAllocation, Long> {
    List<AccPaymentInvoiceAllocation> findByPaymentId(Long paymentId);
    List<AccPaymentInvoiceAllocation> findByInvoiceId(Long invoiceId);
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/repository/AccPostDatedChequeRepository.java
package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccPostDatedCheque;
import com.example.multi_tanent.accounts.entity.enums.PdcStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccPostDatedChequeRepository extends JpaRepository<AccPostDatedCheque, Long> {
    List<AccPostDatedCheque> findByTenantIdAndStatus(String tenantId, PdcStatus status);
    List<AccPostDatedCheque> findByTenantIdAndChequeDateLessThanEqualAndStatus(String tenantId, LocalDate date, PdcStatus status);
    Optional<AccPostDatedCheque> findByIdAndTenantId(Long id, String tenantId);
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/repository/AccCashEquivalentRepository.java
package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccCashEquivalent;
import com.example.multi_tanent.accounts.entity.enums.CashEquivStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccCashEquivalentRepository extends JpaRepository<AccCashEquivalent, Long> {
    List<AccCashEquivalent> findByTenantIdAndStatus(String tenantId, CashEquivStatus status);
    Optional<AccCashEquivalent> findByIdAndTenantId(Long id, String tenantId);
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/repository/AccCashFlowItemRepository.java
package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccCashFlowItem;
import com.example.multi_tanent.accounts.entity.enums.CashFlowCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccCashFlowItemRepository extends JpaRepository<AccCashFlowItem, Long> {
    @Query("SELECT i FROM AccCashFlowItem i WHERE i.tenantId = ?1 OR i.tenantId = 'DEFAULT'")
    List<AccCashFlowItem> findByTenantId(String tenantId);
    
    @Query("SELECT i FROM AccCashFlowItem i WHERE (i.tenantId = ?1 OR i.tenantId = 'DEFAULT') AND i.category = ?2")
    List<AccCashFlowItem> findByTenantIdAndCategory(String tenantId, CashFlowCategory category);
    
    @Query("SELECT i FROM AccCashFlowItem i WHERE (i.tenantId = ?1 OR i.tenantId = 'DEFAULT') AND i.name = ?2")
    AccCashFlowItem findByTenantIdAndName(String tenantId, String name);
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/repository/AccCashFlowTransactionRepository.java
package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccCashFlowTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AccCashFlowTransactionRepository extends JpaRepository<AccCashFlowTransaction, Long> {
    List<AccCashFlowTransaction> findByTenantIdAndTransactionDateBetween(String tenantId, LocalDate from, LocalDate to);
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/repository/AccMutualSettlementRepository.java
package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccMutualSettlement;
import com.example.multi_tanent.accounts.entity.enums.SettlementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccMutualSettlementRepository extends JpaRepository<AccMutualSettlement, Long> {
    List<AccMutualSettlement> findByTenantIdAndPartnerId(String tenantId, Long partnerId);
    List<AccMutualSettlement> findByTenantIdAndStatus(String tenantId, SettlementStatus status);
    Optional<AccMutualSettlement> findByIdAndTenantId(Long id, String tenantId);
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/repository/AccMutualSettlementApLineRepository.java
package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccMutualSettlementApLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccMutualSettlementApLineRepository extends JpaRepository<AccMutualSettlementApLine, Long> {
    List<AccMutualSettlementApLine> findBySettlementId(Long settlementId);
}
JAVA

cat << 'JAVA' > src/main/java/com/example/multi_tanent/accounts/repository/AccMutualSettlementArLineRepository.java
package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccMutualSettlementArLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccMutualSettlementArLineRepository extends JpaRepository<AccMutualSettlementArLine, Long> {
    List<AccMutualSettlementArLine> findBySettlementId(Long settlementId);
}
JAVA

chmod +x create_repos.sh
./create_repos.sh
