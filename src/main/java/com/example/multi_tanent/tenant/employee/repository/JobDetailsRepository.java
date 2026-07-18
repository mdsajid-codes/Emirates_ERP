package com.example.multi_tanent.tenant.employee.repository;

import com.example.multi_tanent.tenant.employee.entity.JobDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JobDetailsRepository extends JpaRepository<JobDetails, Long> {
    Optional<JobDetails> findByEmployeeId(Long employeeId);
}