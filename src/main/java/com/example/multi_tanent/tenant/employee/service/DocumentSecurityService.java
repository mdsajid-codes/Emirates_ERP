package com.example.multi_tanent.tenant.employee.service;

import com.example.multi_tanent.tenant.employee.repository.EmployeeDocumentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("documentSecurityService")
public class DocumentSecurityService {

    private final EmployeeDocumentRepository documentRepository;

    public DocumentSecurityService(EmployeeDocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    /**
     * Checks if the authenticated user is the owner of the document.
     * This method is used in @PreAuthorize annotations.
     * @param documentId The ID of the document to check.
     * @param authentication The current user's authentication object.
     * @return true if the user is the owner, false otherwise.
     */
    public boolean isOwner(Long documentId, Authentication authentication) {
        String username = authentication.getName();
        return documentRepository.findById(documentId)
                .map(doc -> doc.getEmployee().getUser().getEmail().equals(username))
                .orElse(false); // If doc not found, deny access.
    }
}