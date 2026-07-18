package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.TripPaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorPaymentUpdateRequest {
    @NotNull private TripPaymentStatus vendorPaymentStatus;
    private LocalDate vendorPaymentDate;
    private String vendorNotes;
}
