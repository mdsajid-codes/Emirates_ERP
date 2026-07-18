package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsClientDocumentRequest;
import com.example.multi_tanent.ats.dto.AtsClientDocumentResponse;
import com.example.multi_tanent.ats.entity.AtsClient;
import com.example.multi_tanent.ats.entity.AtsClientDocument;
import com.example.multi_tanent.ats.entity.AtsDocumentType;
import com.example.multi_tanent.ats.repository.AtsClientDocumentRepository;
import com.example.multi_tanent.ats.repository.AtsClientRepository;
import com.example.multi_tanent.ats.repository.AtsDocumentTypeRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
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
public class AtsClientDocumentService {

    private final AtsClientDocumentRepository documentRepository;
    private final AtsClientRepository clientRepository;
    private final AtsDocumentTypeRepository documentTypeRepository;
    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public String uploadFile(Long clientId, MultipartFile file) {
        try {
            Path uploadPath = Paths.get("uploads", "ats", "client_" + clientId);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path targetLocation = uploadPath.resolve(file.getOriginalFilename());
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/ats/client_" + clientId + "/" + file.getOriginalFilename();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Error: " + ex.getMessage(), ex);
        }
    }

    public AtsClientDocumentResponse create(Long clientId, AtsClientDocumentRequest request) {
        Tenant tenant = currentTenant();

        AtsClient client = clientRepository.findByIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + clientId));

        AtsDocumentType documentType = documentTypeRepository.findByIdAndTenantId(request.getDocumentTypeId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("DocumentType not found with id: " + request.getDocumentTypeId()));

        Employee uploadedBy = null;
        if (request.getUploadedById() != null) {
            uploadedBy = employeeRepository.findByIdAndUser_Tenant_Id(request.getUploadedById(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Employee (UploadedBy) not found with id: " + request.getUploadedById()));
        }

        AtsClientDocument document = AtsClientDocument.builder()
                .tenant(tenant)
                .client(client)
                .title(request.getTitle())
                .fileName(request.getFileName())
                .filePath(request.getFilePath())
                .fileSize(request.getFileSize())
                .mimeType(request.getMimeType())
                .description(request.getDescription())
                .documentType(documentType)
                .uploadedBy(uploadedBy)
                .build();

        AtsClientDocument saved = documentRepository.save(document);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsClientDocumentResponse> getAllForClient(Long clientId) {
        Tenant tenant = currentTenant();
        // verify client exists
        if (!clientRepository.existsById(clientId)) {
            throw new EntityNotFoundException("Client not found with id: " + clientId);
        }
        return documentRepository.findByClientIdAndTenantId(clientId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsClientDocumentResponse getById(Long clientId, Long id) {
        Tenant tenant = currentTenant();
        return documentRepository.findByIdAndClientIdAndTenantId(id, clientId, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));
    }

    public AtsClientDocumentResponse update(Long clientId, Long id, AtsClientDocumentRequest request) {
        Tenant tenant = currentTenant();
        AtsClientDocument document = documentRepository.findByIdAndClientIdAndTenantId(id, clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));

        AtsDocumentType documentType = documentTypeRepository.findByIdAndTenantId(request.getDocumentTypeId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("DocumentType not found with id: " + request.getDocumentTypeId()));

        Employee uploadedBy = null;
        if (request.getUploadedById() != null) {
            uploadedBy = employeeRepository.findByIdAndUser_Tenant_Id(request.getUploadedById(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Employee (UploadedBy) not found with id: " + request.getUploadedById()));
        }

        document.setTitle(request.getTitle());
        document.setFileName(request.getFileName());
        document.setFilePath(request.getFilePath());
        document.setFileSize(request.getFileSize());
        document.setMimeType(request.getMimeType());
        document.setDescription(request.getDescription());
        document.setDocumentType(documentType);
        document.setUploadedBy(uploadedBy);

        AtsClientDocument updated = documentRepository.save(document);
        return toResponse(updated);
    }

    public void delete(Long clientId, Long id) {
        Tenant tenant = currentTenant();
        AtsClientDocument document = documentRepository.findByIdAndClientIdAndTenantId(id, clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));
        documentRepository.delete(document);
    }

    public AtsClientDocumentResponse toResponse(AtsClientDocument document) {
        return AtsClientDocumentResponse.builder()
                .id(document.getId())
                .clientId(document.getClient().getId())
                .title(document.getTitle())
                .fileName(document.getFileName())
                .filePath(document.getFilePath())
                .fileSize(document.getFileSize())
                .mimeType(document.getMimeType())
                .documentTypeId(document.getDocumentType().getId())
                .documentTypeName(document.getDocumentType().getName())
                .description(document.getDescription())
                .uploadedById(document.getUploadedBy() != null ? document.getUploadedBy().getId() : null)
                .uploadedByName(document.getUploadedBy() != null ? 
                        (document.getUploadedBy().getFirstName() + " " + document.getUploadedBy().getLastName()) : null)
                .build();
    }
}
