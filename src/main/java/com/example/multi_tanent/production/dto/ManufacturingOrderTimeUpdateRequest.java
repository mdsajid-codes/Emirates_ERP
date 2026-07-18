package com.example.multi_tanent.production.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ManufacturingOrderTimeUpdateRequest {
    private OffsetDateTime actualStartTime;
    private OffsetDateTime actualEndTime;
}
