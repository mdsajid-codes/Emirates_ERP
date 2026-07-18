package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.AttendanceSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceSettingRepository extends JpaRepository<AttendanceSetting, Long> {
}