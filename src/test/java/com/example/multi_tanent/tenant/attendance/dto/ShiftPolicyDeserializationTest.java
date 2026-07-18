package com.example.multi_tanent.tenant.attendance.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.multi_tanent.config.JacksonConfig;
import org.junit.jupiter.api.Test;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

public class ShiftPolicyDeserializationTest {

    @Test
    public void testLocalTimeDeserialization() {
        String json = "{ \"shiftStartTime\": \"09:00:00\" }";

        // Simulating the ObjectMapper created in JacksonConfig
        ObjectMapper objectMapper = new JacksonConfig().objectMapper();

        // This is expected to fail without JavaTimeModule
        assertDoesNotThrow(() -> {
            ShiftPolicyRequest request = objectMapper.readValue(json, ShiftPolicyRequest.class);
            assertNotNull(request.getShiftStartTime());
            assertEquals(LocalTime.of(9, 0), request.getShiftStartTime());
        });
    }
}
