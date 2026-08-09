package com.example.multi_tanent.tenant.employee.repository;

import com.example.multi_tanent.tenant.employee.entity.JobDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JobDetailsRepository extends JpaRepository<JobDetails, Long> {
    Optional<JobDetails> findByEmployeeId(Long employeeId);

    @org.springframework.data.jpa.repository.Query("SELECT j FROM JobDetails j JOIN FETCH j.employee e JOIN FETCH e.user u WHERE j.probationEndDate BETWEEN :from AND :to")
    java.util.List<JobDetails> findByProbationEndDateBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDate from, @org.springframework.data.repository.query.Param("to") java.time.LocalDate to);

    @org.springframework.data.jpa.repository.Query("SELECT j FROM JobDetails j JOIN FETCH j.employee e JOIN FETCH e.user u WHERE MONTH(j.dateOfJoining) = :month AND DAY(j.dateOfJoining) = :day")
    java.util.List<JobDetails> findByDateOfJoiningMonthAndDay(@org.springframework.data.repository.query.Param("month") int month, @org.springframework.data.repository.query.Param("day") int day);
}