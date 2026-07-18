package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.crm.dto.ContactDto;
import com.example.multi_tanent.crm.dto.ContactRequestDto;
import com.example.multi_tanent.crm.entity.CrmLead;
import com.example.multi_tanent.crm.entity.Contact;
import com.example.multi_tanent.crm.repository.ContactRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional("tenantTx")
public class ContactService {

  private final ContactRepository contactRepository;
  private final TenantRepository tenantRepository;

  public ContactService(ContactRepository contactRepository, TenantRepository tenantRepository) {
    this.contactRepository = contactRepository;
    this.tenantRepository = tenantRepository;
  }

  private Tenant getCurrentTenant() {
    // In a multi-tenant setup, each tenant's DB has one tenant entry.
    return tenantRepository
        .findFirstByOrderByIdAsc()
        .orElseThrow(
            () -> new IllegalStateException("Tenant information not found in the current database."));
  }

  @Transactional(readOnly = true)
  public Page<ContactDto> getAllContacts(Pageable pageable) {
    return contactRepository.findAll(pageable).map(ContactDto::fromEntity);
  }

  public ContactDto getContactById(Long id) {
    Contact contact =
        contactRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + id));
    return ContactDto.fromEntity(contact);
  }

  @Transactional(readOnly = true)
  public List<ContactDto> getContactsByLeadId(Long leadId) {
    return contactRepository.findAllByLeadId(leadId).stream()
            .map(ContactDto::fromEntity)
            .collect(Collectors.toList());
  }

  public ContactDto createContact(ContactRequestDto contactRequest) {
    Contact contact = new Contact();
    contact.setTenant(getCurrentTenant()); // Set the tenant from the context
    contact.setFirstName(contactRequest.getFirstName());
    contact.setLastName(contactRequest.getLastName());
    contact.setEmail(contactRequest.getEmail());
    contact.setPhone(contactRequest.getPhone());
    return ContactDto.fromEntity(contactRepository.save(contact));
  }

  /**
   * Creates or updates a Contact based on information from a CrmLead.
   * It checks if a contact with the same email already exists. If so, it updates it.
   * Otherwise, it creates a new contact.
   *
   * @param lead The CrmLead to source contact information from.
   * @return The created or updated Contact entity.
   */
  public Contact createOrUpdateContactFromLead(CrmLead lead) {
    // First, try to find a contact already linked to this lead.
    // If not found, try to find one by email. Otherwise, create a new one.
    Contact contact = contactRepository.findFirstByLeadId(lead.getId())
            .or(() -> contactRepository.findByEmail(lead.getEmail()))
            .orElse(new Contact());


    contact.setTenant(lead.getTenant());
    contact.setFirstName(lead.getFirstName());
    contact.setLastName(lead.getLastName());
    contact.setEmail(lead.getEmail());
    contact.setPhone(lead.getPhone());
    contact.setLead(lead); // Associate contact with the lead
    return contactRepository.save(contact);
  }
  public ContactDto updateContact(Long id, ContactRequestDto contactDetails) {
    Contact contact =
        contactRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + id));
    contact.setFirstName(contactDetails.getFirstName());
    contact.setLastName(contactDetails.getLastName());
    contact.setEmail(contactDetails.getEmail());
    contact.setPhone(contactDetails.getPhone());
    return ContactDto.fromEntity(contactRepository.save(contact));
  }

  public void deleteContact(Long id) {
    Contact contact = contactRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + id));
    contactRepository.delete(contact);
  }
}
