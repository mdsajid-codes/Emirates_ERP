package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.RawBiometricPunch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RawBiometricPunchRepository extends JpaRepository<RawBiometricPunch, Long> {
}
