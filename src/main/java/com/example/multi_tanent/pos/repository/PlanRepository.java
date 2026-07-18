package com.example.multi_tanent.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.pos.entity.Plan;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    
}
