package com.example.multi_tanent.crm.services;
 
import com.example.multi_tanent.master.entity.TenantApiKey;
import com.example.multi_tanent.master.repository.TenantApiKeyRepository;
import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.Optional;
import java.util.UUID;
 
@Service
@RequiredArgsConstructor
public class TenantApiKeyService {
 
    private final TenantApiKeyRepository apiKeyRepository;
    private final TenantService tenantService;
 
    public String getOrCreateApiKey() {
        Tenant tenant = tenantService.getCurrentTenant()
                .orElseThrow(() -> new IllegalStateException("No tenant in context"));
        
        return apiKeyRepository.findByTenantId(tenant.getTenantId())
                .map(TenantApiKey::getApiKey)
                .orElseGet(() -> generateNewApiKey(tenant.getTenantId()));
    }
 
    public String generateNewApiKeyFromContext() {
        Tenant tenant = tenantService.getCurrentTenant()
                .orElseThrow(() -> new IllegalStateException("No tenant in context"));
        return generateNewApiKey(tenant.getTenantId());
    }
 
    @Transactional(transactionManager = "masterTx")
    public String generateNewApiKey(String tenantId) {
        String newKey = "ak_" + UUID.randomUUID().toString().replace("-", "");
        
        TenantApiKey entity = apiKeyRepository.findByTenantId(tenantId)
                .orElse(TenantApiKey.builder().tenantId(tenantId).build());
        
        entity.setApiKey(newKey);
        apiKeyRepository.save(entity);
        return newKey;
    }
 
    public Optional<String> validateApiKeyAndGetTenantId(String apiKey) {
        return apiKeyRepository.findByApiKey(apiKey)
                .map(TenantApiKey::getTenantId);
    }
}
