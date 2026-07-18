package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.BiometricDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BiometricDeviceRepository extends JpaRepository<BiometricDevice, Long> {
    Optional<BiometricDevice> findByDeviceIdentifier(String deviceIdentifier);
}