package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CrmEmailDto;
import com.example.multi_tanent.crm.dto.CrmEmailRequestDto;
import com.example.multi_tanent.crm.entity.Contact;
import com.example.multi_tanent.crm.entity.CrmEmail;
import com.example.multi_tanent.crm.entity.CrmLead;
import com.example.multi_tanent.crm.enums.EmailStatus;
import com.example.multi_tanent.crm.repository.ContactRepository;
import com.example.multi_tanent.crm.repository.CrmEmailRepository;
import com.example.multi_tanent.crm.repository.CrmLeadRepository;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Properties;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmEmailService {

    private final CrmEmailRepository emailRepository;
    private final TenantRepository tenantRepository;
    private final CrmLeadRepository leadRepository;
    private final ContactRepository contactRepository;
    private final EmployeeRepository employeeRepository;
    private final CrmAuditService auditService;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public CrmEmailDto sendEmail(CrmEmailRequestDto request) {
        Tenant tenant = getCurrentTenant();
        CrmEmail email = new CrmEmail();
        email.setTenant(tenant);

        if (!StringUtils.hasText(tenant.getCompanyEmail()) || !StringUtils.hasText(tenant.getSmtpHost())) {
            throw new IllegalStateException("SMTP settings are not configured for this tenant. Please configure company email and SMTP host.");
        }

        // Set sender and recipient
        email.setFromAddress(tenant.getCompanyEmail());

        CrmLead lead = null;
        if (request.getLeadId() != null) {
            lead = leadRepository.findById(request.getLeadId())
                    .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + request.getLeadId()));
            email.setLead(lead);
            email.setToAddress(lead.getEmail());
        } else if (request.getContactId() != null) {
            Contact contact = contactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found with id: " + request.getContactId()));
            email.setContact(contact);
            email.setToAddress(contact.getEmail());
        } else {
            throw new IllegalArgumentException("Either leadId or contactId must be provided.");
        }

        // Set internal tracker for who sent it
        if (request.getSentByEmployeeId() != null) {
            Employee employee = employeeRepository.findById(request.getSentByEmployeeId())
                    .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getSentByEmployeeId()));
            email.setSentBy(employee);
        }

        // Set email content
        email.setSubject(request.getSubject());
        email.setBody(request.getBody());
        email.setCcAddress(request.getCcAddress());

        try {
            JavaMailSender tenantMailSender = getJavaMailSender(tenant);
            sendSimpleMail(tenantMailSender, email);
            email.setStatus(EmailStatus.SENT);
        } catch (MailException ex) {
            // Log the exception in a real application
            System.err.println("Failed to send email: " + ex.getMessage());
            ex.printStackTrace(); // Add this line for detailed debugging
            email.setStatus(EmailStatus.FAILED);
        }

        CrmEmail savedEmail = emailRepository.save(email);

        auditService.log("EMAIL_SENT", "EMAIL", savedEmail.getId(),
                "Email sent to: " + savedEmail.getToAddress() + " with subject: '" + savedEmail.getSubject() + "'");

        return CrmEmailDto.fromEntity(savedEmail);
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
        props.put("mail.smtp.starttls.enable", "true");
        // You can add more properties like mail.debug if needed
        // props.put("mail.debug", "true");

        return mailSender;
    }


    private void sendSimpleMail(JavaMailSender mailSender, CrmEmail email) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(email.getFromAddress());
        message.setTo(email.getToAddress());
        if (email.getCcAddress() != null && !email.getCcAddress().isBlank()) {
            message.setCc(email.getCcAddress());
        }
        message.setSubject(email.getSubject());
        message.setText(email.getBody());
        mailSender.send(message);
    }

    @Transactional(readOnly = true)
    public Page<CrmEmailDto> getAllEmails(Pageable pageable) {
        return emailRepository.findByTenantId(getCurrentTenant().getId(), pageable)
                .map(CrmEmailDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<CrmEmailDto> getEmailsByLeadId(Long leadId) {
        return emailRepository.findByLeadIdAndTenantId(leadId, getCurrentTenant().getId())
                .stream()
                .map(CrmEmailDto::fromEntity)
                .collect(Collectors.toList());
    }
}
