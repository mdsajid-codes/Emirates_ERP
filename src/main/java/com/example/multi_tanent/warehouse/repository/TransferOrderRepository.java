package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.TransferOrder;
import com.example.multi_tanent.warehouse.enums.TransferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransferOrderRepository extends JpaRepository<TransferOrder, Long> {
    
    Optional<TransferOrder> findByIdAndEnterpriseId(Long id, Long tenantId);

    Optional<TransferOrder> findByTransferNumberAndEnterpriseId(String transferNumber, Long tenantId);
    
    Page<TransferOrder> findByEnterpriseId(Long tenantId, Pageable pageable);
    
    Page<TransferOrder> findByStatusAndEnterpriseId(TransferStatus status, Long tenantId, Pageable pageable);
    
    long countByEnterpriseId(Long tenantId);
    
    long countByStatusAndEnterpriseId(TransferStatus status, Long tenantId);

    List<TransferOrder> findBySourceWarehouseIdAndEnterpriseId(Long sourceWarehouseId, Long tenantId);

    List<TransferOrder> findByDestinationWarehouseIdAndEnterpriseId(Long destinationWarehouseId, Long tenantId);
}
