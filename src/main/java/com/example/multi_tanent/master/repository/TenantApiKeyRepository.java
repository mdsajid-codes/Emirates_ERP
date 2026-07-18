package com.example.multi_tanent.master.repository;
 
import com.example.multi_tanent.master.entity.TenantApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
import java.util.Optional;
 
@Repository
public interface TenantApiKeyRepository extends JpaRepository<TenantApiKey, Long> {
    Optional<TenantApiKey> findByTenantId(String tenantId);
    Optional<TenantApiKey> findByApiKey(String apiKey);
}
