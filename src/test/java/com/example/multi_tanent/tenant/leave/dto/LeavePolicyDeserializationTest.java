package com.example.multi_tanent.tenant.leave.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.multi_tanent.tenant.leave.enums.MidYearJoinProratePolicy;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

public class LeavePolicyDeserializationTest {

    @Test
    public void testEmptyStringEnumDeserialization() {
        String json = "{ \"midYearJoinProratePolicy\": \"\" }";
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.coercionConfigFor(com.fasterxml.jackson.databind.type.LogicalType.Enum)
                .setCoercion(com.fasterxml.jackson.databind.cfg.CoercionInputShape.EmptyString,
                        com.fasterxml.jackson.databind.cfg.CoercionAction.AsNull);

        // This is expected to succeed after the fix
        assertDoesNotThrow(() -> {
            LeaveTypePolicyRequest request = objectMapper.readValue(json, LeaveTypePolicyRequest.class);
            assertNull(request.getMidYearJoinProratePolicy());
        });
    }
}
