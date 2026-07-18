package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.TripPaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripPaymentUpdateRequest {
    @NotNull private TripPaymentStatus paymentStatus;
    private LocalDate paymentDate;
    private String receivedBy;
    private String paymentMethod;
    private String chequeNumber;
    private String otherReference;
    private String notes;
}
