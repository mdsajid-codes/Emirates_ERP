package com.example.multi_tanent.tenant.employee.repository;

import com.example.multi_tanent.tenant.employee.entity.TimeAttendence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TimeAttendenceRepository extends JpaRepository<TimeAttendence, Long> {
    Optional<TimeAttendence> findByEmployeeId(Long employeeId);

    @Query("SELECT ta FROM TimeAttendence ta " +
           "LEFT JOIN FETCH ta.employee e " +
           "LEFT JOIN FETCH ta.timeType LEFT JOIN FETCH ta.workType " +
           "LEFT JOIN FETCH ta.weeklyOffPolicy LEFT JOIN FETCH ta.leaveGroup LEFT JOIN FETCH ta.attendancePolicy " +
           "WHERE e.employeeCode = :employeeCode")
    Optional<TimeAttendence> findByEmployeeEmployeeCodeWithDetails(@Param("employeeCode") String employeeCode);
}
