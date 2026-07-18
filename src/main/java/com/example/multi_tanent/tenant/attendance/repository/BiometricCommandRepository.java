package com.example.multi_tanent.tenant.attendance.repository;

import com.example.multi_tanent.tenant.attendance.entity.BiometricCommand;
import com.example.multi_tanent.tenant.attendance.entity.BiometricDevice;
import com.example.multi_tanent.tenant.attendance.enums.BiometricCommandStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BiometricCommandRepository extends JpaRepository<BiometricCommand, Long> {
    List<BiometricCommand> findByDeviceAndStatus(BiometricDevice device, BiometricCommandStatus status);
}
