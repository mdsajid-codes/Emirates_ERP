package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.TripStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripStatusUpdateRequest {
    @NotNull private TripStatus newStatus;
}
