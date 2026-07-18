package com.example.multi_tanent.spersusers.components;

import com.example.multi_tanent.spersusers.enitity.notification.entity.config.EmailConfig;
import com.example.multi_tanent.spersusers.notification.repository.config.EmailConfigRepository;
import com.example.multi_tanent.spersusers.enitity.notification.entity.template.EmailTemplate;
import com.example.multi_tanent.spersusers.notification.repository.template.EmailTemplateRepository;
import com.example.multi_tanent.spersusers.enitity.notification.entity.log.EmailLog;
import com.example.multi_tanent.spersusers.notification.repository.log.EmailLogRepository;
import com.example.multi_tanent.spersusers.dto.NotificationRequest;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enums.NotificationStatus;
import com.example.multi_tanent.spersusers.interfaces.NotificationChannel;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.io.File;
import java.util.Properties;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailChannel implements NotificationChannel {

    private final TenantRepository tenantRepository;
    private final EmailConfigRepository emailConfigRepository;
    private final EmailTemplateRepository emailTemplateRepository;
    private final EmailLogRepository emailLogRepository;

    @Override
    public void send(NotificationRequest request) {
        log.info("Sending EMAIL to {} for Tenant {}", request.getRecipient(), request.getTenantId());

        EmailConfig config = emailConfigRepository.findByTenantId(request.getTenantId()).orElse(null);
        if (config != null && !config.getEnabled()) return;

        try {
            JavaMailSender mailSender;
            String fromEmail;
            
            if (config != null && StringUtils.hasText(config.getHost())) {
                mailSender = getJavaMailSender(config);
                fromEmail = config.getFromEmail();
            } else {
                Tenant tenant = tenantRepository.findById(request.getTenantId()).orElseThrow();
                if (!StringUtils.hasText(tenant.getSmtpHost())) {
                    throw new RuntimeException("No SMTP configuration found for tenant " + request.getTenantId());
                }
                mailSender = getJavaMailSender(tenant);
                fromEmail = tenant.getCompanyEmail();
            }

            String body = request.getBody();
            String subject = request.getSubject();

            if (StringUtils.hasText(request.getTemplateId())) {
                EmailTemplate template = emailTemplateRepository.findByTenantIdAndTemplateIdAndActiveTrue(
                        request.getTenantId(), request.getTemplateId()).orElse(null);
                if (template != null) {
                    body = template.getBody();
                    subject = template.getSubject();
                    // Substitution logic here if needed
                }
            }

            sendMimeMessage(mailSender, request.getRecipient(), subject, body, fromEmail, request.getAttachmentPaths());
            saveLog(request, NotificationStatus.SENT, null);
        } catch (Exception e) {
            log.error("Email failed for tenant {}: {}", request.getTenantId(), e.getMessage());
            saveLog(request, NotificationStatus.FAILED, e.getMessage());
            throw new RuntimeException("Email delivery failed: " + e.getMessage(), e);
        }
    }

    private void saveLog(NotificationRequest request, NotificationStatus status, String error) {
        emailLogRepository.save(EmailLog.builder()
                .tenantId(request.getTenantId())
                .recipient(request.getRecipient())
                .subject(request.getSubject())
                .body(request.getBody())
                .templateId(request.getTemplateId())
                .status(status)
                .errorMessage(error)
                .build());
    }

    private JavaMailSender getJavaMailSender(EmailConfig config) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(config.getHost());
        mailSender.setPort(config.getPort());
        mailSender.setUsername(config.getUsername());
        mailSender.setPassword(config.getPassword());
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        
        boolean isSsl = config.getSslEnabled() != null && config.getSslEnabled();
        boolean isStartTls = config.getStarttlsEnabled() != null && config.getStarttlsEnabled();

        props.put("mail.smtp.starttls.enable", String.valueOf(isStartTls));
        props.put("mail.smtp.starttls.required", String.valueOf(isStartTls));
        props.put("mail.smtp.ssl.enable", String.valueOf(isSsl));
        props.put("mail.smtp.ssl.trust", config.getHost());

        if (isSsl) {
            props.put("mail.smtp.socketFactory.port", config.getPort().toString());
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        }
        
        props.put("mail.smtp.timeout", "10000"); // Increased timeout for Zoho
        props.put("mail.smtp.connectiontimeout", "10000");
        
        return mailSender;
    }

    private JavaMailSender getJavaMailSender(Tenant tenant) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(tenant.getSmtpHost());
        mailSender.setPort(tenant.getSmtpPort());
        mailSender.setUsername(tenant.getSmtpUsername());
        mailSender.setPassword(tenant.getSmtpPassword());
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true"); // Default for tenant fallback
        
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.connectiontimeout", "5000");
        
        return mailSender;
    }

    private void sendMimeMessage(JavaMailSender mailSender, String to, String subject, String body, String from, java.util.List<String> attachments) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, attachments != null);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true);
        mailSender.send(message);
    }

    @Override
    public String getChannelName() {
        return "EMAIL";
    }
}