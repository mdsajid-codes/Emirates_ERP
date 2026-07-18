package com.example.multi_tanent.tenant.leave.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.tenant.base.entity.Holiday;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {

}