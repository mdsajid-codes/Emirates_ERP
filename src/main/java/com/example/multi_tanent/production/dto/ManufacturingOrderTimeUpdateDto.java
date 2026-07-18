package com.example.multi_tanent.production.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ManufacturingOrderTimeUpdateDto {
    private OffsetDateTime actualStart;
    private OffsetDateTime actualFinish;
}
