package com.example.multi_tanent.accounts.dto.payment;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AccPdcClearRequest {
    private LocalDate clearingDate;
    private Long bankAccountId;
}
