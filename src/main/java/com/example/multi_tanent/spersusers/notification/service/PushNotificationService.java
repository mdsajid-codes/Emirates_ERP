package com.example.multi_tanent.spersusers.notification.service;

import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.notification.entity.config.PushConfig;
import com.example.multi_tanent.spersusers.notification.dto.PushConfigDto;
import com.example.multi_tanent.spersusers.notification.repository.config.PushConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(transactionManager = "tenantTx")
public class PushNotificationService {

    private final TenantService tenantService;
    private final PushConfigRepository pushConfigRepository;

    private Tenant getCurrentTenant() {
        return tenantService.getCurrentTenant()
                .orElseThrow(() -> new IllegalStateException("No tenant in current context"));
    }

    public PushConfigDto getPushConfig() {
        Tenant tenant = getCurrentTenant();
        return pushConfigRepository.findByTenantId(tenant.getId())
                .map(c -> PushConfigDto.builder()
                        .enabled(c.getEnabled())
                        .provider(c.getProvider())
                        .appId(c.getAppId())
                        .apiKey(c.getApiKey())
                        .build())
                .orElse(new PushConfigDto());
    }

    public void savePushConfig(PushConfigDto dto) {
        Tenant tenant = getCurrentTenant();
        PushConfig config = pushConfigRepository.findByTenantId(tenant.getId())
                .orElse(PushConfig.builder().tenant(tenant).build());
        config.setEnabled(dto.getEnabled());
        config.setProvider(dto.getProvider());
        config.setAppId(dto.getAppId());
        config.setApiKey(dto.getApiKey());
        pushConfigRepository.save(config);
    }
}
