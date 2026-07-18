package com.example.multi_tanent.fleet.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceCreateRequest {
    @NotNull  private Long customerId;
    @NotEmpty private List<Long> tripIds;      // Must all be COMPLETED trips
    @NotNull  private LocalDate invoiceDate;
    private LocalDate dueDate;
    private String notes;
}
