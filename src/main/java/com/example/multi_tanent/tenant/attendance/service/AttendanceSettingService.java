package com.example.multi_tanent.tenant.attendance.service;

import com.example.multi_tanent.tenant.attendance.dto.AttendanceSettingRequest;
import com.example.multi_tanent.tenant.attendance.entity.AttendanceSetting;
import com.example.multi_tanent.tenant.attendance.repository.AttendanceSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(transactionManager = "tenantTx")
public class AttendanceSettingService {

    private final AttendanceSettingRepository settingRepository;

    public AttendanceSettingService(AttendanceSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    public AttendanceSetting createSetting(AttendanceSettingRequest request) {
        AttendanceSetting setting = new AttendanceSetting();
        setting.setMethod(request.getMethod());
        setting.setDefaultGraceMinutes(request.getDefaultGraceMinutes());
        setting.setAutoMarkAbsentAfter(request.getAutoMarkAbsentAfter());
        setting.setAbsentAfterMinutes(request.getAbsentAfterMinutes());
        return settingRepository.save(setting);
    }

    @Transactional(readOnly = true)
    public List<AttendanceSetting> getAllSettings() {
        return settingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<AttendanceSetting> getSettingById(Long id) {
        return settingRepository.findById(id);
    }

    public AttendanceSetting updateSetting(Long id, AttendanceSettingRequest request) {
        AttendanceSetting setting = settingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance setting not found with id: " + id));

        setting.setMethod(request.getMethod());
        setting.setDefaultGraceMinutes(request.getDefaultGraceMinutes());
        setting.setAutoMarkAbsentAfter(request.getAutoMarkAbsentAfter());
        setting.setAbsentAfterMinutes(request.getAbsentAfterMinutes());

        return settingRepository.save(setting);
    }

    public void deleteSetting(Long id) {
        if (!settingRepository.existsById(id)) {
            throw new RuntimeException("Attendance setting not found with id: " + id);
        }
        settingRepository.deleteById(id);
    }
}