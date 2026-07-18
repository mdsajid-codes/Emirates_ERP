package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsInterviewer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AtsInterviewerRepository extends JpaRepository<AtsInterviewer, Long> {
    
    Page<AtsInterviewer> findByTenantId(Long tenantId, Pageable pageable);
    
    Optional<AtsInterviewer> findByIdAndTenantId(Long id, Long tenantId);
    
    boolean existsByEmailAndTenantId(String email, Long tenantId);

    @Query("SELECT i FROM AtsInterviewer i WHERE i.tenant.id = :tenantId AND " +
           "(LOWER(i.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.technology) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<AtsInterviewer> searchInterviewers(@Param("tenantId") Long tenantId, 
                                            @Param("search") String search, 
                                            Pageable pageable);
}
