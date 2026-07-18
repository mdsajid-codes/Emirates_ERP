package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsClientGuidelineDocumentRequest;
import com.example.multi_tanent.ats.dto.AtsClientGuidelineDocumentResponse;
import com.example.multi_tanent.ats.entity.AtsClientGuideline;
import com.example.multi_tanent.ats.entity.AtsClientGuidelineDocument;
import com.example.multi_tanent.ats.repository.AtsClientGuidelineDocumentRepository;
import com.example.multi_tanent.ats.repository.AtsClientGuidelineRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsClientGuidelineDocumentService {

    private final AtsClientGuidelineDocumentRepository documentRepository;
    private final AtsClientGuidelineRepository guidelineRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public String uploadFile(Long clientId, MultipartFile file) {
        try {
            Path uploadPath = Paths.get("uploads", "ats", "client_guidelines_" + clientId);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path targetLocation = uploadPath.resolve(file.getOriginalFilename());
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/ats/client_guidelines_" + clientId + "/" + file.getOriginalFilename();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Error: " + ex.getMessage(), ex);
        }
    }

    public AtsClientGuidelineDocumentResponse create(Long clientId, AtsClientGuidelineDocumentRequest request) {
        Tenant tenant = currentTenant();

        AtsClientGuideline guideline = guidelineRepository.findByClientIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Guidelines not found for client id: " + clientId));

        AtsClientGuidelineDocument document = AtsClientGuidelineDocument.builder()
                .tenant(tenant)
                .guideline(guideline)
                .documentSource(request.getDocumentSource())
                .documentTitle(request.getDocumentTitle())
                .description(request.getDescription())
                .fileName(request.getFileName())
                .filePath(request.getFilePath())
                .fileSize(request.getFileSize())
                .mimeType(request.getMimeType())
                .build();

        AtsClientGuidelineDocument saved = documentRepository.save(document);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsClientGuidelineDocumentResponse> getAllForGuideline(Long clientId) {
        Tenant tenant = currentTenant();
        AtsClientGuideline guideline = guidelineRepository.findByClientIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Guidelines not found for client id: " + clientId));

        return documentRepository.findByGuidelineIdAndTenantId(guideline.getId(), tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsClientGuidelineDocumentResponse getById(Long clientId, Long id) {
        Tenant tenant = currentTenant();
        AtsClientGuideline guideline = guidelineRepository.findByClientIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Guidelines not found for client id: " + clientId));

        return documentRepository.findByIdAndGuidelineIdAndTenantId(id, guideline.getId(), tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Guideline document not found with id: " + id));
    }

    public AtsClientGuidelineDocumentResponse update(Long clientId, Long id, AtsClientGuidelineDocumentRequest request) {
        Tenant tenant = currentTenant();
        AtsClientGuideline guideline = guidelineRepository.findByClientIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Guidelines not found for client id: " + clientId));

        AtsClientGuidelineDocument document = documentRepository.findByIdAndGuidelineIdAndTenantId(id, guideline.getId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Guideline document not found with id: " + id));

        document.setDocumentSource(request.getDocumentSource());
        document.setDocumentTitle(request.getDocumentTitle());
        document.setDescription(request.getDescription());
        document.setFileName(request.getFileName());
        document.setFilePath(request.getFilePath());
        document.setFileSize(request.getFileSize());
        document.setMimeType(request.getMimeType());

        AtsClientGuidelineDocument updated = documentRepository.save(document);
        return toResponse(updated);
    }

    public void delete(Long clientId, Long id) {
        Tenant tenant = currentTenant();
        AtsClientGuideline guideline = guidelineRepository.findByClientIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Guidelines not found for client id: " + clientId));

        AtsClientGuidelineDocument document = documentRepository.findByIdAndGuidelineIdAndTenantId(id, guideline.getId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Guideline document not found with id: " + id));

        documentRepository.delete(document);
    }

    public AtsClientGuidelineDocumentResponse toResponse(AtsClientGuidelineDocument d) {
        return AtsClientGuidelineDocumentResponse.builder()
                .id(d.getId())
                .guidelineId(d.getGuideline().getId())
                .documentSource(d.getDocumentSource())
                .documentTitle(d.getDocumentTitle())
                .description(d.getDescription())
                .fileName(d.getFileName())
                .filePath(d.getFilePath())
                .fileSize(d.getFileSize())
                .mimeType(d.getMimeType())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
