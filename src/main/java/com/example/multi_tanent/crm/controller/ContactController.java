package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.ContactDto;
import com.example.multi_tanent.crm.dto.ContactRequestDto;
import com.example.multi_tanent.crm.services.ContactService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    @PreAuthorize("@crmAccess.canView('CONTACT')")
    public ResponseEntity<Page<ContactDto>> getAllContacts(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(contactService.getAllContacts(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmAccess.canView('CONTACT')")
    public ResponseEntity<ContactDto> getContactById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @GetMapping("/by-lead/{leadId}")
    @PreAuthorize("@crmAccess.canView('CONTACT')")
    public ResponseEntity<List<ContactDto>> getContactsByLeadId(@PathVariable Long leadId) {
        return ResponseEntity.ok(contactService.getContactsByLeadId(leadId));
    }

    @PostMapping
    @PreAuthorize("@crmAccess.canCreate('CONTACT')")
    public ResponseEntity<ContactDto> createContact(@RequestBody ContactRequestDto contactRequest) {
        ContactDto createdContact = contactService.createContact(contactRequest);
        return new ResponseEntity<>(createdContact, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmAccess.canUpdate('CONTACT')")
    public ResponseEntity<ContactDto> updateContact(@PathVariable Long id, @RequestBody ContactRequestDto contactDetails) {
        return ResponseEntity.ok(contactService.updateContact(id, contactDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmAccess.canDelete('CONTACT')")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}