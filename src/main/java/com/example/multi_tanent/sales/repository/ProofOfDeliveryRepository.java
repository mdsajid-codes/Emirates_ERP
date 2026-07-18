package com.example.multi_tanent.sales.repository;

import com.example.multi_tanent.sales.entity.ProofOfDelivery;
import com.example.multi_tanent.sales.enums.PodStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProofOfDeliveryRepository extends JpaRepository<ProofOfDelivery, Long> {
    
    Optional<ProofOfDelivery> findByDeliveryOrderIdAndEnterpriseId(Long doId, Long enterpriseId);
    
    List<ProofOfDelivery> findByEnterpriseIdAndStatus(Long enterpriseId, PodStatus status);
}
