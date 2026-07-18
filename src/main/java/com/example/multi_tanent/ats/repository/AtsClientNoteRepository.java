package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsClientNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsClientNoteRepository extends JpaRepository<AtsClientNote, Long> {
    List<AtsClientNote> findByClientIdAndTenantId(Long clientId, Long tenantId);
    Optional<AtsClientNote> findByIdAndTenantId(Long id, Long tenantId);
}
