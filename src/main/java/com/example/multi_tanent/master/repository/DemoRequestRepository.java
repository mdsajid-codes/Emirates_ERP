package com.example.multi_tanent.master.repository;

import com.example.multi_tanent.master.entity.DemoRequest;
import com.example.multi_tanent.master.entity.DemoRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemoRequestRepository extends JpaRepository<DemoRequest, Long> {

    /** All requests, newest first — used by the admin list view */
    List<DemoRequest> findAllByOrderByCreatedAtDesc();

    /** Filtered by status, newest first */
    List<DemoRequest> findByStatusOrderByCreatedAtDesc(DemoRequestStatus status);

    /** Filtered by module (e.g. "POS", "HRMS") */
    List<DemoRequest> findByModuleIgnoreCaseOrderByCreatedAtDesc(String module);
}
