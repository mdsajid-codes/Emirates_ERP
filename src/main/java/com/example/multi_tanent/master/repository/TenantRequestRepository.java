package com.example.multi_tanent.master.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.master.entity.TenantRequest;

public interface TenantRequestRepository extends JpaRepository<TenantRequest, Long> {
    
}
