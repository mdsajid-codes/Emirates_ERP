package com.example.multi_tanent.crm.repository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.crm.entity.Contact;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    Optional<Contact> findByEmail(String email); 

    Optional<Contact> findFirstByLeadId(Long leadId);

    List<Contact> findAllByLeadId(Long leadId);

    long countByTenantId(Long tenantId);

}
