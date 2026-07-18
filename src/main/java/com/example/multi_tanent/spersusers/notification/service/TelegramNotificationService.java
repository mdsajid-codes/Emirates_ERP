package com.example.multi_tanent.spersusers.notification.service;

import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.notification.entity.config.TelegramConfig;
import com.example.multi_tanent.spersusers.notification.dto.TelegramConfigDto;
import com.example.multi_tanent.spersusers.notification.repository.config.TelegramConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(transactionManager = "tenantTx")
public class TelegramNotificationService {

    private final TenantService tenantService;
    private final TelegramConfigRepository telegramConfigRepository;

    private Tenant getCurrentTenant() {
        return tenantService.getCurrentTenant()
                .orElseThrow(() -> new IllegalStateException("No tenant in current context"));
    }

    public TelegramConfigDto getTelegramConfig() {
        Tenant tenant = getCurrentTenant();
        return telegramConfigRepository.findByTenantId(tenant.getId())
                .map(c -> TelegramConfigDto.builder()
                        .enabled(c.getEnabled())
                        .botToken(c.getBotToken())
                        .defaultChatId(c.getDefaultChatId())
                        .build())
                .orElse(new TelegramConfigDto());
    }

    public void saveTelegramConfig(TelegramConfigDto dto) {
        Tenant tenant = getCurrentTenant();
        TelegramConfig config = telegramConfigRepository.findByTenantId(tenant.getId())
                .orElse(TelegramConfig.builder().tenant(tenant).build());
        config.setEnabled(dto.getEnabled());
        config.setBotToken(dto.getBotToken());
        config.setDefaultChatId(dto.getDefaultChatId());
        telegramConfigRepository.save(config);
    }
}
