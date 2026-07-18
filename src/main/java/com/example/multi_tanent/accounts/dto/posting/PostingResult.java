package com.example.multi_tanent.accounts.dto.posting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostingResult {
    private boolean success;
    private Long journalEntryId;
    private String entryNumber;
    private String message;
}
