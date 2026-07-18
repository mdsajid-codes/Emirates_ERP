package com.example.multi_tanent.tenant.base.repository;

import com.example.multi_tanent.tenant.base.entity.WorkCalendarException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkCalendarExceptionRepository extends JpaRepository<WorkCalendarException, Long> {
    List<WorkCalendarException> findByHolidayPolicyId(Long holidayPolicyId);
    java.util.Optional<WorkCalendarException> findByHolidayPolicyIdAndExceptionDate(Long holidayPolicyId, java.time.LocalDate date);
}
