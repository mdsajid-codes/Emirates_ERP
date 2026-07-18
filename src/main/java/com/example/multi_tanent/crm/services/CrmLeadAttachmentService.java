package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.entity.CrmLead;
import com.example.multi_tanent.crm.entity.CrmLeadAttachment;
import com.example.multi_tanent.crm.repository.CrmLeadAttachmentRepository;
import com.example.multi_tanent.crm.repository.CrmLeadRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CrmLeadAttachmentService {

    private final CrmLeadAttachmentRepository attachmentRepository;
    private final CrmLeadRepository leadRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(value = "tenantTx")
    public CrmLeadAttachment uploadAttachment(Long leadId, MultipartFile file) throws IOException {
        Tenant tenant = currentTenant();
        CrmLead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        if (!lead.getTenant().getId().equals(tenant.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        String tenantIdStr = tenant.getTenantId();
        String subPath = "crm/lead/document";
        
        // Final structure: uploads/{tenantId}/crm/lead/document/
        Path baseLocation = Paths.get("uploads").toAbsolutePath().normalize();
        Path targetDir = baseLocation.resolve(tenantIdStr).resolve(subPath).normalize();
        Files.createDirectories(targetDir);

        String originalFileName = file.getOriginalFilename();
        String fileName = System.currentTimeMillis() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");
        Path targetLocation = targetDir.resolve(fileName);
        
        Files.write(targetLocation, file.getBytes());

        String relativePath = Paths.get(tenantIdStr, subPath, fileName).toString().replace("\\", "/");

        CrmLeadAttachment attachment = CrmLeadAttachment.builder()
                .lead(lead)
                .tenant(tenant)
                .fileName(originalFileName)
                .filePath(relativePath)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .build();

        return attachmentRepository.save(attachment);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<CrmLeadAttachment> getAttachments(Long leadId) {
        return attachmentRepository.findByLead_IdAndTenant_Id(leadId, currentTenant().getId());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Resource loadFileAsResource(Long attachmentId) {
        CrmLeadAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        if (!attachment.getTenant().getId().equals(currentTenant().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        try {
            Path filePath = Paths.get("uploads").resolve(attachment.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + attachment.getFileName());
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + attachment.getFileName(), ex);
        }
    }

    @Transactional(value = "tenantTx")
    public void deleteAttachment(Long attachmentId) {
        CrmLeadAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        if (!attachment.getTenant().getId().equals(currentTenant().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        try {
            Path filePath = Paths.get("uploads").resolve(attachment.getFilePath()).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log warning
        }

        attachmentRepository.delete(attachment);
    }
}
