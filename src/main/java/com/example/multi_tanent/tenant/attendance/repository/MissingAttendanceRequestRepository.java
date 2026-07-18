package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.MissingAttendanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MissingAttendanceRequestRepository extends JpaRepository<MissingAttendanceRequest, Long> {
    @Query("SELECT r FROM MissingAttendanceRequest r JOIN FETCH r.employee LEFT JOIN FETCH r.approver")
    List<MissingAttendanceRequest> findAllWithEmployee();

    @Query("SELECT r FROM MissingAttendanceRequest r JOIN FETCH r.employee LEFT JOIN FETCH r.approver WHERE r.id = :id")
    Optional<MissingAttendanceRequest> findByIdWithDetails(Long id);
}