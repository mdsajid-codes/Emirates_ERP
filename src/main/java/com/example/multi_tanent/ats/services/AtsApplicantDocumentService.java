package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsApplicantDocumentRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantDocumentResponse;
import com.example.multi_tanent.ats.entity.AtsApplicant;
import com.example.multi_tanent.ats.entity.AtsApplicantDocument;
import com.example.multi_tanent.ats.entity.AtsDocumentType;
import com.example.multi_tanent.ats.repository.AtsApplicantDocumentRepository;
import com.example.multi_tanent.ats.repository.AtsApplicantRepository;
import com.example.multi_tanent.ats.repository.AtsDocumentTypeRepository;
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
public class AtsApplicantDocumentService {

    private final AtsApplicantDocumentRepository documentRepository;
    private final AtsApplicantRepository applicantRepository;
    private final AtsDocumentTypeRepository documentTypeRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public String uploadFile(Long applicantId, MultipartFile file) {
        try {
            Path uploadPath = Paths.get("uploads", "ats", "applicant_" + applicantId);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path targetLocation = uploadPath.resolve(file.getOriginalFilename());
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/ats/applicant_" + applicantId + "/" + file.getOriginalFilename();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Error: " + ex.getMessage(), ex);
        }
    }

    public AtsApplicantDocumentResponse create(Long applicantId, AtsApplicantDocumentRequest request) {
        Tenant tenant = currentTenant();

        AtsApplicant applicant = applicantRepository.findByIdAndTenantId(applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant not found with id: " + applicantId));

        AtsDocumentType documentType = documentTypeRepository.findByIdAndTenantId(request.getDocumentTypeId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("DocumentType not found with id: " + request.getDocumentTypeId()));

        AtsApplicantDocument document = AtsApplicantDocument.builder()
                .tenant(tenant)
                .applicant(applicant)
                .title(request.getTitle())
                .fileName(request.getFileName())
                .filePath(request.getFilePath())
                .documentType(documentType)
                .comments(request.getComments())
                .build();

        AtsApplicantDocument saved = documentRepository.save(document);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsApplicantDocumentResponse> getAllForApplicant(Long applicantId) {
        Tenant tenant = currentTenant();
        // verify applicant exists
        if (!applicantRepository.existsById(applicantId)) {
            throw new EntityNotFoundException("Applicant not found with id: " + applicantId);
        }
        return documentRepository.findByApplicantIdAndTenantId(applicantId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsApplicantDocumentResponse getById(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        return documentRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));
    }

    public AtsApplicantDocumentResponse update(Long applicantId, Long id, AtsApplicantDocumentRequest request) {
        Tenant tenant = currentTenant();
        AtsApplicantDocument document = documentRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));

        AtsDocumentType documentType = documentTypeRepository.findByIdAndTenantId(request.getDocumentTypeId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("DocumentType not found with id: " + request.getDocumentTypeId()));

        document.setTitle(request.getTitle());
        document.setFileName(request.getFileName());
        document.setFilePath(request.getFilePath());
        document.setDocumentType(documentType);
        document.setComments(request.getComments());

        AtsApplicantDocument updated = documentRepository.save(document);
        return toResponse(updated);
    }

    public void delete(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        AtsApplicantDocument document = documentRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));
        documentRepository.delete(document);
    }

    public AtsApplicantDocumentResponse toResponse(AtsApplicantDocument document) {
        return AtsApplicantDocumentResponse.builder()
                .id(document.getId())
                .applicantId(document.getApplicant().getId())
                .title(document.getTitle())
                .fileName(document.getFileName())
                .filePath(document.getFilePath())
                .documentTypeId(document.getDocumentType().getId())
                .documentTypeName(document.getDocumentType().getName())
                .comments(document.getComments())
                .build();
    }
}
