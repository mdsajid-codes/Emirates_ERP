package com.example.multi_tanent.tenant.attendance.service.parser;

import com.example.multi_tanent.tenant.attendance.dto.BiometricPunchRequest;
import com.example.multi_tanent.tenant.attendance.service.BiometricPayloadParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component("ZKTECO_PARSER")
public class ZKTecoPayloadParser implements BiometricPayloadParser {

    private final ObjectMapper objectMapper;

    public ZKTecoPayloadParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public BiometricPunchRequest parse(String rawPayload) {
        try {
            // Assuming ZKTeco sends something like: {"device_sn": "...", "user_id": "...", "timestamp": "..."}
            // We map it to our internal BiometricPunchRequest
            return objectMapper.readValue(rawPayload, BiometricPunchRequest.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse ZKTeco payload: " + e.getMessage());
        }
    }
}
