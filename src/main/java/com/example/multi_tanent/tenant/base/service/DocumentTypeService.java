package com.example.multi_tanent.tenant.base.service;

import com.example.multi_tanent.tenant.base.dto.DocumentTypeRequest;
import com.example.multi_tanent.tenant.base.entity.DocumentType;
import com.example.multi_tanent.tenant.base.repository.DocumentTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class DocumentTypeService {

    private final DocumentTypeRepository documentTypeRepository;

    public DocumentTypeService(DocumentTypeRepository documentTypeRepository) {
        this.documentTypeRepository = documentTypeRepository;
    }

    public DocumentType createDocumentType(DocumentTypeRequest request) {
        documentTypeRepository.findByName(request.getName()).ifPresent(dt -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Document type with name '" + request.getName() + "' already exists.");
        });
        DocumentType documentType = new DocumentType();
        documentType.setName(request.getName());
        return documentTypeRepository.save(documentType);
    }

    @Transactional(readOnly = true)
    public List<DocumentType> getAllDocumentTypes() {
        return documentTypeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<DocumentType> getDocumentTypeById(Long id) {
        return documentTypeRepository.findById(id);
    }

    public DocumentType updateDocumentType(Long id, DocumentTypeRequest request) {
        DocumentType documentType = documentTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document type not found with id: " + id));
        documentType.setName(request.getName());
        return documentTypeRepository.save(documentType);
    }

    public void deleteDocumentType(Long id) {
        if (!documentTypeRepository.existsById(id)) {
            throw new EntityNotFoundException("Document type not found with id: " + id);
        }
        documentTypeRepository.deleteById(id);
    }
}