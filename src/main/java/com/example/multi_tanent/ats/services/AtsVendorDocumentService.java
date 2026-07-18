package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsVendorDocumentRequest;
import com.example.multi_tanent.ats.dto.AtsVendorDocumentResponse;
import com.example.multi_tanent.ats.entity.AtsVendor;
import com.example.multi_tanent.ats.entity.AtsVendorDocument;
import com.example.multi_tanent.ats.entity.AtsDocumentType;
import com.example.multi_tanent.ats.repository.AtsVendorDocumentRepository;
import com.example.multi_tanent.ats.repository.AtsVendorRepository;
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
public class AtsVendorDocumentService {

    private final AtsVendorDocumentRepository documentRepository;
    private final AtsVendorRepository vendorRepository;
    private final AtsDocumentTypeRepository documentTypeRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public String uploadFile(Long vendorId, MultipartFile file) {
        try {
            Path uploadPath = Paths.get("uploads", "ats", "vendor_" + vendorId);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path targetLocation = uploadPath.resolve(file.getOriginalFilename());
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/ats/vendor_" + vendorId + "/" + file.getOriginalFilename();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Error: " + ex.getMessage(), ex);
        }
    }

    public AtsVendorDocumentResponse create(Long vendorId, AtsVendorDocumentRequest request) {
        Tenant tenant = currentTenant();

        AtsVendor vendor = vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id: " + vendorId));

        AtsDocumentType documentType = documentTypeRepository.findByIdAndTenantId(request.getDocumentTypeId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("DocumentType not found with id: " + request.getDocumentTypeId()));

        AtsVendorDocument document = AtsVendorDocument.builder()
                .tenant(tenant)
                .vendor(vendor)
                .title(request.getTitle())
                .fileName(request.getFileName())
                .filePath(request.getFilePath())
                .documentType(documentType)
                .comments(request.getComments())
                .build();

        AtsVendorDocument saved = documentRepository.save(document);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsVendorDocumentResponse> getAllForVendor(Long vendorId) {
        Tenant tenant = currentTenant();
        // verify vendor exists
        if (!vendorRepository.existsById(vendorId)) {
            throw new EntityNotFoundException("Vendor not found with id: " + vendorId);
        }
        return documentRepository.findByVendorIdAndTenantId(vendorId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsVendorDocumentResponse getById(Long vendorId, Long id) {
        Tenant tenant = currentTenant();
        return documentRepository.findByIdAndVendorIdAndTenantId(id, vendorId, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));
    }

    public AtsVendorDocumentResponse update(Long vendorId, Long id, AtsVendorDocumentRequest request) {
        Tenant tenant = currentTenant();
        AtsVendorDocument document = documentRepository.findByIdAndVendorIdAndTenantId(id, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));

        AtsDocumentType documentType = documentTypeRepository.findByIdAndTenantId(request.getDocumentTypeId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("DocumentType not found with id: " + request.getDocumentTypeId()));

        document.setTitle(request.getTitle());
        document.setFileName(request.getFileName());
        document.setFilePath(request.getFilePath());
        document.setDocumentType(documentType);
        document.setComments(request.getComments());

        AtsVendorDocument updated = documentRepository.save(document);
        return toResponse(updated);
    }

    public void delete(Long vendorId, Long id) {
        Tenant tenant = currentTenant();
        AtsVendorDocument document = documentRepository.findByIdAndVendorIdAndTenantId(id, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + id));
        documentRepository.delete(document);
    }

    public AtsVendorDocumentResponse toResponse(AtsVendorDocument document) {
        return AtsVendorDocumentResponse.builder()
                .id(document.getId())
                .vendorId(document.getVendor().getId())
                .title(document.getTitle())
                .fileName(document.getFileName())
                .filePath(document.getFilePath())
                .documentTypeId(document.getDocumentType().getId())
                .documentTypeName(document.getDocumentType().getName())
                .comments(document.getComments())
                .build();
    }
}
