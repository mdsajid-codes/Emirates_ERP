package com.example.multi_tanent.spersusers.notification.service;

import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.notification.entity.config.EmailConfig;
import com.example.multi_tanent.spersusers.notification.dto.EmailConfigDto;
import com.example.multi_tanent.spersusers.notification.dto.NotificationLogResponse;
import com.example.multi_tanent.spersusers.notification.repository.config.EmailConfigRepository;
import com.example.multi_tanent.spersusers.notification.repository.log.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Properties;

@Service
@RequiredArgsConstructor
@Transactional(transactionManager = "tenantTx")
public class EmailNotificationService {

        private final TenantService tenantService;
        private final EmailConfigRepository emailConfigRepository;
        private final EmailLogRepository emailLogRepository;

        private Tenant getCurrentTenant() {
                return tenantService.getCurrentTenant()
                                .orElseThrow(() -> new IllegalStateException("No tenant in current context"));
        }

        public EmailConfigDto getEmailConfig() {
                Tenant tenant = getCurrentTenant();
                return emailConfigRepository.findByTenantId(tenant.getId())
                                .map(c -> EmailConfigDto.builder()
                                                .enabled(c.getEnabled())
                                                .host(c.getHost())
                                                .port(c.getPort())
                                                .username(c.getUsername())
                                                .password(c.getPassword())
                                                .fromEmail(c.getFromEmail())
                                                .fromName(c.getFromName())
                                                .sslEnabled(c.getSslEnabled())
                                                .starttlsEnabled(c.getStarttlsEnabled())
                                                .build())
                                .orElse(new EmailConfigDto());
        }

        public void saveEmailConfig(EmailConfigDto dto) {
                Tenant tenant = getCurrentTenant();
                EmailConfig config = emailConfigRepository.findByTenantId(tenant.getId())
                                .orElse(EmailConfig.builder().tenant(tenant).build());
                config.setEnabled(dto.getEnabled());
                config.setHost(dto.getHost());
                config.setPort(dto.getPort());
                config.setUsername(dto.getUsername());
                if (dto.getPassword() != null)
                        config.setPassword(dto.getPassword());
                config.setFromEmail(dto.getFromEmail());
                config.setFromName(dto.getFromName());
                config.setSslEnabled(dto.getSslEnabled());
                config.setStarttlsEnabled(dto.getStarttlsEnabled());
                emailConfigRepository.save(config);
        }

        public Page<NotificationLogResponse> getEmailLogs(Pageable pageable) {
                Tenant tenant = getCurrentTenant();
                return emailLogRepository.findByTenantId(tenant.getId(), pageable)
                                .map(log -> NotificationLogResponse.builder()
                                                .id(log.getId())
                                                .recipient(log.getRecipient())
                                                .subject(log.getSubject())
                                                .body(log.getBody())
                                                .templateId(log.getTemplateId())
                                                .status(log.getStatus())
                                                .errorMessage(log.getErrorMessage())
                                                .sentAt(log.getSentAt())
                                                .build());
        }

        public void testConnection(EmailConfigDto dto) {
                JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
                mailSender.setHost(dto.getHost());
                mailSender.setPort(dto.getPort());
                mailSender.setUsername(dto.getUsername());
                mailSender.setPassword(dto.getPassword());
                
                Properties props = mailSender.getJavaMailProperties();
                props.put("mail.transport.protocol", "smtp");
                props.put("mail.smtp.auth", "true");
                
                boolean isSsl = dto.getSslEnabled() != null && dto.getSslEnabled();
                boolean isStartTls = dto.getStarttlsEnabled() != null && dto.getStarttlsEnabled();

                props.put("mail.smtp.starttls.enable", String.valueOf(isStartTls));
                props.put("mail.smtp.starttls.required", String.valueOf(isStartTls));
                props.put("mail.smtp.ssl.enable", String.valueOf(isSsl));
                props.put("mail.smtp.ssl.trust", dto.getHost());

                if (isSsl) {
                    props.put("mail.smtp.socketFactory.port", String.valueOf(dto.getPort()));
                    props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
                }
                
                props.put("mail.smtp.timeout", "10000");
                props.put("mail.smtp.connectiontimeout", "10000");

                try {
                        mailSender.testConnection();
                } catch (Exception e) {
                        throw new RuntimeException("Email connection failed: " + e.getMessage());
                }
        }
}
