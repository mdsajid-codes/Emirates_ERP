package com.example.multi_tanent.tenant.attendance.service;

import com.example.multi_tanent.tenant.attendance.dto.BiometricPunchRequest;

public interface BiometricPayloadParser {
    BiometricPunchRequest parse(String rawPayload);
}
